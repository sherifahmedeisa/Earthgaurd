import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function syncVolunteerIds() {
  console.log("Starting volunteer ID synchronization...")

  try {
    // Fetch all volunteers
    const volunteers = await sql("SELECT id, details FROM volunteers ORDER BY id")

    console.log(`Found ${volunteers.length} volunteers to process`)

    let updated = 0
    let skipped = 0
    let errors = 0

    for (const volunteer of volunteers) {
      try {
        const details = volunteer.details
        if (!details || !details.volunteer_id) {
          console.log(`[SKIP] Volunteer ID ${volunteer.id}: No volunteer_id in details`)
          skipped++
          continue
        }

        const targetId = Number.parseInt(details.volunteer_id, 10)
        if (volunteer.id !== targetId) {
          // Check if target ID already exists
          const existing = await sql("SELECT id FROM volunteers WHERE id = $1", [targetId])

          if (existing.length > 0) {
            console.log(`[ERROR] Target ID ${targetId} already exists. Cannot update ${volunteer.id}`)
            errors++
            continue
          }

          // Update volunteer ID
          await sql("UPDATE volunteers SET id = $1 WHERE id = $2", [targetId, volunteer.id])
          await sql("UPDATE attendance SET volunteer_id = $1 WHERE volunteer_id = $2", [targetId, volunteer.id])

          console.log(`[SUCCESS] Updated volunteer ${volunteer.id} -> ${targetId}`)
          updated++
        } else {
          console.log(`[OK] Volunteer ID ${volunteer.id} already matches volunteer_id`)
          skipped++
        }
      } catch (error) {
        console.log(`[ERROR] Processing volunteer ${volunteer.id}: ${error.message}`)
        errors++
      }
    }

    console.log("\n=== SYNC COMPLETE ===")
    console.log(`Updated: ${updated}`)
    console.log(`Already matched: ${skipped}`)
    console.log(`Errors: ${errors}`)
  } catch (error) {
    console.error("Fatal error:", error)
  }
}

syncVolunteerIds()
