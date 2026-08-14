import { type NextRequest, NextResponse } from "next/server"
import { clearAllAttendance, getSession } from "@/lib/db"
import { getSessionCookie } from "@/lib/cookies"

export async function DELETE(request: NextRequest) {
  try {
    const sessionId = await getSessionCookie()
    const session = await getSession(sessionId!)
    if (!sessionId || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only allow admin/leader to clear attendance
    await clearAllAttendance()

    return NextResponse.json({
      success: true,
      message: "All attendance records cleared",
    })
  } catch (error) {
    console.error("Clear attendance error:", error)
    return NextResponse.json({ error: "Failed to clear attendance" }, { status: 500 })
  }
}
