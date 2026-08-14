import { NextResponse } from "next/server"
import { approveLeader, rejectLeader, getSession, getLeaderRole } from "@/lib/db"
import { getSessionCookie } from "@/lib/cookies"

export async function POST(request: Request) {
  try {
    const sessionId = await getSessionCookie()
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const role = await getLeaderRole(session.leader_id)
    if (role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { leaderId, action } = await request.json()

    if (!leaderId) {
      return NextResponse.json({ error: "Leader ID is required" }, { status: 400 })
    }

    if (action === "approve") {
      await approveLeader(leaderId)
      return NextResponse.json({ success: true, message: "Leader approved" })
    } else if (action === "reject") {
      await rejectLeader(leaderId)
      return NextResponse.json({ success: true, message: "Leader request rejected" })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error managing leader request:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
