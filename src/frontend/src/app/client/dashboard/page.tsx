"use client"

import { useMemo, useState } from "react"
import {
	Activity,
	ArrowRight,
	Bell,
	CalendarClock,
	Camera,
	Clock3,
	MapPinned,
	Radio,
	ScanLine,
	ShieldAlert,
	ShieldCheck,
	SignalHigh,
	Truck,
	Warehouse,
	Waypoints,
} from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardTitle,
} from "@/components/ui/card"
import { QrScannerDialog } from "@/components/client/dashboard/qr-scanner"

type ScheduleItem = {
	time: string
	type: "EXPORT" | "IMPORT"
	container: string
	gate: string
	accent: string
}

const scheduleItems: ScheduleItem[] = [
	{
		time: "15:45",
		type: "EXPORT",
		container: "MSCU 928374-1",
		gate: "G-12",
		accent: "bg-emerald-400",
	},
	{
		time: "17:15",
		type: "IMPORT",
		container: "MAEU 110294-5",
		gate: "G-08",
		accent: "bg-amber-500",
	},
	{
		time: "18:30",
		type: "EXPORT",
		container: "TGHU 584201-9",
		gate: "G-04",
		accent: "bg-sky-400",
	},
]

const dashboardStats = [
	{
		label: "Bay Lock",
		value: "ZONE-4",
		helper: "Assigned staging area",
		icon: Warehouse,
	},
	{
		label: "ETA Gate",
		value: "14:20",
		helper: "Next check-in window",
		icon: Clock3,
	},
	{
		label: "Gate Status",
		value: "Waiting",
		helper: "Need QR validation",
		icon: ShieldCheck,
	},
]

