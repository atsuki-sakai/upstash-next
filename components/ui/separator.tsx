"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type SeparatorProps = React.HTMLAttributes<HTMLDivElement>

export function Separator({ className, ...props }: SeparatorProps) {
  return <div className={cn("my-4 h-px w-full bg-gray-200", className)} {...props} />
}
