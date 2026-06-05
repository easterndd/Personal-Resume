import json
import uuid
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Resume
from ..schemas import ResumeCreate, ResumeUpdate, ResumeResponse

router = APIRouter(prefix="/api/resumes", tags=["resumes"])


@router.get("", response_model=List[ResumeResponse])
def get_resumes(db: Session = Depends(get_db)):
    resumes = db.query(Resume).order_by(Resume.updated_at.desc()).all()
    return [
        ResumeResponse(
            id=r.id,
            title=r.title,
            target_position=r.target_position,
            target_industry=r.target_industry,
            status=r.status,
            template_id=r.template_id,
            resume_data=json.loads(r.resume_data),
            notes=r.notes,
            created_at=r.created_at,
            updated_at=r.updated_at,
        )
        for r in resumes
    ]


@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(resume_id: str, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return ResumeResponse(
        id=resume.id,
        title=resume.title,
        target_position=resume.target_position,
        target_industry=resume.target_industry,
        status=resume.status,
        template_id=resume.template_id,
        resume_data=json.loads(resume.resume_data),
        notes=resume.notes,
        created_at=resume.created_at,
        updated_at=resume.updated_at,
    )


@router.post("", response_model=ResumeResponse)
def create_resume(resume: ResumeCreate, db: Session = Depends(get_db)):
    now = datetime.now().isoformat()
    db_resume = Resume(
        id=str(uuid.uuid4()),
        title=resume.title,
        resume_data=json.dumps(resume.resume_data, ensure_ascii=False),
        target_position=resume.target_position,
        target_industry=resume.target_industry,
        status="draft",
        template_id="modern",
        created_at=now,
        updated_at=now,
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    return ResumeResponse(
        id=db_resume.id,
        title=db_resume.title,
        target_position=db_resume.target_position,
        target_industry=db_resume.target_industry,
        status=db_resume.status,
        template_id=db_resume.template_id,
        resume_data=json.loads(db_resume.resume_data),
        notes=db_resume.notes,
        created_at=db_resume.created_at,
        updated_at=db_resume.updated_at,
    )


@router.put("/{resume_id}", response_model=ResumeResponse)
def update_resume(resume_id: str, resume: ResumeUpdate, db: Session = Depends(get_db)):
    db_resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not db_resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    now = datetime.now().isoformat()
    if resume.title is not None:
        db_resume.title = resume.title
    if resume.resume_data is not None:
        db_resume.resume_data = json.dumps(resume.resume_data, ensure_ascii=False)
    if resume.target_position is not None:
        db_resume.target_position = resume.target_position
    if resume.target_industry is not None:
        db_resume.target_industry = resume.target_industry
    if resume.template_id is not None:
        db_resume.template_id = resume.template_id
    if resume.status is not None:
        db_resume.status = resume.status
    if resume.notes is not None:
        db_resume.notes = resume.notes
    db_resume.updated_at = now

    db.commit()
    db.refresh(db_resume)
    return ResumeResponse(
        id=db_resume.id,
        title=db_resume.title,
        target_position=db_resume.target_position,
        target_industry=db_resume.target_industry,
        status=db_resume.status,
        template_id=db_resume.template_id,
        resume_data=json.loads(db_resume.resume_data),
        notes=db_resume.notes,
        created_at=db_resume.created_at,
        updated_at=db_resume.updated_at,
    )


@router.delete("/{resume_id}")
def delete_resume(resume_id: str, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted successfully"}


@router.post("/{resume_id}/duplicate", response_model=ResumeResponse)
def duplicate_resume(resume_id: str, db: Session = Depends(get_db)):
    original = db.query(Resume).filter(Resume.id == resume_id).first()
    if not original:
        raise HTTPException(status_code=404, detail="Resume not found")

    now = datetime.now().isoformat()
    db_resume = Resume(
        id=str(uuid.uuid4()),
        title=f"{original.title} (副本)",
        resume_data=original.resume_data,
        target_position=original.target_position,
        target_industry=original.target_industry,
        status="draft",
        template_id=original.template_id,
        created_at=now,
        updated_at=now,
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    return ResumeResponse(
        id=db_resume.id,
        title=db_resume.title,
        target_position=db_resume.target_position,
        target_industry=db_resume.target_industry,
        status=db_resume.status,
        template_id=db_resume.template_id,
        resume_data=json.loads(db_resume.resume_data),
        notes=db_resume.notes,
        created_at=db_resume.created_at,
        updated_at=db_resume.updated_at,
    )


@router.patch("/{resume_id}/status")
def update_resume_status(resume_id: str, status: str, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    resume.status = status
    resume.updated_at = datetime.now().isoformat()
    db.commit()
    return {"message": "Status updated successfully", "status": status}