export function Footer() {
  return (
    <footer className="border-t border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-[#161f30]/80 py-4 px-6 mt-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <p>&copy; 2026 Container Port Management System. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Terms</a>
          <a href="#" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Support</a>
        </div>
      </div>
    </footer>
  )
}
