from typing import List, Dict

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Setting

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("", response_model=List[Dict[str, str]])
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(Setting).all()
    return [{"key": s.key, "value": s.value} for s in settings]


@router.get("/{key}", response_model=Dict[str, str])
def get_setting(key: str, db: Session = Depends(get_db)):
    setting = db.query(Setting).filter(Setting.key == key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return {"key": setting.key, "value": setting.value}


@router.post("")
def create_or_update_setting(key: str, value: str, db: Session = Depends(get_db)):
    setting = db.query(Setting).filter(Setting.key == key).first()
    if setting:
        setting.value = value
    else:
        setting = Setting(key=key, value=value)
        db.add(setting)
    db.commit()
    db.refresh(setting)
    return {"key": setting.key, "value": setting.value}


@router.delete("/{key}")
def delete_setting(key: str, db: Session = Depends(get_db)):
    setting = db.query(Setting).filter(Setting.key == key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    db.delete(setting)
    db.commit()
    return {"message": "Setting deleted successfully"}