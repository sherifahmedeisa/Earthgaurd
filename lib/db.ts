import { neon } from "@neondatabase/serverless"

export const sql = neon(process.env.POSTGRES_URL || process.env.DATABASE_URL!)

// Types
export type Leader = {
  id: number
  name: string
  email: string
  password_hash: string
  is_approved: boolean
  created_at: string
}

export type Attendee = {
  id: number
  name: string
  email: string
  phone: string | null
  qr_code: string
  attendee_code: string | null
  is_active: boolean
  email_sent?: boolean
  created_at: string
  status?: "checked_in" | "not_checked" // added for the dashboard UI
}

export type AttendeeAttendance = {
  id: number
  attendee_id: number
  leader_id: number | null
  check_in_time: string
  status: string
  attendance_type: string
}

export type Volunteer = {
  id: number
  name: string
  email: string
  phone: string | null
  hall_number: string | null
  qr_code: string
  details: Record<string, any> | null
  is_active: boolean
  is_best_volunteer: boolean
  email_sent: boolean
  created_at: string
  volunteer_type?: "theta" | "delta"
  volunteer_code?: string
  shift?: "Morning" | "Evening"
}

export type Attendance = {
  id: number
  volunteer_id: number
  leader_id: number | null
  check_in_time: string
  status: string
  notes: string | null
  attendance_type: string
  is_best_volunteer_marked: boolean
  check_out_time?: string
  is_extra_day?: boolean
  volunteer_type?: "theta" | "delta"
  volunteer_code?: string
}

export type Session = {
  id: string
  leader_id: number
  expires_at: string
}

// Leader queries
export async function getLeaderByEmail(email: string) {
  const result = await sql`SELECT * FROM leaders WHERE LOWER(email) = LOWER(${email.trim()})`
  return result[0] as Leader | undefined
}

export async function getLeaderRole(leaderId: number): Promise<"super_admin" | "leader"> {
  // Global auto-migration check: ensure is_approved column exists
  try {
    await sql`ALTER TABLE leaders ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false`
  } catch (e) {
    // Ignore errors if already exists or other issues
  }

  const result = await sql`SELECT email FROM leaders WHERE id = ${leaderId}`
  if (result.length === 0) return "leader"
  
  const email = result[0].email.toLowerCase()
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase()
  const superAdminEmail1 = process.env.SUPER_ADMIN_EMAIL1?.toLowerCase()
  
  if ((superAdminEmail && email === superAdminEmail) || (superAdminEmail1 && email === superAdminEmail1)) {
    return "super_admin"
  }
  return "leader"
}

export async function createLeader(name: string, email: string, passwordHash: string, isApproved = false) {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase()
  const superAdminEmail1 = process.env.SUPER_ADMIN_EMAIL1?.toLowerCase()
  const normalizedEmail = email.toLowerCase()
  const autoApprove = isApproved || (superAdminEmail && normalizedEmail === superAdminEmail) || (superAdminEmail1 && normalizedEmail === superAdminEmail1)
  const result =
    await sql`INSERT INTO leaders (name, email, password_hash, is_approved) VALUES (${name}, ${email}, ${passwordHash}, ${autoApprove}) RETURNING *`
  return result[0] as Leader
}

export async function getLeaders() {
  const result = await sql`SELECT id, name, email, is_approved FROM leaders ORDER BY name ASC`
  return result as unknown as Leader[]
}

export async function getUnapprovedLeaders() {
  const result = await sql`SELECT id, name, email, created_at FROM leaders WHERE is_approved = false ORDER BY created_at DESC`
  return result as unknown as Leader[]
}

export async function approveLeader(leaderId: number) {
  const result = await sql`UPDATE leaders SET is_approved = true WHERE id = ${leaderId} RETURNING *`
  return result[0] as Leader
}

export async function rejectLeader(leaderId: number) {
  await sql`DELETE FROM leaders WHERE id = ${leaderId} AND is_approved = false`
}

// Volunteer queries
export async function getAllVolunteers() {
  const result = await sql`SELECT * FROM volunteers WHERE is_active = true ORDER BY created_at DESC`
  return result as unknown as Volunteer[]
}

