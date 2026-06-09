# Local Development Runbook

> 平台：Windows PowerShell  
> 最后核对：2026-06-08

## Prerequisites

```powershell
git --version
node --version
npm.cmd --version
python --version
codegraph.cmd --version
```

建议：

- Node.js 20+。
- Python 3.10+。
- Git 最新稳定版。
- Chrome 或 Edge。

## Clone

```powershell
git clone https://github.com/easterndd/Personal-Resume.git
Set-Location "Personal-Resume"
git status --short --branch
```

禁止把其他机器的 `backend/.venv` 或 `frontend/node_modules` 当成依赖来源。

## Frontend Setup

```powershell
Set-Location frontend
npm.cmd ci
Copy-Item .env.example .env -ErrorAction SilentlyContinue
npm.cmd run dev
```

如果没有 `frontend/.env.example`，可创建本地未提交的 `frontend/.env`：

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

访问：`http://localhost:5173`。

## Backend Setup

```powershell
Set-Location backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
```

当前代码实际使用 `pydantic-settings`，导出目标使用 Playwright。若 requirements 尚未修复，可在本地临时安装：

```powershell
.\.venv\Scripts\python.exe -m pip install pydantic-settings playwright
.\.venv\Scripts\python.exe -m playwright install chromium
```

临时命令只用于恢复环境；应另开任务把依赖正式写入 requirements 并验证版本。

启动：

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

访问：

- Health：`http://localhost:8000/health`
- OpenAPI：`http://localhost:8000/docs`

## Environment

后端 `.env`：

```dotenv
APP_ENV=local
DATABASE_URL=sqlite:///./data/resume_workshop.db
UPLOAD_DIR=./uploads
OUTPUT_DIR=./output
PUBLIC_BASE_URL=http://localhost:5173

DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
```

要求：

- `.env` 不提交。
- API Key 不粘贴到 Issue、日志或截图。
- 使用前确认第三方模型的数据政策。

## Smoke Test

```powershell
Invoke-RestMethod http://localhost:8000/health
Invoke-RestMethod http://localhost:8000/api/resumes
```

浏览器检查：

1. 打开首页。
2. 新建简历。
3. 编辑基本信息。
4. 保存并刷新。
5. 切换模板。
6. 尝试导出 JSON/PDF。
7. 检查浏览器控制台和后端终端。

注意：templates/settings Router 当前未注册时，对应接口会返回 404。

## Verification

前端：

```powershell
Set-Location frontend
npm.cmd run lint
npm.cmd run build
```

后端：

```powershell
Set-Location backend
.\.venv\Scripts\python.exe -m compileall app
.\.venv\Scripts\python.exe -c "from app.main import app; print([r.path for r in app.routes])"
```

仓库：

```powershell
Set-Location ..
git diff --check
git status --short
```

## Common Problems

### npm.ps1 Is Blocked

使用：

```powershell
npm.cmd run dev
```

无需为此修改系统执行策略。

### ModuleNotFoundError: pydantic_settings

```powershell
.\backend\.venv\Scripts\python.exe -m pip install pydantic-settings
```

随后应修复 `backend/requirements.txt`。

### PDF Export Cannot Find Browser

```powershell
.\backend\.venv\Scripts\python.exe -m playwright install chromium
```

### Port In Use

```powershell
Get-NetTCPConnection -LocalPort 5173,8000 -ErrorAction SilentlyContinue
```

选择其他端口时同步修改前端 API URL 和 CORS。

### Database Reset for Local Test

先停止后端并备份需要的数据。只有确认该数据库不含需要保留的简历后，才删除本地数据库文件。不要把此操作用于服务器环境。

## Stop

在前端和后端终端按 `Ctrl+C`。确认没有遗留进程：

```powershell
Get-NetTCPConnection -LocalPort 5173,8000 -ErrorAction SilentlyContinue
```

