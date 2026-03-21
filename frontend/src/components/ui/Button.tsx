import * as React from "react"
import { cn } from "@/utils/cn"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
          {
            'bg-primary text-white shadow hover:bg-primary/90': variant === 'default',
            'border border-slate-200 bg-transparent shadow-sm hover:bg-slate-100 text-slate-900': variant === 'outline',
            'hover:bg-slate-100 hover:text-slate-900': variant === 'ghost',
            'bg-red-500 text-white shadow-sm hover:bg-red-500/90': variant === 'danger',
            'h-8 px-3 text-xs': size === 'sm',
            'h-10 px-4 py-2': size === 'md',
            'h-12 px-8 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
