"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Clock, Calendar, Award } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type VolunteerProfile = {
  id: number
  name: string
  english_name: string | null
  email: string
  phone: string | null
  hall_number: string | null
  is_best_volunteer: boolean
  total_days_attended: number
  total_hours: number
  check_in_count: number
  check_out_count: number
  midday_exit_count: number
  volunteer_type: "theta" | "delta"
  extra_days_attended: number
}

type AttendanceRecord = {
  id: number
  check_in_time: string
  attendance_type: "check_in" | "check_out" | "midday_exit"
  notes: string | null
  is_best_volunteer: boolean
  leader_name: string | null
}

type DailyStats = {
  attendance_date: string
  check_ins: number
  check_outs: number
  midday_exits: number
  hours_on_day: number
  marked_as_best_on_day: boolean
  different_leaders: number
}

export default function VolunteerProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const volunteerId = params.id as string

  const [profile, setProfile] = useState<VolunteerProfile | null>(null)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(true)

  Add a declared dependency array `useEffect(() => { ... }, [dependency])`
    fetchData()
  }, [volunteerId])

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/volunteers/${volunteerId}/profile`)
      if (!res.ok) {
        throw new Error(`Failed to fetch profile: ${res.status}`)
      }

      const data = await res.json()

      if (!data.profile) {
        throw new Error("No profile data in response")
      }

      setProfile(data.profile)
      setAttendance(data.attendance || [])
      setDailyStats(data.dailyStats || [])
    } catch (error) {
      toast({ title: "Error", description: "Failed to load volunteer profile", variant: "destructive" })
      router.push("/dashboard")
    } finally {
      setIsLoadingProfile(false)
      setIsLoadingAttendance(false)
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading volunteer profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-4">Volunteer not found</p>
            <Button onClick={() => router.back()} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hoursDisplay = profile.total_hours ? Math.round(profile.total_hours) : 0

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-2">
          <ArrowLeft className="size-4 mr-2" />
          Back
        </Button>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl">
                  {profile.english_name || profile.name}
                </CardTitle>
                <CardDescription className="mt-1 text-sm text-gray-600">
                  {profile.english_name && profile.name && profile.english_name !== profile.name && (
                    <div>{profile.name}</div>
                  )}
                  {profile.email}
                </CardDescription>
                <div className="mt-2">
                  <Badge
                    className={
                      profile.volunteer_type === "theta"
                        ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                        : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                    }
                  >
                    {profile.volunteer_type === "theta" ? "Θ Theta (Day 1)" : "Δ Delta (Day 2)"}
                  </Badge>
                </div>
              </div>
              {profile.is_best_volunteer && (
                <Badge className="bg-amber-500">
                  <Award className="size-3 mr-1" />
                  Best Volunteer
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-semibold">{profile.phone || "N/A"}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Hall</p>
                <p className="font-semibold">{profile.hall_number || "N/A"}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="font-semibold">{hoursDisplay} hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="size-4" />
                Days Attended
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.total_days_attended || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="size-4" />
                Extra Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{profile.extra_days_attended || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Days outside assigned type</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="size-4" />
                Total Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hoursDisplay}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Check-ins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{profile.check_in_count}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Check-outs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{profile.check_out_count}</div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Stats Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Attendance Summary</CardTitle>
            <CardDescription>Breakdown of attendance by day with best volunteer status</CardDescription>
          </CardHeader>
          <CardContent>
            {dailyStats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No daily records yet</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Check-ins</TableHead>
                      <TableHead>Check-outs</TableHead>
                      <TableHead>Midday Exits</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Best Volunteer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyStats.map((day, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {new Date(day.attendance_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{day.check_ins}</TableCell>
                        <TableCell>{day.check_outs}</TableCell>
                        <TableCell>{day.midday_exits}</TableCell>
                        <TableCell>{Math.round(day.hours_on_day)} hrs</TableCell>
                        <TableCell>
                          {day.marked_as_best_on_day ? (
                            <Badge className="bg-amber-500">Best</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance History */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance History</CardTitle>
            <CardDescription>Recent attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAttendance ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : attendance.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No attendance records yet</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Leader</TableHead>
                      <TableHead>Comments</TableHead>
                      <TableHead>Best Volunteer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="text-sm">{new Date(record.check_in_time).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              record.attendance_type === "check_in"
                                ? "bg-green-50"
                                : record.attendance_type === "check_out"
                                  ? "bg-blue-50"
                                  : "bg-orange-50"
                            }
                          >
                            {record.attendance_type === "check_in" && "Check In"}
                            {record.attendance_type === "check_out" && "Check Out"}
                            {record.attendance_type === "midday_exit" && "Midday Exit"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{record.leader_name || "-"}</TableCell>
                        <TableCell className="text-sm max-w-xs truncate">{record.notes || "-"}</TableCell>
                        <TableCell>
                          {record.is_best_volunteer ? (
                            <Badge className="bg-amber-500">Best</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
