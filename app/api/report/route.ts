import { type NextRequest, NextResponse } from "next/server"
import { getAttendanceReport, getAttendanceReportByLeader, getAttendanceByType, getSession } from "@/lib/db"
import { getSessionCookie } from "@/lib/cookies"

export async function GET(request: NextRequest) {
  try {
    const sessionId = await getSessionCookie()
    if (!sessionId || !(await getSession(sessionId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const leaderId = searchParams.get("leaderId")
    const format = searchParams.get("format")
    const bestOnly = searchParams.get("bestOnly") === "true"
    const status = searchParams.get("status")
    const hall = searchParams.get("hall")
    const volunteerType = searchParams.get("type") as "theta" | "delta" | null

    let data
    if (volunteerType) {
      data = await getAttendanceByType(
        volunteerType,
        startDate || undefined,
        endDate || undefined,
        bestOnly,
        status || undefined,
        hall || undefined,
        leaderId ? Number.parseInt(leaderId) : undefined,
      )
    } else if (leaderId) {
      data = await getAttendanceReportByLeader(
        Number.parseInt(leaderId),
        startDate || undefined,
        endDate || undefined,
        bestOnly,
        status || undefined,
        hall || undefined,
      )
    } else {
      data = await getAttendanceReport(
        startDate || undefined,
        endDate || undefined,
        bestOnly,
        status || undefined,
        hall || undefined,
      )
    }

    if (format === "csv") {
      const headers = [
        "Attendance ID",
        "Volunteer Code",
        "Volunteer Name",
        "Email",
        "Hall Number",
        "Volunteer Type",
        "Check-in Time",
        "Status",
        "Best Volunteer",
        "Extra Day",
        "Comments",
        "Leader Name",
      ]
      const csv = [
        headers.join(","),
        ...data.map((row: any) =>
          [
            row.id,
            row.volunteer_code || row.volunteer_id || "",
            `"${row.name}"`,
            `"${row.email}"`,
            row.hall_number || "",
            row.volunteer_type || "—",
            row.check_in_time,
            row.attendance_type || row.status || "—",
            row.is_best_volunteer || row.is_best_volunteer_marked ? "Yes" : "No",
            row.is_extra_day ? "Yes" : "No",
            `"${(row.notes || "").replace(/"/g, '""')}"`,
            `"${(row.leader_name || "").replace(/"/g, '""')}"`,
          ].join(","),
        ),
      ].join("\n")

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=attendance-report.csv",
        },
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Get report error:", error)
    return NextResponse.json({ error: "Failed to get report" }, { status: 500 })
  }
}
