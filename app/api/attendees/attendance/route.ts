import { NextResponse } from "next/server"
import { recordAttendeeAttendance, getSession, getAttendeeById, getAttendeeCheckInStatus, optimizedRecordAttendeeAttendance } from "@/lib/db"
import { getSessionCookie } from "@/lib/cookies"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const sessionId = await getSessionCookie()
    const session = await getSession(sessionId!)
    if (!sessionId || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { attendeeId, attendanceType } = body

    if (!attendeeId) {
      return NextResponse.json({ error: "Attendee ID required" }, { status: 400 })
    }

    if (attendanceType !== "check_in") {
      return NextResponse.json({ error: "Only check_in is supported for attendees" }, { status: 400 })
    }

    // Record attendance using optimized function (checks existence and duplicates in one trip)
    const attendance = await optimizedRecordAttendeeAttendance(
      attendeeId,
      session.leader_id,
      "check_in"
    )

    if (!attendance) {
      // If it returns null, either attendee not found or already checked in
      // We can do a quick check to return the correct error message
      const attendee = await getAttendeeById(attendeeId)
      if (!attendee) {
        return NextResponse.json({ error: "Attendee not found" }, { status: 404 })
      }
      return NextResponse.json({ error: "Attendee is already checked in" }, { status: 409 })
    }

    // Send confirmation email via Resend if it's a check-in
    // if (attendanceType === "check_in" && attendee.email) {
    //   try {
    //     await resend.emails.send({
    //       from: "Volunteer Attendance <noreply@ivolunteer-cibf.org>",
    //       to: attendee.email,
    //       subject: `Check-in Confirmation - ${attendee.name}`,
    //       html: `
    //         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    //           <h2 style="color: #333;">Check-in Successful</h2>
    //           <p>Hi ${attendee.name},</p>
    //           <p>Your attendance has been successfully recorded.</p>
    //           
    //           <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
    //             <p style="margin: 0; font-size: 14px; color: #666;">Check-in Time:</p>
    //             <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #333;">${new Date().toLocaleString()}</p>
    //           </div>
    //           
    //           <p style="font-size: 14px; color: #666; margin-top: 20px;">
    //             Thank you for your participation.
    //           </p>
    //         </div>
    //       `,
    //     })
    //   } catch (emailError) {
    //     console.error("Failed to send confirmation email:", emailError)
    //     // We don't fail the check-in if the email fails
    //   }
    // }

    return NextResponse.json({
      success: true,
      attendance,
    })
  } catch (error) {
    console.error("Record attendance error:", error)
    return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 })
  }
}
