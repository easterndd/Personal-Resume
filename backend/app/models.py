from datetime import datetime
from sqlalchemy import Column, Integer, String, Text

from .database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    owner_name = Column(String)
    owner_email = Column(String)
    target_position = Column(String)
    target_industry = Column(String)
    status = Column(String, default="draft")
    template_id = Column(String, default="modern")
    resume_data = Column(Text, default="{}")
    notes = Column(Text)
    created_at = Column(String)
    updated_at = Column(String)


class AiLog(Base):
    __tablename__ = "ai_logs"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(String)
    provider = Column(String)
    model = Column(String)
    action = Column(String)
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    cost_estimate = Column(String, default="0")
    created_at = Column(String)


class ExportRecord(Base):
    __tablename__ = "export_records"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(String)
    format = Column(String)
    file_path = Column(String)
    created_at = Column(String)


class Setting(Base):
    __tablename__ = "settings"

    key = Column(String, primary_key=True, index=True)
    value = Column(Text)