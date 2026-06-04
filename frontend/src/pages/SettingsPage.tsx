import { useState } from 'react'
import { KeyRound, Check, Save, ShieldCheck, Plus, Trash2, Edit2, CheckCircle2, Circle, ChevronRight, RefreshCw, X, Eye, EyeOff } from 'lucide-react'
import { Button } from '../components/common/Button'
import { PageTop } from '../components/layout/PageTop'
import { useResumeStore } from '../store/resumeStore'
import { cn } from '../utils'
import type { AIProvider } from '../types'
import { aiService } from '../services/aiService'

export function SettingsPage() {
  const { aiSettings, setActiveProvider, addProvider, updateProvider, deleteProvider, updateAIConfig, saved, setSaved } = useResumeStore()
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)

  const handleSave = () => {
    localStorage.setItem('resume-workshop-ai-settings', JSON.stringify(aiSettings))
    saved && setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  const handleAddProvider = () => {
    if (!editingProvider) return
    addProvider({
      name: editingProvider.name,
      type: editingProvider.type,
      baseUrl: editingProvider.baseUrl,
      apiKey: editingProvider.apiKey,
      models: editingProvider.models.length > 0 ? editingProvider.models : ['default'],
      defaultModel: editingProvider.defaultModel || editingProvider.models[0] || 'default',
      enabled: editingProvider.enabled,
    })
    setEditingProvider(null)
    setShowAddModal(false)
    handleSave()
  }

  const handleUpdateProvider = () => {
    if (!editingProvider) return
    updateProvider(editingProvider.id, editingProvider)
    setEditingProvider(null)
    handleSave()
  }

  const handleDeleteProvider = (id: string) => {
    if (confirm('确定要删除这个供应商吗？')) {
      deleteProvider(id)
      handleSave()
    }
  }

  const handleTestConnection = async (provider: AIProvider) => {
    setTestingId(provider.id)
    setTestResult(null)
    try {
      aiService.setSettings({
        providers: [provider],
        activeProviderId: provider.id,
        defaultModel: provider.defaultModel,
        temperature: aiSettings.temperature,
        maxTokens: aiSettings.maxTokens,
      })
      await aiService.chat([{ role: 'user', content: '请回复 "OK" 即可' }])
      setTestResult({ id: provider.id, success: true, message: '连接成功' })
    } catch (error) {
      setTestResult({ id: provider.id, success: false, message: error instanceof Error ? error.message : '连接失败' })
    } finally {
      setTestingId(null)
    }
  }

  const getProviderTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      openai: 'OpenAI 兼容',
      anthropic: 'Anthropic',
      qwen: '通义千问',
      deepseek: 'DeepSeek',
      custom: '自定义',
    }
    return map[type] || type
  }

  const getProviderTypeColor = (type: string) => {
    const map: Record<string, string> = {
      openai: 'bg-blue-100 text-blue-600',
      anthropic: 'bg-purple-100 text-purple-600',
      qwen: 'bg-orange-100 text-orange-600',
      deepseek: 'bg-green-100 text-green-600',
      custom: 'bg-slate-100 text-slate-600',
    }
    return map[type] || 'bg-slate-100 text-slate-600'
  }

  return (
    <div className="p-[34px_38px] max-w-[900px]">
      <PageTop
        title="AI 配置"
        desc="管理大模型供应商配置，支持多个供应商一键切换"
        action={
          <Button onClick={() => { setEditingProvider(null); setShowAddModal(true) }} variant="primary" size="compact">
            <Plus size={16} />
            添加供应商
          </Button>
        }
      />

      <div className="border border-slate-200 rounded-lg bg-white/94 shadow-[0_18px_50px_rgba(15,23,42,0.04)] p-[26px] mb-6">
        <div className="flex items-center gap-4 mb-6">
          <KeyRound size={20} className="text-blue-600" />
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">供应商管理</h2>
            <p className="text-slate-500 text-sm">管理多个 AI 供应商，一键切换使用</p>
          </div>
        </div>

        <div className="space-y-3">
          {aiSettings.providers.map((provider) => (
            <div
              key={provider.id}
              className={cn(
                'flex items-center gap-4 p-4 rounded-lg border transition-all duration-200',
                aiSettings.activeProviderId === provider.id
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <button
                onClick={() => { setActiveProvider(provider.id); handleSave() }}
                className={cn(
                  'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center',
                  aiSettings.activeProviderId === provider.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-slate-300 hover:border-blue-400'
                )}
              >
                {aiSettings.activeProviderId === provider.id && <Check size={12} className="text-white" />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-900">{provider.name}</span>
                  {aiSettings.activeProviderId === provider.id && (
                    <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-600">当前</span>
                  )}
                  <span className={cn('px-2 py-0.5 rounded text-xs', getProviderTypeColor(provider.type))}>
                    {getProviderTypeLabel(provider.type)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="truncate max-w-[200px]">{provider.baseUrl}</span>
                  <span>·</span>
                  <span>模型: {provider.defaultModel}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTestConnection(provider)}
                  disabled={!provider.apiKey || testingId === provider.id}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    provider.apiKey && testingId !== provider.id
                      ? 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                      : 'text-slate-300 cursor-not-allowed'
                  )}
                  title="测试连接"
                >
                  {testingId === provider.id ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : testResult?.id === provider.id ? (
                    testResult.success ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <Circle size={16} className="text-red-500" />
                    )
                  ) : (
                    <RefreshCw size={16} />
                  )}
                </button>

                <button
                  onClick={() => setEditingProvider(provider)}
                  className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="编辑"
                >
                  <Edit2 size={16} />
                </button>

                <button
                  onClick={() => handleDeleteProvider(provider.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="删除"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {aiSettings.activeProviderId === provider.id && (
                <ChevronRight size={18} className="text-blue-500" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg bg-white/94 shadow-[0_18px_50px_rgba(15,23,42,0.04)] p-[26px] mb-6">
        <div className="flex items-center gap-4 mb-6">
          <SettingsIcon size={20} className="text-blue-600" />
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">全局配置</h2>
            <p className="text-slate-500 text-sm">调整 AI 生成参数</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="grid gap-2 mb-[15px]">
              <span className="text-slate-600 text-xs font-medium">温度 (Temperature)</span>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={aiSettings.temperature}
                onChange={(e) => { updateAIConfig({ temperature: parseFloat(e.target.value) }); handleSave() }}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>0 (精确)</span>
                <span className="text-slate-600 font-medium">{aiSettings.temperature}</span>
                <span>2 (创意)</span>
              </div>
            </label>
          </div>

          <div>
            <label className="grid gap-2 mb-[15px]">
              <span className="text-slate-600 text-xs font-medium">最大 Token 数</span>
              <select
                value={aiSettings.maxTokens}
                onChange={(e) => { updateAIConfig({ maxTokens: parseInt(e.target.value) }); handleSave() }}
                className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none appearance-none"
              >
                <option value={1024}>1024</option>
                <option value={2048}>2048</option>
                <option value={4096}>4096</option>
                <option value={8192}>8192</option>
                <option value={16384}>16384</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg bg-white/94 shadow-[0_18px_50px_rgba(15,23,42,0.04)] p-[26px]">
        <div className="flex items-start gap-2.5 mt-3 mb-5 p-[13px] rounded-lg bg-slate-50 text-slate-500 text-sm">
          <ShieldCheck size={18} className="flex-shrink-0 text-emerald-600 mt-0.5" />
          <span>配置保存在浏览器本地，不会上传到服务器。后续接入 FastAPI 后会迁移到后端配置。</span>
        </div>

        <Button type="button" onClick={handleSave} variant="primary" size="wide">
          {saved ? <Check size={17} /> : <Save size={17} />}
          {saved ? '已保存' : '保存配置'}
        </Button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-[500px]" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">添加供应商</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">供应商名称</label>
                <input
                  type="text"
                  value={editingProvider?.name || ''}
                  onChange={(e) => setEditingProvider({ ...(editingProvider || getDefaultProvider()), name: e.target.value })}
                  placeholder="例如：自定义供应商"
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">供应商类型</label>
                <select
                  value={editingProvider?.type || 'openai'}
                  onChange={(e) => setEditingProvider({ ...(editingProvider || getDefaultProvider()), type: e.target.value as AIProvider['type'] })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none appearance-none"
                >
                  <option value="openai">OpenAI 兼容 (OpenAI/Kimi/DeepSeek)</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="qwen">通义千问</option>
                  <option value="deepseek">DeepSeek</option>
                  <option value="custom">自定义</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Base URL</label>
                <input
                  type="text"
                  value={editingProvider?.baseUrl || ''}
                  onChange={(e) => setEditingProvider({ ...(editingProvider || getDefaultProvider()), baseUrl: e.target.value })}
                  placeholder="https://api.example.com/v1"
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">API Key</label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={editingProvider?.apiKey || ''}
                    onChange={(e) => setEditingProvider({ ...(editingProvider || getDefaultProvider()), apiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full h-10 px-3 pr-10 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">可用模型（逗号分隔）</label>
                <input
                  type="text"
                  value={editingProvider?.models.join(', ') || ''}
                  onChange={(e) => setEditingProvider({ ...(editingProvider || getDefaultProvider()), models: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                  placeholder="model-1, model-2, model-3"
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
              <Button onClick={() => setShowAddModal(false)} variant="secondary">
                取消
              </Button>
              <Button onClick={handleAddProvider} variant="primary">
                添加
              </Button>
            </div>
          </div>
        </div>
      )}

      {editingProvider && !showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingProvider(null)}>
          <div className="bg-white rounded-xl w-full max-w-[500px]" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">编辑供应商</h2>
              <button onClick={() => setEditingProvider(null)} className="p-2 rounded-lg hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">供应商名称</label>
                <input
                  type="text"
                  value={editingProvider.name}
                  onChange={(e) => setEditingProvider({ ...editingProvider, name: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">供应商类型</label>
                <select
                  value={editingProvider.type}
                  onChange={(e) => setEditingProvider({ ...editingProvider, type: e.target.value as AIProvider['type'] })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none appearance-none"
                >
                  <option value="openai">OpenAI 兼容</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="qwen">通义千问</option>
                  <option value="deepseek">DeepSeek</option>
                  <option value="custom">自定义</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Base URL</label>
                <input
                  type="text"
                  value={editingProvider.baseUrl}
                  onChange={(e) => setEditingProvider({ ...editingProvider, baseUrl: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">API Key</label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={editingProvider.apiKey}
                    onChange={(e) => setEditingProvider({ ...editingProvider, apiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full h-10 px-3 pr-10 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">可用模型（逗号分隔）</label>
                <input
                  type="text"
                  value={editingProvider.models.join(', ')}
                  onChange={(e) => setEditingProvider({ ...editingProvider, models: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">默认模型</label>
                <select
                  value={editingProvider.defaultModel}
                  onChange={(e) => setEditingProvider({ ...editingProvider, defaultModel: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none appearance-none"
                >
                  {editingProvider.models.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-end gap-3">
              <Button onClick={() => setEditingProvider(null)} variant="secondary">
                取消
              </Button>
              <Button onClick={handleUpdateProvider} variant="primary">
                保存
              </Button>
            </div>
          </div>
        </div>
      )}

      {testResult && (
        <div className={cn('fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2', testResult.success ? 'bg-green-500 text-white' : 'bg-red-500 text-white')}>
          {testResult.success ? <CheckCircle2 size={18} /> : <Circle size={18} />}
          {testResult.message}
        </div>
      )}
    </div>
  )
}

function SettingsIcon(props: { size: number; className?: string }) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function getDefaultProvider(): AIProvider {
  return {
    id: '',
    name: '',
    type: 'openai',
    baseUrl: '',
    apiKey: '',
    models: [],
    defaultModel: '',
    enabled: true,
  }
}