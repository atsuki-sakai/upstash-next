"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
}

export function Button({ className, variant = "default", size = "md", ...props }: ButtonProps) {
  // 見た目: バリアントとサイズでスタイルを切替
  const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    default: "bg-foreground text-background hover:opacity-90",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 text-foreground bg-background hover:bg-gray-50",
    ghost: "bg-transparent hover:bg-gray-100",
  }
  const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4",
    lg: "h-12 px-6 text-lg",
  }
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props} />
  )
}
