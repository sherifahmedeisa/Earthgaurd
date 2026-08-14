import { NextResponse } from "next/server"
import { getAllAttendees, createAttendee, getSession } from "@/lib/db"
import { getSessionCookie } from "@/lib/cookies"

export async function GET() {
  try {
    const sessionId = await getSessionCookie()
    if (!sessionId || !(await getSession(sessionId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const attendees = await getAllAttendees()
    return NextResponse.json(attendees)
  } catch (error) {
    console.error("Error fetching attendees:", error)
    return NextResponse.json({ error: "Failed to fetch attendees" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const sessionId = await getSessionCookie()
    if (!sessionId || !(await getSession(sessionId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, attendee_code } = body

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    const newAttendee = await createAttendee(
      name,
      email,
      phone,
      attendee_code || `A-${Math.floor(1000 + Math.random() * 9000)}`
    )

    return NextResponse.json(newAttendee)
  } catch (error: any) {
    console.error("Error creating attendee:", error)
    if (error.message === "DUPLICATE_EMAIL") {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create attendee" }, { status: 500 })
  }
}
