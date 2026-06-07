/**
 * 导入相关API
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 导入需要更长的超时时间
});

/**
 * 上传并解析简历文件
 * @param file 文件对象
 * @returns 包含原始文本和文件类型
 */
export async function importFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/api/import/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

/**
 * AI结构化简历文本
 * @param rawText 原始文本
 * @param targetPosition 目标岗位（可选）
 */
export async function structureResume(rawText: string, targetPosition: string = '') {
  const response = await apiClient.post('/api/import/structure', {
    raw_text: rawText,
    target_position: targetPosition,
  });

  return response.data;
}

/**
 * 验证简历数据完整性
 * @param resumeData 简历数据
 */
export async function validateResume(resumeData: Record<string, any>) {
  const response = await apiClient.post('/api/import/validate', {
    resume_data: resumeData,
  });

  return response.data;
}

/**
 * 快捷导入：一步完成文件解析和AI结构化
 * @param file 文件对象
 */
export async function quickStructure(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/api/import/quick-structure', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

/**
 * 验证JSON格式简历数据
 * @param resumeData 简历数据
 */
export async function structureJson(resumeData: Record<string, any>) {
  const response = await apiClient.post('/api/import/structure-json', resumeData);
  return response.data;
}
