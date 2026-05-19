import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useBrandKitStore } from '../store'
import { Building2, Briefcase, User, Rocket, Check, ArrowRight, ChevronRight } from 'lucide-react'
import { LogoMark, LogoWordmark } from './Logo'

const BRAND_COLORS = [
  '#7c3aed', '#2563eb', '#0891b2', '#059669',
  '#d97706', '#ea580c', '#dc2626', '#db2777',
]

const ROLES = [
  { id: 'inhouse',  label: 'In-house HR',          sub: 'I hire for my company',          icon: Building2 },
  { id: 'agency',   label: 'Recruitment Agency',    sub: 'I hire for multiple clients',    icon: Briefcase },
  { id: 'solo',     label: 'Solo recruiter',        sub: 'Independent / freelance',        icon: User },
  { id: 'founder',  label: 'Founder / Owner',       sub: 'I wear all the hats',            icon: Rocket },
]

const PLATFORMS = [
  { id: 'facebook',  label: 'Facebook',   color: '#1877F2' },
  { id: 'instagram', label: 'Instagram',  color: '#E1306C' },
  { id: 'linkedin',  label: 'LinkedIn',   color: '#0A66C2' },
  { id: 'tiktok',    label: 'TikTok',     color: '#010101' },
  { id: 'youtube',   label: 'YouTube',    color: '#FF0000' },
  { id: 'snapchat',  label: 'Snapchat',   color: '#FFFC00' },
]

const STEPS = ['Brand', 'Role', 'Platforms']

