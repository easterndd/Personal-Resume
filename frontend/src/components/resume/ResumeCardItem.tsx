import { MoreVertical } from 'lucide-react'
import type { ResumeCard } from '../../types'
import { ResumeMiniature } from './ResumeMiniature'

interface ResumeCardItemProps {
  resume: ResumeCard
}

export function ResumeCardItem({ resume }: ResumeCardItemProps) {
  return (
    <article className="border border-slate-200 rounded-lg bg-white p-3.5 hover:shadow-md transition-shadow duration-200">
      <ResumeMiniature accent={resume.accent} />
      <div className="flex items-center justify-between mt-3">
        <div>
          <strong className="block text-slate-900 text-sm">{resume.title}</strong>
          <span className="block text-slate-400 text-xs">{resume.time}</span>
        </div>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors duration-200" aria-label="更多操作">
          <MoreVertical size={17} />
        </button>
      </div>
    </article>
  )
}
