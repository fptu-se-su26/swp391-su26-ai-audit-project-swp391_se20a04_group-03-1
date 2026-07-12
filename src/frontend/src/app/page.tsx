"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Ship, Cpu, Layers, Camera, Calendar, Truck, 
  Menu, X, CheckCircle2, Sun, Moon, 
  ShieldCheck, ArrowRight, Sparkles, Terminal, 
  BarChart3, Database, Activity, ArrowUpRight
} from "lucide-react"

// Types
interface TerminalLog {
  time: string;
  message: string;
  type: "info" | "success" | "warning" | "ai";
}

export default function HomePage() {
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0)

  // Simulator State
  const [isScanning, setIsScanning] = useState(false)
  const [scanStep, setScanStep] = useState(0)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanLogs, setScanLogs] = useState<TerminalLog[]>([
    { time: "00:00:00", message: "Hệ thống AI Gate sẵn sàng. Đang chờ xe vào...", type: "info" }
  ])
  const [scanResult, setScanResult] = useState<any>(null)

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

  const getCurrTime = () => new Date().toTimeString().split(' ')[0]

  const handleStartScan = () => {
    if (isScanning) return
    setIsScanning(true)
    setScanStep(1)
    setScanProgress(0)
    setScanResult(null)
    setScanLogs([{ time: getCurrTime(), message: "🚨 Phát hiện xe đầu kéo tiến vào luồng cổng số 01...", type: "warning" }])

    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      setScanProgress(progress)
      if (progress >= 100) clearInterval(interval)
    }, 100)

    const addLog = (m: string, t: any, delay: number) => {
      setTimeout(() => setScanLogs(p => [...p, { time: getCurrTime(), message: m, type: t }]), delay)
    }

    addLog("📷 Camera 01: Đã chụp ảnh cận cảnh xe và thùng container.", "info", 600)
    addLog("🧠 YOLOv8: Định vị khu vực biển số xe (Khung 2D: [x:120, y:340, w:80, h:30])", "ai", 1200)
    addLog("🔎 EasyOCR: Giải mã biển số xe thành công ➔ [ 29C-789.01 ]", "success", 1800)
    addLog("📦 YOLOv8: Định vị khu vực mã container phụ (Khung 2D: [x:410, y:180, w:210, h:65])", "ai", 2400)
    addLog("🔎 EasyOCR: Giải mã mã container thành công ➔ [ MSKU0123456 ] (Loại: 40GP)", "success", 3000)
    addLog("🌐 Webhook: Đồng bộ dữ liệu sang Backend...", "info", 3500)
    addLog("✅ Backend: Phê duyệt lượt vào thành công. Đã mở barie số 01!", "success", 4200)

    setTimeout(() => {
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
    }, 4500)
  }

  // --- DATA ARRAYS ---
  const features = [
    { icon: Camera, title: "Kiểm Soát Cổng AI (Gate AI)", desc: "Tự động hóa hoàn toàn cổng xuất nhập cảng. Sử dụng camera luồng RTSP kết hợp mô hình YOLOv8 phát hiện biển số, mã thùng container dưới 2 giây." },
    { icon: Layers, title: "Sơ Đồ Bãi Thông Minh (Yard Map)", desc: "Hệ thống tự động tính toán, phân bổ ô chứa tối ưu dựa trên chủng loại hàng hóa, trọng lượng để hạn chế việc di dời, đảo chuyển vô ích." },
    { icon: Calendar, title: "Đặt Hẹn Trước Cảng (Appointments)", desc: "Tài xế/đại lý hãng tàu thực hiện đặt trước thời điểm giao nhận hàng, hệ thống tự động phân bổ khung giờ vàng rảnh rỗi nhằm loại bỏ ùn tắc." },
    { icon: BarChart3, title: "Phân Tích & Báo Cáo (Reports)", desc: "Thu thập dữ liệu từ Gate, Yard và Lift để biểu đồ hóa lượng hàng thông qua cảng, đo lường vòng quay xe đầu kéo." }
  ]

  const workflowSteps = [
    { title: "1. Đăng ký cuộc hẹn (Appointment Booking)", desc: "Doanh nghiệp khai báo trước thông tin xe, số container, tài xế qua Web Portal để lấy mã QR/lịch hẹn trước, giảm thiểu ùn tắc.", badge: "Pre-arrival", color: "bg-[#539df5]" },
    { title: "2. Nhận diện AI tại Cổng (AI Gate Scanning)", desc: "Hệ thống camera AI thu thập luồng hình ảnh thời gian thực. YOLO phát hiện biển số & mã container, EasyOCR trích xuất chữ.", badge: "Real-time AI", color: "bg-[#1ed760]" },
    { title: "3. Tối ưu hóa vị trí xếp bãi (Smart Yard)", desc: "Thuật toán phân tích sơ đồ bãi hiện tại và kế hoạch tàu để đề xuất tọa độ container tối ưu nhất, hạn chế đảo chuyển.", badge: "AI Optimization", color: "bg-[#ffa42b]" },
    { title: "4. Điều phối máy nâng (Lift Sync)", desc: "Lệnh từ hệ thống đẩy thẳng đến màn hình tablet của máy nâng. Giao dịch được xác thực và hoàn tất tức thời.", badge: "Operation", color: "bg-[#f3727f]" }
  ]

  const techStack = [
    { icon: Layers, name: "Next.js & Tailwind CSS", desc: "Giao diện siêu mượt, thiết kế dạng Single Page App (SPA) thân thiện." },
    { icon: Database, name: "Node.js & MongoDB", desc: "Hệ thống backend mạnh mẽ, lưu trữ phi cấu trúc phục vụ dữ liệu khổng lồ." },
    { icon: Cpu, name: "YOLOv8 & Computer Vision", desc: "Nhận diện vật thể, đọc số container ngay trên luồng video camera." },
    { icon: Activity, name: "Socket.IO (WebSocket)", desc: "Đồng bộ hóa dữ liệu hai chiều real-time từ cổng về dashboard quản lý." }
  ]

  const stats = [
    { label: "Độ Chính Xác AI", value: "99.2%" },
    { label: "Quét Cổng Tự Động", value: "< 2.0s" },
    { label: "Năng Suất Bãi", value: "+45%" },
    { label: "Giảm Ùn Tắc", value: "85%" }
  ]

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#121212] dark:bg-[#121212] dark:text-[#ffffff] transition-colors duration-300 font-sans">
      
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#ffffff]/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-[#eeeeee] dark:border-[#272727]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="font-bold text-2xl tracking-tight flex items-center gap-2">
            <span className="text-[#1ed760]"><Ship className="h-8 w-8" /></span> 
            LogiPort
          </Link>
          
          <nav className="hidden md:flex gap-8">
            {['Tính năng', 'Công nghệ', 'Quy trình', 'Trải nghiệm AI'].map(item => (
              <a key={item} href={`#${item.replace(/ /g, '-').toLowerCase()}`} className="text-[14px] font-bold text-[#666666] dark:text-[#b3b3b3] hover:text-[#1ed760] dark:hover:text-[#1ed760] transition-colors">
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-[#eeeeee] dark:hover:bg-[#1f1f1f] transition-colors">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <div className="hidden sm:flex gap-3">
              <Link href="/client">
                <Button className="bg-[#1ed760] hover:bg-[#1db954] text-[#000000] rounded-[500px] font-bold uppercase tracking-[1.5px] px-8 border-none">
                  Cổng Doanh Nghiệp
                </Button>
              </Link>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-20 z-40 bg-[#ffffff]/95 dark:bg-[#121212]/95 border-b border-[#eeeeee] dark:border-[#272727] p-6 flex flex-col gap-5 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
          <nav className="flex flex-col gap-4">
            {['Tính năng', 'Công nghệ', 'Quy trình', 'Trải nghiệm AI'].map(item => (
              <a key={item} href={`#${item.replace(/ /g, '-').toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="text-[16px] font-bold">
                {item}
              </a>
            ))}
          </nav>
          <div className="h-[1px] bg-[#eeeeee] dark:bg-[#272727]" />
          <Link href="/client" onClick={() => setMobileMenuOpen(false)}>
            <Button className="w-full bg-[#1ed760] hover:bg-[#1db954] text-[#000000] rounded-[500px] font-bold uppercase tracking-[1.5px] py-6 border-none">
              Cổng Doanh Nghiệp
            </Button>
          </Link>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="pt-24 pb-32 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[500px] bg-[#eeeeee] dark:bg-[#1f1f1f] text-[12px] font-bold tracking-[1.5px] uppercase">
            <Sparkles className="h-4 w-4 text-[#1ed760]" /> SWP391 - AI AUDIT CẢNG BIỂN
          </div>
          <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight text-[#121212] dark:text-[#ffffff]">
            Quản lý Cảng <br/>
            <span className="text-[#1ed760]">Thông Minh</span> Bằng AI
          </h1>
          <p className="text-[16px] lg:text-[18px] text-[#666666] dark:text-[#b3b3b3] max-w-2xl font-normal leading-[1.6]">
            Giải pháp công nghệ hiện đại đột phá giúp số hóa và tự động hóa quy trình vận hành cảng. 
            Tích hợp nhận dạng thông minh YOLOv8 & EasyOCR, tối ưu hóa sơ đồ vị trí container xếp bãi, 
            giảm thiểu ùn tắc và nâng cao hiệu suất bãi cảng 24/7.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/client">
              <Button className="bg-[#1ed760] hover:bg-[#1db954] text-[#000000] rounded-[500px] font-bold uppercase tracking-[1.5px] px-10 py-6 text-[14px] border-none shadow-[0_8px_8px_rgba(30,215,96,0.3)]">
                Cổng Doanh Nghiệp <ArrowUpRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#trải-nghiệm-ai">
              <Button variant="outline" className="bg-transparent text-[#121212] border-[#7c7c7c] hover:bg-[#eeeeee] dark:text-[#ffffff] dark:hover:bg-[#1f1f1f] rounded-[500px] font-bold uppercase tracking-[1.5px] px-10 py-6 text-[14px]">
                Thử Nghiệm Quét
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-[#eeeeee] dark:border-[#272727]">
            {stats.map((s, i) => (
              <div key={i}>
                <p className="text-2xl font-black text-[#121212] dark:text-[#ffffff]">{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#666666] dark:text-[#b3b3b3] mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 w-full max-w-lg relative">
          <div className="aspect-square bg-[#f8f8f8] dark:bg-[#181818] rounded-[8px] shadow-[0_8px_24px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)] p-8 flex flex-col justify-between">
             <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-[50%] bg-[#f3727f]" />
                  <div className="w-3 h-3 rounded-[50%] bg-[#ffa42b]" />
                  <div className="w-3 h-3 rounded-[50%] bg-[#1ed760]" />
                </div>
                <div className="text-[10px] font-bold tracking-[1.5px] uppercase bg-[#eeeeee] dark:bg-[#1f1f1f] px-3 py-1 rounded-[500px] text-[#121212] dark:text-[#ffffff]">Live Monitor</div>
             </div>
             
             <div className="flex flex-col items-center justify-center my-12 relative">
                <div className="absolute w-40 h-40 border border-[#1ed760]/20 rounded-[50%] animate-ping" />
                <div className="w-28 h-28 rounded-[50%] bg-[#1ed760]/10 flex items-center justify-center animate-pulse z-10">
                   <Ship className="h-14 w-14 text-[#1ed760]" />
                </div>
                <div className="absolute -top-4 -left-4 bg-[#ffffff] dark:bg-[#1f1f1f] rounded-[8px] p-2 flex items-center gap-2 shadow-[0_8px_8px_rgba(0,0,0,0.3)] z-20">
                  <Cpu className="h-4 w-4 text-[#1ed760]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#121212] dark:text-[#ffffff]">YOLOv8 AI</span>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-[#ffffff] dark:bg-[#1f1f1f] rounded-[8px] p-2 flex items-center gap-2 shadow-[0_8px_8px_rgba(0,0,0,0.3)] z-20">
                  <Layers className="h-4 w-4 text-[#539df5]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#121212] dark:text-[#ffffff]">Slot Optimizer</span>
                </div>
             </div>

             <div className="border-t border-[#eeeeee] dark:border-[#272727] pt-4 text-sm font-bold flex justify-between items-center text-[#121212] dark:text-[#ffffff]">
                <span>Trạng thái hệ thống</span>
                <span className="text-[#1ed760] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-[50%] bg-[#1ed760] animate-pulse" /> Online 24/7
                </span>
             </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SYSTEM */}
      <section id="tính-năng" className="py-24 bg-[#f8f8f8] dark:bg-[#121212] border-y border-[#eeeeee] dark:border-[#272727] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[12px] font-bold tracking-[2px] text-[#1ed760] uppercase mb-3">Tính năng cốt lõi</h2>
            <h3 className="text-3xl lg:text-4xl font-black text-[#121212] dark:text-[#ffffff]">Hệ Sinh Thái Đồng Bộ Toàn Diện</h3>
            <p className="text-[#666666] dark:text-[#b3b3b3] mt-4 max-w-2xl mx-auto font-normal text-[16px]">LogiPort cung cấp một hệ sinh thái mô-đun hóa đồng bộ cao từ trạm camera cổng tự động, phân tích bãi container thực tế đến điều phối thông minh.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <Card key={i} className="bg-[#ffffff] dark:bg-[#181818] border-none rounded-[8px] shadow-sm hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-all">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-[50%] bg-[#1ed760]/10 flex items-center justify-center mb-6">
                    <f.icon className="h-6 w-6 text-[#1ed760]" />
                  </div>
                  <h4 className="font-bold text-[18px] mb-3 text-[#121212] dark:text-[#ffffff]">{f.title}</h4>
                  <p className="text-[#666666] dark:text-[#b3b3b3] text-[14px] leading-[1.6]">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* DETAILED WORKFLOW */}
      <section id="quy-trình" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[12px] font-bold tracking-[2px] text-[#1ed760] uppercase mb-3">Quy trình thông suốt</h2>
          <h3 className="text-3xl lg:text-4xl font-black text-[#121212] dark:text-[#ffffff]">Chu Trình Vận Hành 4 Bước Khép Kín</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Tabs */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {workflowSteps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveWorkflowStep(idx)}
                className={`p-5 rounded-[8px] text-left transition-all duration-300 flex items-start gap-4 ${
                  activeWorkflowStep === idx
                    ? "bg-[#eeeeee] dark:bg-[#181818] shadow-[0_8px_24px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_8px_rgba(0,0,0,0.5)] border-l-4 border-l-[#1ed760]"
                    : "bg-transparent hover:bg-[#f8f8f8] dark:hover:bg-[#1f1f1f]"
                }`}
              >
                <div className={`w-8 h-8 rounded-[50%] flex items-center justify-center shrink-0 font-black text-[14px] ${step.color} text-[#121212]`}>
                  {idx + 1}
                </div>
                <div>
                  <h4 className={`text-[16px] font-bold ${activeWorkflowStep === idx ? "text-[#121212] dark:text-[#ffffff]" : "text-[#666666] dark:text-[#b3b3b3]"}`}>
                    {step.title}
                  </h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1ed760] mt-1 block">
                    {step.badge}
                  </span>
                </div>
              </button>
            ))}
          </div>
          
          {/* Tab Content Graphic */}
          <div className="lg:col-span-7 bg-[#f8f8f8] dark:bg-[#181818] p-10 rounded-[8px] shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex flex-col justify-between min-h-[350px]">
            <div className="flex justify-between items-center">
              <span className="px-4 py-2 rounded-[500px] bg-[#eeeeee] dark:bg-[#1f1f1f] text-[10px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                {workflowSteps[activeWorkflowStep].badge}
              </span>
              <span className="text-6xl font-black text-[#e5e5e5] dark:text-[#272727]">
                0{activeWorkflowStep + 1}
              </span>
            </div>
            
            <div className="my-8">
              <h4 className="text-2xl font-black text-[#121212] dark:text-[#ffffff] mb-4">
                {workflowSteps[activeWorkflowStep].title}
              </h4>
              <p className="text-[#666666] dark:text-[#b3b3b3] font-normal leading-[1.6] text-[16px]">
                {workflowSteps[activeWorkflowStep].desc}
              </p>
            </div>
            
            <div className="bg-[#ffffff] dark:bg-[#1f1f1f] border border-[#eeeeee] dark:border-[#272727] p-4 rounded-[8px] flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#1ed760]" />
              <p className="text-[14px] font-bold text-[#121212] dark:text-[#ffffff]">Hệ thống tự động hóa quá trình này chỉ trong vài giây.</p>
            </div>
          </div>
        </div>
      </section>

      {/* DEMO SIMULATOR */}
      <section id="trải-nghiệm-ai" className="py-24 bg-[#f8f8f8] dark:bg-[#121212] border-y border-[#eeeeee] dark:border-[#272727] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[12px] font-bold tracking-[2px] text-[#1ed760] uppercase mb-3">Trực quan hóa</h2>
            <h3 className="text-3xl lg:text-4xl font-black text-[#121212] dark:text-[#ffffff]">Trải Nghiệm Hệ Thống Quét AI</h3>
            <p className="text-[#666666] dark:text-[#b3b3b3] mt-4">Chạy quét giả lập AI xử lý nhận diện biển số & mã container thực tế.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-[#ffffff] dark:bg-[#181818] rounded-[8px] p-6 shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex flex-col min-h-[400px]">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-[1.5px] mb-8 text-[#666666] dark:text-[#b3b3b3]">
                <span className="text-[#f3727f] animate-pulse">● REC</span>
                <span>GATE_01_INBOUND</span>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center relative bg-[#f8f8f8] dark:bg-[#121212] rounded-[6px] border border-[#eeeeee] dark:border-[#272727] mb-6 overflow-hidden">
                 {scanStep === 1 && <div className="absolute w-full h-1 bg-[#1ed760] shadow-[0_0_15px_#1ed760] animate-bounce z-10" />}
                 {scanStep === 0 && <Camera className="h-16 w-16 text-[#b3b3b3] opacity-30" />}
                 {scanStep === 1 && <Truck className="h-24 w-24 text-[#b3b3b3] opacity-50" />}
                 {scanStep === 2 && (
                   <div className="text-center">
                     <ShieldCheck className="h-16 w-16 text-[#1ed760] mx-auto mb-4" />
                     <p className="font-black text-2xl text-[#1ed760] tracking-widest">GATE OPENED</p>
                   </div>
                 )}
              </div>
              
              <Button onClick={handleStartScan} disabled={isScanning} className="w-full bg-[#1ed760] hover:bg-[#1db954] text-[#000000] rounded-[500px] font-bold uppercase tracking-[1.5px] py-6 border-none disabled:opacity-50">
                {isScanning ? `Đang quét... ${scanProgress}%` : "Bắt đầu quét"}
              </Button>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-[#ffffff] dark:bg-[#181818] rounded-[8px] p-6 shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex-1">
                <h3 className="font-bold uppercase tracking-[1.5px] mb-6 flex items-center gap-2 text-[12px] text-[#121212] dark:text-[#ffffff]">
                  <CheckCircle2 className="text-[#1ed760] h-4 w-4" /> Kết quả AI
                </h3>
                {scanResult ? (
                  <div className="space-y-4">
                    <div className="bg-[#f8f8f8] dark:bg-[#1f1f1f] p-4 rounded-[6px] flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#666666] dark:text-[#b3b3b3]">Biển Số</p>
                        <p className="text-[18px] font-black text-[#121212] dark:text-[#ffffff] mt-1">{scanResult.plate}</p>
                      </div>
                      <p className="text-[#1ed760] font-black">{scanResult.plateConf}%</p>
                    </div>
                    <div className="bg-[#f8f8f8] dark:bg-[#1f1f1f] p-4 rounded-[6px] flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#666666] dark:text-[#b3b3b3]">Container</p>
                        <p className="text-[18px] font-black text-[#121212] dark:text-[#ffffff] mt-1">{scanResult.container}</p>
                      </div>
                      <p className="text-[#1ed760] font-black">{scanResult.containerConf}%</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-[#666666] dark:text-[#b3b3b3] text-[12px] font-bold uppercase tracking-wider">
                    Chưa có kết quả quét
                  </div>
                )}
              </div>

              {/* Terminal Always keeps Dark Theme look for immersion */}
              <div className="bg-[#121212] rounded-[8px] p-6 shadow-inner border border-[#272727] flex-1 h-64 overflow-y-auto font-mono text-[12px]">
                <div className="flex items-center gap-2 border-b border-[#272727] pb-3 mb-3">
                  <Terminal className="h-4 w-4 text-[#b3b3b3]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#b3b3b3]">Terminal Logs</span>
                </div>
                {scanLogs.map((log, i) => (
                  <div key={i} className={`mb-2 ${log.type === 'success' ? 'text-[#1ed760]' : log.type === 'warning' ? 'text-[#ffa42b]' : log.type === 'ai' ? 'text-[#539df5]' : 'text-[#ffffff]'}`}>
                    <span className="opacity-50 mr-2">[{log.time}]</span>
                    {log.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TECHNOLOGY STACK */}
      <section id="công-nghệ" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[12px] font-bold tracking-[2px] text-[#1ed760] uppercase mb-3">Nền tảng</h2>
          <h3 className="text-3xl lg:text-4xl font-black text-[#121212] dark:text-[#ffffff]">Công Nghệ Đột Phá</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {techStack.map((tech, i) => (
            <div key={i} className="flex gap-4 p-6 bg-[#f8f8f8] dark:bg-[#181818] rounded-[8px] border border-[#eeeeee] dark:border-[#272727]">
              <div className="w-10 h-10 rounded-[50%] bg-[#121212] dark:bg-[#1f1f1f] flex items-center justify-center shrink-0">
                <tech.icon className="h-5 w-5 text-[#1ed760]" />
              </div>
              <div>
                <h4 className="font-bold text-[16px] text-[#121212] dark:text-[#ffffff] mb-1">{tech.name}</h4>
                <p className="text-[14px] text-[#666666] dark:text-[#b3b3b3]">{tech.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#eeeeee] dark:border-[#272727] bg-[#f8f8f8] dark:bg-[#121212] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Ship className="h-6 w-6 text-[#1ed760]" />
            <span className="font-bold text-[18px] text-[#121212] dark:text-[#ffffff]">LogiPort</span>
          </div>
          <div className="text-[#666666] dark:text-[#b3b3b3] text-[14px] font-normal">
            &copy; {new Date().getFullYear()} AI Audit SWP391. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
