package main

import (
	"context"
	_ "embed"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"time"

	embeddedpostgres "github.com/fergusstrange/embedded-postgres"
	"github.com/jackc/pgx/v5/pgxpool"
)

//go:embed schema.sql
var schemaSQL string

// openDatabase connects to PostgreSQL and makes sure the tables exist.
//
// If DATABASE_URL is empty (normal local development), it starts a real PostgreSQL
// server in the background so nothing has to be installed. The returned stop
// function shuts that server down again.
func openDatabase(ctx context.Context, cfg Config) (*pgxpool.Pool, func(), error) {
	stop := func() {}
	url := cfg.DatabaseURL

	if url == "" {
		if cfg.Production {
			return nil, stop, fmt.Errorf("DATABASE_URL must be set in production")
		}
		var err error
		url, stop, err = startDevDatabase(cfg.DevDataDir)
		if err != nil {
			return nil, stop, err
		}
	}

	pool, err := pgxpool.New(ctx, url)
	if err != nil {
		stop()
		return nil, func() {}, fmt.Errorf("connect to database: %w", err)
	}
	if _, err := pool.Exec(ctx, schemaSQL); err != nil {
		pool.Close()
		stop()
		return nil, func() {}, fmt.Errorf("apply schema: %w", err)
	}

	return pool, func() { pool.Close(); stop() }, nil
}

func startDevDatabase(dir string) (string, func(), error) {
	const port = 5433 // not the default 5432, so it never clashes with an installed PostgreSQL

	dir, err := filepath.Abs(dir)
	if err != nil {
		return "", func() {}, err
	}

	// The library wipes RuntimePath on every start, so the data must live outside it.
	cfg := embeddedpostgres.DefaultConfig().
		Version(embeddedpostgres.V17).
		Port(port).
		Database("alphagenba").
		Locale("C").
		Encoding("UTF8"). // Windows would otherwise pick WIN1252, which can't store Kannada, Hindi or Japanese text

		RuntimePath(filepath.Join(dir, "pg-runtime")).
		DataPath(filepath.Join(dir, "pg-data")).
		CachePath(filepath.Join(dir, "pg-cache")).
		StartTimeout(60 * time.Second)

	stopLeftoverDevDatabase(filepath.Join(dir, "pg-runtime"), filepath.Join(dir, "pg-data"))

	log.Println("Starting development PostgreSQL (the first run downloads it, which can take a minute)...")
	db := embeddedpostgres.NewDatabase(cfg)
	if err := db.Start(); err != nil {
		return "", func() {}, fmt.Errorf("start development database: %w", err)
	}
	log.Printf("Development PostgreSQL running on port %d, data in %s", port, filepath.Join(dir, "pg-data"))

	stop := func() {
		if err := db.Stop(); err != nil {
			log.Printf("stop development database: %v", err)
		}
	}
	return cfg.GetConnectionURL() + "?sslmode=disable", stop, nil
}

// stopLeftoverDevDatabase shuts down a dev PostgreSQL that is still running because
// the backend was killed instead of stopped with Ctrl+C. Without this, the next start
// fails because the port and files are still in use.
func stopLeftoverDevDatabase(runtimeDir, dataDir string) {
	if _, err := os.Stat(filepath.Join(dataDir, "postmaster.pid")); err != nil {
		return // not running
	}
	pgCtl := filepath.Join(runtimeDir, "bin", "pg_ctl")
	if runtime.GOOS == "windows" {
		pgCtl += ".exe"
	}
	if _, err := os.Stat(pgCtl); err != nil {
		return
	}
	log.Println("Stopping a development PostgreSQL left over from the last run...")
	if out, err := exec.Command(pgCtl, "-D", dataDir, "stop", "-m", "fast").CombinedOutput(); err != nil {
		log.Printf("could not stop leftover database (it may already be stopped): %v: %s", err, out)
	}
}
