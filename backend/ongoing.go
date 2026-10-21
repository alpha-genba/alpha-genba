package main

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

// OngoingProject is a machine currently being designed, built or installed.
type OngoingProject struct {
	ID                 int64     `json:"id"`
	Slug               string    `json:"slug"`
	Title              string    `json:"title"`
	Client             string    `json:"client"`
	Industry           string    `json:"industry"`
	Summary            string    `json:"summary"`
	Stage              string    `json:"stage"`
	Progress           int       `json:"progress"`
	ExpectedCompletion string    `json:"expectedCompletion"` // "YYYY-MM-DD" or ""
	CoverURL           string    `json:"coverUrl"`
	Visibility         string    `json:"visibility"`
	ShareToken         string    `json:"shareToken,omitempty"` // only sent to the admin
	CreatedAt          time.Time `json:"createdAt"`
	UpdatedAt          time.Time `json:"updatedAt"`
	Updates            []Update  `json:"updates,omitempty"`
}

// Update is one progress report, with optional photos and videos.
type Update struct {
	ID        int64     `json:"id"`
	ProjectID int64     `json:"projectId"`
	Title     string    `json:"title"`
	Message   string    `json:"message"`
	Progress  int       `json:"progress"`
	Stage     string    `json:"stage"`
	Media     []Media   `json:"media"`
	CreatedAt time.Time `json:"createdAt"`
}

type Media struct {
	Kind string `json:"kind"` // "image" or "video"
	URL  string `json:"url"`
}

// Stages in the order a machine moves through them.
var stages = []string{"design", "manufacturing", "assembly", "testing", "installation", "completed"}

func validStage(s string) bool {
	for _, st := range stages {
		if s == st {
			return true
		}
	}
	return false
}

type ongoingInput struct {
	Slug               string `json:"slug"`
	Title              string `json:"title"`
	Client             string `json:"client"`
	Industry           string `json:"industry"`
	Summary            string `json:"summary"`
	Stage              string `json:"stage"`
	Progress           int    `json:"progress"`
	ExpectedCompletion string `json:"expectedCompletion"`
	CoverURL           string `json:"coverUrl"`
	Visibility         string `json:"visibility"`
}

func (in ongoingInput) validate() (ongoingInput, validationError) {
	in.Title = strings.TrimSpace(in.Title)
	in.Slug = strings.TrimSpace(in.Slug)
	if in.Slug == "" {
		in.Slug = slugify(in.Title)
	}
	in.Client = strings.TrimSpace(in.Client)
	in.Industry = strings.TrimSpace(in.Industry)
	in.Summary = strings.TrimSpace(in.Summary)
	in.CoverURL = strings.TrimSpace(in.CoverURL)
	in.ExpectedCompletion = strings.TrimSpace(in.ExpectedCompletion)
	if in.Stage == "" {
		in.Stage = "design"
	}
	if in.Visibility == "" {
		in.Visibility = "private"
	}

	errs := validationError{}
	if in.Title == "" {
		errs["title"] = "Title is required."
	} else if len(in.Title) > 150 {
		errs["title"] = "Title is too long."
	}
	if !slugPattern.MatchString(in.Slug) || len(in.Slug) > 120 {
		errs["slug"] = "Use lowercase letters, numbers and dashes only."
	}
	if len(in.Client) > 150 {
		errs["client"] = "Client name is too long."
	}
	if len(in.Summary) > 1000 {
		errs["summary"] = "Keep the summary under 1000 characters."
	}
	if !validStage(in.Stage) {
		errs["stage"] = "Choose a stage from the list."
	}
	if in.Progress < 0 || in.Progress > 100 {
		errs["progress"] = "Progress must be between 0 and 100."
	}
	if in.Visibility != "public" && in.Visibility != "private" {
		errs["visibility"] = "Choose public or private."
	}
	if in.CoverURL != "" && !validMediaURL(in.CoverURL) {
		errs["coverUrl"] = "Upload a photo or use a full https:// link."
	}
	if in.ExpectedCompletion != "" {
		if _, err := time.Parse(time.DateOnly, in.ExpectedCompletion); err != nil {
			errs["expectedCompletion"] = "Use the format YYYY-MM-DD."
		}
	}
	if len(errs) > 0 {
		return in, errs
	}
	return in, nil
}

type updateInput struct {
	Title    string  `json:"title"`
	Message  string  `json:"message"`
	Progress int     `json:"progress"`
	Stage    string  `json:"stage"`
	Media    []Media `json:"media"`
}

