import { useEffect } from 'react'
import { Plus, Upload, ChevronRight } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { ResumeCardItem } from '../components/resume/ResumeCardItem'
import { useResumeStore } from '../store/resumeStore'
import heroImage from '../assets/hero.png'

export function Dashboard() {
  const { resumes, loadResumes } = useResumeStore()

  useEffect(() => {
    loadResumes()
  }, [loadResumes])

  const recentResumes = resumes.slice(0, 4)

  return (
    <div className="p-[34px_38px]">
      <section className="border border-slate-200 rounded-lg bg-white/94 shadow-[0_18px_50px_rgba(15,23,42,0.04)] min-h-[318px] grid grid-cols-[1fr_410px] items-center p-[40px_56px] overflow-hidden">
        <div>
          <h1 className="text-[42px] font-extrabold text-slate-900 leading-[1.15] mb-3">让简历脱颖而出</h1>
          <p className="text-slate-500">AI 助力简历生成、优化与排版，打造更好的职业机会</p>
          <div className="flex gap-3.5 mt-7.5">
            <NavLink to="/editor" className="h-11 px-5 rounded-lg bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 flex items-center gap-2 text-sm font-medium">
              <Plus size={17} />
              新建简历
            </NavLink>
            <NavLink to="/import" className="h-11 px-5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 flex items-center gap-2 text-sm font-medium">
              <Upload size={17} />
              导入简历
            </NavLink>
          </div>
        </div>

        <div className="relative h-[250px] flex items-center justify-center overflow-hidden" aria-hidden="true">
          <img 
            src={heroImage} 
            alt="hero" 
            className="w-full h-full object-contain scale-[0.8]"
          />
        </div>
      </section>

      <section className="flex items-center justify-between gap-[18px] mt-[30px] mb-[18px]">
        <div>
          <h2 className="text-lg font-bold text-slate-900">最近简历</h2>
        </div>
        <NavLink to="/resumes" className="flex items-center gap-2 text-blue-600 text-sm hover:text-blue-700">
          全部
          <ChevronRight size={15} />
        </NavLink>
      </section>

      <div className="grid grid-cols-4 gap-[18px]">
        {recentResumes.map((resume) => (
          <ResumeCardItem key={resume.id} resume={resume} />
        ))}
      </div>
    </div>
  )
}
