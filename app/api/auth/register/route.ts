import { type NextRequest, NextResponse } from "next/server"
import { createLeader, getLeaderByEmail } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { createSession } from "@/lib/db"
import { setSessionCookie } from "@/lib/cookies"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 })
    }

    // Check if leader exists
    const existing = await getLeaderByEmail(email)
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    // Create leader
    const passwordHash = hashPassword(password)
    const leader = await createLeader(name, email, passwordHash)

    return NextResponse.json({ 
      success: true, 
      message: "Account created successfully. Please wait for an administrator to approve your request before logging in." 
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
