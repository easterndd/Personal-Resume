import json
from typing import Dict, Any, Optional
import httpx

from ..config import settings


class AiService:
    def __init__(self):
        self.providers = {
            "deepseek": {
                "api_key": settings.deepseek_api_key,
                "base_url": settings.deepseek_base_url,
                "model": settings.deepseek_model,
                "type": "openai",
            },
            "openai": {
                "api_key": settings.openai_api_key,
                "base_url": settings.openai_base_url,
                "model": settings.openai_model,
                "type": "openai",
            },
            "qwen": {
                "api_key": settings.qwen_api_key,
                "base_url": settings.qwen_base_url,
                "model": settings.qwen_model,
                "type": "openai",
            },
            "kimi": {
                "api_key": settings.kimi_api_key,
                "base_url": settings.kimi_base_url,
                "model": settings.kimi_model,
                "type": "openai",
            },
            "anthropic": {
                "api_key": settings.anthropic_api_key,
                "base_url": settings.anthropic_base_url,
                "model": settings.anthropic_model,
                "type": "anthropic",
            },
        }

    def get_active_provider(self) -> Optional[Dict[str, Any]]:
        for provider, config in self.providers.items():
            if config["api_key"]:
                return config
        return None

    def get_provider(self, provider_name: str) -> Optional[Dict[str, Any]]:
        return self.providers.get(provider_name)

    async def chat_openai(self, messages: list, provider_config: Dict[str, Any]) -> str:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {provider_config['api_key']}",
        }
        data = {
            "model": provider_config["model"],
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 2000,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{provider_config['base_url']}/chat/completions",
                headers=headers,
                json=data,
                timeout=60,
            )
            response.raise_for_status()
            result = response.json()
            return result["choices"][0]["message"]["content"]

    async def chat_anthropic(self, messages: list, provider_config: Dict[str, Any]) -> str:
        headers = {
            "Content-Type": "application/json",
            "x-api-key": provider_config["api_key"],
            "anthropic-version": "2023-06-01",
        }
        data = {
            "model": provider_config["model"],
            "max_tokens": 2000,
            "temperature": 0.7,
            "messages": messages,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{provider_config['base_url']}/messages",
                headers=headers,
                json=data,
                timeout=60,
            )
            response.raise_for_status()
            result = response.json()
            return result["content"][0]["text"]

    async def chat(self, messages: list, provider_name: str = "") -> str:
        if provider_name:
            provider_config = self.get_provider(provider_name)
        else:
            provider_config = self.get_active_provider()

        if not provider_config:
            raise ValueError("No AI provider configured. Please set API keys in .env")

        if provider_config["type"] == "anthropic":
            return await self.chat_anthropic(messages, provider_config)
        else:
            return await self.chat_openai(messages, provider_config)

    async def rewrite_bullet(self, text: str, target_position: str = "") -> str:
        prompt = f"""你是简历改写专家。请将用户提供的一条经历改写得更专业、更简洁、更符合目标岗位。

目标岗位：{target_position or '不限'}

原始内容：
{text}

要求：
1. 保持事实不变，不新增未经用户提供的公司、奖项、数据。
2. 如果缺少数据，用 [待补充数据] 标记。
3. 优先使用主动动词：主导、推动、搭建、优化、协同、落地。
4. 尽量体现 STAR 结构。
5. 输出 3 个版本：稳妥版、强化版、精简版。

返回 JSON 格式：
{{
  "versions": [
    {{"type": "稳妥版", "text": "...", "reason": "..."}},
    {{"type": "强化版", "text": "...", "reason": "..."}},
    {{"type": "精简版", "text": "...", "reason": "..."}}
  ],
  "need_confirm": ["需要用户确认的信息"]
}}"""

        messages = [{"role": "user", "content": prompt}]
        result = await self.chat(messages)
        return result

    async def diagnose_resume(self, resume_data: Dict[str, Any]) -> str:
        prompt = f"""你是一名专业 HR 顾问和简历优化专家，有 10 年招聘经验。请诊断这份简历的问题，必须遵守：
1. 不编造经历。
2. 不直接重写全文。
3. 按严重程度输出问题。
4. 给出可执行修改建议。
5. 针对目标岗位提取关键词。

简历数据：
{json.dumps(resume_data, ensure_ascii=False)}

输出 JSON：
{{
  "score": 0-100,
  "summary": "整体评价",
  "issues": [
    {{"level": "high|medium|low", "section": "板块", "problem": "问题", "suggestion": "建议"}}
  ],
  "keywords": [],
  "next_actions": []
}}"""

        messages = [{"role": "user", "content": prompt}]
        result = await self.chat(messages)
        return result

    async def jd_match(self, resume_data: Dict[str, Any], jd_text: str) -> str:
        prompt = f"""你是简历与岗位匹配专家。请根据目标 JD 分析当前简历。

目标 JD：
{jd_text}

简历数据：
{json.dumps(resume_data, ensure_ascii=False)}

要求：
1. 提取 JD 关键词和硬性要求。
2. 找出简历中已经匹配的内容。
3. 找出简历中缺失或表达较弱的内容。
4. 给出修改建议，但不得编造经历。
5. 输出可直接应用到简历中的改写建议。

输出 JSON：
{{
  "keywords": [],
  "matched": [],
  "missing": [],
  "suggestions": []
}}"""

        messages = [{"role": "user", "content": prompt}]
        result = await self.chat(messages)
        return result

    async def optimize_section(self, section: str, content: str, target_position: str = "") -> str:
        prompt = f"""你是简历优化专家。请优化以下简历板块内容。

板块：{section}
目标岗位：{target_position or '不限'}

原始内容：
{content}

要求：
1. 保持事实不变。
2. 提升专业性和可读性。
3. 突出亮点和量化成果。
4. 输出优化后的内容和修改理由。

返回 JSON：
{{
  "optimized": "...",
  "reason": "修改理由"
}}"""

        messages = [{"role": "user", "content": prompt}]
        result = await self.chat(messages)
        return result

    async def quantify(self, text: str) -> str:
        prompt = f"""你是简历量化专家。请分析以下经历内容，找出可以量化的部分，并给出量化建议。

原始内容：
{text}

要求：
1. 不编造数据，只给出可以补充数字的方向。
2. 指出哪些动词或成果可以量化。
3. 给出具体的量化建议格式。
4. 如果原文已经有数据，指出可以进一步细化的方向。

返回 JSON：
{{
  "suggestions": [
    {{
      "original": "原文中的描述",
      "quantifiable": true/false,
      "suggestion": "量化建议",
      "example": "示例表达"
    }}
  ],
  "tips": ["量化技巧提示"]
}}"""

        messages = [{"role": "user", "content": prompt}]
        result = await self.chat(messages)
        return result

    async def translate(self, text: str, target_language: str = "en") -> str:
        languages = {
            "en": "英语",
            "zh": "中文",
        }
        target_lang_name = languages.get(target_language, "英语")

        prompt = f"""你是专业翻译专家。请将以下简历内容翻译成{target_lang_name}。

原文：
{text}

要求：
1. 保持专业术语准确。
2. 保持简历格式和结构。
3. 确保语法正确、表达地道。
4. 对于工作经历和项目描述，保持专业且简洁。
5. 不要添加额外内容。

返回 JSON：
{{
  "translated": "翻译后的内容",
  "language": "{target_language}"
}}"""

        messages = [{"role": "user", "content": prompt}]
        result = await self.chat(messages)
        return result


ai_service = AiService()