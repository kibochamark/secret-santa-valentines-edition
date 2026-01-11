-- Remove event-level verification PIN and add individual participant PINs
ALTER TABLE events DROP COLUMN IF EXISTS verification_pin;

-- Add PIN column to participants table
ALTER TABLE participants ADD COLUMN pin TEXT UNIQUE NOT NULL DEFAULT '';

-- Generate unique PINs for existing participants
UPDATE participants SET pin = SUBSTRING(MD5(RANDOM()::text || participants.id), 1, 6) WHERE pin = '';
