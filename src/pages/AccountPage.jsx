import { useState, useRef, useCallback } from 'react'
import { useAuthStore, useAdStore, useCampaignStore, useBrandKitStore } from '../store'
import { formatPLN, resizeImageToBase64, timeAgo } from '../utils'
import { useDropzone } from 'react-dropzone'
import {
  UserCircle, BarChart2, Megaphone, Palette, Settings, CreditCard,
  Crown, CheckCircle2, Clock, AlertCircle, XCircle,
  Upload, Trash2, Plus, Copy, Check, Save, Eye, EyeOff,
  Image as ImageIcon, Briefcase, DollarSign, Calendar, Layers,
  ChevronRight, Download,
} from 'lucide-react'

const TABS = [
  { id: 'overview',   label: 'Overview',   icon: <BarChart2 size={15} /> },
  { id: 'campaigns',  label: 'Campaigns',  icon: <Megaphone size={15} /> },
  { id: 'brandkit',   label: 'Brand Kit',  icon: <Palette size={15} /> },
  { id: 'settings',   label: 'API Settings', icon: <Settings size={15} /> },
  { id: 'billing',    label: 'Billing',    icon: <CreditCard size={15} /> },
]

const STATUS_META = {
  pending_payment: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', icon: <Clock size={12} /> },
  active:          { label: 'Active',  color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20',   icon: <CheckCircle2 size={12} /> },
  completed:       { label: 'Done',    color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20',     icon: <CheckCircle2 size={12} /> },
  rejected:        { label: 'Rejected',color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20',       icon: <XCircle size={12} /> },
  paused:          { label: 'Paused',  color: 'text-gray-400',   bg: 'bg-gray-500/10 border-gray-500/20',     icon: <AlertCircle size={12} /> },
}

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, color = 'purple' }) {
  const colors = {
    purple: 'bg-purple-600/10 text-purple-400',
    green:  'bg-green-600/10 text-green-400',
    blue:   'bg-blue-600/10 text-blue-400',
    amber:  'bg-amber-600/10 text-amber-400',
  }
  return (
    <div className="card space-y-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
        {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── Overview tab ──────────────────────────────────────────────────────────────
function OverviewTab({ user, ads, campaigns }) {
  const totalSpend = campaigns.reduce((s, c) => s + (c.budgetPLN || 0), 0)
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : 'Unknown'

  const adsByTemplate = ads.reduce((acc, ad) => {
    const t = ad.templateId || 'classic'
    acc[t] = (acc[t] || 0) + 1
    return acc
  }, {})

  const platformFreq = campaigns
    .flatMap(c => c.platforms || [])
    .reduce((acc, p) => { acc[p] = (acc[p] || 0) + 1; return acc }, {})

  const topPlatform = Object.entries(platformFreq).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Job Ads Created" value={ads.length} sub={`${ads.filter(a => a.imageUrl).length} with images`} icon={<ImageIcon size={18} />} color="purple" />
        <StatCard label="Campaigns Launched" value={campaigns.length} sub={`${activeCampaigns} active`} icon={<Megaphone size={18} />} color="blue" />
        <StatCard label="Total Ad Spend" value={formatPLN(totalSpend)} sub="all-time" icon={<DollarSign size={18} />} color="green" />
        <StatCard label="Member Since" value={memberSince} sub={user?.plan === 'paid' ? '✨ Pro plan' : 'Free plan'} icon={<Crown size={18} />} color="amber" />
      </div>

      {/* Plan card */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Your Plan</h3>
            <p className="text-xs text-gray-500 mt-0.5">HireAds · hireads.io</p>
          </div>
          <span className={`badge text-sm font-semibold px-4 py-1.5 ${user?.plan === 'paid' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'bg-theme-elevated text-theme-text2 border border-theme-bdr2'}`}>
            {user?.plan === 'paid' ? '✨ Pro' : 'Free'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { feature: 'Job ad creation', free: '✓ Unlimited', paid: '✓ Unlimited' },
            { feature: 'AI copy generation', free: '✓ Included', paid: '✓ Included' },
            { feature: 'PNG export', free: '✓ Included', paid: '✓ Included' },
            { feature: 'Campaign launch', free: '✗ Pro only', paid: '✓ All platforms' },
            { feature: 'Stock photos (premium)', free: '✗ Pro only', paid: '✓ Unlocked' },
            { feature: 'Priority support', free: '✗', paid: '✓ Email + chat' },
          ].map(r => (
            <div key={r.feature} className="flex items-center justify-between py-1.5 border-b border-theme-bdr">
              <span className="text-gray-400">{r.feature}</span>
              <span className={user?.plan === 'paid' ? 'text-green-400' : r.free.startsWith('✓') ? 'text-gray-300' : 'text-gray-600'}>{user?.plan === 'paid' ? r.paid : r.free}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Usage breakdown */}
      {ads.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-3">Template Usage</h3>
          <div className="space-y-2">
            {Object.entries(adsByTemplate).map(([t, count]) => (
              <div key={t} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-28 capitalize">{t}</span>
                <div className="flex-1 bg-theme-elevated rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(count / ads.length) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-500">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top platform */}
      {topPlatform && (
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center">
            <Megaphone size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Most used platform</p>
            <p className="font-semibold capitalize">{topPlatform[0]}</p>
            <p className="text-xs text-gray-500">{topPlatform[1]} campaign{topPlatform[1] !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Campaigns tab ──────────────────────────────────────────────────────────────
function CampaignsTab({ campaigns, ads }) {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? campaigns : campaigns.filter(c => c.status === filter)
  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending_payment', 'active', 'completed', 'paused'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${filter === f ? 'bg-purple-600 text-white' : 'bg-theme-elevated text-gray-400 hover:text-gray-200'}`}
          >
            {f === 'all' ? 'All campaigns' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="card text-center py-12 text-gray-500 text-sm">
          <Megaphone size={32} className="mx-auto mb-3 text-gray-700" />
          <p>No campaigns yet.</p>
          <a href="/campaigns" className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block">
            Launch your first campaign →
          </a>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(c => {
            const meta = STATUS_META[c.status] || STATUS_META.pending_payment
            const ad = ads.find(a => a.id === c.adId)
            return (
              <div key={c.id} className="card flex items-center gap-4">
                {/* Ad thumbnail */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-theme-elevated shrink-0 flex items-center justify-center">
                  {ad?.imageUrl
                    ? <img src={ad.imageUrl} alt="" className="w-full h-full object-cover" />
                    : <ImageIcon size={18} className="text-gray-600" />
                  }
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{ad?.name || ad?.jobTitle || 'Untitled Ad'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {(c.platforms || []).join(', ')} · {formatPLN(c.totalPLN || 0)} · {timeAgo(c.createdAt)}
                  </p>
                  {c.startDate && (
                    <p className="text-xs text-gray-600 mt-0.5">
                      {c.startDate} → {c.endDate || '...'}
                    </p>
                  )}
                </div>
                {/* Status */}
                <span className={`badge flex items-center gap-1 text-xs border shrink-0 ${meta.bg} ${meta.color}`}>
                  {meta.icon}
                  {meta.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Brand Kit tab ──────────────────────────────────────────────────────────────
function BrandKitTab() {
  const { brandColor, company, logoUrl, savedColors, setBrandColor, setCompany, setLogoUrl, addSavedColor } = useBrandKitStore()
  const [newColor, setNewColor] = useState(brandColor)
  const [saved, setSaved] = useState(false)

  const onDropLogo = useCallback(async (files) => {
    if (!files[0]) return
    const base64 = await resizeImageToBase64(files[0], 400, 0.9)
    setLogoUrl(base64)
  }, [setLogoUrl])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropLogo,
    accept: { 'image/*': [] },
    maxFiles: 1,
  })

  function handleSave() {
    setBrandColor(newColor)
    addSavedColor(newColor)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h3 className="font-semibold mb-1">Brand Kit</h3>
        <p className="text-sm text-gray-500">Save your brand assets for quick-apply in the ad editor.</p>
      </div>

      {/* Company name */}
      <div>
        <label className="label">Company Name</label>
        <input
          className="input"
          placeholder="Acme Corp"
          value={company}
          onChange={e => setCompany(e.target.value)}
        />
      </div>

      {/* Logo */}
      <div>
        <label className="label">Company Logo</label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${isDragActive ? 'border-purple-500 bg-purple-600/5' : 'border-theme-bdr2 hover:border-purple-500/50'}`}
        >
          <input {...getInputProps()} />
          {logoUrl ? (
            <div className="flex items-center gap-4">
              <img src={logoUrl} alt="logo" className="w-16 h-16 object-contain rounded-lg bg-white/5 p-1" />
              <div className="text-left">
                <p className="text-sm text-gray-700 dark:text-gray-300">Logo saved</p>
                <p className="text-xs text-gray-500">Drop a new image to replace</p>
              </div>
              <button
                className="ml-auto text-gray-500 hover:text-red-400 transition-colors"
                onClick={e => { e.stopPropagation(); setLogoUrl(null) }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={22} className="mx-auto mb-2 text-gray-600" />
              <p className="text-sm text-gray-500">Drop your logo here or click to browse</p>
              <p className="text-xs text-gray-600 mt-1">PNG, JPG, SVG · max 400px</p>
            </>
          )}
        </div>
      </div>

      {/* Brand color */}
      <div>
        <label className="label">Brand Colour</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={newColor}
            onChange={e => setNewColor(e.target.value)}
            className="w-10 h-10 rounded-lg border border-theme-bdr2 cursor-pointer bg-transparent p-0.5"
          />
          <input
            className="input font-mono"
            value={newColor}
            onChange={e => setNewColor(e.target.value)}
            maxLength={7}
            placeholder="#7c3aed"
          />
        </div>

        {/* Saved swatches */}
        <div className="flex flex-wrap gap-2 mt-3">
          {savedColors.map(c => (
            <button
              key={c}
              onClick={() => setNewColor(c)}
              title={c}
              className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${newColor === c ? 'border-white' : 'border-transparent'}`}
              style={{ background: c }}
            />
          ))}
          <button
            onClick={() => addSavedColor(newColor)}
            className="w-7 h-7 rounded-full border-2 border-dashed border-theme-bdr2 flex items-center justify-center text-gray-500 hover:text-gray-300 hover:border-gray-500 transition-colors"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="btn-primary flex items-center gap-2"
      >
        {saved ? <Check size={15} /> : <Save size={15} />}
        {saved ? 'Saved!' : 'Save Brand Kit'}
      </button>

      <div className="bg-purple-600/5 border border-purple-500/20 rounded-xl p-4 text-sm text-gray-400">
        <p className="font-medium text-purple-300 mb-1">💡 Quick-apply tip</p>
        <p>When creating a new ad, click the <span className="text-white font-medium">"Apply Brand Kit"</span> button in the editor to instantly fill in your company name, logo, and brand colour.</p>
      </div>
    </div>
  )
}

// ── API Settings tab ──────────────────────────────────────────────────────────
function SettingsTab() {
  const [settings, setSettings] = useState(() => ({
    groqKey: localStorage.getItem('adboard_groq_key') || '',
    n8nUrl: localStorage.getItem('adboard_n8n_url') || '',
    elevenLabsKey: localStorage.getItem('adboard_el_key') || '',
    voiceId: localStorage.getItem('adboard_voice_id') || '21m00Tcm4TlvDq8ikWAM',
    unsplashKey: localStorage.getItem('adboard_unsplash_key') || '',
    pexelsKey: localStorage.getItem('adboard_pexels_key') || '',
  }))
  const [showSecrets, setShowSecrets] = useState({})
  const [saved, setSaved] = useState(false)

  function toggleShow(key) {
    setShowSecrets(s => ({ ...s, [key]: !s[key] }))
  }

  function saveSettings() {
    localStorage.setItem('adboard_groq_key', settings.groqKey)
    localStorage.setItem('adboard_n8n_url', settings.n8nUrl)
    localStorage.setItem('adboard_el_key', settings.elevenLabsKey)
    localStorage.setItem('adboard_voice_id', settings.voiceId)
    localStorage.setItem('adboard_unsplash_key', settings.unsplashKey)
    localStorage.setItem('adboard_pexels_key', settings.pexelsKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function SecretField({ label, stateKey, placeholder, hint }) {
    return (
      <div>
        <label className="label">{label}</label>
        <div className="relative">
          <input
            className="input pr-10"
            type={showSecrets[stateKey] ? 'text' : 'password'}
            placeholder={placeholder}
            value={settings[stateKey]}
            onChange={e => setSettings(s => ({ ...s, [stateKey]: e.target.value }))}
          />
          <button
            onClick={() => toggleShow(stateKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            {showSecrets[stateKey] ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        {hint && <p className="text-xs text-gray-600 mt-1">{hint}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h3 className="font-semibold mb-1">API Settings</h3>
        <p className="text-sm text-gray-500">Connect external services to unlock AI features, voice, and stock photos.</p>
      </div>

      {/* Groq */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 bg-green-500/10 rounded-lg flex items-center justify-center text-green-400 text-xs font-bold">G</div>
          <div>
            <p className="font-medium text-sm">Groq API <span className="text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded-full ml-1">Recommended</span></p>
            <p className="text-xs text-gray-500">Multilingual AI job text parsing — free tier available</p>
          </div>
        </div>
        <SecretField
          label="API Key"
          stateKey="groqKey"
          placeholder="gsk_..."
          hint="Get your free key at console.groq.com → API Keys"
        />
        {settings.groqKey && (
          <p className="text-[11px] text-green-400">✓ Groq connected — AI parsing active</p>
        )}
      </div>

      {/* n8n */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-400 text-xs font-bold">n8</div>
          <div>
            <p className="font-medium text-sm">n8n Webhook</p>
            <p className="text-xs text-gray-500">Powers AI copy generation and chatbot</p>
          </div>
        </div>
        <div>
          <label className="label">Webhook URL</label>
          <input
            className="input"
            placeholder="https://your-n8n.cloud/webhook/..."
            value={settings.n8nUrl}
            onChange={e => setSettings(s => ({ ...s, n8nUrl: e.target.value }))}
          />
        </div>
      </div>

      {/* ElevenLabs */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400 text-xs font-bold">🎙</div>
          <div>
            <p className="font-medium text-sm">ElevenLabs</p>
            <p className="text-xs text-gray-500">Text-to-speech voice for chatbot replies</p>
          </div>
        </div>
        <SecretField label="API Key" stateKey="elevenLabsKey" placeholder="sk_..." hint="Get your key at elevenlabs.io/api-keys" />
        <div>
          <label className="label">Voice ID</label>
          <input
            className="input font-mono text-sm"
            placeholder="21m00Tcm4TlvDq8ikWAM"
            value={settings.voiceId}
            onChange={e => setSettings(s => ({ ...s, voiceId: e.target.value }))}
          />
          <p className="text-xs text-gray-600 mt-1">Default: Rachel — browse voices at elevenlabs.io/voice-library</p>
        </div>
      </div>

      {/* Stock photos */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 bg-green-500/10 rounded-lg flex items-center justify-center text-green-400 text-xs font-bold">📷</div>
          <div>
            <p className="font-medium text-sm">Stock Photos</p>
            <p className="text-xs text-gray-500">Free images from Unsplash & Pexels</p>
          </div>
        </div>
        <SecretField label="Unsplash Access Key" stateKey="unsplashKey" placeholder="Client-ID key from unsplash.com/developers" hint="Create a free app at unsplash.com/developers" />
        <SecretField label="Pexels API Key" stateKey="pexelsKey" placeholder="Pexels API key" hint="Get free key at pexels.com/api" />
      </div>

      <button
        onClick={saveSettings}
        className="btn-primary flex items-center gap-2"
      >
        {saved ? <Check size={15} /> : <Save size={15} />}
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  )
}

// ── Billing tab ───────────────────────────────────────────────────────────────
function BillingTab({ user, campaigns }) {
  const totalSpend = campaigns.reduce((s, c) => s + (c.totalPLN || 0), 0)
  const paid = campaigns.filter(c => c.status !== 'pending_payment')

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="font-semibold mb-1">Billing & Payments</h3>
        <p className="text-sm text-gray-500">All campaigns are invoiced in PLN · VAT-free for B2B clients.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold">{formatPLN(totalSpend)}</p>
          <p className="text-xs text-gray-500 mt-1">Total invoiced</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold">{paid.length}</p>
          <p className="text-xs text-gray-500 mt-1">Paid campaigns</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'pending_payment').length}</p>
          <p className="text-xs text-gray-500 mt-1">Pending payment</p>
        </div>
      </div>

      {/* Payment method info */}
      <div className="card space-y-4">
        <h4 className="font-medium">Payment Methods</h4>
        <div className="flex items-center gap-3 p-3 bg-theme-bg rounded-xl border border-theme-bdr2">
          <div className="w-10 h-10 bg-indigo-600/10 rounded-lg flex items-center justify-center text-indigo-400 font-bold text-sm">S</div>
          <div className="flex-1">
            <p className="text-sm font-medium">Stripe Checkout</p>
            <p className="text-xs text-gray-500">Secure card payments — Visa, Mastercard, SEPA, BLIK</p>
          </div>
          <span className="badge bg-green-500/10 text-green-400 border border-green-500/20 text-xs">Active</span>
        </div>
        <p className="text-xs text-gray-600">
          When you submit a campaign, you'll receive a Stripe payment link by email within 2 business hours.
          Upon payment, your campaign activates automatically.
        </p>
      </div>

      {/* Invoice table */}
      <div>
        <h4 className="font-medium mb-3">Invoice History</h4>
        {campaigns.length === 0 ? (
          <div className="card text-center py-8 text-gray-600 text-sm">
            No invoices yet. Submit your first campaign to get started.
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-theme-bdr">
                  <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Date</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Platforms</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Amount</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {[...campaigns].reverse().map(c => {
                  const meta = STATUS_META[c.status] || STATUS_META.pending_payment
                  return (
                    <tr key={c.id} className="border-b border-theme-bdr last:border-0 hover:bg-theme-elevated/30 transition-colors">
                      <td className="px-4 py-3 text-gray-400">{new Date(c.createdAt).toLocaleDateString('en-GB')}</td>
                      <td className="px-4 py-3 text-gray-300 capitalize">{(c.platforms || []).join(', ')}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatPLN(c.totalPLN || 0)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`badge inline-flex items-center gap-1 text-xs border ${meta.bg} ${meta.color}`}>
                          {meta.icon}{meta.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-blue-600/5 border border-blue-500/20 rounded-xl p-4 text-sm text-gray-400">
        <p className="font-medium text-blue-300 mb-1">📋 VAT-free invoicing</p>
        <p>All invoices are issued as VAT-free B2B documents in PLN by HireAds sp. z o.o., Poland.
        Compliant with EU B2B reverse-charge rules. Contact <span className="text-blue-300">billing@hireads.io</span> for any billing queries.</p>
      </div>
    </div>
  )
}

// ── Main AccountPage ──────────────────────────────────────────────────────────
export default function AccountPage() {
  const user = useAuthStore(s => s.user)
  const ads = useAdStore(s => s.ads)
  const campaigns = useCampaignStore(s => s.campaigns)
  const [tab, setTab] = useState('overview')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-purple-600/20 text-purple-300 flex items-center justify-center text-2xl font-bold uppercase">
          {user?.name?.[0] || '?'}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user?.name}</h1>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1">
            {user?.plan === 'paid' ? (
              <span className="badge bg-purple-600/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 text-xs">
                <Crown size={10} /> Pro plan
              </span>
            ) : (
              <span className="badge bg-theme-elevated text-theme-text2 border border-theme-bdr2 text-xs">Free plan</span>
            )}
            <span className="text-xs text-gray-600">·</span>
            <span className="text-xs text-gray-500">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '—'}</span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 border-b border-theme-bdr pb-0">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.id
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === 'overview'  && <OverviewTab user={user} ads={ads} campaigns={campaigns} />}
        {tab === 'campaigns' && <CampaignsTab campaigns={campaigns} ads={ads} />}
        {tab === 'brandkit'  && <BrandKitTab />}
        {tab === 'settings'  && <SettingsTab />}
        {tab === 'billing'   && <BillingTab user={user} campaigns={campaigns} />}
      </div>
    </div>
  )
}
