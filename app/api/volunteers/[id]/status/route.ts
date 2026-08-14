import { getVolunteerCheckInStatus } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const volunteerId = Number.parseInt(id, 10)

    if (!volunteerId || isNaN(volunteerId)) {
      return NextResponse.json({ error: "Invalid volunteer ID" }, { status: 400 })
    }

    // Get volunteer's current status for today
    const statusData = await getVolunteerCheckInStatus(volunteerId)

    if (!statusData || statusData.length === 0) {
      return NextResponse.json({ status: "not_checked" }, { status: 200 })
    }

    return NextResponse.json({ status: statusData[0].status }, { status: 200 })
  } catch (error) {
    console.error("Error fetching volunteer status:", error)
    return NextResponse.json({ error: "Failed to fetch volunteer status" }, { status: 500 })
  }
}
