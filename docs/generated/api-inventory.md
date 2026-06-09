# API Inventory

> 快照日期：2026-06-08  
> 来源：`backend/app/main.py` 与 `backend/app/routers/`  
> 当前为人工生成快照；未来应从 OpenAPI 自动生成。

## Runtime Status

| Router | Prefix | Registered in `main.py` |
|---|---|---|
| resumes | `/api/resumes` | Yes |
| ai | `/api/ai` | Yes |
| export | `/api/export` | Yes |
| import | `/api/import` | Yes |
| templates | `/api/templates` | No |
| settings | `/api/settings` | No |

未注册 Router 的代码存在，但运行中的 FastAPI 不提供这些接口。

## System

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | API 欢迎信息 |
| GET | `/health` | 健康检查 |
| GET | `/docs` | Swagger UI |
| GET | `/openapi.json` | OpenAPI Schema |

## Resumes

| Method | Path | Input | Output |
|---|---|---|---|
| GET | `/api/resumes` | - | `ResumeResponse[]` |
| GET | `/api/resumes/{resume_id}` | Path ID | `ResumeResponse` |
| POST | `/api/resumes` | `ResumeCreate` JSON | `ResumeResponse` |
| PUT | `/api/resumes/{resume_id}` | `ResumeUpdate` JSON | `ResumeResponse` |
| DELETE | `/api/resumes/{resume_id}` | Path ID | Message |
| POST | `/api/resumes/{resume_id}/duplicate` | Path ID | `ResumeResponse` |
| PATCH | `/api/resumes/{resume_id}/status` | Path ID + `status` query | Message |

Notes:

- 当前无用户身份和 owner 校验。
- `resume_data` 以任意 `Dict` 接收，没有强制使用 `ResumeData` Schema。
- 时间当前是字符串。

## AI

| Method | Path | Input | Purpose |
|---|---|---|---|
| POST | `/api/ai/rewrite-text` | `AiRewriteRequest` | 单条文本改写 |
| POST | `/api/ai/diagnose` | `resume_data` | 全文诊断 |
| POST | `/api/ai/jd-match` | `resume_data`, `jd_text` | JD 匹配 |
| POST | `/api/ai/optimize-section` | `section`, `content`, `target_position` | 板块优化 |
| POST | `/api/ai/quantify` | `text` | 量化建议 |
| POST | `/api/ai/translate` | `text`, `target_language` | 翻译 |

Notes:

- 除 `rewrite-text` 外，多数参数直接使用 `dict` 或简单参数，契约需要进一步结构化。
- 应统一错误、超时、Provider 元数据和结构化响应。

## Import

| Method | Path | Input | Purpose |
|---|---|---|---|
| POST | `/api/import/file` | Multipart file | 提取文件内容 |
| POST | `/api/import/structure` | `StructureRequest` | 文本结构化 |
| POST | `/api/import/validate` | `ValidateRequest` | 简历数据校验 |
| POST | `/api/import/quick-structure` | Multipart file | 提取并结构化 |
| POST | `/api/import/structure-json` | JSON object | JSON 结构化 |

Notes:

- 需要统一文件大小、MIME、超时、临时文件清理和错误码。
- 导入结果必须经用户确认后保存。

## Export

| Method | Path | Input | Output |
|---|---|---|---|
| POST | `/api/export/pdf` | `resume_id`, `template_id` | PDF FileResponse |
| POST | `/api/export/docx` | `resume_id` | DOCX FileResponse |
| POST | `/api/export/txt` | `resume_id` | TXT FileResponse |
| POST | `/api/export/json` | `resume_id` | JSON FileResponse |
| GET | `/api/export/records/{resume_id}` | Path ID | Export record list |

Notes:

- 当前导出端点主要使用 query 参数。
- 线上下载不应返回内部路径，应使用短期下载 URL。

## Templates

当前未注册。

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/templates` | 模板列表 |
| GET | `/api/templates/{template_id}` | 模板详情 |
| POST | `/api/templates/render` | 渲染 HTML |
| POST | `/api/templates/preview-pdf` | 生成预览 PDF |

## Settings

当前未注册。

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/settings` | 全部设置 |
| GET | `/api/settings/{key}` | 单项设置 |
| POST | `/api/settings` | 新增或更新 |
| DELETE | `/api/settings/{key}` | 删除 |

Security warning:

- 当前 `Setting.value` 是明文文本。
- 服务器版不得用该表明文保存模型密钥。
- settings 接口上线前必须鉴权、限制可操作键并隐藏秘密。

## Target Contract Work

1. 为 API 增加版本策略。
2. 使用 Pydantic Model 代替裸 `dict` 和分散 query 参数。
3. 统一错误结构。
4. 从 OpenAPI 生成前端客户端类型。
5. 加入认证、owner 授权和请求 ID。
6. 在 CI 比较生成文件，阻止契约快照过期。

## Regeneration Target

建立可重复环境后：

```powershell
Set-Location backend
.\.venv\Scripts\python.exe -c "import json; from app.main import app; print(json.dumps(app.openapi(), ensure_ascii=False, indent=2))"
```

后续应由脚本写入 `docs/generated/openapi.json`，再由文档生成器产生本清单。

