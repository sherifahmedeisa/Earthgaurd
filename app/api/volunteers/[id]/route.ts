import { type NextRequest, NextResponse } from "next/server"
import { updateVolunteer } from "@/lib/db"
import { getSession } from "@/lib/db"
import { getSessionCookie } from "@/lib/cookies"
import { neon } from "@neondatabase/serverless"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionId = await getSessionCookie()
    if (!sessionId || !(await getSession(sessionId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, email, phone, hall_number, is_best_volunteer, english_name, volunteer_code, volunteer_type } = await request.json()
    const { id } = await params
    const volunteerId = Number.parseInt(id)

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email required" }, { status: 400 })
    }

    const volunteer = await updateVolunteer(volunteerId, {
      name,
      english_name: english_name || null,
      email,
      phone: phone || null,
      hall_number: hall_number || null,
      volunteer_code: volunteer_code || null,
      volunteer_type: volunteer_type || null,
    } as any)

    if (is_best_volunteer !== undefined) {
      const sql = neon(process.env.DATABASE_URL!)
      await sql.query("UPDATE volunteers SET is_best_volunteer = $1 WHERE id = $2", [is_best_volunteer, volunteerId])
      volunteer.is_best_volunteer = is_best_volunteer
    }

    return NextResponse.json(volunteer)
  } catch (error) {
    console.error("Update volunteer error:", error)
    return NextResponse.json({ error: "Failed to update volunteer" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionId = await getSessionCookie()
    if (!sessionId || !(await getSession(sessionId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const volunteerId = Number.parseInt(id)
    const sql = neon(process.env.DATABASE_URL!)

    // Delete attendance records first (foreign key constraint)
    await sql.query("DELETE FROM attendance WHERE volunteer_id = $1", [volunteerId])

    // Delete the volunteer
    await sql.query("DELETE FROM volunteers WHERE id = $1", [volunteerId])

    return NextResponse.json({ success: true, message: "Volunteer deleted successfully" })
  } catch (error) {
    console.error("Delete volunteer error:", error)
    return NextResponse.json({ error: "Failed to delete volunteer" }, { status: 500 })
  }
}
