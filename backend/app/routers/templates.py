import json
import os
from datetime import datetime
from typing import List, Dict, Any

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Resume
from ..services.template_service import template_service
from ..services.export_service import export_service

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("", response_model=List[Dict[str, Any]])
def get_templates():
    return template_service.get_template_list()


@router.get("/{template_id}", response_model=Dict[str, Any])
def get_template(template_id: str):
    template = template_service.get_template(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.post("/render")
def render_html(template_id: str, resume_data: Dict[str, Any]):
    try:
        html = template_service.render_html(resume_data, template_id)
        return {"html": html}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/preview-pdf")
async def preview_pdf(resume_data: Dict[str, Any], template_id: str = "modern"):
    try:
        resume_id = f"preview_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        filepath = await export_service.export_pdf(resume_data, resume_id, template_id)
        return FileResponse(filepath, media_type="application/pdf", filename=os.path.basename(filepath))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))