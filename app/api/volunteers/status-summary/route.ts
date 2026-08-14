import { type NextRequest, NextResponse } from "next/server"
import { getTodayStatusSummary, getSession } from "@/lib/db"
import { getSessionCookie } from "@/lib/cookies"

export async function GET(request: NextRequest) {
  try {
    const sessionId = await getSessionCookie()
    if (!sessionId || !(await getSession(sessionId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dayType = searchParams.get("dayType") as "theta" | "delta" | null

    const summary = await getTodayStatusSummary(dayType || undefined)
    return NextResponse.json(summary)
  } catch (error) {
    console.error("Status summary error:", error)
    return NextResponse.json({ error: "Failed to get status summary" }, { status: 500 })
  }
}
