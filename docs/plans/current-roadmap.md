# Current Engineering Roadmap

> 状态：Active  
> 起始基线：2026-06-08  
> 原则：先让现有模块可靠，再扩展上线功能。

## Outcome

把当前本地 MVP 从“功能代码已出现”推进到“新环境可重复安装、核心流程可验证、结构可安全演进”，随后再进入服务器上线和小程序阶段。

## Phase 0: Repository Hygiene

优先级：P0

- [ ] 确认并完成 `backend/.venv/` 从 Git 历史和索引中移除。
- [ ] 清理已跟踪的 `__pycache__`、`.pyc` 和生成物。
- [ ] 修复 `tool/codegraph` 的删除/子模块历史状态。
- [ ] 审查 `.gitignore`，避免过宽的 `*.json`、`*.txt` 规则阻碍合法 fixtures 和 Schema。
- [ ] 停用 `push_to_github.py` 的 `--force` 与自动全量 `git add .`。
- [ ] 使用功能分支和 PR，不直接向 `main` 自动提交。

验收：

- 全新 clone 不包含虚拟环境和缓存。
- `git status` 不因运行应用产生已跟踪文件修改。
- CodeGraph 可通过标准安装步骤恢复。

## Phase 1: Reproducible Local Runtime

优先级：P0

- [ ] 补全后端依赖：至少核对 `pydantic-settings`、Playwright 等实际 import。
- [ ] 固定并验证 Python 3.10+ 的支持版本。
- [ ] 增加后端启动时配置检查。
- [ ] 在 `main.py` 注册 templates/settings Router，或明确删除未启用能力。
- [ ] 修复 CORS：本地仅允许 `http://localhost:5173` 和 `http://127.0.0.1:5173`。
- [ ] 增加一条跨平台启动说明。
- [ ] 使用新虚拟环境完成冷启动验证。

验收：

```text
clone -> install -> start frontend/backend -> health -> open app
```

全过程不依赖开发者机器已有全局包。

## Phase 2: Contract and State Stabilization

优先级：P0

- [ ] 为 ResumeData 建立 JSON Schema 或由 OpenAPI 生成前端类型。
- [ ] 明确 store 中真实 API 与 mock 数据的边界。
- [ ] 把岗位 mock、模板 mock、导出记录 mock 标记为独立 Adapter。
- [ ] 建立共享 Axios Client 和统一错误结构。
- [ ] 修复 `createNewResume` API 失败后返回伪 ID 的行为。
- [ ] 统一时间、状态和空字段格式。
- [ ] 为 API 增加版本演进方案。

验收：

- 前后端字段漂移能被自动检查发现。
- API 失败不会伪装为成功。
- mock 不会混入线上构建或真实用户数据。

## Phase 3: Test Baseline

优先级：P0

- [ ] 前端加入 Vitest 和 React Testing Library。
- [ ] 后端加入 pytest、httpx 测试客户端。
- [ ] 增加临时 SQLite 测试数据库。
- [ ] 增加 Resume CRUD API 测试。
- [ ] 增加 AI Provider mock 的成功、超时和错误响应测试。
- [ ] 增加 JSON 导入导出往返测试。
- [ ] 增加三套模板渲染 smoke test。
- [ ] 增加 Playwright 核心流程 E2E。
- [ ] 建立 GitHub Actions：lint、build、backend test、frontend test。

最低门禁：

```text
frontend-lint
frontend-build
frontend-test
backend-test
```

## Phase 4: Core Product Reliability

优先级：P1

- [ ] AI 建议显示原文、建议、理由和待确认项。
- [ ] AI 应用支持撤销。
- [ ] 导入限制文件大小、类型和超时。
- [ ] PDF/DOCX/TXT/JSON 导入提供字段确认页。
- [ ] PDF/DOCX 导出加入中文字体和分页回归样例。
- [ ] 导出记录改为真实 API。
- [ ] 模板中心改为真实模板元数据。
- [ ] 增加导出前检查：关键字段、分页、链接和 ATS。
- [ ] 增加本地数据清理入口或明确 Runbook。

## Phase 5: Server Readiness

优先级：P2

- [ ] Alembic 迁移。
- [ ] PostgreSQL。
- [ ] 用户认证与 `owner_id`。
- [ ] 对象级授权测试。
- [ ] 对象存储。
- [ ] Secret Store。
- [ ] CORS、HTTPS、限流和安全 Header。
- [ ] 结构化日志、请求 ID 和错误监控。
- [ ] 备份、恢复、部署和回滚演练。
- [ ] 隐私政策、用户协议和数据删除流程。

## Phase 6: Mini Program

优先级：P3

- [ ] 冻结 `/api/v1` 契约。
- [ ] 确定小程序技术栈。
- [ ] 平台登录换取后端身份。
- [ ] 实现移动端简化编辑、AI 优化、预览和下载。
- [ ] 复杂模板编辑保留在 Web。
- [ ] 多端契约和权限 E2E。

## Definition of Ready

每个任务开始前必须有：

- 问题、目标和非目标。
- 文件或模块范围。
- 可执行验收标准。
- 测试方法。
- 数据、安全和兼容风险。
- 是否改变 API、Schema、数据库、配置或依赖。

## Definition of Done

- 代码、测试和文档同一 PR。
- 自动检查通过。
- UI/API 有验证证据。
- 没有密钥、真实简历和生成物。
- 有风险和回滚说明。
- 共享契约经过维护者审核。

## Blocking Decisions

开始服务器阶段前由项目负责人确认：

1. 登录方式。
2. 数据库和对象存储供应商。
3. 用户自带 Key 与平台 Key 策略。
4. 数据保留周期。
5. 小程序技术栈。

