import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ScanLine, FileText } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight">LogiPort</span>
            </Link>
          </div>

          {/* Center: Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Tính năng
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Bảng giá
            </Link>
            <Link href="#support" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Hỗ trợ
            </Link>
          </nav>

          {/* Right: Buttons */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden sm:flex" asChild>
              <Link href="/docs">Tài liệu HD</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Đăng nhập hệ thống</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        <section className="w-full py-16 md:py-24 lg:py-32 overflow-hidden">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
              {/* Text content */}
              <div className="flex flex-col justify-center space-y-8">
                <div className="space-y-6">
                  <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl/none text-balance">
                    Số Hóa Luồng Chạy Xe Tải - Loại Bỏ Giấy Tờ Thủ Công
                  </h1>
                  <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl leading-relaxed">
                    Giải pháp Quản Lý Cảng V2.0 giúp nhà xe đặt lịch (TAS), tự động nhận diện biển số (ANPR) và nhận chứng từ e-EIR. Tiết kiệm thời gian và giảm tắc nghẽn bãi.
                  </p>
                </div>
                <div className="flex flex-col gap-3 min-[400px]:flex-row">
                  <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all">
                    Đăng Ký Đặt Lịch Ngay
                  </Button>
                </div>
              </div>
              
              {/* Image Placeholder */}
              <div className="mx-auto w-full max-w-[600px] lg:max-w-none relative group">
                {/* Background glow */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-400 to-indigo-500 opacity-20 blur-2xl group-hover:opacity-30 transition duration-1000"></div>
                
                <div className="aspect-[4/3] relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 shadow-2xl flex items-center justify-center p-8 border border-white/40 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/10">
                  {/* Decorative UI elements to simulate "Smart Port" dashboard */}
                  <div className="w-full max-w-sm space-y-4 backdrop-blur-xl bg-white/40 dark:bg-black/40 p-6 rounded-xl border border-white/50 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] relative z-10 transform transition-transform group-hover:scale-[1.02] duration-500">
                    <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
                      <div className="space-y-2">
                        <div className="h-5 w-28 bg-black/10 dark:bg-white/10 rounded animate-pulse"></div>
                        <div className="h-3 w-16 bg-black/5 dark:bg-white/5 rounded"></div>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <div className="h-4 w-4 bg-blue-500 dark:bg-blue-400 rounded-full animate-ping"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="h-3 w-20 bg-black/5 dark:bg-white/5 rounded"></div>
                          <div className="h-3 w-8 bg-black/10 dark:bg-white/10 rounded"></div>
                        </div>
                        <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full w-[85%] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="h-3 w-24 bg-black/5 dark:bg-white/5 rounded"></div>
                          <div className="h-3 w-8 bg-black/10 dark:bg-white/10 rounded"></div>
                        </div>
                        <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full w-[60%] bg-gradient-to-r from-blue-400 to-teal-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <div className="h-10 flex-1 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-lg border border-blue-500/20 dark:border-blue-500/30"></div>
                      <div className="h-10 flex-1 bg-black/5 dark:bg-white/5 rounded-lg"></div>
                    </div>
                  </div>
                  
                  {/* Floating decorative elements */}
                  <div className="absolute top-10 -right-4 h-24 w-24 rounded-2xl bg-white/20 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/10 rotate-12 transform group-hover:rotate-6 transition-transform duration-700"></div>
                  <div className="absolute -bottom-8 left-10 h-32 w-32 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-16 md:py-24 bg-slate-50 dark:bg-zinc-900/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Tính Năng Nổi Bật
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                Tối ưu hóa mọi quy trình giao nhận tại cảng với các công nghệ tự động hóa hàng đầu.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-zinc-900">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">Đặt lịch thông minh (TAS)</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Quản lý quota khung giờ, phân bổ luồng xe tránh kẹt giờ cao điểm.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-zinc-900">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                    <ScanLine className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">Cổng AI (Smart Gate)</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Nhận diện biển số (ANPR) tự động mở Barie, giảm thời gian check-in.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-zinc-900">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center mb-4 text-teal-600 dark:text-teal-400">
                    <FileText className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">Chứng từ điện tử e-EIR</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Sinh phiếu giao nhận PDF tự động, tài xế tra cứu qua mobile.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats Banner */}
        <section className="w-full py-16 bg-slate-950 dark:bg-black text-white relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[300px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
              {/* Stat 1 */}
              <div className="flex flex-col items-center justify-center space-y-3 pt-8 md:pt-0">
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]">
                  99.9%
                </h3>
                <div className="space-y-1">
                  <p className="font-semibold text-lg md:text-xl">Uptime Hệ Thống</p>
                  <p className="text-sm md:text-base text-slate-400">Không sập giờ cao điểm</p>
                </div>
              </div>
              
              {/* Stat 2 */}
              <div className="flex flex-col items-center justify-center space-y-3 pt-8 md:pt-0">
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-teal-400 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]">
                  &lt; 500ms
                </h3>
                <div className="space-y-1">
                  <p className="font-semibold text-lg md:text-xl">Phản hồi API</p>
                  <p className="text-sm md:text-base text-slate-400">Xử lý dữ liệu siêu tốc</p>
                </div>
              </div>
              
              {/* Stat 3 */}
              <div className="flex flex-col items-center justify-center space-y-3 pt-8 md:pt-0">
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]">
                  &lt; 3s
                </h3>
                <div className="space-y-1">
                  <p className="font-semibold text-lg md:text-xl">AI Nhận Diện</p>
                  <p className="text-sm md:text-base text-slate-400">Xử lý biển số & thùng xe</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
