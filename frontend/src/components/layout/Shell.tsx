import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function Shell() {
  return (
    <main className="min-h-screen grid grid-cols-[232px_1fr] bg-[#f5f7fb]">
      <Sidebar />
      <section className="min-w-0">
        <Outlet />
      </section>
    </main>
  )
}
