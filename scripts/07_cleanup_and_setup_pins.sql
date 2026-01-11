-- Drop and recreate participants table with proper PIN support
-- This cleans up the conflicting migrations

-- First, backup assignments before dropping
CREATE TABLE IF NOT EXISTS participants_backup AS
SELECT id, event_id, name, assigned_to, created_at, updated_at FROM participants;

-- Drop the participants table (cascades to any dependent objects)
DROP TABLE IF EXISTS participants CASCADE;

-- Install pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Recreate participants table with pin_hash
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  assigned_to UUID REFERENCES participants(id),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, name)
);

-- Restore backup data if it exists (without pin_hash, will be set to empty)
INSERT INTO participants (id, event_id, name, pin_hash, assigned_to, created_at, updated_at)
SELECT id, event_id, name, crypt('', gen_salt('bf')), assigned_to, created_at, updated_at
FROM participants_backup
ON CONFLICT (event_id, name) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_participants_event_id ON participants(event_id);
CREATE INDEX IF NOT EXISTS idx_participants_assigned_to ON participants(assigned_to);
CREATE INDEX IF NOT EXISTS idx_participants_pin_hash ON participants(pin_hash);
