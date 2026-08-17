"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, X, Loader2, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type LeaderRequest = {
  id: number
  name: string
  email: string
  created_at: string
}

export function LeaderRequests() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<LeaderRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)

  const fetchRequests = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/leaders/requests")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setRequests(data)
    } catch (error) {
      console.error("Fetch error:", error)
      toast({ title: "Error", description: "Failed to fetch leader requests", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  Add a declared dependency array `useEffect(() => { ... }, [dependency])`
    fetchRequests()
  }, [])

  const handleAction = async (leaderId: number, action: "approve" | "reject") => {
    setProcessingId(leaderId)
    try {
      const res = await fetch("/api/leaders/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaderId, action }),
      })

      if (!res.ok) throw new Error(`Failed to ${action}`)

      toast({ 
        title: "Success", 
        description: `Leader ${action === "approve" ? "approved" : "rejected"} successfully` 
      })
      
      setRequests(requests.filter(r => r.id !== leaderId))
    } catch (error) {
      toast({ title: "Error", description: `Failed to ${action} leader`, variant: "destructive" })
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserPlus className="size-5" />
          <div>
            <CardTitle>Leader Requests</CardTitle>
            <CardDescription>Approve or reject new leader sign-ups</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p>Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/30">
            <p className="text-muted-foreground">No pending leader requests</p>
          </div>
        ) : (
          <div className="rounded-xl border bg-white overflow-hidden">
            {/* Mobile Card View */}
            <div className="grid grid-cols-1 divide-y md:hidden">
              {requests.map((request) => (
                <div key={request.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-900">{request.name}</div>
                      <div className="text-xs text-slate-500 truncate">{request.email}</div>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-9 text-red-600 border-red-100 bg-red-50 hover:bg-red-100 font-bold text-xs"
                      onClick={() => handleAction(request.id, "reject")}
                      disabled={processingId === request.id}
                    >
                      <X className="size-3.5 mr-2" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 h-9 bg-green-600 hover:bg-green-700 font-bold text-xs"
                      onClick={() => handleAction(request.id, "approve")}
                      disabled={processingId === request.id}
                    >
                      <Check className="size-3.5 mr-2" />
                      Approve
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
                    <TableHead className="font-bold text-slate-700">Name</TableHead>
                    <TableHead className="font-bold text-slate-700">Email</TableHead>
                    <TableHead className="font-bold text-slate-700">Requested On</TableHead>
                    <TableHead className="text-right font-bold text-slate-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-semibold text-slate-900">{request.name}</TableCell>
                      <TableCell className="text-slate-600">{request.email}</TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {new Date(request.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100 text-xs font-bold"
                            onClick={() => handleAction(request.id, "reject")}
                            disabled={processingId === request.id}
                          >
                            <X className="size-3.5 mr-1.5" /> Reject
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 px-3 bg-green-600 hover:bg-green-700 text-xs font-bold"
                            onClick={() => handleAction(request.id, "approve")}
                            disabled={processingId === request.id}
                          >
                            <Check className="size-3.5 mr-1.5" /> Approve
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
  )
}
