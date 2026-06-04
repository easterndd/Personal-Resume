import { WandSparkles, FileText, PenLine, Target } from 'lucide-react'
import { Button } from '../components/common/Button'
import { PageTop } from '../components/layout/PageTop'
import { ImportExport } from './ImportExport'

const aiTools = [
  {
    title: 'AI 优化',
    desc: '智能优化简历内容，提升专业度和吸引力',
    icon: WandSparkles,
    color: '#2563eb',
  },
  {
    title: 'AI 生成',
    desc: '根据个人信息生成简历内容',
    icon: FileText,
    color: '#3b82f6',
  },
  {
    title: 'AI 润色',
    desc: '优化语言表达，使内容更简洁专业',
    icon: PenLine,
    color: '#7c3aed',
  },
  {
    title: '技能匹配',
    desc: '智能匹配岗位需求，优化技能描述',
    icon: Target,
    color: '#0d9488',
  },
]

const usageRecords = [
  { title: 'AI 优化 · 产品经理简历', time: '2024-05-20 14:30' },
  { title: 'AI 生成 · 前端工程师简历', time: '2024-05-19 18:45' },
]

export function AiTools() {
  return (
    <div className="p-[34px_38px] grid grid-cols-[1fr_minmax(360px,520px)] gap-[18px]">
      <section className="border border-slate-200 rounded-lg bg-white/94 shadow-[0_18px_50px_rgba(15,23,42,0.04)] p-[26px]">
        <PageTop title="AI 工具箱" desc="用 AI 提升简历质量，让求职更有竞争力" compact />

        <div className="grid grid-cols-2 gap-[18px]">
          {aiTools.map((tool) => {
            const Icon = tool.icon
            return (
              <article key={tool.title} className="border border-slate-200 rounded-lg bg-white p-[22px] min-h-[168px]">
                <div
                  className="w-[48px] h-[48px] rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${tool.color}12`, color: tool.color }}
                >
                  <Icon size={24} />
                </div>
                <div className="ml-[14px]">
                  <strong className="block text-slate-900 mb-1.5">{tool.title}</strong>
                  <p className="text-slate-500 text-sm">{tool.desc}</p>
                </div>
                <Button variant="secondary" size="small" className="mt-4">
                  立即使用
                </Button>
              </article>
            )
          })}
        </div>

        <section className="mt-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">使用记录</h2>
            <a href="#" className="text-blue-600 text-sm">全部记录</a>
          </div>
          <div className="space-y-0">
            {usageRecords.map((record) => (
              <div key={record.title} className="flex items-center justify-between py-4.5 border-b border-slate-100 last:border-b-0">
                <span className="text-slate-900">{record.title}</span>
                <time className="text-slate-500 text-xs">{record.time}</time>
              </div>
            ))}
          </div>
        </section>
      </section>

      <ImportExport embedded />
    </div>
  )
}
