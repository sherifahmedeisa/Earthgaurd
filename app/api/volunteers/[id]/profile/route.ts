import { type NextRequest, NextResponse } from "next/server"
import { getVolunteerProfile, getVolunteerAttendanceHistory, getSession, getVolunteerDailyStats } from "@/lib/db"
import { getSessionCookie } from "@/lib/cookies"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionId = await getSessionCookie()
    if (!sessionId || !(await getSession(sessionId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const volunteerId = Number.parseInt(id)
    if (isNaN(volunteerId)) {
      return NextResponse.json({ error: "Invalid volunteer ID" }, { status: 400 })
    }

    const profile = await getVolunteerProfile(volunteerId)

    if (!profile) {
      return NextResponse.json({ error: "Volunteer not found" }, { status: 404 })
    }

    const attendanceResult = await getVolunteerAttendanceHistory(volunteerId, 100)
    const attendance = Array.isArray(attendanceResult) ? attendanceResult : []

    const dailyStatsResult = await getVolunteerDailyStats(volunteerId)
    const dailyStats = Array.isArray(dailyStatsResult) ? dailyStatsResult : []

    return NextResponse.json({
      profile,
      attendance,
      dailyStats,
    })
  } catch (error) {
    console.error("Get volunteer profile error:", error)
    return NextResponse.json(
      { error: "Failed to get volunteer profile", details: (error as Error).message },
      { status: 500 },
    )
  }
}
