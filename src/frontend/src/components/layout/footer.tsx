export function Footer() {
  return (
    <footer className="border-t border-[#e5e5e5] dark:border-[#272727] bg-[#ffffff] dark:bg-[#181818] py-4 px-6 mt-auto transition-colors duration-300">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-bold text-[#666666] dark:text-[#b3b3b3]">
        <p>&copy; 2026 LogiPort System. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-[#121212] dark:hover:text-[#ffffff] uppercase tracking-wider transition-colors">Privacy</a>
          <a href="#" className="hover:text-[#121212] dark:hover:text-[#ffffff] uppercase tracking-wider transition-colors">Terms</a>
          <a href="#" className="hover:text-[#121212] dark:hover:text-[#ffffff] uppercase tracking-wider transition-colors">Support</a>
        </div>
      </div>
    </footer>
  )
}
