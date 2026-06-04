import { useState, useEffect } from 'react'
import { X, Sparkles, Check, RefreshCw } from 'lucide-react'
import { Button } from '../common/Button'
import { aiService } from '../../services/aiService'
import { useResumeStore } from '../../store/resumeStore'

interface AiRewriteModalProps {
  isOpen: boolean
  onClose: () => void
  section: string
  content: string
  targetPosition?: string
  onApply: (rewrittenContent: string) => void
}

interface RewriteVersion {
  type: string
  text: string
  reason: string
}

export function AiRewriteModal({ isOpen, onClose, section, content, targetPosition, onApply }: AiRewriteModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [versions, setVersions] = useState<RewriteVersion[]>([])
  const [selectedVersion, setSelectedVersion] = useState<string>('')

  const { aiSettings } = useResumeStore()

  useEffect(() => {
    if (isOpen && content) {
      aiService.setSettings(aiSettings)
      fetchRewrite()
    } else {
      setVersions([])
      setSelectedVersion('')
    }
  }, [isOpen, content])

  const fetchRewrite = async () => {
    if (!aiService.isConfigured()) {
      alert('请先在设置页配置 AI 供应商和 API Key')
      onClose()
      return
    }

    setIsLoading(true)
    try {
      const result = await aiService.rewriteBullet(content, targetPosition)
      const parsed = parseRewriteResult(result)
      setVersions(parsed)
    } catch (error) {
      console.error('AI 改写失败:', error)
      alert(error instanceof Error ? error.message : 'AI 改写失败，请检查网络连接和 API Key')
    } finally {
      setIsLoading(false)
    }
  }

  const parseRewriteResult = (result: string): RewriteVersion[] => {
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0])
        return data.versions || []
      }
    } catch {
      // 如果不是 JSON，尝试按文本格式解析
    }

    const lines = result.split('\n').filter((line: string) => line.trim())
    const parsedVersions: RewriteVersion[] = []
    let currentType = ''
    let currentText = ''
    let currentReason = ''

    lines.forEach((line: string) => {
      if (line.includes('稳妥版')) {
        if (currentType) {
          parsedVersions.push({ type: currentType, text: currentText.trim(), reason: currentReason.trim() })
        }
        currentType = '稳妥版'
        currentText = ''
        currentReason = ''
      } else if (line.includes('强化版')) {
        if (currentType) {
          parsedVersions.push({ type: currentType, text: currentText.trim(), reason: currentReason.trim() })
        }
        currentType = '强化版'
        currentText = ''
        currentReason = ''
      } else if (line.includes('精简版')) {
        if (currentType) {
          parsedVersions.push({ type: currentType, text: currentText.trim(), reason: currentReason.trim() })
        }
        currentType = '精简版'
        currentText = ''
        currentReason = ''
      } else if (line.includes('理由') || line.includes('原因')) {
        currentReason += line.replace(/理由[：:]?|原因[：:]?/g, '').trim() + '\n'
      } else if (currentType) {
        currentText += line + '\n'
      }
    })

    if (currentType) {
      parsedVersions.push({ type: currentType, text: currentText.trim(), reason: currentReason.trim() })
    }

    return parsedVersions.length > 0 ? parsedVersions : [
      { type: '优化版', text: result, reason: 'AI 优化建议' }
    ]
  }

  const handleApply = () => {
    const version = versions.find((v) => v.type === selectedVersion)
    if (version) {
      onApply(version.text)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-[700px] max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Sparkles size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">AI {section}优化</h2>
              <p className="text-slate-500 text-sm">为您生成 3 个优化版本</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="mb-4 p-3 rounded-lg bg-slate-50">
            <span className="text-slate-500 text-xs">原始内容：</span>
            <p className="text-slate-700 text-sm mt-1">{content}</p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw size={24} className="text-blue-600 animate-spin mx-auto" />
              <p className="text-slate-500 mt-3">AI 正在分析优化中...</p>
            </div>
          ) : versions.length > 0 ? (
            <div className="space-y-4">
              {versions.map((version) => (
                <div
                  key={version.type}
                  onClick={() => setSelectedVersion(version.type)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedVersion === version.type
                      ? 'border-blue-500 bg-blue-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${
                      selectedVersion === version.type ? 'text-blue-600' : 'text-slate-700'
                    }`}>
                      {version.type}
                    </span>
                    {selectedVersion === version.type && (
                      <Check size={16} className="text-blue-600" />
                    )}
                  </div>
                  <p className="text-slate-900 text-sm leading-relaxed mb-2">{version.text}</p>
                  {version.reason && (
                    <p className="text-slate-500 text-xs mt-2">
                      <span className="font-medium">修改理由：</span>{version.reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p>暂无优化结果</p>
              <button onClick={fetchRewrite} className="text-blue-600 text-sm mt-2 hover:underline">
                重新生成
              </button>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
          <Button onClick={onClose} variant="secondary">
            取消
          </Button>
          <Button onClick={handleApply} variant="primary" disabled={!selectedVersion || isLoading}>
            <Check size={16} />
            应用选中版本
          </Button>
        </div>
      </div>
    </div>
  )
}