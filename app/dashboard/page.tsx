import { ProtectedLayout } from "@/components/protected-layout"
import { DashboardNav } from "@/components/dashboard-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VolunteerManager } from "@/components/volunteer-manager"
import { AttendeeManager } from "@/components/attendee-manager"
import { QRScanner } from "@/components/qr-scanner"
import { AttendeeQRScanner } from "@/components/attendee-qr-scanner"
import { DashboardTabs } from "@/components/dashboard-tabs"
import { AttendeeReportDashboard } from "@/components/attendee-report-dashboard"
import { LeaderRequests } from "@/components/leader-requests"
import { getSession } from "@/lib/cookies"
import { getLeaderRole } from "@/lib/db"
import { redirect } from "next/navigation"

export default async function Dashboard() {
  const session = await getSession()
  if (!session) {
    redirect("/")
  }

  const role = await getLeaderRole(session.leader_id)
  const isSuperAdmin = role === "super_admin"

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto p-2 sm:p-4 md:p-8">
          <div className="space-y-8">
            <div className="px-1 sm:px-0">
              <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-900">Earthsguard Event</h1>
              <p className="text-[10px] sm:text-xs md:text-base text-slate-500 mt-1 uppercase font-bold tracking-widest">
                {isSuperAdmin ? "Admin Control Panel" : "Leader Check-in Portal"}
              </p>
            </div>

            <Tabs defaultValue={isSuperAdmin ? "scanner" : "attendee_scanner"} className="w-full">
              <TabsList className="flex w-full h-auto overflow-x-auto justify-start p-1 bg-slate-200/50 backdrop-blur-sm sticky top-[64px] sm:top-[80px] z-40 gap-1 rounded-xl no-scrollbar snap-x touch-pan-x border border-slate-200">
                {isSuperAdmin && (
                  <TabsTrigger value="scanner" className="whitespace-nowrap snap-start flex-1 py-2.5 px-4 text-xs font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Volunteer Scanner</TabsTrigger>
                )}
                <TabsTrigger value="attendee_scanner" className="whitespace-nowrap snap-start flex-1 py-2.5 px-4 text-xs font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Attendee Scanner</TabsTrigger>
                
                {isSuperAdmin && (
                  <TabsTrigger value="volunteers" className="whitespace-nowrap snap-start flex-1 py-2.5 px-4 text-xs font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Volunteers</TabsTrigger>
                )}
                <TabsTrigger value="attendees" className="whitespace-nowrap snap-start flex-1 py-2.5 px-4 text-xs font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Attendees</TabsTrigger>
                
                {isSuperAdmin && (
                  <TabsTrigger value="volunteer_reports" className="whitespace-nowrap snap-start flex-1 py-2.5 px-4 text-xs font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Volunt. Reports</TabsTrigger>
                )}
                {isSuperAdmin && (
                  <TabsTrigger value="attendee_reports" className="whitespace-nowrap snap-start flex-1 py-2.5 px-4 text-xs font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Attend. Reports</TabsTrigger>
                )}
                {isSuperAdmin && (
                  <TabsTrigger value="leader_requests" className="whitespace-nowrap snap-start flex-1 py-2.5 px-4 text-xs font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Requests</TabsTrigger>
                )}
              </TabsList>

              {isSuperAdmin && (
                <TabsContent value="scanner" className="mt-6">
                  <QRScanner />
                </TabsContent>
              )}

              <TabsContent value="attendee_scanner" className="mt-6">
                <AttendeeQRScanner />
              </TabsContent>

              {isSuperAdmin && (
                <TabsContent value="volunteers" className="mt-6">
                  <VolunteerManager />
                </TabsContent>
              )}

              <TabsContent value="attendees" className="mt-6">
                <AttendeeManager />
              </TabsContent>

              {isSuperAdmin && (
                <TabsContent value="volunteer_reports" className="mt-6">
                  <DashboardTabs />
                </TabsContent>
              )}
              
              {isSuperAdmin && (
                <TabsContent value="attendee_reports" className="mt-6">
                  <AttendeeReportDashboard />
                </TabsContent>
              )}
              
              {isSuperAdmin && (
                <TabsContent value="leader_requests" className="mt-6">
                  <LeaderRequests />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </main>
      </div>
    </ProtectedLayout>
  )
}
