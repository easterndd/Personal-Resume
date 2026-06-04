import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: '草稿',
    review: '待复核',
    pending_delivery: '待交付',
    delivered: '已交付',
    archived: '已归档',
  }
  return map[status] || status
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    review: 'bg-amber-50 text-amber-700',
    pending_delivery: 'bg-blue-50 text-blue-700',
    delivered: 'bg-emerald-50 text-emerald-700',
    archived: 'bg-gray-50 text-gray-500',
  }
  return map[status] || 'bg-gray-50 text-gray-500'
}
