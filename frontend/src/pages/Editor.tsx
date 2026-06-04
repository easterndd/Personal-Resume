import { useState } from 'react'
import { Eye, Save, FileDown, Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '../components/common/Button'
import { EditorNav } from '../components/editor/EditorNav'
import { Field } from '../components/editor/Field'
import { AiSidePanel } from '../components/ai/AiSidePanel'
import { ResumeDocument } from '../components/resume/ResumeDocument'
import { useResumeStore } from '../store/resumeStore'
import type { ResumeWork, ResumeProject, ResumeEducation, ResumeSkill } from '../types'

export function Editor() {
  const [activeSection, setActiveSection] = useState('basics')
  const [scale, setScale] = useState(100)

  const {
    currentResumeData,
    updateBasics,
    updateTarget,
    updateSummary,
    addWork,
    updateWork,
    deleteWork,
    addProject,
    updateProject,
    deleteProject,
    addEducation,
    updateEducation,
    deleteEducation,
    updateSkills,
  } = useResumeStore()

  const { work, projects, education, skills } = currentResumeData

  const handleScaleChange = (delta: number) => {
    const newScale = Math.max(50, Math.min(150, scale + delta))
    setScale(newScale)
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'basics':
        return (
          <>
            <h2 className="text-lg font-bold text-slate-900 mb-4.5">基本信息</h2>
            <div className="grid grid-cols-[1fr_112px] gap-[18px]">
              <div className="space-y-0">
                <Field label="姓名">
                  <input
                    className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                    value={currentResumeData.basics.name}
                    onChange={(e) => updateBasics({ name: e.target.value })}
                  />
                </Field>
                <Field label="性别">
                  <select
                    className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none appearance-none"
                    value={currentResumeData.basics.gender || '男'}
                    onChange={(e) => updateBasics({ gender: e.target.value })}
                  >
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </Field>
                <Field label="出生年月">
                  <input
                    type="date"
                    className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                    value={currentResumeData.basics.birthDate}
                    onChange={(e) => updateBasics({ birthDate: e.target.value })}
                  />
                </Field>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-[92px] h-[112px] flex items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-extrabold text-[28px]">
                  {currentResumeData.basics.name?.charAt(0) || '张'}
                </div>
                <button className="h-8.5 px-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors">
                  更换照片
                </button>
              </div>
            </div>
            <Field label="手机">
              <input
                className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                value={currentResumeData.basics.phone}
                onChange={(e) => updateBasics({ phone: e.target.value })}
              />
            </Field>
            <Field label="邮箱">
              <input
                className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                value={currentResumeData.basics.email}
                onChange={(e) => updateBasics({ email: e.target.value })}
              />
            </Field>
            <Field label="地址">
              <input
                className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                value={currentResumeData.basics.location}
                onChange={(e) => updateBasics({ location: e.target.value })}
              />
            </Field>
            <Field label="网站">
              <input
                className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                value={currentResumeData.basics.website}
                onChange={(e) => updateBasics({ website: e.target.value })}
              />
            </Field>
            <Field label="LinkedIn">
              <input
                className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                value={currentResumeData.basics.linkedin}
                onChange={(e) => updateBasics({ linkedin: e.target.value })}
              />
            </Field>
            <Field label="GitHub">
              <input
                className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                value={currentResumeData.basics.github}
                onChange={(e) => updateBasics({ github: e.target.value })}
              />
            </Field>
          </>
        )

      case 'target':
        return (
          <>
            <h2 className="text-lg font-bold text-slate-900 mb-4.5">求职意向</h2>
            <Field label="目标岗位">
              <input
                className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                value={currentResumeData.target.position}
                onChange={(e) => updateTarget({ position: e.target.value })}
              />
            </Field>
            <Field label="目标行业">
              <input
                className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                value={currentResumeData.target.industry}
                onChange={(e) => updateTarget({ industry: e.target.value })}
              />
            </Field>
            <Field label="公司类型">
              <select
                className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none appearance-none"
                value={currentResumeData.target.company_type}
                onChange={(e) => updateTarget({ company_type: e.target.value })}
              >
                <option value="">请选择</option>
                <option value="互联网">互联网</option>
                <option value="金融">金融</option>
                <option value="国企">国企</option>
                <option value="外企">外企</option>
                <option value="创业公司">创业公司</option>
              </select>
            </Field>
            <Field label="岗位描述 (JD)">
              <textarea
                className="min-h-[112px] p-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none resize-y leading-[1.65]"
                value={currentResumeData.target.jd_text}
                onChange={(e) => updateTarget({ jd_text: e.target.value })}
              />
            </Field>
          </>
        )

      case 'summary':
        return (
          <>
            <h2 className="text-lg font-bold text-slate-900 mb-4.5">自我评价</h2>
            <Field label="个人简介">
              <textarea
                className="min-h-[112px] p-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none resize-y leading-[1.65]"
                value={currentResumeData.summary}
                onChange={(e) => updateSummary(e.target.value)}
              />
            </Field>
          </>
        )

      case 'work':
        return (
          <>
            <div className="flex items-center justify-between mb-4.5">
              <h2 className="text-lg font-bold text-slate-900">工作经历</h2>
              <Button onClick={addWork} variant="secondary" size="small">
                <Plus size={16} />
                添加经历
              </Button>
            </div>
            <div className="space-y-4">
              {work.length > 0 ? (
                work.map((item: ResumeWork) => (
                  <div key={item.id} className="border border-slate-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center gap-2 mb-3">
                      <GripVertical className="text-slate-400" size={16} />
                      <span className="text-slate-600 text-sm font-medium">工作经历 {work.indexOf(item) + 1}</span>
                      <button onClick={() => deleteWork(item.id)} className="ml-auto text-red-500 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <Field label="公司名称">
                      <input
                        className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                        value={item.company}
                        onChange={(e) => updateWork(item.id, { company: e.target.value })}
                      />
                    </Field>
                    <Field label="职位名称">
                      <input
                        className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                        value={item.position}
                        onChange={(e) => updateWork(item.id, { position: e.target.value })}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="开始时间">
                        <input
                          type="date"
                          className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                          value={item.start_date}
                          onChange={(e) => updateWork(item.id, { start_date: e.target.value })}
                        />
                      </Field>
                      <Field label="结束时间">
                        <input
                          type="date"
                          className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                          value={item.end_date}
                          onChange={(e) => updateWork(item.id, { end_date: e.target.value })}
                        />
                      </Field>
                    </div>
                    <Field label="工作描述">
                      <textarea
                        className="min-h-[112px] p-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none resize-y leading-[1.65]"
                        value={item.description}
                        onChange={(e) => updateWork(item.id, { description: e.target.value })}
                      />
                    </Field>
                    <Field label="工作亮点">
                      <textarea
                        className="min-h-[112px] p-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none resize-y leading-[1.65]"
                        placeholder="每行一个亮点，支持多条"
                        value={item.highlights.join('\n')}
                        onChange={(e) => updateWork(item.id, { highlights: e.target.value.split('\n').filter(Boolean) })}
                      />
                    </Field>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <p>暂无工作经历，点击上方按钮添加</p>
                </div>
              )}
            </div>
          </>
        )

      case 'projects':
        return (
          <>
            <div className="flex items-center justify-between mb-4.5">
              <h2 className="text-lg font-bold text-slate-900">项目经历</h2>
              <Button onClick={addProject} variant="secondary" size="small">
                <Plus size={16} />
                添加项目
              </Button>
            </div>
            <div className="space-y-4">
              {projects.length > 0 ? (
                projects.map((item: ResumeProject) => (
                  <div key={item.id} className="border border-slate-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center gap-2 mb-3">
                      <GripVertical className="text-slate-400" size={16} />
                      <span className="text-slate-600 text-sm font-medium">项目 {projects.indexOf(item) + 1}</span>
                      <button onClick={() => deleteProject(item.id)} className="ml-auto text-red-500 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <Field label="项目名称">
                      <input
                        className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                        value={item.name}
                        onChange={(e) => updateProject(item.id, { name: e.target.value })}
                      />
                    </Field>
                    <Field label="担任角色">
                      <input
                        className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                        value={item.role}
                        onChange={(e) => updateProject(item.id, { role: e.target.value })}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="开始时间">
                        <input
                          type="date"
                          className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                          value={item.start_date}
                          onChange={(e) => updateProject(item.id, { start_date: e.target.value })}
                        />
                      </Field>
                      <Field label="结束时间">
                        <input
                          type="date"
                          className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                          value={item.end_date}
                          onChange={(e) => updateProject(item.id, { end_date: e.target.value })}
                        />
                      </Field>
                    </div>
                    <Field label="项目描述">
                      <textarea
                        className="min-h-[112px] p-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none resize-y leading-[1.65]"
                        value={item.description}
                        onChange={(e) => updateProject(item.id, { description: e.target.value })}
                      />
                    </Field>
                    <Field label="项目亮点">
                      <textarea
                        className="min-h-[112px] p-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none resize-y leading-[1.65]"
                        placeholder="每行一个亮点，支持多条"
                        value={item.highlights.join('\n')}
                        onChange={(e) => updateProject(item.id, { highlights: e.target.value.split('\n').filter(Boolean) })}
                      />
                    </Field>
                    <Field label="技术栈">
                      <input
                        className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                        placeholder="用逗号分隔多个技术"
                        value={item.technologies.join(', ')}
                        onChange={(e) => updateProject(item.id, { technologies: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
                      />
                    </Field>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <p>暂无项目经历，点击上方按钮添加</p>
                </div>
              )}
            </div>
          </>
        )

      case 'education':
        return (
          <>
            <div className="flex items-center justify-between mb-4.5">
              <h2 className="text-lg font-bold text-slate-900">教育背景</h2>
              <Button onClick={addEducation} variant="secondary" size="small">
                <Plus size={16} />
                添加学历
              </Button>
            </div>
            <div className="space-y-4">
              {education.length > 0 ? (
                education.map((item: ResumeEducation) => (
                  <div key={item.id} className="border border-slate-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center gap-2 mb-3">
                      <GripVertical className="text-slate-400" size={16} />
                      <span className="text-slate-600 text-sm font-medium">学历 {education.indexOf(item) + 1}</span>
                      <button onClick={() => deleteEducation(item.id)} className="ml-auto text-red-500 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <Field label="学校名称">
                      <input
                        className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                        value={item.school}
                        onChange={(e) => updateEducation(item.id, { school: e.target.value })}
                      />
                    </Field>
                    <Field label="学历">
                      <select
                        className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none appearance-none"
                        value={item.degree}
                        onChange={(e) => updateEducation(item.id, { degree: e.target.value })}
                      >
                        <option value="">请选择</option>
                        <option value="高中">高中</option>
                        <option value="专科">专科</option>
                        <option value="本科">本科</option>
                        <option value="硕士">硕士</option>
                        <option value="博士">博士</option>
                      </select>
                    </Field>
                    <Field label="专业">
                      <input
                        className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                        value={item.major}
                        onChange={(e) => updateEducation(item.id, { major: e.target.value })}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="开始时间">
                        <input
                          type="date"
                          className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                          value={item.start_date}
                          onChange={(e) => updateEducation(item.id, { start_date: e.target.value })}
                        />
                      </Field>
                      <Field label="结束时间">
                        <input
                          type="date"
                          className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                          value={item.end_date}
                          onChange={(e) => updateEducation(item.id, { end_date: e.target.value })}
                        />
                      </Field>
                    </div>
                    <Field label="GPA">
                      <input
                        className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                        placeholder="如：3.8/4.0"
                        value={item.gpa}
                        onChange={(e) => updateEducation(item.id, { gpa: e.target.value })}
                      />
                    </Field>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <p>暂无教育背景，点击上方按钮添加</p>
                </div>
              )}
            </div>
          </>
        )

      case 'skills':
        return (
          <>
            <h2 className="text-lg font-bold text-slate-900 mb-4.5">技能特长</h2>
            <div className="space-y-4">
              {skills.map((skill: ResumeSkill, skillIndex: number) => (
                <div key={skillIndex} className="border border-slate-200 rounded-lg p-4 bg-white">
                  <Field label="技能分类">
                    <input
                      className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
                      value={skill.category}
                      onChange={(e) => {
                        const newSkills = [...skills]
                        newSkills[skillIndex] = { ...newSkills[skillIndex], category: e.target.value }
                        updateSkills(newSkills)
                      }}
                    />
                  </Field>
                  <Field label="技能列表">
                    <textarea
                      className="min-h-[112px] p-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none resize-y leading-[1.65]"
                      placeholder="每行一个技能，支持多条"
                      value={skill.items.join('\n')}
                      onChange={(e) => {
                        const newSkills = [...skills]
                        newSkills[skillIndex] = { ...newSkills[skillIndex], items: e.target.value.split('\n').filter(Boolean) }
                        updateSkills(newSkills)
                      }}
                    />
                  </Field>
                </div>
              ))}
              <Button onClick={() => updateSkills([...skills, { category: '', items: [] }])} variant="secondary" size="small">
                <Plus size={16} />
                添加技能分类
              </Button>
            </div>
          </>
        )

      case 'certs':
        return (
          <>
            <h2 className="text-lg font-bold text-slate-900 mb-4.5">证书荣誉</h2>
            <div className="text-center py-12 text-slate-400">
              <p>暂无证书荣誉，后续版本添加</p>
            </div>
          </>
        )

      case 'extra':
        return (
          <>
            <h2 className="text-lg font-bold text-slate-900 mb-4.5">附加信息</h2>
            <div className="text-center py-12 text-slate-400">
              <p>暂无附加信息，后续版本添加</p>
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen grid grid-rows-[64px_1fr]">
      <header className="flex items-center justify-between px-6 border-b border-slate-200 bg-white">
        <div>
          <strong className="text-slate-900 mr-3.5">产品经理简历</strong>
          <span className="text-slate-400 text-xs">最近保存 14:30</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="small">
            <Eye size={16} />
            预览
          </Button>
          <Button variant="secondary" size="small">
            <Save size={16} />
            保存
          </Button>
          <Button variant="primary" size="compact">
            <FileDown size={16} />
            导出
          </Button>
        </div>
      </header>

      <div className="min-h-0 grid grid-cols-[190px_minmax(290px,390px)_minmax(470px,1fr)_260px] gap-[18px] p-6">
        <EditorNav activeSection={activeSection} onSectionChange={setActiveSection} />

        <section className="border border-slate-200 rounded-lg bg-white p-5 overflow-y-auto">
          {renderSection()}
        </section>

        <section className="relative min-h-[760px] flex justify-center overflow-auto p-[42px_24px_74px] bg-slate-50">
          <div style={{ transform: `scale(${scale / 100})`, transformOrigin: 'top center' }}>
            <ResumeDocument />
          </div>
          <div className="absolute right-6 bottom-[18px] h-10.5 flex items-center gap-2.5 px-3 border border-slate-200 rounded-xl bg-white/92 text-slate-500 shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" onClick={() => handleScaleChange(-10)} aria-label="缩小">
              -
            </button>
            <span className="text-sm font-medium">{scale}%</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" onClick={() => handleScaleChange(10)} aria-label="放大">
              +
            </button>
            <Button variant="secondary" size="small">自动一页</Button>
          </div>
        </section>

        <AiSidePanel />
      </div>
    </div>
  )
}
