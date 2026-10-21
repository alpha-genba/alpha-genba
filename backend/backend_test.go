package main

import (
	"strings"
	"testing"
	"time"
)

func TestEnquiryValidation(t *testing.T) {
	valid := enquiryInput{Name: "  Ravi  ", Phone: "+91 90000 00000", Email: "ravi@example.com", Message: "We need an auto screwing station."}
	clean, errs := valid.validate()
	if errs != nil {
		t.Fatalf("valid enquiry rejected: %v", errs)
	}
	if clean.Name != "Ravi" {
		t.Errorf("name not trimmed: %q", clean.Name)
	}

	tests := []struct {
		name  string
		in    enquiryInput
		field string
	}{
		{"missing name", enquiryInput{Email: "a@b.co", Message: "Need a control panel."}, "name"},
		{"missing phone", enquiryInput{Name: "Ravi", Email: "a@b.co", Message: "Need a control panel."}, "phone"},
		{"bad email", enquiryInput{Name: "Ravi", Phone: "9000000000", Email: "not-an-email", Message: "Need a control panel."}, "email"},
		{"bad phone", enquiryInput{Name: "Ravi", Phone: "call me", Message: "Need a control panel."}, "phone"},
		{"short message", enquiryInput{Name: "Ravi", Phone: "+91 99459 59359", Message: "hi"}, "message"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, errs := tt.in.validate()
			if _, ok := errs[tt.field]; !ok {
				t.Errorf("expected an error on %q, got %v", tt.field, errs)
			}
		})
	}
}

func TestPhoneOnlyEnquiryIsValid(t *testing.T) {
	in := enquiryInput{Name: "Ravi", Phone: "+91 99459-59359", Message: "Please call me about a PLC panel."}
	if _, errs := in.validate(); errs != nil {
		t.Errorf("phone-only enquiry rejected: %v", errs)
	}
}

func TestSlugify(t *testing.T) {
	cases := map[string]string{
		"Auto Screwing Station #2": "auto-screwing-station-2",
		"  PLC Panel — Line 3 ":    "plc-panel-line-3",
		"Vision/Scanner":           "vision-scanner",
	}
	for in, want := range cases {
		if got := slugify(in); got != want {
			t.Errorf("slugify(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestProjectValidation(t *testing.T) {
	clean, errs := projectInput{Title: "Auto Screwing Station", CompletedOn: "2026-08-15"}.validate()
	if errs != nil {
		t.Fatalf("valid project rejected: %v", errs)
	}
	if clean.Slug != "auto-screwing-station" {
		t.Errorf("slug = %q", clean.Slug)
	}
	if clean.Technologies == nil {
		t.Error("technologies must be an empty list, not nil (the database column is NOT NULL)")
	}

	_, errs = projectInput{Title: "X", CompletedOn: "15/08/2026", ImageURL: "javascript:alert(1)"}.validate()
	if errs["completedOn"] == "" || errs["imageUrl"] == "" {
		t.Errorf("expected date and image errors, got %v", errs)
	}
}

func TestSessionTokens(t *testing.T) {
	now := time.Now()
	token := signSession("secret", now.Add(time.Hour))

	if !validSession("secret", token, now) {
		t.Error("fresh token rejected")
	}
	if validSession("other-secret", token, now) {
		t.Error("token accepted with the wrong secret")
	}
	if validSession("secret", token, now.Add(2*time.Hour)) {
		t.Error("expired token accepted")
	}
	exp, sig, _ := strings.Cut(token, ".")
	if validSession("secret", exp+"9."+sig, now) {
		t.Error("token with edited expiry accepted")
	}
}

func TestRateLimiter(t *testing.T) {
	rl := newRateLimiter(2, time.Minute)
	if !rl.allow("ip") || !rl.allow("ip") {
		t.Fatal("first two requests should pass")
	}
	if rl.allow("ip") {
		t.Error("third request should be blocked")
	}
	if !rl.allow("other-ip") {
		t.Error("a different IP should not be blocked")
	}
}

func TestOngoingValidation(t *testing.T) {
	clean, errs := ongoingInput{Title: "Servo Press Line", Progress: 40}.validate()
	if errs != nil {
		t.Fatalf("valid ongoing project rejected: %v", errs)
	}
	if clean.Slug != "servo-press-line" || clean.Stage != "design" || clean.Visibility != "private" {
		t.Errorf("defaults not applied: %+v", clean)
	}

	_, errs = ongoingInput{Title: "X", Progress: 120, Stage: "painting", Visibility: "secret"}.validate()
	for _, f := range []string{"progress", "stage", "visibility"} {
		if errs[f] == "" {
			t.Errorf("expected an error on %q, got %v", f, errs)
		}
	}
}

func TestUpdateValidation(t *testing.T) {
	in := updateInput{
		Title:    "Frame welded",
		Progress: 55,
		Stage:    "manufacturing",
		Media: []Media{
			{Kind: "image", URL: "/api/uploads/0123456789abcdef0123456789abcdef.jpg"},
			{Kind: "video", URL: "https://example.com/test.mp4"},
			{Kind: "image", URL: "  "}, // empty entries are dropped
		},
	}
	clean, errs := in.validate()
	if errs != nil {
		t.Fatalf("valid update rejected: %v", errs)
	}
	if len(clean.Media) != 2 {
		t.Errorf("media = %d items, want 2", len(clean.Media))
	}

	bad := updateInput{Title: "x", Progress: 10, Stage: "design", Media: []Media{{Kind: "audio", URL: "https://a.b/c"}}}
	if _, errs := bad.validate(); errs["media"] == "" {
		t.Error("unknown media kind accepted")
	}
}

func TestValidMediaURL(t *testing.T) {
	good := []string{
		"/api/uploads/0123456789abcdef0123456789abcdef.png",
		"/images/machine.jpg",
		"https://example.com/photo.jpg",
	}
	bad := []string{
		"/api/uploads/../../secret.txt",
		"/api/uploads/short.jpg",
		"//evil.example.com/x.jpg",
		"javascript:alert(1)",
		"ftp://example.com/x.jpg",
	}
	for _, u := range good {
		if !validMediaURL(u) {
			t.Errorf("validMediaURL(%q) = false, want true", u)
		}
	}
	for _, u := range bad {
		if validMediaURL(u) {
			t.Errorf("validMediaURL(%q) = true, want false", u)
		}
	}
}

func TestUnused(t *testing.T) {
	got := unused([]string{"a", "b", "c"}, []string{"b", "d"})
	if strings.Join(got, ",") != "a,c" {
		t.Errorf("unused = %v, want [a c]", got)
	}
}
