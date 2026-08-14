import { type NextRequest, NextResponse } from "next/server"
import { clearSessionCookie, getSessionCookie } from "@/lib/cookies"
import { deleteSession } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const sessionId = await getSessionCookie()
    if (sessionId) {
      await deleteSession(sessionId)
    }
    await clearSessionCookie()
    return NextResponse.redirect(new URL("/", request.url))
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
