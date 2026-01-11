-- Add budget field to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS budget DECIMAL(10, 2) DEFAULT 0;
