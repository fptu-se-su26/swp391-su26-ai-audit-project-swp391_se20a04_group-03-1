"use client"

import { useEffect, useRef, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser"
import {
  Camera,
  CameraOff,
  CircleCheckBig,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type QrScannerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDetected: (value: string) => void
}

export function QrScannerDialog({ open, onOpenChange, onDetected }: QrScannerDialogProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const onDetectedRef = useRef(onDetected)

  const [status, setStatus] = useState<"idle" | "starting" | "scanning" | "error">("idle")
  const [message, setMessage] = useState("Open camera permission to start QR validation.")
  const [manualCode, setManualCode] = useState("")

  useEffect(() => {
    onDetectedRef.current = onDetected
  }, [onDetected])

  useEffect(() => {
    if (!open) {
      controlsRef.current?.stop()
      controlsRef.current = null
      readerRef.current = null
      setStatus("idle")
      setMessage("Open camera permission to start QR validation.")
      setManualCode("")
      return
    }

    let mounted = true
    let retryCount = 0
    setStatus("starting")
    setMessage("Requesting camera access from the browser...")

    const reader = new BrowserMultiFormatReader(undefined, 250)
    readerRef.current = reader

    const startScanner = async () => {
      if (!videoRef.current) {
        if (!mounted) {
          return
        }

        if (retryCount < 20) {
          retryCount += 1
          window.setTimeout(() => {
            void startScanner()
          }, 50)
          return
        }

        setStatus("error")
        setMessage("Camera preview is not ready yet.")
        return
      }

      try {
        const controls = await reader.decodeFromConstraints(
          {
            audio: false,
            video: {
              facingMode: { ideal: "environment" },
            },
          },
          videoRef.current,
          (result, error) => {
            if (!mounted) {
              return
            }

            if (result) {
              const text = result.getText().trim()
              if (text) {
                setStatus("scanning")
                setMessage("QR detected. Verifying check-in...")
                onDetectedRef.current(text)
                controlsRef.current?.stop()
              }

              return
            }

            if (error) {
              setStatus("scanning")
            }
          }
        )

        if (!mounted) {
          controls.stop()
          return
        }

        controlsRef.current = controls
        setStatus("scanning")
        setMessage("Camera is active. Align QR code inside the frame.")
      } catch (error) {
        if (!mounted) {
          return
        }

        setStatus("error")
        setMessage(
          error instanceof Error
            ? error.message
            : "Camera permission was denied or QR scanner could not start."
        )
      }
    }

    window.setTimeout(() => {
      void startScanner()
    }, 0)

    return () => {
      mounted = false
      controlsRef.current?.stop()
      controlsRef.current = null
      readerRef.current = null
    }
  }, [open])

  const submitManualCode = () => {
    const value = manualCode.trim()

    if (!value) {
      return
    }

    onDetectedRef.current(value)
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-x-3 top-1/2 z-50 max-h-[92vh] w-[calc(100%-1.5rem)] -translate-y-1/2 overflow-hidden rounded-[30px] border border-amber-300/20 bg-[#0b1322] text-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.55)] sm:left-1/2 sm:max-w-2xl sm:-translate-x-1/2">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <Dialog.Title className="flex items-center gap-2 text-base font-semibold tracking-wide text-slate-50">
                <ScanLine className="h-5 w-5 text-amber-200" />
                QR Check-in Scanner
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-slate-400">
                Camera access is requested on open. Works on localhost and HTTPS.
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
            <div className="space-y-4">
              <div className="rounded-[26px] border border-emerald-300/20 bg-linear-to-br from-slate-950 to-slate-900 p-3 shadow-[0_18px_45px_rgba(0,0,0,0.45)]">
                <div className="relative overflow-hidden rounded-[22px] border border-dashed border-emerald-300/30 bg-[radial-gradient(circle_at_50%_50%,rgba(78,214,167,0.15),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0))]">
                  <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-amber-300 via-emerald-300 to-sky-300" />

                  <div className="flex min-h-85 items-center justify-center p-4 sm:min-h-105">
                    <div className="relative w-full max-w-105 overflow-hidden rounded-[24px] border border-white/10 bg-black/80 p-4">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="h-70 w-full rounded-[18px] bg-black object-cover sm:h-85"
                      />

                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="h-55 w-55 rounded-[28px] border-2 border-amber-300/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.25)] sm:h-65 sm:w-65">
                          <div className="flex h-full w-full items-start justify-between p-4">
                            <CornerMark />
                            <CornerMark flip />
                          </div>
                          <div className="flex h-[calc(100%-3rem)] items-end justify-between px-4 pb-4">
                            <CornerMark bottom />
                            <CornerMark flip bottom />
                          </div>
                        </div>
                      </div>

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black via-black/60 to-transparent p-3">
                        <div className="flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-black/35 px-3 py-2 backdrop-blur">
                          <div className="flex items-center gap-2">
                            {status === "error" ? (
                              <CameraOff className="h-4 w-4 text-amber-200" />
                            ) : (
                              <Camera className="h-4 w-4 text-emerald-300" />
                            )}
                            <span className="text-xs font-semibold tracking-[0.28em] text-slate-200">
                              {status === "error" ? "CAMERA OFFLINE" : status === "starting" ? "REQUESTING ACCESS" : "SCANNING"}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-300">
                            <CircleCheckBig className="h-3.5 w-3.5 text-emerald-300" />
                            rear camera preferred
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                  <p className="text-xs font-semibold tracking-[0.28em]">STATUS</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-200">{message}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] font-bold tracking-[0.35em] text-slate-400">MANUAL FALLBACK</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  If the camera cannot read the code, paste the QR payload or appointment token below.
                </p>
                <div className="mt-4 space-y-3">
                  <Input
                    value={manualCode}
                    onChange={(event) => setManualCode(event.target.value)}
                    placeholder="Paste QR payload or token"
                    className="h-11 rounded-2xl border-white/10 bg-slate-950/60 text-slate-100 placeholder:text-slate-500"
                  />
                  <Button
                    type="button"
                    className="h-11 w-full rounded-2xl bg-amber-400 text-slate-950 hover:bg-amber-300"
                    onClick={submitManualCode}
                  >
                    Submit token
                  </Button>
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-slate-950/55 p-4">
                <p className="text-[11px] font-bold tracking-[0.35em] text-slate-400">HELPFUL TIPS</p>
                <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-300">
                  <li>• Make sure the app is served over HTTPS or localhost so the browser can request camera permission.</li>
                  <li>• Hold the phone steady and align the QR inside the amber frame.</li>
                  <li>• If scanning on iPhone Safari, keep the browser tab active while the camera is open.</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 flex-1 rounded-2xl border-white/10 bg-transparent text-slate-200 hover:bg-white/10"
                  onClick={() => {
                    controlsRef.current?.stop()
                    readerRef.current = null
                    setStatus("starting")
                    setMessage("Restarting camera scan...")
                    onOpenChange(false)
                    window.setTimeout(() => onOpenChange(true), 50)
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Rescan
                </Button>

                <Dialog.Close asChild>
                  <Button type="button" className="h-11 flex-1 rounded-2xl bg-emerald-400 text-slate-950 hover:bg-emerald-300">
                    Close scanner
                  </Button>
                </Dialog.Close>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function CornerMark({ flip, bottom }: { flip?: boolean; bottom?: boolean }) {
  return (
    <span
      className={`block h-8 w-8 border-amber-300/90 ${
        bottom ? "border-b-0" : "border-t-2"
      } ${flip ? "border-r-2" : "border-l-2"} ${bottom ? "border-t-0" : ""}`}
    />
  )
}