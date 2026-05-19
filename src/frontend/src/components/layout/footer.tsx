export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-4 px-6 mt-auto">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <p>&copy; 2026 Container Port Management System. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-900">Privacy</a>
          <a href="#" className="hover:text-slate-900">Terms</a>
          <a href="#" className="hover:text-slate-900">Support</a>
        </div>
      </div>
    </footer>
  )
}
