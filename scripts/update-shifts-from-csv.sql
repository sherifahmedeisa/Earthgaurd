-- Update shift values based on volunteer_code and data
-- Morning shifts for theta volunteers in Hall 1-4 with morning designation
UPDATE volunteers
SET shift = 'Morning'
WHERE (volunteer_type = 'theta' OR volunteer_type = 'delta')
  AND shift IS NULL
  AND hall_number IN ('Hall 1', 'Hall 2', 'Hall 3', 'Hall 4');

-- Set default to Morning if still null
UPDATE volunteers
SET shift = 'Morning'
WHERE shift IS NULL;

-- Verify update
SELECT COUNT(*) as total, 
       COUNT(CASE WHEN shift = 'Morning' THEN 1 END) as morning,
       COUNT(CASE WHEN shift = 'Evening' THEN 1 END) as evening
FROM volunteers;
