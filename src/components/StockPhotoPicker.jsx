import { useState, useEffect } from 'react'
import { searchUnsplash, searchPexels, fetchImageAsBase64 } from '../utils'
import { X, Search, Loader2, ExternalLink, Lock, Sparkles } from 'lucide-react'
import { useAuthStore } from '../store'

// Mock premium photos (Unsplash-hosted but presented as "licensed stock")
const PREMIUM_MOCK = [
  { id: 'p1', thumb: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=60', price: 9, label: 'Team meeting' },
  { id: 'p2', thumb: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=60', price: 7, label: 'Tech workspace' },
  { id: 'p3', thumb: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=60', price: 12, label: 'Office team' },
  { id: 'p4', thumb: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&q=60', price: 8, label: 'Startup work' },
  { id: 'p5', thumb: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&q=60', price: 6, label: 'Remote desk' },
  { id: 'p6', thumb: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=60', price: 15, label: 'Business handshake' },
  { id: 'p7', thumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=60', price: 10, label: 'Professional portrait' },
  { id: 'p8', thumb: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=60', price: 11, label: 'Businesswoman' },
  { id: 'p9', thumb: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=60', price: 7, label: 'Modern office' },
]

export default function StockPhotoPicker({ isOpen, onClose, onSelect }) {
  const user = useAuthStore(s => s.user)
  const isPaid = user?.plan === 'paid'

  const [tab, setTab] = useState('free')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(null)
  const [error, setError] = useState('')
  const [source, setSource] = useState('unsplash') // unsplash | pexels
  const [premiumConfirm, setPremiumConfirm] = useState(null)

  const unsplashKey = localStorage.getItem('adboard_unsplash_key') || ''
  const pexelsKey = localStorage.getItem('adboard_pexels_key') || ''
  const hasKey = source === 'unsplash' ? !!unsplashKey : !!pexelsKey

  async function handleSearch(e) {
    e?.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setResults([])
    try {
      const photos = source === 'unsplash'
        ? await searchUnsplash(query, unsplashKey)
        : await searchPexels(query, pexelsKey)
      setResults(photos)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSelect(photo) {
    setDownloading(photo.id)
    try {
      const base64 = await fetchImageAsBase64(photo.regular, photo.downloadUrl)
      onSelect(base64, {
        photographer: photo.photographer,
        photographerUrl: photo.photographerUrl,
        source: photo.source,
        free: true,
      })
      onClose()
    } catch {
      setError('Failed to download image')
    } finally {
      setDownloading(null)
    }
  }

  async function handlePremiumSelect(photo) {
    if (!isPaid) { setPremiumConfirm({ ...photo, needsUpgrade: true }); return }
    setPremiumConfirm(photo)
  }

  async function confirmPremium() {
    if (!premiumConfirm) return
    setDownloading(premiumConfirm.id)
    setPremiumConfirm(null)
    try {
      const base64 = await fetchImageAsBase64(premiumConfirm.thumb.replace('w=400&q=60', 'w=1200&q=85'), null)
      onSelect(base64, {
        photographer: 'Premium Stock',
        source: 'Premium',
        free: false,
        cost: premiumConfirm.price,
      })
      onClose()
    } catch {
      setError('Failed to download premium image')
    } finally {
      setDownloading(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-theme-card border border-theme-bdr rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-theme-bdr">
          <div>
            <h2 className="font-semibold">Stock Photos</h2>
            <p className="text-xs text-gray-500">Search free & premium images for your ad</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3">
          {['free', 'premium'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              {t === 'premium' ? '✨ Premium' : '🆓 Free'}
            </button>
          ))}
        </div>

        {/* Free tab */}
        {tab === 'free' && (
          <>
            {/* Source + search */}
            <div className="px-5 py-3 space-y-3">
              <div className="flex gap-2">
                {[{ id: 'unsplash', label: 'Unsplash' }, { id: 'pexels', label: 'Pexels' }].map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setSource(s.id); setResults([]) }}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${source === s.id ? 'bg-purple-600/20 border-purple-500/40 text-purple-300' : 'bg-theme-elevated border-theme-bdr2 text-gray-400'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {!hasKey && (
                <div className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
                  <span>⚠</span>
                  Configure your {source === 'unsplash' ? 'Unsplash' : 'Pexels'} API key in chatbot settings (⚙️) to search photos.
                </div>
              )}

              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    className="input pl-8"
                    placeholder={`Search ${source === 'unsplash' ? 'Unsplash' : 'Pexels'} photos…`}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    disabled={!hasKey}
                  />
                </div>
                <button type="submit" disabled={!query.trim() || !hasKey || loading} className="btn-primary px-4 disabled:opacity-40">
                  {loading ? <Loader2 size={15} className="animate-spin" /> : 'Search'}
                </button>
              </form>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto px-5 pb-5">
              {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
              {results.length === 0 && !loading && (
                <div className="text-center py-10 text-gray-600 text-sm">
                  <Search size={28} className="mx-auto mb-2 text-gray-700" />
                  Search for "job interview", "office team", "developer", etc.
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                {results.map(photo => (
                  <div key={photo.id} className="relative group rounded-lg overflow-hidden bg-theme-bg">
                    <img src={photo.thumb} alt={photo.photographer} className="w-full h-28 object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                      <button
                        onClick={() => handleSelect(photo)}
                        disabled={downloading === photo.id}
                        className="btn-primary text-xs w-full flex items-center justify-center gap-1"
                      >
                        {downloading === photo.id ? <Loader2 size={12} className="animate-spin" /> : null}
                        Use photo
                      </button>
                      <a
                        href={photo.photographerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-gray-300 hover:text-white flex items-center gap-1"
                        onClick={e => e.stopPropagation()}
                      >
                        {photo.photographer} <ExternalLink size={9} />
                      </a>
                    </div>
                    <div className="absolute bottom-1 left-1">
                      <span className="bg-green-500/80 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">Free</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Premium tab */}
        {tab === 'premium' && (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <p className="text-xs text-gray-500 mb-4">
              Premium photos are licensed and include in your campaign cost. Prices shown in USD.
              {!isPaid && <span className="text-yellow-400 ml-1">Upgrade your plan to unlock purchasing.</span>}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {PREMIUM_MOCK.map(photo => (
                <div key={photo.id} className="relative group rounded-lg overflow-hidden bg-theme-bg">
                  <img src={photo.thumb} alt={photo.label} className="w-full h-28 object-cover" />
                  {!isPaid && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Lock size={18} className="text-white/70" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    <button
                      onClick={() => handlePremiumSelect(photo)}
                      disabled={downloading === photo.id}
                      className="btn-primary text-xs w-full flex items-center justify-center gap-1"
                    >
                      {downloading === photo.id ? <Loader2 size={12} className="animate-spin" /> : isPaid ? `Buy $${photo.price}` : <><Lock size={10} /> Pro only</>}
                    </button>
                    <p className="text-[10px] text-gray-300">{photo.label}</p>
                  </div>
                  <div className="absolute bottom-1 right-1">
                    <span className="bg-purple-600/90 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">${photo.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Premium confirm dialog */}
        {premiumConfirm && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-6 rounded-2xl z-10">
            <div className="bg-theme-elevated border border-theme-bdr2 rounded-xl p-5 w-full max-w-sm">
              {premiumConfirm.needsUpgrade ? (
                <>
                  <p className="font-semibold mb-1">Pro feature</p>
                  <p className="text-sm text-gray-400 mb-4">Upgrade to Pro to purchase premium stock photos.</p>
                  <button onClick={() => setPremiumConfirm(null)} className="btn-secondary w-full">Got it</button>
                </>
              ) : (
                <>
                  <p className="font-semibold mb-1">Use premium photo?</p>
                  <p className="text-sm text-gray-400 mb-1">This will add <span className="text-white font-medium">${premiumConfirm.price}</span> to your campaign cost.</p>
                  <p className="text-xs text-gray-600 mb-4">"{premiumConfirm.label}"</p>
                  <div className="flex gap-2">
                    <button onClick={() => setPremiumConfirm(null)} className="btn-secondary flex-1">Cancel</button>
                    <button onClick={confirmPremium} className="btn-primary flex-1">Confirm ${premiumConfirm.price}</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
