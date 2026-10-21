// Package simulator imitates a small factory floor: machines that run, wait for
// material, fault, and produce good and rejected parts. It stands in for real
// PLC data until the edge gateway reads from actual machines.
package simulator

import (
	"fmt"
	"math/rand/v2"
	"sync"
	"time"
)

type Status string

const (
	Running Status = "RUNNING"
	Idle    Status = "IDLE"
	Fault   Status = "FAULT"
)

// MachineSpec describes a machine before the simulation starts.
type MachineSpec struct {
	ID         string
	Name       string
	Kind       string
	IdealCycle time.Duration // fastest possible time to make one part
}

// DefaultMachines is a demo line built from the kinds of machines Alpha Automations makes.
func DefaultMachines() []MachineSpec {
	return []MachineSpec{
		{ID: "M1", Name: "Auto Screwing Station", Kind: "Screwing", IdealCycle: 6 * time.Second},
		{ID: "M2", Name: "Pneumatic Press", Kind: "Pneumatics", IdealCycle: 4 * time.Second},
		{ID: "M3", Name: "Vision Inspection Cell", Kind: "Vision", IdealCycle: 3 * time.Second},
		{ID: "M4", Name: "Servo Assembly Unit", Kind: "Servo / PLC", IdealCycle: 8 * time.Second},
		{ID: "M5", Name: "Laser Marking & Scanning", Kind: "Printing / Scanning", IdealCycle: 5 * time.Second},
	}
}

// OEE (Overall Equipment Effectiveness) = Availability × Performance × Quality.
type OEE struct {
	Availability float64 `json:"availability"` // share of planned time the machine was running
	Performance  float64 `json:"performance"`  // actual speed compared to ideal speed
	Quality      float64 `json:"quality"`      // share of parts that were good
	OEE          float64 `json:"oee"`
}

func computeOEE(run, planned, idealCycle time.Duration, good, rejected int) OEE {
	o := OEE{Performance: 1, Quality: 1}
	if planned > 0 {
		o.Availability = run.Seconds() / planned.Seconds()
	}
	total := good + rejected
	if total > 0 && run > 0 {
		o.Performance = min(1, idealCycle.Seconds()*float64(total)/run.Seconds())
		o.Quality = float64(good) / float64(total)
	}
	o.OEE = o.Availability * o.Performance * o.Quality
	return o
}

type MachineState struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Kind          string    `json:"kind"`
	Status        Status    `json:"status"`
	Reason        string    `json:"reason"` // why the machine is idle or faulted
	StatusSince   time.Time `json:"statusSince"`
	GoodParts     int       `json:"goodParts"`
	RejectedParts int       `json:"rejectedParts"`
	LastCycleSec  float64   `json:"lastCycleSec"`
	IdealCycleSec float64   `json:"idealCycleSec"`
	OEE           OEE       `json:"oee"`
}

// Event is a machine changing status, which is what an Andon board shows.
type Event struct {
	Time        time.Time `json:"time"`
	MachineID   string    `json:"machineId"`
	MachineName string    `json:"machineName"`
	From        Status    `json:"from"`
	To          Status    `json:"to"`
	Code        string    `json:"code"`
	Message     string    `json:"message"`
}

type Snapshot struct {
	Time          time.Time      `json:"time"`
	Machines      []MachineState `json:"machines"`
	Line          OEE            `json:"line"`
	GoodParts     int            `json:"goodParts"`
	RejectedParts int            `json:"rejectedParts"`
	Events        []Event        `json:"events"` // newest first
}

type stopReason struct{ code, message string }

var faultReasons = []stopReason{
	{"E01", "Air pressure low"},
	{"E07", "Part not detected (Poka-Yoke)"},
	{"E12", "Servo overload"},
	{"E21", "Vision reject limit reached"},
	{"E30", "Emergency stop pressed"},
}

var idleReasons = []stopReason{
	{"I01", "Waiting for material"},
	{"I02", "Changeover in progress"},
	{"I03", "Operator break"},
}

const (
	maxEvents       = 30
	rejectRate      = 0.02   // 2% of parts fail quality checks
	faultPerSecond  = 0.0025 // chance a running machine faults in any second
	idlePerSecond   = 0.003  // chance a running machine stops for material, changeover, etc.
	maxSlowdown     = 0.25   // real cycles take up to 25% longer than ideal
	minFaultSeconds = 10
	maxFaultSeconds = 45
	minIdleSeconds  = 5
	maxIdleSeconds  = 30
)

type machine struct {
	spec         MachineSpec
	status       Status
	reason       stopReason
	since        time.Time
	until        time.Time // when the current idle/fault period ends
	progress     float64   // how far through the current part, 0..1
	currentCycle time.Duration
	lastCycle    time.Duration
	good         int
	rejected     int
	runTime      time.Duration
	plannedTime  time.Duration
}

// Factory is safe to use from several goroutines.
type Factory struct {
	mu       sync.Mutex
	rng      *rand.Rand
	now      time.Time
	machines []*machine
	events   []Event
}

