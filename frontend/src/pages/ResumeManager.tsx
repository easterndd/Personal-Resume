import { Search, Plus } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { StatusPill } from '../components/common/StatusPill'
import { PageTop } from '../components/layout/PageTop'
import { ResumeMiniature } from '../components/resume/ResumeMiniature'
import { useResumeStore } from '../store/resumeStore'

const statusFilters = ['全部', '草稿', '待复核', '待交付', '已交付', '已归档']

export function ResumeManager() {
  const { resumes } = useResumeStore()

  return (
    <div className="p-[34px_38px]">
      <PageTop
        title="简历管理"
        desc="集中管理客户简历项目、处理状态与最近导出"
        action={
          <NavLink to="/editor">
            <Button variant="primary" size="compact">
              <Plus size={16} />
              新建简历
            </Button>
          </NavLink>
        }
      />

      <div className="flex items-center justify-between gap-[18px] mb-[18px]">
        <label className="min-w-[320px] h-10.5 flex items-center gap-2.5 px-[14px] border border-slate-200 rounded-lg bg-white text-slate-400">
          <Search size={17} />
          <input className="flex-1 bg-transparent text-slate-900 outline-none" placeholder="搜索客户、岗位或模板" />
        </label>
        <div className="flex gap-1.5">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              className={`h-8.5 px-[13px] rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === '全部' ? 'bg-blue-50 text-blue-600' : 'bg-transparent text-slate-500 hover:bg-slate-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg bg-white/94 shadow-[0_18px_50px_rgba(15,23,42,0.04)] overflow-hidden">
        {resumes.map((resume) => (
          <div key={resume.id} className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-[18px] px-[18px] py-4 border-b border-slate-100 last:border-b-0">
            <ResumeMiniature accent={resume.accent} small />
            <div>
              <strong className="block text-slate-900">{resume.title}</strong>
              <span className="block text-slate-500 text-xs mt-1">{resume.role} · {resume.template}</span>
            </div>
            <StatusPill status={resume.status} />
            <span className="text-slate-400 text-xs">{resume.time}</span>
            <NavLink to="/editor">
              <Button variant="secondary" size="small">
                编辑
              </Button>
            </NavLink>
          </div>
        ))}
      </div>
    </div>
  )
}
