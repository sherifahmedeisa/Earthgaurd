import { neon } from "@neondatabase/serverless"
import ExcelJS from "exceljs"

const sql = neon(process.env.DATABASE_URL)

async function exportVolunteerEmails() {
  try {
    console.log("[v0] Fetching all volunteers...")

    // Query all volunteers with ID and email
    const volunteers = await sql("SELECT id, name, email FROM volunteers ORDER BY id ASC")

    console.log(`[v0] Found ${volunteers.length} volunteers`)

    // Create a new workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Volunteer Emails")

    // Add headers
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Name", key: "name", width: 30 },
      { header: "Email", key: "email", width: 35 },
    ]

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0066CC" },
    }
    worksheet.getRow(1).alignment = { horizontal: "center", vertical: "center" }

    // Add volunteer data
    volunteers.forEach((volunteer) => {
      worksheet.addRow({
        id: volunteer.id,
        name: volunteer.name,
        email: volunteer.email,
      })
    })

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      let maxLength = 0
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const cellLength = cell.value ? cell.value.toString().length : 0
        if (cellLength > maxLength) {
          maxLength = cellLength
        }
      })
      column.width = Math.min(maxLength + 2, 50)
    })

    // Save to file
    const fileName = `volunteer-emails-${new Date().toISOString().split("T")[0]}.xlsx`
    await workbook.xlsx.writeFile(fileName)

    console.log(`[v0] Excel file created: ${fileName}`)
    console.log(`[v0] Total volunteers exported: ${volunteers.length}`)
  } catch (error) {
    console.error("[v0] Error exporting volunteers:", error.message)
    process.exit(1)
  }
}

exportVolunteerEmails()
