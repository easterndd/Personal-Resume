# GitHub 企业级协作与操作规范方案

> 适用项目：Personal Resume（AI 简历生成平台）  
> 适用阶段：当前个人开发、后续多人协作、服务器部署与持续交付  
> 文档版本：v1.0  
> 制定日期：2026-06-06

---

## 1. 文档目标

本规范用于解决以下问题：

1. 从 GitHub 克隆或拉取后文件不完整。
2. 拉取前后没有提交、文件和子模块差异报告。
3. 自动脚本可能直接覆盖远程、误提交文件或自动执行危险合并。
4. 多人开发时缺少统一的分支、提交、审核、测试和发布流程。
5. API Key、模型配置、简历文件等敏感数据可能被误提交。
6. 第三方项目、Git 子模块、Git LFS 文件不能被可靠恢复。

本项目采用以下总体原则：

- `main` 始终保持可运行、可测试、可发布。
- 所有功能通过短生命周期分支和 Pull Request 合并。
- 拉取前先 `fetch`，先比较，再决定 `rebase` 或处理冲突。
- 自动化脚本必须“失败即停止”，不得擅自改变合并策略。
- 完整性以 Git 对象、提交、子模块和 LFS 状态为准，不以文件数量为准。
- 密钥、用户简历、导出文件和本地配置不得进入 Git 历史。

---

## 2. 当前仓库检查结论

### 2.1 当前同步状态

检查时本地 `main` 与 `origin/main` 的提交差异为：

```text
本地领先远程：0
本地落后远程：0
```

这表示主仓库当前提交点一致，但工作区存在本地修改：

```text
tool/codegraph
tool/push_to_github.py
```

这些本地修改必须保留，后续修复不得使用 `git reset --hard`、`git checkout -- .` 等覆盖命令。

### 2.2 `codegraph` 处于残缺子模块状态

`tool/codegraph` 在主仓库索引中的模式为：

```text
160000 tool/codegraph
```

`160000` 表示该路径不是普通目录，而是指向另一个 Git 仓库某个提交的 Gitlink。但是当前主仓库没有 `.gitmodules` 文件，因此新成员克隆主仓库后：

- Git 能看到 `tool/codegraph` 的提交指针；
- Git 不知道该子模块的远程地址；
- 无法执行标准的 `git submodule update --init --recursive`；
- 该目录会表现为空、缺失或无法初始化。

这是当前“GitHub 拉取项目不完整”的一个确定原因。

### 2.3 当前脚本的主要风险

文件：`tool/push_to_github.py`

| 风险 | 当前行为 | 影响 | 级别 |
|---|---|---|---|
| 克隆参数错误 | `--branch` 被当作目标目录，没有传给 `git clone --branch` | 克隆的分支可能不符合预期 | 高 |
| 未处理子模块 | 只执行普通 `git clone` | 子模块内容缺失 | 高 |
| 未处理 Git LFS | 不检查或拉取 LFS 对象 | 只得到 LFS 指针文件 | 高 |
| 没有完整性校验 | 克隆后不执行 `git fsck`、提交校验、状态校验 | 无法证明克隆完整 | 高 |
| 自动危险回退 | rebase 失败后尝试 `--allow-unrelated-histories` | 可能合并两个无关历史 | 严重 |
| 强制推送 | 使用 `git push --force` | 可能覆盖同事提交 | 严重 |
| 直接推送主分支 | 默认推送 `main` | 绕过 PR、审核和 CI | 严重 |
| 粗放暂存 | 使用 `git add .` | 可能提交密钥、构建产物和临时文件 | 高 |
| stash 不完整 | 使用普通 `git stash`，不含未跟踪文件 | 新文件可能阻塞拉取或丢失上下文 | 中 |
| 拉取前不展示差异 | 只统计远程提交数量 | 无法知道哪些文件将改变 | 高 |
| 推送前不展示最终差异 | 没有 staged diff 和提交范围报告 | 容易误提交 | 高 |
| 错误被弱化 | 部分命令失败后返回默认值或继续运行 | 容易产生错误结论 | 高 |
| 编码异常 | 脚本中文已出现乱码 | 提示与提交信息不可读 | 中 |
| 无超时与结构化日志 | 子进程没有超时，只有控制台文本 | CI 和故障审计困难 | 中 |

