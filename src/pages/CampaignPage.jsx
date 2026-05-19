import { useState } from 'react'
import { useAuthStore, useAdStore, useCampaignStore } from '../store'
import { PLATFORMS, MIN_SPEND_PLN, COMMISSION_RATE, AGE_RANGES, GENDERS, SENIORITY_LEVELS, JOB_INTERESTS, DEVICES, PLATFORM_TARGETING } from '../constants'
import { formatPLN, callN8nAction } from '../utils'
import {
  Crown, Megaphone, Check, Loader2, CheckCircle2,
  Target, Users, MapPin, Briefcase, Smartphone, ChevronDown, ChevronUp,
  CreditCard, Info, ShieldCheck, Building2, Image as ImageIcon, Lightbulb,
} from 'lucide-react'

const STEPS = ['Select Ad', 'Platforms & Budget', 'Audience', 'Review & Pay']

// ── Budget advisor ─────────────────────────────────────────────────────────────
// Daily minimums per platform in PLN (realistic floor for job ads)
const PLATFORM_DAILY_MIN = {
  facebook:  15,
  instagram: 15,
  tiktok:    20,
  snapchat:  20,
  youtube:   25,
  linkedin:  45,
}

const PLATFORM_LABELS = {
  facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok',
  snapchat: 'Snapchat', youtube: 'YouTube', linkedin: 'LinkedIn',
}

// Cheapest first; LinkedIn last (most expensive, premium targeting)
const PLATFORM_PRIORITY = ['facebook', 'instagram', 'tiktok', 'snapchat', 'youtube', 'linkedin']

function getBudgetPlan(budget) {
  const IDEAL_DAYS = 14
  const MIN_DAYS = 7

  // Greedily pack platforms at ideal duration
  const platforms = []
  let remaining = budget
  for (const p of PLATFORM_PRIORITY) {
    const cost = PLATFORM_DAILY_MIN[p] * IDEAL_DAYS
    if (remaining >= cost) { platforms.push(p); remaining -= cost }
  }

  // If nothing fits at 14 days, try minimum duration
  if (platforms.length === 0) {
    for (const p of PLATFORM_PRIORITY) {
      const cost = PLATFORM_DAILY_MIN[p] * MIN_DAYS
      if (remaining >= cost) { platforms.push(p); break }
    }
  }

  if (platforms.length === 0) return null

  const totalDaily = platforms.reduce((s, p) => s + PLATFORM_DAILY_MIN[p], 0)
  const days = Math.min(30, Math.floor(budget / totalDaily))
  const perPlatform = Math.floor(budget / platforms.length)

  return { platforms, days, totalDaily, perPlatform }
}

function BudgetAdvisor({ budget, onApply }) {
  const plan = getBudgetPlan(budget)
  if (!plan) return (
    <div className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
      ⚠️ Budget too low for any platform. Minimum ~{MIN_SPEND_PLN * 1} PLN recommended.
    </div>
  )

  return (
    <div className="bg-purple-600/5 border border-purple-500/20 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium text-purple-300">
          <Lightbulb size={14} className="text-purple-400" /> Budget Advisor
        </div>
        <button
          onClick={() => onApply(plan.platforms)}
          className="text-[11px] bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 px-2.5 py-1 rounded-full transition-colors"
        >
          Apply suggestion →
        </button>
      </div>

      <p className="text-xs text-gray-400">
        With <span className="text-white font-semibold">{formatPLN(budget)}</span> you can run{' '}
        <span className="text-purple-300 font-semibold">{plan.platforms.length} platform{plan.platforms.length !== 1 ? 's' : ''}</span>{' '}
        for ~<span className="text-purple-300 font-semibold">{plan.days} days</span>:
      </p>

      <div className="grid grid-cols-2 gap-2">
        {plan.platforms.map(p => (
          <div key={p} className="flex items-center justify-between bg-theme-elevated rounded-lg px-3 py-2 text-xs">
            <span className="font-medium text-gray-300">{PLATFORM_LABELS[p]}</span>
            <span className="text-gray-500">{formatPLN(PLATFORM_DAILY_MIN[p])}/day</span>
          </div>
        ))}
      </div>

      {budget >= 2000 && (
        <p className="text-[11px] text-green-400 bg-green-500/10 rounded-lg px-3 py-2">
          ✓ Great budget — LinkedIn included for premium professional targeting
        </p>
      )}
      {budget < 300 && (
        <p className="text-[11px] text-yellow-400 bg-yellow-500/10 rounded-lg px-3 py-2">
          Tip: increasing to 300+ PLN unlocks a second platform and longer duration
        </p>
      )}
    </div>
  )
}

