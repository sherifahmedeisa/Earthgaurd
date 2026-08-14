import { type NextRequest, NextResponse } from "next/server"
import { getVolunteerByQrCode } from "@/lib/db"
import { getSession } from "@/lib/cookies"
import { getSessionCookie } from "@/lib/cookies"

export async function POST(request: NextRequest) {
  try {
    const sessionId = await getSessionCookie()
    if (!sessionId || !(await getSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { qrCode } = await request.json()

    if (!qrCode) {
      return NextResponse.json({ error: "QR code required" }, { status: 400 })
    }

    const volunteer = await getVolunteerByQrCode(qrCode)

    if (!volunteer) {
      return NextResponse.json({ error: "Volunteer not found" }, { status: 404 })
    }

    const hallNumber = volunteer.hall_number || volunteer.details?.hall_number || null

    return NextResponse.json({
      id: volunteer.id,
      name: volunteer.name,
      email: volunteer.email,
      phone: volunteer.phone,
      hall_number: hallNumber,
      volunteer_code: volunteer.volunteer_code,
      volunteer_type: volunteer.volunteer_type,
      is_best_volunteer: volunteer.is_best_volunteer,
    })
  } catch (error) {
    console.error("Get volunteer details error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: `Failed to get volunteer details: ${errorMessage}` }, { status: 500 })
  }
}
