"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Ship, 
  Cpu, 
  Layers, 
  Activity, 
  FileText, 
  Camera, 
  Calendar, 
  Truck, 
  Settings, 
  LogIn, 
  UserPlus, 
  Menu, 
  X, 
  CheckCircle2, 
  Sun, 
  Moon, 
  ExternalLink, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Database, 
  Terminal, 
  ArrowUpRight, 
  BarChart3
} from "lucide-react"

// Types for Mock simulator
interface TerminalLog {
  time: string
  message: string
  type: "info" | "success" | "warning" | "ai"
}

export default function HomePage() {
  // Theme State
  const [theme, setTheme] = useState<"light" | "dark">("light")
  
  // Mobile Navbar state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Workflow active step
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0)

  // AI Camera Simulator state
  const [isScanning, setIsScanning] = useState(false)
  const [scanStep, setScanStep] = useState(0) // 0: Idle, 1: Scanning, 2: Complete
  const [scanProgress, setScanProgress] = useState(0)
  const [scanLogs, setScanLogs] = useState<TerminalLog[]>([
    { time: "00:00:00", message: "Hệ thống AI Gate sẵn sàng. Đang chờ xe vào...", type: "info" }
  ])
  const [scanResult, setScanResult] = useState<{
    plate: string
    plateConf: number
    container: string
    containerConf: number
    vehicleType: string
    timestamp: string
  } | null>(null)

  // Initialize theme from document element class or localStorage
  useEffect(() => {
    const root = document.documentElement
    const isDark = root.classList.contains("dark")
    setTheme(isDark ? "dark" : "light")
  }, [])

  const toggleTheme = () => {
    const root = document.documentElement
    if (theme === "light") {
      root.classList.add("dark")
      localStorage.setItem("theme", "dark")
      setTheme("dark")
    } else {
      root.classList.remove("dark")
      localStorage.setItem("theme", "light")
      setTheme("light")
    }
  }

  // Trigger Mock Scanner
  const handleStartScan = () => {
    if (isScanning) return
    
    setIsScanning(true)
    setScanStep(1)
    setScanProgress(0)
    setScanResult(null)
    setScanLogs([
      { time: getCurrTime(), message: "🚨 Phát hiện xe đầu kéo tiến vào luồng cổng số 01...", type: "warning" }
    ])

    // Progress bar runner
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      setScanProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
      }
    }, 100)

    // Step-by-step logs simulation
    setTimeout(() => {
      addLog("📷 Camera 01: Đã chụp ảnh cận cảnh xe và thùng container.", "info")
    }, 600)

    setTimeout(() => {
      addLog("🧠 YOLOv8: Định vị khu vực biển số xe (Khung 2D: [x:120, y:340, w:80, h:30])", "ai")
    }, 1200)

    setTimeout(() => {
      addLog("🔎 EasyOCR: Giải mã biển số xe thành công ➔ [ 29C-789.01 ]", "success")
    }, 1800)

    setTimeout(() => {
      addLog("📦 YOLOv8: Định vị khu vực mã container phụ (Khung 2D: [x:410, y:180, w:210, h:65])", "ai")
    }, 2400)

    setTimeout(() => {
      addLog("🔎 EasyOCR: Giải mã mã container thành công ➔ [ MSKU0123456 ] (Loại: 40GP)", "success")
    }, 3000)

    setTimeout(() => {
      addLog("🌐 Webhook: Đồng bộ dữ liệu sang Node.js Backend...", "info")
    }, 3500)

    setTimeout(() => {
      addLog("✅ Backend: Phê duyệt lượt vào thành công. Đã mở barie số 01!", "success")
      setScanResult({
        plate: "29C-789.01",
        plateConf: 96.5,
        container: "MSKU0123456",
        containerConf: 91.8,
        vehicleType: "Xe đầu kéo Container 40ft",
        timestamp: new Date().toLocaleTimeString("vi-VN")
      })
      setScanStep(2)
      setIsScanning(false)
    }, 4200)
  }

  const addLog = (message: string, type: "info" | "success" | "warning" | "ai") => {
    setScanLogs(prev => [
      ...prev,
      { time: getCurrTime(), message, type }
    ])
  }

  const getCurrTime = () => {
    const now = new Date()
    return now.toTimeString().split(' ')[0]
  }

  // Operation steps content
  const workflowSteps = [
    {
      title: "1. Đăng ký cuộc hẹn (Appointment Booking)",
      desc: "Doanh nghiệp vận tải thực hiện khai báo trước thông tin xe, số container, tài xế và thời gian dự kiến qua cổng (Gate-In) trên ứng dụng Web Portal để lấy mã QR/lịch trình hẹn trước, giảm thiểu ùn tắc.",
      badge: "Pre-arrival",
      color: "from-sky-500 to-blue-500",
      highlight: "Giảm thời gian chờ đợi tại cổng từ 30 phút xuống < 1 phút."
    },
    {
      title: "2. Nhận diện AI tại Cổng (AI Gate Scanning)",
      desc: "Khi xe di chuyển vào làn cổng tự động, hệ thống camera AI lập tức thu thập luồng hình ảnh thời gian thực. Module YOLO phát hiện biển số và mã container, sau đó EasyOCR trích xuất văn bản dưới 2 giây.",
      badge: "Real-time AI",
      color: "from-emerald-500 to-teal-500",
      highlight: "Độ chính xác nhận diện biển số và số container đạt trên 99%."
    },
    {
      title: "3. Tối ưu hóa vị trí xếp bãi (Smart Yard Stacking)",
      desc: "Thuật toán tối ưu vị trí (Yard Allocation Algorithm) phân tích sơ đồ bãi hiện tại, loại hàng hóa và kế hoạch xuất tàu để đề xuất tọa độ container (Block - Row - Bay - Tier) tối ưu nhất, hạn chế đảo chuyển.",
      badge: "AI Optimization",
      color: "from-indigo-500 to-purple-500",
      highlight: "Nâng cao năng suất khai thác bãi thêm 45%."
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 dark:bg-[#0b111e] dark:text-slate-200 transition-colors duration-300">
      
      {/* Decorative Blur Background Blobs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-sky-200/40 dark:bg-sky-900/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-80 right-1/4 w-[450px] h-[450px] bg-indigo-200/30 dark:bg-indigo-900/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-10 w-80 h-80 bg-emerald-200/20 dark:bg-emerald-950/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Decorative Grid Line System */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

      {/* NAV BAR */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0b111e]/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-black text-2xl text-slate-900 dark:text-white flex items-center gap-2 hover:opacity-90 transition-opacity">
              <span className="text-3xl animate-bounce">🚢</span> 
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-indigo-600 to-indigo-500 dark:from-sky-400 dark:via-sky-300 dark:to-indigo-300">LogiPort</span>
            </Link>
            
            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400 transition-colors">Tính năng</a>
              <a href="#technology" className="text-sm font-semibold text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400 transition-colors">Công nghệ</a>
              <a href="#workflow" className="text-sm font-semibold text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400 transition-colors">Quy trình</a>
              <a href="#demo" className="text-sm font-semibold text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400 transition-colors">Trải nghiệm AI</a>
              <a href="#stats" className="text-sm font-semibold text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400 transition-colors">Thống kê</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Rotating Sun/Moon Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 hover:bg-slate-100 dark:hover:bg-[#1a2333] rounded-xl text-slate-600 dark:text-slate-300 relative overflow-hidden transition-all duration-300 active:scale-95 cursor-pointer border border-transparent dark:border-slate-800"
              aria-label="Toggle light/dark mode"
            >
              <div className="relative h-5 w-5">
                <Sun className={`h-5 w-5 absolute inset-0 transition-all duration-500 transform ${
                  theme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
                } text-amber-500`} />
                <Moon className={`h-5 w-5 absolute inset-0 transition-all duration-500 transform ${
                  theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
                } text-sky-400`} />
              </div>
            </button>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/admin/login">
                <Button variant="ghost" className="rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold px-5 cursor-pointer transition-all duration-200">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/admin/dashboard">
                <Button className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-extrabold px-6 rounded-xl shadow-md shadow-sky-600/10 cursor-pointer transition-all duration-200 hover:-translate-y-0.5">
                  Vào Hệ Thống <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Mobile Hamburger Trigger */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-[#1a2333] rounded-xl text-slate-600 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-20 z-40 bg-white/95 dark:bg-[#0b111e]/95 border-b border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-5 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col gap-4">
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-bold text-slate-700 dark:text-slate-300 hover:text-sky-600"
            >
              Tính năng giới thiệu
            </a>
            <a 
              href="#technology" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-bold text-slate-700 dark:text-slate-300 hover:text-sky-600"
            >
              Nền tảng công nghệ
            </a>
            <a 
              href="#workflow" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-bold text-slate-700 dark:text-slate-300 hover:text-sky-600"
            >
              Quy trình làm việc
            </a>
            <a 
              href="#demo" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-bold text-slate-700 dark:text-slate-300 hover:text-sky-600"
            >
              Trải nghiệm camera AI
            </a>
            <a 
              href="#stats" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-bold text-slate-700 dark:text-slate-300 hover:text-sky-600"
            >
              Thống kê hiệu năng
            </a>
          </nav>
          <hr className="border-slate-200 dark:border-slate-800" />
          <div className="flex flex-col gap-3">
            <Link href="/admin/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full rounded-xl py-6 font-bold border-slate-300 text-slate-700 dark:text-slate-300">
                Đăng nhập hệ thống
              </Button>
            </Link>
            <Link href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full rounded-xl py-6 bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-extrabold shadow-lg shadow-sky-600/10">
                Đi tới Dashboard
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left relative z-10">
            {/* Project Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-sky-200 dark:border-sky-500/20 bg-sky-50/50 dark:bg-sky-500/5 text-xs font-black tracking-wider uppercase text-sky-700 dark:text-sky-300 mb-6 animate-pulse">
              <Sparkles className="h-3.5 w-3.5" /> SWP391 - DỰ ÁN AI AUDIT CẢNG BIỂN
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] mb-6 tracking-tight">
              Quản lý Cảng Container <br className="hidden sm:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 dark:from-sky-400 dark:via-sky-300 dark:to-indigo-300">
                Thông Minh Tự Động
              </span>{" "}
              Bằng AI
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl font-medium leading-relaxed">
              Giải pháp công nghệ hiện đại đột phá giúp số hóa và tự động hóa quy trình vận hành cảng. 
              Tích hợp nhận dạng thông minh YOLOv8 & EasyOCR, tối ưu hóa sơ đồ vị trí container xếp bãi, 
              giảm thiểu ùn tắc và nâng cao hiệu suất bãi cảng 24/7.
            </p>
            
            <div className="flex gap-4 w-full sm:w-auto flex-wrap">
              <Link href="/admin/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-sky-600 via-indigo-600 to-indigo-500 hover:from-sky-700 hover:to-indigo-700 text-white font-extrabold px-8 py-7 rounded-2xl shadow-xl shadow-indigo-600/20 dark:shadow-indigo-500/10 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  Khám Phá Dashboard <ArrowRight className="ml-2 h-5 w-5 animate-pulse" />
                </Button>
              </Link>
              <a href="#demo" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-300 text-slate-700 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/40 hover:bg-slate-100 font-bold px-8 py-7 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-1">
                  Thử Nghiệm Quét AI
                </Button>
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 sm:gap-8 mt-12 w-full max-w-lg border-t border-slate-200 dark:border-slate-800/80 pt-8">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">99.2%</p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase">Độ Chính Xác AI</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">&lt; 2.0s</p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase">Quét Cổng Tự Động</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">+45%</p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase">Tối Ưu Xếp Bãi</p>
              </div>
            </div>
          </div>
          
          {/* Hero Right Visuals */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            {/* Tech Mesh Graphic */}
            <div className="relative w-full aspect-square max-w-[420px] rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-[#131a26]/40 backdrop-blur-md shadow-2xl p-6 flex flex-col justify-between group">
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
              
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-[#1a2333] text-[10px] font-black text-slate-500 dark:text-slate-400 border dark:border-slate-800 uppercase tracking-widest">
                  Live Monitor
                </div>
              </div>
              
              {/* Central Visual Graphic */}
              <div className="my-8 flex flex-col items-center justify-center relative">
                {/* Floating Ship Icon */}
                <div className="relative z-10 w-28 h-28 rounded-full bg-gradient-to-br from-sky-400/20 to-indigo-500/20 dark:from-sky-500/10 dark:to-indigo-500/10 flex items-center justify-center border border-sky-400/30 dark:border-sky-500/20 shadow-inner animate-pulse">
                  <Ship className="h-14 w-14 text-sky-600 dark:text-sky-400" />
                </div>

                {/* Satellite waves */}
                <div className="absolute w-40 h-40 border border-sky-500/10 dark:border-sky-500/5 rounded-full animate-ping pointer-events-none" />
                <div className="absolute w-56 h-56 border border-indigo-500/10 dark:border-indigo-500/5 rounded-full animate-ping [animation-delay:1s] pointer-events-none" />

                {/* Floating tech nodes */}
                <div className="absolute -top-4 -left-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 shadow-lg flex items-center gap-2 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                  <Cpu className="h-4 w-4 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider">YOLOv8 AI</span>
                </div>

                <div className="absolute bottom-2 -right-4 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 shadow-lg flex items-center gap-2 transform rotate-12 hover:rotate-0 transition-transform duration-300">
                  <Layers className="h-4 w-4 text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Yard Slot Optimizer</span>
                </div>
              </div>

              {/* Status footer bar */}
              <div className="border-t border-slate-200 dark:border-slate-800/80 pt-4 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">Hệ Thống Trạng Thái</span>
                  <span className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400 font-black animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Hoạt Động (Online)
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold font-mono">
                  Flask stream: port 5001 | Express backend: port 4000
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SYSTEM */}
      <section id="features" className="py-20 bg-slate-100/50 dark:bg-[#0c1322] border-y border-slate-200/50 dark:border-slate-800/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-black tracking-widest text-sky-600 dark:text-sky-400 uppercase mb-3">Tính năng cốt lõi</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Giải Pháp Đồng Bộ Toàn Diện Cho Cảng Biển
            </h3>
            <div className="w-16 h-1 bg-gradient-to-r from-sky-600 to-indigo-600 mx-auto mt-4 rounded-full" />
            <p className="text-slate-600 dark:text-slate-300 mt-5 text-sm sm:text-base font-medium leading-relaxed">
              LogiPort cung cấp một hệ sinh thái mô-đun hóa đồng bộ cao từ trạm camera cổng tự động, 
              phân tích bãi container thực tế, cho đến số hóa phiếu kiểm soát và phân công trực quan cabin.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1: AI Gate Control */}
            <Card className="group border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131a26]/40 hover:-translate-y-1.5 hover:shadow-xl hover:border-sky-500/30 dark:hover:border-sky-500/20 transition-all duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Camera className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-3">
                  Kiểm Soát Cổng AI (Gate AI)
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 font-medium">
                  Tự động hóa hoàn toàn cổng xuất nhập cảng. Sử dụng camera luồng RTSP kết hợp mô hình YOLOv8 phát hiện biển số, 
                  mã thùng container và module EasyOCR xử lý trích xuất văn bản cực nhanh, đồng bộ ngay lập tức sang backend Node.js.
                </p>
                <Link href="/admin/gate" className="inline-flex items-center gap-1.5 text-xs font-black text-sky-600 dark:text-sky-400 group-hover:underline">
                  Khám phá luồng quét <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>

            {/* Feature 2: Smart Yard */}
            <Card className="group border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131a26]/40 hover:-translate-y-1.5 hover:shadow-xl hover:border-indigo-500/30 dark:hover:border-indigo-500/20 transition-all duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Layers className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-3">
                  Sơ Đồ Bãi Thông Minh (Yard Map)
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 font-medium">
                  Số hóa giao diện mô phỏng 2D/3D trực quan vị trí bãi. Hệ thống tự động tính toán, phân bổ ô chứa (slot allocation) 
                  tối ưu dựa trên chủng loại hàng hóa, trọng lượng và thời gian rời bãi để hạn chế việc di dời, đảo chuyển vô ích.
                </p>
                <Link href="/admin/yard" className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-600 dark:text-indigo-400 group-hover:underline">
                  Xem bản đồ bãi <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>

            {/* Feature 5: Smart Appointments */}
            <Card className="group border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131a26]/40 hover:-translate-y-1.5 hover:shadow-xl hover:border-purple-500/30 dark:hover:border-purple-500/20 transition-all duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-3">
                  Đặt Hẹn Trước Cảng (Appointments)
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 font-medium">
                  Hệ thống điều phối xe đầu kéo ra vào cảng thông minh. Tài xế/đại lý hãng tàu thực hiện đặt trước thời điểm giao nhận hàng, 
                  hệ thống tự động phân bổ khung giờ vàng rảnh rỗi nhằm loại bỏ hoàn toàn các nút thắt ùn tắc giao thông ngoài cổng cảng.
                </p>
                <Link href="/admin/appointments" className="inline-flex items-center gap-1.5 text-xs font-black text-purple-600 dark:text-purple-400 group-hover:underline">
                  Quản lý cuộc hẹn <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>

            {/* Feature 6: Analytics Hub */}
            <Card className="group border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131a26]/40 hover:-translate-y-1.5 hover:shadow-xl hover:border-red-500/30 dark:hover:border-red-500/20 transition-all duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-3">
                  Phân Tích & Báo Cáo (Reports Hub)
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 font-medium">
                  Thu thập dữ liệu đầy đủ từ các công đoạn Gate, Yard và Lift để tạo lập báo cáo trực quan. 
                  Biểu đồ hóa lượng hàng hóa thông qua cảng (throughput), đo lường thời gian quay vòng xe đầu kéo và tỷ lệ lấp đầy bãi.
                </p>
                <Link href="/admin/reports" className="inline-flex items-center gap-1.5 text-xs font-black text-red-600 dark:text-red-400 group-hover:underline">
                  Truy cập báo cáo <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* DETAILED OPERATIONAL WORKFLOW */}
      <section id="workflow" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase mb-3">Quy trình thông suốt</h2>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Chu Trình Vận Hành 4 Bước Khép Kín
          </h3>
          <div className="w-16 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto mt-4 rounded-full" />
          <p className="text-slate-600 dark:text-slate-300 mt-5 text-sm sm:text-base font-medium leading-relaxed">
            Hệ thống quản lý khép kín từ lúc xe container đăng ký lịch hẹn, qua trạm cân, kiểm tra tại cổng, phân bổ ô bãi thông minh.
          </p>
        </div>

        {/* Dynamic Workflow layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Workflow Tabs (Left) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {workflowSteps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveWorkflowStep(idx)}
                className={`p-5 rounded-2xl text-left border transition-all duration-300 flex items-start gap-4 cursor-pointer hover:shadow-md ${
                  activeWorkflowStep === idx
                    ? "bg-white dark:bg-[#131a26]/90 border-indigo-500 shadow-md shadow-indigo-500/5 translate-x-2"
                    : "bg-transparent border-slate-200 dark:border-slate-800/80 hover:bg-slate-100/30 dark:hover:bg-[#131a26]/20"
                }`}
              >
                <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${step.color} text-white font-black text-sm flex items-center justify-center shrink-0`}>
                  {idx + 1}
                </span>
                <div>
                  <h4 className={`text-sm font-black transition-colors ${
                    activeWorkflowStep === idx ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-400"
                  }`}>
                    {step.title.split('. ')[1]}
                  </h4>
                  <span className="text-[10px] font-black uppercase text-indigo-500 mt-1 block tracking-wider">
                    {step.badge}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Workflow Graphic details (Right) */}
          <div className="lg:col-span-7 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-slate-200 dark:border-slate-800/80 p-8 sm:p-10 rounded-3xl relative overflow-hidden min-h-[350px] flex flex-col justify-between">
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            
            {/* Top Row with decorative Badge */}
            <div className="flex justify-between items-center relative z-10">
              <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-[#1d273a] text-xs font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">
                {workflowSteps[activeWorkflowStep].badge}
              </span>
              <span className="text-5xl font-black text-slate-200 dark:text-slate-800">
                0{activeWorkflowStep + 1}
              </span>
            </div>

            {/* Core Text details */}
            <div className="my-8 relative z-10">
              <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-4">
                {workflowSteps[activeWorkflowStep].title}
              </h4>
              <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed text-sm sm:text-base">
                {workflowSteps[activeWorkflowStep].desc}
              </p>
            </div>

            {/* Bottom Row highlight alert */}
            <div className="bg-white/60 dark:bg-[#0c1220]/60 border border-indigo-500/20 p-4 rounded-xl relative z-10 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-indigo-500 shrink-0" />
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-300">
                {workflowSteps[activeWorkflowStep].highlight}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* INTERACTIVE MOCK AI CAMERA SIMULATOR */}
      <section id="demo" className="py-20 bg-slate-100/50 dark:bg-[#0c1322] border-y border-slate-200/50 dark:border-slate-800/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-black tracking-widest text-emerald-600 dark:text-emerald-400 uppercase mb-3">Thử nghiệm thực tế</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Trải Nghiệm Hệ Thống Quét Cổng AI
            </h3>
            <div className="w-16 h-1 bg-gradient-to-r from-emerald-600 to-teal-600 mx-auto mt-4 rounded-full" />
            <p className="text-slate-600 dark:text-slate-300 mt-5 text-sm sm:text-base font-medium leading-relaxed">
              Nhấn nút chạy quét giả lập bên dưới để xem trực quan chuỗi sự kiện camera AI của LogiPort 
              phát hiện biển số, giải mã OCR, xử lý dữ liệu và mở barie tự động trong thời gian thực.
            </p>
          </div>

          {/* Simulator Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Live Camera Feed Screen (Left) */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="bg-[#141b27] rounded-3xl border border-slate-800 overflow-hidden relative shadow-2xl flex-1 min-h-[350px] sm:min-h-[400px] flex flex-col justify-between p-6">
                
                {/* Header of Feed */}
                <div className="flex justify-between items-center z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="text-[10px] font-black uppercase text-red-500 tracking-widest font-mono">REC LIVE FEED</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">GATE_01_INBOUND_C1</span>
                </div>

                {/* Central Scan Animation */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Camera Grid lines overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.03)_0%,transparent_70%)]" />
                  
                  {/* Scanning glowing bar */}
                  {scanStep === 1 && (
                    <div className="absolute left-0 w-full h-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-bounce" />
                  )}

                  {scanStep === 0 && (
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <Camera className="h-12 w-12 text-slate-400" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang chờ kích hoạt camera</p>
                    </div>
                  )}

                  {scanStep === 2 && (
                    <div className="flex flex-col items-center gap-3 bg-emerald-950/80 border border-emerald-500/40 p-6 rounded-2xl backdrop-blur-sm animate-in zoom-in-95 duration-200">
                      <ShieldCheck className="h-10 w-10 text-emerald-400" />
                      <p className="text-sm font-black text-white uppercase tracking-widest">Nhận diện hoàn tất</p>
                      <p className="text-2xl font-black text-emerald-400 tracking-wider">GATE OPENED</p>
                    </div>
                  )}
                </div>

                {/* Truck/Camera Mock Graphic */}
                <div className="my-12 w-full flex items-center justify-center py-10 relative">
                  {scanStep === 1 && (
                    <div className="w-64 h-24 border border-emerald-500/30 rounded-xl bg-emerald-500/5 flex items-center justify-center animate-pulse">
                      <Truck className="h-12 w-12 text-emerald-500" />
                    </div>
                  )}
                  {scanStep === 2 && (
                    <div className="w-64 h-24 border border-emerald-500 bg-emerald-950/20 rounded-xl flex flex-col items-center justify-center p-4">
                      <Truck className="h-8 w-8 text-emerald-400 mb-1" />
                      <div className="flex gap-2">
                        <span className="text-[10px] bg-sky-950 border border-sky-500 text-sky-400 px-2 py-0.5 rounded font-mono font-bold">{scanResult?.plate}</span>
                        <span className="text-[10px] bg-indigo-950 border border-indigo-500 text-indigo-400 px-2 py-0.5 rounded font-mono font-bold">{scanResult?.container}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer and trigger controls */}
                <div className="flex justify-between items-end z-10 border-t border-slate-800/80 pt-4">
                  <div className="flex flex-col gap-1 font-mono text-[9px] text-slate-500">
                    <div>RESOLUTION: 1920x1080 @ 30FPS</div>
                    <div>YOLO ENGINE: v8.0.x ACTIVE</div>
                  </div>
                  
                  <Button
                    onClick={handleStartScan}
                    disabled={isScanning}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-5 rounded-xl shadow-lg shadow-emerald-600/20 dark:shadow-emerald-500/5 cursor-pointer disabled:opacity-50"
                  >
                    {isScanning ? `Đang Quét (${scanProgress}%)` : "Khởi Động Quét Thử Nghiệm"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Terminal Outputs and Results (Right) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Event Scan Result box */}
              <div className="bg-white dark:bg-[#131a26]/40 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-lg flex flex-col justify-between">
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Kết quả nhận diện AI
                </h4>
                
                {scanResult ? (
                  <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                    
                    {/* License Plate Result */}
                    <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-100/50 dark:bg-[#1a2333]/50 border dark:border-slate-800">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Biển Số Xe</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">{scanResult.plate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Độ Tin Cậy</p>
                        <p className="text-sm font-black text-emerald-500 font-mono mt-0.5">{scanResult.plateConf}%</p>
                      </div>
                    </div>

                    {/* Container ID Result */}
                    <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-100/50 dark:bg-[#1a2333]/50 border dark:border-slate-800">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Số Container</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">{scanResult.container}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Độ Tin Cậy</p>
                        <p className="text-sm font-black text-emerald-500 font-mono mt-0.5">{scanResult.containerConf}%</p>
                      </div>
                    </div>

                    {/* Quick Metadata */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#131a26]/40 border dark:border-slate-800">
                        <span className="text-slate-400 block font-bold">Phân Loại</span>
                        <span className="text-slate-800 dark:text-slate-200 font-extrabold mt-0.5 block">{scanResult.vehicleType}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#131a26]/40 border dark:border-slate-800">
                        <span className="text-slate-400 block font-bold">Thời Gian</span>
                        <span className="text-slate-800 dark:text-slate-200 font-extrabold mt-0.5 block">{scanResult.timestamp}</span>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-8 text-slate-400 dark:text-slate-500">
                    <Database className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-xs font-bold uppercase tracking-wider">Chưa có kết quả quét</p>
                    <p className="text-[11px] mt-1 max-w-[200px]">Bấm nút bắt đầu để chạy luồng chụp ảnh quét biển số xe.</p>
                  </div>
                )}
              </div>

              {/* Terminal Logs Window */}
              <div className="bg-[#0f141c] rounded-3xl border border-slate-800 p-5 shadow-inner flex-1 flex flex-col">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-3">
                  <Terminal className="h-4 w-4 text-slate-500" />
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest font-mono">Dữ Liệu Log Hệ Thống</span>
                </div>
                
                <div className="flex-1 overflow-y-auto max-h-[180px] font-mono text-[11px] leading-relaxed flex flex-col gap-2.5">
                  {scanLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-slate-500 shrink-0">[{log.time}]</span>
                      <span className={
                        log.type === "success" ? "text-emerald-400 font-bold" :
                        log.type === "warning" ? "text-amber-400 font-bold" :
                        log.type === "ai" ? "text-sky-400 font-bold" : "text-slate-300"
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* TECHNOLOGY STACK SECTION */}
      <section id="technology" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-black tracking-widest text-sky-600 dark:text-sky-400 uppercase mb-3">Nền tảng công nghệ</h2>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Kiến Trúc Hệ Thống Hiện Đại & Bền Vững
          </h3>
          <div className="w-16 h-1 bg-gradient-to-r from-sky-600 to-indigo-600 mx-auto mt-4 rounded-full" />
          <p className="text-slate-600 dark:text-slate-300 mt-5 text-sm sm:text-base font-medium leading-relaxed">
            Dự án được xây dựng dựa trên sự liên kết tối ưu giữa hạ tầng trí tuệ nhân tạo (AI Engine) 
            và dịch vụ web tốc độ cao, đảm bảo hoạt động an toàn với lưu lượng container lớn.
          </p>
        </div>

        {/* Tech grid columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Tech 1 */}
          <div className="bg-white dark:bg-[#131a26]/40 border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 font-mono block mb-2">AI & OCR PIPELINE</span>
            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">YOLOv8 & EasyOCR</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Mô hình YOLOv8 tối tân được huấn luyện tinh chỉnh để định vị nhanh biển số xe và mã container. 
              EasyOCR đóng vai trò giải mã văn bản hình ảnh đa góc độ chính xác lên đến 99%.
            </p>
          </div>

          {/* Tech 2 */}
          <div className="bg-white dark:bg-[#131a26]/40 border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-500 font-mono block mb-2">STREAMING SERVER</span>
            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">Python Flask CV</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Hệ thống streaming chạy luồng ngầm sử dụng OpenCV kết nối camera IP/RTSP. Trình dịch vụ Flask 
              xử lý độc lập tại cổng 5001 giúp việc nhận diện AI mượt mà và không nghẽn luồng.
            </p>
          </div>

          {/* Tech 3 */}
          <div className="bg-white dark:bg-[#131a26]/40 border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 font-mono block mb-2">RESTFUL API ENGINE</span>
            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">Node.js Express</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Máy chủ backend hiệu năng cao phụ trách tiếp nhận kết quả quét từ cổng tự động thông qua Webhook, 
              đồng bộ hàng đợi vận chuyển, cấu trúc lịch hẹn và quản lý an ninh container.
            </p>
          </div>

          {/* Tech 4 */}
          <div className="bg-white dark:bg-[#131a26]/40 border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-500 font-mono block mb-2">HIGH-END CLIENT</span>
            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">Next.js & Tailwind</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Khung ứng dụng Next.js cùng Tailwind CSS v4 giúp xây dựng giao diện Soft UI hiện đại, 
              hỗ trợ tốt Light/Dark Mode trực quan, mượt mà và tương thích tốt trên mọi kích thước màn hình.
            </p>
          </div>

        </div>
      </section>

      {/* STATS IMPACT SECTION */}
      <section id="stats" className="py-20 bg-slate-100/50 dark:bg-[#0c1322] border-y border-slate-200/50 dark:border-slate-800/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-indigo-500 rounded-3xl p-10 sm:p-12 relative overflow-hidden shadow-xl text-white">
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-6 text-left">
                <h3 className="text-2xl sm:text-3xl font-black mb-4">
                  LogiPort Thay Đổi Hoàn Toàn Hiệu Suất Cảng Container
                </h3>
                <p className="text-sky-100 font-medium text-sm sm:text-base leading-relaxed">
                  Bằng việc ứng dụng tự động hóa AI và thuật toán sắp xếp thông minh, chúng tôi mang tới 
                  bước đột phá lớn về thời hạn giải phóng xe cũng như năng lực luân chuyển container tại bãi cảng.
                </p>
              </div>

              <div className="lg:col-span-6 grid grid-cols-2 gap-6 sm:gap-8">
                <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-xs border border-white/10">
                  <span className="text-3xl sm:text-4xl font-black block">90%</span>
                  <span className="text-[10px] sm:text-xs font-bold text-sky-100 uppercase tracking-wider block mt-1.5">Giảm tải ùn tắc cổng</span>
                </div>
                <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-xs border border-white/10">
                  <span className="text-3xl sm:text-4xl font-black block">100%</span>
                  <span className="text-[10px] sm:text-xs font-bold text-sky-100 uppercase tracking-wider block mt-1.5">Số hóa không dùng giấy</span>
                </div>
                <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-xs border border-white/10">
                  <span className="text-3xl sm:text-4xl font-black block">0.05s</span>
                  <span className="text-[10px] sm:text-xs font-bold text-sky-100 uppercase tracking-wider block mt-1.5">Độ trễ API Backend</span>
                </div>
                <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-xs border border-white/10">
                  <span className="text-3xl sm:text-4xl font-black block">24/7</span>
                  <span className="text-[10px] sm:text-xs font-bold text-sky-100 uppercase tracking-wider block mt-1.5">Tự động hóa hoàn toàn</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION (CTA) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
        <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
          Sẵn Sàng Chuyển Đổi Số Cảng Container Của Bạn?
        </h3>
        <p className="text-slate-600 dark:text-slate-300 font-medium text-sm sm:text-base leading-relaxed mb-8 max-w-2xl mx-auto">
          Truy cập ngay vào hệ thống điều hành để kiểm chứng toàn bộ tính năng và trải nghiệm bảng giám sát trực quan. Nền tảng LogiPort được thiết kế tối ưu cho các vai trò từ Trưởng bãi, Nhân viên kiểm cổng cho tới quản lý hệ thống.
        </p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/admin/dashboard">
            <Button size="lg" className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-extrabold px-8 py-6 rounded-xl shadow-lg cursor-pointer transition-all duration-200">
              Đi Tới Dashboard Vận Hành
            </Button>
          </Link>
          <Link href="/admin/login">
            <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/40 hover:bg-slate-100 font-bold px-8 py-6 rounded-xl cursor-pointer transition-all duration-200">
              Đăng Nhập Quản Trị
            </Button>
          </Link>
        </div>
      </section>

      {/* COMPREHENSIVE LANDING FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080d16] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          
          {/* Footer Logo & Desc */}
          <div className="md:col-span-5 flex flex-col gap-4 text-left">
            <Link href="/" className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <span>🚢</span> 
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-indigo-600 to-indigo-500 dark:from-sky-400 dark:via-sky-300 dark:to-indigo-300">LogiPort</span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm">
              LogiPort là dự án phần mềm hỗ trợ kiểm soát, quản lý bãi container thông minh ứng dụng xử lý ảnh và trí tuệ nhân tạo. 
              Được nghiên cứu và phát triển bởi Nhóm 03 - lớp SE20A04 trong học kỳ mùa hè năm 2026.
            </p>
            <div className="flex gap-2.5 mt-2 flex-wrap">
              <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800/50 text-[10px] font-mono text-slate-500 dark:text-slate-400 border dark:border-slate-800">SWP391_SE20A04</span>
              <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800/50 text-[10px] font-mono text-slate-500 dark:text-slate-400 border dark:border-slate-800">FPT University</span>
              <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800/50 text-[10px] font-mono text-slate-500 dark:text-slate-400 border dark:border-slate-800">Group 03</span>
            </div>
          </div>

          {/* Navigation links columns */}
          <div className="md:col-span-4 grid grid-cols-2 gap-4 text-left">
            <div>
              <h5 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest mb-4">Hệ Thống</h5>
              <ul className="flex flex-col gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <li><Link href="/admin/dashboard" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Bảng điều khiển</Link></li>
                <li><Link href="/admin/gate" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Nhận diện Cổng AI</Link></li>
                <li><Link href="/admin/yard" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Mô phỏng Bãi</Link></li>
                <li><Link href="/admin/lift" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Điều động xe nâng</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest mb-4">Tài nguyên</h5>
              <ul className="flex flex-col gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <li><a href="#features" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Tính năng giới thiệu</a></li>
                <li><a href="#technology" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Nền tảng công nghệ</a></li>
                <li><a href="#demo" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Trực quan mô phỏng</a></li>
                <li><a href="#stats" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Thống kê hiệu quả</a></li>
              </ul>
            </div>
          </div>

          {/* Newsletter / Contact Mock */}
          <div className="md:col-span-3 flex flex-col gap-4 text-left">
            <h5 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest mb-2">Đăng ký nhận tin</h5>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Nhập email của bạn..." 
                className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs font-medium focus-visible:ring-indigo-500 h-9 shrink-0 flex-1"
              />
              <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl h-9 cursor-pointer">
                Gửi
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
              Nhận thông báo cập nhật về thuật toán tối ưu hóa bãi cảng và các tính năng AI mới nhất.
            </p>
          </div>

        </div>

        {/* Copy Bar */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <p>&copy; 2026 LogiPort System (SWP391 Group-03). Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Quy chế bảo mật</a>
            <a href="#" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Điều khoản dịch vụ</a>
            <a href="#" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Hỗ trợ kỹ thuật</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
