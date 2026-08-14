import { getAllVolunteers } from "@/lib/db"
import { NextResponse } from "next/server"
import ExcelJS from "exceljs"
import QRCode from "qrcode"

export async function GET() {
  try {
    const volunteers = await getAllVolunteers()

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Volunteer QR Codes")

    // Add headers
    worksheet.columns = [
      { header: "Email", key: "email", width: 30 },
      { header: "Volunteer Code", key: "volunteerCode", width: 15 },
      { header: "QR Code", key: "qrCode", width: 25 },
    ]

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E40AF" },
    }

    for (const volunteer of volunteers) {
      const qrCodeDataUrl = await QRCode.toDataURL(volunteer.qr_code, {
        width: 200,
        margin: 2,
      })

      // Extract base64 data
      const base64Data = qrCodeDataUrl.split(",")[1]

      // Add row with email and volunteer code
      const row = worksheet.addRow({
        email: volunteer.email,
        volunteerCode: volunteer.volunteer_code || volunteer.id,
      })

      // Add QR code image to cell
      const imageId = workbook.addImage({
        buffer: Buffer.from(base64Data, "base64") as any,
        extension: "png",
      })

      worksheet.addImage(imageId, {
        tl: { col: 2, row: row.number - 1 },
        ext: { width: 150, height: 150 },
      })

      // Set row height for QR code
      row.height = 150
    }

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="volunteer-emails-qr-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("[v0] Error exporting QR codes:", error)
    return NextResponse.json({ error: "Failed to export QR codes" }, { status: 500 })
  }
}
