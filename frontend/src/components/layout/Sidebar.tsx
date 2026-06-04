import { Home, FileText, LayoutTemplate, Upload, Download, Bot, Settings, Plus, Briefcase } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../utils'

const navItems = [
  { to: '/', label: '首页', icon: Home },
  { to: '/resumes', label: '简历管理', icon: FileText },
  { to: '/templates', label: '模板中心', icon: LayoutTemplate },
  { to: '/jobs', label: '岗位推荐', icon: Briefcase },
  { to: '/import', label: '导入简历', icon: Upload },
  { to: '/exports', label: '导出记录', icon: Download },
  { to: '/ai', label: 'AI 工具箱', icon: Bot },
  { to: '/settings', label: '设置', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="sticky top-0 h-screen flex flex-col gap-[22px] p-[28px_22px] bg-white/92 border-r border-slate-200 box-border">
      <div className="flex items-center gap-2.5 text-slate-900 font-bold">
        <div className="w-[26px] h-[26px] flex items-center justify-center rounded-lg bg-blue-600 text-white text-sm">
          简
        </div>
        <span className="text-base">简历助手</span>
      </div>

      <NavLink
        to="/editor"
        className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 text-sm font-medium"
      >
        <Plus size={16} />
        新建简历
      </NavLink>

      <nav className="flex flex-col gap-[7px]">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-start h-10 px-3 rounded-lg text-sm transition-all duration-200',
                  isActive ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-500 hover:bg-slate-100'
                )
              }
            >
              <Icon size={16} />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-[34px] h-[34px] flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
            张
          </div>
          <div className="min-w-0">
            <strong className="block text-slate-900 text-sm">张三</strong>
            <span className="block truncate max-w-[145px] text-slate-400 text-xs">zhangsan@example.com</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
