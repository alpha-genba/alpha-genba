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

-- Private notes the team keeps about an enquiry (never shown to the client).
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS admin_note TEXT NOT NULL DEFAULT '';

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

-- Extra photos for a completed project.
ALTER TABLE projects ADD COLUMN IF NOT EXISTS gallery TEXT[] NOT NULL DEFAULT '{}';

-- Machines currently being designed, built or installed.
CREATE TABLE IF NOT EXISTS ongoing_projects (
    id                  BIGSERIAL PRIMARY KEY,
    slug                TEXT NOT NULL UNIQUE,
    title               TEXT NOT NULL,
    client              TEXT NOT NULL DEFAULT '',   -- client name shown on the page (optional)
    industry            TEXT NOT NULL DEFAULT '',
    summary             TEXT NOT NULL DEFAULT '',
    stage               TEXT NOT NULL DEFAULT 'design'
                        CHECK (stage IN ('design', 'manufacturing', 'assembly', 'testing', 'installation', 'completed')),
    progress            INT NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    expected_completion DATE,
    cover_url           TEXT NOT NULL DEFAULT '',
    -- public: listed on the Ongoing Projects page; private: only visible through the client's tracking link
    visibility          TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
    share_token         TEXT NOT NULL UNIQUE,       -- secret part of the client's tracking link
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Progress updates posted by the team, with photos and video recordings.
CREATE TABLE IF NOT EXISTS project_updates (
    id          BIGSERIAL PRIMARY KEY,
    project_id  BIGINT NOT NULL REFERENCES ongoing_projects (id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    message     TEXT NOT NULL DEFAULT '',
    progress    INT NOT NULL CHECK (progress BETWEEN 0 AND 100),
    stage       TEXT NOT NULL,
    media       JSONB NOT NULL DEFAULT '[]',        -- [{"kind": "image" | "video", "url": "..."}]
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_updates_project_time_idx ON project_updates (project_id, created_at DESC);
