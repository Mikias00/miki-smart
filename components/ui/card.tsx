import * as React from "react"

export function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white/10 p-4 rounded-xl shadow-md ${className}`}>
      {children}
    </div>
  )
}

export function CardContent({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={className}>{children}</div>
}