// Get all volunteers without is_active filter (for showing recently synced data)
export async function getAllVolunteersNoFilter() {
  const result = await sql`SELECT * FROM volunteers ORDER BY created_at DESC`
  return result as unknown as Volunteer[]
}

// Alias for getAllVolunteers
export const getVolunteers = getAllVolunteers

export async function getVolunteerByQrCode(qrCode: string) {
  const trimmedQr = qrCode.trim()
  console.log("[v0] getVolunteerByQrCode - looking up:", trimmedQr)

  try {
    // First try exact match by volunteer_code
    let result = await sql`SELECT * FROM volunteers WHERE volunteer_code = ${trimmedQr} LIMIT 1`
    if (result.length > 0) {
      console.log("[v0] Found by exact volunteer_code match")
      return result[0] as Volunteer
    }

    // Try matching the last part (e.g., if QR is "1557", match "O- 1557")
    result = await sql`SELECT * FROM volunteers WHERE volunteer_code LIKE ${`%${trimmedQr}`} LIMIT 1`
    if (result.length > 0) {
      console.log("[v0] Found by LIKE match with %trimmedQr")
      return result[0] as Volunteer
    }

    // Try by ID if the trimmed QR is a number
    if (/^\d+$/.test(trimmedQr)) {
      const volunteerId = parseInt(trimmedQr, 10)
      result = await sql`SELECT * FROM volunteers WHERE id = ${volunteerId} LIMIT 1`
      if (result.length > 0) {
        console.log("[v0] Found by ID match")
        return result[0] as Volunteer
      }
    }

    // If qrCode looks like a UUID, try UUID lookup
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (uuidRegex.test(trimmedQr)) {
      try {
        result = await sql`SELECT * FROM volunteers WHERE qr_code = ${trimmedQr}::uuid LIMIT 1`
        if (result.length > 0) {
          console.log("[v0] Found by UUID match")
          return result[0] as Volunteer
        }
      } catch (uuidError) {
        console.error("[v0] UUID lookup error:", uuidError)
      }
    }

    console.log("[v0] Volunteer not found for code:", trimmedQr)
    return undefined
  } catch (error) {
    console.error("[v0] Error looking up volunteer by code:", error)
    return undefined
  }
}

export async function getVolunteerById(volunteerId: number) {
  const result = await sql`SELECT * FROM volunteers WHERE id = ${volunteerId}`
  return result[0] as Volunteer | undefined
}

export async function createVolunteer(
  name: string,
  email: string,
  phone: string | null = null,
  hall_number: string | null = null,
  details: any = null,
  volunteer_type: "theta" | "delta" = "theta",
  volunteer_code = "",
) {
  const existing = await sql`SELECT id FROM volunteers WHERE email = ${email}`
  if (existing.length > 0) {
    throw new Error("DUPLICATE_EMAIL")
  }

  const result =
    await sql`INSERT INTO volunteers (name, email, phone, hall_number, details, volunteer_type, volunteer_code) VALUES (${name}, ${email}, ${phone}, ${hall_number}, ${JSON.stringify(details)}, ${volunteer_type}, ${volunteer_code}) RETURNING *`
  return result[0] as Volunteer
}

export async function updateVolunteer(id: number, data: Partial<Volunteer>) {
  const { name, email, phone, is_active, volunteer_type, volunteer_code } = data
  const result =
    await sql`UPDATE volunteers SET name = COALESCE(${name}, name), email = COALESCE(${email}, email), phone = COALESCE(${phone}, phone), hall_number = COALESCE(${data.hall_number}, hall_number), is_active = COALESCE(${is_active}, is_active), volunteer_type = COALESCE(${volunteer_type}, volunteer_type), volunteer_code = COALESCE(${volunteer_code}, volunteer_code) WHERE id = ${id} RETURNING *`
  return result[0] as Volunteer
}

