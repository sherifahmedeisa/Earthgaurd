async function main() {
  console.log("Starting migration...");

  try {
    // Dynamically import the module to avoid ESM resolution issues in CommonJS
    const { neon } = await import('@neondatabase/serverless');
    
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set in the environment.");
    }

    const sql = neon(process.env.DATABASE_URL);

    // 1. Leaders
    await sql`
      CREATE TABLE IF NOT EXISTS leaders (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        is_approved BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("Created leaders table");

    // 2. Sessions
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(255) PRIMARY KEY,
        leader_id INTEGER REFERENCES leaders(id),
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `;
    console.log("Created sessions table");

    // 3. Volunteers
    await sql`
      CREATE TABLE IF NOT EXISTS volunteers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        hall_number VARCHAR(50),
        qr_code UUID DEFAULT gen_random_uuid(),
        details JSONB,
        is_active BOOLEAN DEFAULT true,
        is_best_volunteer BOOLEAN DEFAULT false,
        email_sent BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        volunteer_type VARCHAR(50) DEFAULT 'theta',
        volunteer_code VARCHAR(50) UNIQUE,
        shift VARCHAR(50)
      );
    `;
    console.log("Created volunteers table");

    // 4. Attendance
    await sql`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        volunteer_id INTEGER REFERENCES volunteers(id),
        leader_id INTEGER REFERENCES leaders(id),
        check_in_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'present',
        notes TEXT,
        attendance_type VARCHAR(50) DEFAULT 'check_in',
        is_best_volunteer_marked BOOLEAN DEFAULT false,
        check_out_time TIMESTAMP WITH TIME ZONE,
        is_extra_day BOOLEAN DEFAULT false,
        volunteer_type VARCHAR(50),
        volunteer_code VARCHAR(50)
      );
    `;
    console.log("Created attendance table");

    // 5. Attendees
    await sql`
      CREATE TABLE IF NOT EXISTS attendees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        qr_code UUID DEFAULT gen_random_uuid(),
        attendee_code VARCHAR(50) UNIQUE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("Created attendees table");

    // 6. Attendee Attendance
    await sql`
      CREATE TABLE IF NOT EXISTS attendee_attendance (
        id SERIAL PRIMARY KEY,
        attendee_id INTEGER REFERENCES attendees(id),
        leader_id INTEGER REFERENCES leaders(id),
        check_in_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'present',
        attendance_type VARCHAR(50) DEFAULT 'check_in'
      );
    `;
    console.log("Created attendee_attendance table");

    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

main();