结论：当前脚本只适合个人临时操作，不应作为多人协作的统一发布工具。

---

## 3. 推荐协作模型

### 3.1 仓库归属

多人协作前，应将仓库迁移到 GitHub Organization，而不是长期放在个人账号下。

建议团队：

| 团队 | GitHub 权限 | 职责 |
|---|---|---|
| `owners` | Admin | 仓库设置、规则、密钥和紧急处置 |
| `maintainers` | Maintain | 发布、PR 管理、项目维护 |
| `developers` | Write | 创建分支、推送分支、提交 PR |
| `qa` | Triage/Write | Issue、验收、测试管理 |
| `observers` | Read | 产品、设计、外部评审 |

要求：

- 按团队授权，不逐个用户随意授权。
- 遵循最小权限原则。
- 所有成员启用 2FA。
- 离职或退出项目当天移除权限并撤销密钥。
- 自动化访问优先使用 GitHub App 或 Actions 内置 `GITHUB_TOKEN`。

### 3.2 分支模型

本项目推荐使用 GitHub Flow：

```text
main
  ├─ feat/123-resume-editor
  ├─ fix/156-pdf-export
  ├─ docs/170-api-configuration
  └─ chore/181-upgrade-dependencies
```

不建议长期保留 `develop`。当前项目迭代快，短分支加受保护的 `main` 更简单，也能减少长期分支合并成本。

分支命名：

```text
feat/<issue-id>-<description>
fix/<issue-id>-<description>
refactor/<issue-id>-<description>
docs/<issue-id>-<description>
test/<issue-id>-<description>
chore/<issue-id>-<description>
release/<version>
hotfix/<issue-id>-<description>
```

示例：

```text
feat/42-ai-resume-rewrite
fix/58-docx-import-layout
chore/73-add-codegraph-tooling
```

规则：

- 使用小写英文、数字和连字符。
- 一个分支对应一个 Issue 或一个明确任务。
- 功能分支原则上不超过 3 个工作日。
- 禁止直接在 `main` 开发和直接推送。
- 分支合并后自动删除远程分支。

---

## 4. GitHub 仓库强制设置

为 `main` 创建 Repository Ruleset 或 Branch Protection Rule。

### 4.1 `main` 必须启用

- Require a pull request before merging。
- Require at least 1 approval；团队达到 5 人后改为 2 人。
- Require review from Code Owners。
- Dismiss stale pull request approvals when new commits are pushed。
- Require conversation resolution before merging。
- Require status checks to pass before merging。
- Require branches to be up to date before merging。
- Block force pushes。
- Block branch deletion。
- Do not allow bypassing the above settings，管理员也应遵守。
- 可选：Require linear history。
- 可选：Require signed commits。

建议必需状态检查：

```text
lint
typecheck
unit-test
build
security-check
```

### 4.2 合并策略

默认采用 **Squash and merge**：

- 一个 PR 在 `main` 中形成一个清晰提交；
- PR 内可保留开发过程提交；
- 合并提交标题必须符合 Conventional Commits。

关闭以下策略：

- 禁止普通成员执行 merge commit。
- 禁止普通成员直接 rebase-and-merge 到 `main`。
- 禁止自动强推修复主分支。

发布分支或需要保留完整提交关系时，可由维护者例外使用 merge commit。

---

## 5. 首次克隆标准流程

### 5.1 环境检查

Windows PowerShell：

```powershell
git --version
git lfs version
git config --global user.name
git config --global user.email
```

推荐配置：

```powershell
git config --global fetch.prune true
git config --global pull.ff only
git config --global core.autocrlf true
git config --global init.defaultBranch main
git config --global rerere.enabled true
```

说明：

- `fetch.prune=true`：清理远程已删除分支的本地跟踪引用。
- `pull.ff=only`：禁止 `git pull` 悄悄创建合并提交。
- `rerere=true`：记录冲突解决方式，重复冲突可复用。
- 团队统一换行策略应主要由 `.gitattributes` 管理。

### 5.2 完整克隆

```powershell
git clone --recurse-submodules https://github.com/<org>/Personal-Resume.git
Set-Location "Personal-Resume"
git fetch --all --prune --tags
git submodule sync --recursive
git submodule update --init --recursive
git lfs install
git lfs pull
```

禁止在正常开发环境默认使用：