export async function getVolunteersByFilter(searchTerm?: string, hallNumber?: string, isBestOnly?: boolean) {
  let query = `SELECT * FROM volunteers WHERE is_active = true`
  const params: any[] = []

  if (searchTerm) {
    query += ` AND (name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1} OR details->>'volunteer_id' ILIKE $${params.length + 1})`
    params.push(`%${searchTerm}%`)
  }

  if (hallNumber) {
    query += ` AND hall_number = $${params.length + 1}`
    params.push(hallNumber)
  }

  if (isBestOnly) {
    query += ` AND is_best_volunteer = true`
  }

  query += ` ORDER BY created_at DESC`
  const result = await sql.query(query, params)
  return result as unknown as Volunteer[]
}

export async function updateVolunteerType(volunteerId: number, volunteerType: "theta" | "delta") {
  const result =
    await sql`UPDATE volunteers SET volunteer_type = ${volunteerType} WHERE id = ${volunteerId} RETURNING *`
  return result[0] as Volunteer
}

export async function getVolunteersByType(volunteerType: "theta" | "delta") {
  const result = await sql`SELECT * FROM volunteers WHERE volunteer_type = ${volunteerType} AND is_active = true ORDER BY name ASC`
  return result as unknown as Volunteer[]
}

export async function getAttendanceByType(
  volunteerType: "theta" | "delta",
  startDate?: string,
  endDate?: string,
  isBestOnly?: boolean,
  status?: string,
  hall?: string,
  leaderId?: number,
) {
  let query = `
    SELECT 
      a.id,
      a.volunteer_id,
      v.name,
      v.email,
      v.hall_number,
      v.volunteer_type,
      v.volunteer_code,
      a.check_in_time,
      a.attendance_type,
      a.notes,
      l.name as leader_name,
      a.is_best_volunteer_marked as is_best_volunteer,
      a.is_extra_day
    FROM attendance a
    JOIN volunteers v ON a.volunteer_id = v.id
    LEFT JOIN leaders l ON a.leader_id = l.id
    WHERE (v.volunteer_type = $1 OR (a.is_extra_day = true AND v.volunteer_type != $1))
  `
  const params: any[] = [volunteerType]
  let paramCount = 2

  if (startDate && endDate) {
    query += ` AND a.check_in_time >= $${paramCount}::timestamp AND a.check_in_time < $${paramCount + 1}::timestamp + INTERVAL '1 day'`
    params.push(startDate, endDate)
    paramCount += 2
  }

  if (isBestOnly) {
    query += ` AND a.is_best_volunteer_marked = true`
  }

  if (status) {
    query += ` AND a.attendance_type = $${paramCount}`
    params.push(status)
    paramCount += 1
  }

  if (hall) {
    query += ` AND v.hall_number = $${paramCount}`
    params.push(hall)
    paramCount += 1
  }

  if (leaderId) {
    query += ` AND a.leader_id = $${paramCount}`
    params.push(leaderId)
    paramCount += 1
  }

  query += ` ORDER BY a.check_in_time DESC`
  const result = await sql.query(query, params)
  return result as any[]
}

export async function getTodayCheckInStatsByType(volunteerType: "theta" | "delta") {
  const result = await sql`
    SELECT 
      (SELECT COUNT(*) FROM volunteers WHERE is_active = true AND volunteer_type = ${volunteerType})::int as total_volunteers,
      (SELECT COUNT(DISTINCT volunteer_id) FROM attendance a
       JOIN volunteers v ON a.volunteer_id = v.id 
       WHERE a.check_in_time >= CURRENT_DATE AND a.check_in_time < CURRENT_DATE + INTERVAL '1 day' AND v.volunteer_type = ${volunteerType})::int as checked_in_today
  `
  return result[0] as { total_volunteers: number; checked_in_today: number }
}

// Attendance queries
export async function recordAttendance(volunteerId: number, leaderId: number | null = null, status = "present") {
  const result =
    await sql`INSERT INTO attendance (volunteer_id, leader_id, status) VALUES (${volunteerId}, ${leaderId}, ${status}) RETURNING *`
  return result[0] as Attendance
}

