package main

import (
	"encoding/json"
	"errors"
	"log"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"
)

const maxBodyBytes = 64 << 10 // 64 KB is plenty for any form on the site

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("write json: %v", err)
	}
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}

// validationError is returned when the user sent something we can't accept.
// Field names map to messages the website shows next to each input.
type validationError map[string]string

func (v validationError) Error() string { return "validation failed" }

func writeValidation(w http.ResponseWriter, v validationError) {
	writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"error": "Please fix the highlighted fields.", "fields": v})
}

// readJSON decodes a request body into dst, rejecting unknown fields and oversized bodies.
func readJSON(w http.ResponseWriter, r *http.Request, dst any) error {
	// Requiring a JSON content type also blocks cross-site HTML form posts (a CSRF defence).
	if ct, _, _ := strings.Cut(r.Header.Get("Content-Type"), ";"); strings.TrimSpace(ct) != "application/json" {
		return errors.New("request must be sent as application/json")
	}
	r.Body = http.MaxBytesReader(w, r.Body, maxBodyBytes)
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(dst); err != nil {
		var maxErr *http.MaxBytesError
		if errors.As(err, &maxErr) {
			return errors.New("request body is too large")
		}
		return errors.New("request body must be valid JSON")
	}
	return nil
}

// clientIP returns the visitor's IP address. Behind the website proxy, the
// original address arrives in X-Forwarded-For.
func clientIP(r *http.Request) string {
	if fwd := r.Header.Get("X-Forwarded-For"); fwd != "" {
		first, _, _ := strings.Cut(fwd, ",")
		return strings.TrimSpace(first)
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

// rateLimiter allows each key (usually an IP address) a fixed number of
// requests per time window. It protects the contact form and admin login from abuse.
type rateLimiter struct {
	mu     sync.Mutex
	limit  int
	window time.Duration
	hits   map[string][]time.Time
}

func newRateLimiter(limit int, window time.Duration) *rateLimiter {
	return &rateLimiter{limit: limit, window: window, hits: make(map[string][]time.Time)}
}

func (rl *rateLimiter) allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	cutoff := now.Add(-rl.window)
	recent := rl.hits[key][:0]
	for _, t := range rl.hits[key] {
		if t.After(cutoff) {
			recent = append(recent, t)
		}
	}
	if len(recent) >= rl.limit {
		rl.hits[key] = recent
		return false
	}
	rl.hits[key] = append(recent, now)
	return true
}

// logRequests prints one line per request: method, path, status and duration.
func logRequests(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rec := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(rec, r)
		log.Printf("%s %s %d %s", r.Method, r.URL.Path, rec.status, time.Since(start).Round(time.Millisecond))
	})
}

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (s *statusRecorder) WriteHeader(code int) {
	s.status = code
	s.ResponseWriter.WriteHeader(code)
}
