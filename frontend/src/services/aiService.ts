import type { AIProvider, AISettings } from '../types'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionRequest {
  model: string
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

export interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: ChatMessage
    finish_reason: string | null
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface AnthropicMessage {
  role: 'user' | 'assistant'
  content: Array<{
    type: 'text'
    text: string
  }>
}

export interface AnthropicRequest {
  model: string
  messages: AnthropicMessage[]
  max_tokens: number
  temperature?: number
  stream?: boolean
}

export interface AnthropicResponse {
  id: string
  type: string
  role: string
  content: Array<{
    type: 'text'
    text: string
  }>
  model: string
  stop_reason: string | null
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

export class AIService {
  private provider: AIProvider | null = null
  private temperature: number = 0.7
  private maxTokens: number = 4096

  setSettings(settings: AISettings) {
    this.provider = settings.providers.find((p) => p.id === settings.activeProviderId) || null
    this.temperature = settings.temperature
    this.maxTokens = settings.maxTokens
  }

  getActiveProvider(): AIProvider | null {
    return this.provider
  }

  isConfigured(): boolean {
    return this.provider !== null && this.provider.apiKey.length > 0 && this.provider.baseUrl.length > 0
  }

  async chat(messages: ChatMessage[], options?: { temperature?: number; maxTokens?: number; stream?: boolean }): Promise<string> {
    if (!this.provider) {
      throw new Error('未配置 AI 供应商')
    }

    const { temperature = this.temperature, maxTokens = this.maxTokens, stream = false } = options || {}
    const apiKey = this.provider.apiKey
    const baseUrl = this.provider.baseUrl
    const model = this.provider.defaultModel

    let url: string
    let body: ChatCompletionRequest | AnthropicRequest
    let headers: Record<string, string>

    if (this.provider.type === 'anthropic') {
      url = `${baseUrl}/messages`
      body = {
        model,
        messages: messages.map((m) => ({
          role: m.role === 'system' ? 'user' : m.role,
          content: [{ type: 'text', text: m.content }],
        })) as AnthropicMessage[],
        max_tokens: maxTokens,
        temperature,
        stream,
      }
      headers = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      }
    } else {
      url = `${baseUrl}/chat/completions`
      body = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream,
      }
      headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      }
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error?.message || `API 请求失败: ${response.status}`)
      }

      const data = await response.json()

      if (this.provider.type === 'anthropic') {
        const anthropicData = data as AnthropicResponse
        return anthropicData.content.map((c) => c.text).join('\n')
      } else {
        const openaiData = data as ChatCompletionResponse
        return openaiData.choices[0]?.message?.content || ''
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('AI 请求失败')
    }
  }

  async diagnoseResume(resumeData: Record<string, unknown>): Promise<string> {
    const prompt = `你是一名专业 HR 顾问和简历优化专家，有 10 年招聘经验。请诊断这份简历的问题，必须遵守：
1. 不编造经历。
2. 不直接重写全文。
3. 按严重程度输出问题。
4. 给出可执行修改建议。

简历数据：${JSON.stringify(resumeData, null, 2)}

请输出诊断结果：`

    return this.chat([{ role: 'user', content: prompt }])
  }

  async optimizeSection(section: string, content: string, targetPosition?: string): Promise<string> {
    const prompt = `你是简历改写专家。请将以下${section}内容优化得更专业、更简洁、更符合目标岗位。

目标岗位：${targetPosition || '通用'}

原始内容：
${content}

要求：
1. 保持事实不变，不新增未经用户提供的公司、奖项、数据。
2. 如果缺少数据，用 [待补充数据] 标记。
3. 优先使用主动动词：主导、推动、搭建、优化、协同、落地。
4. 尽量体现 STAR 结构。
5. 输出 3 个版本：稳妥版、强化版、精简版。

请输出优化结果：`

    return this.chat([{ role: 'user', content: prompt }])
  }

  async jdMatch(resumeData: Record<string, unknown>, jdText: string): Promise<string> {
    const prompt = `你是简历与岗位匹配专家。请根据目标 JD 分析当前简历。

目标 JD：
${jdText}

简历数据：${JSON.stringify(resumeData, null, 2)}

要求：
1. 提取 JD 关键词和硬性要求。
2. 找出简历中已经匹配的内容。
3. 找出简历中缺失或表达较弱的内容。
4. 给出修改建议，但不得编造经历。

请输出匹配分析：`

    return this.chat([{ role: 'user', content: prompt }])
  }

  async parseResume(text: string): Promise<string> {
    const prompt = `你是简历结构化解析专家。请将以下原始简历文本转换为结构化 JSON 格式。

原始文本：
${text}

输出格式要求：
{
  "basics": {
    "name": "",
    "headline": "",
    "phone": "",
    "email": "",
    "location": "",
    "website": "",
    "linkedin": "",
    "github": ""
  },
  "summary": "",
  "work": [
    {
      "company": "",
      "position": "",
      "location": "",
      "start_date": "",
      "end_date": "",
      "description": "",
      "highlights": []
    }
  ],
  "education": [
    {
      "school": "",
      "degree": "",
      "major": "",
      "start_date": "",
      "end_date": ""
    }
  ],
  "skills": [
    {
      "category": "专业技能",
      "items": []
    }
  ]
}

注意：
1. 只输出 JSON，不要包含其他文字。
2. 如果无法识别某些字段，留空。
3. 日期格式统一为 YYYY-MM。`

    return this.chat([{ role: 'user', content: prompt }])
  }

  async rewriteBullet(bullet: string, targetPosition?: string): Promise<string> {
    const prompt = `你是简历改写专家。请将以下经历改写得更专业、更简洁、更符合目标岗位。

目标岗位：${targetPosition || '通用'}

原始经历：
${bullet}

要求：
1. 保持事实不变，不新增未经用户提供的公司、奖项、数据。
2. 如果缺少数据，用 [待补充数据] 标记。
3. 优先使用主动动词：主导、推动、搭建、优化、协同、落地。
4. 尽量体现 STAR 结构。
5. 输出 3 个版本：稳妥版、强化版、精简版。

请输出优化结果：`

    return this.chat([{ role: 'user', content: prompt }])
  }
}

export const aiService = new AIService()