```text
--depth
--single-branch
--filter
--no-tags
```

这些参数适合 CI 或只读分析环境，但会造成历史、分支或对象不完整，不能作为开发者标准克隆方式。

### 5.3 克隆完整性验收

```powershell
git remote -v
git status --short --branch
git branch --all
git tag --list
git fsck --full
git submodule status --recursive
git lfs status
git lfs ls-files
```

验证本地 `main` 是否对应远程 `main`：

```powershell
$local = git rev-parse main
$remoteLine = git ls-remote origin refs/heads/main
$remote = ($remoteLine -split "\s+")[0]
"local=$local"
"remote=$remote"
```

验收条件：

- `local` 与 `remote` 相同。
- `git status` 没有意外修改。
- `git fsck --full` 没有 missing、corrupt、broken link。
- 子模块状态前没有 `-` 或 `+`。
- Git LFS 文件不是文本指针占位。

注意：`git fsck` 输出 `dangling blob/tree/commit` 通常表示不可达对象，不等于仓库损坏；真正阻断项是 missing、corrupt、broken link 等错误。

---

## 6. 每日开发标准流程

### 6.1 开始任务

```powershell
git switch main
git fetch origin --prune --tags
git status --short --branch
git log --oneline --left-right main...origin/main
git diff --name-status main..origin/main
git pull --ff-only origin main
git switch -c feat/123-resume-editor
```

关键点：

- `fetch` 只更新远程跟踪引用，不改变工作区，适合安全比较。
- 先查看提交与文件差异，再执行 `pull`。
- `main` 只允许快进更新。

### 6.2 开发过程中

```powershell
git status --short
git diff
git add src/components/ResumeEditor.tsx
git diff --cached
git commit -m "feat(editor): add resume section ordering"
```

禁止默认使用：

```powershell
git add .
git commit -am "update"
```

应按文件或目录明确暂存，并在提交前执行 `git diff --cached`。

### 6.3 同步远程主分支

```powershell
git fetch origin --prune --tags
git log --oneline --left-right HEAD...origin/main
git diff --name-status HEAD...origin/main
git rebase origin/main
```

只对尚未共享或仅由本人维护的功能分支执行 rebase。

发生冲突：

```powershell
git status
# 手动编辑冲突文件
git add <resolved-file>
git rebase --continue
```

放弃本次 rebase：

```powershell
git rebase --abort
```

禁止在 rebase 失败后自动执行：

```powershell
git pull --allow-unrelated-histories
```

两个历史确实无关时，必须先由维护者确认仓库地址、初始化过程和历史来源。

### 6.4 推送功能分支

首次推送：

```powershell
git push -u origin feat/123-resume-editor
```

rebase 后更新本人功能分支：

```powershell
git push --force-with-lease
```

要求：

- 只能对本人功能分支使用 `--force-with-lease`。
- 禁止使用 `--force`。
- 禁止对 `main`、`release/*`、共享分支强推。
- 使用前必须再次 `git fetch origin`。

---

## 7. 文件与提交差异检查规范

### 7.1 工作区差异

未暂存修改：

```powershell
git diff
git diff --name-status
git diff --stat
```

已暂存、即将提交的修改：

```powershell
git diff --cached
git diff --cached --name-status
git diff --cached --stat
```

### 7.2 本地与远程差异

本地和远程各自领先多少提交：

```powershell
git rev-list --left-right --count HEAD...origin/main
```

结果示例：

```text
3    2
```

含义：

- 本地独有 3 个提交；
- 远程独有 2 个提交；
- 当前分支已分叉，不能直接 pull 或 push。

远程即将带入本地的提交和文件：

```powershell
git log --oneline HEAD..origin/main
git diff --name-status HEAD..origin/main
git diff --stat HEAD..origin/main
```

当前分支准备提交到 `main` 的内容：

```powershell
git log --oneline origin/main..HEAD
git diff --name-status origin/main...HEAD
git diff --stat origin/main...HEAD
```

三点 `...` 用于查看从共同祖先以来功能分支引入的变化，适合 PR 自检。

### 7.3 子模块差异

```powershell
git submodule status --recursive
git diff --submodule=log
git ls-files --stage | Select-String "160000"
```

状态符号：