export async function recordAttendanceWithComments(
  volunteerId: number,
  leaderId: number | null = null,
  status = "present",
  comments: string | null = null,
  isBestVolunteer = false,
) {
  const result =
    await sql`INSERT INTO attendance (volunteer_id, leader_id, status, notes) VALUES (${volunteerId}, ${leaderId}, ${status}, ${comments}) RETURNING *`

  if (isBestVolunteer) {
    await sql`UPDATE volunteers SET is_best_volunteer = true WHERE id = ${volunteerId}`
  }

  return result[0] as Attendance
}

export async function updateAttendanceComments(attendanceId: number, comments: string) {
  const result = await sql`UPDATE attendance SET notes = ${comments} WHERE id = ${attendanceId} RETURNING *`
  return result[0] as Attendance
}

export async function clearAllAttendance() {
  await sql`DELETE FROM attendance`
}

export async function getAttendanceReport(
  startDate?: string,
  endDate?: string,
  isBestOnly?: boolean,
  status?: string,
  hall?: string,
) {
  let query = `
    SELECT 
      a.id,
      a.volunteer_id,
      v.name,
      v.email,
      v.hall_number,
      v.volunteer_type,
      v.volunteer_code,
      a.check_in_time,
      a.status,
      a.notes,
      l.name as leader_name,
      v.is_best_volunteer
    FROM attendance a
    JOIN volunteers v ON a.volunteer_id = v.id
    LEFT JOIN leaders l ON a.leader_id = l.id
    WHERE 1=1
  `
  const params: any[] = []
  let paramCount = 1

  if (startDate && endDate) {
    query += ` AND a.check_in_time >= $${paramCount}::timestamp AND a.check_in_time < $${paramCount + 1}::timestamp + INTERVAL '1 day'`
    params.push(startDate, endDate)
    paramCount += 2
  }

  if (isBestOnly) {
    query += ` AND v.is_best_volunteer = true`
  }

  if (status) {
    query += ` AND a.status = $${paramCount}`
    params.push(status)
    paramCount += 1
  }

  if (hall) {
    query += ` AND v.hall_number = $${paramCount}`
    params.push(hall)
    paramCount += 1
  }

  query += ` ORDER BY a.check_in_time DESC`
  const result = await sql.query(query, params)
  return result as any[]
}

export async function getAttendanceReportByLeader(
  leaderId: number,
  startDate?: string,
  endDate?: string,
  isBestOnly?: boolean,
  status?: string,
  hall?: string,
) {
  let query = `
    SELECT 
      a.id,
      a.volunteer_id,
      v.name,
      v.email,
      v.hall_number,
      v.volunteer_type,
      v.volunteer_code,
      a.check_in_time,
      a.status,
      a.notes,
      l.name as leader_name,
      v.is_best_volunteer
    FROM attendance a
    JOIN volunteers v ON a.volunteer_id = v.id
    LEFT JOIN leaders l ON a.leader_id = l.id
    WHERE a.leader_id = $1
  `
  const params: any[] = [leaderId]
  let paramCount = 2

  if (startDate && endDate) {
    query += ` AND a.check_in_time >= $${paramCount}::timestamp AND a.check_in_time < $${paramCount + 1}::timestamp + INTERVAL '1 day'`
    params.push(startDate, endDate)
    paramCount += 2
  }

  if (isBestOnly) {
    query += ` AND a.is_best_volunteer_marked = true`
  }

  if (status) {
    query += ` AND a.status = $${paramCount}`
    params.push(status)
    paramCount += 1
  }

  if (hall) {
    query += ` AND v.hall_number = $${paramCount}`
    params.push(hall)
    paramCount += 1
  }

  query += ` ORDER BY a.check_in_time DESC`
  const result = await sql.query(query, params)
  return result as any[]
}

export async function getVolunteerAttendance(volunteerId: number) {
  const result = await sql`SELECT * FROM attendance WHERE volunteer_id = ${volunteerId} ORDER BY check_in_time DESC`
  return result as unknown as Attendance[]
}

export async function checkTodayAttendance(volunteerId: number) {
  const result =
    await sql`SELECT * FROM attendance WHERE volunteer_id = ${volunteerId} AND check_in_time >= CURRENT_DATE AND check_in_time < CURRENT_DATE + INTERVAL '1 day'`
  return result.length > 0
}

