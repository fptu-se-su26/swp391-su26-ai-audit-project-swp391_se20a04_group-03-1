import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-[500px] bg-[#ffffff] dark:bg-[#1f1f1f] text-[#121212] dark:text-[#ffffff] px-6 py-3 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#999999] dark:placeholder:text-[#b3b3b3] focus-visible:outline-none focus-visible:border focus-visible:border-[#121212] dark:focus-visible:border-[#ffffff] focus-visible:ring-1 focus-visible:ring-[#121212] dark:focus-visible:ring-[#ffffff] disabled:cursor-not-allowed disabled:opacity-50 border border-[#e5e5e5] dark:border-transparent shadow-sm dark:shadow-[rgb(18,18,18)_0px_1px_0px,_rgb(124,124,124)_0px_0px_0px_1px_inset]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
