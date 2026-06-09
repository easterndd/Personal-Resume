# Data Model Snapshot

> 快照日期：2026-06-08  
> 来源：`backend/app/models.py`、`backend/app/schemas.py`、`frontend/src/types/index.ts`

## Database

### resumes

| Column | Type | Notes |
|---|---|---|
| `id` | String PK | UUID 字符串 |
| `title` | String | 有索引 |
| `owner_name` | String | 当前可空，无身份约束 |
| `owner_email` | String | 当前可空 |
| `target_position` | String | 目标岗位 |
| `target_industry` | String | 目标行业 |
| `status` | String | 默认 `draft` |
| `template_id` | String | 默认 `modern` |
| `resume_data` | Text | JSON 字符串 |
| `notes` | Text | 备注 |
| `created_at` | String | 当前非数据库时间类型 |
| `updated_at` | String | 当前非数据库时间类型 |

### ai_logs

| Column | Type | Notes |
|---|---|---|
| `id` | Integer PK | 自增 |
| `resume_id` | String | 当前无外键 |
| `provider` | String | 模型供应商 |
| `model` | String | 模型 |
| `action` | String | 操作类型 |
| `prompt_tokens` | Integer | 默认 0 |
| `completion_tokens` | Integer | 默认 0 |
| `cost_estimate` | String | 当前使用字符串 |
| `created_at` | String | 当前非数据库时间类型 |

### export_records

| Column | Type | Notes |
|---|---|---|
| `id` | Integer PK | 自增 |
| `resume_id` | String | 当前无外键 |
| `format` | String | pdf/docx/txt/json |
| `file_path` | String | 当前本地路径 |
| `created_at` | String | 当前非数据库时间类型 |

### settings

| Column | Type | Notes |
|---|---|---|
| `key` | String PK | 设置键 |
| `value` | Text | 明文，不能用于线上 Secret |

## Canonical ResumeData

```text
ResumeData
├── basics: ResumeBasics
├── target: ResumeTarget
├── summary: string
├── work: ResumeWork[]
├── projects: ResumeProject[]
├── education: ResumeEducation[]
├── skills: ResumeSkill[]
├── certificates: ResumeCertificate[]
├── languages: ResumeLanguage[]
├── awards: ResumeAward[]
└── custom_sections: CustomSection[]
```

### basics

后端字段：

```text
name, headline, phone, email, location, website, linkedin, github
```

前端额外字段：

```text
gender, birthDate, avatar
```

这是已知契约漂移。后端当前 `ResumeCreate.resume_data` 使用裸 Dict，因此不会自动拒绝这些字段，但 `ResumeData` Pydantic Schema 未完整表达前端结构。

### target

```text
position
industry
company_type
jd_text
keywords[]
```

### work[]

```text
id
company
position
location
start_date
end_date
description
highlights[]
```

### projects[]

```text
id
name
role
start_date
end_date
description
highlights[]
technologies[]
```

### education[]

```text
id
school
degree
major
start_date
end_date
gpa
highlights[]
```

### skills[]

```text
category
items[]
```

### Extended Sections

前端定义了具体结构：

- Certificate：`id`, `name`, `issuer`, `date`
- Language：`id`, `name`, `level`
- Award：`id`, `title`, `issuer`, `date`, `description`
- CustomSection：`id`, `title`, `content`

后端当前对这些字段只使用 `Dict[str, Any]`，需要收敛。

## Frontend-Only Models

### ResumeCard

列表展示模型，不是后端领域模型：

```text
id, title, role, status, time, template, accent
```

### TemplateCard

当前前端 mock 展示模型：

```text
id, name, category, accent, dark?, tag?
```

后端模板元数据更丰富，两者尚未统一。

### AISettings

```text
providers[]
activeProviderId
defaultModel
temperature
maxTokens
```

`providers[].apiKey` 当前被 Zustand persist 保存到 `resume-workshop-storage`，设置页还写入 `resume-workshop-ai-settings`。该设计仅允许本地试验，服务器版必须迁移。

### Job and JobApplication

当前为前端 mock 业务模型，尚无后端表和 API。上线真实岗位能力前必须定义数据来源和许可。

## Integrity Gaps

- 没有数据库外键。
- 没有用户 ID 和资源归属。
- 时间使用字符串，未统一 UTC。
- `resume_data` 没有 Schema 版本。
- Pydantic 使用可变默认列表/对象，建议改为 `Field(default_factory=...)`。
- API 接受 `Dict`，未强制规范 ResumeData。
- 前后端类型手工维护且已经漂移。
- Setting 可以明文保存任意值。
- `cost_estimate` 应使用 Decimal/最小货币单位，而不是字符串。

## Target Migration

1. 定义 `resume_schema_version`。
2. 补齐 JSON Schema/OpenAPI。
3. 生成前端类型或加入契约测试。
4. 引入 Alembic。
5. 将时间改为 UTC DateTime。
6. 增加 users/files 和 `owner_id`。
7. 增加外键、索引、唯一约束和删除行为。
8. PostgreSQL 使用 JSONB 或版本化 JSON 文本。
9. Secret 从 settings 表迁移到 Secret Store。

