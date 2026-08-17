"use client";

import { MessageSquare, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { AudioWaves } from "./ai-assistant-waves";

const buttonVariants = cva(
  "fixed z-50 flex items-center justify-center rounded-[50%] transition-all duration-300 shadow-lg",
  {
    variants: {
      state: {
        idle:
          "bg-[#1ed760] hover:bg-[#1db954] hover:shadow-xl hover:scale-110",
        recording:
          "bg-[#f3727f] hover:bg-[#f2616b] shadow-xl animate-pulse",
        disabled:
          "bg-[#888888] cursor-not-allowed shadow-md",
      },
      size: {
        default: "w-16 h-16",
        sm: "w-12 h-12",
        lg: "w-20 h-20",
      },
    },
    defaultVariants: {
      state: "idle",
      size: "default",
    },
  }
);

const tooltipVariants = cva(
  "absolute right-full mr-3 px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100",
  {
    variants: {
      theme: {
        light:
          "bg-[#121212] text-white",
        dark:
          "bg-[#f8f8f8] text-[#121212]",
      },
    },
    defaultVariants: {
      theme: "light",
    },
  }
);

interface AIAssistantButtonProps
  extends VariantProps<typeof buttonVariants>,
    React.ButtonHTMLAttributes<HTMLButtonElement> {
  tooltip?: string;
  showWaves?: boolean;
}

export function AIAssistantButton({
  state = "idle",
  size = "default",
  tooltip = "AI Assistant",
  showWaves = false,
  className,
  ...props
}: AIAssistantButtonProps) {
  const iconSize = size === "lg" ? 28 : size === "sm" ? 20 : 24;

  return (
    <button
      className={cn(
        buttonVariants({ state, size }),
        "group",
        className
      )}
      aria-label={tooltip}
      {...props}
    >
      {/* Tooltip */}
      <span className={tooltipVariants({ theme: "light" })}>
        {tooltip}
      </span>

      {/* Icon or Loading */}
      {state === "disabled" ? (
        <MicOff className="text-white" size={iconSize} />
      ) : showWaves && state === "recording" ? (
        <AudioWaves size={size === "lg" ? "lg" : size === "sm" ? "sm" : "md"} />
      ) : state === "idle" ? (
        <MessageSquare className="text-white" size={iconSize} />
      ) : (
        <Loader2 className="text-white animate-spin" size={iconSize} />
      )}

      {/* Pulse ring animation for idle state */}
      {state === "idle" && (
        <span className="absolute inset-0 rounded-[50%] bg-[#1ed760] animate-ping opacity-20" />
      )}
    </button>
  );
}
