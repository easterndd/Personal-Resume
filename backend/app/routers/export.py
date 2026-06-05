import json
import os

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Resume
from ..services.export_service import export_service

router = APIRouter(prefix="/api/export", tags=["export"])


@router.post("/pdf")
async def export_pdf(resume_id: str, template_id: str = "modern", db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume_data = json.loads(resume.resume_data)
    try:
        filepath = await export_service.export_pdf(resume_data, resume_id, template_id)
        return FileResponse(filepath, media_type="application/pdf", filename=os.path.basename(filepath))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/docx")
def export_docx(resume_id: str, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume_data = json.loads(resume.resume_data)
    try:
        filepath = export_service.export_docx(resume_data, resume_id)
        return FileResponse(filepath, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", filename=os.path.basename(filepath))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/txt")
def export_txt(resume_id: str, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume_data = json.loads(resume.resume_data)
    try:
        filepath = export_service.export_txt(resume_data, resume_id)
        return FileResponse(filepath, media_type="text/plain", filename=os.path.basename(filepath))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/json")
def export_json(resume_id: str, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume_data = json.loads(resume.resume_data)
    try:
        filepath = export_service.export_json(resume_data, resume_id)
        return FileResponse(filepath, media_type="application/json", filename=os.path.basename(filepath))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))