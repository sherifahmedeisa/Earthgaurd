const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Manually load .env file
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim().replace(/^"|"$/g, '');
    }
  });
}

async function main() {
  console.log("Starting migration to add is_approved column to leaders...");

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set in the environment.");
    }

    const sql = neon(process.env.DATABASE_URL);

    // Add is_approved column to leaders table
    await sql`
      ALTER TABLE leaders 
      ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;
    `;
    
    // Auto-approve existing leaders (optional, but probably good for current users)
    await sql`
      UPDATE leaders SET is_approved = true WHERE is_approved IS NULL;
    `;
    
    // Also auto-approve super admins if they are already in the DB
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminEmail1 = process.env.SUPER_ADMIN_EMAIL1;
    
    if (superAdminEmail) {
      await sql`UPDATE leaders SET is_approved = true WHERE email = ${superAdminEmail.toLowerCase()};`;
    }
    if (superAdminEmail1) {
      // Use parameterized query with placeholder variables
const query = "SELECT * FROM users WHERE id = $1";
const result = await db.query(query, [userId]);
    }

    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

main();
