"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Trash2, Loader2, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type AttendanceRecord = {
  id: number
  volunteer_id: number
  volunteer_name: string
  volunteer_code?: string
  leader_id?: number
  leader_name?: string
  attendance_type: "check_in" | "midday_exit" | "check_out"
  check_in_time: string
  check_out_time?: string | null
  notes?: string
}

export function AttendanceRecords() {
  const { toast } = useToast()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<AttendanceRecord | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/attendance")
      if (!res.ok) throw new Error("Failed to fetch attendance records")
      const data = await res.json()
      setRecords(data)
    } catch (error) {
      console.error("Error fetching attendance records:", error)
      toast({ title: "Error", description: "Failed to load attendance records", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteRecord = async () => {
    if (!deleteConfirm) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/attendance/${deleteConfirm.id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete record")
      setRecords(records.filter((r) => r.id !== deleteConfirm.id))
      setDeleteConfirm(null)
      toast({ title: "Success", description: "Attendance record deleted successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete attendance record", variant: "destructive" })
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredRecords = records.filter(
    (r) =>
      r.volunteer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.volunteer_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.leader_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getAttendanceTypeLabel = (type: string) => {
    switch (type) {
      case "check_in":
        return "Check In"
      case "midday_exit":
        return "Midday Exit"
      case "check_out":
        return "Check Out"
      default:
        return type
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Records</CardTitle>
        <CardDescription>View and manage volunteer attendance records</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 size-4 text-gray-400" />
            <Input
              placeholder="Search by name, code, or leader..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-gray-400" />
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {records.length === 0 ? "No attendance records found" : "No records match your search"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Volunteer</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Check-in Time</TableHead>
                  <TableHead>Leader</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-12">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.volunteer_name}</TableCell>
                    <TableCell className="text-sm">{record.volunteer_code || "—"}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {getAttendanceTypeLabel(record.attendance_type)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{formatDateTime(record.check_in_time)}</TableCell>
                    <TableCell className="text-sm">{record.leader_name || "—"}</TableCell>
                    <TableCell className="text-sm text-gray-600">{record.notes || "—"}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(record)}
                        className="p-1 h-8 w-8 text-red-600 hover:bg-red-100"
                        title="Delete Record"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => !isDeleting && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Attendance Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete the {getAttendanceTypeLabel(deleteConfirm?.attendance_type || "")} record
              for <strong>{deleteConfirm?.volunteer_name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteRecord}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Trash2 className="size-4 mr-2" />}
                Delete Record
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
