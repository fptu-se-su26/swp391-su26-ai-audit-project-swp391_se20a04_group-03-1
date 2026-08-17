"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const wavesContainerVariants = cva("flex items-center justify-center gap-1", {
  variants: {
    size: {
      sm: "h-4 gap-0.5",
      md: "h-6 gap-1",
      lg: "h-8 gap-1.5",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const waveBarVariants = cva("rounded-full transition-all duration-150", {
  variants: {
    state: {
      idle: "bg-[#888888] dark:bg-[#666666]",
      recording: "bg-[#f3727f]",
      active: "bg-[#1ed760]",
    },
    size: {
      sm: "w-0.5 h-2",
      md: "w-1 h-3",
      lg: "w-1.5 h-4",
    },
  },
  defaultVariants: {
    state: "idle",
    size: "md",
  },
});

interface AudioWavesProps extends VariantProps<typeof wavesContainerVariants> {
  className?: string;
}

export function AudioWaves({ size = "md", className }: AudioWavesProps) {
  return (
    <div className={cn(wavesContainerVariants({ size }), className)}>
      <div className={cn(waveBarVariants({ size }), "animate-wave-1")} />
      <div className={cn(waveBarVariants({ size }), "animate-wave-2")} />
      <div className={cn(waveBarVariants({ size }), "animate-wave-3")} />
      <div className={cn(waveBarVariants({ size }), "animate-wave-4")} />
      <div className={cn(waveBarVariants({ size }), "animate-wave-5")} />
    </div>
  );
}
