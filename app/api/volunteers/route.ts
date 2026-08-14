import { type NextRequest, NextResponse } from "next/server"
import { getAllVolunteers, createVolunteer, getVolunteersByFilter, getVolunteerCheckInStatus, getAllVolunteersNoFilter } from "@/lib/db"
import { getSession } from "@/lib/db"
import { getSessionCookie } from "@/lib/cookies"

export async function GET(request: NextRequest) {
  try {
    const sessionId = await getSessionCookie()
    if (!sessionId || !(await getSession(sessionId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const hall = searchParams.get("hall")
    const bestOnly = searchParams.get("bestOnly") === "true"
    const status = searchParams.get("status")
    const dayType = searchParams.get("dayType")
    const shift = searchParams.get("shift")

    // Check if any actual filter is applied (not just null or "null" strings)
    const hasFilters = 
      (search && search !== "null") || 
      (hall && hall !== "null") || 
      bestOnly || 
      (status && status !== "null") || 
      (dayType && dayType !== "null" && dayType !== "all") ||
      (shift && shift !== "null" && shift !== "all")

    let volunteers
    if (hasFilters) {
      // When filters are applied, use getVolunteerCheckInStatus to get status and hall info
      volunteers = await getVolunteerCheckInStatus()

      if (search && search !== "null") {
        volunteers = volunteers.filter(
          (v) =>
            v.volunteer_code?.toLowerCase().includes(search.toLowerCase()) ||
            v.name.toLowerCase().includes(search.toLowerCase()) ||
            v.email.toLowerCase().includes(search.toLowerCase()) ||
            v.id.toString().includes(search),
        )
      }
      if (hall && hall !== "" && hall !== "null") {
        // hall_number is stored as "Hall 1", "Hall 2", etc., so prepend "Hall " to the filter value
        const hallFilter = `Hall ${hall}`
        volunteers = volunteers.filter((v) => {
          const matches = v.hall_number === hallFilter
          return matches
        })
      }
      if (dayType && dayType !== "null" && dayType !== "all") {
        volunteers = volunteers.filter((v) => v.volunteer_type === dayType)
      }
      if (shift && shift !== "null" && shift !== "all") {
        volunteers = volunteers.filter((v) => v.shift === shift)
      }
      if (bestOnly) {
        const bestVolunteers = await getVolunteersByFilter(undefined, undefined, true)
        const bestIds = new Set(bestVolunteers.map((v) => v.id))
        volunteers = volunteers.filter((v) => bestIds.has(v.id))
      }
      if (status && status !== "null") {
        volunteers = volunteers.filter((v) => v.status === status)
      }
    } else {
      // Get all volunteers without filters
      volunteers = await getAllVolunteersNoFilter()
    }

    return NextResponse.json(volunteers)
  } catch (error) {
    console.error("Get volunteers error:", error)
    return NextResponse.json({ error: "Failed to get volunteers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = await getSessionCookie()
    if (!sessionId || !(await getSession(sessionId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, email, phone, volunteer_id, hall_number, details, is_best_volunteer, volunteer_type } =
      await request.json()

    if (!name || !email || !volunteer_id) {
      return NextResponse.json({ error: "Name, email, and volunteer ID required" }, { status: 400 })
    }

    const volunteerDetails = {
      ...details,
      volunteer_id,
    }

    try {
      const volunteer = await createVolunteer(
        name,
        email,
        phone,
        hall_number,
        volunteerDetails,
        volunteer_type || "theta",
        volunteer_id,
      )

      if (is_best_volunteer) {
        volunteer.is_best_volunteer = true
      }

      return NextResponse.json(volunteer)
    } catch (dbError: any) {
      if (dbError.message === "DUPLICATE_EMAIL") {
        return NextResponse.json({ error: "A volunteer with this email already exists" }, { status: 409 })
      }
      throw dbError
    }
  } catch (error) {
    console.error("Create volunteer error:", error)
    return NextResponse.json({ error: "Failed to create volunteer" }, { status: 500 })
  }
}
