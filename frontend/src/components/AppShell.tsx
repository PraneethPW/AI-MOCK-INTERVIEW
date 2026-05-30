import { Bell, LogOut, Menu, Search, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { navItems } from '../lib/data'

export function AppShell() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/auth/me').then((res) => setUser(res.data)).catch(() => navigate('/login'))
  }, [navigate])

  const logout = () => {
    localStorage.removeItem('vocavision_token')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-ink">
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-black/5 bg-white/90 p-5 shadow-card backdrop-blur-xl transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-ink text-mint">
            <Sparkles size={22} />
          </span>
          <span>
            <span className="block text-lg font-black">VocaVision AI</span>
            <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Interview OS</span>
          </span>
        </Link>

        <nav className="mt-9 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${isActive ? 'bg-ink text-white shadow-glow' : 'text-slate-600 hover:bg-slate-100 hover:text-ink'}`
              }
            >
              <item.icon size={19} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-5 left-5 right-5 rounded-lg bg-ink p-4 text-white">
          <p className="text-sm font-bold">AI credits</p>
          <p className="mt-1 text-xs text-white/65">OpenRouter usage this month</p>
          <div className="mt-4 h-2 rounded-full bg-white/10">
            <div className="h-full w-2/3 rounded-full bg-mint" />
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-black/5 bg-white/75 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button className="grid h-10 w-10 place-items-center rounded-lg border border-black/10 bg-white lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div className="hidden items-center gap-3 rounded-lg border border-black/10 bg-white px-4 py-2.5 md:flex">
              <Search size={18} className="text-slate-400" />
              <input className="w-72 border-0 bg-transparent text-sm outline-none" placeholder="Search candidates, roles, reports" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="grid h-10 w-10 place-items-center rounded-lg border border-black/10 bg-white" aria-label="Notifications">
              <Bell size={18} />
            </button>
            {user && (
              <div className="hidden text-right sm:block">
                <p className="text-sm font-black">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            )}
            <button onClick={logout} className="hidden items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-bold text-white sm:flex">
              <LogOut size={17} />
              Exit
            </button>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
