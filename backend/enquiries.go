package main

import (
	"context"
	"errors"
	"net/http"
	"net/mail"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Enquiry struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Company   string    `json:"company"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	Industry  string    `json:"industry"`
	Message   string    `json:"message"`
	Status    string    `json:"status"`
	AdminNote string    `json:"adminNote"`
	CreatedAt time.Time `json:"createdAt"`
}

// enquiryInput is what the contact form sends.
type enquiryInput struct {
	Name     string `json:"name"`
	Company  string `json:"company"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Industry string `json:"industry"`
	Message  string `json:"message"`
	// Website is a hidden "honeypot" field. People never see it, so only spam bots fill it in.
	Website string `json:"website"`
}

var enquiryStatuses = map[string]bool{"new": true, "contacted": true, "won": true, "lost": true, "archived": true}

// validate trims every field and checks it. It returns the cleaned input.
func (in enquiryInput) validate() (enquiryInput, validationError) {
	in.Name = strings.TrimSpace(in.Name)
	in.Company = strings.TrimSpace(in.Company)
	in.Email = strings.TrimSpace(in.Email)
	in.Phone = strings.TrimSpace(in.Phone)
	in.Industry = strings.TrimSpace(in.Industry)
	in.Message = strings.TrimSpace(in.Message)

	errs := validationError{}
	if in.Name == "" {
		errs["name"] = "Please enter your name."
	} else if len(in.Name) > 100 {
		errs["name"] = "Name is too long."
	}
	if len(in.Company) > 150 {
		errs["company"] = "Company name is too long."
	}
	if len(in.Industry) > 100 {
		errs["industry"] = "Industry is too long."
	}
	if in.Email != "" {
		if addr, err := mail.ParseAddress(in.Email); err != nil || addr.Address != in.Email || len(in.Email) > 200 {
			errs["email"] = "Please enter a valid email address."
		}
	}
	if in.Phone == "" {
		errs["phone"] = "Please enter your phone number so we can call you back."
	} else if !validPhone(in.Phone) {
		errs["phone"] = "Please enter a valid phone number."
	}
	if len(in.Message) < 10 {
		errs["message"] = "Please tell us a little more (at least 10 characters)."
	} else if len(in.Message) > 5000 {
		errs["message"] = "Message is too long (5000 characters max)."
	}
	if len(errs) > 0 {
		return in, errs
	}
	return in, nil
}

func validPhone(s string) bool {
	digits := 0
	for _, r := range s {
		switch {
		case r >= '0' && r <= '9':
			digits++
		case r == '+' || r == ' ' || r == '-' || r == '(' || r == ')':
		default:
			return false
		}
	}
	return digits >= 7 && digits <= 15
}

type enquiryStore struct{ db *pgxpool.Pool }

func (s enquiryStore) create(ctx context.Context, in enquiryInput) (Enquiry, error) {
	var e Enquiry
	err := s.db.QueryRow(ctx, `
		INSERT INTO enquiries (name, company, email, phone, industry, message)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, name, company, email, phone, industry, message, status, admin_note, created_at`,
		in.Name, in.Company, in.Email, in.Phone, in.Industry, in.Message,
	).Scan(&e.ID, &e.Name, &e.Company, &e.Email, &e.Phone, &e.Industry, &e.Message, &e.Status, &e.AdminNote, &e.CreatedAt)
	return e, err
}

func (s enquiryStore) list(ctx context.Context) ([]Enquiry, error) {
	rows, err := s.db.Query(ctx, `
		SELECT id, name, company, email, phone, industry, message, status, admin_note, created_at
		FROM enquiries ORDER BY created_at DESC LIMIT 500`)
	if err != nil {
		return nil, err
	}
	return pgx.CollectRows(rows, func(row pgx.CollectableRow) (Enquiry, error) {
		var e Enquiry
		err := row.Scan(&e.ID, &e.Name, &e.Company, &e.Email, &e.Phone, &e.Industry, &e.Message, &e.Status, &e.AdminNote, &e.CreatedAt)
		return e, err
	})
}

var errNotFound = errors.New("not found")

// change updates the status and/or note; a nil value leaves that field as it is.
func (s enquiryStore) change(ctx context.Context, id int64, status, note *string) error {
	tag, err := s.db.Exec(ctx, `
		UPDATE enquiries SET status = COALESCE($1, status), admin_note = COALESCE($2, admin_note)
		WHERE id = $3`, status, note, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return errNotFound
	}
	return nil
}

// --- HTTP handlers ---

func (app *App) handleCreateEnquiry(w http.ResponseWriter, r *http.Request) {
	if !app.enquiryLimiter.allow(clientIP(r)) {
		writeError(w, http.StatusTooManyRequests, "Too many enquiries from your network. Please try again later or call us.")
		return
	}

	var in enquiryInput
	if err := readJSON(w, r, &in); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if in.Website != "" {
		// A bot filled the honeypot. Pretend it worked so it doesn't retry.
		writeJSON(w, http.StatusCreated, map[string]bool{"ok": true})
		return
	}
	clean, verr := in.validate()
	if verr != nil {
		writeValidation(w, verr)
		return
	}

	if _, err := app.enquiries.create(r.Context(), clean); err != nil {
		app.serverError(w, "create enquiry", err)
		return
	}
	writeJSON(w, http.StatusCreated, map[string]bool{"ok": true})
}

func (app *App) handleListEnquiries(w http.ResponseWriter, r *http.Request) {
	list, err := app.enquiries.list(r.Context())
	if err != nil {
		app.serverError(w, "list enquiries", err)
		return
	}
	writeJSON(w, http.StatusOK, list)
}

func (app *App) handleUpdateEnquiry(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid enquiry id")
		return
	}
	var body struct {
		Status *string `json:"status"`
		Note   *string `json:"adminNote"`
	}
	if err := readJSON(w, r, &body); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if body.Status != nil && !enquiryStatuses[*body.Status] {
		writeError(w, http.StatusBadRequest, "unknown status")
		return
	}
	if body.Note != nil && len(*body.Note) > 5000 {
		writeError(w, http.StatusBadRequest, "note is too long (5000 characters max)")
		return
	}
	switch err := app.enquiries.change(r.Context(), id, body.Status, body.Note); {
	case errors.Is(err, errNotFound):
		writeError(w, http.StatusNotFound, "enquiry not found")
	case err != nil:
		app.serverError(w, "update enquiry", err)
	default:
		writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
	}
}
