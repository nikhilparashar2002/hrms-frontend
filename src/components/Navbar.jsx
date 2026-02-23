import { NavLink, Link } from 'react-router-dom'
import { useState } from 'react'
import { LayoutDashboard, Users, CalendarDays, Menu, X, Building2 } from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employees', label: 'Employees', icon: Users },
  { to: '/attendance', label: 'Attendance', icon: CalendarDays },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Building2 size={16} className="text-white" />
            </div>
            <span className="font-bold text-zinc-900 text-base">
              HRMS <span className="text-brand-600">Lite</span>
            </span>
          </Link>

          {/* desktop nav */}
          <nav className="hidden sm:flex items-center gap-0.5">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                  }`
                }
              >
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-lg text-zinc-500 hover:bg-zinc-100"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-zinc-100 bg-white px-4 py-3 flex flex-col gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  )
}
