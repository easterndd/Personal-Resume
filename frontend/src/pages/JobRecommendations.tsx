import { useState } from 'react'
import { Search, MapPin, Briefcase, GraduationCap, Building2, Star, ExternalLink, Bookmark, Send, Filter, X, ChevronDown } from 'lucide-react'
import { Button } from '../components/common/Button'
import { PageTop } from '../components/layout/PageTop'
import { useResumeStore } from '../store/resumeStore'
import type { Job } from '../types'
import { cn } from '../utils'

const experienceOptions = ['不限', '应届生', '1-3年', '3-5年', '5-10年', '10年以上']
const educationOptions = ['不限', '大专', '本科', '硕士', '博士']
const companyTypeOptions = ['不限', '互联网', '通信', '金融', '教育', '医疗']
const salaryRangeOptions = ['不限', '10K以下', '10-20K', '20-30K', '30-50K', '50K以上']

export function JobRecommendations() {
  const { jobs, jobFilter, setJobFilter, resetJobFilter, applyJob, jobApplications, currentResumeId } = useResumeStore()
  const [activeFilters, setActiveFilters] = useState<{
    experience: boolean
    education: boolean
    companyType: boolean
    salary: boolean
  }>({
    experience: false,
    education: false,
    companyType: false,
    salary: false,
  })
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  const filteredJobs = jobs.filter((job) => {
    if (jobFilter.keyword && !job.title.includes(jobFilter.keyword) && !job.company.includes(jobFilter.keyword)) {
      return false
    }
    if (jobFilter.location && !job.location.includes(jobFilter.location)) {
      return false
    }
    if (jobFilter.experience.length > 0 && !jobFilter.experience.includes(job.experience)) {
      return false
    }
    if (jobFilter.education.length > 0 && !jobFilter.education.includes(job.education)) {
      return false
    }
    if (jobFilter.companyType.length > 0 && !jobFilter.companyType.includes(job.companyType)) {
      return false
    }
    if (jobFilter.salaryRange && !matchSalary(job.salary, jobFilter.salaryRange)) {
      return false
    }
    if (job.matchScore < jobFilter.matchScoreMin) {
      return false
    }
    return true
  })

  const sortedJobs = [...filteredJobs].sort((a, b) => b.matchScore - a.matchScore)

  const hasApplied = (jobId: string) => jobApplications.some((a) => a.jobId === jobId)

  const handleExperienceChange = (value: string) => {
    if (value === '不限') {
      setJobFilter({ experience: [] })
    } else {
      const current = jobFilter.experience
      if (current.includes(value)) {
        setJobFilter({ experience: current.filter((e) => e !== value) })
      } else {
        setJobFilter({ experience: [...current, value] })
      }
    }
  }

  const handleEducationChange = (value: string) => {
    if (value === '不限') {
      setJobFilter({ education: [] })
    } else {
      const current = jobFilter.education
      if (current.includes(value)) {
        setJobFilter({ education: current.filter((e) => e !== value) })
      } else {
        setJobFilter({ education: [...current, value] })
      }
    }
  }

  const handleCompanyTypeChange = (value: string) => {
    if (value === '不限') {
      setJobFilter({ companyType: [] })
    } else {
      const current = jobFilter.companyType
      if (current.includes(value)) {
        setJobFilter({ companyType: current.filter((e) => e !== value) })
      } else {
        setJobFilter({ companyType: [...current, value] })
      }
    }
  }

  const handleApply = (jobId: string) => {
    if (currentResumeId) {
      applyJob(jobId, currentResumeId)
    } else {
      alert('请先创建或选择一份简历')
    }
  }

  return (
    <div className="p-[34px_38px]">
      <PageTop
        title="岗位推荐"
        desc="基于您的简历信息，智能匹配招聘平台上的优质岗位"
        action={
          <Button onClick={resetJobFilter} variant="secondary" size="compact">
            <X size={16} />
            重置筛选
          </Button>
        }
      />

      <div className="border border-slate-200 rounded-lg bg-white/94 shadow-[0_18px_50px_rgba(15,23,42,0.04)] p-5 mb-5">
        <div className="flex items-center gap-4">
          <label className="flex-1 min-w-[200px] h-10.5 flex items-center gap-2.5 px-[14px] border border-slate-200 rounded-lg bg-white text-slate-400">
            <Search size={17} />
            <input
              className="flex-1 bg-transparent text-slate-900 outline-none"
              placeholder="搜索岗位名称或公司"
              value={jobFilter.keyword}
              onChange={(e) => setJobFilter({ keyword: e.target.value })}
            />
          </label>

          <div className="relative">
            <button
              onClick={() => setActiveFilters((prev) => ({ ...prev, experience: !prev.experience }))}
              className={cn(
                'h-10.5 px-4 rounded-lg flex items-center gap-2 border transition-all duration-200',
                jobFilter.experience.length > 0
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              )}
            >
              <Briefcase size={16} />
              经验
              <ChevronDown size={14} />
            </button>
            {activeFilters.experience && (
              <div className="absolute top-full left-0 mt-2 w-40 p-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                {experienceOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      handleExperienceChange(option)
                      setActiveFilters((prev) => ({ ...prev, experience: false }))
                    }}
                    className={cn(
                      'w-full px-3 py-2 text-left rounded-md text-sm transition-colors',
                      jobFilter.experience.includes(option) ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setActiveFilters((prev) => ({ ...prev, education: !prev.education }))}
              className={cn(
                'h-10.5 px-4 rounded-lg flex items-center gap-2 border transition-all duration-200',
                jobFilter.education.length > 0
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              )}
            >
              <GraduationCap size={16} />
              学历
              <ChevronDown size={14} />
            </button>
            {activeFilters.education && (
              <div className="absolute top-full left-0 mt-2 w-40 p-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                {educationOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      handleEducationChange(option)
                      setActiveFilters((prev) => ({ ...prev, education: false }))
                    }}
                    className={cn(
                      'w-full px-3 py-2 text-left rounded-md text-sm transition-colors',
                      jobFilter.education.includes(option) ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setActiveFilters((prev) => ({ ...prev, companyType: !prev.companyType }))}
              className={cn(
                'h-10.5 px-4 rounded-lg flex items-center gap-2 border transition-all duration-200',
                jobFilter.companyType.length > 0
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              )}
            >
              <Building2 size={16} />
              行业
              <ChevronDown size={14} />
            </button>
            {activeFilters.companyType && (
              <div className="absolute top-full left-0 mt-2 w-40 p-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                {companyTypeOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      handleCompanyTypeChange(option)
                      setActiveFilters((prev) => ({ ...prev, companyType: false }))
                    }}
                    className={cn(
                      'w-full px-3 py-2 text-left rounded-md text-sm transition-colors',
                      jobFilter.companyType.includes(option) ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setActiveFilters((prev) => ({ ...prev, salary: !prev.salary }))}
              className={cn(
                'h-10.5 px-4 rounded-lg flex items-center gap-2 border transition-all duration-200',
                jobFilter.salaryRange
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              )}
            >
              <Filter size={16} />
              薪资
              <ChevronDown size={14} />
            </button>
            {activeFilters.salary && (
              <div className="absolute top-full left-0 mt-2 w-40 p-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                {salaryRangeOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setJobFilter({ salaryRange: option === '不限' ? '' : option })
                      setActiveFilters((prev) => ({ ...prev, salary: false }))
                    }}
                    className={cn(
                      'w-full px-3 py-2 text-left rounded-md text-sm transition-colors',
                      jobFilter.salaryRange === option ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button variant="primary" size="compact">
            <Search size={16} />
            搜索
          </Button>
        </div>

        {(jobFilter.experience.length > 0 ||
          jobFilter.education.length > 0 ||
          jobFilter.companyType.length > 0 ||
          jobFilter.salaryRange) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {jobFilter.experience.map((exp) => (
              <span key={exp} className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs">
                经验:{exp}
              </span>
            ))}
            {jobFilter.education.map((edu) => (
              <span key={edu} className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs">
                学历:{edu}
              </span>
            ))}
            {jobFilter.companyType.map((type) => (
              <span key={type} className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs">
                行业:{type}
              </span>
            ))}
            {jobFilter.salaryRange && (
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs">
                薪资:{jobFilter.salaryRange}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-slate-500 text-sm">共找到 {sortedJobs.length} 个匹配岗位</p>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs">按匹配度排序</span>
          <Star className="text-yellow-500" size={14} />
        </div>
      </div>

      <div className="space-y-4">
        {sortedJobs.map((job) => (
          <article
            key={job.id}
            className="border border-slate-200 rounded-lg bg-white/94 shadow-[0_18px_50px_rgba(15,23,42,0.04)] p-5 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedJob(job)}
          >
            <div className="flex items-start gap-4">
              <div className={cn('flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold', job.matchScore >= 80 ? 'bg-green-100 text-green-700' : job.matchScore >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600')}>
                {job.matchScore}%
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                  <span className="text-xl font-bold text-red-500">{job.salary}</span>
                  <span className={cn('px-2 py-0.5 rounded text-xs font-medium', getPlatformStyle(job.platform))}>
                    {getPlatformLabel(job.platform)}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Building2 size={14} />
                    {job.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={14} />
                    {job.experience}
                  </span>
                  <span className="flex items-center gap-1">
                    <GraduationCap size={14} />
                    {job.education}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {job.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 rounded bg-slate-50 text-slate-600 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="text-slate-500 text-sm line-clamp-2">{job.description}</p>
              </div>

              <div className="flex-shrink-0 flex flex-col gap-2">
                {hasApplied(job.id) ? (
                  <span className="px-3 py-2 rounded-lg bg-green-50 text-green-600 text-xs font-medium">已投递</span>
                ) : (
                  <Button onClick={(e) => { e.stopPropagation(); handleApply(job.id) }} variant="primary" size="compact">
                    <Send size={14} />
                    投递简历
                  </Button>
                )}
                <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50">
                  <Bookmark size={18} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedJob(null)}>
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">{selectedJob.title}</h2>
              <button onClick={() => setSelectedJob(null)} className="p-2 rounded-lg hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-2xl font-bold text-red-500">{selectedJob.salary}</span>
                <span className={cn('px-3 py-1 rounded text-sm font-medium', getPlatformStyle(selectedJob.platform))}>
                  {getPlatformLabel(selectedJob.platform)}
                </span>
                <div className={cn('px-3 py-1 rounded-full text-sm font-medium', selectedJob.matchScore >= 80 ? 'bg-green-100 text-green-700' : selectedJob.matchScore >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600')}>
                  匹配度 {selectedJob.matchScore}%
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">公司名称</p>
                  <p className="text-slate-900 font-medium">{selectedJob.company}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">公司类型</p>
                  <p className="text-slate-900 font-medium">{selectedJob.companyType}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">公司规模</p>
                  <p className="text-slate-900 font-medium">{selectedJob.companySize}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">工作地点</p>
                  <p className="text-slate-900 font-medium">{selectedJob.location}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">经验要求</p>
                  <p className="text-slate-900 font-medium">{selectedJob.experience}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">学历要求</p>
                  <p className="text-slate-900 font-medium">{selectedJob.education}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-3">岗位描述</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{selectedJob.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-3">任职要求</h3>
                <ul className="space-y-2">
                  {selectedJob.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-600 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={(e) => { e.stopPropagation(); handleApply(selectedJob.id) }} variant="primary">
                  <Send size={16} />
                  {hasApplied(selectedJob.id) ? '已投递' : '投递简历'}
                </Button>
                <a href={selectedJob.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm">
                  <ExternalLink size={16} />
                  在平台查看
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function matchSalary(salary: string, range: string): boolean {
  const match = salary.match(/(\d+)-(\d+)K/)
  if (!match) return false
  const min = parseInt(match[1])
  const max = parseInt(match[2])

  switch (range) {
    case '10K以下':
      return max < 10
    case '10-20K':
      return min >= 10 && max <= 20
    case '20-30K':
      return min >= 20 && max <= 30
    case '30-50K':
      return min >= 30 && max <= 50
    case '50K以上':
      return min > 50
    default:
      return true
  }
}

function getPlatformLabel(platform: string): string {
  const map: Record<string, string> = {
    boss: 'BOSS直聘',
    zhipin: '智联招聘',
    liepin: '猎聘',
    lagou: '拉勾',
  }
  return map[platform] || platform
}

function getPlatformStyle(platform: string): string {
  const map: Record<string, string> = {
    boss: 'bg-red-50 text-red-600',
    zhipin: 'bg-blue-50 text-blue-600',
    liepin: 'bg-purple-50 text-purple-600',
    lagou: 'bg-orange-50 text-orange-600',
  }
  return map[platform] || 'bg-slate-50 text-slate-600'
}