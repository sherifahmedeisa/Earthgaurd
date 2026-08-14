export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-white mt-8 sm:mt-12">
      <div className="mx-auto max-w-7xl w-full px-3 py-4 sm:px-4 sm:py-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-1 sm:gap-2 text-center">
          <p className="text-xs sm:text-sm text-slate-600">Volunteer Attendance System</p>
          <p className="text-xs text-slate-500">© {currentYear} Designed by Sherif Ahmed Eisa. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