export async function getTodayCheckInStats() {
  const result = await sql`
    SELECT 
      (SELECT COUNT(*) FROM volunteers WHERE is_active = true)::int as total_volunteers,
      (SELECT COUNT(DISTINCT volunteer_id) FROM attendance WHERE check_in_time >= CURRENT_DATE AND check_in_time < CURRENT_DATE + INTERVAL '1 day')::int as checked_in_today
  `
  return result[0] as { total_volunteers: number; checked_in_today: number }
}

export async function recordAttendanceWithType(
  volunteerId: number,
  leaderId: number | null = null,
  attendanceType: "check_in" | "check_out" | "midday_exit" = "check_in",
  comments: string | null = null,
  isBestVolunteer = false,
  todayType?: "theta" | "delta",
  isExtraDay?: boolean,
  volunteerCode?: string,
) {
  const volunteer = await sql`SELECT volunteer_type, volunteer_code FROM volunteers WHERE id = ${volunteerId}`
  if (!volunteer || volunteer.length === 0) {
    throw new Error("Volunteer not found")
  }

  const volunteerType = volunteer[0].volunteer_type || "theta"
  const storedVolunteerCode = volunteerCode || volunteer[0].volunteer_code

  const result =
    await sql`INSERT INTO attendance (volunteer_id, leader_id, attendance_type, check_in_time, notes, is_best_volunteer_marked, is_extra_day, volunteer_type, volunteer_code) VALUES (${volunteerId}, ${leaderId}, ${attendanceType}, NOW(), ${comments}, ${isBestVolunteer}, ${isExtraDay || false}, ${volunteerType}, ${storedVolunteerCode}) RETURNING *`

  if (isBestVolunteer) {
    await sql`UPDATE volunteers SET is_best_volunteer = true WHERE id = ${volunteerId}`
  }

  return result[0] as Attendance
}

export async function getVolunteerProfile(volunteerId: number) {
  const result = await sql`
    SELECT 
      v.id,
      v.name,
      v.email,
      v.phone,
      v.hall_number,
      v.is_best_volunteer,
      v.volunteer_type,
      v.volunteer_code,
      COUNT(DISTINCT DATE(a.check_in_time))::int as total_days_attended,
      COALESCE(SUM(
        CASE 
          WHEN a.check_out_time IS NOT NULL THEN 
            EXTRACT(EPOCH FROM (a.check_out_time - a.check_in_time)) / 3600
          ELSE 0
        END
      ), 0)::float as total_hours,
      (SELECT COUNT(*) FROM attendance WHERE volunteer_id = ${volunteerId} AND attendance_type = 'check_in')::int as check_in_count,
      (SELECT COUNT(*) FROM attendance WHERE volunteer_id = ${volunteerId} AND attendance_type = 'check_out')::int as check_out_count,
      (SELECT COUNT(*) FROM attendance WHERE volunteer_id = ${volunteerId} AND attendance_type = 'midday_exit')::int as midday_exit_count,
      (SELECT COUNT(DISTINCT DATE(a2.check_in_time)) FROM attendance a2 
       WHERE a2.volunteer_id = ${volunteerId} AND a2.is_extra_day = true)::int as extra_days_attended
    FROM volunteers v
    LEFT JOIN attendance a ON v.id = a.volunteer_id
    WHERE v.id = ${volunteerId}
    GROUP BY v.id, v.name, v.email, v.phone, v.hall_number, v.is_best_volunteer, v.volunteer_type, v.volunteer_code
  `
  return result[0]
}

export async function getVolunteerAttendanceHistory(volunteerId: number, limit = 50) {
  return sql`
    SELECT 
      a.id,
      a.check_in_time,
      a.attendance_type,
      a.notes,
      a.is_best_volunteer_marked as is_best_volunteer,
      l.name as leader_name
    FROM attendance a
    LEFT JOIN leaders l ON a.leader_id = l.id
    WHERE a.volunteer_id = ${volunteerId}
    ORDER BY a.check_in_time DESC
    LIMIT ${limit}
  `
}

