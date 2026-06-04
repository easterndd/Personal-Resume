import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ResumeData, ResumeCard, TemplateCard, AiSuggestion, Settings, ResumeWork, ResumeProject, ResumeEducation, ResumeSkill, Job, JobFilter, JobApplication } from '../types'
import { generateId } from '../utils'

const defaultResumeData: ResumeData = {
  basics: {
    name: '',
    headline: '',
    gender: '',
    birthDate: '',
    phone: '',
    email: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
  },
  target: {
    position: '',
    industry: '',
    company_type: '',
    jd_text: '',
    keywords: [],
  },
  summary: '',
  work: [],
  projects: [],
  education: [],
  skills: [{ category: '专业技能', items: [] }],
  certificates: [],
  languages: [],
  awards: [],
  custom_sections: [],
}

const defaultSettings: Settings = {
  provider: 'deepseek',
  apiKey: '',
  baseUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
}

const mockResumes: ResumeCard[] = [
  { id: '1', title: '产品经理简历', role: '高级产品经理', status: 'delivered', time: '今天 14:30', template: 'modern', accent: '#2563eb' },
  { id: '2', title: '前端工程师简历', role: 'React 前端开发', status: 'draft', time: '昨天 10:20', template: 'classic', accent: '#64748b' },
  { id: '3', title: '运营专员简历', role: '用户运营', status: 'review', time: '05-15 18:45', template: 'compact', accent: '#0ea5e9' },
  { id: '4', title: '设计师简历', role: '视觉设计师', status: 'delivered', time: '05-14 09:30', template: 'creative', accent: '#f97316' },
]

const mockTemplates: TemplateCard[] = [
  { id: 'modern', name: '现代简约', category: '经典商务', accent: '#0f172a' },
  { id: 'classic', name: '专业商务', category: '专业商务', accent: '#334155' },
  { id: 'compact', name: '清新蓝调', category: '经典商务', accent: '#2563eb', tag: '推荐' },
  { id: 'minimal', name: '极简主义', category: '经典商务', accent: '#111827' },
  { id: 'dark', name: '深色简历', category: '创意设计', accent: '#38bdf8', dark: true },
  { id: 'creative', name: '创意设计', category: '创意设计', accent: '#fb7185', tag: '新' },
  { id: 'tech', name: '高级灰', category: '技术开发', accent: '#6b7280' },
  { id: 'study', name: '留学简历', category: '留学', accent: '#0d9488' },
]

