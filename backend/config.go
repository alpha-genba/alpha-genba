package main

import (
	"bufio"
	"crypto/rand"
	"encoding/hex"
	"log"
	"os"
	"strings"
)

// Config holds everything the server needs to start.
// Values come from environment variables, optionally loaded from backend/.env.
type Config struct {
	Addr          string // address the API listens on, e.g. ":8080"
	DatabaseURL   string // PostgreSQL connection string; empty = start an embedded dev database
	AdminPassword string // password for the admin panel
	SessionSecret string // key used to sign admin session cookies
	Production    bool   // true when running on the real server
	DevDataDir    string // where the embedded dev database keeps its files
	UploadDir     string // where uploaded photos and videos are stored
}

func loadConfig() Config {
	loadDotEnv("backend/.env")
	loadDotEnv(".env")

	cfg := Config{
		Addr:          getenv("ADDR", ":8080"),
		DatabaseURL:   os.Getenv("DATABASE_URL"),
		AdminPassword: os.Getenv("ADMIN_PASSWORD"),
		SessionSecret: os.Getenv("SESSION_SECRET"),
		Production:    os.Getenv("APP_ENV") == "production",
		DevDataDir:    getenv("DEV_DATA_DIR", ".devdata"),
		UploadDir:     getenv("UPLOAD_DIR", ".devdata/uploads"),
	}

	if cfg.SessionSecret == "" {
		if cfg.Production {
			log.Fatal("SESSION_SECRET must be set in production")
		}
		// In development a random secret is fine: admins just log in again after a restart.
		cfg.SessionSecret = randomHex(32)
	}
	if cfg.AdminPassword == "" {
		log.Println("WARNING: ADMIN_PASSWORD is not set, so the admin panel is disabled. See backend/.env.example")
	}
	return cfg
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// loadDotEnv reads KEY=VALUE lines from a file into the environment.
// Variables that are already set are not overwritten. A missing file is ignored.
func loadDotEnv(path string) {
	f, err := os.Open(path)
	if err != nil {
		return
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		key = strings.TrimSpace(key)
		value = strings.Trim(strings.TrimSpace(value), `"'`)
		if _, exists := os.LookupEnv(key); !exists {
			os.Setenv(key, value)
		}
	}
}

func randomHex(n int) string {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		log.Fatal(err)
	}
	return hex.EncodeToString(b)
}
