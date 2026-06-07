import React, { useState, useCallback, useRef } from 'react'
import { Upload, FileText, Wand2, Check, AlertTriangle, Loader2, ChevronRight } from 'lucide-react'
import { importFile, structureResume, validateResume } from "../../api/import";
import { useResumeStore } from "../../store/resumeStore";
import type { ResumeData } from "../../types";

interface ImportPanelProps {
  onComplete?: (data: ResumeData) => void
}

type Step = 'upload' | 'edit' | 'structure' | 'validate' | 'confirm'

interface ValidationResult {
  valid: boolean
  missing: string[]
  warnings: string[]
  suggestions: string[]
}

export const ImportPanel: React.FC<ImportPanelProps> = ({ onComplete }) => {
  const [step, setStep] = useState<Step>('upload')
  const [rawText, setRawText] = useState('')
  const [targetPosition, setTargetPosition] = useState('')
  const [structuredData, setStructuredData] = useState<ResumeData | null>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { setCurrentResumeData, showToast } = useResumeStore()

  // 处理文件选择
  const handleFileSelect = useCallback(async (selectedFile: File) => {
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt', '.json']
    const ext = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'))

    if (!validExtensions.includes(ext)) {
      setError('不支持的文件格式，请上传 PDF、DOCX、TXT 或 JSON 文件')
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('文件大小超过 10MB 限制')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const result = await importFile(selectedFile)
      setRawText(result.raw_text)
      setStep('edit')
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || '文件解析失败')
    } finally {
      setLoading(false)
    }
  }, [])

  // 拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }, [handleFileSelect])

  // 点击上传
  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }, [handleFileSelect])

  // AI结构化
  const handleStructure = useCallback(async () => {
    if (!rawText.trim()) {
      setError('请输入简历文本内容')
      return
    }

    setLoading(true)
    setError(null)
    setStep('structure')

    try {
      const result = await structureResume(rawText, targetPosition)
      setStructuredData(result.resume_data as ResumeData)
      setValidation(result.validation)

      // 验证数据
      const validateResult = await validateResume(result.resume_data)
      setValidation(validateResult.validation)

      setStep('validate')
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'AI结构化失败')
      setStep('edit')
    } finally {
      setLoading(false)
    }
  }, [rawText, targetPosition])

  // 确认导入
  const handleConfirm = useCallback(() => {
    if (structuredData) {
      setCurrentResumeData(structuredData)
      showToast('success', '简历导入成功')
      onComplete?.(structuredData)
    }
  }, [structuredData, setCurrentResumeData, onComplete])

  // 重新编辑
  const handleBack = useCallback(() => {
    if (step === 'edit') setStep('upload')
    else if (step === 'validate') setStep('edit')
  }, [step])

  // 重置
  const handleReset = useCallback(() => {
    setStep('upload')
    setRawText('')
    setTargetPosition('')
    setStructuredData(null)
    setValidation(null)
    setError(null)
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* 步骤指示器 */}
      <div className="flex items-center gap-2 mb-6">
        {['上传', '编辑', 'AI解析', '确认'].map((label, index) => {
          const stepIndex = ['upload', 'edit', 'structure', 'validate'].indexOf(step)
          const isActive = index <= stepIndex
          const isCurrent = index === stepIndex

          return (
            <React.Fragment key={label}>
              <div className={`flex items-center gap-2 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  isCurrent ? 'bg-blue-600 text-white' : isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {index < stepIndex ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span className="text-sm font-medium">{label}</span>
              </div>
              {index < 3 && <ChevronRight className="w-4 h-4 text-gray-300" />}
            </React.Fragment>
          )
        })}
      </div>

      {/* 上传步骤 */}
      {step === 'upload' && (
        <div className="flex-1 flex flex-col">
          <div
            className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-colors cursor-pointer ${
              dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,.doc,.txt,.json"
              onChange={handleFileChange}
            />

            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              {loading ? (
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-blue-600" />
              )}
            </div>

            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {loading ? '正在解析文件...' : '点击或拖拽文件到此处'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              支持 PDF、DOCX、TXT、JSON 格式，文件大小不超过 10MB
            </p>

            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                PDF
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                DOCX
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                TXT
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                JSON
              </div>
            </div>
          </div>

          {/* 快捷导入按钮 */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">或者导入 JSON 格式的简历数据：</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              选择 JSON 文件
            </button>
          </div>
        </div>
      )}

      {/* 编辑步骤 */}
      {step === 'edit' && (
        <div className="flex-1 flex flex-col">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                目标岗位（可选）
              </label>
              <span className="text-xs text-gray-500">帮助AI更准确地提取信息</span>
            </div>
            <input
              type="text"
              value={targetPosition}
              onChange={(e) => setTargetPosition(e.target.value)}
              placeholder="例如：高级前端工程师"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 flex flex-col mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                原始文本
              </label>
              <span className="text-xs text-gray-500">
                {rawText.length} 字符
              </span>
            </div>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="flex-1 w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="请粘贴或编辑简历文本内容..."
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              重新上传
            </button>
            <button
              onClick={handleStructure}
              disabled={loading || !rawText.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  正在AI解析...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  AI智能解析
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* AI解析步骤 */}
      {step === 'structure' && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">AI正在解析简历...</h3>
          <p className="text-sm text-gray-500">这可能需要几秒钟时间</p>
        </div>
      )}

      {/* 验证/确认步骤 */}
      {step === 'validate' && structuredData && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 验证结果 */}
          {validation && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              {validation.warnings.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-amber-700">建议完善</span>
                  </div>
                  <ul className="space-y-1">
                    {validation.warnings.map((warning, i) => (
                      <li key={i} className="text-sm text-amber-600 flex items-start gap-2">
                        <span className="text-amber-400">•</span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {validation.suggestions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700">优化建议</span>
                  </div>
                  <ul className="space-y-1">
                    {validation.suggestions.map((suggestion, i) => (
                      <li key={i} className="text-sm text-green-600 flex items-start gap-2">
                        <span className="text-green-400">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 结构化预览 */}
          <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
            <div className="p-4 space-y-4">
              {/* 基本信息 */}
              {structuredData.basics && (
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">基本信息</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>姓名：{structuredData.basics.name || '-'}</div>
                    <div>邮箱：{structuredData.basics.email || '-'}</div>
                    <div>电话：{structuredData.basics.phone || '-'}</div>
                    <div>所在地：{structuredData.basics.location || '-'}</div>
                  </div>
                </div>
              )}

              {/* 目标岗位 */}
              {structuredData.target?.position && (
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">目标岗位</h4>
                  <p className="text-sm">{structuredData.target.position}</p>
                </div>
              )}

              {/* 工作经历 */}
              {structuredData.work && structuredData.work.length > 0 && (
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    工作经历 ({structuredData.work.length})
                  </h4>
                  {structuredData.work.map((w, i) => (
                    <div key={i} className="mb-2 text-sm">
                      <div className="font-medium">{w.company || '公司'} - {w.position || '职位'}</div>
                      <div className="text-gray-500 text-xs">
                        {w.start_date || ''} - {w.end_date || ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 项目经历 */}
              {structuredData.projects && structuredData.projects.length > 0 && (
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    项目经历 ({structuredData.projects.length})
                  </h4>
                  {structuredData.projects.map((p, i) => (
                    <div key={i} className="mb-2 text-sm">
                      <div className="font-medium">{p.name || '项目'}</div>
                      <div className="text-gray-500 text-xs">
                        {p.start_date || ''} - {p.end_date || ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 教育经历 */}
              {structuredData.education && structuredData.education.length > 0 && (
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    教育经历 ({structuredData.education.length})
                  </h4>
                  {structuredData.education.map((e, i) => (
                    <div key={i} className="mb-2 text-sm">
                      <div className="font-medium">{e.school || '学校'}</div>
                      <div className="text-gray-500 text-xs">
                        {e.degree || ''} {e.major || ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 技能 */}
              {structuredData.skills && structuredData.skills.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">技能</h4>
                  <div className="flex flex-wrap gap-2">
                    {structuredData.skills.map((s, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {s.category}: {s.items?.join(', ') || ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleBack}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              重新编辑
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              重新上传
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              确认导入
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
