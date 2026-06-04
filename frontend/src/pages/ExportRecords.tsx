import { Copy } from 'lucide-react'
import { Button } from '../components/common/Button'
import { PageTop } from '../components/layout/PageTop'

const mockRecords = [
  { filename: '产品经理简历.pdf', time: '2026-06-03 14:30' },
  { filename: '产品经理简历.docx', time: '2026-06-03 13:30' },
  { filename: '前端工程师简历.pdf', time: '2026-06-03 12:30' },
]

export function ExportRecords() {
  return (
    <div className="p-[34px_38px]">
      <PageTop title="导出记录" desc="查看最近生成的交付文件，正式版会关联本地文件目录" />

      <div className="border border-slate-200 rounded-lg bg-white/94 shadow-[0_18px_50px_rgba(15,23,42,0.04)] overflow-hidden">
        {mockRecords.map((record) => (
          <div key={record.filename} className="grid grid-cols-[1fr_auto_auto] items-center gap-[18px] px-[18px] py-4.5 border-b border-slate-100 last:border-b-0">
            <span className="text-slate-900">{record.filename}</span>
            <time className="text-slate-500 text-xs">{record.time}</time>
            <Button variant="secondary" size="small">
              <Copy size={15} />
              复制路径
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
