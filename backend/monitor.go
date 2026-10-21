package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/alpha-genba/alpha-genba/simulator"
	"github.com/jackc/pgx/v5"
)

// The live monitoring demo runs a simulated factory inside the backend.
// Later, the edge gateway will publish real PLC data over MQTT instead.

const warmUp = 2 * time.Hour // simulate a morning shift first, so the demo starts with realistic numbers

func newDemoFactory() *simulator.Factory {
	f := simulator.New(simulator.DefaultMachines(), uint64(time.Now().UnixNano()), time.Now().Add(-warmUp))
	for elapsed := time.Duration(0); elapsed < warmUp; elapsed += time.Second {
		f.Step(time.Second)
	}
	return f
}

// runFactory advances the simulation once per second and records every status change.
func (app *App) runFactory(ctx context.Context) {
	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			if events := app.factory.Step(time.Second); len(events) > 0 {
				app.saveMachineEvents(ctx, events)
			}
		}
	}
}

func (app *App) saveMachineEvents(ctx context.Context, events []simulator.Event) {
	batch := &pgx.Batch{}
	for _, e := range events {
		batch.Queue(`INSERT INTO machine_events (machine_id, from_status, to_status, fault_code, message, occurred_at)
			VALUES ($1, $2, $3, $4, $5, $6)`, e.MachineID, string(e.From), string(e.To), e.Code, e.Message, e.Time)
	}
	if err := app.db.SendBatch(ctx, batch).Close(); err != nil && ctx.Err() == nil {
		log.Printf("save machine events: %v", err)
	}
}

func (app *App) handleMonitor(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-store")
	writeJSON(w, http.StatusOK, app.factory.Snapshot())
}
