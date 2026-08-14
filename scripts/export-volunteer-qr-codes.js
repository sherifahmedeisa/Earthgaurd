import { neon } from "@neondatabase/serverless"
import ExcelJS from "exceljs"
import QRCode from "qrcode"
import path from "path"

const sql = neon(process.env.DATABASE_URL)

async function exportVolunteerQRCodes() {
  try {
    console.log("[v0] Fetching all volunteers...")
    const volunteers = await sql("SELECT id, email, name FROM volunteers ORDER BY id")

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Volunteers")

    // Add headers
    worksheet.columns = [
      { header: "ID", key: "id", width: 8 },
      { header: "Email", key: "email", width: 35 },
      { header: "QR Code", key: "qr", width: 25 },
    ]

    // Style header row
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2563EB" },
    }
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }

    // Add volunteer data with QR codes
    console.log(`[v0] Generating QR codes for ${volunteers.length} volunteers...`)

    for (let i = 0; i < volunteers.length; i++) {
      const volunteer = volunteers[i]

      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(volunteer.id.toString(), {
        width: 200,
        margin: 1,
        color: { dark: "#000000", light: "#FFFFFF" },
      })

      // Convert data URL to buffer
      const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "")
      const imageBuffer = Buffer.from(base64Data, "base64")

      // Add image to workbook
      const imageId = workbook.addImage({
        buffer: imageBuffer,
        extension: "png",
      })

      // Add row
      const row = worksheet.addRow({
        id: volunteer.id,
        email: volunteer.email,
        qr: "", // QR code will be embedded as image
      })

      // Insert image in QR column
      worksheet.addImage(imageId, {
        tl: { col: 2, row: i + 1 },
        ext: { width: 150, height: 150 },
      })

      // Set row height to accommodate image
      row.height = 150

      if ((i + 1) % 50 === 0) {
        console.log(`[v0] Processed ${i + 1}/${volunteers.length} volunteers...`)
      }
    }

    // Save file
    const timestamp = new Date().toISOString().split("T")[0]
    const filename = `volunteer-emails-qr-${timestamp}.xlsx`
    const filepath = path.join(process.cwd(), filename)

    await workbook.xlsx.writeFile(filepath)
    console.log(`[v0] ✓ Excel file created: ${filename}`)
    console.log(`[v0] Total volunteers exported: ${volunteers.length}`)
  } catch (error) {
    console.error("[v0] Error:", error.message)
    process.exit(1)
  }
}

exportVolunteerQRCodes()
