import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSessionCookie } from "@/lib/cookies"

export async function GET(request: Request) {
  try {
    const sessionId = await getSessionCookie()
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const totalAttendeesResult = await sql`SELECT COUNT(*) as count FROM attendees WHERE is_active = true`
    
    // Get unique attendees checked in today
    const checkedInResult = await sql`
      SELECT COUNT(DISTINCT attendee_id) as count 
      FROM attendee_attendance 
      WHERE DATE(check_in_time) = CURRENT_DATE 
      AND attendance_type = 'check_in'
    `

    return NextResponse.json({
      total_attendees: Number(totalAttendeesResult[0].count),
      checked_in_today: Number(checkedInResult[0].count),
    })
  } catch (error) {
    console.error("Fetch attendee stats error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
