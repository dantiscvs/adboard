import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAtsStore, useCampaignStore, ATS_DEFAULT_STAGES } from '../store'
import SEO from '../components/SEO'
import {
  Users, Plus, Search, Star, MoreVertical, Mail, Phone, X,
  Sparkles, Calendar, MessageSquare, Trash2, Download, AlertCircle,
} from 'lucide-react'

const SOURCE_LABEL = {
  'lead-ad': 'Lead Ad',
  'manual': 'Manual',
  'referral': 'Referral',
  'upload': 'CV upload',
}

const PLATFORM_COLOR = {
  facebook:  '#1877F2',
  instagram: '#E1306C',
  linkedin:  '#0A66C2',
  tiktok:    '#010101',
  youtube:   '#FF0000',
  snapchat:  '#F7E300',
}

export default function AtsPage() {
  const { candidates, stages, addCandidate, moveCandidate, updateCandidate, deleteCandidate, seedDemoData } = useAtsStore()
  const campaigns = useCampaignStore(s => s.campaigns)
  const hasActiveCampaign = campaigns.some(c => c.status === 'active' || c.status === 'pending_payment')

  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [draggingId, setDraggingId] = useState(null)

  useEffect(() => {
    if (candidates.length === 0) seedDemoData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const roles = useMemo(() => ['all', ...new Set(candidates.map(c => c.role).filter(Boolean))], [candidates])

  const filtered = candidates.filter(c => {
    if (roleFilter !== 'all' && c.role !== roleFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (c.name || '').toLowerCase().includes(q) ||
           (c.email || '').toLowerCase().includes(q) ||
           (c.role || '').toLowerCase().includes(q)
  })

  const byStage = useMemo(() => {
    const map = {}
    stages.forEach(s => { map[s.id] = [] })
    filtered.forEach(c => {
      const key = map[c.stage] ? c.stage : 'new'
      map[key].push(c)
    })
    return map
  }, [filtered, stages])

  function handleDrop(stageId) {
    if (draggingId) moveCandidate(draggingId, stageId)
    setDraggingId(null)
  }

  function exportCsv() {
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Stage', 'Source', 'Platform', 'Rating', 'Created']
    const rows = candidates.map(c => [c.name, c.email, c.phone, c.role, c.stage, c.source, c.platform || '', c.rating, c.createdAt])
    const csv = [headers, ...rows].map(r => r.map(f => `"${String(f ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hireads-ats-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-5 lg:p-8">
      <SEO title="ATS — Candidate Pipeline" description="Drag-and-drop candidate kanban pipeline. Free with an active campaign." noindex />

      {/* Header */}
      <header className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users size={22} className="text-purple-400" /> Applicant Tracking
          </h1>
          <p className="text-sm text-theme-text2 mt-1">
            {candidates.length} candidates · {filtered.length} shown
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
            <input
              className="input pl-9 text-sm h-9 w-48"
              placeholder="Search candidates"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input text-sm h-9"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            {roles.map(r => <option key={r} value={r}>{r === 'all' ? 'All roles' : r}</option>)}
          </select>
          <button className="btn-secondary text-sm h-9 inline-flex items-center gap-1.5" onClick={exportCsv} title="Export CSV">
            <Download size={13} /> Export
          </button>
          <button className="btn-primary text-sm h-9 inline-flex items-center gap-1.5" onClick={() => setShowAddModal(true)}>
            <Plus size={14} /> Candidate
          </button>
        </div>
      </header>

      {!hasActiveCampaign && (
        <div className="mb-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-300 mb-1">Read-only mode</p>
            <p className="text-sm text-theme-text2">
              The ATS is free while you have an active campaign. Launch one to unlock drag-drop editing and bulk actions.{' '}
              <Link to="/campaigns" className="text-amber-300 underline">Launch campaign →</Link>
            </p>
          </div>
        </div>
      )}

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 500 }}>
        {stages.map(stage => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            candidates={byStage[stage.id] || []}
            onDragStart={id => setDraggingId(id)}
            onDrop={() => handleDrop(stage.id)}
            onSelect={setSelected}
            draggable={hasActiveCampaign}
          />
        ))}
      </div>

      {/* Detail drawer */}
      {selected && (
        <CandidateDrawer
          candidate={candidates.find(c => c.id === selected)}
          onClose={() => setSelected(null)}
          onUpdate={patch => updateCandidate(selected, patch)}
          onDelete={() => { deleteCandidate(selected); setSelected(null) }}
          stages={stages}
          readonly={!hasActiveCampaign}
        />
      )}

      {/* Add modal */}
      {showAddModal && (
        <AddCandidateModal
          onClose={() => setShowAddModal(false)}
          onSave={c => { addCandidate(c); setShowAddModal(false) }}
          stages={stages}
        />
      )}
    </div>
  )
}

function KanbanColumn({ stage, candidates, onDragStart, onDrop, onSelect, draggable }) {
  const [over, setOver] = useState(false)
  return (
    <div
      className={`w-72 shrink-0 rounded-xl bg-theme-card border transition-colors ${over ? 'border-purple-500/60' : 'border-theme-bdr'}`}
      onDragOver={e => { if (draggable) { e.preventDefault(); setOver(true) } }}
      onDragLeave={() => setOver(false)}
      onDrop={() => { setOver(false); onDrop() }}
    >
      <div className="p-3 border-b border-theme-bdr flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
        <span className="font-semibold text-sm">{stage.label}</span>
        <span className="ml-auto text-xs text-theme-muted">{candidates.length}</span>
      </div>
      <div className="p-2 space-y-2 min-h-[200px] max-h-[70vh] overflow-y-auto">
        {candidates.map(c => (
          <CandidateCard
            key={c.id}
            candidate={c}
            onDragStart={() => onDragStart(c.id)}
            onClick={() => onSelect(c.id)}
            draggable={draggable}
          />
        ))}
        {candidates.length === 0 && (
          <p className="text-center text-xs text-theme-muted py-8">No candidates</p>
        )}
      </div>
    </div>
  )
}

function CandidateCard({ candidate: c, onDragStart, onClick, draggable }) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      className={`p-3 rounded-lg bg-theme-elevated border border-theme-bdr hover:border-purple-500/40 transition-colors cursor-pointer ${draggable ? 'active:opacity-60' : ''}`}
    >
      <div className="flex items-start gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shrink-0 flex items-center justify-center text-white text-xs font-bold">
          {initials(c.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{c.name}</p>
          <p className="text-[11px] text-theme-text2 truncate">{c.role || 'No role'}</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1.5">
          {c.platform && (
            <span className="w-2 h-2 rounded-sm" style={{ background: PLATFORM_COLOR[c.platform] || '#888' }} title={c.platform} />
          )}
          <span className="text-theme-muted">{SOURCE_LABEL[c.source] || c.source}</span>
        </div>
        {c.rating > 0 && (
          <div className="flex items-center gap-0.5 text-amber-400">
            {Array.from({ length: c.rating }).map((_, i) => <Star key={i} size={9} fill="currentColor" />)}
          </div>
        )}
      </div>
    </div>
  )
}

function CandidateDrawer({ candidate, onClose, onUpdate, onDelete, stages, readonly }) {
  const [note, setNote] = useState('')
  const addNote = useAtsStore(s => s.addNote)
  if (!candidate) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex justify-end">
      <div className="w-full max-w-md bg-theme-bg border-l border-theme-bdr overflow-y-auto">
        <div className="sticky top-0 bg-theme-bg border-b border-theme-bdr px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
            {initials(candidate.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{candidate.name}</p>
            <p className="text-xs text-theme-text2 truncate">{candidate.role}</p>
          </div>
          <button onClick={onClose} className="text-theme-muted hover:text-theme-text"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <InfoTile icon={<Mail size={13} />}  label="Email" value={candidate.email || '—'} />
            <InfoTile icon={<Phone size={13} />} label="Phone" value={candidate.phone || '—'} />
            <InfoTile icon={<Sparkles size={13} />} label="Source" value={SOURCE_LABEL[candidate.source] || candidate.source} />
            <InfoTile icon={<Calendar size={13} />} label="Applied" value={new Date(candidate.createdAt).toLocaleDateString()} />
          </div>

          <div>
            <label className="label">Stage</label>
            <select
              className="input"
              disabled={readonly}
              value={candidate.stage}
              onChange={e => onUpdate({ stage: e.target.value })}
            >
              {stages.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Rating</label>
            <div className="flex gap-1.5">
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  disabled={readonly}
                  onClick={() => onUpdate({ rating: n === candidate.rating ? 0 : n })}
                  className="p-0.5"
                >
                  <Star
                    size={18}
                    className={n <= (candidate.rating || 0) ? 'text-amber-400' : 'text-theme-muted'}
                    fill={n <= (candidate.rating || 0) ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label flex items-center gap-1.5"><MessageSquare size={12} /> Notes</label>
            <div className="space-y-2 mb-3">
              {(candidate.notes || []).length === 0 && (
                <p className="text-xs text-theme-muted">No notes yet.</p>
              )}
              {(candidate.notes || []).map(n => (
                <div key={n.id} className="p-3 rounded-lg bg-theme-card border border-theme-bdr text-sm">
                  <p className="text-theme-text leading-relaxed">{n.text}</p>
                  <p className="text-[10px] text-theme-muted mt-1.5">{new Date(n.at).toLocaleString()}</p>
                </div>
              ))}
            </div>
            {!readonly && (
              <div className="flex gap-2">
                <input
                  className="input flex-1 text-sm"
                  placeholder="Add a note…"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && note.trim()) { addNote(candidate.id, note.trim()); setNote('') } }}
                />
                <button
                  className="btn-secondary text-sm"
                  disabled={!note.trim()}
                  onClick={() => { if (note.trim()) { addNote(candidate.id, note.trim()); setNote('') } }}
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Activity */}
          {candidate.events?.length > 0 && (
            <div>
              <label className="label">Activity</label>
              <div className="space-y-1.5 text-xs">
                {candidate.events.slice().reverse().map((e, i) => (
                  <div key={i} className="flex items-center gap-2 text-theme-text2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span>{e.type === 'stage_change' ? `Moved ${e.from} → ${e.to}` : e.type}</span>
                    <span className="ml-auto text-theme-muted">{new Date(e.at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!readonly && (
            <button
              onClick={onDelete}
              className="w-full text-sm text-red-400 hover:text-red-300 flex items-center justify-center gap-1.5 pt-4 border-t border-theme-bdr"
            >
              <Trash2 size={13} /> Delete candidate
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function AddCandidateModal({ onClose, onSave, stages }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: '', stage: 'new', source: 'manual' })
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-theme-card border border-theme-bdr rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold">Add candidate</h3>
          <button onClick={onClose} className="text-theme-muted hover:text-theme-text"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <input className="input" placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <input className="input" placeholder="Role / position" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
          <select className="input" value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}>
            {stages.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={() => onSave(form)}
            disabled={!form.name.trim()}
            className="btn-primary flex-1 disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoTile({ icon, label, value }) {
  return (
    <div className="p-3 rounded-lg bg-theme-card border border-theme-bdr">
      <p className="text-[10px] uppercase tracking-wide text-theme-muted flex items-center gap-1 mb-1">{icon} {label}</p>
      <p className="text-sm text-theme-text truncate">{value}</p>
    </div>
  )
}

function initials(name) {
  return (name || '?').split(' ').map(x => x[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
}
