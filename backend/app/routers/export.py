import json
import os
from datetime import datetime
from typing import List, Dict

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Resume, ExportRecord
from ..services.export_service import export_service

router = APIRouter(prefix="/api/export", tags=["export"])


def save_export_record(db: Session, resume_id: str, file_format: str, file_path: str):
    record = ExportRecord(
        resume_id=resume_id,
        format=file_format,
        file_path=file_path,
        created_at=datetime.now().isoformat(),
    )
    db.add(record)
    db.commit()
    db.refresh(record)


@router.post("/pdf")
async def export_pdf(resume_id: str, template_id: str = "modern", db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume_data = json.loads(resume.resume_data)
    try:
        filepath = await export_service.export_pdf(resume_data, resume_id, template_id)
        save_export_record(db, resume_id, "pdf", filepath)
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
        save_export_record(db, resume_id, "docx", filepath)
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
        save_export_record(db, resume_id, "txt", filepath)
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
        save_export_record(db, resume_id, "json", filepath)
        return FileResponse(filepath, media_type="application/json", filename=os.path.basename(filepath))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/records/{resume_id}", response_model=List[Dict[str, str]])
def get_export_records(resume_id: str, db: Session = Depends(get_db)):
    records = db.query(ExportRecord).filter(ExportRecord.resume_id == resume_id).order_by(ExportRecord.created_at.desc()).all()
    return [
        {
            "id": str(r.id),
            "resume_id": r.resume_id,
            "format": r.format,
            "file_path": r.file_path,
            "created_at": r.created_at,
        }
        for r in records
    ]