import { PageTop } from '../components/layout/PageTop'
import { ResumeMiniature } from '../components/resume/ResumeMiniature'
import { useResumeStore } from '../store/resumeStore'

const categories = ['全部', '经典商务', '专业商务', '创意设计', '技术开发', '后端开发', '留学']
const colors = ['#2563eb', '#1f2937', '#64748b', '#7c3aed', '#f472b6', '#ef4444', '#facc15']

export function Templates() {
  const { templates, currentTemplate, setCurrentTemplate } = useResumeStore()

  return (
    <div className="p-[34px_38px]">
      <PageTop title="模板中心" desc="选择适合岗位风格的简历模板，后续可扩展行业模板包" />

      <div className="flex gap-1.5 mb-4">
        {categories.map((item, index) => (
          <button
            key={item}
            className={`h-8.5 px-[13px] rounded-lg text-sm font-medium transition-all duration-200 ${
              index === 0 ? 'bg-blue-50 text-blue-600' : 'bg-transparent text-slate-500 hover:bg-slate-100'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2.5 mb-6 text-slate-500 text-sm">
        <span>颜色：</span>
        {colors.map((color) => (
          <button key={color} className="w-[22px] h-[22px] rounded-md border-0 cursor-pointer" style={{ background: color }} aria-label={color} />
        ))}
      </div>

      <div className="grid grid-cols-4 gap-7">
        {templates.map((template) => (
          <article
            key={template.id}
            onClick={() => setCurrentTemplate(template.id)}
            className={`border rounded-lg bg-white p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
              currentTemplate === template.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
            }`}
          >
            <ResumeMiniature accent={template.accent} dark={template.dark} tall />
            <div className="flex items-center justify-between mt-3">
              <strong className="text-slate-900 text-sm">{template.name}</strong>
              {template.tag ? (
                <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs">{template.tag}</span>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