const mockJobs: Job[] = [
  {
    id: 'j1',
    title: '高级产品经理',
    company: '字节跳动',
    location: '北京 · 朝阳区',
    salary: '25-45K',
    experience: '3-5年',
    education: '本科',
    companyType: '互联网',
    companySize: '10000人以上',
    tags: ['AI产品', '商业化', '数据驱动'],
    matchScore: 92,
    platform: 'boss',
    url: 'https://www.zhipin.com/job_detail/xxx',
    updatedAt: '今天 10:30',
    description: '负责AI相关产品的规划与设计，推动产品从0到1落地',
    requirements: ['3年以上产品经理经验', '熟悉AI技术', '有商业化经验'],
  },
  {
    id: 'j2',
    title: 'React前端工程师',
    company: '阿里巴巴',
    location: '杭州 · 余杭区',
    salary: '20-40K',
    experience: '3-5年',
    education: '本科',
    companyType: '互联网',
    companySize: '10000人以上',
    tags: ['React', 'TypeScript', '性能优化'],
    matchScore: 88,
    platform: 'zhipin',
    url: 'https://www.zhipin.com/job_detail/xxx',
    updatedAt: '今天 09:15',
    description: '负责核心业务线前端开发，优化用户体验',
    requirements: ['3年以上前端开发经验', '精通React', '熟悉Node.js'],
  },
  {
    id: 'j3',
    title: '产品经理',
    company: '腾讯',
    location: '深圳 · 南山区',
    salary: '22-42K',
    experience: '2-4年',
    education: '本科',
    companyType: '互联网',
    companySize: '10000人以上',
    tags: ['社交产品', '用户增长', '数据分析'],
    matchScore: 85,
    platform: 'boss',
    url: 'https://www.zhipin.com/job_detail/xxx',
    updatedAt: '昨天 18:45',
    description: '负责社交产品的功能规划与迭代',
    requirements: ['2年以上产品经验', '熟悉社交产品', '数据敏感度高'],
  },
  {
    id: 'j4',
    title: '全栈工程师',
    company: '美团',
    location: '北京 · 海淀区',
    salary: '25-50K',
    experience: '3-5年',
    education: '本科',
    companyType: '互联网',
    companySize: '10000人以上',
    tags: ['Vue', 'Node.js', '微服务'],
    matchScore: 82,
    platform: 'liepin',
    url: 'https://www.liepin.com/job/xxx',
    updatedAt: '昨天 16:20',
    description: '负责业务系统的全栈开发与维护',
    requirements: ['3年以上全栈经验', '精通Vue和Node.js', '有微服务经验'],
  },
  {
    id: 'j5',
    title: 'UI设计师',
    company: '网易',
    location: '杭州 · 滨江区',
    salary: '15-25K',
    experience: '2-3年',
    education: '大专',
    companyType: '互联网',
    companySize: '1000-9999人',
    tags: ['UI设计', 'Figma', '品牌设计'],
    matchScore: 78,
    platform: 'lagou',
    url: 'https://www.lagou.com/jobs/xxx',
    updatedAt: '05-31 14:30',
    description: '负责产品界面设计与品牌视觉规范',
    requirements: ['2年以上UI设计经验', '精通Figma', '有互联网产品设计经验'],
  },
  {
    id: 'j6',
    title: '数据产品经理',
    company: '京东',
    location: '北京 · 大兴区',
    salary: '20-35K',
    experience: '2-4年',
    education: '本科',
    companyType: '互联网',
    companySize: '10000人以上',
    tags: ['数据分析', 'BI', '数据可视化'],
    matchScore: 80,
    platform: 'boss',
    url: 'https://www.zhipin.com/job_detail/xxx',
    updatedAt: '05-31 11:00',
    description: '负责数据平台产品设计与优化',
    requirements: ['2年以上数据产品经验', '熟悉SQL', '有BI工具经验'],
  },
  {
    id: 'j7',
    title: '用户运营',
    company: '小红书',
    location: '上海 · 黄浦区',
    salary: '12-20K',
    experience: '1-3年',
    education: '本科',
    companyType: '互联网',
    companySize: '1000-9999人',
    tags: ['用户增长', '社区运营', '内容运营'],
    matchScore: 75,
    platform: 'zhipin',
    url: 'https://www.zhipin.com/job_detail/xxx',
    updatedAt: '05-30 17:20',
    description: '负责社区用户运营与增长策略',
    requirements: ['1年以上运营经验', '熟悉社区产品', '沟通能力强'],
  },
  {
    id: 'j8',
    title: '后端开发工程师',
    company: '华为',
    location: '深圳 · 龙岗区',
    salary: '25-45K',
    experience: '3-5年',
    education: '本科',
    companyType: '通信',
    companySize: '10000人以上',
    tags: ['Java', '分布式', '高并发'],
    matchScore: 83,
    platform: 'liepin',
    url: 'https://www.liepin.com/job/xxx',
    updatedAt: '05-30 15:45',
    description: '负责后端系统架构设计与开发',
    requirements: ['3年以上Java开发经验', '熟悉分布式系统', '有高并发经验'],
  },
]

interface ResumeStore {
  resumes: ResumeCard[]
  currentResumeId: string | null
  currentResumeData: ResumeData
  templates: TemplateCard[]
  currentTemplate: string
  aiSuggestions: AiSuggestion[]
  settings: Settings
  saved: boolean

  jobs: Job[]
  jobFilter: JobFilter
  jobApplications: JobApplication[]

  setCurrentResumeId: (id: string | null) => void
  setCurrentResumeData: (data: ResumeData) => void
  updateBasics: (basics: Partial<ResumeData['basics']>) => void
  updateTarget: (target: Partial<ResumeData['target']>) => void
  updateSummary: (summary: string) => void

