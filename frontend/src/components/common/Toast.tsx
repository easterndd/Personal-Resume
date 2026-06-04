import { useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { useResumeStore } from '../../store/resumeStore'
import { cn } from '../../utils'

export function Toast() {
  const { toast, setToast } = useResumeStore()

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toast, setToast])

  if (!toast) return null

  const iconMap = {
    success: <CheckCircle size={18} className="text-emerald-500" />,
    error: <XCircle size={18} className="text-red-500" />,
    warning: <AlertCircle size={18} className="text-amber-500" />,
    info: <Info size={18} className="text-blue-500" />,
  }

  const bgMap = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className={cn('flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white', bgMap[toast.type])}>
        {iconMap[toast.type]}
        <span className="text-sm font-medium">{toast.message}</span>
        <button
          onClick={() => setToast(null)}
          className="ml-2 p-1 rounded hover:bg-white/20 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}