- 空格：子模块处于主仓库指定提交。
- `-`：子模块尚未初始化。
- `+`：子模块当前提交与主仓库记录不一致。
- `U`：子模块存在合并冲突。

### 7.4 Git LFS 差异

```powershell
git lfs status
git lfs ls-files
git lfs fsck
```

如克隆后只看到以下文本，说明实际大文件没有拉取：

```text
version https://git-lfs.github.com/spec/v1
oid sha256:...
size ...
```

处理：

```powershell
git lfs install
git lfs pull
```

---

## 8. Pull Request 规范

### 8.1 PR 粒度

- 一个 PR 只解决一个主要问题。
- 建议修改不超过 400 行；生成文件和锁文件可单独说明。
- 大功能拆分为数据层、接口层、UI 层和测试等可独立审核的 PR。
- 未完成的工作使用 Draft PR。
- PR 必须关联 Issue，例如 `Closes #123`。

### 8.2 PR 描述模板

仓库应新增 `.github/pull_request_template.md`：

```markdown
## 变更说明

简述本 PR 解决的问题和实现方式。

## 关联任务

Closes #

## 变更类型

- [ ] 功能
- [ ] 修复
- [ ] 重构
- [ ] 文档
- [ ] 工程配置

## 验证结果

- [ ] Lint 通过
- [ ] 类型检查通过
- [ ] 单元测试通过
- [ ] 构建通过
- [ ] 已完成桌面端检查
- [ ] 已完成移动端检查

## 数据与安全

- [ ] 未提交 API Key、Token、个人简历或用户数据
- [ ] 配置变更已同步到 `.env.example`
- [ ] 数据库或接口变更具有兼容/迁移说明

## 界面变更

提供修改前后截图或录屏；无界面变更则填写“不适用”。

## 风险与回滚

说明风险、兼容性和回滚方式。
```

### 8.3 审核要求

审核者必须检查：

- 是否真正解决 Issue。
- 是否引入数据丢失、权限、隐私或安全风险。
- 是否存在隐藏的 API Key、模型密钥、用户简历内容。
- 接口、Schema、导入导出格式是否向后兼容。
- 错误、空数据、加载、超时、移动端状态是否完整。
- 测试是否覆盖核心路径和修复场景。
- 是否包含无关格式化或大范围重构。
- 第三方依赖许可证是否允许使用。

作者不能批准自己的 PR。

---

## 9. Commit 规范

采用 Conventional Commits：

```text
<type>(<scope>): <subject>
```

类型：

| type | 用途 |
|---|---|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `refactor` | 不改变功能的重构 |
| `perf` | 性能优化 |
| `test` | 测试 |
| `docs` | 文档 |
| `style` | 纯格式调整 |
| `build` | 构建系统或依赖 |
| `ci` | CI 配置 |
| `chore` | 其他维护 |
| `revert` | 回退 |

示例：

```text
feat(editor): add drag sorting for resume sections
fix(export): preserve Chinese fonts in PDF output
chore(deps): upgrade Vite to 7.1.0
docs(git): add team collaboration workflow
```

要求：

- 使用祈使句，标题建议不超过 72 个字符。
- 不使用“更新代码”“修复问题”“临时提交”等无信息标题。
- 一个提交应能单独说明目的。
- 不在提交信息中写密钥、客户姓名或隐私数据。

---

## 10. CODEOWNERS 建议

新增 `.github/CODEOWNERS`：

```text
# 默认所有修改由维护团队负责
* @<org>/maintainers

# 前端
/src/ @<org>/frontend

# 后端/API
/server/ @<org>/backend

# 简历模板与导出
/templates/ @<org>/resume-engine

# CI、发布与仓库治理
/.github/ @<org>/maintainers
/tool/ @<org>/maintainers
/package.json @<org>/maintainers
/package-lock.json @<org>/maintainers

# CODEOWNERS 本身必须由仓库所有者管理
/.github/CODEOWNERS @<org>/owners
```

实际目录名称应根据项目结构调整。

---

## 11. CI 质量门禁

建议建立 `.github/workflows/ci.yml`，所有 PR 至少执行：

1. 安装锁定版本的 Node.js。
2. 使用 `npm ci`，禁止 CI 使用 `npm install` 改写锁文件。
3. Lint。
4. TypeScript 类型检查。
5. 单元测试。
6. 生产构建。
7. 依赖和密钥检查。

