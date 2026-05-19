import { useState, useMemo } from 'react'
import { BarChart2, Users, Activity, Calendar, Trash2, Download, Filter } from 'lucide-react'
import { timeAgo } from '../utils'

const TODAY = new Date().toISOString().slice(0, 10)

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatDay(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getLast14Days() {
  const days = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

function summarizeData(data) {
  if (!data || typeof data !== 'object') return '—'
  const entries = Object.entries(data)
  if (entries.length === 0) return '—'
  return entries
    .slice(0, 3)
    .map(([k, v]) => {
      const val = typeof v === 'string' ? v.slice(0, 24) : JSON.stringify(v).slice(0, 24)
      return `${k}: ${val}`
    })
    .join(' · ')
}

const FEATURE_EVENTS = [
  { label: 'AI Copy Used', event: 'ai_copy_used' },
  { label: 'Template Changed', event: 'template_changed' },
  { label: 'Stock Photo Used', event: 'stock_photo_used' },
  { label: 'Logo Fetched', event: 'logo_fetched' },
  { label: 'Job URL Fetched', event: 'job_url_fetched' },
  { label: 'Campaign Created', event: 'campaign_created' },
  { label: 'Brand Kit Applied', event: 'brand_kit_applied' },
]

export default function AdminPage() {
  const [eventFilter, setEventFilter] = useState('')

  const rawEvents = JSON.parse(localStorage.getItem('hireads_events') || '[]')
  const rawUsers = JSON.parse(localStorage.getItem('adboard_users') || '[]')

  // ── Aggregations ─────────────────────────────────────────────────────────────

  const totalEvents = rawEvents.length

  const uniqueUserIds = useMemo(() => {
    const ids = new Set()
    rawEvents.forEach(e => { if (e.userId) ids.add(e.userId) })
    return ids.size
  }, [rawEvents])

  const eventsToday = useMemo(
    () => rawEvents.filter(e => e.ts && e.ts.startsWith(TODAY)).length,
    [rawEvents]
  )

  const registeredUsers = rawUsers.length

  // Events per day for last 14 days
  const last14Days = getLast14Days()
  const eventsByDay = useMemo(() => {
    const map = {}
    last14Days.forEach(d => { map[d] = 0 })
    rawEvents.forEach(e => {
      if (e.ts) {
        const day = e.ts.slice(0, 10)
        if (map[day] !== undefined) map[day]++
      }
    })
    return last14Days.map(d => ({ day: d, count: map[d] }))
  }, [rawEvents])

  // Top 10 event types
  const topEvents = useMemo(() => {
    const map = {}
    rawEvents.forEach(e => {
      if (e.event) map[e.event] = (map[e.event] || 0) + 1
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))
  }, [rawEvents])

  // Events per user (for users table)
  const eventCountByUser = useMemo(() => {
    const map = {}
    rawEvents.forEach(e => {
      if (e.email && e.email !== 'anonymous') {
        map[e.email] = (map[e.email] || 0) + 1
      }
    })
    return map
  }, [rawEvents])

  // Last active per user
  const lastActiveByUser = useMemo(() => {
    const map = {}
    rawEvents.forEach(e => {
      if (e.email && e.email !== 'anonymous') {
        if (!map[e.email] || e.ts > map[e.email]) map[e.email] = e.ts
      }
    })
    return map
  }, [rawEvents])

  // Feature adoption
  const featureAdoption = useMemo(() => {
    const totalDistinctUsers = new Set(rawUsers.map(u => u.email)).size || 1
    return FEATURE_EVENTS.map(({ label, event }) => {
      const usersWhoUsed = new Set(
        rawEvents.filter(e => e.event === event && e.email && e.email !== 'anonymous').map(e => e.email)
      ).size
      return {
        label,
        event,
        count: usersWhoUsed,
        pct: totalDistinctUsers > 0 ? Math.round((usersWhoUsed / totalDistinctUsers) * 100) : 0,
      }
    })
  }, [rawEvents, rawUsers])

  // Filtered recent events (last 100)
  const recentEvents = useMemo(() => {
    const sorted = [...rawEvents].sort((a, b) => (b.ts || '').localeCompare(a.ts || '')).slice(0, 100)
    if (!eventFilter.trim()) return sorted
    const q = eventFilter.toLowerCase()
    return sorted.filter(
      e =>
        (e.event && e.event.toLowerCase().includes(q)) ||
        (e.email && e.email.toLowerCase().includes(q))
    )
  }, [rawEvents, eventFilter])

  // ── SVG line chart ────────────────────────────────────────────────────────────
  const chartW = 560
  const chartH = 100
  const padL = 0
  const padR = 0
  const maxCount = Math.max(...eventsByDay.map(d => d.count), 1)
  const pts = eventsByDay.map((d, i) => {
    const x = padL + (i / (eventsByDay.length - 1)) * (chartW - padL - padR)
    const y = chartH - (d.count / maxCount) * chartH
    return [x, y]
  })
  const polylinePoints = pts.map(([x, y]) => `${x},${y}`).join(' ')
  const areaPath = [
    `M ${pts[0][0]},${chartH}`,
    ...pts.map(([x, y]) => `L ${x},${y}`),
    `L ${pts[pts.length - 1][0]},${chartH}`,
    'Z',
  ].join(' ')

  // ── Actions ───────────────────────────────────────────────────────────────────
  function clearAllEvents() {
    if (window.confirm('Delete all analytics events from localStorage? This cannot be undone.')) {
      localStorage.removeItem('hireads_events')
      window.location.reload()
    }
  }

  function exportEventsAsJson() {
    const blob = new Blob([JSON.stringify(rawEvents, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hireads_events_${TODAY}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-400 flex items-center justify-center shrink-0">
          <BarChart2 size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-xs text-red-400 font-medium">Admin only · dantiscvs@gmail.com</p>
        </div>
        <div className="ml-auto flex gap-2 shrink-0">
          <button
            onClick={clearAllEvents}
            className="btn-secondary text-xs flex items-center gap-1"
          >
            <Trash2 size={12} /> Clear events
          </button>
          <button
            onClick={exportEventsAsJson}
            className="btn-secondary text-xs flex items-center gap-1"
          >
            <Download size={12} /> Export JSON
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={<Activity size={18} />}
          iconBg="bg-violet-600/10 text-violet-400"
          label="Total Events"
          value={totalEvents.toLocaleString()}
        />
        <StatCard
          icon={<Users size={18} />}
          iconBg="bg-blue-600/10 text-blue-400"
          label="Unique Users"
          value={uniqueUserIds.toLocaleString()}
          note="with userId"
        />
        <StatCard
          icon={<Calendar size={18} />}
          iconBg="bg-emerald-600/10 text-emerald-400"
          label="Events Today"
          value={eventsToday.toLocaleString()}
        />
        <StatCard
          icon={<Users size={18} />}
          iconBg="bg-amber-600/10 text-amber-400"
          label="Registered Users"
          value={registeredUsers.toLocaleString()}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Line chart — events over 14 days */}
        <div className="bg-theme-card border border-theme-bdr rounded-xl p-5">
          <p className="text-sm font-semibold mb-4">Events — last 14 days</p>
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${chartW} ${chartH + 28}`} width="100%" style={{ minWidth: 300 }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {/* Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                const y = chartH - frac * chartH
                return (
                  <line
                    key={frac}
                    x1={0}
                    x2={chartW}
                    y1={y}
                    y2={y}
                    stroke="#1e1e2e"
                    strokeWidth={1}
                  />
                )
              })}
              {/* Fill area */}
              <path d={areaPath} fill="url(#lineGrad)" />
              {/* Line */}
              <polyline
                points={polylinePoints}
                fill="none"
                stroke="#7c3aed"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {/* Dots */}
              {pts.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={3} fill="#7c3aed" />
              ))}
              {/* X axis labels — every other day */}
              {eventsByDay.map((d, i) => {
                if (i % 2 !== 0 && i !== eventsByDay.length - 1) return null
                const x = padL + (i / (eventsByDay.length - 1)) * (chartW - padL - padR)
                return (
                  <text
                    key={i}
                    x={x}
                    y={chartH + 18}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#6b7280"
                  >
                    {formatDay(d.day)}
                  </text>
                )
              })}
            </svg>
          </div>
          {/* Y-axis max label */}
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-500">0</span>
            <span className="text-[10px] text-gray-500">{maxCount}</span>
          </div>
        </div>

        {/* Horizontal bar chart — top events */}
        <div className="bg-theme-card border border-theme-bdr rounded-xl p-5">
          <p className="text-sm font-semibold mb-4">Top event types</p>
          {topEvents.length === 0 ? (
            <p className="text-sm text-gray-500">No events recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {topEvents.map(({ name, count }) => {
                const maxBar = topEvents[0].count
                const pct = Math.round((count / maxBar) * 100)
                return (
                  <div key={name} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-36 truncate shrink-0">{name}</span>
                    <div className="flex-1 h-4 bg-theme-elevated rounded-full overflow-hidden">
                      <div
                        className="h-4 rounded-full bg-violet-600/70 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-700 dark:text-gray-300 w-8 text-right shrink-0">{count}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Feature adoption */}
      <div className="bg-theme-card border border-theme-bdr rounded-xl p-5">
        <p className="text-sm font-semibold mb-4">Feature adoption</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {featureAdoption.map(({ label, pct, count }) => (
            <div key={label} className="bg-theme-bg border border-theme-bdr rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{label}</span>
                <span className="text-xs text-gray-500">{count} user{count !== 1 ? 's' : ''}</span>
              </div>
              <div className="h-1.5 bg-theme-elevated rounded-full overflow-hidden">
                <div
                  className="h-1.5 rounded-full bg-emerald-500/70"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">{pct}% of registered users</p>
            </div>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="bg-theme-card border border-theme-bdr rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-blue-400" />
          <p className="text-sm font-semibold">Registered users ({rawUsers.length})</p>
        </div>
        {rawUsers.length === 0 ? (
          <p className="text-sm text-gray-500">No registered users found in adboard_users.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-theme-bdr">
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Plan</Th>
                  <Th>Registered</Th>
                  <Th>Events</Th>
                  <Th>Last Active</Th>
                </tr>
              </thead>
              <tbody>
                {rawUsers.map((u) => {
                  const evCount = eventCountByUser[u.email] || 0
                  const lastActive = lastActiveByUser[u.email]
                  return (
                    <tr
                      key={u.id || u.email}
                      className="border-b border-theme-bdr/60 hover:bg-theme-elevated/30 transition-colors"
                    >
                      <Td>
                        <span className="font-medium text-theme-text">{u.name || '—'}</span>
                        {u.isAdmin && (
                          <span className="ml-1.5 text-[9px] bg-red-600/20 text-red-400 px-1.5 py-0.5 rounded-full">
                            admin
                          </span>
                        )}
                      </Td>
                      <Td>{u.email}</Td>
                      <Td>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            u.plan === 'pro'
                              ? 'bg-amber-600/20 text-amber-400'
                              : 'bg-theme-elevated text-theme-muted'
                          }`}
                        >
                          {u.plan || 'free'}
                        </span>
                      </Td>
                      <Td>{u.createdAt ? formatDate(u.createdAt) : '—'}</Td>
                      <Td>{evCount}</Td>
                      <Td>{lastActive ? timeAgo(lastActive) : '—'}</Td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent events log */}
      <div className="bg-theme-card border border-theme-bdr rounded-xl p-5">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-violet-400" />
            <p className="text-sm font-semibold">
              Recent events{' '}
              <span className="text-gray-500 font-normal">(last 100)</span>
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-theme-bg border border-theme-bdr rounded-lg px-2.5 py-1.5">
            <Filter size={12} className="text-gray-500 shrink-0" />
            <input
              type="text"
              placeholder="Filter by event or email…"
              value={eventFilter}
              onChange={e => setEventFilter(e.target.value)}
              className="bg-transparent text-xs text-gray-700 dark:text-gray-300 placeholder-gray-600 outline-none w-48"
            />
          </div>
        </div>
        {recentEvents.length === 0 ? (
          <p className="text-sm text-gray-500">
            {rawEvents.length === 0 ? 'No events recorded yet.' : 'No events match your filter.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-theme-bdr">
                  <Th>Time</Th>
                  <Th>User</Th>
                  <Th>Event</Th>
                  <Th>Data</Th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((e) => (
                  <tr
                    key={e.id || `${e.ts}-${e.event}`}
                    className="border-b border-theme-bdr/50 hover:bg-theme-elevated/30 transition-colors"
                  >
                    <Td>
                      <span className="text-gray-500 whitespace-nowrap" title={e.ts}>
                        {e.ts ? timeAgo(e.ts) : '—'}
                      </span>
                    </Td>
                    <Td>
                      <span className={e.email === 'anonymous' ? 'text-gray-600' : 'text-gray-700 dark:text-gray-300'}>
                        {e.email || '—'}
                      </span>
                    </Td>
                    <Td>
                      <EventBadge name={e.event} />
                    </Td>
                    <Td>
                      <span className="text-gray-500 truncate max-w-[260px] block">
                        {summarizeData(e.data)}
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Small helper components ───────────────────────────────────────────────────

function StatCard({ icon, iconBg, label, value, note }) {
  return (
    <div className="bg-theme-card border border-theme-bdr rounded-xl p-4 flex items-start gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{label}</p>
        {note && <p className="text-[10px] text-gray-600 mt-0.5">{note}</p>}
      </div>
    </div>
  )
}

function Th({ children }) {
  return (
    <th className="text-left text-[10px] uppercase tracking-wide text-gray-500 pb-2 pr-4 font-medium whitespace-nowrap">
      {children}
    </th>
  )
}

function Td({ children }) {
  return (
    <td className="py-2 pr-4 text-gray-400 align-top">
      {children}
    </td>
  )
}

const EVENT_COLORS = {
  page_view:           'bg-theme-elevated text-theme-muted',
  ad_created:          'bg-blue-600/20 text-blue-400',
  ad_saved:            'bg-cyan-600/20 text-cyan-400',
  ad_deleted:          'bg-red-600/20 text-red-400',
  ad_duplicated:       'bg-sky-600/20 text-sky-400',
  export_png:          'bg-teal-600/20 text-teal-400',
  export_json:         'bg-teal-600/20 text-teal-400',
  template_changed:    'bg-indigo-600/20 text-indigo-400',
  ai_copy_used:        'bg-violet-600/20 text-violet-400',
  font_changed:        'bg-purple-600/20 text-purple-400',
  logo_fetched:        'bg-orange-600/20 text-orange-400',
  job_url_fetched:     'bg-amber-600/20 text-amber-400',
  stock_photo_searched:'bg-yellow-600/20 text-yellow-400',
  stock_photo_used:    'bg-lime-600/20 text-lime-400',
  campaign_created:    'bg-emerald-600/20 text-emerald-400',
  chatbot_message:     'bg-fuchsia-600/20 text-fuchsia-400',
  brand_kit_applied:   'bg-pink-600/20 text-pink-400',
  onboarding_completed:'bg-green-600/20 text-green-400',
  login:               'bg-slate-600/20 text-slate-400',
  register:            'bg-blue-700/20 text-blue-300',
}

function EventBadge({ name }) {
  const cls = EVENT_COLORS[name] || 'bg-theme-elevated text-theme-text2'
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${cls}`}>
      {name || '—'}
    </span>
  )
}
