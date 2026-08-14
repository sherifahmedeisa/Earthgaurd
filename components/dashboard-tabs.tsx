"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportDashboard } from "./report-dashboard"

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("theta")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Volunteer Attendance Dashboard</CardTitle>
          <CardDescription>View and manage attendance by volunteer type</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="theta"
                className="text-base data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Θ Theta (Day 1)
              </TabsTrigger>
              <TabsTrigger
                value="delta"
                className="text-base data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Δ Delta (Day 2)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="theta" className="mt-6">
              <ReportDashboard volunteerType="theta" />
            </TabsContent>

            <TabsContent value="delta" className="mt-6">
              <ReportDashboard volunteerType="delta" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
