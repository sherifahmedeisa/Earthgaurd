"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { LogOut, LogIn, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Checkbox } from "@/components/ui/checkbox"

interface Volunteer {
  id: number
  name: string
  email?: string
  phone?: string
  volunteer_code: string
  volunteer_type: "theta" | "delta"
  status?: "checked_in" | "checked_out" | "not_checked"
  shift?: "Morning" | "Evening"
}

export function BulkOperations() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)
  const [showCheckinDialog, setShowCheckinDialog] = useState(false)
  const [checkedInVolunteers, setCheckedInVolunteers] = useState<Volunteer[]>([])
  const [notCheckedInVolunteers, setNotCheckedInVolunteers] = useState<Volunteer[]>([])
  const [selectedCheckout, setSelectedCheckout] = useState<Set<number>>(new Set())
  const [selectedCheckin, setSelectedCheckin] = useState<Set<number>>(new Set())
  const [checkoutShiftFilter, setCheckoutShiftFilter] = useState<"all" | "Morning" | "Evening">("all")
  const [checkinShiftFilter, setCheckinShiftFilter] = useState<"all" | "Morning" | "Evening">("all")

  useEffect(() => {
    if (showCheckoutDialog) {
      fetchCheckedInVolunteers()
    }
  }, [showCheckoutDialog])

  useEffect(() => {
    if (showCheckinDialog) {
      fetchNotCheckedInVolunteers()
    }
  }, [showCheckinDialog])

  const fetchCheckedInVolunteers = async () => {
    try {
      const response = await fetch("/api/volunteers?status=checked_in")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      const volunteers: Volunteer[] = Array.isArray(data) ? data : data.volunteers || []
      console.log("[v0] Fetched checked-in volunteers:", volunteers.slice(0, 3))
      console.log("[v0] Sample shift values:", volunteers.slice(0, 3).map((v) => ({ name: v.name, shift: v.shift })))
      setCheckedInVolunteers(volunteers)
    } catch (error) {
      console.error("[v0] Error fetching checked-in volunteers:", error)
      toast({
        title: "Error",
        description: "Failed to fetch checked-in volunteers",
        variant: "destructive",
      })
    }
  }

  const fetchNotCheckedInVolunteers = async () => {
    try {
      const response = await fetch("/api/volunteers?status=not_checked")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      const volunteers: Volunteer[] = Array.isArray(data) ? data : data.volunteers || []
      console.log("[v0] Fetched not-checked-in volunteers:", volunteers.slice(0, 3))
      console.log("[v0] Sample shift values:", volunteers.slice(0, 3).map((v) => ({ name: v.name, shift: v.shift })))
      setNotCheckedInVolunteers(volunteers)
    } catch (error) {
      console.error("[v0] Error fetching not-checked-in volunteers:", error)
      toast({
        title: "Error",
        description: "Failed to fetch volunteers",
        variant: "destructive",
      })
    }
  }

  // Filter volunteers based on shift
  const filteredCheckedInVolunteers = checkoutShiftFilter === "all" 
    ? checkedInVolunteers 
    : checkedInVolunteers.filter(v => v.shift === checkoutShiftFilter)

  const filteredNotCheckedInVolunteers = checkinShiftFilter === "all"
    ? notCheckedInVolunteers
    : notCheckedInVolunteers.filter(v => v.shift === checkinShiftFilter)

  const toggleCheckoutSelection = (volunteerId: number) => {
    const newSelected = new Set(selectedCheckout)
    if (newSelected.has(volunteerId)) {
      newSelected.delete(volunteerId)
    } else {
      newSelected.add(volunteerId)
    }
    setSelectedCheckout(newSelected)
  }

  const toggleCheckinSelection = (volunteerId: number) => {
    const newSelected = new Set(selectedCheckin)
    if (newSelected.has(volunteerId)) {
      newSelected.delete(volunteerId)
    } else {
      newSelected.add(volunteerId)
    }
    setSelectedCheckin(newSelected)
  }

  const handleBulkCheckout = async () => {
    if (selectedCheckout.size === 0) {
      toast({
        title: "Error",
        description: "Please select at least one volunteer",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/attendance/bulk-checkout-selected", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volunteerIds: Array.from(selectedCheckout),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to check out volunteers",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      setSelectedCheckout(new Set())
      toast({
        title: "Success",
        description: `${data.processed} volunteer(s) checked out successfully`,
      })
      await fetchCheckedInVolunteers()
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during bulk checkout",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkCheckin = async () => {
    if (selectedCheckin.size === 0) {
      toast({
        title: "Error",
        description: "Please select at least one volunteer",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/attendance/bulk-checkin-selected", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volunteerIds: Array.from(selectedCheckin),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to check in volunteers",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      setSelectedCheckin(new Set())
      toast({
        title: "Success",
        description: `${data.processed} volunteer(s) checked in successfully`,
      })
      await fetchNotCheckedInVolunteers()
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during bulk checkin",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectAllCheckout = () => {
    if (selectedCheckout.size === filteredCheckedInVolunteers.length) {
      setSelectedCheckout(new Set())
    } else {
      setSelectedCheckout(new Set(filteredCheckedInVolunteers.map((v) => v.id)))
    }
  }

  const selectAllCheckin = () => {
    if (selectedCheckin.size === filteredNotCheckedInVolunteers.length) {
      setSelectedCheckin(new Set())
    } else {
      setSelectedCheckin(new Set(filteredNotCheckedInVolunteers.map((v) => v.id)))
    }
  }

  return (
    <>
      <div className="flex gap-4">
        <Button
          onClick={() => setShowCheckoutDialog(true)}
          variant="destructive"
          size="lg"
          className="gap-2"
          disabled={isLoading}
        >
          <LogOut className="h-4 w-4" />
          {isLoading ? "Processing..." : "Bulk Checkout"}
        </Button>

        <Button
          onClick={() => setShowCheckinDialog(true)}
          variant="default"
          size="lg"
          className="gap-2"
          disabled={isLoading}
        >
          <LogIn className="h-4 w-4" />
          {isLoading ? "Processing..." : "Bulk Check-in"}
        </Button>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-destructive" />
              Select Volunteers to Check Out
            </DialogTitle>
            <DialogDescription>
              {selectedCheckout.size} of {filteredCheckedInVolunteers.length} selected
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Shift Filter for Checkout */}
            <div className="flex gap-2">
              <Button
                variant={checkoutShiftFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setCheckoutShiftFilter("all")}
              >
                All Shifts
              </Button>
              <Button
                variant={checkoutShiftFilter === "Morning" ? "default" : "outline"}
                size="sm"
                onClick={() => setCheckoutShiftFilter("Morning")}
              >
                Morning
              </Button>
              <Button
                variant={checkoutShiftFilter === "Evening" ? "default" : "outline"}
                size="sm"
                onClick={() => setCheckoutShiftFilter("Evening")}
              >
                Evening
              </Button>
            </div>

            {filteredCheckedInVolunteers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {checkedInVolunteers.length === 0
                  ? "No volunteers checked in"
                  : `No volunteers with selected shift`}
              </p>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllCheckout}
                  className="w-full"
                >
                  {selectedCheckout.size === filteredCheckedInVolunteers.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>

                <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
                  {filteredCheckedInVolunteers.map((volunteer) => (
                    <div
                      key={volunteer.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer transition"
                      onClick={() => toggleCheckoutSelection(volunteer.id)}
                    >
                      <Checkbox
                        checked={selectedCheckout.has(volunteer.id)}
                        onCheckedChange={() => toggleCheckoutSelection(volunteer.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{volunteer.name}</p>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <span>{volunteer.volunteer_code}</span>
                          {volunteer.shift && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded">
                              {volunteer.shift}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge
                        className={
                          volunteer.volunteer_type === "theta"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }
                      >
                        {volunteer.volunteer_type === "theta" ? "Θ Theta" : "Δ Delta"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCheckoutDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkCheckout}
              disabled={isLoading || selectedCheckout.size === 0}
              className="gap-2"
            >
              {isLoading && <Spinner className="h-4 w-4" />}
              Check Out {selectedCheckout.size > 0 ? `(${selectedCheckout.size})` : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check-in Dialog */}
      <Dialog open={showCheckinDialog} onOpenChange={setShowCheckinDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5 text-green-600" />
              Select Volunteers to Check In
            </DialogTitle>
            <DialogDescription>
              {selectedCheckin.size} of {filteredNotCheckedInVolunteers.length} selected
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Shift Filter for Check-in */}
            <div className="flex gap-2">
              <Button
                variant={checkinShiftFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setCheckinShiftFilter("all")}
              >
                All Shifts
              </Button>
              <Button
                variant={checkinShiftFilter === "Morning" ? "default" : "outline"}
                size="sm"
                onClick={() => setCheckinShiftFilter("Morning")}
              >
                Morning
              </Button>
              <Button
                variant={checkinShiftFilter === "Evening" ? "default" : "outline"}
                size="sm"
                onClick={() => setCheckinShiftFilter("Evening")}
              >
                Evening
              </Button>
            </div>

            {filteredNotCheckedInVolunteers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {notCheckedInVolunteers.length === 0
                  ? "All volunteers are checked in"
                  : `No volunteers with selected shift`}
              </p>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllCheckin}
                  className="w-full"
                >
                  {selectedCheckin.size === filteredNotCheckedInVolunteers.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>

                <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
                  {filteredNotCheckedInVolunteers.map((volunteer) => (
                    <div
                      key={volunteer.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer transition"
                      onClick={() => toggleCheckinSelection(volunteer.id)}
                    >
                      <Checkbox
                        checked={selectedCheckin.has(volunteer.id)}
                        onCheckedChange={() => toggleCheckinSelection(volunteer.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{volunteer.name}</p>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <span>{volunteer.volunteer_code}</span>
                          {volunteer.shift && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded">
                              {volunteer.shift}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge
                        className={
                          volunteer.volunteer_type === "theta"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }
                      >
                        {volunteer.volunteer_type === "theta" ? "Θ Theta" : "Δ Delta"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCheckinDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkCheckin}
              disabled={isLoading || selectedCheckin.size === 0}
              className="gap-2"
            >
              {isLoading && <Spinner className="h-4 w-4" />}
              Check In {selectedCheckin.size > 0 ? `(${selectedCheckin.size})` : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
