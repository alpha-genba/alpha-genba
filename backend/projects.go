package main

import (
	"context"
	"errors"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Project is one machine or installation Alpha Automations has delivered.
type Project struct {
	ID           int64     `json:"id"`
	Slug         string    `json:"slug"`
	Title        string    `json:"title"`
	Industry     string    `json:"industry"`
	Summary      string    `json:"summary"`
	Problem      string    `json:"problem"`
	Solution     string    `json:"solution"`
	Result       string    `json:"result"`
	Technologies []string  `json:"technologies"`
	ImageURL     string    `json:"imageUrl"`
	Gallery      []string  `json:"gallery"`
	CompletedOn  string    `json:"completedOn"` // "YYYY-MM-DD" or ""
	Published    bool      `json:"published"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

// projectInput is what the admin panel sends when creating or editing a project.
type projectInput struct {
	Slug         string   `json:"slug"`
	Title        string   `json:"title"`
	Industry     string   `json:"industry"`
	Summary      string   `json:"summary"`
	Problem      string   `json:"problem"`
	Solution     string   `json:"solution"`
	Result       string   `json:"result"`
	Technologies []string `json:"technologies"`
	ImageURL     string   `json:"imageUrl"`
	Gallery      []string `json:"gallery"`
	CompletedOn  string   `json:"completedOn"`
	Published    bool     `json:"published"`
}

var slugPattern = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

// slugify turns "Auto Screwing Station #2" into "auto-screwing-station-2".
func slugify(s string) string {
	var b strings.Builder
	dash := false
	for _, r := range strings.ToLower(s) {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			b.WriteRune(r)
			dash = false
		} else if !dash && b.Len() > 0 {
			b.WriteByte('-')
			dash = true
		}
	}
	return strings.TrimSuffix(b.String(), "-")
}

func (in projectInput) validate() (projectInput, validationError) {
	in.Title = strings.TrimSpace(in.Title)
	in.Slug = strings.TrimSpace(in.Slug)
	if in.Slug == "" {
		in.Slug = slugify(in.Title)
	}
	in.Industry = strings.TrimSpace(in.Industry)
	in.Summary = strings.TrimSpace(in.Summary)
	in.Problem = strings.TrimSpace(in.Problem)
	in.Solution = strings.TrimSpace(in.Solution)
	in.Result = strings.TrimSpace(in.Result)
	in.ImageURL = strings.TrimSpace(in.ImageURL)
	in.CompletedOn = strings.TrimSpace(in.CompletedOn)

	techs := make([]string, 0, len(in.Technologies))
	for _, t := range in.Technologies {
		if t = strings.TrimSpace(t); t != "" {
			techs = append(techs, t)
		}
	}
	in.Technologies = techs

	errs := validationError{}
	if in.Title == "" {
		errs["title"] = "Title is required."
	} else if len(in.Title) > 150 {
		errs["title"] = "Title is too long."
	}
	if !slugPattern.MatchString(in.Slug) || len(in.Slug) > 120 {
		errs["slug"] = "Use lowercase letters, numbers and dashes only."
	}
	if len(in.Summary) > 300 {
		errs["summary"] = "Keep the summary under 300 characters."
	}
	for field, v := range map[string]string{"problem": in.Problem, "solution": in.Solution, "result": in.Result} {
		if len(v) > 5000 {
			errs[field] = "This is too long (5000 characters max)."
		}
	}
	if len(in.Technologies) > 20 {
		errs["technologies"] = "List at most 20 technologies."
	}
	if in.ImageURL != "" && !validMediaURL(in.ImageURL) {
		errs["imageUrl"] = "Upload a photo, or use a full image link (https://...)."
	}
	gallery := make([]string, 0, len(in.Gallery))
	for _, g := range in.Gallery {
		if g = strings.TrimSpace(g); g != "" {
			gallery = append(gallery, g)
		}
	}
	in.Gallery = gallery
	if len(in.Gallery) > 30 {
		errs["gallery"] = "Add at most 30 photos."
	}
	for _, g := range in.Gallery {
		if !validMediaURL(g) {
			errs["gallery"] = "One of the gallery photos is not valid."
			break
		}
	}
	if in.CompletedOn != "" {
		if _, err := time.Parse(time.DateOnly, in.CompletedOn); err != nil {
			errs["completedOn"] = "Use the format YYYY-MM-DD."
		}
	}
	if len(errs) > 0 {
		return in, errs
	}
	return in, nil
}

type projectStore struct{ db *pgxpool.Pool }

const projectColumns = `id, slug, title, industry, summary, problem, solution, result,
	technologies, image_url, gallery, completed_on, published, created_at, updated_at`

func scanProject(row pgx.CollectableRow) (Project, error) {
	var p Project
	var completed pgtype.Date
	err := row.Scan(&p.ID, &p.Slug, &p.Title, &p.Industry, &p.Summary, &p.Problem, &p.Solution,
		&p.Result, &p.Technologies, &p.ImageURL, &p.Gallery, &completed, &p.Published, &p.CreatedAt, &p.UpdatedAt)
	if completed.Valid {
		p.CompletedOn = completed.Time.Format(time.DateOnly)
	}
	return p, err
}

func (s projectStore) list(ctx context.Context, onlyPublished bool) ([]Project, error) {
	query := `SELECT ` + projectColumns + ` FROM projects`
	if onlyPublished {
		query += ` WHERE published`
	}
	query += ` ORDER BY completed_on DESC NULLS LAST, created_at DESC`
	rows, err := s.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	return pgx.CollectRows(rows, scanProject)
}

func (s projectStore) bySlug(ctx context.Context, slug string) (Project, error) {
	rows, err := s.db.Query(ctx, `SELECT `+projectColumns+` FROM projects WHERE slug = $1 AND published`, slug)
	if err != nil {
		return Project{}, err
	}
	p, err := pgx.CollectExactlyOneRow(rows, scanProject)
	if errors.Is(err, pgx.ErrNoRows) {
		return Project{}, errNotFound
	}
	return p, err
}

// nullableDate turns "" into SQL NULL.
func nullableDate(s string) any {
	if s == "" {
		return nil
	}
	return s
}

func (s projectStore) create(ctx context.Context, in projectInput) (Project, error) {
	rows, err := s.db.Query(ctx, `
		INSERT INTO projects (slug, title, industry, summary, problem, solution, result,
		                      technologies, image_url, gallery, completed_on, published)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING `+projectColumns,
		in.Slug, in.Title, in.Industry, in.Summary, in.Problem, in.Solution, in.Result,
		in.Technologies, in.ImageURL, in.Gallery, nullableDate(in.CompletedOn), in.Published)
	if err != nil {
		return Project{}, err
	}
	return pgx.CollectExactlyOneRow(rows, scanProject)
}

func (s projectStore) update(ctx context.Context, id int64, in projectInput) (Project, error) {
	rows, err := s.db.Query(ctx, `
		UPDATE projects SET slug = $1, title = $2, industry = $3, summary = $4, problem = $5,
		       solution = $6, result = $7, technologies = $8, image_url = $9, gallery = $10,
		       completed_on = $11, published = $12, updated_at = now()
		WHERE id = $13
		RETURNING `+projectColumns,
		in.Slug, in.Title, in.Industry, in.Summary, in.Problem, in.Solution, in.Result,
		in.Technologies, in.ImageURL, in.Gallery, nullableDate(in.CompletedOn), in.Published, id)
	if err != nil {
		return Project{}, err
	}
	p, err := pgx.CollectExactlyOneRow(rows, scanProject)
	if errors.Is(err, pgx.ErrNoRows) {
		return Project{}, errNotFound
	}
	return p, err
}

// photos returns every image URL a project currently uses.
func (s projectStore) photos(ctx context.Context, id int64) ([]string, error) {
	var image string
	var gallery []string
	err := s.db.QueryRow(ctx, `SELECT image_url, gallery FROM projects WHERE id = $1`, id).Scan(&image, &gallery)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errNotFound
	}
	return append([]string{image}, gallery...), err
}

// delete removes the project and returns the photo URLs it used, so the files can be deleted too.
func (s projectStore) delete(ctx context.Context, id int64) ([]string, error) {
	var image string
	var gallery []string
	err := s.db.QueryRow(ctx, `DELETE FROM projects WHERE id = $1 RETURNING image_url, gallery`, id).Scan(&image, &gallery)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errNotFound
	}
	return append([]string{image}, gallery...), err
}

// unused returns the URLs in before that are no longer in after.
func unused(before, after []string) []string {
	keep := make(map[string]bool, len(after))
	for _, u := range after {
		keep[u] = true
	}
	var gone []string
	for _, u := range before {
		if !keep[u] {
			gone = append(gone, u)
		}
	}
	return gone
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}

// --- HTTP handlers ---

func (app *App) handleListPublishedProjects(w http.ResponseWriter, r *http.Request) {
	list, err := app.projects.list(r.Context(), true)
	if err != nil {
		app.serverError(w, "list projects", err)
		return
	}
	writeJSON(w, http.StatusOK, list)
}

func (app *App) handleGetProject(w http.ResponseWriter, r *http.Request) {
	p, err := app.projects.bySlug(r.Context(), r.PathValue("slug"))
	switch {
	case errors.Is(err, errNotFound):
		writeError(w, http.StatusNotFound, "project not found")
	case err != nil:
		app.serverError(w, "get project", err)
	default:
		writeJSON(w, http.StatusOK, p)
	}
}

func (app *App) handleListAllProjects(w http.ResponseWriter, r *http.Request) {
	list, err := app.projects.list(r.Context(), false)
	if err != nil {
		app.serverError(w, "list projects", err)
		return
	}
	writeJSON(w, http.StatusOK, list)
}

func (app *App) handleCreateProject(w http.ResponseWriter, r *http.Request) {
	in, ok := app.readProjectInput(w, r)
	if !ok {
		return
	}
	p, err := app.projects.create(r.Context(), in)
	switch {
	case isUniqueViolation(err):
		writeValidation(w, validationError{"slug": "Another project already uses this URL slug."})
	case err != nil:
		app.serverError(w, "create project", err)
	default:
		writeJSON(w, http.StatusCreated, p)
	}
}

func (app *App) handleUpdateProject(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid project id")
		return
	}
	in, ok := app.readProjectInput(w, r)
	if !ok {
		return
	}
	before, err := app.projects.photos(r.Context(), id)
	if err != nil && !errors.Is(err, errNotFound) {
		app.serverError(w, "update project", err)
		return
	}
	p, err := app.projects.update(r.Context(), id, in)
	switch {
	case errors.Is(err, errNotFound):
		writeError(w, http.StatusNotFound, "project not found")
	case isUniqueViolation(err):
		writeValidation(w, validationError{"slug": "Another project already uses this URL slug."})
	case err != nil:
		app.serverError(w, "update project", err)
	default:
		app.removeUploads(unused(before, append([]string{p.ImageURL}, p.Gallery...))...)
		writeJSON(w, http.StatusOK, p)
	}
}

func (app *App) handleDeleteProject(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid project id")
		return
	}
	urls, err := app.projects.delete(r.Context(), id)
	switch {
	case errors.Is(err, errNotFound):
		writeError(w, http.StatusNotFound, "project not found")
	case err != nil:
		app.serverError(w, "delete project", err)
	default:
		app.removeUploads(urls...)
		writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
	}
}

func (app *App) readProjectInput(w http.ResponseWriter, r *http.Request) (projectInput, bool) {
	var in projectInput
	if err := readJSON(w, r, &in); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return in, false
	}
	clean, verr := in.validate()
	if verr != nil {
		writeValidation(w, verr)
		return in, false
	}
	return clean, true
}
