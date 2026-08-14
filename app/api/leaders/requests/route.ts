import { NextResponse } from "next/server"
import { getUnapprovedLeaders, getSession, getLeaderRole, sql } from "@/lib/db"
import { getSessionCookie } from "@/lib/cookies"

export async function GET() {
  try {
    const sessionId = await getSessionCookie()
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const role = await getLeaderRole(session.leader_id)
    if (role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Auto-migration check: ensure is_approved column exists
    try {
      await sql`ALTER TABLE leaders ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false`
      // Also auto-approve super admins
      const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase()
      if (superAdminEmail) {
        await sql`UPDATE leaders SET is_approved = true WHERE email = ${superAdminEmail}`
      }
    } catch (migrateError) {
      console.warn("Auto-migration skipped or failed:", migrateError)
    }

    const requests = await getUnapprovedLeaders()
    return NextResponse.json(requests)
  } catch (error) {
    console.error("Error fetching leader requests:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
