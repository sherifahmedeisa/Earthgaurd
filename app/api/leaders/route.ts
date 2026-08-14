import { type NextRequest, NextResponse } from "next/server"
import { getSession, getLeaders } from "@/lib/db"
import { getSessionCookie } from "@/lib/cookies"

export async function GET(request: NextRequest) {
  try {
    const sessionId = await getSessionCookie()
    if (!sessionId || !(await getSession(sessionId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const leaders = await getLeaders()

    return NextResponse.json(leaders)
  } catch (error) {
    console.error("Get leaders error:", error)
    return NextResponse.json({ error: "Failed to get leaders" }, { status: 500 })
  }
}
