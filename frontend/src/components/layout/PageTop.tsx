import type { ReactNode } from 'react'
import { cn } from '../../utils'

interface PageTopProps {
  title: string
  desc: string
  action?: ReactNode
  compact?: boolean
}

export function PageTop({ title, desc, action, compact }: PageTopProps) {
  return (
    <header className={cn('flex items-center justify-between gap-[18px] mb-6', compact && 'mb-5.5')}>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{title}</h1>
        <p className="text-slate-500 text-sm">{desc}</p>
      </div>
      {action}
    </header>
  )
}
