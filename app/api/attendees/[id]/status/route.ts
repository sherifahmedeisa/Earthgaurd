import { NextResponse } from "next/server"
import { getSessionCookie } from "@/lib/cookies"
import { getAttendeeCheckInStatus } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionId = await getSessionCookie()
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const attendeeId = parseInt(id, 10)
    if (isNaN(attendeeId)) {
      return NextResponse.json({ error: "Invalid attendee ID" }, { status: 400 })
    }

    const statusResult = await getAttendeeCheckInStatus(attendeeId)
    
    if (!statusResult || statusResult.length === 0) {
      return NextResponse.json({ error: "Attendee not found" }, { status: 404 })
    }

    return NextResponse.json(statusResult[0])
  } catch (error) {
    console.error("Get attendee status error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