// New creates a factory where every machine starts running at start.
// The same seed always produces the same simulation, which makes tests repeatable.
func New(specs []MachineSpec, seed uint64, start time.Time) *Factory {
	f := &Factory{rng: rand.New(rand.NewPCG(seed, seed^0x9E3779B97F4A7C15)), now: start}
	for _, s := range specs {
		m := &machine{spec: s, status: Running, since: start}
		m.currentCycle = f.cycleTime(s.IdealCycle)
		f.machines = append(f.machines, m)
	}
	return f
}

func (f *Factory) cycleTime(ideal time.Duration) time.Duration {
	return time.Duration(float64(ideal) * (1 + f.rng.Float64()*maxSlowdown))
}

func (f *Factory) randomSeconds(lo, hi int) time.Duration {
	return time.Duration(lo+f.rng.IntN(hi-lo+1)) * time.Second
}

// Step moves the simulation forward by dt and returns the status changes that happened.
func (f *Factory) Step(dt time.Duration) []Event {
	f.mu.Lock()
	defer f.mu.Unlock()

	f.now = f.now.Add(dt)
	var changes []Event
	for _, m := range f.machines {
		m.plannedTime += dt
		if e, changed := f.stepMachine(m, dt); changed {
			changes = append(changes, e)
		}
	}
	for _, e := range changes {
		f.events = append([]Event{e}, f.events...)
	}
	if len(f.events) > maxEvents {
		f.events = f.events[:maxEvents]
	}
	return changes
}

func (f *Factory) stepMachine(m *machine, dt time.Duration) (Event, bool) {
	switch m.status {
	case Running:
		m.runTime += dt
		m.progress += float64(dt) / float64(m.currentCycle)
		for m.progress >= 1 {
			m.progress--
			if f.rng.Float64() < rejectRate {
				m.rejected++
			} else {
				m.good++
			}
			m.lastCycle = m.currentCycle
			m.currentCycle = f.cycleTime(m.spec.IdealCycle)
		}

		secs := dt.Seconds()
		switch roll := f.rng.Float64(); {
		case roll < faultPerSecond*secs:
			r := faultReasons[f.rng.IntN(len(faultReasons))]
			return f.change(m, Fault, r, f.randomSeconds(minFaultSeconds, maxFaultSeconds)), true
		case roll < (faultPerSecond+idlePerSecond)*secs:
			r := idleReasons[f.rng.IntN(len(idleReasons))]
			return f.change(m, Idle, r, f.randomSeconds(minIdleSeconds, maxIdleSeconds)), true
		}

	case Idle, Fault:
		if !f.now.Before(m.until) {
			return f.change(m, Running, stopReason{"OK", "Back in production"}, 0), true
		}
	}
	return Event{}, false
}

func (f *Factory) change(m *machine, to Status, r stopReason, duration time.Duration) Event {
	e := Event{
		Time:        f.now,
		MachineID:   m.spec.ID,
		MachineName: m.spec.Name,
		From:        m.status,
		To:          to,
		Code:        r.code,
		Message:     r.message,
	}
	m.status = to
	m.reason = r
	m.since = f.now
	m.until = f.now.Add(duration)
	return e
}

func (f *Factory) Snapshot() Snapshot {
	f.mu.Lock()
	defer f.mu.Unlock()

	s := Snapshot{Time: f.now, Events: append([]Event(nil), f.events...)}
	var run, planned, idealWork time.Duration
	for _, m := range f.machines {
		reason := ""
		if m.status != Running {
			reason = fmt.Sprintf("%s · %s", m.reason.code, m.reason.message)
		}
		s.Machines = append(s.Machines, MachineState{
			ID:            m.spec.ID,
			Name:          m.spec.Name,
			Kind:          m.spec.Kind,
			Status:        m.status,
			Reason:        reason,
			StatusSince:   m.since,
			GoodParts:     m.good,
			RejectedParts: m.rejected,
			LastCycleSec:  m.lastCycle.Seconds(),
			IdealCycleSec: m.spec.IdealCycle.Seconds(),
			OEE:           computeOEE(m.runTime, m.plannedTime, m.spec.IdealCycle, m.good, m.rejected),
		})
		s.GoodParts += m.good
		s.RejectedParts += m.rejected
		run += m.runTime
		planned += m.plannedTime
		idealWork += m.spec.IdealCycle * time.Duration(m.good+m.rejected)
	}

	// Line OEE combines all machines, weighted by how much each one runs and produces.
	line := OEE{Performance: 1, Quality: 1}
	if planned > 0 {
		line.Availability = run.Seconds() / planned.Seconds()
	}
	if total := s.GoodParts + s.RejectedParts; total > 0 && run > 0 {
		line.Performance = min(1, idealWork.Seconds()/run.Seconds())
		line.Quality = float64(s.GoodParts) / float64(total)
	}
	line.OEE = line.Availability * line.Performance * line.Quality
	s.Line = line
	return s
}
