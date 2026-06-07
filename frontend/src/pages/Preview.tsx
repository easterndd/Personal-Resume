import React from 'react'
import { FileDown } from 'lucide-react'
import { Button } from '../components/common/Button'
import { ResumeDocument } from '../components/resume/ResumeDocument'
import { exportPdf, downloadFile } from '../api/export'

interface PreviewProps {
  onBack: () => void
  isExporting: boolean
  setIsExporting: (value: boolean) => void
}

export const Preview: React.FC<PreviewProps> = ({ onBack, isExporting, setIsExporting }) => {
  const handleExport = async () => {
    setIsExporting(true)
    try {
      // 使用 resumeData 生成 PDF
      const blob = await exportPdf('preview')
      const filename = `resume_preview.pdf`
      downloadFile(blob, filename)
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex flex-col">
      <header className="flex items-center justify-between mb-6 bg-white px-6 py-4 rounded-lg shadow-sm">
        <h1 className="text-lg font-bold text-slate-900">简历预览 - A4格式</h1>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="small" onClick={handleExport} disabled={isExporting}>
            <FileDown size={16} />
            {isExporting ? '导出中...' : '导出PDF'}
          </Button>
          <Button variant="primary" size="small" onClick={onBack}>
            返回编辑
          </Button>
        </div>
      </header>
      <div className="flex-1 flex justify-center items-start">
        <div className="bg-white shadow-lg print:shadow-none" style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}>
          <ResumeDocument />
        </div>
      </div>
    </div>
  )
}
