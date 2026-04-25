-- Treco Migration — run this on your live database
-- psql -U postgres -d treco_db -f migration.sql

-- ── 1. Connections table (user friend system) ─────────────────────────────
CREATE TABLE IF NOT EXISTS connections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status        VARCHAR(20) DEFAULT 'pending'
                  CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE(requester_id, receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_connections_requester ON connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver  ON connections(receiver_id);

-- ── 2. Direct messages table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dm_messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  read         BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dm_sender   ON dm_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_dm_receiver ON dm_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_dm_created  ON dm_messages(created_at DESC);

-- ── 3. Allow 'banned' role on users ──────────────────────────────────────
-- Drop the old constraint (auto-named by Postgres), then recreate it.
DO $$
DECLARE r TEXT;
BEGIN
  SELECT conname INTO r FROM pg_constraint
  WHERE conrelid = 'users'::regclass AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%role%';
  IF r IS NOT NULL THEN
    EXECUTE 'ALTER TABLE users DROP CONSTRAINT ' || r;
  END IF;
END $$;

ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('user', 'organizer', 'admin', 'banned'));

-- ── 4. Rename government_id_url alias (kept for safety — no-op if already correct) ──
-- Nothing to change in schema; admin.js has been updated to use government_id_url.
