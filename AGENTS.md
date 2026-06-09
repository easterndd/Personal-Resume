# Repository Guide

## Purpose

AI 简历工坊是一个本地优先、后续可部署到服务器并复用到微信小程序的 AI 简历生成平台。核心闭环是：创建或导入简历、结构化编辑、AI 优化、模板预览、多格式导出。

## Start Here

1. 阅读本文件，确认命令和禁止事项。
2. 阅读 [ARCHITECTURE.md](ARCHITECTURE.md) 了解边界和依赖方向。
3. 阅读 [docs/README.md](docs/README.md) 找到产品、架构、计划和运维文档。
4. 开始修改前运行 `git status --short --branch`，保留已有未提交修改。

## Repository Map

- `frontend/`: React 19、TypeScript、Vite Web 客户端。
- `backend/`: FastAPI、SQLAlchemy、SQLite API 服务。
- `backend/app/routers/`: HTTP 接口层。
- `backend/app/services/`: AI、导入、导出、模板业务服务。
- `backend/app/templates/`: Jinja2 简历模板。
- `MD/`: 历史规划、调研与完整指南，作为背景资料。
- `docs/`: 当前工程事实来源。
- `resource/`: UI 参考图。
- `tool/competitors/`: 竞品源码和素材，只供研究，不属于产品运行代码。
- `tool/`: 本地辅助脚本。

## Commands

PowerShell 因执行策略无法运行 `npm.ps1` 时，使用 `npm.cmd`。

### Frontend

```powershell
Set-Location frontend
npm.cmd install
npm.cmd run dev
npm.cmd run lint
npm.cmd run build
```

前端默认地址：`http://localhost:5173`。

### Backend

```powershell
Set-Location backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

后端默认地址：`http://localhost:8000`，OpenAPI：`http://localhost:8000/docs`。

注意：当前 `requirements.txt` 尚未完整声明代码实际依赖。修复前若启动失败，先查看 [本地开发 Runbook](docs/runbooks/local-development.md)，不要静默修改全局 Python 环境。

### CodeGraph

```powershell
codegraph.cmd status
codegraph.cmd init -i
```

理解调用链、影响范围和模块关系时优先使用 CodeGraph；不要把 `.codegraph/` 数据库提交到 Git。

### Verification

当前可执行门禁：

```powershell
Set-Location frontend
npm.cmd run lint
npm.cmd run build
```

后端尚未建立 pytest、类型检查和格式化命令。涉及后端时至少执行：

```powershell
Set-Location backend
.\.venv\Scripts\python.exe -m compileall app
.\.venv\Scripts\python.exe -c "from app.main import app; print(app.title)"
```

测试体系补齐计划见 [当前执行计划](docs/plans/current-roadmap.md)。

## Architecture Rules

- 页面负责组合，业务状态进入 store 或领域模块，不在页面复制 API 逻辑。
- 前端通过 `frontend/src/api/` 访问后端；新功能不得继续直接从浏览器调用模型供应商。
- Router 只负责 HTTP、校验和错误映射；业务逻辑进入 service。
- Service 不依赖 React、FastAPI Request 或具体页面。
- 数据库访问通过 SQLAlchemy Session；不得在组件或 Router 中拼接 SQL。
- `ResumeData` 是 Web、后端、导入导出和未来小程序共享的规范数据结构。
- 外部 AI、文件存储和模板渲染必须通过可替换边界接入。
- 公共 API 或 Resume Schema 变化先更新架构文档和契约快照。
- 详细说明见 [ARCHITECTURE.md](ARCHITECTURE.md)。

## Working Rules

- 你不是仓库中唯一的开发者或 Agent，不覆盖、回退或格式化他人的修改。
- 只修改任务范围内的文件；发现无关问题记录到计划，不顺手重构。
- 不编辑或提交 `backend/.venv/`、`node_modules/`、`dist/`、数据库、导出文件、上传文件、日志和缓存。
- 不提交 `.env`、API Key、Token、真实简历和客户个人信息。
- 不使用 `git reset --hard`、`git checkout -- .`、`git clean -fd` 或 `git push --force`。
- 不把 `tool/competitors/` 的代码复制进产品，除非完成许可证和来源审查。
- 不通过降低断言、跳过测试或删除测试让检查通过。
- 新增依赖前说明用途、许可证、体积和替代方案。
- 数据库结构变化必须引入迁移方案，不继续依赖 `create_all` 作为上线迁移。

## High-Risk Areas

- `frontend/src/store/resumeStore.ts`: 状态、真实 API、mock 数据和本地持久化混合，修改前确认影响页面。
- `frontend/src/services/aiService.ts`: 当前会从浏览器直接携带 API Key 调用外部模型，只适合本地试验。
- `backend/app/services/export_service.py`: 文件生成、字体和 PDF/DOCX 行为，需用真实样例验证。
- `backend/app/services/import_service.py`: 处理不可信文件，必须限制类型、大小和解析失败行为。
- `backend/app/models.py` 与 `schemas.py`: 影响数据库、API 和多端兼容。
- `backend/app/main.py`: 当前 Router 注册、CORS 和启动建表入口。

## Definition of Done

- 满足任务验收标准，没有扩大范围。
- 前端 lint 和 build 通过；后端至少完成导入与语法检查。
- 新行为有自动测试；若测试基础设施尚缺失，明确记录手工验证和剩余风险。
- UI 变化在桌面和移动视口验证，无控制台错误。
- API、Schema、配置、依赖或部署变化已更新对应文档。
- `git diff --check` 通过，完整审查 `git diff`。
- 未提交密钥、个人信息、生成物或竞品代码。

## Documentation Index

- 总架构：[ARCHITECTURE.md](ARCHITECTURE.md)
- 文档导航：[docs/README.md](docs/README.md)
- 产品需求：[docs/product/product-requirements.md](docs/product/product-requirements.md)
- 业务规则：[docs/product/business-rules.md](docs/product/business-rules.md)
- 系统设计：[docs/architecture/system-design.md](docs/architecture/system-design.md)
- 架构决策：[docs/architecture/adr/](docs/architecture/adr/)
- 当前计划：[docs/plans/current-roadmap.md](docs/plans/current-roadmap.md)
- 本地开发：[docs/runbooks/local-development.md](docs/runbooks/local-development.md)
- 部署与回滚：[docs/runbooks/deployment.md](docs/runbooks/deployment.md)
- 故障处理：[docs/runbooks/incident-response.md](docs/runbooks/incident-response.md)
- API 快照：[docs/generated/api-inventory.md](docs/generated/api-inventory.md)
- 数据模型快照：[docs/generated/data-model.md](docs/generated/data-model.md)
