# ADR-0003: Server-Side AI Provider Boundary

- 状态：Accepted，当前实现尚未完全符合
- 日期：2026-06-08
- 决策者：项目维护者

## Context

本地原型允许用户在设置页输入 API Key，当前前端代码可直接调用模型供应商。该方式便于试验，但上线后会暴露密钥、绕过用量控制、无法统一审计，也不能安全复用到小程序。

## Decision

- 本地试验期暂时允许浏览器保存用户自带 Key，但必须明确提示风险。
- 所有新增 AI 功能优先调用后端 `/api/ai`。
- 服务器版只允许后端持有平台密钥。
- Provider 通过统一服务边界接入，OpenAI 兼容供应商共享协议 Adapter，非兼容供应商独立实现。
- AI 结果必须结构化校验，用户确认后才应用。

## Alternatives

### Browser Calls Providers Directly

本地部署简单，但无法安全上线，因此仅作为临时兼容路径。

### Bind to One Provider

实现简单，但成本、可用性和模型能力受单一厂商约束，因此拒绝。

## Consequences

正面：

- 密钥不暴露给 Web 和小程序。
- 可统一超时、限流、成本、日志和内容规则。
- 可切换供应商和模型。

负面：

- 后端承担模型流量和成本。
- 需要 Provider 兼容测试。
- 用户自带 Key 与平台 Key 需要明确产品策略。

## Security Rules

- 不记录完整 prompt、简历或 API Key。
- 请求只发送完成任务所需字段。
- 网络调用有超时和取消。
- 不自动把失败请求切换到更昂贵模型。
- 用户可知晓数据会发送给哪个供应商。

## Migration

1. 前端 AI 操作统一调用 `frontend/src/api/ai.ts`。
2. 移除业务页面对 `frontend/src/services/aiService.ts` 的直接依赖。
3. 设置页只管理非秘密偏好；密钥进入后端配置或安全存储。
4. 上线环境禁用浏览器直连路径。

