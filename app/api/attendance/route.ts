import { type NextRequest, NextResponse } from "next/server"
import { recordAttendanceWithType, getSession, checkTodayAttendance, getVolunteerById, optimizedRecordVolunteerAttendance } from "@/lib/db"
import { getSessionCookie } from "@/lib/cookies"
import { neon } from "@neondatabase/serverless"

function getDayType(): "theta" | "delta" {
  const today = new Date()
  const dayOfMonth = today.getDate()
  return dayOfMonth % 2 === 1 ? "delta" : "theta"
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = await getSessionCookie()
    if (!sessionId || !(await getSession(sessionId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = neon(process.env.DATABASE_URL!)
    const records = await sql`
      SELECT 
        a.id,
        a.volunteer_id,
        v.name as volunteer_name,
        v.volunteer_code,
        a.leader_id,
        l.username as leader_name,
        a.attendance_type,
        a.check_in_time,
        a.check_out_time,
        a.notes
      FROM attendance a
      JOIN volunteers v ON a.volunteer_id = v.id
      LEFT JOIN leaders l ON a.leader_id = l.id
      ORDER BY a.check_in_time DESC
    `

    return NextResponse.json(records)
  } catch (error) {
    console.error("Error fetching attendance records:", error)
    return NextResponse.json({ error: "Failed to fetch attendance records" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = await getSessionCookie()
    const session = await getSession(sessionId!)
    if (!sessionId || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { volunteerId, attendanceType, comments, isBestVolunteer } = await request.json()

    if (!volunteerId) {
      return NextResponse.json({ error: "Volunteer ID required" }, { status: 400 })
    }

    if (!["check_in", "check_out", "midday_exit"].includes(attendanceType)) {
      return NextResponse.json({ error: "Invalid attendance type" }, { status: 400 })
    }

    const todayDayType = getDayType()

    // Optimized: Combine existencia check, duplicate check, and record insertion into one DB trip
    const attendance = await optimizedRecordVolunteerAttendance(
      volunteerId,
      session.leader_id,
      attendanceType,
      comments || null,
      isBestVolunteer || false,
      todayDayType
    )

    if (!attendance && attendanceType === "check_in") {
      // Handle the case where they are already checked in or not found
      const alreadyCheckedIn = await checkTodayAttendance(volunteerId)
      if (alreadyCheckedIn) {
        return NextResponse.json({ error: "Volunteer already checked in today", alreadyCheckedIn: true }, { status: 409 })
      }

      const volunteer = await getVolunteerById(volunteerId)
      if (!volunteer) {
        return NextResponse.json({ error: "Volunteer not found" }, { status: 404 })
      }
    }

    // Determine extra day status for response (if we have attendance)
    const isExtraDay = attendance ? attendance.is_extra_day : false

    return NextResponse.json({
      success: true,
      attendance,
      dayType: todayDayType,
      isExtraDay,
    })
  } catch (error) {
    console.error("Record attendance error:", error)
    return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 })
  }
}
