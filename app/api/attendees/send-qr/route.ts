import { NextResponse } from "next/server"
import { getSessionCookie } from "@/lib/cookies"
import { markAttendeeEmailSent } from "@/lib/db"
import { Resend } from "resend"
import QRCode from "qrcode"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const sessionId = await getSessionCookie()
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { attendeeId, email, name, qrCode, code } = body

    if (!attendeeId || !email || !name || !qrCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const qrCodeValue = code || qrCode
    const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(qrCodeValue)}&size=300&margin=1`

    const logoUrl = "https://earthsguards.com/wp-content/uploads/2025/04/updated26-11-2024%D8%AD%D9%85%D8%A7%D8%A9-%D8%A7%D9%84%D8%A7%D8%B1%D8%B6.png"
    const ministryLogoUrl = "https://sis.gov.eg/media/559219/%D9%88%D8%B2%D8%A7%D8%B1%D8%A9-%D8%A7%D9%84%D8%B4%D8%A8%D8%A7%D8%A8.jpg"

    const { data, error } = await resend.emails.send({
      from: "Earthsguard Event <noreply@ivolunteer-cibf.org>",
      to: [email],
      subject: `Your Attendee QR Code - ${name}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0fdf4;">
          <div style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #d1fae5;">
            <!-- Top Accent Bar -->
            <div style="height: 6px; background: linear-gradient(90deg, #064e3b 0%, #10b981 100%);"></div>

            <!-- Header with Logos -->
            <div style="background-color: #ffffff; padding: 25px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <div style="display: inline-block; vertical-align: middle;">
                <img src="${logoUrl}" alt="Earthsguard" style="height: 70px; display: block;" />
              </div>
              <div style="display: inline-block; vertical-align: middle; width: 1px; height: 40px; background-color: #e5e7eb; margin: 0 25px;"></div>
              <div style="display: inline-block; vertical-align: middle;">
                <img src="${ministryLogoUrl}" alt="Ministry of Youth" style="height: 70px; display: block; border-radius: 4px;" />
              </div>
            </div>
            
            <div style="padding: 30px;">
              <h2 style="color: #064e3b; text-align: center; margin-top: 0; font-size: 24px;">Welcome to the Event!</h2>
              <p style="text-align: center; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi <strong>${name}</strong>, thank you for joining us. Here is your official QR code for check-in.
              </p>
              
              <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px dashed #10b981; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                <p style="margin: 0 0 15px 0; font-size: 14px; color: #065f46; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">
                  Attendee Identification
                </p>
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; color: #064e3b; letter-spacing: 0.15em; margin-bottom: 25px;">
                  ${code || qrCode}
                </div>
                
                <div style="display: inline-block; background: white; padding: 15px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 15px;">
                  <img src="${qrUrl}" alt="QR Code" style="width: 220px; height: 220px; display: block;" />
                </div>
                
                <div style="margin-top: 10px;">
                  <a href="${qrUrl}" style="color: #059669; font-size: 14px; text-decoration: underline; font-weight: 600;">
                    Click here if QR code doesn't load
                  </a>
                </div>
                
                <p style="margin: 20px 0 0 0; font-size: 14px; color: #065f46; font-weight: 500;">
                  Please have this QR code ready on your phone upon arrival.
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 25px; border-top: 1px solid #e5e7eb;">
                <p style="font-size: 16px; font-weight: 700; color: #064e3b; margin-bottom: 5px;">Earthsguard Event Team</p>
                <p style="font-size: 13px; color: #6b7280;">Youth & Sports Development Program</p>
              </div>
            </div>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #065f46; font-size: 12px;">
            <p>© 2026 Earthsguard. All rights reserved.</p>
          </div>
        </div>
      `,
      attachments: [],
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Mark as sent in the database
    await markAttendeeEmailSent(attendeeId)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Send QR error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