  addWork: () => void
  updateWork: (id: string, work: Partial<ResumeWork>) => void
  deleteWork: (id: string) => void
  reorderWork: (ids: string[]) => void

  addProject: () => void
  updateProject: (id: string, project: Partial<ResumeProject>) => void
  deleteProject: (id: string) => void
  reorderProjects: (ids: string[]) => void

  addEducation: () => void
  updateEducation: (id: string, education: Partial<ResumeEducation>) => void
  deleteEducation: (id: string) => void
  reorderEducation: (ids: string[]) => void

  updateSkills: (skills: ResumeSkill[]) => void

  setCurrentTemplate: (templateId: string) => void
  addAiSuggestion: (suggestion: Omit<AiSuggestion, 'id' | 'applied'>) => void
  applyAiSuggestion: (id: string) => void
  clearAiSuggestions: () => void

  updateSettings: (settings: Partial<Settings>) => void
  saveSettings: () => void
  setSaved: (saved: boolean) => void

  addResume: (resume: Omit<ResumeCard, 'id'>) => void
  updateResumeStatus: (id: string, status: ResumeCard['status']) => void
  deleteResume: (id: string) => void
  duplicateResume: (id: string) => void

  setJobFilter: (filter: Partial<JobFilter>) => void
  resetJobFilter: () => void
  applyJob: (jobId: string, resumeId: string) => void
  updateApplicationStatus: (id: string, status: JobApplication['status']) => void
  deleteApplication: (id: string) => void
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      resumes: mockResumes,
      currentResumeId: null,
      currentResumeData: defaultResumeData,
      templates: mockTemplates,
      currentTemplate: 'modern',
      aiSuggestions: [],
      settings: defaultSettings,
      saved: false,

      jobs: mockJobs,
      jobFilter: {
        keyword: '',
        location: '',
        experience: [],
        education: [],
        salaryRange: '',
        companyType: [],
        matchScoreMin: 0,
      },
      jobApplications: [],

      setCurrentResumeId: (id) => set({ currentResumeId: id }),
      setCurrentResumeData: (data) => set({ currentResumeData: data }),
      updateBasics: (basics) =>
        set((state) => ({
          currentResumeData: { ...state.currentResumeData, basics: { ...state.currentResumeData.basics, ...basics } },
        })),
      updateTarget: (target) =>
        set((state) => ({
          currentResumeData: { ...state.currentResumeData, target: { ...state.currentResumeData.target, ...target } },
        })),
      updateSummary: (summary) =>
        set((state) => ({
          currentResumeData: { ...state.currentResumeData, summary },
        })),

      addWork: () =>
        set((state) => ({
          currentResumeData: {
            ...state.currentResumeData,
            work: [...state.currentResumeData.work, { id: generateId(), company: '', position: '', location: '', start_date: '', end_date: '', description: '', highlights: [] }],
          },
        })),
      updateWork: (id, work) =>
        set((state) => ({
          currentResumeData: {
            ...state.currentResumeData,
            work: state.currentResumeData.work.map((w) => (w.id === id ? { ...w, ...work } : w)),
          },
        })),
      deleteWork: (id) =>
        set((state) => ({
          currentResumeData: {
            ...state.currentResumeData,
            work: state.currentResumeData.work.filter((w) => w.id !== id),
          },
        })),
      reorderWork: (ids) =>
        set((state) => ({
          currentResumeData: {
            ...state.currentResumeData,
            work: ids.map((id) => state.currentResumeData.work.find((w) => w.id === id)).filter(Boolean) as ResumeWork[],
          },
        })),

      addProject: () =>
        set((state) => ({
          currentResumeData: {
            ...state.currentResumeData,
            projects: [...state.currentResumeData.projects, { id: generateId(), name: '', role: '', start_date: '', end_date: '', description: '', highlights: [], technologies: [] }],
          },
        })),
      updateProject: (id, project) =>
        set((state) => ({
          currentResumeData: {
            ...state.currentResumeData,
            projects: state.currentResumeData.projects.map((p) => (p.id === id ? { ...p, ...project } : p)),
          },
        })),
      deleteProject: (id) =>
        set((state) => ({
          currentResumeData: {
            ...state.currentResumeData,
            projects: state.currentResumeData.projects.filter((p) => p.id !== id),
          },
        })),
      reorderProjects: (ids) =>
        set((state) => ({
          currentResumeData: {
            ...state.currentResumeData,
            projects: ids.map((id) => state.currentResumeData.projects.find((p) => p.id === id)).filter(Boolean) as ResumeProject[],
          },
        })),

