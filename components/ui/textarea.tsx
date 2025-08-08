"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const base =
      "flex min-h-[80px] w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    return <textarea ref={ref} className={cn(base, className)} {...props} />
  }
)
Textarea.displayName = "Textarea"
