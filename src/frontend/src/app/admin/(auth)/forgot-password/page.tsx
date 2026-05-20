"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useState } from "react"
import { Ship, Mail, AlertTriangle, ArrowLeft, MailCheck, ExternalLink } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email) {
      setError("Vui lòng nhập địa chỉ email công vụ.")
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Định dạng email công vụ không hợp lệ (ví dụ: user@port.com).")
      return
    }

    setIsLoading(true)

    // Simulate sending email
    setTimeout(() => {
      setIsLoading(false)
      setIsSent(true)
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b132b] via-[#1c2541] to-[#3a506b] px-4 relative overflow-hidden">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00D4FF] to-blue-500 shadow-lg shadow-cyan-500/20 mb-4 transition-transform hover:scale-105 duration-300">
            <Ship className="h-9 w-9 text-slate-900" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">LogiPort System</h1>
          <p className="text-slate-300 text-sm mt-2">Khôi Phục Mật Khẩu Tài Khoản Công Vụ</p>
        </div>

        <Card className="bg-[#1c2541]/60 backdrop-blur-xl border border-slate-700/50 shadow-2xl text-white">
          {!isSent ? (
            <>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-white">Quên mật khẩu</CardTitle>
                <CardDescription className="text-center text-slate-400 text-sm">
                  Nhập email công vụ của bạn, chúng tôi sẽ gửi liên kết khôi phục mật khẩu.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-sm text-red-200 animate-shake">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300 text-sm font-semibold">Email công vụ</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                        <Mail className="h-4 w-4" />
                      </span>
                      <Input
                        id="email"
                        type="email"
                        placeholder="officer@port.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="pl-10 bg-slate-950/40 border-slate-700/50 text-white placeholder:text-slate-500 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-slate-900 focus-visible:border-transparent"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-2 bg-[#00D4FF] text-slate-950 hover:bg-[#00B4D8] active:scale-[0.98] font-bold py-2 rounded-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Đang gửi yêu cầu...
                      </>
                    ) : (
                      "Gửi liên kết khôi phục"
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-4 border-t border-slate-700/40 text-sm text-center">
                  <Link 
                    href="/admin/login" 
                    className="inline-flex items-center gap-2 text-slate-300 hover:text-[#00D4FF] font-semibold transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" /> Quay lại Đăng nhập
                  </Link>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="pt-6 text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 mb-2">
                <MailCheck className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Đã gửi email khôi phục</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Chúng tôi đã gửi hướng dẫn lấy lại mật khẩu tới hòm thư <span className="font-semibold text-white">{email}</span>. Vui lòng kiểm tra hộp thư của bạn.
                </p>
              </div>

              {/* Convenience mock redirect */}
              <div className="p-3 bg-[#0b132b]/40 rounded-lg border border-slate-700/50 text-xs text-slate-400 text-left space-y-2">
                <p className="font-semibold text-[#00D4FF] flex items-center gap-1">
                  💡 Chế độ thử nghiệm giao diện:
                </p>
                <p>Thông thường bạn cần nhấp vào link trong email. Bạn có thể nhấn vào nút dưới đây để trực tiếp đi tới trang đặt mật khẩu mới.</p>
                <Link 
                  href="/admin/reset-password" 
                  className="w-full mt-2 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  Tới trang Đặt lại mật khẩu <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <div className="pt-4 border-t border-slate-700/40 text-sm">
                <Link 
                  href="/admin/login" 
                  className="inline-flex items-center gap-2 text-[#00D4FF] hover:underline font-semibold transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Quay lại trang Đăng nhập
                </Link>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
