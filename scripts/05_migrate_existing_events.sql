-- Backup existing data before migration
CREATE TABLE IF NOT EXISTS events_backup AS SELECT * FROM events;
CREATE TABLE IF NOT EXISTS participants_backup AS SELECT * FROM participants;

-- Add PIN column to participants if it doesn't exist
ALTER TABLE participants ADD COLUMN IF NOT EXISTS pin TEXT UNIQUE;

-- Generate unique default 6-digit PINs for all existing participants without PINs
-- Generating PINs using a combination of random numbers for better distribution
UPDATE participants 
SET pin = LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0')
WHERE pin IS NULL
AND NOT EXISTS (
  SELECT 1 FROM participants p2 
  WHERE p2.pin = LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0')
);

-- If there are still NULL pins (very rare collision scenario), use participant ID hash
UPDATE participants
SET pin = SUBSTRING(
  ENCODE(DIGEST(id::TEXT || created_at::TEXT, 'sha256'), 'hex'),
  1, 6
)
WHERE pin IS NULL;

-- Verify all participants now have PINs
SELECT COUNT(*) as participants_with_pins FROM participants WHERE pin IS NOT NULL;
SELECT COUNT(*) as participants_without_pins FROM participants WHERE pin IS NULL;
