import { type NextRequest, NextResponse } from "next/server"
import { getLeaderByEmail } from "@/lib/db"
import { verifyPassword } from "@/lib/auth"
import { createSession } from "@/lib/db"
import { setSessionCookie } from "@/lib/cookies"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const leader = await getLeaderByEmail(email)
    if (!leader || !verifyPassword(password, leader.password_hash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    if (!leader.is_approved) {
      return NextResponse.json({ error: "Your account is pending approval by an administrator." }, { status: 403 })
    }

    // Create session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const sessionId = await createSession(leader.id, expiresAt)

    // Set cookie
    await setSessionCookie(sessionId)

    return NextResponse.json({ success: true, leaderId: leader.id })
  } catch (error) {
    console.error("Login error:", error)
    const message = error instanceof Error ? error.message : "Login failed"
    return NextResponse.json({ error: message.includes("password authentication failed") || message.includes("NeonDbError") ? "Database connection error. Please check your DATABASE_URL in .env." : message }, { status: 500 })
  }
}
