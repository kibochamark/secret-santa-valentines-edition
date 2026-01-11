-- Add unique constraint to prevent duplicate participant names in the same event
ALTER TABLE participants ADD CONSTRAINT unique_participant_per_event UNIQUE (event_id, name);
