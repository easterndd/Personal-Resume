import type { ReactNode } from 'react'
import { useResumeStore } from '../../store/resumeStore'
import { formatResumeDateRange } from '../../utils'

interface DocSectionProps {
  title: string
  children: ReactNode
}

function DocSection({ title, children }: DocSectionProps) {
  return (
    <section className="mt-5.5">
      <h2 className="text-[15px] font-bold text-slate-900 mb-3 pb-1.5 border-b border-slate-200">{title}</h2>
      {children}
    </section>
  )
}

interface DocEntryProps {
  left: string
  title: string
  meta: string
  children?: ReactNode
}

function DocEntry({ left, title, meta, children }: DocEntryProps) {
  return (
    <div className="grid grid-cols-[112px_1fr] gap-5 mb-3.5">
      <span className="text-slate-500 text-xs">{left}</span>
      <div>
        <strong className="block text-slate-900 text-sm">{title}</strong>
        <em className="block text-slate-500 text-xs mt-1">{meta}</em>
        {children ? <ul className="mt-2 pl-4">{children}</ul> : null}
      </div>
    </div>
  )
}

export function ResumeDocument() {
  const { currentResumeData } = useResumeStore()

  const { basics, education, work, projects, skills, summary } = currentResumeData

  return (
    <article className="w-[595px] min-h-[842px] p-[42px_44px] bg-white shadow-xl shadow-slate-900/9 box-border text-slate-900">
      <header className="flex justify-between gap-5 pb-4.5 border-b-2 border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1.5">{basics.name || '姓名'}</h1>
          <strong className="block text-slate-600 mb-2">{basics.headline || '求职意向'}</strong>
          <p className="text-slate-500 text-xs leading-[1.8]">
            {basics.phone} · {basics.email} · {basics.location}
          </p>
        </div>
        <div className="flex-shrink-0 w-[70px] h-[82px] flex items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-lg overflow-hidden">
          {basics.avatar ? (
            <img 
              src={basics.avatar} 
              alt="avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            basics.name?.charAt(0) || '张'
          )}
        </div>
      </header>

      {summary && (
        <DocSection title="个人简介">
          <p className="text-slate-500 text-xs leading-[1.8]">{summary}</p>
        </DocSection>
      )}

      {education.length > 0 && (
        <DocSection title="教育背景">
          {education.map((edu) => (
            <DocEntry key={edu.id} left={formatResumeDateRange(edu.start_date, edu.end_date)} title={edu.school} meta={`${edu.major} · ${edu.degree}`}>
              {edu.highlights.map((highlight, idx) => (
                <li key={idx} className="text-slate-500 text-xs leading-[1.8]">{highlight}</li>
              ))}
            </DocEntry>
          ))}
        </DocSection>
      )}

      {work.length > 0 && (
        <DocSection title="工作经历">
          {work.map((w) => (
            <DocEntry key={w.id} left={formatResumeDateRange(w.start_date, w.end_date)} title={w.company} meta={w.position}>
              {w.highlights.map((highlight, idx) => (
                <li key={idx} className="text-slate-500 text-xs leading-[1.8]">{highlight}</li>
              ))}
            </DocEntry>
          ))}
        </DocSection>
      )}

      {projects.length > 0 && (
        <DocSection title="项目经历">
          {projects.map((p) => (
            <DocEntry key={p.id} left={formatResumeDateRange(p.start_date, p.end_date)} title={p.name} meta={p.role}>
              {p.highlights.map((highlight, idx) => (
                <li key={idx} className="text-slate-500 text-xs leading-[1.8]">{highlight}</li>
              ))}
            </DocEntry>
          ))}
        </DocSection>
      )}

      {skills.length > 0 && skills.some((s) => s.items.length > 0) && (
        <DocSection title="技能特长">
          <p className="text-slate-500 text-xs leading-[1.8]">
            {skills.map((s) => s.items.join(' · ')).join(' · ')}
          </p>
        </DocSection>
      )}
    </article>
  )
}