      addEducation: () =>
        set((state) => ({
          currentResumeData: {
            ...state.currentResumeData,
            education: [...state.currentResumeData.education, { id: generateId(), school: '', degree: '', major: '', start_date: '', end_date: '', gpa: '', highlights: [] }],
          },
        })),
      updateEducation: (id, education) =>
        set((state) => ({
          currentResumeData: {
            ...state.currentResumeData,
            education: state.currentResumeData.education.map((e) => (e.id === id ? { ...e, ...education } : e)),
          },
        })),
      deleteEducation: (id) =>
        set((state) => ({
          currentResumeData: {
            ...state.currentResumeData,
            education: state.currentResumeData.education.filter((e) => e.id !== id),
          },
        })),
      reorderEducation: (ids) =>
        set((state) => ({
          currentResumeData: {
            ...state.currentResumeData,
            education: ids.map((id) => state.currentResumeData.education.find((e) => e.id === id)).filter(Boolean) as ResumeEducation[],
          },
        })),

      updateSkills: (skills) =>
        set((state) => ({
          currentResumeData: { ...state.currentResumeData, skills },
        })),

      setCurrentTemplate: (templateId) => set({ currentTemplate: templateId }),
      addAiSuggestion: (suggestion) =>
        set((state) => ({
          aiSuggestions: [...state.aiSuggestions, { ...suggestion, id: generateId(), applied: false }],
        })),
      applyAiSuggestion: (id) =>
        set((state) => ({
          aiSuggestions: state.aiSuggestions.map((s) => (s.id === id ? { ...s, applied: true } : s)),
        })),
      clearAiSuggestions: () => set({ aiSuggestions: [] }),

      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),
      saveSettings: () => set({ saved: true }),
      setSaved: (saved) => set({ saved }),

      addResume: (resume) =>
        set((state) => ({
          resumes: [{ ...resume, id: generateId() }, ...state.resumes],
        })),
      updateResumeStatus: (id, status) =>
        set((state) => ({
          resumes: state.resumes.map((r) => (r.id === id ? { ...r, status } : r)),
        })),
      deleteResume: (id) =>
        set((state) => ({
          resumes: state.resumes.filter((r) => r.id !== id),
        })),
      duplicateResume: (id) =>
        set((state) => {
          const resume = state.resumes.find((r) => r.id === id)
          if (!resume) return state
          return {
            resumes: [{ ...resume, id: generateId(), title: `${resume.title} (复制)`, time: '刚刚' }, ...state.resumes],
          }
        }),

      setJobFilter: (filter) =>
        set((state) => ({
          jobFilter: { ...state.jobFilter, ...filter },
        })),
      resetJobFilter: () =>
        set({
          jobFilter: {
            keyword: '',
            location: '',
            experience: [],
            education: [],
            salaryRange: '',
            companyType: [],
            matchScoreMin: 0,
          },
        }),
      applyJob: (jobId, resumeId) =>
        set((state) => ({
          jobApplications: [...state.jobApplications, { id: generateId(), jobId, resumeId, status: 'applied', appliedAt: new Date().toLocaleString('zh-CN'), notes: '' }],
        })),
      updateApplicationStatus: (id, status) =>
        set((state) => ({
          jobApplications: state.jobApplications.map((a) => (a.id === id ? { ...a, status } : a)),
        })),
      deleteApplication: (id) =>
        set((state) => ({
          jobApplications: state.jobApplications.filter((a) => a.id !== id),
        })),
    }),
    {
      name: 'resume-workshop-storage',
      partialize: (state) => ({
        resumes: state.resumes,
        currentResumeData: state.currentResumeData,
        currentTemplate: state.currentTemplate,
        settings: state.settings,
      }),
    }
  )
)