export async function getVolunteerDailyStats(volunteerId: number) {
  return sql`
    SELECT 
      DATE(a.check_in_time) as attendance_date,
      COUNT(CASE WHEN a.attendance_type = 'check_in' THEN 1 END)::int as check_ins,
      COUNT(CASE WHEN a.attendance_type = 'check_out' THEN 1 END)::int as check_outs,
      COUNT(CASE WHEN a.attendance_type = 'midday_exit' THEN 1 END)::int as midday_exits,
      COALESCE(SUM(CASE 
        WHEN a.check_out_time IS NOT NULL THEN 
          EXTRACT(EPOCH FROM (a.check_out_time - a.check_in_time)) / 3600
        ELSE 0
      END), 0)::float as hours_on_day,
      BOOL_OR(a.is_best_volunteer_marked) as marked_as_best_on_day,
      COUNT(DISTINCT a.leader_id)::int as different_leaders
    FROM attendance a
    WHERE a.volunteer_id = ${volunteerId}
    GROUP BY DATE(a.check_in_time)
    ORDER BY DATE(a.check_in_time) DESC
  `
}

// Session queries
export async function createSession(leaderId: number, expiresAt: string) {
  const sessionId = crypto.randomUUID()
  await sql`
    INSERT INTO sessions (id, leader_id, expires_at)
    VALUES (${sessionId}, ${leaderId}, ${expiresAt})
  `
  return sessionId
}

// Mark volunteer email as sent
export async function markEmailSent(volunteerId: number) {
  return sql`
    UPDATE volunteers
    SET email_sent = true
    WHERE id = ${volunteerId}
  `
}

export async function getSession(sessionId: string) {
  const result = await sql`SELECT * FROM sessions WHERE id = ${sessionId} AND expires_at > NOW()`
  return result[0] as Session | undefined
}

export async function deleteSession(sessionId: string) {
  await sql`DELETE FROM sessions WHERE id = ${sessionId}`
}

// Function to determine the day type
export async function getDayType(): Promise<"theta" | "delta"> {
  const today = new Date()
  const dayOfMonth = today.getDate()
  return dayOfMonth % 2 === 1 ? "delta" : "theta"
}

export async function recordAttendanceBatch(
  records: Array<{
    volunteerId: number
    leaderId: number | null
    attendanceType: "check_in" | "check_out" | "midday_exit"
    comments: string | null
    isBestVolunteer: boolean
  }>,
) {
  if (records.length === 0) return []

  const results = await Promise.allSettled(
    records.map(async (record) => {
      return recordAttendanceWithType(
        record.volunteerId,
        record.leaderId,
        record.attendanceType,
        record.comments,
        record.isBestVolunteer,
      )
    }),
  )

  return results.filter((r): r is PromiseFulfilledResult<Attendance> => r.status === "fulfilled").map((r) => r.value)
}

export async function getVolunteerCheckInStatus(volunteerId?: number) {
  const result = await sql`
    SELECT 
      v.id,
      v.name,
      v.email,
      v.volunteer_code,
      v.volunteer_type,
      v.shift,
      v.hall_number,
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM attendance a 
          WHERE a.volunteer_id = v.id 
          AND a.check_in_time >= CURRENT_DATE AND a.check_in_time < CURRENT_DATE + INTERVAL '1 day'
          AND a.attendance_type = 'check_out'
        ) THEN 'checked_out'
        WHEN EXISTS (
          SELECT 1 FROM attendance a 
          WHERE a.volunteer_id = v.id 
          AND a.check_in_time >= CURRENT_DATE AND a.check_in_time < CURRENT_DATE + INTERVAL '1 day'
          AND a.attendance_type = 'check_in'
        ) THEN 'checked_in'
        ELSE 'not_checked'
      END as status,
      (SELECT MAX(a.check_in_time) FROM attendance a WHERE a.volunteer_id = v.id AND a.check_in_time >= CURRENT_DATE AND a.check_in_time < CURRENT_DATE + INTERVAL '1 day') as last_attendance_time
    FROM volunteers v
    WHERE v.is_active = true
    ${volunteerId ? sql`AND v.id = ${volunteerId}` : sql``}
    ORDER BY v.name ASC
  `

  return result as any[]
}

