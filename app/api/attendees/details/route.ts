import { NextResponse } from "next/server"
import { getSessionCookie } from "@/lib/cookies"
import { getAttendeeByQrCode, getAttendeeCheckInStatus } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const sessionId = await getSessionCookie()
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ error: "Code parameter is required" }, { status: 400 })
    }

    const attendee = await getAttendeeByQrCode(code)

    if (!attendee) {
      return NextResponse.json({ error: "Attendee not found" }, { status: 404 })
    }

    const attendeeStatus = await getAttendeeCheckInStatus(attendee.id)
    
    if (attendeeStatus && attendeeStatus.length > 0) {
      return NextResponse.json(attendeeStatus[0])
    }

    return NextResponse.json({ ...attendee, status: "not_checked" })
  } catch (error) {
    console.error("Get attendee details error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
