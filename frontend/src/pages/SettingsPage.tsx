import { useEffect } from 'react'
import { KeyRound, Check, Save, ShieldCheck } from 'lucide-react'
import { Button } from '../components/common/Button'
import { PageTop } from '../components/layout/PageTop'
import { useResumeStore } from '../store/resumeStore'

export function SettingsPage() {
  const { settings, updateSettings, saveSettings, saved, setSaved } = useResumeStore()

  useEffect(() => {
    const raw = localStorage.getItem('resume-workshop-settings')
    if (raw) {
      const parsed = JSON.parse(raw)
      updateSettings(parsed)
    }
  }, [])

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault()
    localStorage.setItem('resume-workshop-settings', JSON.stringify(settings))
    saveSettings()
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div className="p-[34px_38px] max-w-[820px]">
      <PageTop title="设置" desc="配置本地原型需要的模型参数。当前版本只保存到浏览器本地，不会上传。" />

      <form onSubmit={handleSave} className="border border-slate-200 rounded-lg bg-white/94 shadow-[0_18px_50px_rgba(15,23,42,0.04)] p-[26px]">
        <div className="flex items-center gap-4 mb-6">
          <KeyRound size={20} className="text-blue-600" />
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">大模型配置</h2>
            <p className="text-slate-500 text-sm">后续接入 FastAPI 后会迁移到后端 `.env` 或本地配置文件</p>
          </div>
        </div>

        <label className="grid gap-2 mb-[15px]">
          <span className="text-slate-600 text-xs font-medium">模型提供商</span>
          <select
            value={settings.provider}
            onChange={(e) => updateSettings({ provider: e.target.value as typeof settings.provider })}
            className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none appearance-none"
          >
            <option value="deepseek">DeepSeek</option>
            <option value="openai">OpenAI</option>
            <option value="qwen">通义千问</option>
            <option value="kimi">Kimi</option>
          </select>
        </label>

        <label className="grid gap-2 mb-[15px]">
          <span className="text-slate-600 text-xs font-medium">API Key</span>
          <input
            type="password"
            placeholder="sk-..."
            value={settings.apiKey}
            onChange={(e) => updateSettings({ apiKey: e.target.value })}
            className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
          />
        </label>

        <label className="grid gap-2 mb-[15px]">
          <span className="text-slate-600 text-xs font-medium">Base URL</span>
          <input
            value={settings.baseUrl}
            onChange={(e) => updateSettings({ baseUrl: e.target.value })}
            className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
          />
        </label>

        <label className="grid gap-2 mb-[15px]">
          <span className="text-slate-600 text-xs font-medium">模型名称</span>
          <input
            value={settings.model}
            onChange={(e) => updateSettings({ model: e.target.value })}
            className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
          />
        </label>

        <div className="flex items-start gap-2.5 mt-3 mb-5 p-[13px] rounded-lg bg-slate-50 text-slate-500 text-sm">
          <ShieldCheck size={18} className="flex-shrink-0 text-emerald-600 mt-0.5" />
          <span>当前仅做前端 mock，AI 按钮不会真实调用 API。保存后可用于后续联调。</span>
        </div>

        <Button type="submit" variant="primary" size="wide">
          {saved ? <Check size={17} /> : <Save size={17} />}
          {saved ? '已保存' : '保存配置'}
        </Button>
      </form>
    </div>
  )
}
