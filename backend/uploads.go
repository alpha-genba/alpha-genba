package main

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

// Photos and videos uploaded from the admin panel are saved in cfg.UploadDir
// under a random name and served back at /api/uploads/<name>.

const (
	maxImageBytes = 10 << 20  // 10 MB
	maxVideoBytes = 300 << 20 // 300 MB, enough for a few minutes of phone video
	uploadURLBase = "/api/uploads/"
)

// allowedUploads maps a detected content type to its file extension and kind.
// The type is detected from the file's first bytes, not from its name, so a
// renamed .exe can't sneak in as a .jpg.
var allowedUploads = map[string]struct{ ext, kind string }{
	"image/jpeg": {".jpg", "image"},
	"image/png":  {".png", "image"},
	"image/webp": {".webp", "image"},
	"image/gif":  {".gif", "image"},
	"video/mp4":  {".mp4", "video"},
	"video/webm": {".webm", "video"},
}

var uploadNamePattern = regexp.MustCompile(`^[a-f0-9]{32}\.(jpg|png|webp|gif|mp4|webm)$`)

func (app *App) handleUpload(w http.ResponseWriter, r *http.Request) {
	// Big videos take longer than the server's normal 15-second limits.
	rc := http.NewResponseController(w)
	_ = rc.SetReadDeadline(time.Now().Add(10 * time.Minute))
	_ = rc.SetWriteDeadline(time.Now().Add(10 * time.Minute))

	r.Body = http.MaxBytesReader(w, r.Body, maxVideoBytes+1<<20)
	file, _, err := r.FormFile("file")
	if err != nil {
		var maxErr *http.MaxBytesError
		if errors.As(err, &maxErr) {
			writeError(w, http.StatusRequestEntityTooLarge, "File is too large. Videos can be up to 300 MB, photos up to 10 MB.")
			return
		}
		writeError(w, http.StatusBadRequest, "Please choose a file to upload.")
		return
	}
	defer file.Close()

	head := make([]byte, 512)
	n, _ := io.ReadFull(file, head)
	contentType := http.DetectContentType(head[:n])
	allowed, ok := allowedUploads[contentType]
	if !ok {
		writeError(w, http.StatusUnsupportedMediaType, "Only JPG, PNG, WebP or GIF photos and MP4 or WebM videos can be uploaded.")
		return
	}
	limit := int64(maxImageBytes)
	if allowed.kind == "video" {
		limit = maxVideoBytes
	}

	if err := os.MkdirAll(app.cfg.UploadDir, 0o755); err != nil {
		app.serverError(w, "create upload dir", err)
		return
	}
	name := randomHex(16) + allowed.ext
	path := filepath.Join(app.cfg.UploadDir, name)
	out, err := os.OpenFile(path, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0o644)
	if err != nil {
		app.serverError(w, "create upload file", err)
		return
	}

	// Write the bytes we already read, then the rest, stopping one byte past the limit.
	written, err := io.Copy(out, io.LimitReader(io.MultiReader(bytes.NewReader(head[:n]), file), limit+1))
	closeErr := out.Close()
	if err == nil {
		err = closeErr
	}
	if err != nil || written > limit {
		os.Remove(path)
		if written > limit {
			writeError(w, http.StatusRequestEntityTooLarge, fmt.Sprintf("This %s is too large (max %d MB).", allowed.kind, limit>>20))
			return
		}
		app.serverError(w, "save upload", err)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]string{"url": uploadURLBase + name, "kind": allowed.kind})
}

func (app *App) handleServeUpload(w http.ResponseWriter, r *http.Request) {
	name := r.PathValue("name")
	if !uploadNamePattern.MatchString(name) { // also blocks "../" tricks
		http.NotFound(w, r)
		return
	}
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("Cache-Control", "public, max-age=31536000, immutable") // names are random, so files never change
	// ServeFile supports Range requests, so videos can be skipped forward and back.
	http.ServeFile(w, r, filepath.Join(app.cfg.UploadDir, name))
}

// removeUploads deletes stored files for any of these URLs that point to our upload folder.
func (app *App) removeUploads(urls ...string) {
	for _, u := range urls {
		name, ok := strings.CutPrefix(u, uploadURLBase)
		if !ok || !uploadNamePattern.MatchString(name) {
			continue
		}
		if err := os.Remove(filepath.Join(app.cfg.UploadDir, name)); err != nil && !errors.Is(err, os.ErrNotExist) {
			log.Printf("remove upload %s: %v", name, err)
		}
	}
}

// validMediaURL accepts our own uploads, site paths like /images/x.jpg, or full http(s) links.
func validMediaURL(u string) bool {
	if strings.HasPrefix(u, uploadURLBase) {
		return uploadNamePattern.MatchString(strings.TrimPrefix(u, uploadURLBase))
	}
	if strings.HasPrefix(u, "/") && !strings.HasPrefix(u, "//") {
		return true
	}
	return strings.HasPrefix(u, "https://") || strings.HasPrefix(u, "http://")
}
