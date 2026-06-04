import { User, Target, GraduationCap, Briefcase, FolderKanban, SlidersHorizontal, PenLine, Award, Languages, Plus } from 'lucide-react'
import { cn } from '../../utils'

const sections = [
  { key: 'basics', label: '基本信息', icon: User },
  { key: 'target', label: '求职意向', icon: Target },
  { key: 'education', label: '教育背景', icon: GraduationCap },
  { key: 'work', label: '工作经历', icon: Briefcase },
  { key: 'projects', label: '项目经历', icon: FolderKanban },
  { key: 'skills', label: '技能特长', icon: SlidersHorizontal },
  { key: 'summary', label: '自我评价', icon: PenLine },
  { key: 'certs', label: '证书荣誉', icon: Award },
  { key: 'extra', label: '附加信息', icon: Languages },
]

interface EditorNavProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function EditorNav({ activeSection, onSectionChange }: EditorNavProps) {
  return (
    <aside className="border border-slate-200 rounded-lg bg-white p-5">
      <h2 className="text-lg font-bold text-slate-900 mb-4.5">编辑简历</h2>
      <nav className="flex flex-col gap-2">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <button
              key={section.key}
              onClick={() => onSectionChange(section.key)}
              className={cn(
                'h-9.5 flex items-center gap-2 px-3 rounded-lg text-sm font-medium transition-all duration-200',
                activeSection === section.key ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-100'
              )}
            >
              <Icon size={15} />
              {section.label}
            </button>
          )
        })}
      </nav>
      <button className="w-full h-9.5 flex items-center justify-center gap-2 mt-6.5 px-3 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
        <Plus size={16} />
        添加模块
      </button>
    </aside>
  )
}
