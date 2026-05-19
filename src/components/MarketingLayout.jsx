import { Link, NavLink } from 'react-router-dom'
import { LogoMark, LogoWordmark } from './Logo'
import { useAuthStore } from '../store'

const productLinks = [
  { to: '/product/job-ad-creator', label: 'Job Ad Creator' },
  { to: '/product/ai-copy', label: 'AI Copy (Anti-ban)' },
  { to: '/product/lead-ads', label: 'Lead Ads Flow' },
  { to: '/product/ats', label: 'Free ATS' },
  { to: '/product/campaigns', label: 'Multi-Platform Campaigns' },
  { to: '/product/targeting', label: 'Targeting' },
]

const resourceLinks = [
  { to: '/knowledge', label: 'Knowledge Base' },
  { to: '/blog', label: 'Blog' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

const legalLinks = [
  { to: '/legal/terms', label: 'Terms of Service' },
  { to: '/legal/privacy', label: 'Privacy Policy' },
]

export default function MarketingLayout({ children }) {
  const user = useAuthStore(s => s.user)

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-theme-bg/85 backdrop-blur border-b border-theme-bdr">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <LogoMark size={28} />
            <LogoWordmark style={{ fontSize: '1.15rem' }} />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <DropdownNav label="Product" items={productLinks} />
            <NavLink to="/knowledge" className={({isActive}) => `hover:text-theme-text transition-colors ${isActive ? 'text-theme-text' : 'text-theme-text2'}`}>Knowledge</NavLink>
            <NavLink to="/blog" className={({isActive}) => `hover:text-theme-text transition-colors ${isActive ? 'text-theme-text' : 'text-theme-text2'}`}>Blog</NavLink>
            <NavLink to="/about" className={({isActive}) => `hover:text-theme-text transition-colors ${isActive ? 'text-theme-text' : 'text-theme-text2'}`}>About</NavLink>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard" className="btn-primary text-sm">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="text-sm text-theme-text2 hover:text-theme-text">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm">Start free</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-theme-bdr mt-20 bg-theme-surface">
        <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <LogoMark size={26} />
              <LogoWordmark style={{ fontSize: '1.05rem' }} />
            </Link>
            <p className="text-theme-text2 max-w-xs leading-relaxed">
              Performance recruitment ads on every major platform, with a free ATS and AI copy that won't get banned.
            </p>
          </div>
          <FooterCol title="Product" items={productLinks} />
          <FooterCol title="Resources" items={resourceLinks} />
          <FooterCol title="Legal" items={legalLinks} />
        </div>
        <div className="border-t border-theme-bdr">
          <div className="max-w-6xl mx-auto px-6 py-5 text-xs text-theme-muted flex flex-wrap justify-between gap-3">
            <span>© {new Date().getFullYear()} HireAds. All rights reserved.</span>
            <span>Made for modern recruiters · VAT-free B2B invoicing in PLN</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FooterCol({ title, items }) {
  return (
    <div>
      <p className="font-semibold mb-3 text-theme-text">{title}</p>
      <ul className="space-y-2">
        {items.map(i => (
          <li key={i.to}>
            <Link to={i.to} className="text-theme-text2 hover:text-theme-text transition-colors">{i.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function DropdownNav({ label, items }) {
  return (
    <div className="relative group">
      <button className="text-theme-text2 group-hover:text-theme-text transition-colors">{label}</button>
      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
        <div className="bg-theme-card border border-theme-bdr rounded-xl shadow-xl p-2 min-w-[240px]">
          {items.map(i => (
            <Link
              key={i.to}
              to={i.to}
              className="block px-3 py-2 rounded-lg text-sm text-theme-text2 hover:text-theme-text hover:bg-theme-elevated transition-colors"
            >
              {i.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
