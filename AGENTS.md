# Repository Guide

## Purpose

AI简历工坊是一个帮助用户创建、修改、优化简历的平台，支持多种格式导入导出，提供AI优化建议、岗位推荐等功能。

## Map

- `frontend/`: React + TypeScript + Vite 前端应用
- `backend/`: FastAPI + SQLAlchemy 后端服务
- `MD/`: 项目需求、规划和设计文档
- `tool/`: 辅助工具脚本
- `resource/`: 项目资源文件
- `.codegraph/`: 代码分析工具配置

## Commands

### 前端
- Install: `cd frontend && npm install`
- Dev: `cd frontend && npm run dev`
- Build: `cd frontend && npm run build`
- Lint: `cd frontend && npm run lint`

### 后端
- Install: `cd backend && python -m venv .venv && .venv\Scripts\activate && pip install -r requirements.txt`
- Dev: `cd backend && .venv\Scripts\activate && uvicorn app.main:app --reload --port 8000`
- Install Playwright: `cd backend && .venv\Scripts\activate && playwright install chromium`

### Git操作
- 同步远程: `python tool/push_to_github.py --pull`
- 推送本地: `python tool/push_to_github.py`
- 强制同步: `python tool/push_to_github.py --hard-reset`

## Architecture

### 技术栈
- 前端: React 18 + TypeScript + Vite + Tailwind CSS
- 后端: FastAPI + SQLAlchemy + Pydantic
- 数据库: SQLite (本地) / PostgreSQL (上线)
- AI服务: OpenAI兼容接口 (DeepSeek等)
- PDF导出: Playwright
- 文档处理: PyMuPDF (PDF) + python-docx (Word)

### 模块职责
- `frontend/src/api/`: API客户端封装（resumes, ai, export, import）
- `frontend/src/components/`: React组件
- `frontend/src/pages/`: 页面组件
- `frontend/src/store/`: Zustand状态管理
- `frontend/src/types/`: TypeScript类型定义
- `backend/app/`: 后端应用
- `backend/app/routers/`: API路由（resumes, ai, export, import_）
- `backend/app/services/`: 业务逻辑（ai_service, export_service, import_service）
- `backend/app/templates/`: 简历模板（modern/）

### 架构规则
- 前端和后端通过REST API通信
- 所有AI调用通过后端代理，不暴露API Key给前端
- 简历数据使用结构化JSON格式
- 模板使用HTML+CSS，由Playwright渲染为PDF
- 数据库操作通过SQLAlchemy ORM

## Working Rules

1. 开始前检查 `git status`
2. 不覆盖现有未提交修改
3. 一个提交只表达一个完整意图
4. 不提交密钥、日志和构建产物
5. 新功能先在本地验证再推送
6. 重要决策记录在 `docs/` 中

## Verification

- 代码修改: 运行前端/后端的lint和类型检查
- API修改: 验证API文档 (`http://localhost:8000/docs`)
- UI修改: 在浏览器中验证功能并提供截图
- 数据库修改: 验证数据库模型和迁移

## Docs

- 产品需求: `MD/本地AI简历工坊开发落地方案.md`
- 竞品分析: `MD/竞品分析与差异化升级方案.md`
- 项目规划: `MD/简历副业全案计划书.md`
- 实现方案: `MD/项目开发实现方案.md`
