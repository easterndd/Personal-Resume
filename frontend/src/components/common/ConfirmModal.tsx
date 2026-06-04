import { AlertTriangle, Check } from 'lucide-react'
import { Button } from './Button'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = '确认删除',
  message,
  confirmText = '确认删除',
  cancelText = '取消',
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">{title}</h2>
          <p className="text-slate-500">{message}</p>
        </div>
        <div className="flex gap-3 p-6 border-t border-slate-200">
          <Button onClick={onClose} variant="secondary" className="flex-1">
            {cancelText}
          </Button>
          <Button onClick={() => { onConfirm(); onClose() }} variant="danger" className="flex-1">
            <Check size={16} />
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}