export default function FirstRunOnboarding({ onDone }) {
  const user = useAuthStore(s => s.user)
  const { setCompany, setBrandColor, setLogoUrl } = useBrandKitStore()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)

  // Step 0 — brand
  const [company, setCompanyLocal] = useState(user?.name || '')
  const [brandColor, setBrandColorLocal] = useState('#7c3aed')
  const [logoUrl, setLogoUrlLocal] = useState('')

  // Step 1 — role
  const [role, setRole] = useState(null)

  // Step 2 — platforms
  const [platforms, setPlatforms] = useState(new Set(['facebook', 'instagram', 'linkedin']))

  function togglePlatform(id) {
    setPlatforms(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function finish() {
    // Persist brand kit
    setCompany(company)
    setBrandColor(brandColor)
    if (logoUrl.trim()) setLogoUrl(logoUrl.trim())

    // Persist role + platforms to localStorage
    if (role) localStorage.setItem('hireads_role', role)
    localStorage.setItem('hireads_platforms', JSON.stringify([...platforms]))

    // Mark onboarded
    localStorage.setItem('hireads_onboarded', '1')

    setDone(true)
  }

  function handleCTA() {
    onDone()
    navigate('/ads')
  }

  function skip() {
    localStorage.setItem('hireads_onboarded', '1')
    onDone()
  }

  const progress = ((step) / STEPS.length) * 100

  // ── Done screen ──────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-theme-bg">
        <div className="text-center max-w-sm px-6">
          <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-6 animate-scale-in">
            <Check size={36} className="text-green-400" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold mb-2">You're all set!</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text2)' }}>
            Your brand is saved. Time to create your first job ad.
          </p>
          <button
            onClick={handleCTA}
            className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 text-[15px]"
            style={{ background: brandColor }}
          >
            Create your first ad <ArrowRight size={18} />
          </button>
          <button onClick={() => { onDone(); navigate('/dashboard') }} className="mt-3 text-sm text-theme-muted hover:text-theme-text2 transition-colors">
            Go to dashboard →
          </button>
        </div>
      </div>
    )
  }

  // ── Wizard ───────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-theme-bg overflow-y-auto">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-theme-bdr shrink-0">
        <div className="flex items-center gap-2">
          <LogoMark size={24} />
          <LogoWordmark style={{ fontSize: '1rem' }} />
        </div>
        <button onClick={skip} className="text-xs text-theme-muted hover:text-theme-text2 transition-colors">
          Skip setup
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-theme-bdr shrink-0">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, background: brandColor }}
        />
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 pt-8 pb-2 shrink-0">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${i === step ? 'text-theme-text' : i < step ? 'text-green-400' : 'text-theme-muted'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${i === step ? 'text-white' : i < step ? 'bg-green-500/20 text-green-400' : 'bg-theme-elevated text-theme-muted'}`}
                style={i === step ? { background: brandColor } : {}}>
                {i < step ? <Check size={10} strokeWidth={3} /> : i + 1}
              </div>
              <span className="hidden sm:inline">{s}</span>
            </div>
            {i < STEPS.length - 1 && <ChevronRight size={12} className="text-theme-muted" />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-lg">

          {/* ── Step 0: Brand ── */}
          {step === 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: brandColor }}>Step 1 of 3</p>
              <h1 className="text-2xl font-bold mb-1">Set up your brand</h1>
              <p className="text-sm mb-8" style={{ color: 'var(--text2)' }}>
                This pre-fills every ad you create — change it any time in Account settings.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="label">Company or brand name</label>
                  <input
                    autoFocus
                    className="input"
                    placeholder="e.g. Acme Corp"
                    value={company}
                    onChange={e => setCompanyLocal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && setStep(1)}
                  />
                </div>

                <div>
                  <label className="label">Brand color</label>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {BRAND_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setBrandColorLocal(c)}
                        className="w-9 h-9 rounded-lg transition-transform hover:scale-110 relative"
                        style={{ background: c }}
                      >
                        {brandColor === c && (
                          <Check size={14} className="text-white absolute inset-0 m-auto" strokeWidth={3} />
                        )}
                      </button>
                    ))}
                    {/* Custom color */}
                    <label className="w-9 h-9 rounded-lg border-2 border-dashed border-theme-bdr2 flex items-center justify-center cursor-pointer hover:border-theme-muted transition-colors relative overflow-hidden" title="Custom color">
                      <span className="text-theme-muted text-[11px]">+</span>
                      <input
                        type="color"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        value={brandColor}
                        onChange={e => setBrandColorLocal(e.target.value)}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="label">Logo URL <span className="text-theme-muted font-normal">(optional)</span></label>
                  <input
                    className="input"
                    placeholder="https://yourcompany.com/logo.png"
                    value={logoUrl}
                    onChange={e => setLogoUrlLocal(e.target.value)}
                  />
                  <p className="text-[11px] mt-1.5" style={{ color: 'var(--muted)' }}>
                    PNG or SVG on a transparent background works best.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setStep(1)}
                disabled={!company.trim()}
                className="mt-8 w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity"
                style={{ background: brandColor }}
              >
                Continue <ArrowRight size={17} />
              </button>
            </div>
          )}

          {/* ── Step 1: Role ── */}
          {step === 1 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: brandColor }}>Step 2 of 3</p>
              <h1 className="text-2xl font-bold mb-1">What describes you best?</h1>
              <p className="text-sm mb-8" style={{ color: 'var(--text2)' }}>
                Helps us tailor your experience and default settings.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(r => {
                  const Icon = r.icon
                  const active = role === r.id
                  return (
                    <button
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${active ? 'border-current' : 'border-theme-bdr2 hover:border-theme-muted'}`}
                      style={active ? { borderColor: brandColor, background: brandColor + '12' } : {}}
                    >
                      <Icon size={22} className="mb-3" style={active ? { color: brandColor } : { color: 'var(--text2)' }} />
                      <p className="font-semibold text-sm">{r.label}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>{r.sub}</p>
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(0)} className="py-3 px-5 rounded-xl font-medium text-sm border border-theme-bdr2 hover:bg-theme-elevated transition-colors">
                  Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                  style={{ background: brandColor }}
                >
                  Continue <ArrowRight size={17} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Platforms ── */}
          {step === 2 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: brandColor }}>Step 3 of 3</p>
              <h1 className="text-2xl font-bold mb-1">Where do you post jobs?</h1>
              <p className="text-sm mb-8" style={{ color: 'var(--text2)' }}>
                Select all that apply — we'll show you the right previews and formats.
              </p>

              <div className="grid grid-cols-3 gap-3">
                {PLATFORMS.map(p => {
                  const active = platforms.has(p.id)
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={`relative py-4 px-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${active ? 'border-current' : 'border-theme-bdr2 hover:border-theme-muted'}`}
                      style={active ? { borderColor: p.color, background: p.color + '14' } : {}}
                    >
                      {active && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: p.color }}>
                          <Check size={9} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-black text-white" style={{ background: p.color === '#FFFC00' ? '#000' : p.color }}>
                        {p.label[0]}
                      </div>
                      <span className="text-xs font-medium">{p.label}</span>
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(1)} className="py-3 px-5 rounded-xl font-medium text-sm border border-theme-bdr2 hover:bg-theme-elevated transition-colors">
                  Back
                </button>
                <button
                  onClick={finish}
                  disabled={platforms.size === 0}
                  className="flex-1 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity"
                  style={{ background: brandColor }}
                >
                  Finish setup <ArrowRight size={17} />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
