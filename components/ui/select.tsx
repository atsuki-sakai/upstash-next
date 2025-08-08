"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    const base =
      "h-10 w-full rounded-md border border-gray-300 bg-background px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    return (
      <select ref={ref} className={cn(base, className)} {...props}>
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"