export async function getTodayStatusSummary(dayType?: "theta" | "delta") {
  const result = await sql`
    SELECT 
      SUM(CASE WHEN status = 'checked_in' THEN 1 ELSE 0 END)::int as checked_in,
      SUM(CASE WHEN status = 'checked_out' THEN 1 ELSE 0 END)::int as checked_out,
      SUM(CASE WHEN status = 'not_checked' THEN 1 ELSE 0 END)::int as not_checked
    FROM (
      SELECT 
        v.id,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM attendance a 
            WHERE a.volunteer_id = v.id 
            AND a.check_in_time >= CURRENT_DATE AND a.check_in_time < CURRENT_DATE + INTERVAL '1 day'
            AND a.attendance_type = 'check_out'
          ) THEN 'checked_out'
          WHEN EXISTS (
            SELECT 1 FROM attendance a 
            WHERE a.volunteer_id = v.id 
            AND a.check_in_time >= CURRENT_DATE AND a.check_in_time < CURRENT_DATE + INTERVAL '1 day'
            AND a.attendance_type = 'check_in'
          ) THEN 'checked_in'
          ELSE 'not_checked'
        END as status
      FROM volunteers v
      WHERE v.is_active = true
      ${dayType ? sql`AND v.volunteer_type = ${dayType}` : sql``}
    ) status_counts
  `

  return result[0] || { checked_in: 0, checked_out: 0, not_checked: 0 }
}

export async function getTodayStatusSummaryByDay() {
  const dayType = await getDayType()
  return getTodayStatusSummary(dayType)
}

// Attendee queries
export async function getAllAttendees() {
  const result = await sql`
    SELECT 
      a.*,
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM attendee_attendance aa 
          WHERE aa.attendee_id = a.id 
          AND aa.check_in_time >= CURRENT_DATE 
          AND aa.check_in_time < CURRENT_DATE + INTERVAL '1 day'
          AND aa.attendance_type = 'check_in'
        ) THEN 'checked_in'
        ELSE 'not_checked'
      END as status
    FROM attendees a 
    WHERE a.is_active = true 
    ORDER BY a.created_at DESC
  `
  return result as Attendee[]
}

