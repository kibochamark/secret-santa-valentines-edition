-- Update all participant PIN hashes with bcrypt encryption
-- Using the conversion rate: 1 USD = 129 KES

UPDATE participants SET pin_hash = crypt('147293', gen_salt('bf')) WHERE name = 'Adolph';
UPDATE participants SET pin_hash = crypt('582641', gen_salt('bf')) WHERE name = 'Anet';
UPDATE participants SET pin_hash = crypt('641952', gen_salt('bf')) WHERE name = 'Dave';
UPDATE participants SET pin_hash = crypt('936274', gen_salt('bf')) WHERE name = 'Felly';
UPDATE participants SET pin_hash = crypt('451829', gen_salt('bf')) WHERE name = 'Frank';
UPDATE participants SET pin_hash = crypt('769345', gen_salt('bf')) WHERE name = 'GEORGE';
UPDATE participants SET pin_hash = crypt('312857', gen_salt('bf')) WHERE name = 'mark';

-- Verify all pins have been updated
SELECT name, pin_hash FROM participants ORDER BY name;
