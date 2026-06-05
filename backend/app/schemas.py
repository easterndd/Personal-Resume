from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class ResumeBasics(BaseModel):
    name: str = ""
    headline: str = ""
    phone: str = ""
    email: str = ""
    location: str = ""
    website: str = ""
    linkedin: str = ""
    github: str = ""


class ResumeTarget(BaseModel):
    position: str = ""
    industry: str = ""
    company_type: str = ""
    jd_text: str = ""
    keywords: List[str] = []


class ResumeWork(BaseModel):
    id: str
    company: str = ""
    position: str = ""
    location: str = ""
    start_date: str = ""
    end_date: str = ""
    description: str = ""
    highlights: List[str] = []


class ResumeProject(BaseModel):
    id: str
    name: str = ""
    role: str = ""
    start_date: str = ""
    end_date: str = ""
    description: str = ""
    highlights: List[str] = []
    technologies: List[str] = []


class ResumeEducation(BaseModel):
    id: str
    school: str = ""
    degree: str = ""
    major: str = ""
    start_date: str = ""
    end_date: str = ""
    gpa: str = ""
    highlights: List[str] = []


class ResumeSkill(BaseModel):
    category: str = ""
    items: List[str] = []


class ResumeData(BaseModel):
    basics: ResumeBasics = ResumeBasics()
    target: ResumeTarget = ResumeTarget()
    summary: str = ""
    work: List[ResumeWork] = []
    projects: List[ResumeProject] = []
    education: List[ResumeEducation] = []
    skills: List[ResumeSkill] = []
    certificates: List[Dict[str, Any]] = []
    languages: List[Dict[str, Any]] = []
    awards: List[Dict[str, Any]] = []
    custom_sections: List[Dict[str, Any]] = []


class ResumeCreate(BaseModel):
    title: str
    resume_data: Dict[str, Any]
    target_position: Optional[str] = ""
    target_industry: Optional[str] = ""


class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    resume_data: Optional[Dict[str, Any]] = None
    target_position: Optional[str] = None
    target_industry: Optional[str] = None
    template_id: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class ResumeResponse(BaseModel):
    id: str
    title: str
    target_position: str
    target_industry: str
    status: str
    template_id: str
    resume_data: Dict[str, Any]
    notes: Optional[str]
    created_at: str
    updated_at: str


class AiRewriteRequest(BaseModel):
    text: str
    target_position: Optional[str] = ""


class AiRewriteResponse(BaseModel):
    versions: List[Dict[str, str]] = []


class ExportRequest(BaseModel):
    resume_id: str
    format: str = "pdf"
    template_id: Optional[str] = None