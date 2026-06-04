# AI 简历工坊开发落地方案

> 项目定位：AI 驱动的简历生成与优化平台，用于帮助用户创建、修改、排版、导入、导出简历，接入大模型能力，支持 PDF / DOCX / TXT / JSON 等格式。  
> 阶段边界：前期暂时本地部署，用于快速验证产品体验、AI 效果、模板质量和获客模式；后期会演进为服务器部署，并可继续扩展微信小程序端。  
> 业务边界：闲鱼只是早期获客渠道之一，不进入程序的核心产品设计；程序本身要按“独立简历生成平台”设计，而不是“闲鱼接单后台”。

---

## 1. 参考项目与可借鉴点

本方案参考了当前较成熟的开源或公开简历工具，但不建议直接照搬。你的项目当前先在本地验证，但产品形态应从第一天就按“可上线的简历生成平台”设计：前期本地运行，后期平滑迁移到服务器和微信小程序。

| 项目 | 公开信息 | 可借鉴点 | 对本项目的启发 |
|---|---|---|---|
| [Reactive Resume](https://rxresume.sharath.uk/) / [导出文档](https://docs.rxresu.me/guides/exporting-your-resume) | 开源、隐私优先，支持多简历、模板、PDF / DOCX / JSON 导出 | 结构化数据、模板渲染、多格式导出、JSON 备份 | 采用“简历数据 JSON + 模板渲染 + 导出服务”的核心架构 |
| [OpenResume](https://www.open-resume.com/) / [GitHub](https://github.com/xitanggg/open-resume) | 开源简历生成器和解析器，支持导入已有 PDF，关注 ATS 可读性和本地隐私 | PDF 导入解析、ATS 可读性检查、本地浏览器存储 | 第二阶段加入 PDF / DOCX 导入解析和 ATS 友好检测 |
| [Resumave](https://resumave.vercel.app/) / [GitHub](https://github.com/devxprite/resumave) | 无需登录，ATS 友好，A4 PDF 导出，localStorage 持久化 | 极简流程：选模板、填信息、下载 PDF | MVP 要压缩功能，只先跑通“编辑 + AI + 导出”闭环 |
| [MyPDFCV](https://www.mypdfcv.com/) / [GitHub](https://github.com/wesleyramalho/mypdfcv) | 实时双栏预览、7 套模板、一键 PDF、多语言、数据不存服务器 | 双栏/三栏编辑器、实时预览、拖拽排序 | 编辑页采用左侧表单、中间预览、右侧 AI 助手 |
| [ResumeItNow](https://resumeitnow.vercel.app/) | 开源 AI 简历工具，强调 AI 内容建议、自动生成、关键词优化 | AI 建议、自动生成、关键词优化 | AI 能力不要只做全文改写，要做板块级建议和一键应用 |
| [ApexResume](https://www.apexresume.tech/) | 开源、AI 建议、JD 匹配、评分、PDF 导出 | 简历评分、JD 匹配、语法修复、扩写 | 中后期加入“评分 / JD 匹配 / 语法检查 / 量化成果”快捷动作 |
| [JSON Resume](https://docs.jsonresume.org/schema) | 社区驱动的简历 JSON 标准 | 结构化、可移植、适合 AI 和版本管理 | 内部数据结构尽量兼容 JSON Resume 思路，方便后续扩展 |

结合竞品分析后的结论：

- 核心产品不是“闲鱼接单工具”，而是“用户可独立使用的 AI 简历生成平台”。
- 前期本地部署只是验证方式，架构上要提前支持服务器部署、用户账号、云端文件、微信小程序端。
- 核心资产是“结构化简历数据 + 模板系统 + AI 提示词 + 导入导出能力 + JD 匹配评分”。
- 早期不要做过重的自由设计器，先做精选行业模板和稳定的一页 A4 预览。
- PDF 导出优先于 DOCX，DOCX 是可编辑交付格式，建议第二阶段完善。
- AI 输出必须可控，系统设计上要支持“一键应用建议”，而不是直接覆盖全部内容。
- ResumeCollection 的启发是模板要做行业标签和精选推荐；猫步简历的启发是模板主题变量和模块化编辑；shushu-internship-tool 的启发是 JD 匹配、项目深挖、面试追问可以成为平台差异化功能。

---

## 2. 产品目标与非目标

### 2.1 产品目标

1. 支持用户创建和管理多份简历项目。
2. 支持手动录入、粘贴文本、导入 PDF / DOCX / TXT / JSON。
3. 将简历内容整理为结构化 JSON，方便编辑、AI 优化、模板渲染。
4. 支持 AI 优化整份简历、单个板块、单条经历、JD 匹配、中英翻译、语法检查。
5. 支持实时预览最终简历效果。
6. 支持导出 PDF、DOCX、TXT、JSON。
7. 支持模板选择，MVP 至少 3 套模板，后续扩展到 12 套精选行业模板。
8. 支持模板标签体系：行业、岗位、风格、ATS、一页、英文、双栏等。
9. 支持 AI 工具箱：JD 解析、简历诊断、单条改写、量化成果、优化说明、面试追问。
10. 前期支持本地配置 API Key、模型提供商、默认导出目录。
11. 后期支持服务器部署、用户账号、云端保存、对象存储、微信小程序端。
12. 支持隐私与数据管理：删除上传文件、导出文件、用户简历记录，后期支持云端文件生命周期管理。

### 2.2 明确不做

1. MVP 不做公网正式上线，只做本地可运行版本验证体验。
2. MVP 不做支付、会员、短信、复杂权限。
3. MVP 不做多人协作。
4. MVP 不做模板投稿、评论、积分体系、后台运营系统。
5. MVP 不做猫步简历式完全自由的积木设计器，只做结构化简历编辑和轻量主题变量。
6. 不引导或帮助编造学历、经历、证书。
7. 不把闲鱼订单管理设计进程序核心；闲鱼只是获客渠道，不是产品模块。
8. 后期上线服务器时再补用户登录、支付、云端文件、管理后台、小程序端。

---

## 3. 推荐技术路线

### 3.0 架构原则

当前先本地部署，但代码结构不能写成“只能本地用”。正确原则是：

```text
前端 Web 只是一个客户端
微信小程序未来也是一个客户端
核心业务能力放在后端 API
简历数据结构、AI 能力、模板渲染、导出能力保持跨端复用
```

推荐演进路径：

| 阶段 | 运行方式 | 目标 |
|---|---|---|
| 本地 MVP | React + FastAPI + SQLite，本机运行 | 快速验证编辑器、模板、AI、导出 |
| 服务器上线版 | React Web + FastAPI + PostgreSQL/MySQL + 对象存储 | 面向真实用户开放，支持账号、云端保存和支付 |
| 微信小程序版 | 小程序前端 + 复用同一套 FastAPI API | 面向手机用户简化创建、优化、预览和下载流程 |

### 3.1 正式技术栈

| 层面 | 技术 | 说明 |
|---|---|---|
| Web 前端 | React + Vite + TypeScript | 前期本地验证，后期可直接部署到服务器或 CDN |
| UI | Tailwind CSS + shadcn/ui 或 Radix UI | 快速做出专业后台工具界面 |
| 图标 | lucide-react | 编辑器按钮、导出、保存、AI 动作等 |
| 状态管理 | Zustand | 轻量管理编辑器状态，后期可继续保留 |
| 表单 | react-hook-form + zod | 简历字段较多，需要稳定表单校验 |
| 拖拽排序 | dnd-kit | 工作经历、项目经历、技能板块排序 |
| 后端 | FastAPI | 统一承载 AI、文件处理、模板渲染、导出和用户数据 API |
| 本地数据库 | SQLite + SQLAlchemy | MVP 零部署，文件即数据库 |
| 线上数据库 | PostgreSQL 或 MySQL | 上线后替换 SQLite，支持多用户和稳定备份 |
| 数据校验 | Pydantic | 后端结构化简历数据校验 |
| PDF 导出 | Playwright Python | HTML/CSS 渲染为 A4 PDF，效果稳定 |
| DOCX 导出 | python-docx | 生成可编辑 Word 文档 |
| PDF 解析 | PyMuPDF | 提取文本、位置、页结构 |
| DOCX 解析 | python-docx | 提取段落、表格文本 |
| AI 调用 | OpenAI 兼容接口 + httpx | DeepSeek、OpenAI、通义、Kimi 等统一适配 |
| 文件存储 | 本地文件系统，后期迁移对象存储 | 本地验证用 uploads/output，线上用 S3/MinIO/云 OSS |
| 缓存/任务队列 | MVP 暂不需要，后期 Redis + RQ/Celery | 用于异步导出、批量任务、限流 |
| 微信小程序 | 原生小程序或 Taro/uni-app | 后期作为移动端入口，复用后端 API |
| 本地模型可选 | Ollama | 后期可做低成本或隐私增强方案 |

### 3.2 本地版和上线版的差异

| 模块 | 本地 MVP | 服务器上线版 |
|---|---|---|
| 用户身份 | 不登录或本地管理员 | 微信登录/邮箱登录/手机号登录 |
| 数据库 | SQLite | PostgreSQL/MySQL |
| 文件存储 | 本地 `uploads/`、`output/` | 对象存储 + 文件生命周期 |
| API Key | 本地 `.env` 或设置页 | 服务端环境变量，不暴露给前端 |
| AI 调用 | 后端代理调用 | 后端统一调用、限流、计费统计 |
| 导出 | 本机 Playwright | 服务器异步导出，必要时任务队列 |
| 支付 | 不做 | 微信支付/支付宝/套餐体系 |
| 管理后台 | 不做 | 模板管理、用户管理、订单/用量统计 |
| 小程序 | 不做 | 复用 API，简化编辑和导出流程 |

### 3.3 为什么不建议只用 Gradio

Gradio 很适合第一版验证，但你的目标包含：

- 多份简历管理。
- 三栏编辑器。
- 实时预览。
- 模板库。
- 一键应用 AI 建议。
- 多格式导入导出。
- 后期上线服务器。
- 后期微信小程序复用。

这些需求更像一个可演进的平台，React + FastAPI 更稳。Gradio 可以作为极早期 Prompt 验证工具，但不适合作为正式产品底座。

---

## 4. 功能模块设计

### 4.1 模块总览

```mermaid
flowchart LR
  A["用户输入 / 原始简历"] --> B["导入解析"]
  B --> C["结构化简历数据"]
  C --> D["编辑器"]
  C --> E["AI 助手"]
  E --> C
  C --> F["模板渲染"]
  F --> G["实时预览"]
  F --> H["PDF 导出"]
  C --> I["DOCX / TXT / JSON 导出"]
  C --> J["简历项目管理"]
  C --> K["JD 匹配与评分"]
```

### 4.2 项目管理

功能：

- 新建简历项目。
- 从文件导入生成项目。
- 按简历标题、目标岗位、行业、状态搜索。
- 状态标记：草稿、优化中、待确认、已完成、已归档。
- 快速复制项目，用于同一用户投递多个岗位版本。
- 删除项目时可选择同时删除导出文件。
- 后期上线后支持用户账号下的多份简历管理。

MVP 字段：

| 字段 | 说明 |
|---|---|
| title | 项目标题，例如“Java开发_阿里投递版” |
| user_name | 用户姓名，本地 MVP 可选 |
| target_position | 目标岗位 |
| target_industry | 目标行业 |
| status | 处理状态 |
| template_id | 当前模板 |
| resume_data | 结构化简历 JSON |
| notes | 用户备注、修改记录 |
| created_at / updated_at | 时间 |

### 4.3 简历编辑器

推荐三栏布局：

| 区域 | 功能 |
|---|---|
| 左侧信息录入 | 个人信息、教育、工作、项目、技能、证书、自定义板块 |
| 中间实时预览 | A4 页面预览，尽量和导出 PDF 一致 |
| 右侧 AI 助手 | 优化建议、JD 匹配、改写、翻译、评分、应用建议 |

核心交互：

- 每个经历条目可新增、删除、复制、拖拽排序。
- 每条 bullet 可单独 AI 优化。
- 选中文本后，右侧出现“改写 / 量化 / 缩短 / 更专业 / 英文润色”。
- AI 建议不直接覆盖，先进入建议列表，由人工点“应用”。
- 预览区支持模板切换、字号调节、边距调节。

### 4.4 导入解析

支持优先级：

| 格式 | MVP | 后续 | 解析方式 |
|---|---:|---:|---|
| TXT | 是 | 是 | 直接读取文本，AI 结构化 |
| PDF | 是 | 是 | PyMuPDF 提取文本，再 AI 结构化 |
| DOCX | 是 | 是 | python-docx 提取段落和表格，再 AI 结构化 |
| DOC | 否 | 是 | LibreOffice headless 转 DOCX 后解析 |
| JSON | 是 | 是 | 直接导入内部 resume_data |

导入流程：

1. 用户上传文件。
2. 后端提取原始文本。
3. 页面展示原始文本，让人工确认。
4. 点击“结构化解析”。
5. AI 返回 resume_data JSON。
6. 系统做 JSON Schema 校验。
7. 解析失败时保留原文，允许手动复制到各板块。

### 4.5 AI 助手

AI 不只做“一键全文优化”，要做成可控的简历生成工作流。结合 shushu-internship-tool 的优势，AI 工具箱应从“润色按钮集合”升级为“岗位匹配引擎”。

| 功能 | MVP | 说明 |
|---|---:|---|
| JD 解析 | 是 | 提取岗位关键词、硬性要求、隐性要求 |
| 全文诊断 | 是 | 输出问题清单，不改原文 |
| 单板块优化 | 是 | 优化个人简介、工作经历、项目经历等 |
| 单条 bullet 改写 | 是 | 最常用，降低 AI 覆盖风险 |
| JD 匹配 | 是 | 输入岗位描述，输出关键词和修改建议 |
| 量化成果提示 | 是 | 提醒哪些内容可补充数字 |
| 优化说明 | 是 | 自动总结改了什么、为什么改，增强专业感 |
| 中英互译 | 中期 | 中文简历转英文，英文语法润色 |
| 简历评分 | 中期 | 按结构、关键词、量化、表达、ATS 评分 |
| 面试问题预测 | 后期 | 根据简历生成可能被问的问题 |
| 求职信生成 | 后期 | 搭配旗舰款服务 |

AI 输出原则：

- 不编造经历。
- 不默认覆盖原内容。
- 不输出无法验证的公司、奖项、学历。
- 对不确定信息用“待补充”标记。
- 每次输出包含“修改理由”，方便生成优化说明。

AI 工具箱推荐流程：

```text
导入/录入简历 → 输入目标 JD → JD 解析 → 简历诊断 → 单条/板块优化 → 量化成果提示 → 模板套用 → 导出前检查 → PDF/DOCX 导出
```

### 4.6 模板系统

模板采用 HTML + CSS + Jinja2 渲染，并从第一版就建立模板标签体系。ResumeCollection 的优势是模板数量和行业覆盖，猫步简历的优势是主题变量和模块化设计；我们的策略是“精选行业模板 + 标签推荐 + 轻量主题变量”。

MVP 模板：

| 模板 | 适用人群 | 风格 |
|---|---|---|
| modern | 互联网、产品、运营、技术 | 简洁、蓝色点缀 |
| classic | 金融、法务、行政、国企 | 稳重、黑白灰 |
| compact | 应届生、内容多的候选人 | 一页优先、信息密度高 |

第二阶段精选模板扩展到 12 套：

| 模板 | 适用人群 | 标签 |
|---|---|---|
| internet_simple | 产品、运营、技术 | 互联网、ATS、单页 |
| engineer | 前端、后端、测试、算法 | 技术、项目突出、技能突出 |
| campus | 校招、实习、应届生 | 教育背景、校园经历 |
| finance_consulting | 金融、咨询、投行 | 正式、黑白、稳重 |
| state_owned | 国企、行政、人事、文职 | 传统、稳定、简洁 |
| medical | 护士、医生、药学 | 证书突出、经历清晰 |
| teacher | 教师、教培、辅导员 | 证书、荣誉、教学经历 |
| creative | UI、视觉、品牌、传媒 | 作品集、视觉化 |
| sales_marketing | 市场、销售、商务 | 业绩数字突出 |
| english | 外企、留学、英文岗位 | 英文、ATS |
| bilingual | 中英双语岗位 | 双语、国际化 |
| ats_plain | 网申系统优先 | 极简、纯文本友好 |

模板标签：

| 标签类型 | 示例 |
|---|---|
| 行业 | 互联网、金融、教育、医护、销售、设计 |
| 岗位 | 产品、前端、后端、运营、教师、护士 |
| 风格 | 简约、正式、创意、双栏、极简 |
| 页数 | 一页优先、两页友好 |
| 解析 | ATS 友好、视觉优先 |
| 语言 | 中文、英文、中英双语 |

主题变量：

```json
{
  "primary_color": "#2563eb",
  "font_family": "Source Han Sans",
  "font_size": 10.5,
  "page_margin": 15,
  "section_spacing": 12,
  "line_height": 1.55
}
```

模板原则：

- A4 尺寸。
- 打印友好。
- 尽量 ATS 友好。
- 中文字体优先使用可免费商用字体，如思源黑体 / 思源宋体。
- 不在简历正文使用复杂背景图。
- 默认一页，内容过多时允许二页。

### 4.7 导出

| 格式 | 用途 | 实现 |
|---|---|---|
| PDF | 用户投递、下载分享 | Playwright 渲染 HTML |
| DOCX | 用户二次编辑 | python-docx 生成 |
| TXT | ATS / 纯文本备份 | 从 resume_data 展开 |
| JSON | 备份、AI 复用、版本迁移 | 导出内部结构 |
| HTML | 调试模板 | 保存渲染结果 |

导出命名建议：

```text
姓名_目标岗位_版本_日期.pdf
姓名_目标岗位_版本_日期.docx
例如：张三_前端开发_投递版_20260603.pdf
```

---

## 5. 数据结构设计

### 5.1 内部 resume_data

内部结构不用完全照搬 JSON Resume，但字段命名尽量接近，方便后期兼容。

```json
{
  "basics": {
    "name": "",
    "headline": "",
    "phone": "",
    "email": "",
    "location": "",
    "website": "",
    "linkedin": "",
    "github": ""
  },
  "target": {
    "position": "",
    "industry": "",
    "company_type": "",
    "jd_text": "",
    "keywords": []
  },
  "summary": "",
  "work": [
    {
      "id": "work_001",
      "company": "",
      "position": "",
      "location": "",
      "start_date": "",
      "end_date": "",
      "description": "",
      "highlights": []
    }
  ],
  "projects": [
    {
      "id": "project_001",
      "name": "",
      "role": "",
      "start_date": "",
      "end_date": "",
      "description": "",
      "highlights": [],
      "technologies": []
    }
  ],
  "education": [
    {
      "id": "edu_001",
      "school": "",
      "degree": "",
      "major": "",
      "start_date": "",
      "end_date": "",
      "gpa": "",
      "highlights": []
    }
  ],
  "skills": [
    {
      "category": "专业技能",
      "items": []
    }
  ],
  "certificates": [],
  "languages": [],
  "awards": [],
  "custom_sections": []
}
```

### 5.2 数据库表

```sql
CREATE TABLE resumes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  title TEXT NOT NULL,
  owner_name TEXT,
  owner_email TEXT,
  target_position TEXT,
  target_industry TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  template_id TEXT NOT NULL DEFAULT 'modern',
  resume_data TEXT NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE ai_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  resume_id INTEGER,
  provider TEXT,
  model TEXT,
  action TEXT,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  cost_estimate REAL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE export_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  resume_id INTEGER,
  format TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

上线后补充用户与文件表：

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  openid TEXT,
  email TEXT,
  phone TEXT,
  nickname TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  resume_id INTEGER,
  file_type TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  original_name TEXT,
  size INTEGER,
  created_at TEXT NOT NULL
);
```

说明：

- 本地 MVP 可以让 `user_id` 为空。
- 上线服务器后，`user_id` 关联用户账号。
- 小程序端使用同一套 `resumes.resume_data`，避免重复设计移动端数据结构。

---

## 6. 后端 API 设计

### 6.1 简历 API

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/resumes` | 简历列表 |
| POST | `/api/resumes` | 新建简历 |
| GET | `/api/resumes/{id}` | 简历详情 |
| PUT | `/api/resumes/{id}` | 更新简历 |
| DELETE | `/api/resumes/{id}` | 删除简历 |
| POST | `/api/resumes/{id}/duplicate` | 复制简历 |
| PATCH | `/api/resumes/{id}/status` | 更新状态 |

### 6.2 AI API

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/ai/diagnose` | 全文诊断 |
| POST | `/api/ai/optimize-section` | 优化板块 |
| POST | `/api/ai/rewrite-text` | 改写选中文本 |
| POST | `/api/ai/quantify` | 量化成果建议 |
| POST | `/api/ai/jd-match` | JD 匹配 |
| POST | `/api/ai/translate` | 中英互译 |
| POST | `/api/ai/grammar` | 英文语法检查 |
| POST | `/api/ai/parse-resume` | 原始文本结构化 |

### 6.3 导入导出 API

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/import/file` | 上传并提取文本 |
| POST | `/api/import/structure` | 文本结构化为 resume_data |
| POST | `/api/export/pdf` | 导出 PDF |
| POST | `/api/export/docx` | 导出 DOCX |
| POST | `/api/export/txt` | 导出 TXT |
| POST | `/api/export/json` | 导出 JSON |
| GET | `/api/export/records/{resume_id}` | 导出记录 |

### 6.4 模板 API

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/templates` | 模板列表 |
| GET | `/api/templates/{id}` | 模板详情 |
| POST | `/api/templates/render` | 渲染 HTML 预览 |
| POST | `/api/templates/preview-pdf` | 生成预览 PDF |

---

## 7. 项目目录结构

```text
resume-workshop/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── routers/
│   │   │   ├── resumes.py
│   │   │   ├── ai.py
│   │   │   ├── import_export.py
│   │   │   ├── templates.py
│   │   │   └── settings.py
│   │   ├── services/
│   │   │   ├── ai_service.py
│   │   │   ├── import_service.py
│   │   │   ├── export_service.py
│   │   │   ├── template_service.py
│   │   │   └── privacy_service.py
│   │   ├── prompts/
│   │   │   ├── diagnose.md
│   │   │   ├── optimize_section.md
│   │   │   ├── rewrite_text.md
│   │   │   ├── jd_match.md
│   │   │   ├── parse_resume.md
│   │   │   └── translate.md
│   │   └── templates/
│   │       ├── modern/
│   │       ├── classic/
│   │       └── compact/
│   ├── data/
│   │   └── resume_workshop.db
│   ├── output/
│   ├── uploads/
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── resume/
│   │   │   ├── ai/
│   │   │   ├── templates/
│   │   │   └── common/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── EditorPage.tsx
│   │   │   ├── ImportPage.tsx
│   │   │   ├── TemplatesPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── store/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   ├── prompts.md
│   ├── template-guide.md
│   ├── user-flow.md
│   └── deployment-plan.md
└── README.md
```

---

## 8. AI 提示词策略

### 8.1 全文诊断 Prompt

目标：先诊断，不直接改。

```text
你是一名专业 HR 顾问和简历优化专家，有 10 年招聘经验。
请诊断这份简历的问题，必须遵守：
1. 不编造经历。
2. 不直接重写全文。
3. 按严重程度输出问题。
4. 给出可执行修改建议。
5. 针对目标岗位提取关键词。

输出 JSON：
{
  "score": 0-100,
  "summary": "整体评价",
  "issues": [
    {
      "level": "high|medium|low",
      "section": "板块",
      "problem": "问题",
      "suggestion": "建议"
    }
  ],
  "keywords": [],
  "next_actions": []
}
```

### 8.2 单条经历改写 Prompt

```text
你是简历改写专家。
请将用户提供的一条经历改写得更专业、更简洁、更符合目标岗位。

要求：
1. 保持事实不变，不新增未经用户提供的公司、奖项、数据。
2. 如果缺少数据，用 [待补充数据] 标记。
3. 优先使用主动动词：主导、推动、搭建、优化、协同、落地。
4. 尽量体现 STAR 结构。
5. 输出 3 个版本：稳妥版、强化版、精简版。

返回 JSON：
{
  "versions": [
    {"type": "稳妥版", "text": "...", "reason": "..."},
    {"type": "强化版", "text": "...", "reason": "..."},
    {"type": "精简版", "text": "...", "reason": "..."}
  ],
  "need_confirm": ["需要用户确认的信息"]
}
```

### 8.3 JD 匹配 Prompt

```text
你是简历与岗位匹配专家。
请根据目标 JD 分析当前简历。

要求：
1. 提取 JD 关键词和硬性要求。
2. 找出简历中已经匹配的内容。
3. 找出简历中缺失或表达较弱的内容。
4. 给出修改建议，但不得编造经历。
5. 输出可直接应用到简历中的改写建议。
```

### 8.4 AI 结果安全规则

- 如果 AI 建议加入“提升 30%”“管理 5 人团队”等数据，而原始内容没有相关证据，必须标记为“待确认”。
- 前端对含“待补充”“待确认”的内容做高亮。
- 默认不允许“应用全部建议”，只允许逐条应用。
- 每次导出前弹出复核清单：联系方式、时间线、学历、公司名、岗位名、数据真实性。

---

## 9. 数据安全与文件管理

### 9.1 本地 MVP 文件目录

```text
backend/uploads/    # 原始上传文件，默认 7 天后提醒删除
backend/output/     # 导出文件
backend/data/       # SQLite 数据库
```

### 9.2 服务器上线后的文件目录

```text
对象存储/resume-uploads/    # 用户上传的原始文件
对象存储/resume-exports/    # PDF / DOCX / TXT / JSON 导出文件
数据库/files                # 文件元信息、归属用户、生命周期状态
```

### 9.3 隐私功能

MVP：

- 删除单个简历项目。
- 删除项目时同时删除上传文件和导出文件。
- 设置页显示当前本地数据目录。

第二阶段：

- 一键清理已完成项目的原始上传文件。
- 一键导出数据库备份。
- 一键清空 AI 日志。
- 用户敏感字段打码预览。

上线后：

- 用户可删除自己的简历和上传文件。
- 服务端设置文件保留周期。
- 管理端支持异常文件清理。
- API Key 永远只保存在服务端，不暴露给 Web 前端或小程序。

### 9.4 用户侧免责声明

导出前在页面提示：

```text
本简历内容由 AI 辅助生成或优化，基于你提供的信息整理。请在投递前核对联系方式、教育经历、工作时间、项目数据等事实信息，确保内容真实准确。
```

---

## 10. 开发路线图

### 第 1 周：MVP 骨架

目标：本地能跑，能新建简历、编辑、预览。

任务：

- 初始化 FastAPI + React 项目。
- SQLite 数据库和 resumes 表。
- Dashboard 简历列表。
- Editor 三栏布局。
- basics / summary / work / education / skills 表单。
- 预览区渲染 modern 模板。
- 保存和读取 resume_data。

验收：

- 打开 `http://localhost:5173` 可进入工具。
- 新建一份简历，填写信息后能实时预览。
- 刷新页面后数据不丢。

### 第 2 周：AI + PDF 闭环

目标：能让用户完成“填写/导入 → AI 优化 → 预览 → PDF 下载”的核心流程。

任务：

- 配置 DeepSeek API Key。
- 后端封装 OpenAI 兼容 AI 调用。
- 实现全文诊断。
- 实现单条经历改写。
- 实现右侧 AI 建议列表。
- 实现 PDF 导出。
- 增加 classic / compact 两套模板。

验收：

- 能对一条工作经历生成 3 个版本。
- 能逐条应用 AI 建议。
- 能导出 A4 PDF。
- PDF 与预览基本一致。

### 第 3-4 周：导入与 DOCX

目标：支持已有简历修改。

任务：

- TXT 导入。
- PDF 文本提取。
- DOCX 文本提取。
- AI 结构化解析为 resume_data。
- 导入确认页。
- DOCX 导出。
- JSON 导入导出。

验收：

- 上传一份 PDF 简历后，能提取文本并生成可编辑结构。
- 导出 DOCX 可用 Word 打开并继续编辑。
- JSON 可作为备份重新导入。

### 第 5-6 周：JD 匹配与平台差异化能力

目标：吸收竞品优势，让产品不只是排版工具，而是能提升岗位匹配度的简历生成平台。

任务：

- JD 匹配分析。
- 简历评分。
- 量化成果建议。
- 中英互译。
- 英文语法检查。
- 优化说明生成。
- 面试问题预测。
- 项目复制，用于同一用户多个岗位版本。
- 模板扩充到 12 套精选行业模板。

验收：

- 输入 JD 后输出关键词、匹配项、缺失项、修改建议。
- 用户能根据评分和建议完成一版更匹配岗位的简历。
- 模板中心可按行业、岗位、ATS、一页、英文等标签筛选。

### 第 7-8 周：上线预备与稳定性

目标：为后续服务器部署和微信小程序复用做准备。

任务：

- 导出记录。
- 状态流转。
- 批量导出。
- 隐私清理。
- 数据库备份。
- 处理失败提示和日志。
- 用户表、文件表、套餐表预留。
- SQLite 到 PostgreSQL/MySQL 的迁移方案。
- 对象存储适配层。
- 服务端 API Key 管理。
- 微信小程序端 API 兼容性检查。

验收：

- 本地 MVP 的核心数据结构可以无痛迁移到服务器。
- Web 前端和未来小程序端都能复用同一套简历 API。
- 可一键清理已完成简历的原始上传文件。

---

## 11. MVP 版本最小功能清单

第一版不要贪多，只做这些：

- [ ] 本地启动前端和后端。
- [ ] 新建简历项目。
- [ ] 编辑个人信息、个人简介、工作经历、教育背景、项目经历、技能。
- [ ] 实时预览 modern 模板。
- [ ] DeepSeek API 配置。
- [ ] 单条经历 AI 改写。
- [ ] AI 建议一键应用。
- [ ] PDF 导出。
- [ ] 删除项目。

暂缓：

- [ ] DOCX 导出。
- [ ] PDF / DOCX 导入。
- [ ] 多模型切换。
- [ ] 批量处理。
- [ ] 模板设计器。
- [ ] 用户登录、支付、云端保存。
- [ ] 微信小程序端。

---

## 12. 环境配置

### 12.1 后端依赖

```txt
fastapi==0.115.0
uvicorn[standard]==0.30.0
sqlalchemy==2.0.35
pydantic==2.9.0
python-dotenv==1.0.1
httpx==0.27.0
jinja2==3.1.4
playwright==1.48.0
python-docx==1.1.2
PyMuPDF==1.24.0
```

### 12.2 前端依赖

```bash
npm create vite@latest frontend -- --template react-ts
npm install zustand react-router-dom react-hook-form zod @hookform/resolvers
npm install lucide-react clsx tailwind-merge
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install -D tailwindcss postcss autoprefixer
```

### 12.3 `.env.example`

```bash
APP_ENV=local
DATABASE_URL=sqlite:///./data/resume_workshop.db
UPLOAD_DIR=./uploads
OUTPUT_DIR=./output
PUBLIC_BASE_URL=http://localhost:5173

DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat

OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

服务器上线时改为：

```bash
APP_ENV=production
DATABASE_URL=postgresql+psycopg://user:password@host:5432/resume_workshop
PUBLIC_BASE_URL=https://your-domain.com
STORAGE_DRIVER=s3
STORAGE_BUCKET=resume-workshop
STORAGE_ENDPOINT=https://oss-or-s3-endpoint
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
JWT_SECRET=
WECHAT_APP_ID=
WECHAT_APP_SECRET=
```

### 12.4 启动命令

```bash
# 后端
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
uvicorn app.main:app --reload --port 8000

# 前端
cd frontend
npm install
npm run dev
```

访问：

```text
前端：http://localhost:5173
后端：http://localhost:8000
API 文档：http://localhost:8000/docs
```

---

## 13. 用户使用流程

### 13.1 本地 MVP 用户流程

前期本地版本先验证完整体验，不考虑登录、支付和多用户。

```mermaid
flowchart TD
  A["打开本地 Web"] --> B["新建简历"]
  B --> C{"是否有原始简历"}
  C -->|有| D["导入 PDF / DOCX / TXT / JSON"]
  C -->|无| E["手动录入简历信息"]
  D --> F["AI 结构化解析"]
  E --> G["补全结构化字段"]
  F --> H["输入目标岗位 / JD"]
  G --> H
  H --> I["JD 解析与简历诊断"]
  I --> J["逐条应用 AI 建议"]
  J --> K["选择模板并实时预览"]
  K --> L["导出前事实检查"]
  L --> M["导出 PDF / DOCX / JSON"]
```

### 13.2 服务器上线后用户流程

```mermaid
flowchart TD
  A["用户访问 Web / 小程序"] --> B["登录或游客体验"]
  B --> C["选择模板或导入简历"]
  C --> D["填写目标岗位 / JD"]
  D --> E["AI 生成或优化简历"]
  E --> F["实时预览与手动编辑"]
  F --> G["导出 PDF / DOCX"]
  G --> H{"是否付费能力"}
  H -->|免费额度内| I["下载文件"]
  H -->|超出额度| J["引导购买套餐"]
```

### 13.3 导出前检查清单

导出前必须检查：

- [ ] 姓名、电话、邮箱无误。
- [ ] 教育经历时间无误。
- [ ] 工作经历时间无冲突。
- [ ] 公司名、岗位名无误。
- [ ] AI 没有编造不存在的数据。
- [ ] PDF 没有分页错乱。
- [ ] DOCX 可正常打开。
- [ ] 文件名规范。

---

## 14. 风险与应对

| 风险 | 表现 | 应对 |
|---|---|---|
| AI 编造 | 自动生成不存在的数据、奖项、职责 | 所有 AI 建议逐条应用，待确认内容高亮 |
| 隐私泄露 | 用户资料长期留存或云端文件未清理 | 本地支持清理，线上设置文件生命周期和删除能力 |
| 模板侵权 | 使用网上未授权模板 | 只用自制模板或明确商用授权模板 |
| 导出错位 | PDF 分页、字体、间距异常 | Playwright 固定 A4 预览，导出前人工检查 |
| DOCX 效果不一致 | Word 排版与 PDF 不同 | DOCX 作为可编辑版本，PDF 作为标准交付版本 |
| AI 成本失控 | 上线后用户频繁调用大模型 | 做用量限制、队列、缓存、套餐额度 |
| API Key 泄露 | 前端暴露模型密钥 | 所有 AI 调用必须走后端代理 |
| 上线迁移困难 | 本地逻辑写死，无法多用户 | 从 MVP 开始保持 API 化、结构化数据和用户字段预留 |
| 过度开发 | 功能很多但核心流程不可用 | 先完成简历生成、AI 优化、PDF 导出，再扩展支付和小程序 |

---

## 15. 推荐执行顺序

最现实的顺序：

1. 先做正式项目骨架，不急着做漂亮模板。
2. 用手动录入 + AI 单条改写 + PDF 导出跑通第一条用户路径。
3. 找 3-5 份真实简历试用，记录卡点。
4. 再开发导入解析，因为导入解析的真实难度比想象高。
5. 模板从 3 套扩到 12 套精选行业模板。
6. 加 JD 匹配、评分、英文润色、优化说明，形成差异化能力。
7. 再做服务器部署、用户登录、云端保存、支付。
8. 最后做微信小程序端。

---

## 16. 第一版开发任务拆分

### 后端任务

- [ ] FastAPI 应用入口。
- [ ] CORS 配置。
- [ ] SQLite 初始化。
- [ ] Resume 模型。
- [ ] 简历 CRUD。
- [ ] 模板读取与渲染。
- [ ] AI 调用封装。
- [ ] PDF 导出。

### 前端任务

- [ ] Vite React 初始化。
- [ ] Dashboard 页面。
- [ ] Editor 页面三栏布局。
- [ ] 简历表单组件。
- [ ] 预览 iframe。
- [ ] AI 助手面板。
- [ ] 导出按钮。
- [ ] 设置页 API Key 输入。

### 模板任务

- [ ] modern 模板。
- [ ] classic 模板。
- [ ] compact 模板。
- [ ] A4 打印 CSS。
- [ ] 中文字体测试。

### 验收任务

- [ ] 新建简历后保存成功。
- [ ] 刷新后数据仍在。
- [ ] AI 改写返回可应用建议。
- [ ] PDF 导出成功。
- [ ] PDF 中中文字体正常。
- [ ] 删除项目成功。

---

## 17. 上线演进计划

### 17.1 本地到服务器迁移步骤

1. 保持 `resume_data` JSON 结构不变。
2. 将 SQLite 迁移到 PostgreSQL/MySQL。
3. 将本地 `uploads/` 和 `output/` 迁移到对象存储。
4. 将 API Key 从设置页迁移到服务端环境变量。
5. 增加用户登录、用户简历归属、文件归属。
6. PDF/DOCX 导出改为后端异步任务。
7. 增加用量统计、免费额度和套餐限制。
8. 前端从本地 Vite 部署迁移到服务器或 CDN。

### 17.2 Web 和小程序复用边界

| 能力 | Web 前端 | 微信小程序 | 后端 |
|---|---|---|---|
| 简历编辑 | 完整编辑器 | 简化编辑器 | 保存结构化数据 |
| 模板预览 | A4 实时预览 | 缩略预览 + 详情预览 | HTML 渲染 |
| AI 优化 | 右侧 AI 面板 | 按钮式 AI 工具 | 统一 AI 服务 |
| PDF/DOCX 导出 | 下载文件 | 生成后下载/转发 | 统一导出服务 |
| 用户数据 | 调 API | 调 API | 统一用户与文件管理 |

### 17.3 上线前必须补齐

- 用户登录与鉴权。
- 数据库迁移脚本。
- 对象存储适配。
- AI 调用限流和错误处理。
- 导出任务队列。
- 隐私政策和用户协议。
- 模板版权自查。
- 生产环境日志和备份。

---

## 18. 一句话总结

这个项目的本质是 AI 简历生成平台：前期本地部署只是为了快速验证，后期要能上线服务器并扩展微信小程序。第一目标不是把功能堆满，而是先把“创建简历 → AI 优化 → 模板预览 → PDF/DOCX 导出”的核心体验做稳，再用 JD 匹配、精选行业模板和可控 AI 建议做出差异化。