export async function getAttendeeByQrCode(qrCode: string) {
  const trimmedQr = qrCode.trim()
  
  try {
    let result = await sql`SELECT * FROM attendees WHERE attendee_code = ${trimmedQr} LIMIT 1`
    if (result.length > 0) return result[0] as Attendee

    result = await sql`SELECT * FROM attendees WHERE attendee_code LIKE ${`%${trimmedQr}`} LIMIT 1`
    if (result.length > 0) return result[0] as Attendee

    if (/^\d+$/.test(trimmedQr)) {
      const id = parseInt(trimmedQr, 10)
      result = await sql`SELECT * FROM attendees WHERE id = ${id} LIMIT 1`
      if (result.length > 0) return result[0] as Attendee
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (uuidRegex.test(trimmedQr)) {
      result = await sql`SELECT * FROM attendees WHERE qr_code = ${trimmedQr}::uuid LIMIT 1`
      if (result.length > 0) return result[0] as Attendee
    }

    return undefined
  } catch (error) {
    console.error("[v0] Error looking up attendee by code:", error)
    return undefined
  }
}

export async function getAttendeeById(attendeeId: number) {
  const result = await sql`SELECT * FROM attendees WHERE id = ${attendeeId}`
  return result[0] as Attendee | undefined
}

export async function createAttendee(
  name: string,
  email: string,
  phone: string | null = null,
  attendee_code = "",
) {
  const existing = await sql`SELECT id FROM attendees WHERE email = ${email}`
  if (existing.length > 0) {
    throw new Error("DUPLICATE_EMAIL")
  }

  const result =
    await sql`INSERT INTO attendees (name, email, phone, attendee_code) VALUES (${name}, ${email}, ${phone}, ${attendee_code}) RETURNING *`
  return result[0] as Attendee
}

export async function recordAttendeeAttendance(
  attendeeId: number,
  leaderId: number | null = null,
  attendanceType: "check_in" | "check_out" = "check_in"
) {
  const attendee = await getAttendeeById(attendeeId)
  if (!attendee) {
    throw new Error("Attendee not found")
  }

  const result =
    await sql`INSERT INTO attendee_attendance (attendee_id, leader_id, attendance_type, check_in_time) VALUES (${attendeeId}, ${leaderId}, ${attendanceType}, NOW()) RETURNING *`

  return result[0] as AttendeeAttendance
}

export async function markAttendeeEmailSent(attendeeId: number) {
  return sql`
    UPDATE attendees
    SET email_sent = true
    WHERE id = ${attendeeId}
  `
}

// Optimized Attendee Check-in (One DB trip)
export async function optimizedRecordAttendeeAttendance(
  attendeeId: number,
  leaderId: number | null = null,
  attendanceType: "check_in" | "check_out" = "check_in"
) {
  const result = await sql`
    INSERT INTO attendee_attendance (attendee_id, leader_id, attendance_type, check_in_time)
    SELECT ${attendeeId}, ${leaderId}, ${attendanceType}, NOW()
    WHERE EXISTS (SELECT 1 FROM attendees WHERE id = ${attendeeId})
    AND NOT EXISTS (
      SELECT 1 FROM attendee_attendance 
      WHERE attendee_id = ${attendeeId} 
      AND check_in_time >= CURRENT_DATE 
      AND check_in_time < CURRENT_DATE + INTERVAL '1 day'
      AND attendance_type = 'check_in'
    )
    RETURNING *
  `
  return result[0] as AttendeeAttendance | undefined
}

// Optimized Volunteer Check-in (One DB trip)
export async function optimizedRecordVolunteerAttendance(
  volunteerId: number,
  leaderId: number | null = null,
  attendanceType: "check_in" | "check_out" | "midday_exit" = "check_in",
  comments: string | null = null,
  isBestVolunteer = false,
  todayDayType: "theta" | "delta" = "theta"
) {
  const result = await sql`
    WITH v_info AS (
      SELECT volunteer_type, volunteer_code FROM volunteers WHERE id = ${volunteerId}
    )
    INSERT INTO attendance (
      volunteer_id, leader_id, attendance_type, check_in_time, 
      notes, is_best_volunteer_marked, is_extra_day, 
      volunteer_type, volunteer_code
    )
    SELECT 
      ${volunteerId}, ${leaderId}, ${attendanceType}, NOW(), 
      ${comments}, ${isBestVolunteer}, 
      (v_info.volunteer_type != ${todayDayType}), 
      v_info.volunteer_type, v_info.volunteer_code
    FROM v_info
    WHERE NOT EXISTS (
      SELECT 1 FROM attendance 
      WHERE volunteer_id = ${volunteerId} 
      AND check_in_time >= CURRENT_DATE AND check_in_time < CURRENT_DATE + INTERVAL '1 day'
      AND attendance_type = 'check_in'
    )
    RETURNING *
  `
  
  if (result.length > 0 && isBestVolunteer) {
    await sql`UPDATE volunteers SET is_best_volunteer = true WHERE id = ${volunteerId}`
  }

  return result[0] as Attendance | undefined
}

export async function getAttendeeCheckInStatus(attendeeId?: number) {
  const result = await sql`
    SELECT 
      a.id,
      a.name,
      a.email,
      a.attendee_code,
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM attendee_attendance aa 
          WHERE aa.attendee_id = a.id 
          AND aa.check_in_time >= CURRENT_DATE 
          AND aa.check_in_time < CURRENT_DATE + INTERVAL '1 day'
          AND aa.attendance_type = 'check_in'
        ) THEN 'checked_in'
        ELSE 'not_checked'
      END as status
    FROM attendees a
    WHERE a.is_active = true
    ${attendeeId ? sql`AND a.id = ${attendeeId}` : sql``}
    ORDER BY a.name ASC
  `

  return result as any[]
}
