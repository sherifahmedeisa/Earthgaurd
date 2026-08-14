import { getTodayCheckInStats, getTodayCheckInStatsByType, getSession } from "@/lib/db"
import { getSessionCookie } from "@/lib/cookies"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const sessionId = await getSessionCookie()
    if (!sessionId || !(await getSession(sessionId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const volunteerType = searchParams.get("type") as "theta" | "delta" | null

    const stats = volunteerType ? await getTodayCheckInStatsByType(volunteerType) : await getTodayCheckInStats()

    return NextResponse.json({
      total_volunteers: stats?.total_volunteers || 0,
      checked_in_today: stats?.checked_in_today || 0,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