推荐命令：

```powershell
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

如果暂时没有对应脚本，应先在 `package.json` 中补齐，再把它们设置为 required status checks。

后续增加：

- Playwright 关键流程测试。
- PDF、DOCX 导入导出的回归样例。
- 模板截图视觉回归。
- CodeQL。
- Dependabot。
- 依赖许可证检查。
- 构建产物和包体积阈值。

---

## 12. 安全与隐私规范

### 12.1 禁止提交

```text
.env
.env.local
.env.*.local
*.key
*.pem
credentials.json
secrets.json
用户上传的简历
本地生成的简历
客户信息
调试日志
数据库文件
模型 API Key
```

仓库只保留脱敏示例：

```text
.env.example
fixtures/sample-resume.json
```

`.env.example` 只能包含变量名和假值：

```dotenv
AI_PROVIDER=openai-compatible
AI_BASE_URL=https://example.invalid/v1
AI_API_KEY=replace_me
AI_MODEL=example-model
```

### 12.2 GitHub 安全设置

- 启用 Secret Scanning。
- 启用 Push Protection。
- 启用 Dependabot alerts。
- 条件允许时启用 Code Scanning/CodeQL。
- Actions 使用最小 `permissions`。
- 不在 Actions 日志输出密钥。
- 服务器密钥放在 GitHub Environments/Secrets，不写入仓库。
- 生产环境部署要求人工审批。

如果密钥已经提交，不能只删除当前文件；必须立即吊销密钥，并评估清理 Git 历史。

---

## 13. 第三方项目与 `codegraph` 修复方案

### 13.1 推荐方案：规范 Git Submodule

`codegraph` 是独立第三方仓库，推荐以子模块固定版本，避免把其完整历史和源码混入主仓库。

当前目录有本地改动，修复前必须先备份或提交这些改动。由维护者确认后执行：

```powershell
# 先在 codegraph 内确认状态和需要保留的修改
git -C tool/codegraph status
git -C tool/codegraph remote -v
git -C tool/codegraph rev-parse HEAD

