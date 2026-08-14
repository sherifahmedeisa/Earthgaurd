import { AttendanceRecords } from "@/components/attendance-records"

export const metadata = {
  title: "Attendance Records",
  description: "View and manage volunteer attendance records",
}

export default function RecordsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Attendance Records</h1>
        <p className="text-gray-600">Manage and review all volunteer attendance records</p>
      </div>
      <AttendanceRecords />
    </div>
  )
}
