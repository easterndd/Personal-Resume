"""
导入服务 - 处理简历文件解析和AI结构化
"""
import json
import os
import re
from typing import Dict, Any, Optional, Tuple
import httpx

from ..config import settings


class ImportService:
    def __init__(self):
        self.upload_dir = settings.upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)

    async def extract_text_from_pdf(self, file_path: str) -> str:
        """从PDF提取文本"""
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(file_path)
            text_parts = []
            for page in doc:
                text_parts.append(page.get_text())
            doc.close()
            return "\n".join(text_parts)
        except Exception as e:
            raise Exception(f"PDF解析失败: {str(e)}")

    async def extract_text_from_docx(self, file_path: str) -> str:
        """从DOCX提取文本"""
        try:
            from docx import Document
            doc = Document(file_path)
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            return "\n".join(paragraphs)
        except Exception as e:
            raise Exception(f"DOCX解析失败: {str(e)}")

    async def extract_text_from_txt(self, file_path: str) -> str:
        """从TXT读取文本"""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except UnicodeDecodeError:
            # 尝试其他编码
            for encoding in ["gbk", "gb2312", "utf-16"]:
                try:
                    with open(file_path, "r", encoding=encoding) as f:
                        return f.read()
                except:
                    continue
            raise Exception("TXT文件编码不支持")

    async def extract_text(self, filename: str, content: bytes) -> Tuple[str, str]:
        """
        从文件提取文本
        返回: (原始文本, 文件类型)
        """
        # 保存上传文件
        filepath = os.path.join(self.upload_dir, filename)
        with open(filepath, "wb") as f:
            f.write(content)

        # 根据扩展名选择解析方法
        ext = os.path.splitext(filename)[1].lower()

        if ext == ".pdf":
            text = await self.extract_text_from_pdf(filepath)
            file_type = "pdf"
        elif ext in [".docx", ".doc"]:
            text = await self.extract_text_from_docx(filepath)
            file_type = "docx"
        elif ext == ".txt":
            text = await self.extract_text_from_txt(filepath)
            file_type = "txt"
        elif ext == ".json":
            # JSON直接解析
            try:
                data = json.loads(content.decode("utf-8"))
                text = json.dumps(data, ensure_ascii=False, indent=2)
                file_type = "json"
            except:
                raise Exception("JSON格式无效")
        else:
            raise Exception(f"不支持的文件格式: {ext}")

        # 清理临时文件
        try:
            os.remove(filepath)
        except:
            pass

        return text, file_type

    async def structure_with_ai(self, raw_text: str, target_position: str = "") -> Dict[str, Any]:
        """
        使用DeepSeek AI将原始文本结构化为简历数据
        """
        if not settings.deepseek_api_key:
            raise Exception("未配置DeepSeek API Key，请在设置页面配置")

        prompt = f"""你是简历结构化专家。请将用户提供的原始简历文本解析为结构化JSON数据。

要求：
1. 严格遵循JSON Resume格式
2. 不编造任何信息，保留原文表述
3. 无法确定的信息用空字符串""
4. 日期格式统一为 YYYY-MM 或 YYYY

目标岗位（可选）：{target_position or '不限'}

原始简历文本：
{raw_text}

请返回以下JSON结构（只返回JSON，不要其他内容）：
{{
  "basics": {{
    "name": "姓名",
    "headline": "职位头衔/简介",
    "phone": "电话",
    "email": "邮箱",
    "location": "所在地",
    "website": "个人网站",
    "linkedin": "LinkedIn",
    "github": "GitHub"
  }},
  "target": {{
    "position": "目标岗位",
    "industry": "目标行业",
    "company_type": "公司类型偏好",
    "jd_text": "目标JD原文",
    "keywords": ["关键词1", "关键词2"]
  }},
  "summary": "个人简介",
  "work": [
    {{
      "id": "work_001",
      "company": "公司名",
      "position": "职位",
      "location": "地点",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM或至今",
      "description": "工作描述",
      "highlights": ["成就1", "成就2"]
    }}
  ],
  "projects": [
    {{
      "id": "project_001",
      "name": "项目名",
      "role": "项目角色",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM或至今",
      "description": "项目描述",
      "highlights": ["项目成就1", "项目成就2"],
      "technologies": ["技术1", "技术2"]
    }}
  ],
  "education": [
    {{
      "id": "edu_001",
      "school": "学校",
      "degree": "学位",
      "major": "专业",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM",
      "gpa": "GPA",
      "highlights": ["荣誉1", "荣誉2"]
    }}
  ],
  "skills": [
    {{
      "category": "技能类别",
      "items": ["技能1", "技能2"]
    }}
  ],
  "certificates": ["证书1", "证书2"],
  "languages": ["语言1", "语言2"],
  "awards": ["奖项1", "奖项2"],
  "custom_sections": []
}}

重要：
- 只返回JSON，不要解释或其他内容
- 确保JSON格式正确可解析
- 所有文本使用中文"""

        messages = [{"role": "user", "content": prompt}]

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {settings.deepseek_api_key}",
        }
        data = {
            "model": settings.deepseek_model,
            "messages": messages,
            "temperature": 0.3,
            "max_tokens": 4000,
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.deepseek_base_url}/chat/completions",
                    headers=headers,
                    json=data,
                    timeout=120,
                )
                response.raise_for_status()
                result = response.json()
                content = result["choices"][0]["message"]["content"]

            # 提取JSON
            content = content.strip()
            # 尝试找到JSON块
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]

            structured_data = json.loads(content.strip())
            return structured_data

        except json.JSONDecodeError as e:
            raise Exception(f"AI返回格式错误: {str(e)}")
        except httpx.HTTPError as e:
            raise Exception(f"AI请求失败: {str(e)}")
        except Exception as e:
            raise Exception(f"结构化失败: {str(e)}")

    def validate_resume_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        验证结构化数据是否完整
        返回验证结果和缺失字段列表
        """
        required_sections = ["basics"]
        optional_sections = [
            "work", "projects", "education", "skills",
            "certificates", "languages", "awards", "summary"
        ]

        missing = []
        warnings = []

        # 检查必需字段
        if "basics" not in data:
            missing.append("basics (个人信息)")

        # 检查basics必填字段
        basics = data.get("basics", {})
        if not basics.get("name"):
            warnings.append("姓名缺失")
        if not basics.get("email"):
            warnings.append("邮箱缺失")

        # 检查各板块数量
        if not data.get("work") and not data.get("projects"):
            warnings.append("工作经历和项目经历均为空，建议补充")

        if not data.get("education"):
            warnings.append("教育经历为空")

        if not data.get("skills"):
            warnings.append("专业技能为空")

        return {
            "valid": len(missing) == 0,
            "missing": missing,
            "warnings": warnings,
            "suggestions": self._generate_suggestions(data)
        }

    def _generate_suggestions(self, data: Dict[str, Any]) -> list:
        """生成完善建议"""
        suggestions = []

        basics = data.get("basics", {})
        if not basics.get("headline"):
            suggestions.append("建议添加职位头衔/个人简介，突出核心竞争力")
        if not basics.get("phone"):
            suggestions.append("建议添加联系电话，方便招聘方联系")
        if not basics.get("github") and not basics.get("website"):
            suggestions.append("建议添加GitHub或个人网站，展示技术实力")

        work = data.get("work", [])
        if work:
            for i, w in enumerate(work[:3]):
                if not w.get("highlights"):
                    suggestions.append(f"工作{i+1}缺少具体成就，建议添加量化数据")

        if not data.get("summary"):
            suggestions.append("建议添加个人简介，总结职业背景和优势")

        return suggestions


import_service = ImportService()