# 确认无未保存内容后，修复主仓库中的残缺 Gitlink
git rm --cached tool/codegraph
git submodule add https://github.com/colbymchenry/codegraph.git tool/codegraph
git -C tool/codegraph checkout bfa84d32b82b908b9a07f579cad91642063b68e7
git add .gitmodules tool/codegraph
git diff --cached --submodule=log
```

通过 PR 合并后，其他成员执行：

```powershell
git submodule sync --recursive
git submodule update --init --recursive
```

更新子模块版本：

```powershell
git -C tool/codegraph fetch origin --prune --tags
git -C tool/codegraph checkout <approved-commit-or-tag>
git add tool/codegraph
git diff --cached --submodule=log
git commit -m "chore(tooling): update codegraph to <version>"
```

要求：

- 固定到审核过的 commit 或 tag。
- 不自动跟随第三方 `main`。
- 更新必须经过 PR、许可证检查和安全检查。
- `.gitmodules` 必须与 Gitlink 一起提交。

### 13.2 可选方案：安装型开发工具

如果 `codegraph` 只在少数开发者机器使用，不参与应用构建，更推荐：

- 不把它纳入主仓库索引；
- 安装到被 `.gitignore` 忽略的 `.tools/codegraph`；
- 用 `tool/setup-codegraph.ps1` 记录下载、固定版本和安装步骤；
- CI 不依赖开发者本地安装状态。

这能减少主项目克隆体积和第三方仓库维护成本。

### 13.3 不推荐方案

不推荐直接删除 `codegraph/.git` 后把第三方所有源码提交到主仓库，除非：

- 已核对许可证允许再分发；
- 确实需要修改并长期维护 fork；
- 已记录上游版本和本地补丁；
- 团队接受仓库体积与升级成本。

---

## 14. `push_to_github.py` 重构方案

### 14.1 重构定位

脚本不应继续作为“一键自动 pull + commit + push”工具。建议重构为显式子命令：

```text
doctor   环境、权限、远程和仓库健康检查
clone    完整克隆并验收
compare  只获取并展示差异，不修改工作区
sync     按明确策略同步当前分支
publish  检查、提交并推送功能分支
report   输出机器可读的 JSON/Markdown 报告
```

### 14.2 `clone` 必须实现

```text
--url
--directory
--branch
--recurse-submodules/--no-recurse-submodules
--lfs/--no-lfs
--full（默认）
--depth（仅显式使用）
```

克隆后必须验证：

- 实际远程 URL。
- 当前分支和远程默认分支。
- 本地与远程 HEAD。
- 所有远程分支和 tags。
- `git fsck --full`。
- 子模块初始化状态。
- Git LFS 对象状态。
- 工作区是否干净。

任何关键检查失败，命令返回非零退出码。

### 14.3 `compare` 必须输出

```text
仓库地址
当前分支
上游分支
本地 HEAD
远程 HEAD
ahead/behind 数量
本地独有提交
远程独有提交
工作区修改文件
已暂存文件
当前分支相对 main 的文件变化
子模块变化
Git LFS 状态
```

建议同时输出：

```text
.git/reports/git-compare-YYYYMMDD-HHMMSS.md
.git/reports/git-compare-YYYYMMDD-HHMMSS.json
```

报告放在 `.git` 内，不进入版本控制。

### 14.4 `sync` 安全规则

- 开始前必须执行 `fetch --prune --tags`。
- 工作区不干净时默认停止。
- 允许显式 `--stash`，并使用带名称的 `git stash push --include-untracked`。
- stash 恢复失败时保留 stash，不自动删除。
- `main` 只允许 `pull --ff-only`。
- 功能分支允许显式选择 `--rebase origin/main`。
- 发生冲突立即停止并打印恢复命令。
- 禁止自动 `--allow-unrelated-histories`。
- 禁止在失败后自动切换 merge/rebase 策略。

### 14.5 `publish` 安全规则

- 禁止在 `main` 运行。
- 检查分支是否有关联上游。
- 显示 `git diff` 与 `git diff --cached`。
- 禁止默认 `git add .`。
- 扫描疑似密钥和超大文件。
- 执行 lint、类型检查、测试和 build。
- 显示将要推送的提交。
- 默认普通 push。
- 只允许显式 `--force-with-lease`，彻底移除 `--force`。
- 推送后验证远程分支 SHA 与本地 SHA 一致。
- 提示创建 PR，而不是直接合并。

### 14.6 工程质量要求

- 修复文件编码为 UTF-8。
- `subprocess.run` 使用超时。
- 不使用 `errors="ignore"` 隐藏解码问题。
- 命令参数始终使用数组，禁止拼接 shell 字符串。
- 记录命令、耗时、退出码和精简错误。
- 支持 `--dry-run`，输出必须与实际执行步骤一致。
- 支持非交互 `--yes`，但高风险操作不得通过该参数绕过。
- 为 Git 输出解析编写单元测试。
- 在临时仓库中编写集成测试，覆盖分叉、冲突、子模块和 LFS。

---

## 15. 发布与版本管理

采用语义化版本：

```text
MAJOR.MINOR.PATCH
```

示例：

```text
0.1.0  第一版可用界面
0.2.0  增加 AI 改写
0.2.1  修复 PDF 导出
1.0.0  第一版正式上线
```

发布流程：

1. 创建版本 Issue/Milestone。
2. 确认所有目标 PR 已进入 `main`。
3. CI 全部通过。
4. 更新 Changelog。
5. 创建签名或受保护 tag。
6. 创建 GitHub Release。
7. 部署到 staging。
8. 完成验收后部署 production。
9. 记录部署提交 SHA 和回滚版本。

禁止直接在服务器修改源码。服务器部署内容必须能追溯到 Git tag 或 commit SHA。

---

## 16. 故障处理手册

### 16.1 拉取后目录缺失

```powershell
git ls-files --stage | Select-String "160000"
git submodule status --recursive
Get-Content .gitmodules
git submodule sync --recursive
git submodule update --init --recursive
```

如果存在 `160000`，但没有对应 `.gitmodules`，这是仓库结构问题，应由维护者修复，不能要求每位开发者手工猜测地址。

### 16.2 拉取后大文件打不开

```powershell
git lfs version
git lfs install
git lfs pull
git lfs fsck
```

### 16.3 本地和远程分叉

```powershell
git fetch origin --prune --tags
git rev-list --left-right --count HEAD...origin/main
git log --graph --oneline --decorate --left-right HEAD...origin/main
```

功能分支通常执行：

```powershell
git rebase origin/main
```

主分支分叉时停止操作，由维护者排查，禁止强推。

### 16.4 错误提交敏感信息

1. 立即吊销并轮换密钥。
2. 通知仓库管理员和安全负责人。
3. 检查 Actions 日志、fork、clone 和缓存。
4. 使用批准的历史清理流程移除敏感内容。
5. 强制所有成员重新同步被重写的历史。
6. 记录事故原因和预防措施。

删除最新文件不等于删除 Git 历史中的秘密。

### 16.5 误删提交

优先使用：

```powershell
git reflog
git show <commit>
```

不要立即执行清理或破坏性 reset。先创建恢复分支：

```powershell
git branch recovery/<date> <commit>
```

---

## 17. 落地执行清单

### P0：立即完成

- [ ] 备份并确认 `tool/codegraph` 本地修改。
- [ ] 修复 `tool/codegraph` 残缺 Gitlink，选择规范子模块或安装型工具。
- [ ] 停止使用脚本的 `--force` 和 `--allow-unrelated-histories`。
- [ ] 禁止脚本直接推送 `main`。
- [ ] 增加拉取前后的提交和文件比较。
- [ ] 检查 `.gitignore`，确保 API Key、用户简历和导出文件不入库。

### P1：多人加入前

- [ ] 将仓库迁移到 GitHub Organization。
- [ ] 创建团队和最小权限。
- [ ] 为 `main` 设置 Ruleset/Branch Protection。
- [ ] 添加 PR 模板、Issue 模板和 CODEOWNERS。
- [ ] 建立基础 GitHub Actions CI。
- [ ] 启用 Secret Scanning、Push Protection 和 Dependabot。
- [ ] 补充 `CONTRIBUTING.md` 和本地环境初始化说明。

### P2：上线服务器前

- [ ] 建立 staging 和 production 环境。
- [ ] 使用 GitHub Environments 管理部署密钥和审批。
- [ ] 建立数据库迁移、备份和回滚流程。
- [ ] 发布版本与 commit SHA 可追溯。
- [ ] 建立端到端测试和导入导出回归测试。
- [ ] 建立依赖、许可证和安全扫描。

---

## 18. 团队每日速查

开始工作：

```powershell
git switch main
git fetch origin --prune --tags
git diff --name-status main..origin/main
git pull --ff-only origin main
git switch -c feat/<issue-id>-<description>
```

提交前：

```powershell
git status --short
git diff
git add <明确文件>
git diff --cached
npm run lint
npm run typecheck
npm run test
npm run build
git commit -m "feat(scope): description"
```

推送与 PR：

```powershell
git fetch origin --prune --tags
git rebase origin/main
git push -u origin <branch>
```

合并后：

```powershell
git switch main
git pull --ff-only origin main
git branch -d <branch>
```

---

## 19. 验收标准

本规范完成落地后，应满足：

1. 新成员执行一套命令即可恢复主仓库、子模块和 LFS 文件。
2. 每次同步前都能看到远程新增提交和将改变的文件。
3. 每次推送前都能看到 staged diff、提交列表和测试结果。
4. 普通成员不能直接修改、删除或强推 `main`。
5. 未通过审核和 CI 的代码不能合并。
6. API Key 和用户简历不能被普通流程提交。
7. 每个线上版本都能追溯到 PR、tag、commit 和 CI 记录。
8. 自动脚本遇到冲突、历史不相关或完整性失败时立即停止。

---

## 20. 官方参考资料

- Git clone：<https://git-scm.com/docs/git-clone>
- Git fetch：<https://git-scm.com/docs/git-fetch>
- Git diff：<https://git-scm.com/docs/git-diff>
- Git submodules：<https://git-scm.com/docs/gitsubmodules>
- GitHub 受保护分支：<https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches>
- GitHub Pull Request Reviews：<https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews>
- GitHub CODEOWNERS：<https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners>
- GitHub 组织仓库权限：<https://docs.github.com/en/organizations/managing-access-to-your-organizations-repositories/repository-permission-levels-for-an-organization>
- GitHub 身份认证：<https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github>
- GitHub Secret Push Protection：<https://docs.github.com/en/code-security/secret-scanning/introduction/about-push-protection>
- GitHub Git LFS：<https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage>
- GitHub 大文件限制：<https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github>

