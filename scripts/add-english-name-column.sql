-- Add english_name column to volunteers table
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS english_name TEXT;