func (in updateInput) validate() (updateInput, validationError) {
	in.Title = strings.TrimSpace(in.Title)
	in.Message = strings.TrimSpace(in.Message)
	media := make([]Media, 0, len(in.Media))
	for _, m := range in.Media {
		m.URL = strings.TrimSpace(m.URL)
		if m.URL != "" {
			media = append(media, m)
		}
	}
	in.Media = media

	errs := validationError{}
	if in.Title == "" {
		errs["title"] = "Give the update a short title."
	} else if len(in.Title) > 150 {
		errs["title"] = "Title is too long."
	}
	if len(in.Message) > 5000 {
		errs["message"] = "Message is too long (5000 characters max)."
	}
	if in.Progress < 0 || in.Progress > 100 {
		errs["progress"] = "Progress must be between 0 and 100."
	}
	if !validStage(in.Stage) {
		errs["stage"] = "Choose a stage from the list."
	}
	if len(in.Media) > 20 {
		errs["media"] = "Add at most 20 photos or videos per update."
	}
	for _, m := range in.Media {
		if (m.Kind != "image" && m.Kind != "video") || !validMediaURL(m.URL) {
			errs["media"] = "One of the photos or videos is not valid."
			break
		}
	}
	if len(errs) > 0 {
		return in, errs
	}
	return in, nil
}

// --- Database access ---

type ongoingStore struct{ db *pgxpool.Pool }

const ongoingColumns = `id, slug, title, client, industry, summary, stage, progress,
	expected_completion, cover_url, visibility, share_token, created_at, updated_at`

func scanOngoing(row pgx.CollectableRow) (OngoingProject, error) {
	var p OngoingProject
	var expected pgtype.Date
	err := row.Scan(&p.ID, &p.Slug, &p.Title, &p.Client, &p.Industry, &p.Summary, &p.Stage, &p.Progress,
		&expected, &p.CoverURL, &p.Visibility, &p.ShareToken, &p.CreatedAt, &p.UpdatedAt)
	if expected.Valid {
		p.ExpectedCompletion = expected.Time.Format(time.DateOnly)
	}
	return p, err
}

func scanUpdate(row pgx.CollectableRow) (Update, error) {
	var u Update
	err := row.Scan(&u.ID, &u.ProjectID, &u.Title, &u.Message, &u.Progress, &u.Stage, &u.Media, &u.CreatedAt)
	if u.Media == nil {
		u.Media = []Media{}
	}
	return u, err
}

func (s ongoingStore) list(ctx context.Context, onlyPublic bool) ([]OngoingProject, error) {
	query := `SELECT ` + ongoingColumns + ` FROM ongoing_projects`
	if onlyPublic {
		query += ` WHERE visibility = 'public'`
	}
	query += ` ORDER BY updated_at DESC`
	rows, err := s.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	return pgx.CollectRows(rows, scanOngoing)
}

// find loads one project with all its updates. where is a trusted SQL condition using $1.
func (s ongoingStore) find(ctx context.Context, where string, arg any) (OngoingProject, error) {
	rows, err := s.db.Query(ctx, `SELECT `+ongoingColumns+` FROM ongoing_projects WHERE `+where, arg)
	if err != nil {
		return OngoingProject{}, err
	}
	p, err := pgx.CollectExactlyOneRow(rows, scanOngoing)
	if errors.Is(err, pgx.ErrNoRows) {
		return OngoingProject{}, errNotFound
	}
	if err != nil {
		return OngoingProject{}, err
	}
	p.Updates, err = s.updates(ctx, p.ID)
	return p, err
}

func (s ongoingStore) updates(ctx context.Context, projectID int64) ([]Update, error) {
	rows, err := s.db.Query(ctx, `
		SELECT id, project_id, title, message, progress, stage, media, created_at
		FROM project_updates WHERE project_id = $1 ORDER BY created_at DESC`, projectID)
	if err != nil {
		return nil, err
	}
	return pgx.CollectRows(rows, scanUpdate)
}

func (s ongoingStore) create(ctx context.Context, in ongoingInput) (OngoingProject, error) {
	rows, err := s.db.Query(ctx, `
		INSERT INTO ongoing_projects (slug, title, client, industry, summary, stage, progress,
		                              expected_completion, cover_url, visibility, share_token)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING `+ongoingColumns,
		in.Slug, in.Title, in.Client, in.Industry, in.Summary, in.Stage, in.Progress,
		nullableDate(in.ExpectedCompletion), in.CoverURL, in.Visibility, randomHex(16))
	if err != nil {
		return OngoingProject{}, err
	}
	return pgx.CollectExactlyOneRow(rows, scanOngoing)
}

