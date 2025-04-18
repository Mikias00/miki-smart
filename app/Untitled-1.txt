import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-white/20 hover:bg-white/30 border border-white/30 text-white ${className}`}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"
