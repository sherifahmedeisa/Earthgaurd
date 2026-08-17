"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { QRCodeSVG } from "qrcode.react"
import { Plus, Download, Edit2, User, Calendar, ArrowUpDown, ArrowUp, ArrowDown, Send, Loader2, RotateCw, Trash2, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

type Volunteer = {
  id: number
  name: string
  email: string
  phone: string | null
  qr_code: string
  is_active: boolean
  details?: {
    volunteer_id: string | null
  }
  hall_number?: string
  is_best_volunteer?: boolean
  volunteer_type: "theta" | "delta"
  status?: "checked_in" | "checked_out" | "not_checked"
  volunteer_code?: string
  email_sent?: boolean
  shift?: "Morning" | "Evening"
}

type SortOption = "name_asc" | "name_desc" | "code_asc" | "code_desc" | "status" | "hall" | "day_type"

export function VolunteerManager() {
  const router = useRouter()
  const { toast } = useToast()
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null)
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [hallFilter, setHallFilter] = useState("")
  const [bestVolunteerOnly, setBestVolunteerOnly] = useState(false)
  const [statusFilter, setStatusFilter] = useState<"all" | "checked_in" | "checked_out" | "not_checked">("all")
  const [dayTypeFilter, setDayTypeFilter] = useState<"all" | "theta" | "delta">("all")
  const [shiftFilter, setShiftFilter] = useState<"all" | "Morning" | "Evening">("all")
  const [statusSummary, setStatusSummary] = useState({ checked_in: 0, checked_out: 0, not_checked: 0 })
  const [currentDayType, setCurrentDayType] = useState<"theta" | "delta">("theta")
  const [sortBy, setSortBy] = useState<SortOption>("name_asc")
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    volunteer_id: "",
    hall_number: "",
    is_best_volunteer: false,
    volunteer_type: "theta",
  })

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    hall_number: "",
    is_best_volunteer: false,
    volunteer_type: "theta" as "theta" | "delta",
    shift: "Morning" as "Morning" | "Evening",
  })

  const [isSendingQR, setIsSendingQR] = useState(false)
  const [sendingVolunteerId, setSendingVolunteerId] = useState<number | null>(null)

  const sortedVolunteers = useMemo(() => {
    const sorted = [...volunteers]
    switch (sortBy) {
      case "name_asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case "name_desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name))
      case "code_asc":
        return sorted.sort((a, b) => {
          const codeA = a.volunteer_code || a.details?.volunteer_id || ""
          const codeB = b.volunteer_code || b.details?.volunteer_id || ""
          return codeA.localeCompare(codeB, undefined, { numeric: true })
        })
      case "code_desc":
        return sorted.sort((a, b) => {
          const codeA = a.volunteer_code || a.details?.volunteer_id || ""
          const codeB = b.volunteer_code || b.details?.volunteer_id || ""
          return codeB.localeCompare(codeA, undefined, { numeric: true })
        })
      case "status":
        const statusOrder = { checked_in: 0, not_checked: 1, checked_out: 2 }
        return sorted.sort((a, b) => {
          const orderA = statusOrder[a.status || "not_checked"]
          const orderB = statusOrder[b.status || "not_checked"]
          return orderA - orderB
        })
      case "hall":
        return sorted.sort((a, b) => (a.hall_number || "Z").localeCompare(b.hall_number || "Z"))
      case "day_type":
        return sorted.sort((a, b) => a.volunteer_type.localeCompare(b.volunteer_type))
      default:
        return sorted
    }
  }, [volunteers, sortBy])

  const fetchCurrentDayType = useCallback(async () => {
    try {
      const res = await fetch("/api/volunteers/current-day")
      if (res.ok) {
        const data = await res.json()
        setCurrentDayType(data.dayType)
      }
    } catch (error) {
      console.error("Failed to fetch current day type:", error)
    }
  }, [])

  const fetchStatusSummary = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      params.append("dayType", currentDayType)
      const res = await fetch(`/api/volunteers/status-summary?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setStatusSummary(data)
      }
    } catch (error) {
      console.error("Failed to fetch status summary:", error)
    }
  }, [currentDayType])

  const fetchVolunteers = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (hallFilter) params.append("hall", hallFilter)
      if (bestVolunteerOnly) params.append("bestOnly", "true")
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (dayTypeFilter !== "all") params.append("dayType", dayTypeFilter)
      if (shiftFilter !== "all") params.append("shift", shiftFilter)

      const url = `/api/volunteers?${params.toString()}`
      console.log("[v0] Fetching volunteers with URL:", url)
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      console.log("[v0] Received volunteers count:", data.length)
      console.log("[v0] Sample shifts:", data.slice(0, 3).map((v: any) => ({ name: v.name, shift: v.shift })))
      setVolunteers(data)
    } catch (error) {
      console.error("[v0] Fetch error:", error)
      toast({ title: "Error", description: "Failed to fetch volunteers", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, hallFilter, bestVolunteerOnly, statusFilter, dayTypeFilter, shiftFilter, toast])

  useEffect(() => {
    fetchCurrentDayType()
  }, [fetchCurrentDayType])

  useEffect(() => {
    const handleAttendanceRecorded = () => {
      fetchVolunteers()
      fetchStatusSummary()
    }

    window.addEventListener("attendance-recorded", handleAttendanceRecorded)
    return () => window.removeEventListener("attendance-recorded", handleAttendanceRecorded)
  }, [fetchVolunteers, fetchStatusSummary])

  useEffect(() => {
    fetchVolunteers()
    fetchStatusSummary()
  }, [fetchVolunteers, fetchStatusSummary])

  // Trigger fetch when any filter changes
  useEffect(() => {
    setIsLoading(true)
    fetchVolunteers()
  }, [searchTerm, hallFilter, bestVolunteerOnly, statusFilter, dayTypeFilter, shiftFilter, fetchVolunteers])

  const handleAddVolunteer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.volunteer_id) {
      toast({ title: "Error", description: "Name, email, and volunteer ID required", variant: "destructive" })
      return
    }

    try {
      const res = await fetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        if (res.status === 409) {
          const error = await res.json()
          toast({
            title: "Email Already Exists",
            description: error.error || "A volunteer with this email already exists",
            variant: "destructive",
          })
          return
        }
        throw new Error("Failed to add volunteer")
      }

      const newVolunteer = await res.json()
      setVolunteers([newVolunteer, ...volunteers])
      setFormData({
        name: "",
        email: "",
        phone: "",
        volunteer_id: "",
        hall_number: "",
        is_best_volunteer: false,
        volunteer_type: "theta",
      })
      setIsAdding(false)
      toast({ title: "Success", description: "Volunteer added successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to add volunteer", variant: "destructive" })
    }
  }

  const handleEditVolunteer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingVolunteer) return

    if (!editFormData.name || !editFormData.email) {
      toast({ title: "Error", description: "Name and email required", variant: "destructive" })
      return
    }

    try {
      const res = await fetch(`/api/volunteers/${editingVolunteer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      })

      if (!res.ok) throw new Error("Failed to update volunteer")
      const updatedVolunteer = await res.json()
      setVolunteers(volunteers.map((v) => (v.id === editingVolunteer.id ? updatedVolunteer : v)))
      setEditingVolunteer(null)
      setIsEditing(false)
      toast({ title: "Success", description: "Volunteer updated successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to update volunteer", variant: "destructive" })
    }
  }

  const openEditDialog = (volunteer: Volunteer) => {
    setEditingVolunteer(volunteer)
    setEditFormData({
      name: volunteer.name,
      email: volunteer.email,
      phone: volunteer.phone || "",
      hall_number: volunteer.hall_number || "",
      is_best_volunteer: volunteer.is_best_volunteer || false,
      volunteer_type: volunteer.volunteer_type || "theta",
      shift: volunteer.shift || "Morning",
    })
    setIsEditing(true)
  }

  const handleDeleteVolunteer = async () => {
    if (!deleteConfirm) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/volunteers/${deleteConfirm.id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete volunteer")
      setVolunteers(volunteers.filter((v) => v.id !== deleteConfirm.id))
      setDeleteConfirm(null)
      toast({ title: "Success", description: "Volunteer deleted successfully" })
      fetchVolunteers()
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete volunteer", variant: "destructive" })
    } finally {
      setIsDeleting(false)
    }
  }

  const downloadQR = (volunteer: Volunteer) => {
    const element = document.getElementById(`qr-${volunteer.id}`)
    if (element) {
      const svg = element.querySelector("svg") as SVGSVGElement
      if (svg) {
        // Convert SVG to canvas for download
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const svgData = new XMLSerializer().serializeToString(svg)
        const img = new Image()

        canvas.width = 250
        canvas.height = 250

        img.onload = () => {
          ctx?.drawImage(img, 0, 0)
          const link = document.createElement("a")
          link.href = canvas.toDataURL("image/png")
          link.download = `${volunteer.volunteer_code || volunteer.name}-qr.png`
          link.click()
        }

        img.src = "data:image/svg+xml;base64," + btoa(svgData)
      }
    }
  }

  const goToProfile = (volunteerId: number) => {
    router.push(`/dashboard/profile/${volunteerId}`)
  }

  const sendAllQRCodes = async () => {
    if (!confirm(`Are you sure you want to send QR codes to all ${volunteers.length} volunteers? This will send emails to everyone.`)) {
      return
    }

    setIsSendingQR(true)
    try {
      const res = await fetch("/api/volunteers/send-bulk-qr", {
        method: "POST",
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to send emails")
      }

      toast({
        title: "QR Codes Sent",
        description: `Successfully sent ${data.success} emails. ${data.failed > 0 ? `${data.failed} failed.` : ""}`,
      })

      if (data.errors && data.errors.length > 0) {
        console.log("Failed emails:", data.errors)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send QR codes",
        variant: "destructive",
      })
    } finally {
      setIsSendingQR(false)
    }
  }

  const sendIndividualQR = async (volunteer: Volunteer) => {
    if (volunteer.email_sent) {
      const confirmed = confirm(`Resend QR code to ${volunteer.name}? They will receive the email again.`)
      if (!confirmed) return
    }

    setSendingVolunteerId(volunteer.id)
    try {
      const res = await fetch("/api/volunteers/send-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volunteerId: volunteer.id,
          email: volunteer.email,
          name: volunteer.name,
          qrCode: volunteer.qr_code,
          code: volunteer.volunteer_code || volunteer.details?.volunteer_id || String(volunteer.id),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to send email")
      }

      toast({
        title: volunteer.email_sent ? "QR Code Resent" : "QR Code Sent",
        description: `Email sent to ${volunteer.email}`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send QR code",
        variant: "destructive",
      })
    } finally {
      setSendingVolunteerId(null)
    }
  }

  const getSortIcon = (column: string) => {
    if (sortBy === `${column}_asc`) return <ArrowUp className="size-3" />
    if (sortBy === `${column}_desc`) return <ArrowDown className="size-3" />
    return <ArrowUpDown className="size-3 opacity-50" />
  }

  const toggleSort = (column: "name" | "code") => {
    if (sortBy === `${column}_asc`) {
      setSortBy(`${column}_desc`)
    } else {
      setSortBy(`${column}_asc`)
    }
  }

  return (
    <div className="space-y-6">
      <Card className={currentDayType === "theta" ? "border-purple-400 bg-purple-50" : "border-blue-400 bg-blue-50"}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className={currentDayType === "theta" ? "text-purple-600" : "text-blue-600"} size={28} />
              <div>
                <div
                  className={`font-semibold text-lg ${currentDayType === "theta" ? "text-purple-800" : "text-blue-800"}`}
                >
                  {currentDayType === "theta" ? "Θ Theta Day" : "Δ Delta Day"}
                </div>
                <div className="text-sm text-gray-600">
                  {currentDayType === "theta" ? "Day 1 - Odd Dates" : "Day 2 - Even Dates"}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${currentDayType === "theta" ? "text-purple-600" : "text-blue-600"}`}>
                {new Date().getDate()}
              </div>
              <div className="text-xs text-gray-500">
                {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short" })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="bg-blue-50/50 border-blue-100 shadow-none">
          <CardContent className="p-3 sm:p-6 flex flex-col items-center justify-center text-center">
            <div className="text-xl sm:text-3xl font-bold text-blue-600">{statusSummary.checked_in}</div>
            <div className="text-[10px] sm:text-sm font-bold text-blue-800/60 uppercase tracking-tight">In</div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50/50 border-orange-100 shadow-none">
          <CardContent className="p-3 sm:p-6 flex flex-col items-center justify-center text-center">
            <div className="text-xl sm:text-3xl font-bold text-orange-600">{statusSummary.not_checked}</div>
            <div className="text-[10px] sm:text-sm font-bold text-orange-800/60 uppercase tracking-tight">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50 border-green-100 shadow-none">
          <CardContent className="p-3 sm:p-6 flex flex-col items-center justify-center text-center">
            <div className="text-xl sm:text-3xl font-bold text-green-600">{statusSummary.checked_out}</div>
            <div className="text-[10px] sm:text-sm font-bold text-green-800/60 uppercase tracking-tight">Out</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-100 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">Volunteers</CardTitle>
              <CardDescription>Manage profiles and check-in status</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={sendAllQRCodes}
                disabled={isSendingQR || volunteers.length === 0}
                className="flex-1 sm:flex-none h-9 bg-slate-50 border-slate-200 text-slate-700 font-bold text-xs"
              >
                {isSendingQR ? (
                  <Loader2 className="size-3 mr-2 animate-spin" />
                ) : (
                  <Send className="size-3 mr-2" />
                )}
                <span className="hidden xs:inline">Send All</span>
                <span className="xs:hidden">All QR</span>
              </Button>
              <Dialog open={isAdding} onOpenChange={setIsAdding}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex-1 sm:flex-none h-9 font-bold text-xs">
                    <Plus className="size-3 mr-2" />
                    Add New
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md w-[95vw] rounded-2xl p-4 sm:p-6">
                  <DialogHeader>
                    <DialogTitle>Add New Volunteer</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddVolunteer} className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-1">
                        <Label htmlFor="volunteer_id">Volunteer ID</Label>
                        <Input
                          id="volunteer_id"
                          value={formData.volunteer_id}
                          onChange={(e) => setFormData({ ...formData, volunteer_id: e.target.value })}
                          placeholder="V001"
                          required
                          className="h-10 mt-1"
                        />
                      </div>
                      <div className="col-span-1">
                        <Label htmlFor="hall_number">Hall (opt)</Label>
                        <Input
                          id="hall_number"
                          value={formData.hall_number}
                          onChange={(e) => setFormData({ ...formData, hall_number: e.target.value })}
                          placeholder="1-4"
                          className="h-10 mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="h-10 mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="h-10 mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="volunteer_type">Group / Day Type</Label>
                      <select
                        id="volunteer_type"
                        value={formData.volunteer_type}
                        onChange={(e) =>
                          setFormData({ ...formData, volunteer_type: e.target.value as "theta" | "delta" })
                        }
                        className="w-full h-10 px-3 py-2 border rounded-md mt-1"
                      >
                        <option value="theta">Θ Theta (Day 1)</option>
                        <option value="delta">Δ Delta (Day 2)</option>
                      </select>
                    </div>
                    <Button type="submit" className="w-full h-11 font-bold rounded-xl mt-2">
                      Add Volunteer
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 space-y-4">
          <div className="p-4 sm:p-0 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              <div className="col-span-2 md:col-span-1">
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <select
                value={hallFilter}
                onChange={(e) => setHallFilter(e.target.value)}
                className="col-span-1 h-9 px-3 py-1 border rounded-md text-xs bg-white"
              >
                <option value="">All Halls</option>
                <option value="1">Hall 1</option>
                <option value="2">Hall 2</option>
                <option value="3">Hall 3</option>
                <option value="4">Hall 4</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="col-span-1 h-9 px-3 py-1 border rounded-md text-xs bg-white"
              >
                <option value="all">All Status</option>
                <option value="checked_in">Checked In</option>
                <option value="checked_out">Checked Out</option>
                <option value="not_checked">Not Checked</option>
              </select>
              <select
                value={dayTypeFilter}
                const [data, setData] = useState<ApiResponse | null>(null);
                className="col-span-1 h-9 px-3 py-1 border rounded-md text-xs bg-white"
              >
                <option value="all">All Groups</option>
                <option value="theta">Θ Theta</option>
                <option value="delta">Δ Delta</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="col-span-1 h-9 px-3 py-1 border rounded-md text-xs bg-white"
              >
                <option value="name_asc">Sort: A-Z</option>
                <option value="code_asc">Sort: ID</option>
                <option value="status">Sort: Status</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-slate-400">
              <Loader2 className="size-8 animate-spin mx-auto mb-2 opacity-20" />
              <p className="text-sm font-medium">Loading volunteers...</p>
            </div>
          ) : sortedVolunteers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 px-4">
              <User className="size-8 mx-auto mb-2 opacity-10" />
              <p className="text-sm">No volunteers found matching your search</p>
            </div>
          ) : (
            <div className="border-t border-slate-100 sm:border-0">
              {/* Mobile Card View */}
              <div className="grid grid-cols-1 divide-y divide-slate-50 md:hidden">
                {sortedVolunteers.map((volunteer) => (
                  <div key={volunteer.id} className="p-4 space-y-3 bg-white hover:bg-slate-50/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`size-8 rounded-lg flex items-center justify-center font-bold text-xs ${volunteer.volunteer_type === 'theta' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {volunteer.volunteer_type === 'theta' ? 'Θ' : 'Δ'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm leading-tight">{volunteer.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {volunteer.volunteer_code || volunteer.details?.volunteer_id || "—"} • Hall {volunteer.hall_number || "-"}
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={`text-[10px] h-5 px-1.5 font-extrabold uppercase ${
                          volunteer.status === "checked_in"
                            ? "bg-blue-600 hover:bg-blue-700"
                            : volunteer.status === "checked_out"
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-slate-200 text-slate-600 shadow-none hover:bg-slate-300"
                        }`}
                      >
                        {volunteer.status === "checked_in" ? "IN" : volunteer.status === "checked_out" ? "OUT" : "PEND"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        {volunteer.email_sent ? (
                          <div className="text-green-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                            <Check className="size-2.5" /> Sent
                          </div>
                        ) : (
                          <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border border-slate-100 bg-slate-50">
                            QR Pending
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => sendIndividualQR(volunteer)}
                          disabled={sendingVolunteerId === volunteer.id}
                          className={`size-8 rounded-lg ${volunteer.email_sent ? 'bg-green-50 text-green-600' : 'bg-slate-100'}`}
                        >
                          {sendingVolunteerId === volunteer.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Send className="size-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => goToProfile(volunteer.id)}
                          className="size-8 rounded-lg bg-slate-100 text-slate-600"
                        >
                          <User className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(volunteer)}
                          className="size-8 rounded-lg bg-slate-100 text-slate-600"
                        >
                          <Edit2 className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirm({ id: volunteer.id, name: volunteer.name })}
                          className="size-8 rounded-lg bg-red-50 text-red-600"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50 border-b">
                    <TableRow>
                      <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider px-4">ID / Group</TableHead>
                      <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider px-4">Name</TableHead>
                      <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider px-4">Hall</TableHead>
                      <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider px-4">Status</TableHead>
                      <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider px-4">Shift</TableHead>
                      <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider px-4 text-center">QR Code</TableHead>
                      <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider px-4 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedVolunteers.map((volunteer) => (
                      <TableRow key={volunteer.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="px-4">
                          <div className="flex flex-col">
                            <span className="font-mono text-xs font-bold text-slate-900">{volunteer.volunteer_code || volunteer.details?.volunteer_id || "—"}</span>
                            <span className={`text-[10px] font-bold uppercase ${volunteer.volunteer_type === 'theta' ? 'text-purple-600' : 'text-blue-600'}`}>
                              {volunteer.volunteer_type}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 font-semibold text-slate-800">{volunteer.name}</TableCell>
                        <TableCell className="px-4 text-slate-600 font-medium">H-{volunteer.hall_number || "-"}</TableCell>
                        <TableCell className="px-4">
                          <Badge
                            className={`text-[10px] font-extrabold uppercase ${
                              volunteer.status === "checked_in"
                                ? "bg-blue-600 hover:bg-blue-700"
                                : volunteer.status === "checked_out"
                                  ? "bg-green-600 hover:bg-green-700"
                                  : "bg-slate-200 text-slate-600 shadow-none hover:bg-slate-300"
                            }`}
                          >
                            {volunteer.status === "checked_in" ? "In" : volunteer.status === "checked_out" ? "Out" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4">
                          <Badge variant="outline" className="text-[10px] font-bold border-slate-200 bg-slate-50">
                            {volunteer.shift || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 text-center">
                          {volunteer.email_sent ? (
                            <div className="text-green-600 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                              <Check className="size-3" /> Sent
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs font-medium">—</span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => sendIndividualQR(volunteer)}
                              disabled={sendingVolunteerId === volunteer.id}
                              className={`size-8 rounded-lg transition-all ${volunteer.email_sent ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'hover:bg-slate-100'}`}
                            >
                              {sendingVolunteerId === volunteer.id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Send className="size-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => goToProfile(volunteer.id)}
                              className="size-8 rounded-lg hover:bg-slate-100 text-slate-500"
                            >
                              <User className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(volunteer)}
                              className="size-8 rounded-lg hover:bg-slate-100 text-slate-500"
                            >
                              <Edit2 className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteConfirm({ id: volunteer.id, name: volunteer.name })}
                              className="size-8 rounded-lg hover:bg-red-50 text-red-600"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
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

      {/* QR Code View Dialog */}
      <Dialog open={!!selectedVolunteer} onOpenChange={() => setSelectedVolunteer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedVolunteer?.name}&apos;s QR Code</DialogTitle>
          </DialogHeader>
          {selectedVolunteer && (
            <div className="flex flex-col items-center gap-4">
              <div id={`qr-${selectedVolunteer.id}`} className="p-4 bg-white rounded-lg">
                <QRCodeSVG
                  value={
                    selectedVolunteer.volunteer_code ||
                    selectedVolunteer.details?.volunteer_id ||
                    String(selectedVolunteer.id)
                  }
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
              <div className="text-center">
                <div className="font-mono text-lg font-bold">
                  {selectedVolunteer.volunteer_code || selectedVolunteer.details?.volunteer_id || selectedVolunteer.id}
                </div>
                <div className="text-sm text-gray-500">Volunteer Code</div>
              </div>
              <Button onClick={() => downloadQR(selectedVolunteer)}>
                <Download className="size-4 mr-2" />
                Download QR
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Volunteer Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Volunteer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditVolunteer} className="space-y-4">
            <div>
              <Label htmlFor="edit_name">Name</Label>
              <Input
                id="edit_name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_email">Email</Label>
              <Input
                id="edit_email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_phone">Phone</Label>
              <Input
                id="edit_phone"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_hall">Hall Number</Label>
              <Input
                id="edit_hall"
                value={editFormData.hall_number}
                onChange={(e) => setEditFormData({ ...editFormData, hall_number: e.target.value })}
                placeholder="1-4"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit_best"
                checked={editFormData.is_best_volunteer}
                onChange={(e) => setEditFormData({ ...editFormData, is_best_volunteer: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="edit_best" className="mb-0">
                Mark as best volunteer
              </Label>
            </div>
            <div>
              <Label htmlFor="edit_volunteer_type">Volunteer Type</Label>
              <select
                id="edit_volunteer_type"
                value={editFormData.volunteer_type}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, volunteer_type: e.target.value as "theta" | "delta" })
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="theta">Θ Theta (Day 1)</option>
                <option value="delta">Δ Delta (Day 2)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="edit_shift">Shift</Label>
              <select
                id="edit_shift"
                value={editFormData.shift}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, shift: e.target.value as "Morning" | "Evening" })
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
              </select>
            </div>
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => !isDeleting && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Volunteer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This will also delete all their attendance records. This action cannot be undone.
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
                onClick={handleDeleteVolunteer}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Trash2 className="size-4 mr-2" />}
                Delete Volunteer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
