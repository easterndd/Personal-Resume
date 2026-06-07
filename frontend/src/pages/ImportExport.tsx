import { useState } from 'react'
import { FileType, FileText, FileJson, FileDown } from 'lucide-react'
import { Button } from '../components/common/Button'
import { PageTop } from '../components/layout/PageTop'
import { ImportPanel } from '../components/import'
import { useResumeStore } from '../store/resumeStore'

interface ImportExportProps {
  embedded?: boolean
}

export function ImportExport({ embedded = false }: ImportExportProps) {
  const [showImport, setShowImport] = useState(false)
  const { setCurrentResumeData, setCurrentResumeId } = useResumeStore()

  const handleImportComplete = (data: any) => {
    setShowImport(false)
    setCurrentResumeData(data)
    setCurrentResumeId(null) // 新简历
  }

  return (
    <div className={`${embedded ? 'border border-slate-200 rounded-lg bg-white/94 shadow-[0_18px_50px_rgba(15,23,42,0.04)] p-[26px]' : 'p-[34px_38px]'} space-y-[22px]`}>
      {!embedded ? (
        <PageTop title="导入导出" desc="支持 PDF / DOCX / TXT / JSON，智能解析生成结构化简历" />
      ) : null}

      <section className="border border-slate-200 rounded-lg bg-white/94 shadow-[0_18px_50px_rgba(15,23,42,0.04)] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">导入简历</h2>
            <p className="text-slate-500 text-sm">AI智能解析，一键生成结构化简历</p>
          </div>
          {!showImport && (
            <Button variant="secondary" size="small" onClick={() => setShowImport(true)}>
              导入新简历
            </Button>
          )}
        </div>

        {showImport ? (
          <div className="min-h-[400px]">
            <ImportPanel onComplete={handleImportComplete} />
          </div>
        ) : (
          <div className="min-h-[180px] flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 rounded-lg bg-blue-50/50 text-center cursor-pointer hover:border-blue-400 transition-colors"
               onClick={() => setShowImport(true)}>
            <div className="flex gap-[18px] mb-3">
              <span className="w-[42px] h-[50px] flex items-center justify-center rounded-lg text-white text-xs font-bold bg-red-500">PDF</span>
              <span className="w-[42px] h-[50px] flex items-center justify-center rounded-lg text-white text-xs font-bold bg-blue-600">DOCX</span>
              <span className="w-[42px] h-[50px] flex items-center justify-center rounded-lg text-white text-xs font-bold bg-slate-400">TXT</span>
              <span className="w-[42px] h-[50px] flex items-center justify-center rounded-lg text-white text-xs font-bold bg-emerald-500">JSON</span>
            </div>
            <strong className="text-slate-900">点击或拖拽文件到此处上传</strong>
            <p className="text-slate-500 text-sm">支持 PDF / DOCX / TXT / JSON 格式，文件大小不超过 10MB</p>
            <p className="text-blue-600 text-sm font-medium mt-2">AI智能解析 → 自动生成结构化简历</p>
          </div>
        )}
      </section>

      <section className="border border-slate-200 rounded-lg bg-white/94 shadow-[0_18px_50px_rgba(15,23,42,0.04)] p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-2">导出简历</h2>
        <p className="text-slate-500 text-sm">选择导出格式</p>
        <div className="grid grid-cols-4 gap-2.5 mt-4.5">
          {[
            { icon: FileType, label: 'PDF' },
            { icon: FileText, label: 'DOCX' },
            { icon: FileText, label: 'TXT' },
            { icon: FileJson, label: 'JSON' },
          ].map(({ icon: Icon, label }, index) => (
            <button
              key={label}
              className={`h-9.5 flex items-center justify-center gap-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                index === 1 ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
        <label className="grid gap-2 mb-4 mt-4">
          <span className="text-slate-600 text-xs font-medium">导出设置</span>
          <input className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none" defaultValue="产品经理简历" />
        </label>
        <label className="flex items-center justify-between mb-5.5 text-slate-600">
          <span>合并为一页</span>
          <input type="checkbox" className="w-[38px] h-[22px] accent-blue-600" defaultChecked />
        </label>
        <Button variant="primary" size="wide">
          <FileDown size={17} />
          导出简历
        </Button>
      </section>
    </div>
  )
}