func (s ongoingStore) update(ctx context.Context, id int64, in ongoingInput) (OngoingProject, string, error) {
	var oldCover string
	err := s.db.QueryRow(ctx, `SELECT cover_url FROM ongoing_projects WHERE id = $1`, id).Scan(&oldCover)
	if errors.Is(err, pgx.ErrNoRows) {
		return OngoingProject{}, "", errNotFound
	}
	if err != nil {
		return OngoingProject{}, "", err
	}
	rows, err := s.db.Query(ctx, `
		UPDATE ongoing_projects SET slug = $1, title = $2, client = $3, industry = $4, summary = $5,
		       stage = $6, progress = $7, expected_completion = $8, cover_url = $9, visibility = $10,
		       updated_at = now()
		WHERE id = $11
		RETURNING `+ongoingColumns,
		in.Slug, in.Title, in.Client, in.Industry, in.Summary, in.Stage, in.Progress,
		nullableDate(in.ExpectedCompletion), in.CoverURL, in.Visibility, id)
	if err != nil {
		return OngoingProject{}, "", err
	}
	p, err := pgx.CollectExactlyOneRow(rows, scanOngoing)
	return p, oldCover, err
}

// delete removes the project and its updates, returning every media URL it used.
func (s ongoingStore) delete(ctx context.Context, id int64) ([]string, error) {
	var cover string
	err := s.db.QueryRow(ctx, `SELECT cover_url FROM ongoing_projects WHERE id = $1`, id).Scan(&cover)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errNotFound
	}
	if err != nil {
		return nil, err
	}
	updates, err := s.updates(ctx, id)
	if err != nil {
		return nil, err
	}
	if _, err := s.db.Exec(ctx, `DELETE FROM ongoing_projects WHERE id = $1`, id); err != nil {
		return nil, err
	}
	urls := []string{cover}
	for _, u := range updates {
		for _, m := range u.Media {
			urls = append(urls, m.URL)
		}
	}
	return urls, nil
}

// addUpdate saves the update and moves the project's progress and stage forward, in one transaction.
func (s ongoingStore) addUpdate(ctx context.Context, projectID int64, in updateInput) (Update, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return Update{}, err
	}
	defer tx.Rollback(ctx) // does nothing once Commit succeeds

	tag, err := tx.Exec(ctx, `UPDATE ongoing_projects SET progress = $1, stage = $2, updated_at = now() WHERE id = $3`,
		in.Progress, in.Stage, projectID)
	if err != nil {
		return Update{}, err
	}
	if tag.RowsAffected() == 0 {
		return Update{}, errNotFound
	}
	rows, err := tx.Query(ctx, `
		INSERT INTO project_updates (project_id, title, message, progress, stage, media)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, project_id, title, message, progress, stage, media, created_at`,
		projectID, in.Title, in.Message, in.Progress, in.Stage, in.Media)
	if err != nil {
		return Update{}, err
	}
	u, err := pgx.CollectExactlyOneRow(rows, scanUpdate)
	if err != nil {
		return Update{}, err
	}
	return u, tx.Commit(ctx)
}

func (s ongoingStore) deleteUpdate(ctx context.Context, id int64) ([]string, error) {
	rows, err := s.db.Query(ctx, `DELETE FROM project_updates WHERE id = $1
		RETURNING id, project_id, title, message, progress, stage, media, created_at`, id)
	if err != nil {
		return nil, err
	}
	u, err := pgx.CollectExactlyOneRow(rows, scanUpdate)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errNotFound
	}
	if err != nil {
		return nil, err
	}
	urls := make([]string, 0, len(u.Media))
	for _, m := range u.Media {
		urls = append(urls, m.URL)
	}
	return urls, nil
}

// --- HTTP handlers ---

// hideToken removes the secret tracking token before data goes to the public.
func hideToken(p OngoingProject) OngoingProject {
	p.ShareToken = ""
	return p
}

func (app *App) handleListPublicOngoing(w http.ResponseWriter, r *http.Request) {
	list, err := app.ongoing.list(r.Context(), true)
	if err != nil {
		app.serverError(w, "list ongoing projects", err)
		return
	}
	for i := range list {
		list[i] = hideToken(list[i])
	}
	writeJSON(w, http.StatusOK, list)
}

func (app *App) handleGetPublicOngoing(w http.ResponseWriter, r *http.Request) {
	p, err := app.ongoing.find(r.Context(), `slug = $1 AND visibility = 'public'`, r.PathValue("slug"))
	app.writeOngoing(w, p, err)
}

