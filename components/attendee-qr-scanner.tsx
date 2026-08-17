"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Camera, Square, Check, User } from "lucide-react"

type AttendeeData = {
  id: number
  name: string
  email: string
  phone: string | null
  attendee_code?: string
}

export function AttendeeQRScanner() {
  const { toast } = useToast()
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [manualQR, setManualQR] = useState("")
  const [cameraError, setCameraError] = useState("")
  const [scannerReady, setScannerReady] = useState(false)
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "detected" | "success">("idle")
  const html5QrCodeRef = useRef<any>(null)
  const shouldStartRef = useRef(false)

  const [showAttendeeForm, setShowAttendeeForm] = useState(false)
  const [selectedAttendee, setSelectedAttendee] = useState<AttendeeData | null>(null)
  const [attendeeStatus, setAttendeeStatus] = useState<"checked_in" | "not_checked">("not_checked")

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
        html5QrCodeRef.current.stop().catch(() => { })
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

        const element = document.getElementById("attendee-qr-reader")
        if (!element) {
          setCameraError("Scanner container not found. Please try again.")
          setScanStatus("idle")
          setIsScanning(false)
          return
        }

        html5QrCodeRef.current = new Html5Qrcode("attendee-qr-reader")

        await html5QrCodeRef.current.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
          (decodedText: string) => {
            if (!isProcessing) fetchAttendeeDetails(decodedText)
          },
          () => { },
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

  const fetchAttendeeDetails = async (qrCode: string) => {
    if (isProcessing) return

    setIsProcessing(true)
    setScanStatus("detected")

    try {
      const res = await fetch(`/api/attendees/details?code=${encodeURIComponent(qrCode.trim())}`)

      if (!res.ok) {
        const data = await res.json()
        toast({
          title: "Attendee Not Found",
          description: qrCode.trim() ? `The code "${qrCode.trim()}" does not match any registered attendee.` : "Please enter a valid attendee code.",
          className: "border-red-500 text-red-600 bg-red-50",
        })
        setScanStatus("scanning")
        setIsProcessing(false)
        return
      }

      const attendee = await res.json()
      setAttendeeStatus(attendee.status || "not_checked")

      if (attendee.status === "checked_in") {
        toast({
          title: "Already Checked In",
          description: `${attendee.name} is already checked in for today.`,
          className: "border-red-500 text-red-600 bg-red-50",
        })
        // Open form so user can see they are already checked in
        setSelectedAttendee(attendee)
        setShowAttendeeForm(true)
        setScanStatus("scanning")
        setIsProcessing(false)
        return
      }

      setSelectedAttendee(attendee)
      setShowAttendeeForm(true)
      setScanStatus("scanning")
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch attendee details", variant: "destructive" })
      setScanStatus("scanning")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCheckIn = async () => {
    if (!selectedAttendee) return

    setIsProcessing(true)
    try {
      const res = await fetch("/api/attendees/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendeeId: selectedAttendee.id,
          attendanceType: "check_in",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          title: "Check-in Failed",
          description: data.error || "Failed to record attendance",
          variant: "destructive",
        })
        return
      }

      // Update local status so the UI reflects it immediately
      setAttendeeStatus("checked_in")
      window.dispatchEvent(new CustomEvent("attendee-attendance-recorded"))

      setScanStatus("success")
      toast({
        title: "Check-in Successful!",
        description: `${selectedAttendee.name} has been checked in.`,
        // Removing the manual className and using a standard variant if available, 
        // or just keeping it simple for now to avoid styling issues.
      })

      // Close dialog after a short delay to show success
      setTimeout(() => {
        setShowAttendeeForm(false)
        setSelectedAttendee(null)
        setScanStatus("scanning")
      }, 1500)
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
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
    } catch (error) {
      console.warn("Scanner stop warning:", error)
    } finally {
      setIsScanning(false)
      setCameraError("")
      setScanStatus("idle")
      shouldStartRef.current = false
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let code = manualQR.trim()
    if (/^\d+$/.test(code)) {
      code = `A-${code}`
    }
    if (code) {
      fetchAttendeeDetails(code)
      setManualQR("")
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Camera className="size-5" />
            Attendee QR Scanner
          </CardTitle>
          <CardDescription>Scan attendee QR codes to check them in or out</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {isScanning ? (
            <div className="relative">
              <Badge variant="secondary" className="mb-3 bg-blue-100">
                {scanStatus === "scanning" ? "Scanning..." : "Processing..."}
              </Badge>
              <div
                id="attendee-qr-reader"
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
              Attendee Code or ID
            </Label>
            <div className="flex gap-2">
              <Input
                id="qr-manual"
                placeholder="Enter A- . . . . (e.g. 0001)"
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

      <Dialog open={showAttendeeForm} onOpenChange={setShowAttendeeForm}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirm Attendance</DialogTitle>
          </DialogHeader>
          {selectedAttendee && (
            <div className="space-y-4 sm:space-y-6">
              <div className="p-3 sm:p-4 bg-blue-50 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <User className="size-5 text-blue-600" />
                  <span className="font-semibold text-base sm:text-lg">{selectedAttendee.name}</span>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-blue-700">
                    ID: {selectedAttendee.attendee_code || selectedAttendee.id}
                  </p>
                  <p>Email: {selectedAttendee.email}</p>
                  {selectedAttendee.phone && <p>Phone: {selectedAttendee.phone}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      className={
                        attendeeStatus === "checked_in"
                          ? "bg-green-600"
                          : "bg-gray-500"
                      }
                    >
                      {attendeeStatus === "checked_in"
                        ? "Checked In"
                        : "Not Checked"}
                    </Badge>
                  </div>
                </div>
              </div>

              {attendeeStatus === "checked_in" ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800 text-center">
                    Attendee is already checked in.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 text-center">
                    Ready to check in this attendee.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1 order-2 sm:order-1 bg-transparent"
                  onClick={() => setShowAttendeeForm(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                {attendeeStatus === "checked_in" ? (
                  <Button
                    className="flex-1 bg-gray-500 hover:bg-gray-500 order-1 sm:order-2 cursor-default"
                    disabled={true}
                  >
                    Already Checked In
                  </Button>
                ) : (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 order-1 sm:order-2"
                    onClick={handleCheckIn}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Recording..." : "Check In"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
