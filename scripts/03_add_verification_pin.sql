-- Add verification_pin column to events table to track event creator's PIN for verification
ALTER TABLE events ADD COLUMN verification_pin TEXT UNIQUE NOT NULL DEFAULT '';

-- Add verified column to participants to track if they've been verified
ALTER TABLE participants ADD COLUMN verified BOOLEAN DEFAULT FALSE;

-- Update existing events to have a random PIN
UPDATE events SET verification_pin = SUBSTRING(MD5(RANDOM()::text), 1, 6) WHERE verification_pin = '';
