import { cookies } from "next/headers"
import { getSession as getSessionFromDb } from "@/lib/db"

const SESSION_COOKIE = "volunteer_app_session"

export async function setSessionCookie(sessionId: string) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })
}

export async function getSessionCookie() {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value
}

export async function getSession() {
  const sessionId = await getSessionCookie()
  if (!sessionId) return null

  const session = await getSessionFromDb(sessionId)
  return session
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}
