-- Add email_sent column to volunteers table
ALTER TABLE volunteers ADD COLUMN email_sent BOOLEAN DEFAULT false;

COMMIT;
