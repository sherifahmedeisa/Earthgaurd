"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

type AttendeeRecord = {
  id: number
  attendee_id: number
  name: string
  email: string
  check_in_time: string
  attendance_type: string
  leader_name: string | null
  attendee_code?: string
}

export function AttendeeReportDashboard() {
  const { toast } = useToast()
  const [records, setRecords] = useState<AttendeeRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedLeader, setSelectedLeader] = useState<string>("")
  const [leaders, setLeaders] = useState<Array<{ id: number; name: string }>>([])
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [totalAttendees, setTotalAttendees] = useState(0)
  const [checkedInToday, setCheckedInToday] = useState(0)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    fetchLeaders()
    fetchReport()
    fetchCheckInStats()

    // Listen for real-time updates from the scanner
    const handleUpdate = () => {
      fetchReport()
      fetchCheckInStats()
    }
    window.addEventListener("attendee-attendance-recorded", handleUpdate)
    return () => window.removeEventListener("attendee-attendance-recorded", handleUpdate)
  }, [])

  const fetchCheckInStats = async () => {
    try {
      const res = await fetch(`/api/attendees/report/stats`)
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      setTotalAttendees(data.total_attendees)
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
    status?: string,
  ) => {
    setFetchError(null)
    try {
      const params = new URLSearchParams()
      if (start) params.append("startDate", start)
      if (end) params.append("endDate", end)
      if (leader) params.append("leaderId", leader)
      if (status) params.append("status", status)

      const res = await fetch(`/api/attendees/report?${params}`)
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch report")
      }
      
      setRecords(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch report"
      setFetchError(message)
      toast({ 
        title: "Error", 
        description: message, 
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault()
    fetchReport(startDate, endDate, selectedLeader, statusFilter)
  }

  const downloadCSV = async () => {
    try {
      const params = new URLSearchParams({ format: "csv" })
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)
      if (selectedLeader) params.append("leaderId", selectedLeader)
      if (statusFilter) params.append("status", statusFilter)

      const res = await fetch(`/api/attendees/report?${params}`)
      if (!res.ok) throw new Error("Failed to download")

      const csv = await res.text()
      const blob = new Blob([csv], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `attendee-report-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({ title: "Success", description: "Report downloaded successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to download report", variant: "destructive" })
    }
  }

  const totalRecords = records.length
  const remainingCheckIns = totalAttendees - checkedInToday

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Attendees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalAttendees}</div>
            <p className="text-xs text-muted-foreground">Active attendees</p>
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
              {totalAttendees > 0 ? `${Math.round((checkedInToday / totalAttendees) * 100)}%` : "0%"} complete
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalRecords}</div>
            <p className="text-xs text-muted-foreground">All check-ins/outs</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendee Records</CardTitle>
          <CardDescription>View and export detailed attendance history for attendees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleFilter} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              <div className="col-span-1">
                <Label htmlFor="start" className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Start Date</Label>
                <Input
                  id="start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 h-9 text-xs"
                />
              </div>
              <div className="col-span-1">
                <Label htmlFor="end" className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">End Date</Label>
                <Input
                  id="end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 h-9 text-xs"
                />
              </div>
              <div className="col-span-1">
                <Label htmlFor="leader" className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Leader</Label>
                <select
                  id="leader"
                  value={selectedLeader}
                  onChange={(e) => setSelectedLeader(e.target.value)}
                  className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">All Leaders</option>
                  {leaders.map((leader) => (
                    <option key={leader.id} value={String(leader.id)}>
                      {leader.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <Label htmlFor="status" className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Status</Label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">All Status</option>
                  <option value="check_in">Check In</option>
                </select>
              </div>
              <div className="col-span-2 lg:col-span-1 flex items-end gap-2">
                <Button type="submit" size="sm" disabled={isLoading} className="flex-1 h-9">
                  <RefreshCw className={cn("size-3 mr-2", isLoading && "animate-spin")} />
                  Filter
                </Button>
                <Button type="button" onClick={downloadCSV} variant="outline" size="sm" disabled={isLoading} className="flex-1 h-9">
                  <Download className="size-3 mr-2" />
                  CSV
                </Button>
              </div>
            </div>
          </form>

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
                <p className="text-muted-foreground">No attendee records found</p>
              </div>
            ) : (
              <div className="rounded-xl border bg-white overflow-hidden">
              {/* Mobile Card View */}
              <div className="grid grid-cols-1 divide-y md:hidden">
                {records.map((record) => (
                  <div key={record.id} className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-slate-900">{record.name}</div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 text-[10px] uppercase font-bold">
                        Check In
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{new Date(record.check_in_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      <span className="font-medium text-slate-700">Leader: {record.leader_name || "-"}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-bold text-slate-700">Attendee</TableHead>
                      <TableHead className="font-bold text-slate-700">Time</TableHead>
                      <TableHead className="font-bold text-slate-700">Status</TableHead>
                      <TableHead className="font-bold text-slate-700">Leader</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow key={record.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-medium text-slate-900">
                          <div className="flex flex-col">
                            <span>{record.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono uppercase">{record.attendee_code || record.attendee_id}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{new Date(record.check_in_time).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-100 font-bold text-[10px] uppercase"
                          >
                            Check In
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{record.leader_name || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