export default function DashboardPage() {
	const [scannerOpen, setScannerOpen] = useState(false)
	const [lastScan, setLastScan] = useState<string>("TXN-992-K")
	const [scanState, setScanState] = useState<"idle" | "verified" | "pending">("idle")

	const currentStatus = useMemo(
		() => ({
			tag: "ACTIVE UPLINK",
			code: "SENS-ORCH-729",
			title: "STAGE: WAITING FOR GATE",
			description: "Driver is connected to the port uplink and ready for QR verification.",
		}),
		[]
	)

	const onQrDetected = (rawValue: string) => {
		setLastScan(rawValue)
		setScanState("pending")

		window.setTimeout(() => {
			setScanState("verified")
			setScannerOpen(false)
		}, 900)
	}

	return (
		<main
			className="min-h-screen overflow-hidden bg-[#07111f] text-slate-100"
			style={{
				backgroundImage:
					"radial-gradient(circle at 20% 0%, rgba(247, 184, 102, 0.09), transparent 30%), radial-gradient(circle at 80% 10%, rgba(78, 214, 167, 0.08), transparent 25%), linear-gradient(180deg, #08101d 0%, #050b14 100%)",
			}}
		>
			<div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-28 pt-4 sm:px-6 lg:px-8">
				<motion.header
					initial={{ opacity: 0, y: -12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.35 }}
					className="mb-4 flex items-center justify-between border-b border-amber-300/30 pb-3"
				>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-400/15 text-amber-200 shadow-lg shadow-amber-500/10">
							<Waypoints className="h-5 w-5" />
						</div>
						<div>
							<p className="text-[11px] font-bold tracking-[0.35em] text-amber-200/80">PORT DRIVER</p>
							<p className="text-xs text-slate-400">Smart port mobile dashboard</p>
						</div>
					</div>

					<div className="flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-emerald-200">
						<SignalHigh className="h-4 w-4" />
						<span className="text-[11px] font-semibold tracking-[0.25em]">LIVE</span>
					</div>
				</motion.header>

				<div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
					<section className="space-y-4">
						<motion.div
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.35, delay: 0.05 }}
							className="rounded-[28px] border border-amber-300/25 bg-[#101b31]/95 p-4 shadow-[0_0_0_1px_rgba(247,184,102,0.08),0_24px_60px_rgba(0,0,0,0.35)]"
						>
							<div className="mb-3 flex items-center justify-between gap-3">
								<div className="flex items-center gap-3">
									<span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(78,214,167,0.8)]" />
									<p className="text-sm font-bold tracking-[0.3em] text-emerald-300">{currentStatus.tag}</p>
								</div>
								<p className="font-mono text-sm tracking-[0.18em] text-amber-100/90">{currentStatus.code}</p>
							</div>

							<Card className="border-0 bg-amber-950/70 text-amber-50 ring-1 ring-amber-300/20">
								<CardContent className="space-y-3 p-5 sm:p-6">
									<CardDescription className="text-[11px] font-bold tracking-[0.35em] text-amber-200/80">
										CURRENT STATUS
									</CardDescription>
									<CardTitle className="text-3xl font-black uppercase tracking-wide text-amber-100 sm:text-4xl">
										{currentStatus.title}
									</CardTitle>
									<p className="max-w-xl text-sm leading-6 text-amber-50/85">
										{currentStatus.description}
									</p>
									<div className="flex flex-wrap gap-2 pt-1">
										<span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
											Uplink stable
										</span>
										<span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-100">
											Port ready
										</span>
										<span className="rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-100">
											QR check-in required
										</span>
									</div>
								</CardContent>
							</Card>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.35, delay: 0.1 }}
							className="rounded-[28px] border border-amber-300/25 bg-[#101b31]/95 p-4 shadow-[0_0_0_1px_rgba(247,184,102,0.08),0_24px_60px_rgba(0,0,0,0.35)]"
						>
							<div className="mb-4 flex items-center justify-between">
								<div>
									<p className="text-[11px] font-bold tracking-[0.35em] text-amber-200/80">DIGITAL MANIFEST</p>
									<h2 className="mt-1 text-lg font-semibold tracking-wide text-slate-100">TXN-992-K</h2>
								</div>
								<div className="flex items-center gap-2 rounded-full border border-slate-500/20 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-300">
									<Radio className="h-3.5 w-3.5 text-emerald-300" />
									Ready to scan
								</div>
							</div>

							<div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
								<div className="flex min-h-[260px] items-center justify-center rounded-[24px] border border-slate-500/20 bg-[#0c1322] p-5">
									<div className="relative flex h-[220px] w-full max-w-[340px] items-center justify-center rounded-[24px] border border-amber-300/25 bg-gradient-to-br from-slate-50 to-slate-200 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.4)]">
										<div className="flex h-full w-full items-center justify-center rounded-[18px] bg-slate-950">
											<div className="grid gap-3 text-center">
												<div className="mx-auto grid h-24 w-24 place-items-center rounded-2xl border border-emerald-300/30 bg-emerald-400/10 text-emerald-200">
													<ScanLine className="h-11 w-11" />
												</div>
												<p className="text-xs font-semibold tracking-[0.3em] text-slate-300">QR PLACEHOLDER</p>
												<p className="font-mono text-[11px] text-slate-500">Connect to manifest feed later</p>
											</div>
										</div>
									</div>
								</div>

								<div className="flex flex-col gap-3">
									<Button
										type="button"
										size="lg"
										className="h-14 w-full rounded-2xl bg-amber-400 text-base font-bold text-slate-950 shadow-[0_14px_30px_rgba(247,184,102,0.25)] hover:bg-amber-300"
										onClick={() => setScannerOpen(true)}
									>
										<ScanLine className="mr-2 h-5 w-5" />
										TAP TO CHECK-IN
									</Button>

									<Button
										type="button"
										variant="outline"
										size="lg"
										className="h-14 rounded-2xl border-emerald-300/25 bg-emerald-400/5 text-emerald-100 hover:bg-emerald-400/10 hover:text-emerald-50"
										onClick={() => setScannerOpen(true)}
									>
										<Camera className="mr-2 h-4 w-4" />
										Open camera scanner
									</Button>

									<div className="rounded-[22px] border border-slate-500/20 bg-slate-950/60 p-4">
										<div className="flex items-center justify-between">
											<p className="text-xs font-semibold tracking-[0.3em] text-slate-400">LAST SCAN</p>
											<span
												className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] ${
													scanState === "verified"
														? "bg-emerald-400/15 text-emerald-200"
														: scanState === "pending"
															? "bg-amber-400/15 text-amber-200"
															: "bg-slate-700/50 text-slate-300"
												}`}
											>
												{scanState === "verified" ? "Verified" : scanState === "pending" ? "Pending" : "Idle"}
											</span>
										</div>
										<p className="mt-2 break-all font-mono text-sm text-slate-100">{lastScan}</p>
										<p className="mt-2 text-xs leading-5 text-slate-500">
											Camera permission will be requested by the browser when you open the scanner. Works on localhost and HTTPS.
										</p>
									</div>
								</div>
							</div>
						</motion.div>

						<div className="grid gap-3 sm:grid-cols-3">
							{dashboardStats.map((item, index) => {
								const Icon = item.icon

								return (
									<motion.div
										key={item.label}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.28, delay: 0.12 + index * 0.05 }}
									>
										<Card className="border border-slate-500/15 bg-[#101b31]/95 text-slate-100">
											<CardContent className="space-y-3 p-4">
												<div className="flex items-center justify-between">
													<p className="text-[11px] font-bold tracking-[0.35em] text-slate-400">{item.label}</p>
													<Icon className="h-4 w-4 text-amber-200" />
												</div>
												<p className="text-2xl font-black tracking-wide text-slate-50">{item.value}</p>
												<p className="text-xs leading-5 text-slate-400">{item.helper}</p>
											</CardContent>
										</Card>
									</motion.div>
								)
							})}
						</div>

						<motion.div
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.35, delay: 0.15 }}
							className="rounded-[28px] border border-amber-300/20 bg-[#101b31]/95 p-4 shadow-[0_0_0_1px_rgba(247,184,102,0.08),0_24px_60px_rgba(0,0,0,0.35)]"
						>
							<div className="mb-4 flex items-center justify-between">
								<div className="flex items-center gap-2 text-slate-100">
									<CalendarClock className="h-5 w-5 text-amber-200" />
									<h3 className="text-lg font-semibold tracking-wide">TODAY&apos;S SCHEDULE</h3>
								</div>
								<p className="text-xs font-semibold tracking-[0.3em] text-slate-400">TODAY</p>
							</div>

							<div className="space-y-3">
								{scheduleItems.map((item, index) => (
									<motion.div
										key={`${item.time}-${item.container}`}
										initial={{ opacity: 0, x: -10 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.25, delay: 0.18 + index * 0.05 }}
										className="relative overflow-hidden rounded-[22px] border border-slate-500/15 bg-slate-950/45"
									>
										<div className={`absolute left-0 top-0 h-full w-1.5 ${item.accent}`} />
										<div className="flex items-center justify-between gap-4 p-4 pl-5">
											<div className="space-y-2">
												<div className="flex items-center gap-3">
													<p className="text-xl font-black text-emerald-300">{item.time}</p>
													<span className="rounded-md bg-slate-700/80 px-2.5 py-1 text-[10px] font-bold tracking-[0.3em] text-slate-200">
														{item.type}
													</span>
												</div>
												<p className="text-base font-semibold text-slate-100">CONT: {item.container}</p>
											</div>

											<div className="text-right">
												<p className="text-[11px] font-bold tracking-[0.35em] text-slate-400">GATE</p>
												<p className="text-2xl font-black text-amber-200">{item.gate}</p>
											</div>
										</div>
									</motion.div>
								))}
							</div>
						</motion.div>
					</section>

					<aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
						<motion.div
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.35, delay: 0.12 }}
							className="rounded-[28px] border border-slate-500/15 bg-[#101b31]/95 p-4"
						>
							<div className="mb-4 flex items-center justify-between">
								<div className="flex items-center gap-2 text-slate-100">
									<MapPinned className="h-5 w-5 text-amber-200" />
									<h3 className="text-lg font-semibold tracking-wide">SMART YARD</h3>
								</div>
								<span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold tracking-[0.28em] text-emerald-200">
									NAV READY
								</span>
							</div>

							<div className="rounded-[24px] border border-slate-500/20 bg-gradient-to-br from-slate-950 to-slate-900 p-4">
								<div className="flex min-h-[250px] flex-col justify-between rounded-[20px] border border-dashed border-emerald-300/20 bg-[radial-gradient(circle_at_50%_50%,rgba(78,214,167,0.12),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] p-4">
									<div className="flex items-center justify-between text-xs font-semibold tracking-[0.25em] text-slate-400">
										<span>BLOCK A / BAY 04</span>
										<span>EMPTY SLOT</span>
									</div>

									<div className="grid grid-cols-3 gap-3">
										{[
											["A4", "Available"],
											["A5", "Reserved"],
											["A6", "Available"],
											["B4", "Empty"],
											["B5", "Occupied"],
											["B6", "Empty"],
										].map(([slot, status]) => (
											<div
												key={slot}
												className={`rounded-xl border px-3 py-4 text-center text-xs font-semibold ${
													status === "Available" || status === "Empty"
														? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
														: "border-amber-300/20 bg-amber-400/10 text-amber-100"
												}`}
											>
												<p className="text-base font-black tracking-wide">{slot}</p>
												<p className="mt-1 uppercase tracking-[0.22em]">{status}</p>
											</div>
										))}
									</div>

									<div className="flex items-center justify-between text-xs text-slate-400">
										<span className="flex items-center gap-2">
											<Activity className="h-4 w-4 text-emerald-300" />
											IoT yard guidance active
										</span>
										<span className="flex items-center gap-2">
											<Bell className="h-4 w-4 text-amber-200" />
											2 live alerts
										</span>
									</div>
								</div>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.35, delay: 0.18 }}
							className="rounded-[28px] border border-slate-500/15 bg-[#101b31]/95 p-4"
						>
							<div className="mb-4 flex items-center gap-2 text-slate-100">
								<ShieldAlert className="h-5 w-5 text-amber-200" />
								<h3 className="text-lg font-semibold tracking-wide">ALERTS</h3>
							</div>

							<div className="space-y-3">
								{[
									{
										title: "Seal sync delayed",
										body: "Container TGHU 584201-9 is waiting for seal telemetry refresh.",
										tone: "text-amber-200",
										border: "border-amber-300/20",
										bg: "bg-amber-400/10",
									},
									{
										title: "Gate queue normal",
										body: "Live queue is below threshold. Suggested arrival remains on time.",
										tone: "text-emerald-200",
										border: "border-emerald-300/20",
										bg: "bg-emerald-400/10",
									},
								].map((alert) => (
									<div key={alert.title} className={`rounded-[20px] border ${alert.border} ${alert.bg} p-4`}>
										<p className={`text-sm font-semibold ${alert.tone}`}>{alert.title}</p>
										<p className="mt-1 text-xs leading-5 text-slate-300">{alert.body}</p>
									</div>
								))}
							</div>

							<Button
								type="button"
								variant="ghost"
								className="mt-4 w-full justify-between rounded-2xl border border-slate-500/15 bg-slate-950/40 px-4 py-3 text-slate-200 hover:bg-slate-900/70 hover:text-white"
							>
								View all alerts
								<ArrowRight className="h-4 w-4" />
							</Button>
						</motion.div>
					</aside>
				</div>

				<nav className="fixed inset-x-0 bottom-0 z-30 border-t border-amber-300/20 bg-[#08111f]/95 px-3 pb-4 pt-3 backdrop-blur-xl">
					<div className="mx-auto grid max-w-[520px] grid-cols-5 gap-2">
						{[
							{ label: "Dashboard", icon: Activity, active: true },
							{ label: "Slots", icon: Warehouse, active: false },
							{ label: "Parking", icon: MapPinned, active: false },
							{ label: "Ops", icon: Truck, active: false },
							{ label: "Alerts", icon: Bell, active: false },
						].map((item) => {
							const Icon = item.icon

							return (
								<button
									key={item.label}
									type="button"
									className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition-all ${
										item.active
											? "bg-amber-400 text-slate-950 shadow-[0_14px_30px_rgba(247,184,102,0.25)]"
											: "text-slate-300 hover:bg-white/5 hover:text-white"
									}`}
								>
									<Icon className="h-5 w-5" />
									{item.label}
								</button>
							)
						})}
					</div>
				</nav>

				<QrScannerDialog open={scannerOpen} onOpenChange={setScannerOpen} onDetected={onQrDetected} />
			</div>
		</main>
	)
}
