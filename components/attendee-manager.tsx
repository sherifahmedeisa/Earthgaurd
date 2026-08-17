"use client"

import type React from "react"
import { useEffect, useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, User, Trash2, Send, Loader2, RotateCw, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

type Attendee = {
  id: number
  name: string
  email: string
  phone: string | null
  qr_code: string
  attendee_code: string | null
  is_active: boolean
  email_sent?: boolean
  status?: "checked_in" | "checked_out" | "not_checked"
}

export function AttendeeManager() {
  const { toast } = useToast()
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sendingAttendeeId, setSendingAttendeeId] = useState<number | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    attendee_code: "",
  })

  const fetchAttendees = useCallback(async () => {
    try {
      setIsLoading(true)
      setFetchError(null)
      const res = await fetch("/api/attendees")
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch attendees")
      }

      setAttendees(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch attendees"
      setFetchError(message)
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchAttendees()

    // Listen for real-time updates from the scanner
    const handleUpdate = () => {
      fetchAttendees()
    }
    window.addEventListener("attendee-attendance-recorded", handleUpdate)
    return () => window.removeEventListener("attendee-attendance-recorded", handleUpdate)
  }, [fetchAttendees])

  const filteredAttendees = useMemo(() => {
    const search = searchTerm.toLowerCase().trim()
    if (!search) return attendees

    const isNumeric = /^\d+$/.test(search)
    const prefixedSearch = isNumeric ? `A-${search}` : search

    return attendees.filter((a) => {
      const nameMatch = a.name.toLowerCase().includes(search)
      const emailMatch = a.email.toLowerCase().includes(search)
      const codeMatch = a.attendee_code && a.attendee_code.toLowerCase().includes(search)

      // If numeric, also try exact match with A- prefix (e.g. "123" matches "A-123")
      const prefixedMatch = isNumeric && a.attendee_code && a.attendee_code.toLowerCase() === prefixedSearch

      return nameMatch || emailMatch || codeMatch || prefixedMatch
    })
  }, [attendees, searchTerm])

  const stats = useMemo(() => {
    return {
      total: attendees.length,
      checkedIn: attendees.filter(a => a.status === "checked_in").length,
      notChecked: attendees.filter(a => a.status === "not_checked").length,
    }
  }, [attendees])

  const handleAddAttendee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) {
      toast({ title: "Error", description: "Name and email required", variant: "destructive" })
      return
    }

    try {
      const res = await fetch("/api/attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        if (res.status === 409) {
          toast({ title: "Error", description: "Email already exists", variant: "destructive" })
          return
        }
        throw new Error("Failed to add attendee")
      }

      const newAttendee = await res.json()
      setAttendees([newAttendee, ...attendees])
      setFormData({ name: "", email: "", phone: "", attendee_code: "" })
      setIsAdding(false)
      toast({ title: "Success", description: "Attendee added successfully" })
      fetchAttendees()
    } catch (error) {
      toast({ title: "Error", description: "Failed to add attendee", variant: "destructive" })
    }
  }

  const sendIndividualQR = async (attendee: Attendee) => {
    if (attendee.email_sent) {
      const confirmed = confirm(`Resend QR code to ${attendee.name}? They will receive the email again.`)
      if (!confirmed) return
    }

    setSendingAttendeeId(attendee.id)
    try {
      const res = await fetch("/api/attendees/send-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendeeId: attendee.id,
          email: attendee.email,
          name: attendee.name,
          qrCode: attendee.qr_code,
          code: attendee.attendee_code || String(attendee.id),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to send email")
      }

      toast({
        title: attendee.email_sent ? "QR Code Resent" : "QR Code Sent",
        description: `Email sent to ${attendee.email}`,
      })

      // Refresh list to show 'Sent' status
      fetchAttendees()
    const [data, setData] = useState<ApiResponse | null>(null);
      toast({
        title: "Error",
        description: error.message || "Failed to send QR code",
        variant: "destructive",
      })
    } finally {
      setSendingAttendeeId(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Attendees</CardTitle>
              <CardDescription>Manage attendee profiles and check-ins</CardDescription>
            </div>
            <Dialog open={isAdding} onOpenChange={setIsAdding}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="size-4 mr-2" />
                  Add Attendee
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Attendee</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddAttendee} className="space-y-4">
                  <div>
                    <Label htmlFor="attendee_code">Attendee ID (Optional)</Label>
                    <Input
                      id="attendee_code"
                      value={formData.attendee_code}
                      onChange={(e) => setFormData({ ...formData, attendee_code: e.target.value })}
                      placeholder="e.g., A001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Add Attendee
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statistics Counter UI */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-muted/50 border p-3 rounded-lg flex flex-col items-center justify-center text-center">
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Total</span>
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
            <div className="bg-green-50 border border-green-100 text-green-700 p-3 rounded-lg flex flex-col items-center justify-center text-center">
              <span className="text-xs uppercase font-bold tracking-wider mb-1">Checked In</span>
              <span className="text-2xl font-bold">{stats.checkedIn}</span>
            </div>
            <div className="bg-gray-50 border border-gray-100 text-gray-600 p-3 rounded-lg flex flex-col items-center justify-center text-center">
              <span className="text-xs uppercase font-bold tracking-wider mb-1">Not Checked</span>
              <span className="text-2xl font-bold">{stats.notChecked}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <Input
              placeholder="Search name, email, or code number (e.g. 123)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md w-full"
            />
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              Showing {filteredAttendees.length} attendee{filteredAttendees.length !== 1 ? "s" : ""}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-3">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-lg font-medium">Loading attendees...</p>
            </div>
          ) : fetchError ? (
            <div className="text-center py-12 p-6 border-2 border-dashed border-red-200 rounded-xl bg-red-50/30 flex flex-col items-center gap-4">
              <div className="size-12 rounded-full bg-red-100 flex items-center justify-center">
                <RotateCw className="size-6 text-red-600" />
              </div>
              <div className="space-y-1">
                <p className="text-xl font-bold text-red-800">Unable to load attendees</p>
                <p className="text-sm text-red-600 max-w-md mx-auto">{fetchError}</p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchAttendees} className="mt-2 border-red-200 hover:bg-red-50">
                Try Again
              </Button>
            </div>
          ) : filteredAttendees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/30">
              No attendees found
            </div>
          ) : (
            <div className="rounded-xl border bg-white overflow-hidden">
              {/* Mobile Card View */}
              <div className="grid grid-cols-1 divide-y md:hidden">
                {filteredAttendees.map((attendee) => (
                  <div key={attendee.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-900">{attendee.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{attendee.attendee_code || "—"}</div>
                      </div>
                      <Badge
                        className={
                          attendee.status === "checked_in"
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-slate-400 hover:bg-slate-500"
                        }
                      >
                        {attendee.status === "checked_in" ? "Checked In" : "Not Checked"}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-600 truncate">{attendee.email}</div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <div>
                        {attendee.email_sent ? (
                          <div className="text-green-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Check className="size-3" /> QR Sent
                          </div>
                        ) : (
                          <div className="text-slate-400 text-[10px] uppercase tracking-wider">QR Not Sent</div>
                        )}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => sendIndividualQR(attendee)}
                        disabled={sendingAttendeeId === attendee.id}
                        className="h-8 px-3 text-xs gap-1.5"
                      >
                        {sendingAttendeeId === attendee.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : attendee.email_sent ? (
                          <>
                            <RotateCw className="size-3" /> Resend
                          </>
                        ) : (
                          <>
                            <Send className="size-3" /> Send QR
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-bold text-slate-700">ID</TableHead>
                      <TableHead className="font-bold text-slate-700">Name</TableHead>
                      <TableHead className="font-bold text-slate-700">Email</TableHead>
                      <TableHead className="font-bold text-slate-700">Status</TableHead>
                      <TableHead className="font-bold text-slate-700">QR Sent</TableHead>
                      <TableHead className="font-bold text-slate-700 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendees.map((attendee) => (
                      <TableRow key={attendee.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-mono text-sm text-slate-500">
                          {attendee.attendee_code || "—"}
                        </TableCell>
                        <TableCell className="font-semibold text-sm text-slate-900">
                          {attendee.name}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {attendee.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              attendee.status === "checked_in"
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-slate-400 hover:bg-slate-500"
                            }
                          >
                            {attendee.status === "checked_in"
                              ? "Checked In"
                              : "Not Checked"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {attendee.email_sent ? (
                            <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 border border-green-100">
                              <Check className="size-3" />
                              <span>Sent</span>
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs font-medium">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sendIndividualQR(attendee)}
                            disabled={sendingAttendeeId === attendee.id}
                            className={`h-8 gap-2 ${attendee.email_sent ? "border-green-200 text-green-700 hover:bg-green-50" : ""}`}
                          >
                            {sendingAttendeeId === attendee.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : attendee.email_sent ? (
                              <>
                                <RotateCw className="size-4" />
                                <span>Resend</span>
                              </>
                            ) : (
                              <>
                                <Send className="size-4" />
                                <span>Send QR</span>
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
