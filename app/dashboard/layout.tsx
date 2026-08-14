import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSession } from "@/lib/cookies"
import { redirect } from "next/navigation"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session?.leader_id) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header with Logo */}
      <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-4 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 sm:gap-4 min-w-0">
              <div className="flex items-center gap-2">
                <Image
                  src="https://earthsguards.com/wp-content/uploads/2025/04/updated26-11-2024%D8%AD%D9%85%D8%A7%D8%A9-%D8%A7%D9%84%D8%A7%D8%B1%D8%B6.png"
                  alt="Earthsguard Logo"
                  width={60}
                  height={60}
                  className="h-10 w-auto sm:h-12 object-contain"
                  priority
                />
                <div className="h-8 w-px bg-slate-200 hidden sm:block mx-1"></div>
                <Image
                  src="https://sis.gov.eg/media/559219/%D9%88%D8%B2%D8%A7%D8%B1%D8%A9-%D8%A7%D9%84%D8%B4%D8%A8%D8%A7%D8%A8.jpg"
                  alt="Ministry Logo"
                  width={60}
                  height={60}
                  className="h-10 w-auto sm:h-12 object-contain rounded"
                  priority
                />
              </div>
              <div className="hidden lg:block border-l pl-4 border-slate-200">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">Earthsguard Event</h1>
                <p className="text-xs text-slate-600">Youth & Sports Development</p>
              </div>
            </Link>
            <form action="/api/auth/logout" method="POST" className="flex items-center gap-1 sm:gap-2 ml-auto">
              <span className="hidden sm:inline text-xs sm:text-sm text-slate-600">{session.leader_id}</span>
              <Button type="submit" variant="ghost" size="sm" className="gap-1 sm:gap-2 px-2 sm:px-4">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl w-full px-3 py-4 sm:px-4 sm:py-8 lg:px-8 flex-1">{children}</main>

      {/* Footer */}
      <Footer />
      <Toaster />
    </div>
  )
}
