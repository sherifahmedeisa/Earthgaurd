import { neon } from "@neondatabase/serverless"
import crypto from "crypto"
import fs from "fs"
import path from "path"

const envPath = path.resolve(process.cwd(), ".env")
let dbUrl = ""
let superAdminEmail = "sherifahed25@gmail.com"

if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8")
  for (const line of envConfig.split("\n")) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith("#")) {
      const equalsIdx = trimmed.indexOf("=")
      if (equalsIdx > -1) {
        const key = trimmed.slice(0, equalsIdx).trim()
        const val = trimmed.slice(equalsIdx + 1).trim()
        process.env[key] = val
      }
    }
  }
}

dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || ""
if (process.env.SUPER_ADMIN_EMAIL) {
  superAdminEmail = process.env.SUPER_ADMIN_EMAIL
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

async function tryConnect() {
  const candidateUrls = [
    dbUrl,
    dbUrl.replace("&channel_binding=require", "").replace("?channel_binding=require", ""),
    dbUrl.replace("-pooler", ""),
  ].filter(Boolean)

  let activeSql = null
  for (const url of candidateUrls) {
    try {
      console.log("Trying connection string...")
      const sql = neon(url)
      await sql`SELECT 1`
      console.log("Connection successful!")
      activeSql = sql
      break
    } catch (e) {
      console.error("Connection failed with message:", e.message)
    }
  }
  return activeSql
}

async function main() {
  const sql = await tryConnect()
  if (!sql) {
    console.error("Could not connect to database with available connection strings.")
    process.exit(1)
  }

  // Ensure table column exists
  try {
    await sql`ALTER TABLE leaders ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false`
  } catch (e) {
    console.log("Note on alter table:", e.message)
  }

  const emailsToSeed = [
    { email: superAdminEmail, name: "Super Admin", password: "AdminPassword123!" },
    { email: "leader@example.com", name: "Demo Leader", password: "LeaderPassword123!" },
  ]

  for (const item of emailsToSeed) {
    const passwordHash = hashPassword(item.password)
    const existing = await sql`SELECT * FROM leaders WHERE LOWER(email) = LOWER(${item.email})`

    if (existing.length > 0) {
      await sql`UPDATE leaders SET password_hash = ${passwordHash}, is_approved = true WHERE id = ${existing[0].id}`
      console.log(`UPDATED: Account for ${item.email} is approved. Password set to: ${item.password}`)
    } else {
      await sql`INSERT INTO leaders (name, email, password_hash, is_approved) VALUES (${item.name}, ${item.email}, ${passwordHash}, true)`
      console.log(`CREATED: Account for ${item.email} is approved. Password set to: ${item.password}`)
    }
  }
}

main().catch(err => {
  console.error("Fatal error:", err)
  process.exit(1)
})
