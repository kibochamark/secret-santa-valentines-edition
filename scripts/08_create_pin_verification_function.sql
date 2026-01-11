-- Create a function to verify PINs using PostgreSQL's crypt
CREATE OR REPLACE FUNCTION verify_participant_pin(
  participant_id UUID,
  input_pin TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM participants
    WHERE id = participant_id
    AND crypt(input_pin, pin_hash) = pin_hash
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
