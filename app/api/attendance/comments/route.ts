import { type NextRequest, NextResponse } from "next/server"
import { updateAttendanceComments, getSession } from "@/lib/db"
import { getSessionCookie } from "@/lib/cookies"

export async function POST(request: NextRequest) {
  try {
    const sessionId = await getSessionCookie()
    if (!sessionId || !(await getSession(sessionId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { attendanceId, comments } = await request.json()

    if (!attendanceId) {
      return NextResponse.json({ error: "Attendance ID required" }, { status: 400 })
    }

    const updated = await updateAttendanceComments(attendanceId, comments || "")

    return NextResponse.json({
      success: true,
      attendance: updated,
    })
  } catch (error) {
    console.error("Update comments error:", error)
    return NextResponse.json({ error: "Failed to update comments" }, { status: 500 })
  }
}
