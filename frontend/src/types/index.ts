export type ResumeStatus = 'draft' | 'review' | 'pending_delivery' | 'delivered' | 'archived'

export interface ResumeBasics {
  name: string
  headline: string
  gender: string
  birthDate: string
  phone: string
  email: string
  location: string
  website: string
  linkedin: string
  github: string
  avatar?: string
}

export interface ResumeTarget {
  position: string
  industry: string
  company_type: string
  jd_text: string
  keywords: string[]
}

export interface ResumeWork {
  id: string
  company: string
  position: string
  location: string
  start_date: string
  end_date: string
  description: string
  highlights: string[]
}

export interface ResumeProject {
  id: string
  name: string
  role: string
  start_date: string
  end_date: string
  description: string
  highlights: string[]
  technologies: string[]
}

export interface ResumeEducation {
  id: string
  school: string
  degree: string
  major: string
  start_date: string
  end_date: string
  gpa: string
  highlights: string[]
}

export interface ResumeSkill {
  category: string
  items: string[]
}

export interface ResumeCertificate {
  id: string
  name: string
  issuer: string
  date: string
}

export interface ResumeLanguage {
  id: string
  name: string
  level: string
}

export interface ResumeAward {
  id: string
  title: string
  issuer: string
  date: string
  description: string
}

export interface ResumeData {
  basics: ResumeBasics
  target: ResumeTarget
  summary: string
  work: ResumeWork[]
  projects: ResumeProject[]
  education: ResumeEducation[]
  skills: ResumeSkill[]
  certificates: ResumeCertificate[]
  languages: ResumeLanguage[]
  awards: ResumeAward[]
  custom_sections: { id: string; title: string; content: string }[]
}

export interface ResumeCard {
  id: string
  title: string
  role: string
  status: ResumeStatus
  time: string
  template: string
  accent: string
}

export interface TemplateCard {
  id: string
  name: string
  category: string
  accent: string
  dark?: boolean
  tag?: string
}

export interface AiTool {
  title: string
  desc: string
  icon: React.ComponentType<{ size?: number }>
  color: string
}

export interface AiSuggestion {
  id: string
  type: 'optimize' | 'rewrite' | 'quantify' | 'match'
  section: string
  original?: string
  suggestion: string
  reason: string
  applied: boolean
}

export interface ModelMapping {
  [key: string]: string
}

export interface AIProvider {
  id: string
  name: string
  type: 'openai' | 'anthropic' | 'qwen' | 'deepseek' | 'custom'
  baseUrl: string
  apiKey: string
  models: string[]
  defaultModel: string
  modelMapping?: ModelMapping
  enabled: boolean
}

export interface AISettings {
  providers: AIProvider[]
  activeProviderId: string
  defaultModel: string
  temperature: number
  maxTokens: number
}

export interface ExportRecord {
  id: string
  resumeId: string
  filename: string
  format: 'pdf' | 'docx' | 'txt' | 'json'
  createdAt: string
}

export interface Job {
  id: string
  title: string
  company: string
  location: string
  salary: string
  experience: string
  education: string
  companyType: string
  companySize: string
  tags: string[]
  matchScore: number
  platform: 'boss' | 'zhipin' | 'liepin' | 'lagou'
  url: string
  updatedAt: string
  description: string
  requirements: string[]
}

export interface JobFilter {
  keyword: string
  location: string
  experience: string[]
  education: string[]
  salaryRange: string
  companyType: string[]
  matchScoreMin: number
}

export interface JobApplication {
  id: string
  jobId: string
  resumeId: string
  status: 'applied' | 'interview' | 'offer' | 'rejected'
  appliedAt: string
  notes: string
}
