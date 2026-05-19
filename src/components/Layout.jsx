import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore, useThemeStore } from '../store'
import ChatBot from './ChatBot'
import FirstRunOnboarding from './FirstRunOnboarding'
import {
  LayoutDashboard, Image, Megaphone, LogOut, Menu, X, Crown, UserCircle, BarChart2, Sun, Moon, Users
} from 'lucide-react'
import { LogoMark, LogoWordmark } from './Logo'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
  { to: '/ads', label: 'Job Ads', icon: <Image size={17} /> },
  { to: '/campaigns', label: 'Campaigns', icon: <Megaphone size={17} /> },
  { to: '/ats', label: 'ATS', icon: <Users size={17} /> },
  { to: '/account', label: 'Account', icon: <UserCircle size={17} /> },
]

export default function Layout({ children }) {
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { dark, toggle } = useThemeStore()
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('hireads_onboarded')
  )

  // Keep html class in sync with store
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  function handleLogout() {
    logout()
    navigate('/')
  }

  if (showOnboarding) {
    return <FirstRunOnboarding onDone={() => setShowOnboarding(false)} />
  }

  return (
    <div className="min-h-screen flex bg-theme-bg">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-56 bg-theme-surface border-r border-theme-bdr flex flex-col
        transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex
      `}>
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-theme-bdr gap-2.5">
          <LogoMark size={26} />
          <LogoWordmark style={{ fontSize: '1.05rem' }} />
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-theme-muted">
            <X size={17} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-purple-600/15 text-purple-500 dark:text-purple-300 font-medium'
                    : 'text-theme-text2 hover:bg-theme-elevated hover:text-theme-text'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
          {user?.isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors mt-2 ${
                  isActive
                    ? 'bg-red-600/15 text-red-500 font-medium'
                    : 'text-red-500/70 hover:bg-red-600/10 hover:text-red-500'
                }`
              }
            >
              <BarChart2 size={17} />
              Analytics
            </NavLink>
          )}
        </nav>

        {/* User + theme toggle */}
        <div className="p-3 border-t border-theme-bdr space-y-1">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-theme-text2 hover:bg-theme-elevated hover:text-theme-text transition-colors"
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <Sun size={14} /> : <Moon size={14} />}
            <span className="text-xs">{dark ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
            <div className="w-7 h-7 rounded-full bg-purple-600/20 text-purple-500 dark:text-purple-400 flex items-center justify-center text-xs font-bold uppercase shrink-0">
              {user?.name?.[0] || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">{user?.name}</p>
              <div className="flex items-center gap-1">
                {user?.plan === 'paid' ? (
                  <span className="text-[10px] text-purple-500 dark:text-purple-300 flex items-center gap-0.5"><Crown size={9} /> Pro</span>
                ) : (
                  <span className="text-[10px] text-theme-muted">Free plan</span>
                )}
              </div>
            </div>
            <button onClick={handleLogout} title="Log out" className="text-theme-muted hover:text-theme-text transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="h-14 border-b border-theme-bdr bg-theme-surface flex items-center px-4 gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-theme-text2">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <LogoMark size={22} />
            <LogoWordmark style={{ fontSize: '0.95rem' }} />
          </div>
          <button onClick={toggle} className="ml-auto text-theme-text2 hover:text-theme-text" title="Toggle theme">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      <ChatBot />
    </div>
  )
}
