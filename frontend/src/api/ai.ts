import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface AiRewriteRequest {
  text: string
  target_position?: string
}

export interface AiRewriteResponse {
  result: string
}

export async function rewriteText(request: AiRewriteRequest): Promise<AiRewriteResponse> {
  const response = await api.post('/api/ai/rewrite-text', request)
  return response.data
}

export async function diagnoseResume(resumeData: Record<string, any>): Promise<AiRewriteResponse> {
  const response = await api.post('/api/ai/diagnose', resumeData)
  return response.data
}

export async function jdMatch(resumeData: Record<string, any>, jdText: string): Promise<AiRewriteResponse> {
  const response = await api.post('/api/ai/jd-match', { resume_data: resumeData, jd_text: jdText })
  return response.data
}

export async function optimizeSection(section: string, content: string, targetPosition?: string): Promise<AiRewriteResponse> {
  const response = await api.post('/api/ai/optimize-section', { section, content, target_position: targetPosition })
  return response.data
}