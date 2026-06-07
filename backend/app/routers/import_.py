"""
导入相关API路由
"""
import json
from typing import Dict, Any
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

from ..services.import_service import import_service

router = APIRouter(prefix="/api/import", tags=["import"])


class StructureRequest(BaseModel):
    """结构化请求"""
    raw_text: str
    target_position: str = ""


class ValidateRequest(BaseModel):
    """验证请求"""
    resume_data: Dict[str, Any]


@router.post("/file")
async def import_file(file: UploadFile = File(...)):
    """
    上传并解析简历文件
    - 提取文件原始文本
    - 返回文本内容供用户编辑确认
    """
    try:
        # 读取文件内容
        content = await file.read()

        # 检查文件大小 (10MB限制)
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="文件大小超过10MB限制")

        # 提取文本
        raw_text, file_type = await import_service.extract_text(file.filename, content)

        if not raw_text or len(raw_text.strip()) < 10:
            raise HTTPException(
                status_code=400,
                detail="无法从文件中提取足够文本，请确保文件包含可识别文字"
            )

        return {
            "success": True,
            "file_type": file_type,
            "raw_text": raw_text,
            "filename": file.filename
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/structure")
async def structure_resume(request: StructureRequest):
    """
    AI结构化简历文本
    - 将原始文本转为结构化JSON
    - 使用DeepSeek API
    """
    try:
        if not request.raw_text or len(request.raw_text.strip()) < 10:
            raise HTTPException(
                status_code=400,
                detail="原始文本内容不足，无法解析"
            )

        # 调用AI结构化
        structured_data = await import_service.structure_with_ai(
            request.raw_text,
            request.target_position
        )

        # 验证数据
        validation = import_service.validate_resume_data(structured_data)

        return {
            "success": True,
            "resume_data": structured_data,
            "validation": validation
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/validate")
async def validate_resume(request: ValidateRequest):
    """
    验证简历数据完整性
    - 检查必填字段
    - 生成完善建议
    """
    try:
        validation = import_service.validate_resume_data(request.resume_data)
        return {
            "success": True,
            "validation": validation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/quick-structure")
async def quick_structure(file: UploadFile = File(...)):
    """
    快捷导入：上传文件后直接AI结构化
    - 适合简单场景，一步完成
    """
    try:
        content = await file.read()

        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="文件大小超过10MB限制")

        # 提取文本
        raw_text, file_type = await import_service.extract_text(file.filename, content)

        if not raw_text or len(raw_text.strip()) < 10:
            raise HTTPException(
                status_code=400,
                detail="无法从文件中提取足够文本"
            )

        # AI结构化
        structured_data = await import_service.structure_with_ai(raw_text)
        validation = import_service.validate_resume_data(structured_data)

        return {
            "success": True,
            "file_type": file_type,
            "raw_text": raw_text,
            "resume_data": structured_data,
            "validation": validation
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/structure-json")
async def structure_json(resume_data: Dict[str, Any]):
    """
    直接导入JSON格式简历数据
    - 验证JSON格式
    - 返回验证结果
    """
    try:
        # 基本验证
        if not isinstance(resume_data, dict):
            raise HTTPException(status_code=400, detail="简历数据必须是JSON对象")

        if "basics" not in resume_data:
            raise HTTPException(status_code=400, detail="缺少必需字段: basics")

        # 深度验证
        validation = import_service.validate_resume_data(resume_data)

        return {
            "success": True,
            "validation": validation
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
