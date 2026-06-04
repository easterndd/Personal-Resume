import type { ReactNode, MouseEventHandler } from 'react'
import { cn } from '../../utils'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'default' | 'compact' | 'small' | 'wide'
  className?: string
  onClick?: MouseEventHandler<HTMLButtonElement>
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'default',
  className,
  onClick,
  type = 'button',
  disabled = false,
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium cursor-pointer transition-all duration-200'
  
  const variantStyles = {
    primary: 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    danger: 'bg-gradient-to-b from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 hover:from-red-400 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed',
  }
  
  const sizeStyles = {
    default: 'h-11 px-5 rounded-lg text-sm',
    compact: 'h-9 px-4 rounded-lg text-xs',
    small: 'h-8 px-3 rounded-md text-xs',
    wide: 'h-11 px-5 rounded-lg text-sm w-full',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
    >
      {children}
    </button>
  )
}
