# ADR-0002: Canonical ResumeData JSON

- 状态：Accepted
- 日期：2026-06-08
- 决策者：项目维护者

## Context

同一份简历需要被 Web 编辑器、后端、AI、导入、模板、PDF/DOCX/JSON 导出和未来小程序共同使用。若每个模块使用独立结构，会出现字段丢失和重复转换。

## Decision

- 定义一个规范 `ResumeData` JSON 作为领域数据。
- 所有导入格式先转换为 ResumeData。
- 所有模板和导出格式从 ResumeData 生成。
- AI 接收 ResumeData 的必要子集并返回结构化建议。
- 数据结构必须版本化，并最终以 JSON Schema/OpenAPI 表达。

## Alternatives

### Store Format-Specific Documents

直接存 DOCX/PDF 无法可靠编辑、匹配 JD 和切换模板，因此拒绝。

### Template-Specific JSON

会锁定模板并阻碍多端复用，因此拒绝。

## Consequences

正面：

- 导入、编辑、模板和导出形成统一管线。
- JSON 可备份、迁移和用于小程序。
- AI 输出更容易校验。

负面：

- 需要维护 Schema 兼容和迁移。
- 某些格式特性不能完全往返。
- TypeScript 与 Pydantic 可能漂移，必须自动校验。

## Compatibility Rules

- 新增可选字段属于向后兼容。
- 删除、重命名或改变语义需要 Schema 版本和迁移。
- 未识别字段在迁移时不得静默丢失。
- JSON 导入必须验证版本和结构。

## Verification

- JSON 导出后重新导入，核心字段保持一致。
- 三套模板消费同一份样例。
- 前后端契约测试能发现字段漂移。