// ── HireAds explanation panel ──────────────────────────────────────────────────
function HireAdsInfoPanel() {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-blue-600/5 border border-blue-500/20 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-sm"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2 text-blue-300 font-medium">
          <Building2 size={16} />
          How do HireAds campaigns work?
        </div>
        {open ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 text-sm text-gray-400 border-t border-blue-500/10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            {[
              {
                icon: <ShieldCheck size={18} className="text-blue-400" />,
                title: 'Run from our accounts',
                desc: 'Your ads run from verified HireAds business accounts — no ad account setup required. We handle all platform compliance and policies.',
              },
              {
                icon: <Users size={18} className="text-purple-400" />,
                title: 'Your brand shown',
                desc: "Your company name, logo, and creative are always prominent. Viewers see your brand — HireAds is invisible behind the scenes.",
              },
              {
                icon: <CreditCard size={18} className="text-green-400" />,
                title: 'Simple flat fee',
                desc: 'You pay the ad spend + 7% management fee. We invoice you VAT-free in PLN. Payment via Stripe — Visa, Mastercard, SEPA, BLIK.',
              },
            ].map(item => (
              <div key={item.title} className="flex flex-col gap-2">
                <div className="w-8 h-8 rounded-lg bg-theme-elevated flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <p className="font-medium text-theme-text">{item.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Targeting step ─────────────────────────────────────────────────────────────
function TargetingStep({ targeting, setTargeting, selectedPlatforms }) {
  const supportedFeatures = new Set(
    selectedPlatforms.flatMap(p => PLATFORM_TARGETING[p] || [])
  )

  function toggle(key, value) {
    setTargeting(prev => {
      const arr = prev[key] || []
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      }
    })
  }

  function setOne(key, value) {
    setTargeting(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <Target size={18} className="text-purple-400" />
        <h2 className="font-semibold">Audience Targeting</h2>
      </div>
      <p className="text-xs text-gray-500 -mt-3">
        Settings apply across all selected platforms. Options vary by platform — unsupported settings are skipped automatically.
      </p>

      {/* Age */}
      {supportedFeatures.has('age') && (
        <div>
          <label className="label flex items-center gap-1.5"><Users size={13} /> Age Range</label>
          <div className="flex flex-wrap gap-2">
            {AGE_RANGES.map(a => (
              <button
                key={a.id}
                onClick={() => toggle('ages', a.id)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${(targeting.ages || []).includes(a.id) ? 'bg-purple-600/20 border-purple-500/40 text-purple-300' : 'bg-theme-elevated border-theme-bdr2 text-gray-400 hover:text-gray-200'}`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Gender */}
      {supportedFeatures.has('gender') && (
        <div>
          <label className="label">Gender</label>
          <div className="flex flex-wrap gap-2">
            {GENDERS.map(g => (
              <button
                key={g.id}
                onClick={() => setOne('gender', g.id)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${targeting.gender === g.id ? 'bg-purple-600/20 border-purple-500/40 text-purple-300' : 'bg-theme-elevated border-theme-bdr2 text-gray-400 hover:text-gray-200'}`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Location */}
      {supportedFeatures.has('location') && (
        <div>
          <label className="label flex items-center gap-1.5"><MapPin size={13} /> Target Locations</label>
          <input
            className="input"
            placeholder="e.g. Warsaw, Kraków, Poland, Remote EU"
            value={targeting.locations || ''}
            onChange={e => setOne('locations', e.target.value)}
          />
          <p className="text-xs text-gray-600 mt-1">Separate multiple cities or countries with commas</p>
        </div>
      )}

      {/* Job interests */}
      {supportedFeatures.has('interests') && (
        <div>
          <label className="label flex items-center gap-1.5"><Briefcase size={13} /> Job Category Interests</label>
          <div className="flex flex-wrap gap-2">
            {JOB_INTERESTS.map(i => (
              <button
                key={i}
                onClick={() => toggle('interests', i)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${(targeting.interests || []).includes(i) ? 'bg-purple-600/20 border-purple-500/40 text-purple-300' : 'bg-theme-elevated border-theme-bdr2 text-gray-400 hover:text-gray-200'}`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Seniority (Facebook only) */}
      {supportedFeatures.has('seniority') && (
        <div>
          <label className="label flex items-center gap-1.5"><Briefcase size={13} /> Seniority Level <span className="text-gray-600 text-[10px] font-normal">Facebook only</span></label>
          <div className="flex flex-wrap gap-2">
            {SENIORITY_LEVELS.map(s => (
              <button
                key={s.id}
                onClick={() => toggle('seniority', s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${(targeting.seniority || []).includes(s.id) ? 'bg-purple-600/20 border-purple-500/40 text-purple-300' : 'bg-theme-elevated border-theme-bdr2 text-gray-400 hover:text-gray-200'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Device */}
      {supportedFeatures.has('device') && (
        <div>
          <label className="label flex items-center gap-1.5"><Smartphone size={13} /> Device Targeting</label>
          <div className="flex flex-wrap gap-2">
            {DEVICES.map(d => (
              <button
                key={d.id}
                onClick={() => setOne('device', d.id)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${targeting.device === d.id ? 'bg-purple-600/20 border-purple-500/40 text-purple-300' : 'bg-theme-elevated border-theme-bdr2 text-gray-400 hover:text-gray-200'}`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedPlatforms.length === 0 && (
        <div className="card text-center py-6 text-gray-500 text-sm">
          Select platforms in the previous step to configure targeting.
        </div>
      )}
    </div>
  )
}

// ── Stripe payment mock ────────────────────────────────────────────────────────
function StripePaymentStep({ total, onPay, loading }) {
  const [method, setMethod] = useState('card')
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <CreditCard size={18} className="text-green-400" />
        <h2 className="font-semibold">Payment</h2>
      </div>

      <div className="bg-theme-bg rounded-xl border border-theme-bdr2 p-4 space-y-3">
        {/* Method selector */}
        <div className="flex gap-2">
          {[
            { id: 'card', label: '💳 Card' },
            { id: 'sepa', label: '🏦 SEPA' },
            { id: 'blik', label: '📱 BLIK' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${method === m.id ? 'bg-purple-600/20 border-purple-500/40 text-purple-300' : 'bg-theme-elevated border-theme-bdr2 text-gray-400'}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {method === 'card' && (
          <div className="space-y-2">
            <div>
              <label className="label text-xs">Card number</label>
              <input className="input font-mono text-sm" placeholder="4242 4242 4242 4242" disabled />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label text-xs">Expiry</label>
                <input className="input text-sm" placeholder="MM / YY" disabled />
              </div>
              <div>
                <label className="label text-xs">CVC</label>
                <input className="input text-sm" placeholder="•••" disabled />
              </div>
            </div>
          </div>
        )}

        {method === 'sepa' && (
          <div>
            <label className="label text-xs">IBAN</label>
            <input className="input font-mono text-sm" placeholder="PL00 0000 0000 0000 0000 0000 0000" disabled />
          </div>
        )}

        {method === 'blik' && (
          <div>
            <label className="label text-xs">BLIK code</label>
            <input className="input font-mono text-sm tracking-widest" placeholder="000 000" disabled />
          </div>
        )}

        <div className="border-t border-theme-bdr pt-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Total due today</p>
            <p className="text-xl font-bold">{formatPLN(total)}</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <ShieldCheck size={13} className="text-green-400" />
            Secured by Stripe
          </div>
        </div>
      </div>

      <div className="bg-theme-card border border-theme-bdr rounded-xl p-3 flex items-start gap-2 text-xs text-gray-500">
        <Info size={13} className="text-blue-400 shrink-0 mt-0.5" />
        <span>
          This is a demo checkout. In production a real <strong className="text-gray-700 dark:text-gray-300">Stripe Checkout</strong> link
          will be emailed to you within 2 hours of campaign submission.
          Payment activates your campaign automatically.
        </span>
      </div>

      <button
        onClick={onPay}
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
        {loading ? 'Processing…' : `Pay ${formatPLN(total)} & Launch Campaign`}
      </button>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CampaignPage() {
  const user = useAuthStore(s => s.user)
  const ads = useAdStore(s => s.ads)
  const addCampaign = useCampaignStore(s => s.addCampaign)
  const campaigns = useCampaignStore(s => s.campaigns)

  const [step, setStep] = useState(1)
  const [selectedAdId, setSelectedAdId] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [budgetPLN, setBudgetPLN] = useState(MIN_SPEND_PLN)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [targeting, setTargeting] = useState({ gender: 'all', device: 'all' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const commission = +(budgetPLN * COMMISSION_RATE).toFixed(2)
  const total = +(budgetPLN + commission).toFixed(2)
  const selectedAd = ads.find(a => a.id === selectedAdId)

  function togglePlatform(id) {
    setSelectedPlatforms(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  async function handleSubmit() {
    if (!selectedAd || selectedPlatforms.length === 0) return
    setLoading(true)
    setError('')
    try {
      const campaign = {
        userId: user.id,
        adId: selectedAdId,
        platforms: selectedPlatforms,
        budgetPLN,
        commissionPLN: commission,
        totalPLN: total,
        targeting,
        vatNote: 'VAT-free B2B invoice in PLN',
        startDate,
        endDate,
      }
      addCampaign(campaign)

      const webhookUrl = localStorage.getItem('adboard_n8n_url')
      if (webhookUrl) {
        await callN8nAction(webhookUrl, { action: 'campaign_order', ...campaign }).catch(() => {})
      }

      setStep(5)
    } catch {
      setError('Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Free-plan gate ──────────────────────────────────────────────────────────
  if (user?.plan === 'free') {
    return (
      <div className="max-w-lg mx-auto text-center pt-20">
        <div className="w-16 h-16 rounded-2xl bg-purple-600/10 flex items-center justify-center mx-auto mb-5">
          <Crown size={28} className="text-purple-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Campaigns are a Pro feature</h1>
        <p className="text-gray-400 mb-6 text-sm leading-relaxed">
          Launch real ad campaigns across Facebook, Instagram, TikTok, YouTube, and Snapchat.<br />
          Minimum 100 PLN ad spend · 7% management fee · VAT-free invoicing.
        </p>
        <div className="card text-left mb-6">
          {[
            'All platforms in one dashboard',
            'HireAds runs ads from verified business accounts',
            '7% management fee on ad spend',
            'Stripe payment — Visa, MC, SEPA, BLIK',
            'VAT-free B2B invoice in PLN',
            'AI-assisted targeting & copy',
          ].map(f => (
            <div key={f} className="flex items-center gap-2 py-2 border-b border-theme-bdr last:border-0 text-sm text-gray-700 dark:text-gray-300">
              <Check size={14} className="text-purple-400" />
              {f}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600">Use the "Simulate upgrade" button on the dashboard to try Pro features.</p>
      </div>
    )
  }

  // ── Success ─────────────────────────────────────────────────────────────────
  if (step === 5) {
    return (
      <div className="max-w-md mx-auto text-center pt-16">
        <CheckCircle2 size={56} className="text-green-400 mx-auto mb-5" />
        <h1 className="text-2xl font-bold mb-2">Campaign submitted!</h1>
        <p className="text-gray-400 text-sm mb-6">
          Your campaign has been received. You'll get a Stripe payment link by email within 2 business hours.
          Once paid, your campaign goes live automatically.
        </p>
        <div className="card text-left mb-6 space-y-2 text-sm">
          <Row label="Ad" value={selectedAd?.name || selectedAd?.jobTitle} />
          <Row label="Platforms" value={selectedPlatforms.join(', ')} />
          <Row label="Ad spend" value={formatPLN(budgetPLN)} />
          <Row label="Management fee (7%)" value={formatPLN(commission)} />
          <div className="border-t border-theme-bdr pt-2">
            <Row label="Total" value={formatPLN(total)} highlight />
          </div>
          {targeting.locations && <Row label="Targeting" value={targeting.locations} />}
        </div>
        <button
          onClick={() => { setStep(1); setSelectedAdId(''); setSelectedPlatforms([]); setBudgetPLN(MIN_SPEND_PLN); setTargeting({ gender: 'all', device: 'all' }) }}
          className="btn-primary"
        >
          Create another campaign
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Megaphone size={22} className="text-purple-400" />
          New Campaign
        </h1>
        <p className="text-gray-400 text-sm mt-1">Launch your job ad across social platforms via HireAds</p>
      </div>

      {/* Step indicators */}
      <div className="flex gap-1.5 flex-wrap">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
              step > i + 1
                ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                : step === i + 1
                ? 'bg-purple-600 border-purple-600 text-white'
                : 'bg-theme-elevated border-theme-bdr2 text-gray-500'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center font-bold">
              {step > i + 1 ? '✓' : i + 1}
            </span>
            {s}
          </div>
        ))}
      </div>

      {/* ── Step 1: Select ad ── */}
      {step === 1 && (
        <div className="space-y-4">
          <HireAdsInfoPanel />
          <h2 className="font-semibold">Choose an ad to campaign</h2>
          {ads.length === 0 ? (
            <div className="card text-center py-8 text-gray-500 text-sm">
              No ads yet. <a href="/ads" className="text-purple-400">Create one first →</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ads.map(ad => (
                <button
                  key={ad.id}
                  onClick={() => setSelectedAdId(ad.id)}
                  className={`card text-left hover:border-purple-500/40 transition-colors ${selectedAdId === ad.id ? 'border-purple-500' : ''}`}
                >
                  {ad.imageUrl && (
                    <img src={ad.imageUrl} alt={ad.name} className="w-full h-24 object-cover rounded-lg mb-3" />
                  )}
                  <p className="font-medium text-sm">{ad.name || ad.jobTitle || 'Untitled Ad'}</p>
                  {ad.company && <p className="text-xs text-gray-500">{ad.company}</p>}
                  {selectedAdId === ad.id && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-purple-400">
                      <Check size={12} /> Selected
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
          <button disabled={!selectedAdId} onClick={() => setStep(2)} className="btn-primary disabled:opacity-40">
            Continue
          </button>
        </div>
      )}

      {/* ── Step 2: Platforms + budget ── */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h2 className="font-semibold mb-3">Select platforms</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={`card text-left hover:border-purple-500/40 transition-colors flex items-center gap-2 py-3 ${selectedPlatforms.includes(p.id) ? 'border-purple-500 bg-purple-600/5' : ''}`}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ background: p.bg, color: p.color }}>
                    {p.label[0]}
                  </div>
                  <span className="text-sm">{p.label}</span>
                  {selectedPlatforms.includes(p.id) && <Check size={14} className="text-purple-400 ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-semibold mb-3">Budget</h2>
            <div className="card space-y-4">
              <div>
                <label className="label">Ad spend (PLN) — min. {MIN_SPEND_PLN} PLN</label>
                <input
                  type="number"
                  className="input"
                  min={MIN_SPEND_PLN}
                  value={budgetPLN}
                  onChange={e => setBudgetPLN(Math.max(MIN_SPEND_PLN, +e.target.value))}
                />
              </div>
              <BudgetAdvisor budget={budgetPLN} onApply={platforms => setSelectedPlatforms(platforms)} />
              <div className="bg-theme-bg rounded-lg p-3 space-y-2 text-sm">
                <Row label="Ad spend" value={formatPLN(budgetPLN)} />
                <Row label="Management fee (7%)" value={formatPLN(commission)} />
                <div className="border-t border-theme-bdr pt-2">
                  <Row label="Total due" value={formatPLN(total)} highlight />
                </div>
                <p className="text-xs text-gray-600 pt-1">VAT-free · B2B invoice in PLN · Paid via Stripe</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start date</label>
              <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="label">End date</label>
              <input type="date" className="input" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
            <button disabled={selectedPlatforms.length === 0} onClick={() => setStep(3)} className="btn-primary disabled:opacity-40">
              Set targeting
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Targeting ── */}
      {step === 3 && (
        <div className="space-y-5">
          <TargetingStep targeting={targeting} setTargeting={setTargeting} selectedPlatforms={selectedPlatforms} />
          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
            <button onClick={() => setStep(4)} className="btn-primary">
              Review order
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: Review + payment ── */}
      {step === 4 && (
        <div className="space-y-5">
          <h2 className="font-semibold">Review & confirm</h2>
          <div className="card space-y-3 text-sm">
            <Row label="Ad" value={selectedAd?.name || selectedAd?.jobTitle} />
            <Row label="Platforms" value={selectedPlatforms.join(', ')} />
            {targeting.locations && <Row label="Locations" value={targeting.locations} />}
            {targeting.ages?.length > 0 && <Row label="Ages" value={targeting.ages.join(', ')} />}
            {targeting.gender && targeting.gender !== 'all' && <Row label="Gender" value={targeting.gender} />}
            {targeting.interests?.length > 0 && <Row label="Interests" value={targeting.interests.slice(0, 2).join(', ') + (targeting.interests.length > 2 ? ` +${targeting.interests.length - 2}` : '')} />}
            <Row label="Ad spend" value={formatPLN(budgetPLN)} />
            <Row label="Management fee (7%)" value={formatPLN(commission)} />
            <div className="border-t border-theme-bdr pt-2">
              <Row label="Total" value={formatPLN(total)} highlight />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <StripePaymentStep total={total} onPay={handleSubmit} loading={loading} />

          <button onClick={() => setStep(3)} className="btn-secondary text-sm">← Back to targeting</button>
        </div>
      )}

      {/* Recent campaigns (step 1 only) */}
      {campaigns.length > 0 && step === 1 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Recent Campaigns</h2>
          <div className="space-y-2">
            {campaigns.slice(-3).reverse().map(c => (
              <div key={c.id} className="card flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{(c.platforms || []).join(', ')}</p>
                  <p className="text-gray-500 text-xs">{formatPLN(c.totalPLN)} · {new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`badge text-xs border ${c.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                  {c.status?.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between">
      <span className={highlight ? 'font-semibold' : 'text-gray-400'}>{label}</span>
      <span className={highlight ? 'font-bold text-purple-300' : ''}>{value}</span>
    </div>
  )
}
