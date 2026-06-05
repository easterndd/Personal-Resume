import { useState, useEffect } from 'react'
import { Search, Plus, Filter } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { StatusPill } from '../components/common/StatusPill'
import { PageTop } from '../components/layout/PageTop'
import { ResumeMiniature } from '../components/resume/ResumeMiniature'
import { useResumeStore } from '../store/resumeStore'

const statusFilters = ['全部', '草稿', '待复核', '待交付', '已交付', '已归档']

const statusMap: Record<string, string> = {
  '全部': '',
  '草稿': 'draft',
  '待复核': 'review',
  '待交付': 'pending_delivery',
  '已交付': 'delivered',
  '已归档': 'archived',
}

export function ResumeManager() {
  const { resumes, loadResumes } = useResumeStore()
  const [searchKeyword, setSearchKeyword] = useState('')
  const [activeStatus, setActiveStatus] = useState('全部')

  useEffect(() => {
    loadResumes()
  }, [loadResumes])

  const filteredResumes = resumes.filter((resume) => {
    const matchesSearch =
      resume.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      resume.role.toLowerCase().includes(searchKeyword.toLowerCase())

    const matchesStatus = activeStatus === '全部' || resume.status === statusMap[activeStatus]

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: resumes.length,
    draft: resumes.filter((r) => r.status === 'draft').length,
    review: resumes.filter((r) => r.status === 'review').length,
    delivered: resumes.filter((r) => r.status === 'delivered').length,
  }

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

      <div className="grid grid-cols-4 gap-[18px] mb-[18px]">
        <div className="border border-slate-200 rounded-lg bg-white/94 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold">总</span>
            </div>
            <div>
              <strong className="block text-xl font-bold text-slate-900">{stats.total}</strong>
              <span className="block text-slate-500 text-xs">简历项目</span>
            </div>
          </div>
        </div>
        <div className="border border-slate-200 rounded-lg bg-white/94 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <span className="text-amber-600 font-bold">草</span>
            </div>
            <div>
              <strong className="block text-xl font-bold text-slate-900">{stats.draft}</strong>
              <span className="block text-slate-500 text-xs">草稿中</span>
            </div>
          </div>
        </div>
        <div className="border border-slate-200 rounded-lg bg-white/94 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold">复</span>
            </div>
            <div>
              <strong className="block text-xl font-bold text-slate-900">{stats.review}</strong>
              <span className="block text-slate-500 text-xs">待复核</span>
            </div>
          </div>
        </div>
        <div className="border border-slate-200 rounded-lg bg-white/94 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-600 font-bold">交</span>
            </div>
            <div>
              <strong className="block text-xl font-bold text-slate-900">{stats.delivered}</strong>
              <span className="block text-slate-500 text-xs">已交付</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-[18px] mb-[18px]">
        <label className="min-w-[320px] h-10.5 flex items-center gap-2.5 px-[14px] border border-slate-200 rounded-lg bg-white text-slate-400">
          <Search size={17} />
          <input
            className="flex-1 bg-transparent text-slate-900 outline-none"
            placeholder="搜索客户、岗位或模板"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </label>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          {statusFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveStatus(filter)}
              className={`h-8.5 px-[13px] rounded-lg text-sm font-medium transition-all duration-200 ${
                activeStatus === filter ? 'bg-blue-50 text-blue-600' : 'bg-transparent text-slate-500 hover:bg-slate-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg bg-white/94 shadow-[0_18px_50px_rgba(15,23,42,0.04)] overflow-hidden">
        {filteredResumes.length > 0 ? (
          filteredResumes.map((resume) => (
            <div key={resume.id} className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-[18px] px-[18px] py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
              <ResumeMiniature accent={resume.accent} small />
              <div>
                <strong className="block text-slate-900">{resume.title}</strong>
                <span className="block text-slate-500 text-xs mt-1">{resume.role} · {resume.template}</span>
              </div>
              <StatusPill status={resume.status} />
              <span className="text-slate-400 text-xs">{resume.time}</span>
              <NavLink to={`/editor/${resume.id}`}>
                <Button variant="secondary" size="small">
                  编辑
                </Button>
              </NavLink>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-400">
            <p>没有找到匹配的简历项目</p>
            <p className="text-xs mt-1">尝试调整搜索关键词或筛选条件</p>
          </div>
        )}
      </div>
    </div>
  )
}