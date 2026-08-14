import { NextResponse } from "next/server"
import { getSession } from "@/lib/cookies"
import { getVolunteers, markEmailSent } from "@/lib/db"
import { Resend } from "resend"
import QRCode from "qrcode"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all volunteers
    const volunteers = await getVolunteers()
    if (!volunteers || volunteers.length === 0) {
      return NextResponse.json({ error: "No volunteers found" }, { status: 404 })
    }

    const logoUrl = "https://earthsguards.com/wp-content/uploads/2025/04/updated26-11-2024%D8%AD%D9%85%D8%A7%D8%A9-%D8%A7%D9%84%D8%A7%D8%B1%D8%B6.png"
    const ministryLogoUrl = "https://sis.gov.eg/media/559219/%D9%88%D8%B2%D8%A7%D8%B1%D8%A9-%D8%A7%D9%84%D8%B4%D8%A8%D8%A7%D8%A8.jpg"

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    // Process in batches of 10 to avoid rate limits
    const batchSize = 10
    for (let i = 0; i < volunteers.length; i += batchSize) {
      const batch = volunteers.slice(i, i + batchSize)

      const emailPromises = batch.map(async (volunteer: any) => {
        if (!volunteer.email) {
          results.failed++
          results.errors.push(`${volunteer.name}: No email address`)
          return
        }

        const qrCode = volunteer.qr_code || volunteer.id
        const volunteerCode = volunteer.volunteer_code || volunteer.id
        const dayType = volunteer.volunteer_type === "theta" ? "Θ Theta (Day 1)" : "Δ Delta (Day 2)"

        try {
          const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(String(qrCode))}&size=300&margin=1`

          await resend.emails.send({
            from: "Earthsguard Event <noreply@ivolunteer-cibf.org>",
            to: volunteer.email,
            subject: "Your Volunteer QR Code - Save This Email",
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Your Volunteer QR Code</title>
              </head>
              <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0fdf4;">
                <div style="background-color: white; padding: 0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #d1fae5;">
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
                    <h1 style="color: #064e3b; text-align: center; margin-bottom: 10px; font-size: 24px;">Welcome, ${volunteer.name}!</h1>
                    <p style="color: #374151; text-align: center; margin-bottom: 30px;">Here is your personal QR code for volunteer attendance</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <div style="display: inline-block; background: white; padding: 15px; border: 2px solid #10b981; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 15px;">
                        <img src="${qrUrl}" alt="Your QR Code" style="width: 220px; height: 220px; display: block;" />
                      </div>
                      <div>
                        <a href="${qrUrl}" style="color: #059669; font-size: 14px; text-decoration: underline; font-weight: 600;">
                          View QR Code Online
                        </a>
                      </div>
                    </div>
                    
                    <div style="background-color: #ecfdf5; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #d1fae5;">
                      <h3 style="color: #064e3b; margin: 0 0 15px 0; font-size: 16px;">Your Details:</h3>
                      <p style="margin: 8px 0; color: #374151;"><strong>Name:</strong> ${volunteer.name}</p>
                      <p style="margin: 8px 0; color: #374151;"><strong>Volunteer Code:</strong> ${volunteerCode}</p>
                      <p style="margin: 8px 0; color: #374151;"><strong>Hall:</strong> ${volunteer.hall_number || "Not assigned"}</p>
                      <p style="margin: 8px 0; color: #374151;"><strong>Day Type:</strong> ${dayType}</p>
                    </div>
                    
                    <div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                      <p style="color: #92400e; margin: 0; font-size: 14px;"><strong>Important:</strong> Please save this email or screenshot your QR code. You will need to show it when checking in.</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 25px; border-top: 1px solid #e5e7eb;">
                      <p style="font-size: 16px; font-weight: 700; color: #064e3b; margin-bottom: 5px;">Earthsguard Event Team</p>
                      <p style="font-size: 12px; color: #6b7280;">This is an automated message. Please do not reply.</p>
                    </div>
                  </div>
                </div>
              </body>
            </html>`,
            attachments: [],
          })
          await markEmailSent(volunteer.id)
          results.success++
        } catch (error: any) {
          results.failed++
          results.errors.push(`${volunteer.name}: ${error.message || "Send failed"}`)
        }
      })

      await Promise.all(emailPromises)

      // Small delay between batches to respect rate limits
      if (i + batchSize < volunteers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return NextResponse.json({
      message: `Sent ${results.success} emails successfully, ${results.failed} failed`,
      ...results,
      total: volunteers.length
    })
  } catch (error: any) {
    console.error("Bulk QR send error:", error)
    return NextResponse.json({ error: error.message || "Failed to send emails" }, { status: 500 })
  }
}
