import { getDayType } from "@/lib/db"

export async function GET() {
  try {
    const dayType = await getDayType()
    return Response.json({ dayType })
  } catch (error) {
    return Response.json({ error: "Failed to get current day type" }, { status: 500 })
  }
}
