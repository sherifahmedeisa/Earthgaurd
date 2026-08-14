import { Resend } from "resend"
import { getSession } from "@/lib/cookies"
import QRCode from "qrcode"
import { markEmailSent } from "@/lib/db"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { volunteerId, email, name, code } = await request.json()

    if (!email || !name || !code) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const qrCodeValue = String(code)
    const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(qrCodeValue)}&size=300&margin=1`

    const logoUrl = "https://earthsguards.com/wp-content/uploads/2025/04/updated26-11-2024%D8%AD%D9%85%D8%A7%D8%A9-%D8%A7%D9%84%D8%A7%D8%B1%D8%B6.png"
    const ministryLogoUrl = "https://sis.gov.eg/media/559219/%D9%88%D8%B2%D8%A7%D8%B1%D8%A9-%D8%A7%D9%84%D8%B4%D8%A8%D8%A7%D8%A8.jpg"

    const result = await resend.emails.send({
      from: "Earthsguard Event <noreply@ivolunteer-cibf.org>",
      to: email,
      subject: `Your Volunteer QR Code - ${name}`,
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
              <h2 style="color: #064e3b; text-align: center; margin-top: 0; font-size: 24px;">Volunteer Check-in</h2>
              <p style="text-align: center; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi <strong>${name}</strong>, thank you for volunteering with us! Please present your QR code to a leader when you arrive.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; background: white; padding: 15px; border: 2px solid #10b981; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 15px;">
                  <img src="${qrUrl}" alt="QR Code" style="width: 220px; height: 220px; display: block;" />
                </div>
                <div>
                  <a href="${qrUrl}" style="color: #059669; font-size: 14px; text-decoration: underline; font-weight: 600;">
                    Click here to view QR code online
                  </a>
                </div>
              </div>
              
              <div style="background-color: #ecfdf5; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; border: 1px solid #d1fae5;">
                <p style="margin: 0; font-size: 14px; color: #065f46; font-weight: 700; text-transform: uppercase;">Volunteer Code:</p>
                <p style="margin: 5px 0; font-size: 28px; font-weight: 800; font-family: monospace; color: #064e3b;">${code}</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 25px; border-top: 1px solid #e5e7eb;">
                <p style="font-size: 16px; font-weight: 700; color: #064e3b; margin-bottom: 5px;">Earthsguard Event Team</p>
                <p style="font-size: 12px; color: #6b7280;">© 2026 Earthsguard Event</p>
              </div>
            </div>
          </div>
        </div>
      `,
      attachments: [],
    })

    if (result.error) {
      return Response.json({ error: "Failed to send email", details: result.error }, { status: 500 })
    }

    // Mark email as sent in database
    await markEmailSent(volunteerId)

    return Response.json({
      success: true,
      email: result.data?.id,
    })
  } catch (error: any) {
    console.error("Send QR error:", error)
    return Response.json({ error: error.message || "Failed to send QR code" }, { status: 500 })
  }
}
