-- Add shift column to volunteers table if it doesn't exist
ALTER TABLE volunteers
ADD COLUMN IF NOT EXISTS shift VARCHAR(20) DEFAULT 'Morning';

-- Create index on shift for faster filtering
CREATE INDEX IF NOT EXISTS idx_volunteers_shift ON volunteers(shift);
