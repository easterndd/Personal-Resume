import json
import os
from datetime import datetime
from typing import Dict, Any

from jinja2 import Environment, FileSystemLoader
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

from ..config import settings


class ExportService:
    def __init__(self):
        self.output_dir = settings.output_dir
        self.template_dir = os.path.join(os.path.dirname(__file__), "../templates")
        self.env = Environment(loader=FileSystemLoader(self.template_dir))
        os.makedirs(self.output_dir, exist_ok=True)

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
        template = self.env.get_template(f"{template_id}/resume.html")
        return template.render(
            data=resume_data,
            format_date=self.format_date,
            format_date_range=self.format_date_range,
        )

    async def export_pdf(self, resume_data: Dict[str, Any], resume_id: str, template_id: str = "modern") -> str:
        try:
            from playwright.async_api import async_playwright

            html_content = self.render_html(resume_data, template_id)
            filename = f"{resume_data.get('basics', {}).get('name', 'resume')}_{resume_id}_{datetime.now().strftime('%Y%m%d')}.pdf"
            filepath = os.path.join(self.output_dir, filename)

            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                await page.set_content(html_content, wait_until="networkidle")
                await page.pdf(
                    path=filepath,
                    format="A4",
                    margin={"top": "1.5cm", "bottom": "1.5cm", "left": "1.5cm", "right": "1.5cm"},
                    print_background=True,
                )
                await browser.close()

            return filepath
        except Exception as e:
            raise Exception(f"PDF export failed: {str(e)}")

    def export_docx(self, resume_data: Dict[str, Any], resume_id: str) -> str:
        doc = Document()

        section = doc.sections[0]
        section.page_width = Cm(21)
        section.page_height = Cm(29.7)
        section.top_margin = Cm(1.5)
        section.bottom_margin = Cm(1.5)
        section.left_margin = Cm(1.5)
        section.right_margin = Cm(1.5)

        basics = resume_data.get("basics", {})
        title = doc.add_heading(basics.get("name", "简历"), 0)
        title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        title.runs[0].font.size = Pt(20)
        title.runs[0].font.bold = True
        title.runs[0].font.color.rgb = RGBColor(37, 99, 235)

        if basics.get("headline"):
            headline = doc.add_paragraph(basics.get("headline"))
            headline.alignment = WD_ALIGN_PARAGRAPH.CENTER
            headline.runs[0].font.size = Pt(12)

        contact_info = []
        if basics.get("phone"):
            contact_info.append(f"电话：{basics['phone']}")
        if basics.get("email"):
            contact_info.append(f"邮箱：{basics['email']}")
        if basics.get("location"):
            contact_info.append(f"地点：{basics['location']}")
        if basics.get("github"):
            contact_info.append(f"GitHub：{basics['github']}")
        if basics.get("website"):
            contact_info.append(f"网站：{basics['website']}")

        if contact_info:
            contact_para = doc.add_paragraph(" | ".join(contact_info))
            contact_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
            contact_para.runs[0].font.size = Pt(10)

        doc.add_paragraph()

        if resume_data.get("summary"):
            doc.add_heading("个人简介", level=1)
            summary_para = doc.add_paragraph(resume_data["summary"])
            summary_para.runs[0].font.size = Pt(10)

        for work in resume_data.get("work", []):
            doc.add_heading("工作经历", level=1)
            company_para = doc.add_paragraph()
            company_run = company_para.add_run(f"{work.get('company', '')}")
            company_run.bold = True
            company_run.font.size = Pt(10)
            if work.get("position"):
                company_para.add_run(f" - {work['position']}")
            if work.get("location"):
                company_para.add_run(f" | {work['location']}")

            date_para = doc.add_paragraph(self.format_date_range(work.get("start_date", ""), work.get("end_date", "")))
            date_para.runs[0].font.size = Pt(9)

            if work.get("description"):
                desc_para = doc.add_paragraph(work["description"])
                desc_para.runs[0].font.size = Pt(10)

            for highlight in work.get("highlights", []):
                highlight_para = doc.add_paragraph(f"• {highlight}", style="List Bullet")
                highlight_para.runs[0].font.size = Pt(10)

        for edu in resume_data.get("education", []):
            doc.add_heading("教育背景", level=1)
            school_para = doc.add_paragraph()
            school_run = school_para.add_run(f"{edu.get('school', '')}")
            school_run.bold = True
            school_run.font.size = Pt(10)
            if edu.get("degree"):
                school_para.add_run(f" - {edu['degree']}")
            if edu.get("major"):
                school_para.add_run(f" | {edu['major']}")

            date_para = doc.add_paragraph(self.format_date_range(edu.get("start_date", ""), edu.get("end_date", "")))
            date_para.runs[0].font.size = Pt(9)

            for highlight in edu.get("highlights", []):
                highlight_para = doc.add_paragraph(f"• {highlight}", style="List Bullet")
                highlight_para.runs[0].font.size = Pt(10)

        for project in resume_data.get("projects", []):
            doc.add_heading("项目经历", level=1)
            name_para = doc.add_paragraph()
            name_run = name_para.add_run(f"{project.get('name', '')}")
            name_run.bold = True
            name_run.font.size = Pt(10)
            if project.get("role"):
                name_para.add_run(f" - {project['role']}")

            date_para = doc.add_paragraph(self.format_date_range(project.get("start_date", ""), project.get("end_date", "")))
            date_para.runs[0].font.size = Pt(9)

            if project.get("description"):
                desc_para = doc.add_paragraph(project["description"])
                desc_para.runs[0].font.size = Pt(10)

            for highlight in project.get("highlights", []):
                highlight_para = doc.add_paragraph(f"• {highlight}", style="List Bullet")
                highlight_para.runs[0].font.size = Pt(10)

            if project.get("technologies"):
                tech_para = doc.add_paragraph()
                tech_run = tech_para.add_run("技术栈：")
                tech_run.bold = True
                tech_run.font.size = Pt(9)
                tech_para.add_run(", ".join(project["technologies"]))
                tech_para.runs[1].font.size = Pt(9)

        if resume_data.get("skills"):
            doc.add_heading("专业技能", level=1)
            for skill_category in resume_data["skills"]:
                skill_para = doc.add_paragraph()
                cat_run = skill_para.add_run(f"{skill_category.get('category', '')}：")
                cat_run.bold = True
                cat_run.font.size = Pt(10)
                skill_para.add_run(", ".join(skill_category.get("items", [])))
                skill_para.runs[1].font.size = Pt(10)

        filename = f"{basics.get('name', 'resume')}_{resume_id}_{datetime.now().strftime('%Y%m%d')}.docx"
        filepath = os.path.join(self.output_dir, filename)
        doc.save(filepath)

        return filepath

    def export_txt(self, resume_data: Dict[str, Any], resume_id: str) -> str:
        lines = []
        basics = resume_data.get("basics", {})

        lines.append(basics.get("name", "简历"))
        if basics.get("headline"):
            lines.append(basics.get("headline"))
        lines.append("")

        contact_info = []
        if basics.get("phone"):
            contact_info.append(f"电话：{basics['phone']}")
        if basics.get("email"):
            contact_info.append(f"邮箱：{basics['email']}")
        if basics.get("location"):
            contact_info.append(f"地点：{basics['location']}")
        lines.append(" | ".join(contact_info))
        lines.append("")

        if resume_data.get("summary"):
            lines.append("【个人简介】")
            lines.append(resume_data["summary"])
            lines.append("")

        for work in resume_data.get("work", []):
            lines.append("【工作经历】")
            lines.append(f"{work.get('company', '')} - {work.get('position', '')}")
            lines.append(self.format_date_range(work.get("start_date", ""), work.get("end_date", "")))
            if work.get("description"):
                lines.append(work["description"])
            for highlight in work.get("highlights", []):
                lines.append(f"• {highlight}")
            lines.append("")

        for edu in resume_data.get("education", []):
            lines.append("【教育背景】")
            lines.append(f"{edu.get('school', '')} - {edu.get('degree', '')} | {edu.get('major', '')}")
            lines.append(self.format_date_range(edu.get("start_date", ""), edu.get("end_date", "")))
            for highlight in edu.get("highlights", []):
                lines.append(f"• {highlight}")
            lines.append("")

        for project in resume_data.get("projects", []):
            lines.append("【项目经历】")
            lines.append(f"{project.get('name', '')} - {project.get('role', '')}")
            lines.append(self.format_date_range(project.get("start_date", ""), project.get("end_date", "")))
            if project.get("description"):
                lines.append(project["description"])
            for highlight in project.get("highlights", []):
                lines.append(f"• {highlight}")
            if project.get("technologies"):
                lines.append(f"技术栈：{', '.join(project['technologies'])}")
            lines.append("")

        if resume_data.get("skills"):
            lines.append("【专业技能】")
            for skill_category in resume_data["skills"]:
                lines.append(f"{skill_category.get('category', '')}：{', '.join(skill_category.get('items', []))}")
            lines.append("")

        content = "\n".join(lines)
        filename = f"{basics.get('name', 'resume')}_{resume_id}_{datetime.now().strftime('%Y%m%d')}.txt"
        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)

        return filepath

    def export_json(self, resume_data: Dict[str, Any], resume_id: str) -> str:
        filename = f"resume_{resume_id}_{datetime.now().strftime('%Y%m%d')}.json"
        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(resume_data, f, ensure_ascii=False, indent=2)
        return filepath


export_service = ExportService()