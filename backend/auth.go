package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"net/http"
	"strconv"
	"strings"
	"time"
)

const (
	sessionCookie   = "ag_session"
	sessionLifetime = 12 * time.Hour
)

// A session token looks like "<expiry unix time>.<signature>".
// The signature is an HMAC of the expiry, so nobody can forge or extend a token
// without knowing the server's secret. No session table is needed.

func signSession(secret string, expires time.Time) string {
	exp := strconv.FormatInt(expires.Unix(), 10)
	return exp + "." + sessionSignature(secret, exp)
}

func sessionSignature(secret, payload string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte("admin-session:" + payload))
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}

func validSession(secret, token string, now time.Time) bool {
	exp, sig, ok := strings.Cut(token, ".")
	if !ok {
		return false
	}
	if !hmac.Equal([]byte(sig), []byte(sessionSignature(secret, exp))) {
		return false
	}
	unix, err := strconv.ParseInt(exp, 10, 64)
	return err == nil && now.Before(time.Unix(unix, 0))
}

// passwordMatches compares in constant time, so response timing reveals nothing about the password.
func passwordMatches(given, want string) bool {
	g := sha256.Sum256([]byte(given))
	w := sha256.Sum256([]byte(want))
	return subtle.ConstantTimeCompare(g[:], w[:]) == 1
}

func (app *App) isAdmin(r *http.Request) bool {
	c, err := r.Cookie(sessionCookie)
	return err == nil && validSession(app.cfg.SessionSecret, c.Value, time.Now())
}

// requireAdmin wraps a handler so only a logged-in admin can call it.
func (app *App) requireAdmin(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !app.isAdmin(r) {
			writeError(w, http.StatusUnauthorized, "please log in")
			return
		}
		next(w, r)
	}
}

func (app *App) setSessionCookie(w http.ResponseWriter, value string, maxAge int) {
	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookie,
		Value:    value,
		Path:     "/api",
		MaxAge:   maxAge,
		HttpOnly: true, // JavaScript on the page can't read it
		Secure:   app.cfg.Production,
		SameSite: http.SameSiteLaxMode,
	})
}

func (app *App) handleLogin(w http.ResponseWriter, r *http.Request) {
	if app.cfg.AdminPassword == "" {
		writeError(w, http.StatusServiceUnavailable, "admin login is not configured on the server")
		return
	}
	if !app.loginLimiter.allow(clientIP(r)) {
		writeError(w, http.StatusTooManyRequests, "too many login attempts, try again in a few minutes")
		return
	}
	var body struct {
		Password string `json:"password"`
	}
	if err := readJSON(w, r, &body); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if !passwordMatches(body.Password, app.cfg.AdminPassword) {
		writeError(w, http.StatusUnauthorized, "wrong password")
		return
	}
	app.setSessionCookie(w, signSession(app.cfg.SessionSecret, time.Now().Add(sessionLifetime)), int(sessionLifetime.Seconds()))
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (app *App) handleLogout(w http.ResponseWriter, r *http.Request) {
	app.setSessionCookie(w, "", -1)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (app *App) handleMe(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]bool{"admin": app.isAdmin(r)})
}
