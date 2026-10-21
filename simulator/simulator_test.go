package simulator

import (
	"reflect"
	"testing"
	"time"
)

var start = time.Date(2026, 10, 21, 9, 0, 0, 0, time.UTC)

func run(f *Factory, d time.Duration) {
	for elapsed := time.Duration(0); elapsed < d; elapsed += time.Second {
		f.Step(time.Second)
	}
}

func TestSameSeedSameResult(t *testing.T) {
	a := New(DefaultMachines(), 42, start)
	b := New(DefaultMachines(), 42, start)
	run(a, time.Hour)
	run(b, time.Hour)
	if !reflect.DeepEqual(a.Snapshot(), b.Snapshot()) {
		t.Fatal("two factories with the same seed produced different results")
	}
}

func TestFactoryProducesPartsAndStops(t *testing.T) {
	f := New(DefaultMachines(), 7, start)
	run(f, 4*time.Hour)
	s := f.Snapshot()

	if s.GoodParts == 0 {
		t.Fatal("no good parts produced in 4 hours")
	}
	if s.RejectedParts == 0 {
		t.Error("expected some rejected parts with a 2% reject rate")
	}
	if len(s.Events) == 0 {
		t.Error("expected machines to stop at least once in 4 hours")
	}
	if len(s.Events) > maxEvents {
		t.Errorf("event log has %d entries, want at most %d", len(s.Events), maxEvents)
	}
	for i := 1; i < len(s.Events); i++ {
		if s.Events[i].Time.After(s.Events[i-1].Time) {
			t.Fatal("events are not newest-first")
		}
	}
}

func TestOEEStaysBetweenZeroAndOne(t *testing.T) {
	f := New(DefaultMachines(), 99, start)
	for i := 0; i < 3*3600; i++ {
		f.Step(time.Second)
		if i%600 != 0 {
			continue
		}
		s := f.Snapshot()
		for _, m := range s.Machines {
			for name, v := range map[string]float64{
				"availability": m.OEE.Availability, "performance": m.OEE.Performance,
				"quality": m.OEE.Quality, "oee": m.OEE.OEE,
			} {
				if v < 0 || v > 1 {
					t.Fatalf("%s %s = %v, want 0..1", m.ID, name, v)
				}
			}
		}
	}
}

func TestStoppedMachinesRecover(t *testing.T) {
	f := New(DefaultMachines(), 3, start)
	run(f, 8*time.Hour)
	recovered := false
	for _, e := range f.Snapshot().Events {
		if e.To == Running && (e.From == Fault || e.From == Idle) {
			recovered = true
		}
	}
	if !recovered {
		t.Error("no machine went back to RUNNING after a stop")
	}
}

func TestComputeOEE(t *testing.T) {
	// Ran 80 of 100 minutes, ideal cycle 1 min, made 72 parts of which 70 were good.
	got := computeOEE(80*time.Minute, 100*time.Minute, time.Minute, 70, 2)
	want := OEE{Availability: 0.8, Performance: 0.9, Quality: 70.0 / 72.0}
	want.OEE = want.Availability * want.Performance * want.Quality
	const eps = 1e-9
	if abs(got.Availability-want.Availability) > eps || abs(got.Performance-want.Performance) > eps ||
		abs(got.Quality-want.Quality) > eps || abs(got.OEE-want.OEE) > eps {
		t.Errorf("computeOEE = %+v, want %+v", got, want)
	}
}

func abs(x float64) float64 {
	if x < 0 {
		return -x
	}
	return x
}
