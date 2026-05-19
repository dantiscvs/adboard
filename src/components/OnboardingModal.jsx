import { useState, useEffect } from 'react'
import { useAdStore } from '../store'
import { suggestJobTitle, fetchJobFromUrl } from '../utils'
import { Sparkles, ArrowRight, Loader2, Link2, ChevronDown } from 'lucide-react'

export default function OnboardingModal({ isOpen, onStart, onSkip }) {
  const ads = useAdStore(s => s.ads)
  const [mode, setMode] = useState('url')       // 'url' | 'manual'
  const [jobUrl, setJobUrl] = useState('')
  const [fetchingUrl, setFetchingUrl] = useState(false)
  const [urlError, setUrlError] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [suggestedTitle, setSuggestedTitle] = useState('')
  const [suggestionLoading, setSuggestionLoading] = useState(false)
  const [prefilled, setPrefilled] = useState(null)  // full data from URL fetch

  // Fetch AI suggestion on mount (for manual mode)
  useEffect(() => {
    if (!isOpen) return
    setMode('url')
    setJobUrl('')
    setJobTitle('')
    setCompany('')
    setPrefilled(null)
    setUrlError('')

    const previousTitles = ads.map(a => a.jobTitle).filter(Boolean)
    if (previousTitles.length === 0) return
    setSuggestionLoading(true)
    suggestJobTitle(previousTitles)
      .then(val => val && setSuggestedTitle(val))
      .finally(() => setSuggestionLoading(false))
  }, [isOpen])

  async function handleFetchUrl() {
    const url = jobUrl.trim()
    if (!url) return
    setFetchingUrl(true)
    setUrlError('')
    try {
      const data = await fetchJobFromUrl(url)
      setPrefilled({ ...data, jobUrl: url })
      if (data.jobTitle) setJobTitle(data.jobTitle)
      if (data.company)  setCompany(data.company)
      setMode('manual')
    } catch (err) {
      setUrlError(err.message || 'Could not read that URL. Try entering details manually.')
      setMode('manual')
    } finally {
      setFetchingUrl(false)
    }
  }

  function handleStart() {
    const payload = prefilled
      ? { ...prefilled, jobTitle: jobTitle || prefilled.jobTitle, company: company || prefilled.company }
      : { jobTitle: jobTitle || suggestedTitle, company }
    onStart(payload)
  }

  function handleKey(e) {
    if (e.key === 'Enter') {
      if (mode === 'url' && jobUrl.trim()) handleFetchUrl()
      else if (mode === 'manual' && (jobTitle || suggestedTitle)) handleStart()
    }
  }

  if (!isOpen) return null

  const titlePlaceholder = suggestionLoading
    ? 'Loading AI suggestion…'
    : suggestedTitle ? `${suggestedTitle} ✨` : 'e.g. Senior React Developer'

  const filledCount = prefilled ? Object.values(prefilled).filter(Boolean).length : 0

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-theme-card border border-theme-bdr2 rounded-2xl overflow-hidden shadow-2xl">
          <div className="h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500" />

          <div className="p-7">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-600/15 flex items-center justify-center">
                <Sparkles size={20} className="text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Let's build your ad</h2>
                <p className="text-sm" style={{ color: 'var(--text2)' }}>Paste a job URL to auto-fill, or start manually</p>
              </div>
            </div>

            {/* URL input — primary path */}
            <div className="mb-5">
              <label className="label flex items-center gap-1.5">
                <Link2 size={10} /> Paste your job posting URL
              </label>
              <div className="flex gap-2">
                <input
                  autoFocus
                  className="input flex-1"
                  placeholder="https://company.com/jobs/senior-developer"
                  value={jobUrl}
                  onChange={e => { setJobUrl(e.target.value); setUrlError('') }}
                  onKeyDown={handleKey}
                />
                <button
                  onClick={handleFetchUrl}
                  disabled={fetchingUrl || !jobUrl.trim()}
                  className="btn-primary flex items-center gap-1.5 whitespace-nowrap disabled:opacity-40"
                >
                  {fetchingUrl ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                  {fetchingUrl ? 'Reading…' : 'Auto-fill'}
                </button>
              </div>
              {urlError && <p className="text-[11px] text-red-400 mt-1.5">{urlError}</p>}
              {prefilled && filledCount > 0 && (
                <p className="text-[11px] text-green-400 mt-1.5 flex items-center gap-1">
                  ✓ Filled {filledCount} field{filledCount !== 1 ? 's' : ''} — review below
                </p>
              )}
            </div>

            {/* Divider */}
            <button
              onClick={() => setMode(m => m === 'manual' ? 'url' : 'manual')}
              className="w-full flex items-center gap-2 mb-5 group"
            >
              <div className="flex-1 h-px bg-theme-bdr" />
              <span className="text-[11px] text-theme-muted group-hover:text-theme-text2 flex items-center gap-1 transition-colors">
                {mode === 'manual' ? 'or use URL ↑' : 'or fill manually'}
                <ChevronDown size={10} className={`transition-transform ${mode === 'manual' ? 'rotate-180' : ''}`} />
              </span>
              <div className="flex-1 h-px bg-theme-bdr" />
            </button>

            {/* Manual fields */}
            {mode === 'manual' && (
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="label mb-0">Position title</label>
                    {suggestedTitle && !suggestionLoading && (
                      <span className="flex items-center gap-1 text-[10px] text-purple-400 bg-purple-600/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                        <Sparkles size={9} /> AI suggested
                      </span>
                    )}
                  </div>
                  <input
                    className="input"
                    placeholder={titlePlaceholder}
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    onKeyDown={handleKey}
                  />
                  {suggestedTitle && !jobTitle && (
                    <button onClick={() => setJobTitle(suggestedTitle)}
                      className="mt-1.5 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                      <Sparkles size={10} /> Use: "{suggestedTitle}"
                    </button>
                  )}
                </div>
                <div>
                  <label className="label">Company name</label>
                  <input
                    className="input"
                    placeholder={ads[ads.length - 1]?.company || 'e.g. TechCorp'}
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    onKeyDown={handleKey}
                  />
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleStart}
              disabled={mode === 'manual' && !jobTitle && !suggestedTitle}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {mode === 'url' && !prefilled
                ? <><Sparkles size={16} /> Auto-fill from URL</>
                : <>{prefilled ? 'Start creating →' : 'Start creating'} <ArrowRight size={17} /></>
              }
            </button>
          </div>

          <div className="px-7 pb-5 text-center">
            <button onClick={onSkip} className="text-xs transition-colors" style={{ color: 'var(--muted)' }}>
              Skip — fill everything manually →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
