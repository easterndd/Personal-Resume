import os
from typing import Dict, Any, List

from jinja2 import Environment, FileSystemLoader

from ..config import settings


class TemplateService:
    def __init__(self):
        self.template_dir = os.path.join(os.path.dirname(__file__), "../templates")
        self.env = Environment(loader=FileSystemLoader(self.template_dir))

        self.templates = {
            "modern": {
                "id": "modern",
                "name": "现代简约",
                "description": "简洁、蓝色点缀，适合互联网、产品、运营、技术岗位",
                "target_audience": "互联网、产品、运营、技术",
                "style": "简约",
                "tags": ["互联网", "产品", "前端", "后端", "运营", "简约", "一页优先", "ATS"],
                "primary_color": "#2563eb",
                "font_family": "Noto Sans SC",
                "font_size": 10.5,
                "page_margin": 25,
                "section_spacing": 14,
                "line_height": 1.55,
                "columns": 1,
                "language": "中文",
            },
            "classic": {
                "id": "classic",
                "name": "经典稳重",
                "description": "稳重、黑白灰，适合金融、法务、行政、国企岗位",
                "target_audience": "金融、法务、行政、国企",
                "style": "正式",
                "tags": ["金融", "法务", "行政", "国企", "正式", "一页优先", "ATS"],
                "primary_color": "#1a1a1a",
                "font_family": "Noto Serif SC",
                "font_size": 10.5,
                "page_margin": 28,
                "section_spacing": 16,
                "line_height": 1.6,
                "columns": 1,
                "language": "中文",
            },
            "compact": {
                "id": "compact",
                "name": "紧凑密集",
                "description": "信息密度高，一页优先，适合应届生、内容多的候选人",
                "target_audience": "应届生、实习生、内容多的候选人",
                "style": "极简",
                "tags": ["校招", "实习", "应届生", "极简", "一页优先", "信息密集", "ATS"],
                "primary_color": "#3b82f6",
                "font_family": "Noto Sans SC",
                "font_size": 9.5,
                "page_margin": 20,
                "section_spacing": 8,
                "line_height": 1.45,
                "columns": 2,
                "language": "中文",
            },
        }

    def get_template_list(self) -> List[Dict[str, Any]]:
        return list(self.templates.values())

    def get_template(self, template_id: str) -> Dict[str, Any]:
        return self.templates.get(template_id, {})

    def template_exists(self, template_id: str) -> bool:
        return template_id in self.templates

    def format_date(self, date_str: str) -> str:
        if not date_str:
            return ""
        parts = date_str.split("-")
        if len(parts) >= 2:
            return f"{parts[0]}.{parts[1].zfill(2)}"
        return date_str

    def format_date_range(self, start_date: str, end_date: str) -> str:
        start = self.format_date(start_date)
        end = self.format_date(end_date) if end_date else "至今"
        return f"{start} - {end}"

    def render_html(self, resume_data: Dict[str, Any], template_id: str = "modern") -> str:
        if not self.template_exists(template_id):
            template_id = "modern"

        try:
            template = self.env.get_template(f"{template_id}/resume.html")
            return template.render(
                data=resume_data,
                format_date=self.format_date,
                format_date_range=self.format_date_range,
            )
        except Exception as e:
            raise Exception(f"Template rendering failed: {str(e)}")


template_service = TemplateService()