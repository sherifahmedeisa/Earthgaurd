"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Download, RefreshCw, Edit2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type AttendanceRecord = {
  id: number
  volunteer_id: number
  name: string
  email: string
  check_in_time: string
  attendance_type: string
  leader_name: string | null
  hall_number: string | null
  notes: string | null
  is_best_volunteer: boolean
  is_extra_day?: boolean
  volunteer_code?: string
}

type ReportDashboardProps = {
  volunteerType?: "theta" | "delta"
}

export function ReportDashboard({ volunteerType = "theta" }: ReportDashboardProps) {
  const { toast } = useToast()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedLeader, setSelectedLeader] = useState<string>("")
  const [leaders, setLeaders] = useState<Array<{ id: number; name: string }>>([])
  const [showBestOnly, setShowBestOnly] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [hallFilter, setHallFilter] = useState<string>("")
  const [totalVolunteers, setTotalVolunteers] = useState(100) // Placeholder value
  const [checkedInToday, setCheckedInToday] = useState(50) // Placeholder value
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    fetchLeaders()
    fetchReport()
    fetchCheckInStats()
  }, [volunteerType])

  const fetchCheckInStats = async () => {
    try {
      const res = await fetch(`/api/attendance/stats?type=${volunteerType}`)
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      setTotalVolunteers(data.total_volunteers)
      setCheckedInToday(data.checked_in_today)
    } catch (error) {
      console.error("Failed to fetch check-in stats:", error)
    }
  }

  const fetchLeaders = async () => {
    try {
      const res = await fetch("/api/leaders")
      if (res.ok) {
        const data = await res.json()
        setLeaders(data)
      }
    } catch (error) {
      console.error("Failed to fetch leaders:", error)
    }
  }

  const fetchReport = async (
    start?: string,
    end?: string,
    leader?: string,
    bestOnly?: boolean,
    status?: string,
    hall?: string,
  ) => {
    setFetchError(null)
    try {
      const params = new URLSearchParams()
      params.append("type", volunteerType)
      if (start) params.append("startDate", start)
      if (end) params.append("endDate", end)
      if (leader) params.append("leaderId", leader)
      if (bestOnly) params.append("bestOnly", "true")
      if (status) params.append("status", status)
      if (hall) params.append("hall", hall)

      const res = await fetch(`/api/report?${params}`)
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch report")
      }
      
      setRecords(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch report"
      setFetchError(message)
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault()
    fetchReport(startDate, endDate, selectedLeader, showBestOnly, statusFilter, hallFilter)
  }

  const handleSaveComments = async () => {
    if (!editingRecord) return

    setIsSavingComments(true)
    try {
      const res = await fetch("/api/attendance/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendanceId: editingRecord.id,
          comments: editingComments,
        }),
      })

      if (!res.ok) throw new Error("Failed to save comments")

      setRecords(records.map((r) => (r.id === editingRecord.id ? { ...r, notes: editingComments } : r)))

      toast({ title: "Success", description: "Comments updated successfully" })
      setShowEditComments(false)
      setEditingRecord(null)
      setEditingComments("")
    } catch (error) {
      toast({ title: "Error", description: "Failed to save comments", variant: "destructive" })
    } finally {
      setIsSavingComments(false)
    }
  }

  const downloadCSV = async () => {
    try {
      const params = new URLSearchParams({ format: "csv" })
      params.append("type", volunteerType)
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)
      if (selectedLeader) params.append("leaderId", selectedLeader)
      if (showBestOnly) params.append("bestOnly", "true")
      if (statusFilter) params.append("status", statusFilter)
      if (hallFilter) params.append("hall", hallFilter)

      const res = await fetch(`/api/report?${params}`)
      if (!res.ok) throw new Error("Failed to download")

      const csv = await res.text()
      const blob = new Blob([csv], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `attendance-report-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({ title: "Success", description: "Report downloaded successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to download report", variant: "destructive" })
    }
  }

  const downloadQRExcel = async () => {
    try {
      const res = await fetch("/api/volunteers/export-qr-excel")
      if (!res.ok) throw new Error("Failed to download")

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `volunteer-emails-qr-${new Date().toISOString().split("T")[0]}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({ title: "Success", description: "QR codes exported successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to download QR codes", variant: "destructive" })
    }
  }

  const [showEditComments, setShowEditComments] = useState(false)
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null)
  const [editingComments, setEditingComments] = useState("")
  const [isSavingComments, setIsSavingComments] = useState(false)

  const totalRecords = records.length
  Pass a unique key prop: `{items.map((item) => <div key={item.id}>...</div>)}`
  const todayRecords = records.filter(
    (r) => new Date(r.check_in_time).toDateString() === new Date().toDateString(),
  ).length
  const remainingCheckIns = totalVolunteers - checkedInToday

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        Viewing {volunteerType === "theta" ? "Θ Theta (Day 1)" : "Δ Delta (Day 2)"} 
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Volunteers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalVolunteers}</div>
            <p className="text-xs text-muted-foreground">Active volunteers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium">Left to Check In</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{remainingCheckIns}</div>
            <p className="text-xs text-muted-foreground">Today pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium">Checked In Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">{checkedInToday}</div>
            <p className="text-xs text-muted-foreground">
              {totalVolunteers > 0 ? `${Math.round((checkedInToday / totalVolunteers) * 100)}%` : "0%"} complete
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalRecords}</div>
            <p className="text-xs text-muted-foreground">All records</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>View and export detailed attendance history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleFilter} className="space-y-4">
            {/* Date and Leader Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
              <div>
                <Label htmlFor="start" className="text-xs">
                  Start Date
                </Label>
                <Input
                  id="start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="end" className="text-xs">
                  End Date
                </Label>
                <Input
                  id="end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="leader" className="text-xs">
                  Leader
                </Label>
                <select
                  id="leader"
                  value={selectedLeader}
                  onChange={(e) => setSelectedLeader(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">All Leaders</option>
                  {leaders.map((leader) => (
                    <option key={leader.id} value={String(leader.id)}>
                      {leader.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Status Filter Dropdown */}
              <div>
                <Label htmlFor="status" className="text-xs">
                  Status
                </Label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">All Status</option>
                  <option value="check_in">Check In</option>
                  <option value="check_out">Check Out</option>
                  <option value="midday_exit">Midday Exit</option>
                </select>
              </div>
              {/* Hall Number Filter Dropdown */}
              <div>
                <Label htmlFor="hall" className="text-xs">
                  Hall
                </Label>
                <select
                  id="hall"
                  value={hallFilter}
                  onChange={(e) => setHallFilter(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">All Halls</option>
                  <option value="1">Hall 1</option>
                  <option value="2">Hall 2</option>
                  <option value="3">Hall 3</option>
                  <option value="4">Hall 4</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit" size="sm" disabled={isLoading}>
                  <RefreshCw className="size-4 mr-2" />
                  Filter
                </Button>
                <Button type="button" onClick={downloadCSV} variant="outline" size="sm" disabled={isLoading}>
                  <Download className="size-4 mr-2" />
                  CSV
                </Button>
                <Button type="button" onClick={downloadQRExcel} variant="outline" size="sm">
                  <Download className="size-4 mr-2" />
                  QR Excel
                </Button>
              </div>
            </div>

            {/* Best Volunteer Checkbox Filter */}
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <input
                type="checkbox"
                id="bestOnly"
                checked={showBestOnly}
                onChange={(e) => setShowBestOnly(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="bestOnly" className="text-sm font-medium cursor-pointer mb-0">
                Show Best Volunteers Only
              </Label>
            </div>
          </form>

          <div className="border-t pt-4">
            {records.length > 0 && (
              <div className="mb-4 text-sm text-muted-foreground">
                Note: Attendance records are permanent audit trails and cannot be cleared.
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-3">
                <RefreshCw className="size-8 animate-spin text-primary" />
                <p className="text-lg font-medium">Loading records...</p>
              </div>
            ) : fetchError ? (
              <div className="text-center py-12 p-6 border-2 border-dashed border-red-200 rounded-xl bg-red-50/30 flex flex-col items-center gap-4">
                <div className="size-12 rounded-full bg-red-100 flex items-center justify-center">
                  <RefreshCw className="size-6 text-red-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-bold text-red-800">Unable to load report</p>
                  <p className="text-sm text-red-600 max-w-md mx-auto">{fetchError}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => fetchReport()} className="mt-2 border-red-200 hover:bg-red-50">
                  Try Again
                </Button>
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/30">
                <p className="text-muted-foreground">No attendance records found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Volunteer</TableHead>
                      <TableHead>Hall</TableHead>
                      <TableHead>Check-in Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Best Volunteer</TableHead>
                      <TableHead>Comments</TableHead>
                      <TableHead>Leader</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          [{record.volunteer_code || record.volunteer_id}] {record.name}
                          {record.is_extra_day && (
                            <Badge className="ml-2 bg-purple-100 text-purple-700">Extra Day</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{record.hall_number || "-"}</TableCell>
                        <TableCell className="text-sm">{new Date(record.check_in_time).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              record.attendance_type === "check_in"
                                ? "bg-green-50 text-green-700"
                                : record.attendance_type === "check_out"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-orange-50 text-orange-700"
                            }
                          >
                            {record.attendance_type === "check_in"
                              ? "Check In"
                              : record.attendance_type === "check_out"
                                ? "Check Out"
                                : "Midday Exit"}
                          </Badge>
                        </TableCell>
                        {/* Best Volunteer Badge Column */}
                        <TableCell>
                          {record.is_best_volunteer ? (
                            <Badge className="bg-amber-500">Best</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate">{record.notes || "-"}</TableCell>
                        <TableCell className="text-sm">{record.leader_name || "-"}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingRecord(record)
                              setEditingComments(record.notes || "")
                              setShowEditComments(true)
                            }}
                          >
                            <Edit2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog for Edit Comments */}
      <Dialog open={showEditComments} onOpenChange={setShowEditComments}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Comments</DialogTitle>
          </DialogHeader>
          {editingRecord && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-semibold">{editingRecord.name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(editingRecord.check_in_time).toLocaleString()}
                </p>
              </div>
              <div>
                <Label htmlFor="comments">Comments</Label>
                <Textarea
                  id="comments"
                  value={editingComments}
                  onChange={(e) => setEditingComments(e.target.value)}
                  placeholder="Add or edit comments..."
                  rows={4}
                  className="mt-2"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowEditComments(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveComments} disabled={isSavingComments}>
                  {isSavingComments ? "Saving..." : "Save Comments"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
