import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface ResumeResponse {
  id: string
  title: string
  target_position: string
  target_industry: string
  status: string
  template_id: string
  resume_data: Record<string, any>
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ResumeCreate {
  title: string
  resume_data: Record<string, any>
  target_position?: string
  target_industry?: string
}

export interface ResumeUpdate {
  title?: string
  resume_data?: Record<string, any>
  target_position?: string
  target_industry?: string
  template_id?: string
  status?: string
  notes?: string
}

export async function getResumes(): Promise<ResumeResponse[]> {
  const response = await api.get('/api/resumes')
  return response.data
}

export async function getResume(id: string): Promise<ResumeResponse> {
  const response = await api.get(`/api/resumes/${id}`)
  return response.data
}

export async function createResume(data: ResumeCreate): Promise<ResumeResponse> {
  const response = await api.post('/api/resumes', data)
  return response.data
}

export async function updateResume(id: string, data: ResumeUpdate): Promise<ResumeResponse> {
  const response = await api.put(`/api/resumes/${id}`, data)
  return response.data
}

export async function deleteResume(id: string): Promise<void> {
  await api.delete(`/api/resumes/${id}`)
}

export async function duplicateResume(id: string): Promise<ResumeResponse> {
  const response = await api.post(`/api/resumes/${id}/duplicate`)
  return response.data
}

export async function updateResumeStatus(id: string, status: string): Promise<void> {
  await api.patch(`/api/resumes/${id}/status`, { status })
}