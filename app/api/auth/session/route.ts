import { type NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "@/lib/cookies"
import { getSession } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const sessionId = await getSessionCookie()
    if (!sessionId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const session = await getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 })
    }

    return NextResponse.json({ leaderId: session.leader_id, sessionId })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ error: "Session check failed" }, { status: 500 })
  }
}
