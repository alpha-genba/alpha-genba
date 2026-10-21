-- Alpha Genba database schema.
-- Runs on every server start, so every statement must be safe to repeat.

-- Quote requests sent from the website's contact form.
CREATE TABLE IF NOT EXISTS enquiries (
    id          BIGSERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    company     TEXT NOT NULL DEFAULT '',
    email       TEXT NOT NULL DEFAULT '',
    phone       TEXT NOT NULL DEFAULT '',
    industry    TEXT NOT NULL DEFAULT '',
    message     TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'contacted', 'won', 'lost', 'archived')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS enquiries_created_at_idx ON enquiries (created_at DESC);

-- Machines and projects Alpha Automations has delivered.
CREATE TABLE IF NOT EXISTS projects (
    id            BIGSERIAL PRIMARY KEY,
    slug          TEXT NOT NULL UNIQUE,
    title         TEXT NOT NULL,
    industry      TEXT NOT NULL DEFAULT '',
    summary       TEXT NOT NULL DEFAULT '',
    problem       TEXT NOT NULL DEFAULT '',   -- what the team saw at the genba
    solution      TEXT NOT NULL DEFAULT '',   -- the machine or panel that was built
    result        TEXT NOT NULL DEFAULT '',   -- the outcome for the client
    technologies  TEXT[] NOT NULL DEFAULT '{}',
    image_url     TEXT NOT NULL DEFAULT '',
    completed_on  DATE,
    published     BOOLEAN NOT NULL DEFAULT false,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Machine state changes from the live monitoring system.
CREATE TABLE IF NOT EXISTS machine_events (
    id          BIGSERIAL PRIMARY KEY,
    machine_id  TEXT NOT NULL,
    from_status TEXT NOT NULL,
    to_status   TEXT NOT NULL,
    fault_code  TEXT NOT NULL DEFAULT '',
    message     TEXT NOT NULL DEFAULT '',
    occurred_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS machine_events_machine_time_idx ON machine_events (machine_id, occurred_at DESC);
