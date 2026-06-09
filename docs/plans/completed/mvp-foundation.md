# MVP Foundation Snapshot

> 状态：Completed snapshot  
> 快照日期：2026-06-08  
> “存在”不等于“已通过生产验证”。

## Implemented in Repository

- React/Vite/TypeScript 前端工程。
- FastAPI/SQLAlchemy 后端工程。
- SQLite 数据库模型和启动建表。
- 简历 CRUD、复制和状态接口。
- 结构化编辑器页面和实时预览组件。
- Zustand 状态管理。
- AI 改写、诊断、JD 匹配、板块优化、量化和翻译接口。
- PDF、DOCX、TXT、JSON 导出服务和路由。
- PDF、DOCX、TXT、JSON 导入/结构化路由。
- modern、classic、compact 模板文件与元数据代码。
- 设置 Router 和数据库模型。
- 多个 AI Provider 配置入口。
- 本地 `.env.example`。
- CodeGraph 项目索引。

## Partially Implemented

- templates/settings Router 已有代码，但未在 `backend/app/main.py` 注册。
- 模板页面存在，前端 store 仍使用 mock 模板。
- 导出记录后端存在，前端页面仍使用 mock。
- 岗位推荐页面存在，岗位数据为 mock。
- 前端有后端 AI API，也保留浏览器直连模型实现。
- README 描述 Playwright，但当前 requirements 快照未声明该依赖。
- `config.py` 使用 `pydantic_settings`，requirements 快照未声明。

## Not Yet Proven

- 全新机器冷安装成功。
- 自动化测试。
- PDF 中文字体与分页稳定性。
- DOCX 格式保真。
- 恶意或超大文件处理。
- AI 响应结构稳定和事实约束。
- 多用户鉴权和数据隔离。
- PostgreSQL、对象存储和服务器部署。
- 微信小程序复用。

## Evidence

- 前端命令定义于 `frontend/package.json`。
- 后端路由和服务位于 `backend/app/`。
- 当前 API 清单见 `docs/generated/api-inventory.md`。
- 当前模型见 `docs/generated/data-model.md`。
- 未来任务见 `docs/plans/current-roadmap.md`。

