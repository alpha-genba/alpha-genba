package main

import (
	"strings"
	"testing"
	"time"
)

func TestEnquiryValidation(t *testing.T) {
	valid := enquiryInput{Name: "  Ravi  ", Email: "ravi@example.com", Message: "We need an auto screwing station."}
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
		{"no contact details", enquiryInput{Name: "Ravi", Message: "Need a control panel."}, "email"},
		{"bad email", enquiryInput{Name: "Ravi", Email: "not-an-email", Message: "Need a control panel."}, "email"},
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
