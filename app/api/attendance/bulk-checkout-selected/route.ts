import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/db"
import { getSessionCookie } from "@/lib/cookies"
import { neon } from "@neondatabase/serverless"

export async function POST(request: NextRequest) {
  try {
    const sessionId = await getSessionCookie()
    const session = await getSession(sessionId!)
    if (!sessionId || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { volunteerIds } = await request.json()

    if (!Array.isArray(volunteerIds) || volunteerIds.length === 0) {
      return NextResponse.json(
        { error: "No volunteers selected" },
        { status: 400 },
      )
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Get volunteer details for batch checkout
    const volunteers = await sql`
      SELECT v.id, v.volunteer_type, v.volunteer_code
      FROM volunteers v
      WHERE v.id = ANY(${volunteerIds})
    `

    if (volunteers.length === 0) {
      return NextResponse.json(
        { error: "No volunteers found" },
        { status: 404 },
      )
    }

    const [data, setData] = useState<ApiResponse | null>(null);

    // Process each checkout one by one to avoid rate limiting and SQL issues
    for (const volunteer of volunteers) {
      try {
        const insertedRecords = await sql`
          INSERT INTO attendance (volunteer_id, leader_id, attendance_type, check_in_time, notes, is_best_volunteer_marked, is_extra_day, volunteer_type, volunteer_code)
          VALUES (${volunteer.id}, ${session.leader_id}, ${"check_out"}, ${new Date()}, ${null}, ${false}, ${false}, ${volunteer.volunteer_type}, ${volunteer.volunteer_code})
          RETURNING volunteer_id, check_in_time
        `

        if (insertedRecords.length > 0) {
          results.push({
            volunteerId: volunteer.id,
            success: true,
            checkOutTime: insertedRecords[0].check_in_time,
          })
        }
      } catch (error) {
        console.error(`[v0] Error checking out volunteer ${volunteer.id}:`, error)
        results.push({
          volunteerId: volunteer.id,
          success: false,
          error: "Failed to checkout",
        })
      }
    }

    const successCount = results.filter((r) => r.success).length

    return NextResponse.json({
      success: true,
      message: `Checked out ${successCount} volunteer(s)`,
      processed: successCount,
      total: volunteerIds.length,
      volunteers: results,
    })
  } catch (error) {
    console.error("[v0] Error in bulk checkout:", error)
    return NextResponse.json(
      { error: "Failed to process bulk checkout", details: String(error) },
      { status: 500 },
    )
  }
}
