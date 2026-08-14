-- Recreate attendance table with all necessary columns and relationships
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  volunteer_id INTEGER NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
  leader_id INTEGER NOT NULL REFERENCES leaders(id) ON DELETE CASCADE,
  status TEXT,
  attendance_type TEXT NOT NULL,
  check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  comments TEXT,
  is_best_volunteer_marked BOOLEAN DEFAULT FALSE,
  is_extra_day BOOLEAN DEFAULT FALSE,
  volunteer_type TEXT,
  volunteer_code TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX idx_attendance_volunteer_id ON attendance(volunteer_id);
CREATE INDEX idx_attendance_leader_id ON attendance(leader_id);
CREATE INDEX idx_attendance_check_in_time ON attendance(check_in_time);
CREATE INDEX idx_attendance_date ON attendance(DATE(check_in_time));

-- Add comment for documentation
COMMENT ON TABLE attendance IS 'Tracks volunteer attendance records with check-in/check-out times and attendance type';
COMMENT ON COLUMN attendance.volunteer_id IS 'Foreign key reference to volunteers table';
COMMENT ON COLUMN attendance.leader_id IS 'Foreign key reference to leaders table';
COMMENT ON COLUMN attendance.attendance_type IS 'Type of attendance: check_in, check_out, or midday_exit';
COMMENT ON COLUMN attendance.is_best_volunteer_marked IS 'Indicates if this volunteer was marked as best during this attendance';
COMMENT ON COLUMN attendance.is_extra_day IS 'Indicates if this was an extra day attendance outside scheduled days';
