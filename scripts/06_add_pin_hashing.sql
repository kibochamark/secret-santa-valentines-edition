-- Add pin_hash column to store hashed PINs securely
-- Install pgcrypto if not already installed
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add pin_hash column (remove old pin column if it exists)
ALTER TABLE participants DROP COLUMN IF EXISTS pin CASCADE;

ALTER TABLE participants ADD COLUMN IF NOT EXISTS pin_hash TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_participants_pin_hash ON participants(pin_hash);

-- Update participants table to include hashed PINs
DO $$
DECLARE
    participant RECORD;
BEGIN
    FOR participant IN SELECT id, pin FROM participants WHERE pin IS NOT NULL LOOP
        UPDATE participants SET pin_hash = crypt(participant.pin, gen_salt('bf')) WHERE id = participant.id;
    END LOOP;
END $$;
