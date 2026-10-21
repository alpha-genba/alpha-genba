// Command backend is the Alpha Genba API server. It serves the company website
// (projects, quote requests, ongoing project updates) and the admin panel.
//
// Run it from the repository root:
//
//	go run ./backend
package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// App holds everything the HTTP handlers share.
type App struct {
	cfg            Config
	db             *pgxpool.Pool
	enquiries      enquiryStore
	projects       projectStore
	ongoing        ongoingStore
	enquiryLimiter *rateLimiter
	loginLimiter   *rateLimiter
}

func main() {
	cfg := loadConfig()

	// Stop cleanly on Ctrl+C so the development database shuts down too.
	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancel()

	db, closeDB, err := openDatabase(ctx, cfg)
	if err != nil {
		log.Fatal(err)
	}
	defer closeDB()

	app := &App{
		cfg:            cfg,
		db:             db,
		enquiries:      enquiryStore{db},
		projects:       projectStore{db},
		ongoing:        ongoingStore{db},
		enquiryLimiter: newRateLimiter(5, 10*time.Minute),
		loginLimiter:   newRateLimiter(10, 15*time.Minute),
	}

	server := &http.Server{
		Addr:              cfg.Addr,
		Handler:           logRequests(app.routes()),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	go func() {
		log.Printf("Alpha Genba API listening on http://localhost%s", cfg.Addr)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Printf("server error: %v", err)
			cancel()
		}
	}()

	<-ctx.Done()
	log.Println("Shutting down...")
	shutdownCtx, cancelShutdown := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancelShutdown()
	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Printf("shutdown: %v", err)
	}
}

func (app *App) routes() http.Handler {
	mux := http.NewServeMux()

	// Public website
	mux.HandleFunc("GET /api/health", app.handleHealth)
	mux.HandleFunc("GET /api/projects", app.handleListPublishedProjects)
	mux.HandleFunc("GET /api/projects/{slug}", app.handleGetProject)
	mux.HandleFunc("POST /api/enquiries", app.handleCreateEnquiry)
	mux.HandleFunc("GET /api/ongoing", app.handleListPublicOngoing)
	mux.HandleFunc("GET /api/ongoing/{slug}", app.handleGetPublicOngoing)
	mux.HandleFunc("GET /api/track/{token}", app.handleTrack)
	mux.HandleFunc("GET /api/uploads/{name}", app.handleServeUpload)

	// Admin panel
	mux.HandleFunc("POST /api/admin/login", app.handleLogin)
	mux.HandleFunc("POST /api/admin/logout", app.handleLogout)
	mux.HandleFunc("GET /api/admin/me", app.handleMe)
	mux.HandleFunc("GET /api/admin/enquiries", app.requireAdmin(app.handleListEnquiries))
	mux.HandleFunc("PATCH /api/admin/enquiries/{id}", app.requireAdmin(app.handleUpdateEnquiry))
	mux.HandleFunc("GET /api/admin/projects", app.requireAdmin(app.handleListAllProjects))
	mux.HandleFunc("POST /api/admin/projects", app.requireAdmin(app.handleCreateProject))
	mux.HandleFunc("PUT /api/admin/projects/{id}", app.requireAdmin(app.handleUpdateProject))
	mux.HandleFunc("DELETE /api/admin/projects/{id}", app.requireAdmin(app.handleDeleteProject))
	mux.HandleFunc("GET /api/admin/ongoing", app.requireAdmin(app.handleAdminListOngoing))
	mux.HandleFunc("GET /api/admin/ongoing/{id}", app.requireAdmin(app.handleAdminGetOngoing))
	mux.HandleFunc("POST /api/admin/ongoing", app.requireAdmin(app.handleCreateOngoing))
	mux.HandleFunc("PUT /api/admin/ongoing/{id}", app.requireAdmin(app.handleUpdateOngoing))
	mux.HandleFunc("DELETE /api/admin/ongoing/{id}", app.requireAdmin(app.handleDeleteOngoing))
	mux.HandleFunc("POST /api/admin/ongoing/{id}/updates", app.requireAdmin(app.handleAddUpdate))
	mux.HandleFunc("DELETE /api/admin/updates/{id}", app.requireAdmin(app.handleDeleteUpdate))
	mux.HandleFunc("POST /api/admin/uploads", app.requireAdmin(app.handleUpload))

	return mux
}

func (app *App) handleHealth(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	if err := app.db.Ping(ctx); err != nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"status": "database unavailable"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// serverError logs the real problem but shows the visitor a generic message.
func (app *App) serverError(w http.ResponseWriter, what string, err error) {
	log.Printf("%s: %v", what, err)
	writeError(w, http.StatusInternalServerError, "Something went wrong on our side. Please try again.")
}