// handleTrack serves a client's private tracking link, which works even for private projects.
func (app *App) handleTrack(w http.ResponseWriter, r *http.Request) {
	token := r.PathValue("token")
	if len(token) != 32 {
		writeError(w, http.StatusNotFound, "project not found")
		return
	}
	p, err := app.ongoing.find(r.Context(), `share_token = $1`, token)
	app.writeOngoing(w, p, err)
}

func (app *App) writeOngoing(w http.ResponseWriter, p OngoingProject, err error) {
	switch {
	case errors.Is(err, errNotFound):
		writeError(w, http.StatusNotFound, "project not found")
	case err != nil:
		app.serverError(w, "get ongoing project", err)
	default:
		w.Header().Set("Cache-Control", "no-store")
		writeJSON(w, http.StatusOK, hideToken(p))
	}
}

func (app *App) handleAdminListOngoing(w http.ResponseWriter, r *http.Request) {
	list, err := app.ongoing.list(r.Context(), false)
	if err != nil {
		app.serverError(w, "list ongoing projects", err)
		return
	}
	writeJSON(w, http.StatusOK, list)
}

func (app *App) handleAdminGetOngoing(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	p, err := app.ongoing.find(r.Context(), `id = $1`, id)
	switch {
	case errors.Is(err, errNotFound):
		writeError(w, http.StatusNotFound, "project not found")
	case err != nil:
		app.serverError(w, "get ongoing project", err)
	default:
		writeJSON(w, http.StatusOK, p)
	}
}

func (app *App) handleCreateOngoing(w http.ResponseWriter, r *http.Request) {
	in, ok := readValid(w, r, ongoingInput.validate)
	if !ok {
		return
	}
	p, err := app.ongoing.create(r.Context(), in)
	switch {
	case isUniqueViolation(err):
		writeValidation(w, validationError{"slug": "Another project already uses this URL slug."})
	case err != nil:
		app.serverError(w, "create ongoing project", err)
	default:
		writeJSON(w, http.StatusCreated, p)
	}
}

func (app *App) handleUpdateOngoing(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	in, ok := readValid(w, r, ongoingInput.validate)
	if !ok {
		return
	}
	p, oldCover, err := app.ongoing.update(r.Context(), id, in)
	switch {
	case errors.Is(err, errNotFound):
		writeError(w, http.StatusNotFound, "project not found")
	case isUniqueViolation(err):
		writeValidation(w, validationError{"slug": "Another project already uses this URL slug."})
	case err != nil:
		app.serverError(w, "update ongoing project", err)
	default:
		if oldCover != p.CoverURL {
			app.removeUploads(oldCover)
		}
		writeJSON(w, http.StatusOK, p)
	}
}

func (app *App) handleDeleteOngoing(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	urls, err := app.ongoing.delete(r.Context(), id)
	switch {
	case errors.Is(err, errNotFound):
		writeError(w, http.StatusNotFound, "project not found")
	case err != nil:
		app.serverError(w, "delete ongoing project", err)
	default:
		app.removeUploads(urls...)
		writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
	}
}

func (app *App) handleAddUpdate(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	in, ok := readValid(w, r, updateInput.validate)
	if !ok {
		return
	}
	u, err := app.ongoing.addUpdate(r.Context(), id, in)
	switch {
	case errors.Is(err, errNotFound):
		writeError(w, http.StatusNotFound, "project not found")
	case err != nil:
		app.serverError(w, "add update", err)
	default:
		writeJSON(w, http.StatusCreated, u)
	}
}

func (app *App) handleDeleteUpdate(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	urls, err := app.ongoing.deleteUpdate(r.Context(), id)
	switch {
	case errors.Is(err, errNotFound):
		writeError(w, http.StatusNotFound, "update not found")
	case err != nil:
		app.serverError(w, "delete update", err)
	default:
		app.removeUploads(urls...)
		writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
	}
}

// pathID reads the numeric {id} from the URL.
func pathID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "invalid id")
		return 0, false
	}
	return id, true
}

// readValid decodes a JSON body and runs its validate method, writing any error response.
func readValid[T any](w http.ResponseWriter, r *http.Request, validate func(T) (T, validationError)) (T, bool) {
	var in T
	if err := readJSON(w, r, &in); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return in, false
	}
	clean, verr := validate(in)
	if verr != nil {
		writeValidation(w, verr)
		return in, false
	}
	return clean, true
}
