"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    // 基本スタイル: 枠線、背景、フォーカスリング
    const base =
      "flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    return (
      <input ref={ref} type={type} className={cn(base, className)} {...props} />
    )
  }
)
Input.displayName = "Input"
