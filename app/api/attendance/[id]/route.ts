import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/db"
import { getSessionCookie } from "@/lib/cookies"
import { neon } from "@neondatabase/serverless"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionId = await getSessionCookie()
    if (!sessionId || !(await getSession(sessionId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const recordId = Number.parseInt(id)
    const sql = neon(process.env.DATABASE_URL!)

    // Delete the attendance record
    const result = await sql.query("DELETE FROM attendance WHERE id = $1 RETURNING id", [recordId])

    if (result.length === 0) {
      return NextResponse.json({ error: "Attendance record not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Attendance record deleted successfully" })
  } catch (error) {
    console.error("Delete attendance record error:", error)
    return NextResponse.json({ error: "Failed to delete attendance record" }, { status: 500 })
  }
}
