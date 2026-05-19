import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">🚢</h1>
        <h2 className="text-4xl font-bold text-white mb-2">LogiPort - Port Operations Management Solution</h2>
        <p className="text-xl text-slate-300 mb-8">Hệ thống quản lý cảng container thông minh</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/admin/dashboard">
            <Button size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">Đi tới Dashboard</Button>
          </Link>
          <Link href="/admin/(auth)/login">
            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Đăng nhập
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
