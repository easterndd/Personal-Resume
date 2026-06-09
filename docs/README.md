# Documentation Index

`docs/` 是当前项目工程事实来源。`MD/` 保留完整指南、早期方案与竞品分析，适合追溯背景，但实现任务应优先以本目录和代码为准。

## Product

- [产品需求](product/product-requirements.md)：用户、范围、流程和验收。
- [业务规则](product/business-rules.md)：AI、模板、导入导出、隐私规则。

## Architecture

- [根架构文档](../ARCHITECTURE.md)：系统入口、边界和依赖方向。
- [详细系统设计](architecture/system-design.md)：模块职责、接口和演进。
- [ADR-0001](architecture/adr/0001-modular-monolith-api-first.md)：模块化单体与 API 优先。
- [ADR-0002](architecture/adr/0002-canonical-resume-json.md)：规范 ResumeData JSON。
- [ADR-0003](architecture/adr/0003-ai-provider-boundary.md)：模型供应商隔离与密钥边界。

## Plans

- [当前执行路线](plans/current-roadmap.md)：按优先级修复和交付。
- [MVP 基础现状](plans/completed/mvp-foundation.md)：已存在能力和证据。

计划状态约定：

- `Proposed`: 尚未确认。
- `Active`: 正在执行。
- `Blocked`: 被外部条件阻塞。
- `Completed`: 已完成且有验证证据。
- `Superseded`: 已被新方案替代。

## Runbooks

- [本地开发](runbooks/local-development.md)
- [部署](runbooks/deployment.md)
- [故障响应](runbooks/incident-response.md)

Runbook 中命令应可复制执行。行为变化后，代码与 Runbook 必须在同一个 PR 更新。

## Generated Snapshots

- [API 清单](generated/api-inventory.md)
- [数据模型](generated/data-model.md)

当前文件是基于 2026-06-08 代码生成的人工快照。建立 OpenAPI/Schema 生成流程后，应由 CI 自动刷新，并在文件头写入生成命令和 commit SHA。

## Update Rules

- 产品行为变化：更新 `product/`。
- 模块边界、依赖或技术决策变化：更新 `ARCHITECTURE.md`、`architecture/` 或新增 ADR。
- 任务拆分和优先级变化：更新 `plans/`。
- 启动、部署、回滚和故障步骤变化：更新 `runbooks/`。
- 路由、Schema 或数据库模型变化：刷新 `generated/`。
- 历史文档不直接删除，过时后标记 `Superseded` 并链接替代文档。

