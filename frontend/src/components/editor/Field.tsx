import type { ReactNode } from 'react'

interface FieldProps {
  label: string
  children: ReactNode
  className?: string
}

export function Field({ label, children, className }: FieldProps) {
  return (
    <label className={`grid gap-2 mb-3.5 ${className}`}>
      <span className="text-slate-600 text-xs font-medium">{label}</span>
      {children}
    </label>
  )
}
