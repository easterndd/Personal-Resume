import { WandSparkles, Target, Languages, Check } from 'lucide-react'
import { Button } from '../common/Button'
import { useResumeStore } from '../../store/resumeStore'

export function AiSidePanel() {
  const { aiSuggestions, addAiSuggestion, applyAiSuggestion, clearAiSuggestions } = useResumeStore()

  const handleOptimize = () => {
    addAiSuggestion({
      type: 'optimize',
      section: '工作经历',
      suggestion: '建议将"负责项目"改为"主导项目全流程落地"，并补充可验证的量化数据。',
      reason: '使用主动动词和量化成果能更好地展示你的工作价值。',
    })
  }

  return (
    <aside className="border border-slate-200 rounded-lg bg-white p-5">
      <h2 className="text-lg font-bold text-slate-900 mb-4.5">AI 助手</h2>
      <div className="flex flex-col gap-2">
        <button onClick={handleOptimize} className="h-9.5 flex items-center gap-2 px-3 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all duration-200 justify-start">
          <WandSparkles size={16} />
          优化整份简历
        </button>
        <button className="h-9.5 flex items-center gap-2 px-3 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all duration-200 justify-start">
          <Target size={16} />
          匹配岗位 JD
        </button>
        <button className="h-9.5 flex items-center gap-2 px-3 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all duration-200 justify-start">
          <Languages size={16} />
          翻译英文版
        </button>
      </div>

      <div className="mt-5.5 p-4 rounded-lg bg-slate-50">
        <span className="text-blue-600 font-bold text-xs">AI 建议</span>
        {aiSuggestions.length > 0 ? (
          <div className="space-y-3 mt-2.5">
            {aiSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="p-3 rounded-lg bg-white border border-slate-100">
                <p className="text-slate-600 text-xs leading-[1.7]">{suggestion.suggestion}</p>
                <p className="text-slate-400 text-xs mt-1">{suggestion.reason}</p>
                <div className="flex gap-2 mt-4">
                  {!suggestion.applied ? (
                    <Button onClick={() => applyAiSuggestion(suggestion.id)} variant="primary" size="compact">
                      <Check size={14} />
                      应用建议
                    </Button>
                  ) : (
                    <span className="text-emerald-600 text-xs font-medium flex items-center gap-1">
                      <Check size={14} />
                      已应用
                    </span>
                  )}
                  <Button variant="secondary" size="compact">
                    复制
                  </Button>
                </div>
              </div>
            ))}
            <button onClick={clearAiSuggestions} className="text-slate-400 text-xs hover:text-slate-600">
              清除所有建议
            </button>
          </div>
        ) : (
          <p className="text-slate-500 text-xs leading-[1.7] mt-2.5">
            点击上方按钮获取 AI 优化建议。AI 建议不会直接修改你的简历，需手动确认后应用。
          </p>
        )}
      </div>
    </aside>
  )
}
