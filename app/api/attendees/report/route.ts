import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSessionCookie } from "@/lib/cookies"

export async function GET(request: Request) {
  try {
    const sessionId = await getSessionCookie()
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const leaderId = searchParams.get("leaderId")
    const status = searchParams.get("status")
    const format = searchParams.get("format")

    let query = `
      SELECT 
        aa.id,
        aa.attendee_id,
        a.name,
        a.email,
        a.phone,
        a.attendee_code,
        aa.check_in_time,
        aa.attendance_type,
        l.name as leader_name
      FROM attendee_attendance aa
      JOIN attendees a ON aa.attendee_id = a.id
      LEFT JOIN leaders l ON aa.leader_id = l.id
      WHERE 1=1
    `
    const queryParams: any[] = []
    let paramIndex = 1

    if (startDate) {
      query += ` AND aa.check_in_time >= $${paramIndex}::timestamp`
      queryParams.push(`${startDate} 00:00:00`)
      paramIndex++
    }
    
    if (endDate) {
      query += ` AND aa.check_in_time <= $${paramIndex}::timestamp`
      queryParams.push(`${endDate} 23:59:59`)
      paramIndex++
    }

    if (leaderId) {
      query += ` AND aa.leader_id = $${paramIndex}::integer`
      queryParams.push(parseInt(leaderId))
      paramIndex++
    }

    if (status) {
      query += ` AND aa.attendance_type = $${paramIndex}`
      queryParams.push(status)
      paramIndex++
    }

    query += ` ORDER BY aa.check_in_time DESC`

    const records = await sql.query(query, queryParams)

    if (format === "csv") {
      const headers = ["Attendee", "ID", "Check-in Time", "Status", "Leader"]
      const csvContent = [
        headers.join(","),
        ...records.map((r: any) =>
          [
            `"${r.name}"`,
            `"${r.attendee_code || r.attendee_id}"`,
            `"${new Date(r.check_in_time).toLocaleString()}"`,
            `"${r.attendance_type}"`,
            `"${r.leader_name || "-"}"`,
          ].join(","),
        ),
      ].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="attendee-report.csv"`,
        },
      })
    }

    return NextResponse.json(records)
  } catch (error) {
    console.error("Fetch attendee report error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch report" }, 
      { status: 500 }
    )
  }
}
