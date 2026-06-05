import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  responseType: 'blob',
})

export async function exportPdf(resumeId: string, templateId?: string): Promise<Blob> {
  const params: Record<string, string> = { resume_id: resumeId }
  if (templateId) {
    params.template_id = templateId
  }
  const response = await api.post('/api/export/pdf', null, { params })
  return response.data
}

export async function exportDocx(resumeId: string): Promise<Blob> {
  const response = await api.post('/api/export/docx', null, { params: { resume_id: resumeId } })
  return response.data
}

export async function exportTxt(resumeId: string): Promise<Blob> {
  const response = await api.post('/api/export/txt', null, { params: { resume_id: resumeId } })
  return response.data
}

export async function exportJson(resumeId: string): Promise<Blob> {
  const response = await api.post('/api/export/json', null, { params: { resume_id: resumeId } })
  return response.data
}

export function downloadFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}