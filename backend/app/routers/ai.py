from fastapi import APIRouter, HTTPException

from ..services.ai_service import ai_service
from ..schemas import AiRewriteRequest

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/rewrite-text")
async def rewrite_text(request: AiRewriteRequest):
    try:
        result = await ai_service.rewrite_bullet(request.text, request.target_position)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/diagnose")
async def diagnose_resume(resume_data: dict):
    try:
        result = await ai_service.diagnose_resume(resume_data)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/jd-match")
async def jd_match(resume_data: dict, jd_text: str):
    try:
        result = await ai_service.jd_match(resume_data, jd_text)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/optimize-section")
async def optimize_section(section: str, content: str, target_position: str = ""):
    try:
        result = await ai_service.optimize_section(section, content, target_position)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))