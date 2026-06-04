import type { ResumeStatus } from '../../types'
import { getStatusLabel, getStatusColor } from '../../utils'

interface StatusPillProps {
  status: ResumeStatus
}

export function StatusPill({ status }: StatusPillProps) {
  return (
    <span className={`inline-flex items-center h-7 px-3 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
      {getStatusLabel(status)}
    </span>
  )
}
