"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Camera, Square, Check, User } from "lucide-react"
import { BulkOperations } from "@/components/bulk-operations"

type VolunteerData = {
  id: number
  name: string
  email: string
  phone: string | null
  hall_number: string | null
  is_best_volunteer: boolean
  volunteer_type?: "theta" | "delta"
  volunteer_code?: string
}

export function QRScanner() {
  const { toast } = useToast()
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [manualQR, setManualQR] = useState("")
  const [cameraError, setCameraError] = useState("")
  const [scannerReady, setScannerReady] = useState(false)
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "detected" | "success">("idle")
  const html5QrCodeRef = useRef<any>(null)
  const shouldStartRef = useRef(false)

  const [todayDayType, setTodayDayType] = useState<"theta" | "delta">("theta")
  const [isExtraDay, setIsExtraDay] = useState(false)

  const [showVolunteerForm, setShowVolunteerForm] = useState(false)
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerData | null>(null)
  const [comments, setComments] = useState("")
  const [checkInStatus, setCheckInStatus] = useState<"check_in" | "check_out" | "midday_exit">("check_in")
  const [isBestVolunteer, setIsBestVolunteer] = useState(false)
  const [volunteerStatus, setVolunteerStatus] = useState<"checked_in" | "checked_out" | "not_checked">("not_checked")

  useEffect(() => {
    const today = new Date()
    const dayOfMonth = today.getDate()
    const dayType = dayOfMonth % 2 === 1 ? "delta" : "theta"
    setTodayDayType(dayType)
  }, [])

  useEffect(() => {
    if ((window as any).Html5Qrcode) {
      setScannerReady(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"
    script.async = true
    script.onload = () => setScannerReady(true)
    script.onerror = () => setCameraError("Failed to load QR scanner library")
    document.body.appendChild(script)

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {})
      }
    }
  }, [])

  useEffect(() => {
    if (!isScanning || !scannerReady || !shouldStartRef.current) return

    const initScanner = async () => {
      try {
        setCameraError("")
        setScanStatus("scanning")

        const [data, setData] = useState<ApiResponse | null>(null);
        if (!Html5Qrcode) {
          setCameraError("QR Scanner library not loaded")
          setScanStatus("idle")
          setIsScanning(false)
          return
        }

        await new Promise((resolve) => setTimeout(resolve, 100))

        const element = document.getElementById("qr-reader")
        if (!element) {
          setCameraError("Scanner container not found. Please try again.")
          setScanStatus("idle")
          setIsScanning(false)
          return
        }

        html5QrCodeRef.current = new Html5Qrcode("qr-reader")

        await html5QrCodeRef.current.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
          (decodedText: string) => {
            if (!isProcessing) fetchVolunteerDetails(decodedText)
          },
          () => {},
        )

        shouldStartRef.current = false
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Could not access camera"
        setCameraError(errorMessage)
        setScanStatus("idle")
        setIsScanning(false)
        toast({ title: "Camera Error", description: errorMessage, variant: "destructive" })
      }
    }

    initScanner()
  }, [isScanning, scannerReady, isProcessing, toast])

  const fetchVolunteerDetails = async (qrCode: string) => {
    if (isProcessing) return

    setIsProcessing(true)
    setScanStatus("detected")
    console.log("[v0] QR Scanner - scanned code:", qrCode)

    try {
      const res = await fetch("/api/volunteers/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: qrCode.trim() }),
      })

      console.log("[v0] QR Scanner - API response status:", res.status)

      if (!res.ok) {
        const data = await res.json()
        console.log("[v0] QR Scanner - API error:", data)
        toast({ title: "Error", description: data.error || "Volunteer not found", variant: "destructive" })
        setScanStatus("scanning")
        setIsProcessing(false)
        return
      }

      const volunteer = await res.json()
      console.log("[v0] QR Scanner - volunteer found:", volunteer)
      setSelectedVolunteer(volunteer)
      setIsExtraDay(volunteer.volunteer_type && volunteer.volunteer_type !== todayDayType)

      // Fetch volunteer status
      try {
        const statusRes = await fetch(`/api/volunteers/${volunteer.id}/status`)
        if (statusRes.ok) {
          const statusData = await statusRes.json()
          setVolunteerStatus(statusData.status || "not_checked")
          setCheckInStatus(statusData.status === "checked_in" ? "check_out" : "check_in")
        } else {
          setCheckInStatus("check_in")
          setVolunteerStatus("not_checked")
        }
      } catch {
        setCheckInStatus("check_in")
        setVolunteerStatus("not_checked")
      }

      setShowVolunteerForm(true)
      setComments("")
      setScanStatus("scanning")
      setIsBestVolunteer(volunteer.is_best_volunteer)
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch volunteer details", variant: "destructive" })
      setScanStatus("scanning")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCheckIn = async () => {
    if (!selectedVolunteer) return

    setIsProcessing(true)
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volunteerId: selectedVolunteer.id,
          attendanceType: checkInStatus,
          comments,
          isBestVolunteer,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          title: res.status === 409 ? "Already Recorded" : "Error",
          description:
            res.status === 409
              ? "This volunteer has already been recorded today"
              : data.error || "Failed to record attendance",
          variant: "destructive",
        })
        setShowVolunteerForm(false)
        return
      }

      window.dispatchEvent(new CustomEvent("attendance-recorded", { detail: { volunteerId: selectedVolunteer.id } }))

      setScanStatus("success")
      const statusText =
        checkInStatus === "check_in"
          ? "Checked In"
          : checkInStatus === "check_out"
            ? "Checked Out"
            : "Marked Midday Exit"
      const extraDayText = isExtraDay ? " (Extra Day)" : ""
      toast({ title: "Success!", description: `${selectedVolunteer.name} - ${statusText}${extraDayText}` })

      setTimeout(() => {
        setShowVolunteerForm(false)
        setSelectedVolunteer(null)
        setScanStatus("scanning")
      }, 1500)
    } catch (error) {
      toast({ title: "Error", description: "Failed to record attendance", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  const startScanning = () => {
    shouldStartRef.current = true
    setIsScanning(true)
  }

  const stopScanning = async () => {
    try {
      if (html5QrCodeRef.current) {
        const state = html5QrCodeRef.current.getState?.()
        // Only stop if scanner is actually running (state 2) or paused (state 3)
        if (state === 2 || state === 3) {
          await html5QrCodeRef.current.stop()
        }
        html5QrCodeRef.current = null
      }
    } catch {
      // Silently ignore errors when stopping
    }
    setIsScanning(false)
    setCameraError("")
    setScanStatus("idle")
    shouldStartRef.current = false
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualQR.trim()) {
      fetchVolunteerDetails(manualQR)
      setManualQR("")
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Camera className="size-5" />
            QR Code Scanner
          </CardTitle>
          <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 text-xs sm:text-sm">
            <Badge
              className={
                todayDayType === "theta" ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
              }
            >
              {todayDayType === "theta" ? "Θ Theta Day" : "Δ Delta Day"}
            </Badge>
            <span>Scan QR codes to record attendance</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {isScanning ? (
            <div className="relative">
              <Badge variant="secondary" className="mb-3 bg-blue-100">
                {scanStatus === "scanning" ? "Scanning..." : "Processing..."}
              </Badge>
              <div
                id="qr-reader"
                className="rounded-lg overflow-hidden bg-black"
                style={{ width: "100%", minHeight: "280px", maxHeight: "400px" }}
              />
              {cameraError && (
                <p className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {cameraError}
                </p>
              )}
              <Button onClick={stopScanning} variant="destructive" className="w-full mt-4">
                <Square className="size-4 mr-2" />
                Stop Scanner
              </Button>
            </div>
          ) : (
            <Button onClick={startScanning} className="w-full" size="lg" disabled={!scannerReady}>
              <Camera className="size-4 mr-2" />
              {scannerReady ? "Start Camera" : "Loading..."}
            </Button>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-2 bg-card text-muted-foreground">Or enter manually</span>
            </div>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-3">
            <Label htmlFor="qr-manual" className="text-xs sm:text-sm">
              Volunteer Code or ID
            </Label>
            <div className="flex gap-2">
              <Input
                id="qr-manual"
                placeholder="e.g., O-0083 or 1557"
                value={manualQR}
                onChange={(e) => setManualQR(e.target.value)}
                disabled={isProcessing}
                className="flex-1 text-sm"
              />
              <Button type="submit" disabled={isProcessing || !manualQR.trim()} size="default">
                <Check className="size-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Find</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bulk Actions</CardTitle>
          <CardDescription>Select and manage multiple volunteers at once</CardDescription>
        </CardHeader>
        <CardContent>
          <BulkOperations />
        </CardContent>
      </Card>

      <Dialog open={showVolunteerForm} onOpenChange={setShowVolunteerForm}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirm Attendance</DialogTitle>
          </DialogHeader>
          {selectedVolunteer && (
            <div className="space-y-4 sm:space-y-6">
              <div className="p-3 sm:p-4 bg-blue-50 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <User className="size-5 text-blue-600" />
                  <span className="font-semibold text-base sm:text-lg">{selectedVolunteer.name}</span>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-blue-700">
                    ID: {selectedVolunteer.volunteer_code || selectedVolunteer.id}
                  </p>
                  <p>Email: {selectedVolunteer.email}</p>
                  {selectedVolunteer.phone && <p>Phone: {selectedVolunteer.phone}</p>}
                  {selectedVolunteer.hall_number && <p>Hall: {selectedVolunteer.hall_number}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={selectedVolunteer.volunteer_type === "theta" ? "bg-purple-600" : "bg-blue-600"}>
                      {selectedVolunteer.volunteer_type === "theta" ? "Θ Theta" : "Δ Delta"}
                    </Badge>
                    <Badge
                      className={
                        volunteerStatus === "checked_in"
                          ? "bg-green-600"
                          : volunteerStatus === "checked_out"
                            ? "bg-red-600"
                            : "bg-gray-500"
                      }
                    >
                      {volunteerStatus === "checked_in"
                        ? "Checked In"
                        : volunteerStatus === "checked_out"
                          ? "Checked Out"
                          : "Not Checked"}
                    </Badge>
                  </div>
                </div>
              </div>

              {isExtraDay && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs sm:text-sm font-medium text-amber-900">
                    Extra Day: This volunteer is attending on a non-assigned day.
                  </p>
                </div>
              )}

              <div>
                <Label className="text-xs sm:text-sm font-medium mb-2 block">Attendance Type</Label>
                <div className="flex gap-2">
                  {(["check_in", "check_out", "midday_exit"] as const).map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={checkInStatus === type ? "default" : "outline"}
                      className="flex-1 text-xs sm:text-sm py-2"
                      onClick={() => setCheckInStatus(type)}
                    >
                      {type === "check_in" ? "Check In" : type === "check_out" ? "Check Out" : "Midday Exit"}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <input
                  type="checkbox"
                  id="bestVolunteer"
                  checked={isBestVolunteer}
                  onChange={(e) => setIsBestVolunteer(e.target.checked)}
                  disabled={isProcessing}
                  className="rounded"
                />
                <Label htmlFor="bestVolunteer" className="text-xs sm:text-sm font-medium cursor-pointer mb-0">
                  Mark as Best Volunteer
                </Label>
              </div>

              <div>
                <Label htmlFor="comments" className="text-xs sm:text-sm font-medium mb-2 block">
                  Comments (Optional)
                </Label>
                <Textarea
                  id="comments"
                  placeholder="Add notes..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="text-sm"
                  rows={2}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1 order-2 sm:order-1 bg-transparent"
                  onClick={() => setShowVolunteerForm(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 order-1 sm:order-2"
                  onClick={handleCheckIn}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Recording..." : "Confirm"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
