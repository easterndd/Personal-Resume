# Incident Response Runbook

> 状态：Active for local incidents，Proposed for production

## Severity

| Level | Example | Response |
|---|---|---|
| SEV-1 | 大量用户数据泄漏、删除、无法登录或全站不可用 | 立即停止变更，隔离影响，负责人决策 |
| SEV-2 | AI、导入或导出大面积失败，无数据泄漏 | 快速降级或回滚 |
| SEV-3 | 单一模板、格式或页面异常 | 正常缺陷流程 |

## First Response

1. 确认影响范围和开始时间。
2. 停止继续部署和高风险操作。
3. 保存日志、commit、配置版本和复现证据。
4. 不在聊天或 Issue 粘贴真实简历和密钥。
5. 选择降级、回滚或前滚修复。
6. 恢复后记录根因和预防项。

## Local App Will Not Start

```powershell
git status --short --branch
node --version
python --version
Get-NetTCPConnection -LocalPort 5173,8000 -ErrorAction SilentlyContinue
```

前端：

```powershell
Set-Location frontend
npm.cmd ci
npm.cmd run build
```

后端：

```powershell
Set-Location backend
.\.venv\Scripts\python.exe -m pip check
.\.venv\Scripts\python.exe -c "from app.main import app; print(app.title)"
```

不要通过复制其他机器虚拟环境修复。

## AI Provider Failure

检查：

- Provider 和 model 配置。
- API Key 是否存在但不要输出其值。
- Base URL。
- 超时、429、401、403 和 5xx。
- 请求体是否符合该 Provider 协议。

处置：

- 保留用户编辑内容。
- 暂停 AI 功能或提示稍后重试。
- 不自动切换到高成本模型。
- 不在日志记录完整 prompt。

## Import Failure

记录：

- 脱敏文件类型和大小。
- 解析阶段。
- 异常类别。

处置：

- 不覆盖当前简历。
- 删除失败临时文件。
- 向用户提供手动粘贴或 JSON 路径。
- 将脱敏最小样例加入回归 fixtures。

## Export Failure

检查：

- 输出目录权限和磁盘空间。
- 字体。
- Playwright Chromium。
- 模板是否存在。
- ResumeData 是否满足 Schema。

失败导出不得记录为成功。修复后用同一脱敏样例回归四种格式。

## Suspected Secret Leak

1. 立即吊销并轮换密钥。
2. 停止相关自动化和部署。
3. 检查 Git 历史、日志、Actions、Issue 和聊天。
4. 评估是否需要历史清理。
5. 通知受影响供应商或用户。
6. 增加 push protection 和回归检查。

只删除当前文件不能从 Git 历史中移除 Secret。

## Data Loss or Corruption

1. 停止写入。
2. 复制当前数据库和文件目录作为证据。
3. 确定最后一个已知正确版本。
4. 在副本上验证恢复，不直接覆盖原数据。
5. 恢复后校验记录数量、归属和关键字段。

## Postmortem

必须包含：

- 时间线。
- 用户影响。
- 根因与触发条件。
- 为什么监控或测试未发现。
- 临时处置。
- 永久修复。
- 负责人和截止日期。
- 需要更新的测试、ADR、Runbook 和产品规则。

