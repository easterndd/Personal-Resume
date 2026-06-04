import { useMemo } from 'react'
import { cn } from '../../utils'

interface ResumeMiniatureProps {
  accent: string
  small?: boolean
  tall?: boolean
  dark?: boolean
}

export function ResumeMiniature({ accent, small, tall, dark }: ResumeMiniatureProps) {
  const lines = useMemo(() => Array.from({ length: small ? 5 : 12 }), [small])

  return (
    <div
      className={cn(
        'border rounded-lg bg-white shadow-inner box-border',
        small ? 'w-[72px] min-h-[92px] p-2' : tall ? 'min-h-[250px] p-4' : 'min-h-[180px] p-4',
        dark && 'bg-slate-900 border-slate-800'
      )}
      style={{ borderColor: '#dfe7f1' }}
    >
      <div className="flex items-center justify-between mb-3.5">
        <span className="w-10 h-2.5 rounded-full" style={{ background: accent }} />
        <i className={cn('w-[26px] h-[26px] rounded-full', dark ? 'bg-slate-700' : 'bg-slate-200')} />
      </div>
      {lines.map((_, index) => (
        <b
          key={index}
          className={cn(
            'block h-1.5 mb-2 rounded-full border-l-2',
            dark ? 'bg-slate-800' : 'bg-slate-100'
          )}
          style={{
            width: `${index % 4 === 0 ? 78 : index % 3 === 0 ? 52 : 92}%`,
            borderColor: index % 5 === 0 ? accent : (dark ? '#334155' : '#e2e8f0'),
          }}
        />
      ))}
    </div>
  )
}
