import { useState, useRef, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { toPng } from 'html-to-image'
import { saveAs } from 'file-saver'
import { useAdStore, useBrandKitStore } from '../store'
import { PLATFORMS, CTA_OPTIONS, JOB_TYPES, AD_PREVIEW_PLATFORMS, FONT_LIST, EXPORT_SIZES, PLATFORM_COPY_LIMITS, LANGUAGES, CANVAS_FORMATS, TEMPLATE_I18N } from '../constants'
import { exportAdAsJson, readJsonFile, resizeImageToBase64, generateAdCopy, fetchLogoFromUrl, fetchJobFromUrl, loadGoogleFont, parseJobTextWithGroq, parseJobTextViaLLM, translateAdContent } from '../utils'
import { Muxer, ArrayBufferTarget } from 'mp4-muxer'
import { track } from '../analytics'
import {
  Plus, Upload, Trash2, Download, FileJson, Image, Eye,
  X, ChevronLeft, Briefcase, MapPin, DollarSign, Loader2,
  Sparkles, Camera, PenLine, LayoutTemplate, Monitor, Check,
  Copy, Palette, AlertTriangle, TrendingUp, Globe, Link2,
  Type, ChevronDown, Maximize2, MousePointer2,
  Undo2, Redo2, ScanLine, ImagePlus, ChevronRight,
} from 'lucide-react'
import Logo from '../components/Logo'
import OnboardingModal from '../components/OnboardingModal'
import StockPhotoPicker from '../components/StockPhotoPicker'
import { TEMPLATES, TemplateThumbnail, FormatWrapper } from '../components/AdTemplates'
import AdPreviews, { SafeZoneOverlay } from '../components/AdPreviews'

const EMPTY_AD = {
  name: '',
  company: '',
  jobTitle: '',
  location: '',
  salary: '',
  jobType: 'Full-time',
  headline: '',
  primaryText: '',
  jobUrl: '',
  ctaText: 'Apply Now',
  imageUrl: null,
  logoUrl: null,
  customFile: null,
  imageAttribution: null,
  brandColor: '#7c3aed',
  textColor: '',
  subTextColor: '',
  fontFamily: 'Inter',
  customFontData: null,
  customFontName: '',
  customTags: [],
  language: 'English',
  hiringTagline: '',
  platforms: [],
  templateId: 'tags',
  titleScale: 1,
  logoScale: 1,
  tagScale: 1,
  spacingScale: 1,
  ctaScale: 1,
  companyScale: 1,
  taglineScale: 1,
  headlineScale: 1,
  logoBg: 'transparent',
  format: 'square',
  // Background image positioning
  imageFocalX: 50,   // 0-100 — horizontal focal point (objectPosition x)
  imageFocalY: 50,   // 0-100 — vertical focal point   (objectPosition y)
  imageZoom: 1,      // 1.0-2.5 — zoom multiplier applied via transform scale
  // Animation
  animEffect: 'fade',    // 'none' | 'fade' | 'typewriter'
  // Color style / theme
  colorStyle: 'default', // 'default' | 'branded' | 'gradient' | 'dark'
}

// ── Quality score calculator ──────────────────────────────────────────────────
function calcQualityScore(ad) {
  let score = 0
  const checks = []
  if (ad.jobTitle)                    { score += 20; checks.push({ ok: true,  label: 'Job title' }) }
  else                                {              checks.push({ ok: false, label: 'Add job title' }) }
  if (ad.company)                     { score += 10; checks.push({ ok: true,  label: 'Company name' }) }
  else                                {              checks.push({ ok: false, label: 'Add company name' }) }
  if (ad.location)                    { score += 10; checks.push({ ok: true,  label: 'Location' }) }
  else                                {              checks.push({ ok: false, label: 'Add location' }) }
  if (ad.salary)                      { score += 10; checks.push({ ok: true,  label: 'Salary info' }) }
  else                                {              checks.push({ ok: false, label: 'Add salary range' }) }
  if (ad.headline?.length > 5)        { score += 10; checks.push({ ok: true,  label: 'Headline' }) }
  else                                {              checks.push({ ok: false, label: 'Write headline' }) }
  if (ad.primaryText?.length > 20)    { score += 15; checks.push({ ok: true,  label: 'Primary text' }) }
  else                                {              checks.push({ ok: false, label: 'Write primary text' }) }
  if (ad.imageUrl)                    { score += 15; checks.push({ ok: true,  label: 'Ad image' }) }
  else                                {              checks.push({ ok: false, label: 'Add ad image' }) }
  if (ad.logoUrl)                     { score += 5;  checks.push({ ok: true,  label: 'Company logo' }) }
  else                                {              checks.push({ ok: false, label: 'Upload logo' }) }
  if (ad.platforms?.length > 0)       { score += 5;  checks.push({ ok: true,  label: 'Platforms set' }) }
  else                                {              checks.push({ ok: false, label: 'Select platforms' }) }
  return { score, checks }
}

function scoreColor(score) {
  if (score >= 80) return { text: 'text-green-400', bg: 'bg-green-400', label: 'Great' }
  if (score >= 55) return { text: 'text-yellow-400', bg: 'bg-yellow-400', label: 'Fair' }
  return { text: 'text-red-400', bg: 'bg-red-400', label: 'Needs work' }
}

// Extract hashtag suggestions from scraped job data
function extractHashtags(data) {
  const tags = []
  if (data.description) {
    const skills = [
      'React','Vue','Angular','TypeScript','JavaScript','Python','Java','Go','Swift','Kotlin','Rust',
      'Node.js','Next.js','Docker','Kubernetes','AWS','GCP','Azure','PostgreSQL','MongoDB','GraphQL',
      'Remote','Hybrid','AI','ML','Agile','Scrum',
    ]
    skills
      .filter(kw => new RegExp(`\\b${kw.replace('.', '\\.')}\\b`, 'i').test(data.description))
      .slice(0, 6)
      .forEach(kw => tags.push({ key: kw, value: '' }))
  }
  return tags
}

function parseJobText(raw) {
  const text = raw || ''
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const result = {}

  // ── Job title ──────────────────────────────────────────────────────────────
  // Strategy: prefer a line that looks like a job title (contains role keywords),
  // otherwise fall back to the first short line.
  const ROLE_RE = /\b(engineer|developer|designer|manager|analyst|lead|director|specialist|coordinator|recruiter|architect|officer|consultant|executive|associate|intern|devops|qa|tester|writer|marketing|sales|support|operations|product|growth)\b/i
  const cleanTitle = l => l.replace(/^(?:we['’]?re\s+(?:looking\s+for|hiring)[:\s]*|job(?:\s*title)?[:\s]+|position[:\s]+|role[:\s]+)/i, '').trim()
  const titleLine = lines.find(l => ROLE_RE.test(l) && l.length < 120)
  if (titleLine) result.jobTitle = cleanTitle(titleLine)
  else if (lines[0] && lines[0].length < 100) result.jobTitle = cleanTitle(lines[0])

  // ── Company ────────────────────────────────────────────────────────────────
  // "at CompanyX", "@ CompanyX", "Company: X", "About CompanyX"
  const coPatterns = [
    /company\s*:\s*([^\n,;.!?]{2,50})/i,
    /(?:^|\n|\.\s+|\s{2,})(?:at|@)\s+([A-Z][^\n,;.!?]{1,50})(?=\s|$)/m,
    /about\s+([A-Z][^\n,;.!?]{1,50})/i,
    /(?:^|\n)([A-Z][A-Za-z0-9&\s.,']{1,40})\s+is\s+(?:hiring|looking)/m,
  ]
  for (const re of coPatterns) {
    const m = text.match(re)
    if (m && m[1]?.trim().length > 1) { result.company = m[1].trim(); break }
  }

  // ── Location ───────────────────────────────────────────────────────────────
  const locPatterns = [
    /(?:location|lokalizacja|miejsce\s+pracy)\s*[:\-]\s*([^\n,;]{2,60})/i,
    /📍\s*([^\n,;]{2,60})/,
    /(?:based\s+in|office\s*(?:in|at))\s*[:\-]?\s*([^\n,;]{2,50})/i,
  ]
  for (const re of locPatterns) {
    const m = text.match(re)
    if (m) { result.location = m[1].trim(); break }
  }
  if (!result.location) {
    if (/\bfully\s+remote\b/i.test(text)) result.location = 'Fully Remote'
    else if (/\bremote\b/i.test(text) && /\bhybrid\b/i.test(text)) result.location = 'Remote / Hybrid'
    else if (/\bremote\b/i.test(text)) result.location = 'Remote'
    else if (/\bhybrid\b/i.test(text)) result.location = 'Hybrid'
  }

  // ── Salary ─────────────────────────────────────────────────────────────────
  const salPatterns = [
    /(?:salary|wynagrodzenie|zarobki|pay|compensation)\s*[:\-]\s*([^\n]{2,70})/i,
    /💰\s*([^\n]{2,70})/,
    // currency ranges like $80k-$100k, €50,000–€70,000, 15000-25000 PLN
    /[\$€£]\s*[\d,.]+(?:\s*[–\-]\s*[\$€£]?\s*[\d,.]+)?(?:\s*[kKmM])?/,
    /\b[\d][\d\s,.]*(?:PLN|USD|EUR|GBP|zł|tys\.?|k)\b(?:\s*[–\-]\s*[\d][\d\s,.]*(?:PLN|USD|EUR|GBP|zł|tys\.?|k))?/i,
  ]
  for (const re of salPatterns) {
    const m = text.match(re)
    if (m) { result.salary = (m[1] || m[0]).trim().slice(0, 60); break }
  }

  // ── Job type ───────────────────────────────────────────────────────────────
  if (/\bfull[\s-]time\b|\bpełny\s+etat\b/i.test(text))           result.jobType = 'Full-time'
  else if (/\bpart[\s-]time\b|\bczęść\s+etatu\b/i.test(text))     result.jobType = 'Part-time'
  else if (/\b(b2b|contract|kontrakt)\b/i.test(text))             result.jobType = 'Contract'
  else if (/\bfreelance\b/i.test(text))                           result.jobType = 'Freelance'
  else if (/\b(internship|staż|praktyk)/i.test(text))             result.jobType = 'Internship'

  // ── Description (for tag extraction) ───────────────────────────────────────
  result.description = text

  return result
}

export default function AdsPage() {
  const ads = useAdStore(s => s.ads)
  const addAd = useAdStore(s => s.addAd)
  const updateAd = useAdStore(s => s.updateAd)
  const deleteAd = useAdStore(s => s.deleteAd)
  const importAd = useAdStore(s => s.importAd)
  const brandKit = useBrandKitStore()

  const [view, setView] = useState('list')
  const [editingAd, setEditingAd] = useState(null)
  const [form, setForm] = useState(EMPTY_AD)
  const [savedForm, setSavedForm] = useState(EMPTY_AD)
  const [activeTab, setActiveTab] = useState('job')
  const [pasteText, setPasteText] = useState('')
  const [showPasteField, setShowPasteField] = useState(false)
  const [previewPlatform, setPreviewPlatform] = useState('facebook')
  const [saving, setSaving] = useState(false)
  const [exportingImg, setExportingImg] = useState(false)
  const [toast, setToast] = useState(null)
  const [showImport, setShowImport] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showStockPicker, setShowStockPicker] = useState(false)
  const [stockTarget, setStockTarget] = useState('imageUrl')
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showCustomExport, setShowCustomExport] = useState(false)
  const [logoUrlInput, setLogoUrlInput] = useState('')
  const [fetchingLogo, setFetchingLogo] = useState(false)
  const [fetchingJob, setFetchingJob] = useState(false)
  const [selectedField, setSelectedField] = useState(null)
  const [showSafeZones, setShowSafeZones] = useState(true)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const historyRef = useRef([])
  const historyIdxRef = useRef(-1)
  const historyTimerRef = useRef(null)
  const isUndoRedoRef = useRef(false)
  // Resizable left panel
  const [leftPanelWidth, setLeftPanelWidth] = useState(300)
  const panelResizingRef = useRef(false)
  const panelResizeStartX = useRef(0)
  const panelResizeStartW = useRef(0)
  // Resizable right panel
  const [rightPanelWidth, setRightPanelWidth] = useState(360)
  const rightPanelResizingRef = useRef(false)
  const rightPanelResizeStartX = useRef(0)
  const rightPanelResizeStartW = useRef(0)
  // AI translation
  const [translating, setTranslating] = useState(false)
  // Animation preview & video export
  const [showAnimation, setShowAnimation] = useState(false)
  const [animKey, setAnimKey] = useState(0)
  const [exportingMp4, setExportingMp4] = useState(false)

  // Ref for hidden full-size template export (avoids scale artifacts)
  const exportRef = useRef(null)
  // Ref for platform preview export
  const platformRef = useRef(null)
  // Ref for animated video export (separate from static exportRef)
  const animExportRef = useRef(null)

  // Load Google Font whenever fontFamily changes
  useEffect(() => {
    if (form.fontFamily) loadGoogleFont(form.fontFamily.replace(/ /g, '+'))
  }, [form.fontFamily])

  // Re-register custom font from stored base64 (survives page reload)
  useEffect(() => {
    if (form.customFontData && form.customFontName) {
      const face = new FontFace(form.customFontName, `url(${form.customFontData})`)
      face.load().then(f => document.fonts.add(f)).catch(() => {})
    }
  }, [form.customFontData, form.customFontName])

  // Push form to undo history (debounced 500ms, skipped during undo/redo)
  useEffect(() => {
    if (view !== 'editor' || isUndoRedoRef.current) return
    if (historyTimerRef.current) clearTimeout(historyTimerRef.current)
    historyTimerRef.current = setTimeout(() => {
      const cur = historyRef.current[historyIdxRef.current]
      if (cur && JSON.stringify(cur) === JSON.stringify(form)) return
      historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1)
      historyRef.current.push({ ...form })
      if (historyRef.current.length > 80) historyRef.current.shift()
      else historyIdxRef.current++
      setCanUndo(historyIdxRef.current > 0)
      setCanRedo(false)
    }, 500)
  }, [form, view])

  // Keyboard shortcuts: Ctrl+Z / Ctrl+Y when in editor, skip input elements
  useEffect(() => {
    if (view !== 'editor') return
    function onKey(e) {
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo() }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); handleRedo() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [view])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function openNew() {
    setEditingAd(null)
    setForm(EMPTY_AD)
    setSavedForm(EMPTY_AD)
    historyRef.current = []; historyIdxRef.current = -1
    setCanUndo(false); setCanRedo(false)
    setView('editor')
    setShowOnboarding(true)
  }

  function openEdit(ad) {
    setEditingAd(ad)
    const base = { ...EMPTY_AD, ...ad }
    setForm(base)
    setSavedForm(base)
    historyRef.current = []; historyIdxRef.current = -1
    setCanUndo(false); setCanRedo(false)
    setView('editor')
    setShowOnboarding(false)
  }

  function openPreview(ad) {
    setEditingAd(ad)
    setForm({ ...EMPTY_AD, ...ad })
    setView('preview')
  }

  function handleOnboardingStart({ jobTitle, company, jobUrl, location, salary, jobType, primaryText }) {
    setShowOnboarding(false)
    setForm(f => ({
      ...f,
      ...(jobTitle   ? { jobTitle, name: jobTitle } : {}),
      ...(company    ? { company } : {}),
      ...(jobUrl     ? { jobUrl } : {}),
      ...(location   ? { location } : {}),
      ...(salary     ? { salary } : {}),
      ...(jobType    ? { jobType } : {}),
      ...(primaryText? { primaryText } : {}),
    }))
  }

  async function handleSave() {
    if (!form.jobTitle && !form.name) { showToast('Add a job title first', 'error'); return }
    setSaving(true)
    try {
      if (editingAd) {
        updateAd(editingAd.id, form)
        track('ad_saved', { templateId: form.templateId, hasImage: !!form.imageUrl })
        showToast('Ad updated')
      } else {
        addAd({ ...form, name: form.name || form.jobTitle })
        track('ad_created', { templateId: form.templateId, fontFamily: form.fontFamily })
        showToast('Ad saved')
      }
      setView('list')
    } finally {
      setSaving(false)
    }
  }

  async function handleDownloadTemplate() {
    if (!exportRef.current) return
    setExportingImg(true)
    try {
      const dataUrl = await toPng(exportRef.current, { pixelRatio: 1, cacheBust: true })
      saveAs(dataUrl, `${form.name || form.jobTitle || 'ad'}-${form.templateId}.png`)
      track('export_png', { templateId: form.templateId, size: '1080x1080' })
      showToast('PNG downloaded!')
    } catch (err) {
      console.error(err)
      showToast('Export failed', 'error')
    } finally {
      setExportingImg(false)
    }
  }

  async function handleDownloadCustom(w, h, label) {
    if (!exportRef.current) return
    setExportingImg(true)
    try {
      // html-to-image renders at native 1080×1080; use pixelRatio to scale
      const ratio = Math.max(w / 1080, h / 1080)
      const dataUrl = await toPng(exportRef.current, { pixelRatio: ratio, cacheBust: true })
      saveAs(dataUrl, `${form.name || form.jobTitle || 'ad'}-${w}x${h}.png`)
      track('export_png', { templateId: form.templateId, size: `${w}x${h}`, label })
      showToast(`${w}×${h} PNG downloaded!`)
    } catch {
      showToast('Export failed', 'error')
    } finally {
      setExportingImg(false)
    }
  }

  async function handleDownloadPlatform() {
    if (!platformRef.current) return
    setExportingImg(true)
    try {
      const dataUrl = await toPng(platformRef.current, { pixelRatio: 2, cacheBust: true })
      saveAs(dataUrl, `${form.name || form.jobTitle || 'ad'}-${previewPlatform}.png`)
      track('export_png', { platform: previewPlatform, type: 'platform_preview' })
      showToast('PNG downloaded!')
    } catch (err) {
      showToast('Export failed', 'error')
    } finally {
      setExportingImg(false)
    }
  }

  async function handleExportMp4() {
    if (!animExportRef.current) return
    if (!('VideoEncoder' in window)) {
      showToast('Video export requires Chrome 94+. Please update your browser.', 'error')
      return
    }

    const fmt = CANVAS_FORMATS.find(f => f.id === (form.format || 'square')) || CANVAS_FORMATS[0]
    const W = fmt.w, H = fmt.h
    const FPS = 12
    const DURATION_MS = 3600 // animation (~2.5s) + 1s hold

    // ── Codec config (avcc format — mp4-muxer requires avcc, not annexb) ─────
    // Note: `avc` option was added in Chrome 107 — exclude it from isConfigSupported()
    // to avoid false negatives on Chrome 94-106, but include it in configure().
    const baseConfig = {
      codec:     'avc1.42001f', // H.264 Baseline Profile Level 3.1
      width:     W,
      height:    H,
      bitrate:   5_000_000,
      framerate: FPS,
    }
    const encoderConfig = { ...baseConfig, avc: { format: 'avc' } }

    // Pre-check codec support (using only the base params)
    try {
      const { supported } = await VideoEncoder.isConfigSupported(baseConfig)
      if (!supported) {
        showToast('H.264 encoding not supported on this device. Enable hardware acceleration in chrome://settings.', 'error')
        return
      }
    } catch {
      showToast('Could not verify codec support. Make sure you are using Chrome 94+.', 'error')
      return
    }

    setExportingMp4(true)

    // Restart all CSS animations on the off-screen element without re-mounting
    const el = animExportRef.current
    el.getAnimations({ subtree: true }).forEach(a => { a.cancel(); a.play() })
    await new Promise(r => setTimeout(r, 80)) // let first frame paint

    try {
      // mp4-muxer: accumulate encoded H.264 chunks in memory
      const muxer = new Muxer({
        target: new ArrayBufferTarget(),
        video: { codec: 'avc', width: W, height: H },
        fastStart: 'in-memory',
      })

      let encoderError = null
      const encoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: e => { encoderError = e; console.error('VideoEncoder error:', e) },
      })
      encoder.configure(encoderConfig)

      // Offscreen canvas (no alpha — H.264 doesn't carry alpha)
      const cvs = document.createElement('canvas')
      cvs.width = W; cvs.height = H
      const ctx = cvs.getContext('2d', { alpha: false })

      const animStart = Date.now()
      let frameIdx = 0

      while (Date.now() - animStart < DURATION_MS) {
        if (encoderError) break
        try {
          // cacheBust:true ensures external resources (fonts, images) load correctly
          const png = await toPng(el, { pixelRatio: 1, cacheBust: true })
          await new Promise((res, rej) => {
            const img = new Image()
            img.onload = () => { ctx.drawImage(img, 0, 0, W, H); res() }
            img.onerror = rej
            img.src = png
          })
          const ts  = Math.round(frameIdx * (1_000_000 / FPS))
          const dur = Math.round(1_000_000 / FPS)
          const frame = new VideoFrame(cvs, { timestamp: ts, duration: dur })
          encoder.encode(frame, { keyFrame: frameIdx % FPS === 0 })
          frame.close()
          frameIdx++
        } catch (frameErr) {
          console.warn('Frame skipped:', frameErr)
        }
        await new Promise(r => setTimeout(r, 1000 / FPS))
      }

      // Surface any async encoder error before flushing
      if (encoderError) throw encoderError

      await encoder.flush()
      muxer.finalize()

      const buffer = muxer.target.buffer
      if (!buffer || buffer.byteLength === 0) throw new Error('Muxer produced an empty file')

      saveAs(new Blob([buffer], { type: 'video/mp4' }), `${form.name || form.jobTitle || 'ad'}-animated.mp4`)
      track('export_mp4', { templateId: form.templateId, animEffect: form.animEffect, frames: frameIdx })
      showToast(`MP4 downloaded! (${frameIdx} frames)`)
    } catch (err) {
      console.error('MP4 export error:', err)
      showToast(`Video export failed: ${err?.message || err}`, 'error')
    } finally {
      setExportingMp4(false)
    }
  }

  function handleExportJson(ad) {
    exportAdAsJson(ad)
    track('export_json', { adId: ad.id })
    showToast('JSON exported')
  }

  function handleDeleteAd(id) {
    if (!confirm('Delete this ad?')) return
    deleteAd(id)
    track('ad_deleted')
    showToast('Ad deleted')
  }

  function handleDuplicateAd(ad) {
    const { id, createdAt, updatedAt, importedAt, ...rest } = ad
    addAd({ ...rest, name: `${rest.name || rest.jobTitle || 'Ad'} (copy)` })
    track('ad_duplicated')
    showToast('Ad duplicated')
  }

  function applyBrandKit() {
    setForm(f => ({
      ...f,
      ...(brandKit.company ? { company: brandKit.company } : {}),
      ...(brandKit.logoUrl ? { logoUrl: brandKit.logoUrl } : {}),
      brandColor: brandKit.brandColor,
    }))
    track('brand_kit_applied')
    showToast('Brand kit applied')
  }

  async function handleFetchLogo() {
    if (!logoUrlInput.trim()) return
    setFetchingLogo(true)
    try {
      const base64 = await fetchLogoFromUrl(logoUrlInput.trim())
      setForm(f => ({ ...f, logoUrl: base64 }))
      track('logo_fetched', { success: true, url: logoUrlInput.trim() })
      showToast('Logo fetched!')
      setLogoUrlInput('')
    } catch (err) {
      track('logo_fetched', { success: false })
      showToast(err.message || 'Could not fetch logo', 'error')
    } finally {
      setFetchingLogo(false)
    }
  }

  async function handleFetchJob() {
    if (!form.jobUrl?.trim()) return
    setFetchingJob(true)
    try {
      const data = await fetchJobFromUrl(form.jobUrl.trim())
      const autoTags = extractHashtags(data)
      setForm(f => ({
        ...f,
        ...(data.jobTitle ? { jobTitle: data.jobTitle, name: data.jobTitle } : {}),
        ...(data.company ? { company: data.company } : {}),
        ...(data.location ? { location: data.location } : {}),
        ...(data.salary ? { salary: data.salary } : {}),
        ...(data.description ? { primaryText: data.description } : {}),
        ...(data.jobType ? { jobType: data.jobType } : {}),
        customTags: autoTags,
      }))
      const filled = Object.keys(data).length
      track('job_url_fetched', { success: true, fields: filled })
      showToast(`Auto-filled ${filled} fields + ${autoTags.length} tags!`)
    } catch (err) {
      track('job_url_fetched', { success: false })
      showToast(err.message || 'Could not fetch job data', 'error')
    } finally {
      setFetchingJob(false)
    }
  }

  async function handleCustomFontUpload(file) {
    const safeName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_')
    const fontName = `CustomFont_${safeName}`
    try {
      const arrayBuffer = await file.arrayBuffer()
      const face = new FontFace(fontName, arrayBuffer)
      await face.load()
      document.fonts.add(face)
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => resolve(e.target.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      setForm(f => ({ ...f, fontFamily: fontName, customFontData: base64, customFontName: fontName }))
      track('custom_font_uploaded', { name: file.name })
      showToast(`Font "${file.name}" loaded!`)
    } catch {
      showToast('Failed to load font file', 'error')
    }
  }

  async function handleImportJson(file) {
    try {
      const data = await readJsonFile(file)
      const imported = importAd(data)
      showToast('Ad imported!')
      setShowImport(false)
      openEdit(imported)
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  async function handleImageUpload(file, field) {
    try {
      const base64 = await resizeImageToBase64(file)
      setForm(f => ({ ...f, [field]: base64, ...(field === 'imageUrl' ? { imageAttribution: null } : {}) }))
    } catch {
      showToast('Image upload failed', 'error')
    }
  }

  function handleStockSelect(base64, attribution) {
    setForm(f => ({ ...f, [stockTarget]: base64, ...(stockTarget === 'imageUrl' ? { imageAttribution: attribution } : {}) }))
    showToast(`${attribution?.source} photo added`)
  }

  function setField(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function handleDiscard() { setForm(savedForm) }

  function handleUndo() {
    if (historyIdxRef.current <= 0) return
    isUndoRedoRef.current = true
    historyIdxRef.current--
    setForm({ ...historyRef.current[historyIdxRef.current] })
    setCanUndo(historyIdxRef.current > 0)
    setCanRedo(true)
    setTimeout(() => { isUndoRedoRef.current = false }, 20)
  }

  function handleRedo() {
    if (historyIdxRef.current >= historyRef.current.length - 1) return
    isUndoRedoRef.current = true
    historyIdxRef.current++
    setForm({ ...historyRef.current[historyIdxRef.current] })
    setCanUndo(true)
    setCanRedo(historyIdxRef.current < historyRef.current.length - 1)
    setTimeout(() => { isUndoRedoRef.current = false }, 20)
  }

  async function handleCustomFileUpload(file) {
    try {
      const base64 = await resizeImageToBase64(file, 1920)
      setField('customFile', base64)
      track('custom_file_uploaded')
      showToast('Custom design uploaded!')
    } catch {
      showToast('Upload failed', 'error')
    }
  }

  function handleFieldClick(fieldName) {
    setSelectedField(fieldName)
    setActiveTab('design')
  }

  // ── Language change → auto-translate all copy via Groq ─────────────────────
  async function handleLanguageChange(newLang) {
    const i18n    = TEMPLATE_I18N[newLang]               || {}
    const engI18n = TEMPLATE_I18N['English']             || {}
    // prevI18n: the strings from the language that's being LEFT.
    // We need this so switching Polish → French still recognises 'Aplikuj teraz'
    // as an i18n-managed value (not a user-customised one).
    const prevI18n = TEMPLATE_I18N[form.language || 'English'] || {}

    // 1️⃣  Fields covered by TEMPLATE_I18N — apply immediately, zero latency.
    //     ctaText:      replace if it's still an auto-managed value in ANY language
    //     hiringTagline:replace if it's empty or is an auto-managed value in ANY language
    const ctaIsDefault     = !form.ctaText || CTA_OPTIONS.includes(form.ctaText) ||
                             form.ctaText === engI18n.cta || form.ctaText === prevI18n.cta
    const taglineIsDefault = !form.hiringTagline ||
                             form.hiringTagline === engI18n.tagline  ||
                             form.hiringTagline === engI18n.isHiring ||
                             form.hiringTagline === prevI18n.tagline ||
                             form.hiringTagline === prevI18n.isHiring

    const i18nUpdates = {
      language: newLang,
      ...(ctaIsDefault     && i18n.cta     ? { ctaText:       i18n.cta     } : {}),
      ...(taglineIsDefault && i18n.tagline  ? { hiringTagline: i18n.tagline } : {}),
    }
    setForm(f => ({ ...f, ...i18nUpdates }))

    // 2️⃣  Free-text copy → Groq (headline, primaryText, custom tag keys/values).
    //     hiringTagline and ctaText are skipped here (i18n handles them above).
    const apiKey    = localStorage.getItem('adboard_groq_key')
    const hasGroqContent = form.headline || form.primaryText || form.jobTitle ||
      (form.customTags || []).some(t => t.key || t.value)
    if (!apiKey || !hasGroqContent || newLang === (form.language || 'English')) return

    setTranslating(true)
    try {
      const translated = await translateAdContent({ ...form, ...i18nUpdates }, newLang)
      if (translated) {
        setForm(f => ({ ...f, ...i18nUpdates, ...translated }))
        showToast(`Content translated to ${newLang}`)
      } else {
        showToast('Add a Groq API key in Account settings to enable auto-translation', 'error')
      }
    } catch {
      showToast('Translation failed', 'error')
    } finally {
      setTranslating(false)
    }
  }

  // ── Left panel drag-to-resize ───────────────────────────────────────────────
  function startPanelResize(e) {
    panelResizingRef.current = true
    panelResizeStartX.current = e.clientX
    panelResizeStartW.current = leftPanelWidth
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }
  // ── Right panel drag-to-resize ──────────────────────────────────────────────
  function startRightPanelResize(e) {
    rightPanelResizingRef.current = true
    rightPanelResizeStartX.current = e.clientX
    rightPanelResizeStartW.current = rightPanelWidth
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }
  useEffect(() => {
    function onMove(e) {
      if (panelResizingRef.current) {
        const delta = e.clientX - panelResizeStartX.current
        setLeftPanelWidth(Math.min(640, Math.max(240, panelResizeStartW.current + delta)))
      }
      if (rightPanelResizingRef.current) {
        // drag left = increase right panel width
        const delta = rightPanelResizeStartX.current - e.clientX
        setRightPanelWidth(Math.min(600, Math.max(240, rightPanelResizeStartW.current + delta)))
      }
    }
    function onUp() {
      if (panelResizingRef.current || rightPanelResizingRef.current) {
        panelResizingRef.current = false
        rightPanelResizingRef.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  const [parsingText, setParsingText] = useState(false)

  async function handlePasteText() {
    if (!pasteText.trim()) return
    setParsingText(true)
    try {
      const hasGroq = !!localStorage.getItem('adboard_groq_key')
      const hasN8n  = !!localStorage.getItem('adboard_n8n_url')
      const hasAI   = hasGroq || hasN8n

      // 1. Try direct Groq first, then n8n, then regex
      let data = null
      let source = 'regex'
      if (hasGroq) {
        data = await parseJobTextWithGroq(pasteText)
        if (data && Object.values(data).some(Boolean)) source = 'AI'
      }
      if ((!data || !Object.values(data).some(Boolean)) && hasN8n) {
        data = await parseJobTextViaLLM(pasteText)
        if (data && Object.values(data).some(Boolean)) source = 'AI'
      }

      // 2. Fallback to local regex parser
      if (!data || !Object.values(data).some(Boolean)) {
        data = parseJobText(pasteText)
        source = 'regex'
      }

      // Always attach full text as description for tag extraction
      if (!data.description) data.description = pasteText

      // Prefer LLM-returned tags; fall back to keyword scraper
      const llmTags = Array.isArray(data.tags)
        ? data.tags.filter(Boolean).map(t => ({ key: String(t), value: '' }))
        : []
      const autoTags = llmTags.length > 0 ? llmTags : extractHashtags(data)

      setForm(f => ({
        ...f,
        ...(data.jobTitle    ? { jobTitle: data.jobTitle, name: data.jobTitle } : {}),
        ...(data.company     ? { company: data.company } : {}),
        ...(data.location    ? { location: data.location } : {}),
        ...(data.salary      ? { salary: data.salary } : {}),
        ...(data.jobType     ? { jobType: data.jobType } : {}),
        ...(data.description ? { primaryText: data.description } : {}),
        ...(autoTags.length  ? { customTags: autoTags } : {}),
      }))

      setPasteText('')
      setShowPasteField(false)

      const LABELS = { jobTitle: 'title', company: 'company', location: 'location', salary: 'salary', jobType: 'type', tags: 'tags' }
      const filled = Object.keys(data).filter(k => !['description', 'tags'].includes(k) && data[k])
      if (filled.length === 0) {
        showToast(
          hasAI
            ? 'AI found nothing — check your Groq key or try more structured text'
            : 'Could not detect fields. Add a Groq API key in Account settings for AI parsing.',
          'error'
        )
      } else {
        const label = source === 'AI' ? '✨ AI parsed' : '⚙️ Parsed'
        showToast(`${label}: ${filled.map(k => LABELS[k] || k).join(', ')}`)
      }
    } finally {
      setParsingText(false)
    }
  }

  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm)

  const jobContext = { jobTitle: form.jobTitle, company: form.company, location: form.location, salary: form.salary, jobType: form.jobType, language: form.language || 'English' }
  const SelectedTemplate = TEMPLATES.find(t => t.id === (form.templateId || 'classic'))?.component || TEMPLATES[0].component
  const { score: qualScore, checks: qualChecks } = calcQualityScore(form)

  // Canvas dimensions for preview scaling
  const activeFormat = CANVAS_FORMATS.find(f => f.id === (form.format || 'square')) || CANVAS_FORMATS[0]
  const PREVIEW_MAX = 440
  const previewScale = Math.min(PREVIEW_MAX / activeFormat.w, PREVIEW_MAX / activeFormat.h)
  const previewW = Math.round(activeFormat.w * previewScale)
  const previewH = Math.round(activeFormat.h * previewScale)

  // Base creative element (1080×1080 template, no format wrapper)
  const baseCreative = <SelectedTemplate ad={form} />

  // Format-wrapped creatives for platform preview
  const creatives = {
    square:    <SelectedTemplate ad={form} />,
    vertical:  <FormatWrapper ad={form} format="vertical" animated><SelectedTemplate ad={form} /></FormatWrapper>,
    landscape: <FormatWrapper ad={form} format="landscape" animated><SelectedTemplate ad={form} /></FormatWrapper>,
  }
  const qualMeta = scoreColor(qualScore)

  // ── List view ────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="space-y-6">
        <Toast toast={toast} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Job Ads</h1>
            <p className="text-gray-400 text-sm mt-0.5">{ads.length} ad{ads.length !== 1 ? 's' : ''} in your library</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowImport(true)} className="btn-secondary flex items-center gap-2">
              <Upload size={15} /> Import JSON
            </button>
            <button onClick={openNew} className="btn-primary flex items-center gap-2">
              <Plus size={15} /> New ad
            </button>
          </div>
        </div>

        {showImport && <ImportDropzone onFile={handleImportJson} onClose={() => setShowImport(false)} />}

        {ads.length === 0 ? (
          <div className="card text-center py-16">
            <Image size={40} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 mb-1">No ads yet</p>
            <p className="text-gray-600 text-sm mb-5">Create your first job ad or import a JSON file</p>
            <div className="flex gap-2 justify-center">
              <button onClick={openNew} className="btn-primary">Create ad</button>
              <button onClick={() => setShowImport(true)} className="btn-secondary">Import JSON</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ads.map(ad => (
              <AdCard key={ad.id} ad={ad}
                onEdit={() => openEdit(ad)}
                onPreview={() => openPreview(ad)}
                onDelete={() => handleDeleteAd(ad.id)}
                onExportJson={() => handleExportJson(ad)}
                onDuplicate={() => handleDuplicateAd(ad)}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Editor view (Canva-style full-screen) ───────────────────────────────
  if (view === 'editor') {
    // Inline toolbar button helper
    const Tb = ({ icon: Icon, onClick, disabled, active, title, children }) => (
      <button onClick={onClick} disabled={disabled} title={title}
        style={{ display:'flex', alignItems:'center', justifyContent:'center', minWidth:32, height:32, borderRadius:8,
          border: active ? '1px solid rgba(91,74,232,0.5)' : '1px solid transparent', padding:'0 8px', gap:5, cursor:disabled?'not-allowed':'pointer', transition:'all 0.15s',
          background: active ? 'rgba(91,74,232,0.2)' : 'transparent',
          color: disabled ? 'var(--bdr2)' : active ? '#7B6FF0' : 'var(--text2)',
        }}>
        <Icon size={15} />
        {children && <span style={{ fontSize:11, fontWeight:500, whiteSpace:'nowrap' }}>{children}</span>}
      </button>
    )
    const VDiv = () => <div style={{ width:1, height:20, background:'var(--bdr)', margin:'0 4px', flexShrink:0 }} />

    return (
      <>
        <OnboardingModal isOpen={showOnboarding} onStart={handleOnboardingStart} onSkip={() => setShowOnboarding(false)} />
        <StockPhotoPicker isOpen={showStockPicker} onClose={() => setShowStockPicker(false)} onSelect={handleStockSelect} />

        {/* Hidden full-res export ref — static PNG export */}
        <div style={{ position:'fixed', left:-9999, top:-9999, zIndex:-1, pointerEvents:'none' }}>
          <div ref={exportRef}>
            <FormatWrapper ad={form} format={form.format || 'square'}>
              {form.customFile
                ? <img src={form.customFile} style={{ width:1080, height:1080, objectFit:'cover', display:'block' }} />
                : <SelectedTemplate ad={form} />}
            </FormatWrapper>
          </div>
        </div>
        {/* Hidden animated export ref — video export; animations restarted via getAnimations() */}
        <div style={{ position:'fixed', left:-9999, top:-9999, pointerEvents:'none' }}>
          <div ref={animExportRef}>
            <FormatWrapper ad={form} format={form.format || 'square'}>
              {form.customFile
                ? <img src={form.customFile} style={{ width:1080, height:1080, objectFit:'cover', display:'block' }} />
                : <SelectedTemplate ad={form} animated animEffect={form.animEffect || 'fade'} />}
            </FormatWrapper>
          </div>
        </div>

        {/* ── FULL-SCREEN EDITOR OVERLAY ── */}
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', flexDirection:'column', background:'var(--bg)' }}>

          {/* Toast — rendered as a direct child so its own `fixed` positioning is
              relative to the viewport (not a transform-parent, which would make
              it the CSS containing block and break the placement). */}
          <Toast toast={toast} />

          {/* ── TOP TOOLBAR ── */}
          <div style={{ height:52, display:'flex', alignItems:'center', padding:'0 12px', borderBottom:'1px solid var(--bdr)', background:'var(--surface)', flexShrink:0, gap:0 }}>

            {/* Left: logo + ad name — fixed width so center never overlaps */}
            <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0, width:260 }}>
              <Logo size={22} textSize="0.85rem" />
              <VDiv />
              <input
                value={form.name || ''}
                onChange={e => setField('name', e.target.value)}
                placeholder={form.jobTitle || 'Untitled ad'}
                title="Ad name"
                style={{ background:'transparent', border:'1px solid transparent', borderRadius:6, padding:'3px 8px', fontSize:13, fontWeight:500, color:'var(--text)', outline:'none', minWidth:0, flex:1, transition:'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = 'var(--bdr2)'}
                onBlur={e => e.target.style.borderColor = 'transparent'}
              />
            </div>

            {/* Center: undo / redo / safe zones / format tabs / own design — grows but doesn't spill */}
            <div style={{ flex:1, minWidth:0, display:'flex', alignItems:'center', justifyContent:'center', gap:2, overflow:'hidden' }}>
              {isDirty && <span style={{ fontSize:10, color:'#F5AC00', background:'rgba(245,172,0,0.08)', border:'1px solid rgba(245,172,0,0.2)', borderRadius:20, padding:'2px 7px', flexShrink:0, marginRight:4 }}>● Unsaved</span>}
              <Tb icon={Undo2} onClick={handleUndo} disabled={!canUndo} title="Undo (Ctrl+Z)" />
              <Tb icon={Redo2} onClick={handleRedo} disabled={!canRedo} title="Redo (Ctrl+Y)" />
              <VDiv />
              <Tb icon={ScanLine} onClick={() => setShowSafeZones(s => !s)} active={showSafeZones} title={showSafeZones ? 'Hide safe zones' : 'Show safe zones'}>Zones</Tb>
              <VDiv />
              {CANVAS_FORMATS.map(f => (
                <button key={f.id} onClick={() => setField('format', f.id)} title={f.desc}
                  style={{ fontSize:12, fontWeight:500, padding:'4px 10px', borderRadius:6, cursor:'pointer', transition:'all 0.15s', border:'1px solid', flexShrink:0,
                    borderColor: (form.format||'square')===f.id ? 'rgba(91,74,232,0.6)' : 'transparent',
                    background: (form.format||'square')===f.id ? 'rgba(91,74,232,0.15)' : 'transparent',
                    color: (form.format||'square')===f.id ? '#7B6FF0' : 'var(--text2)',
                  }}>
                  {f.label} <span style={{ opacity:.45, fontSize:10 }}>{f.ratio}</span>
                </button>
              ))}
              <VDiv />
              {/* Upload own design button */}
              <label title="Upload your own pre-designed image (replaces template)"
                style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, fontWeight:500, padding:'4px 10px', borderRadius:6, cursor:'pointer', transition:'all 0.15s', border:'1px solid transparent', flexShrink:0,
                  color: form.customFile ? '#7B6FF0' : 'var(--text2)',
                  background: form.customFile ? 'rgba(91,74,232,0.12)' : 'transparent',
                }}>
                <ImagePlus size={14} />
                {form.customFile ? '✓ Custom' : 'Own design'}
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleCustomFileUpload(e.target.files[0])} />
              </label>
            </div>

            {/* Right: save / export / close — fixed width, never gets pushed off */}
            <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
              {isDirty && (
                <button onClick={handleDiscard} style={{ fontSize:12, color:'var(--text2)', background:'transparent', border:'1px solid var(--bdr2)', borderRadius:6, padding:'5px 10px', cursor:'pointer' }}>
                  Discard
                </button>
              )}
              <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ fontSize:12, padding:'6px 14px', display:'flex', alignItems:'center', gap:5 }}>
                {saving && <Loader2 size={12} className="animate-spin" />}
                {saving ? 'Saving…' : editingAd ? 'Save' : 'Save ad'}
              </button>
              <button onClick={handleDownloadTemplate} disabled={exportingImg}
                style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, padding:'5px 12px', borderRadius:6, border:'1px solid var(--bdr2)', background:'var(--elevated)', color:'var(--text)', cursor:'pointer' }}>
                {exportingImg ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                Export
              </button>
              <button onClick={() => setView('list')} title="Back to ads list"
                style={{ display:'flex', alignItems:'center', justifyContent:'center', width:32, height:32, borderRadius:8, background:'transparent', border:'none', color:'var(--text2)', cursor:'pointer' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text2)'}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* ── 3-COLUMN BODY ── */}
          <div style={{ flex:1, display:'grid', gridTemplateColumns:`${leftPanelWidth}px 1fr ${rightPanelWidth}px`, overflow:'hidden', minHeight:0 }}>

            {/* ── LEFT PANEL ── */}
            <div style={{ borderRight:'none', overflowY:'auto', background:'var(--surface)', display:'flex', flexDirection:'column', position:'relative' }}>
              {/* Drag handle on right edge — hover glows purple */}
              <div onMouseDown={startPanelResize}
                style={{ position:'absolute', top:0, right:0, width:5, height:'100%', cursor:'col-resize', zIndex:20,
                  borderRight:'1px solid var(--bdr)', background:'transparent', transition:'background 0.12s' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(91,74,232,0.25)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
              />

              {/* Sticky tab bar */}
              <div style={{ display:'flex', borderBottom:'1px solid var(--bdr)', padding:'6px 8px', gap:3, flexShrink:0, background:'var(--surface)', position:'sticky', top:0, zIndex:10 }}>
                {[
                  { id:'job',     icon:Briefcase, label:'Job' },
                  { id:'design',  icon:Palette,   label:'Design' },
                  { id:'publish', icon:Monitor,   label:'Publish' },
                ].map(({ id, icon:Icon, label }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:4, fontSize:12, fontWeight:500, padding:'6px 4px', borderRadius:8, border:'none', cursor:'pointer', transition:'all 0.15s',
                      background: activeTab===id ? '#5B4AE8' : 'transparent',
                      color: activeTab===id ? '#fff' : 'var(--text2)',
                    }}>
                    <Icon size={12} />
                    {leftPanelWidth >= 270 && label}
                  </button>
                ))}
              </div>

              {/* ── Panel content ── */}
              <div style={{ padding:'10px 10px', flex:1, overflowY:'auto' }}>

                {/* ── JOB TAB ── */}
                {activeTab === 'job' && !form.customFile && (
                  <div className="space-y-3">
                    <div className="card space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Link2 size={12} className="text-purple-400" />
                        <h2 className="font-semibold text-xs text-gray-300">Auto-fill from URL</h2>
                      </div>
                      <div className="flex gap-2">
                        <input className="input text-xs flex-1" placeholder="https://company.com/jobs/..."
                          value={form.jobUrl} onChange={e => setField('jobUrl', e.target.value)} onKeyDown={e => e.key==='Enter'&&handleFetchJob()} />
                        <button onClick={handleFetchJob} disabled={fetchingJob||!form.jobUrl?.trim()}
                          className="btn-primary flex items-center gap-1 text-xs whitespace-nowrap disabled:opacity-40" style={{padding:'6px 10px'}}>
                          {fetchingJob?<Loader2 size={11} className="animate-spin"/>:<Sparkles size={11}/>}
                          {fetchingJob?'…':'Fill'}
                        </button>
                      </div>
                    </div>

                    <div className="card space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5"><PenLine size={12} className="text-purple-400"/><h2 className="font-semibold text-xs text-gray-300">Paste job text</h2></div>
                        <button onClick={()=>setShowPasteField(s=>!s)} className="text-[10px] text-purple-400">{showPasteField?'▲':'▼'}</button>
                      </div>
                      {showPasteField&&(<>
                        <textarea className="input resize-none text-xs leading-relaxed" rows={5}
                          placeholder={"Senior React Dev\nat Acme Corp\nLocation: Warsaw\nSalary: 15–25k PLN"}
                          value={pasteText} onChange={e=>setPasteText(e.target.value)}/>
                        <button onClick={handlePasteText} disabled={!pasteText.trim()||parsingText}
                          className="btn-primary w-full flex items-center justify-center gap-1.5 text-xs disabled:opacity-40">
                          {parsingText?<><Loader2 size={11} className="animate-spin"/>Parsing…</>:<><Sparkles size={11}/>Parse &amp; fill</>}
                        </button>
                      </>)}
                    </div>

                    <div className="card space-y-3">
                      <h2 className="font-semibold text-xs text-gray-300 flex items-center gap-1.5"><Briefcase size={12} className="text-purple-400"/>Job Details</h2>
                      <div><label className="label">Job title *</label>
                        <input className="input text-xs" placeholder="e.g. Senior React Developer" value={form.jobTitle} onChange={e=>setField('jobTitle',e.target.value)}/></div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className="label">Company</label><input className="input text-xs" placeholder="TechCorp" value={form.company} onChange={e=>setField('company',e.target.value)}/></div>
                        <div><label className="label">Job type</label><select className="input text-xs" value={form.jobType} onChange={e=>setField('jobType',e.target.value)}>{JOB_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className="label">Location</label><input className="input text-xs" placeholder="Warsaw / Remote" value={form.location} onChange={e=>setField('location',e.target.value)}/></div>
                        <div><label className="label">Salary</label><input className="input text-xs" placeholder="15–25k PLN" value={form.salary} onChange={e=>setField('salary',e.target.value)}/></div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="label mb-0">Info chips</label>
                          <button onClick={()=>setField('customTags',[...(form.customTags||[]),{key:'',value:''}])} className="text-[10px] text-purple-400 flex items-center gap-0.5"><Plus size={9}/>Add</button>
                        </div>
                        <div className="space-y-1.5">
                          {(form.customTags||[]).map((tag,i)=>(
                            <div key={i} className="flex gap-1.5 items-center">
                              <input className="input text-xs flex-1" placeholder="Label" value={tag.key} onChange={e=>{const t=[...(form.customTags||[])];t[i]={...t[i],key:e.target.value};setField('customTags',t)}}/>
                              <input className="input text-xs flex-1" placeholder="Value" value={tag.value} onChange={e=>{const t=[...(form.customTags||[])];t[i]={...t[i],value:e.target.value};setField('customTags',t)}}/>
                              <button onClick={()=>setField('customTags',(form.customTags||[]).filter((_,j)=>j!==i))} className="text-gray-600 hover:text-red-400"><X size={13}/></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="card space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-xs text-gray-300">Ad Copy</h2>
                        <span className="flex items-center gap-1 text-[9px] text-purple-400 bg-purple-600/10 px-1.5 py-0.5 rounded-full border border-purple-500/20"><Sparkles size={8}/>AI</span>
                      </div>
                      <AiCopyField label="Headline" field="headline" value={form.headline} maxLength={40} placeholder="Short punchy headline" onChange={v=>setField('headline',v)} jobContext={jobContext} onToast={showToast}/>
                      <AiCopyField label="Primary text" field="primaryText" value={form.primaryText} maxLength={500} multiline placeholder="We're hiring…" onChange={v=>setField('primaryText',v)} jobContext={jobContext} onToast={showToast} showLimits/>
                      <div><label className="label">CTA</label>
                        <select className="input text-xs" value={form.ctaText} onChange={e=>setField('ctaText',e.target.value)}>
                          {/* Show i18n / custom translated value as the top option when not a standard English option */}
                          {form.ctaText && !CTA_OPTIONS.includes(form.ctaText) &&
                            <option value={form.ctaText}>{form.ctaText} ✓</option>}
                          {CTA_OPTIONS.map(c=><option key={c}>{c}</option>)}
                        </select></div>
                    </div>

                    <div className="card space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5"><Globe size={12} className="text-purple-400"/><h2 className="font-semibold text-xs text-gray-300">Language</h2></div>
                        {translating && <span className="flex items-center gap-1 text-[10px] text-purple-400"><Loader2 size={9} className="animate-spin"/>Translating…</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="label">Language</label>
                          <select className="input text-xs" value={form.language||'English'}
                            onChange={e=>handleLanguageChange(e.target.value)}
                            disabled={translating}>
                            {LANGUAGES.map(l=><option key={l}>{l}</option>)}
                          </select>
                          <p className="text-[9px] text-gray-600 mt-1">Changes language &amp; AI-translates copy</p>
                        </div>
                        <div><label className="label">Tagline</label>
                          <input className="input text-xs" placeholder="is actively hiring" value={form.hiringTagline||''} onChange={e=>setField('hiringTagline',e.target.value)}/></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── DESIGN TAB ── */}
                {activeTab === 'design' && !form.customFile && (
                  <div className="space-y-3">
                    <div className="card space-y-2">
                      <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-xs text-gray-300 flex items-center gap-1.5"><LayoutTemplate size={12}/>Template</h2>
                        <span className="text-[10px] text-gray-500">{TEMPLATES.find(t=>t.id===form.templateId)?.label}</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {TEMPLATES.map(t=>(
                          <button key={t.id} title={t.label}
                            onClick={()=>{
                              // Apply template-specific scale defaults when switching
                              const d = t.defaults || {}
                              setForm(f => ({ ...f, templateId: t.id, ...d }))
                            }}
                            className={`relative rounded-lg overflow-hidden border-2 transition-all ${form.templateId===t.id?'border-purple-500 ring-1 ring-purple-500/30':'border-theme-bdr hover:border-purple-500/40'}`}>
                            <TemplateThumbnail templateId={t.id} ad={form} size={50}/>
                            {form.templateId===t.id&&<div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-purple-600 rounded-full flex items-center justify-center"><Check size={8} className="text-white"/></div>}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="card space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-xs text-gray-300 flex items-center gap-1.5"><Maximize2 size={12}/>Layout</h2>
                        <button onClick={()=>{
                          const d = TEMPLATES.find(t=>t.id===form.templateId)?.defaults || {}
                          setForm(f=>({...f,...d}))
                        }} className="text-[10px] text-gray-500 hover:text-gray-300">Reset</button>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        {[{label:'Job title',key:'titleScale'},{label:'Company',key:'companyScale'},{label:'Tagline',key:'taglineScale'},{label:'Headline',key:'headlineScale'},{label:'Chips',key:'tagScale'},{label:'Logo',key:'logoScale'},{label:'CTA',key:'ctaScale'},{label:'Spacing',key:'spacingScale'}].map(({label,key})=>(
                          <div key={key}>
                            <div className="flex justify-between mb-0.5">
                              <span className="text-[10px] text-gray-400">{label}</span>
                              <span className="text-[10px] text-gray-500">{Math.round((form[key]??1)*100)}%</span>
                            </div>
                            <input type="range" min="0.5" max="2" step="0.05" value={form[key]??1} onChange={e=>setField(key,parseFloat(e.target.value))}
                              className="w-full h-1.5 appearance-none rounded-full bg-theme-elevated accent-purple-500 cursor-pointer"/>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="card space-y-2">
                      <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-xs text-gray-300 flex items-center gap-1.5"><Palette size={12} className="text-purple-400"/>Brand Colour</h2>
                        {(brandKit.company||brandKit.logoUrl)&&<button onClick={applyBrandKit} className="text-[10px] text-purple-400 bg-purple-600/10 border border-purple-500/20 px-2 py-0.5 rounded-full">Apply Kit</button>}
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer shrink-0 relative" title="Pick colour">
                          <div className="w-12 h-12 rounded-xl border-2 border-white/10 shadow-lg hover:scale-105 transition-transform" style={{background:form.brandColor}}/>
                          <input type="color" className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" value={form.brandColor} onChange={e=>setField('brandColor',e.target.value)}/>
                        </label>
                        <div className="flex-1 space-y-1.5">
                          <input className="input text-xs font-mono" value={form.brandColor} onChange={e=>setField('brandColor',e.target.value)} placeholder="#5B4AE8"/>
                          <div className="flex gap-1.5 flex-wrap">
                            {['#5B4AE8','#2563eb','#dc2626','#16a34a','#ea580c','#0891b2','#db2777','#1e293b'].map(c=>(
                              <button key={c} onClick={()=>setField('brandColor',c)} className="w-6 h-6 rounded-md border-2 hover:scale-110 transition-all shrink-0" style={{background:c,borderColor:form.brandColor===c?'#fff':'transparent'}}/>
                            ))}
                          </div>
                        </div>
                      </div>
                      {/* Color style presets */}
                      <div className="space-y-1.5 pt-1 border-t border-theme-bdr">
                        <label className="label mb-0">Color style</label>
                        <div className="grid grid-cols-4 gap-1">
                          {[
                            { id:'default',  label:'Clean',    emoji:'⬜' },
                            { id:'branded',  label:'Branded',  emoji:'🎨' },
                            { id:'gradient', label:'Gradient', emoji:'🌈' },
                            { id:'dark',     label:'Dark',     emoji:'⬛' },
                          ].map(opt=>(
                            <button key={opt.id}
                              onClick={()=>setField('colorStyle',opt.id)}
                              className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${(form.colorStyle||'default')===opt.id?'bg-purple-600/20 border-purple-500/50 text-purple-300':'bg-theme-elevated border-theme-bdr2 text-gray-400 hover:border-gray-500'}`}>
                              <span>{opt.emoji}</span>{opt.label}
                            </button>
                          ))}
                        </div>
                        <p className="text-[9px] text-gray-600">How your brand color is applied to the template background and accents.</p>
                      </div>
                    </div>

                    <div className="card space-y-2">
                      <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-xs text-gray-300 flex items-center gap-1.5"><MousePointer2 size={12} className="text-purple-400"/>Inspector</h2>
                        {selectedField&&<button onClick={()=>setSelectedField(null)} className="text-[10px] text-gray-500 hover:text-gray-300">✕ Clear</button>}
                      </div>
                      {!selectedField?(
                        <div className="bg-theme-bg rounded-lg border border-dashed border-theme-bdr2 p-3 text-center space-y-1">
                          <MousePointer2 size={16} className="text-gray-600 mx-auto"/>
                          <p className="text-[10px] text-gray-500">Click a text in the canvas to edit it</p>
                        </div>
                      ):(() => {
                        const FC={jobTitle:{label:'Job Title',formKey:'jobTitle',isSelect:false},company:{label:'Company',formKey:'company',isSelect:false},hiringTagline:{label:'Tagline',formKey:'hiringTagline',isSelect:false},headline:{label:'Headline',formKey:'headline',isSelect:false},ctaText:{label:'Button',formKey:'ctaText',isSelect:true}}
                        const cfg=FC[selectedField]; if(!cfg) return null
                        return(<div className="space-y-2">
                          <span className="text-[10px] text-purple-300 bg-purple-600/15 border border-purple-500/25 px-2 py-0.5 rounded-full">{cfg.label}</span>
                          <div><label className="label">Wording</label>
                            {cfg.isSelect?<select className="input text-xs" value={form[cfg.formKey]||''} onChange={e=>setField(cfg.formKey,e.target.value)}>{CTA_OPTIONS.map(c=><option key={c}>{c}</option>)}</select>
                              :<input className="input text-xs" value={form[cfg.formKey]||''} onChange={e=>setField(cfg.formKey,e.target.value)} autoFocus/>}
                          </div>
                        </div>)
                      })()}
                    </div>

                    <div className="card space-y-3">
                      <h2 className="font-semibold text-xs text-gray-300 flex items-center gap-1.5"><Camera size={12} className="text-purple-400"/>Visuals</h2>
                      <div>
                        <label className="label">Fetch logo from URL</label>
                        <div className="flex gap-2">
                          <input className="input text-xs flex-1" placeholder="https://company.com" value={logoUrlInput} onChange={e=>setLogoUrlInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleFetchLogo()}/>
                          <button onClick={handleFetchLogo} disabled={fetchingLogo||!logoUrlInput.trim()} className="btn-secondary text-xs flex items-center gap-1 disabled:opacity-40" style={{padding:'5px 8px'}}>
                            {fetchingLogo?<Loader2 size={11} className="animate-spin"/>:<Globe size={11}/>}
                          </button>
                        </div>
                      </div>
                      <ImageUploadField label="Company logo" value={form.logoUrl} onUpload={f=>handleImageUpload(f,'logoUrl')} onClear={()=>setField('logoUrl',null)} onBrowseStock={()=>{setStockTarget('logoUrl');setShowStockPicker(true)}} small/>
                      {form.logoUrl&&(<div><label className="label">Logo background</label>
                        <div className="flex gap-2">
                          {[{value:'white',label:'⬜ White'},{value:'transparent',label:'✕ None'},{value:'accent',label:'🎨 Brand'}].map(opt=>(
                            <button key={opt.value} onClick={()=>setField('logoBg',opt.value)}
                              className={`flex-1 text-[10px] py-1.5 rounded-lg border transition-colors ${(form.logoBg||'white')===opt.value?'bg-purple-600/20 border-purple-500/50 text-purple-300':'bg-theme-elevated border-theme-bdr2 text-gray-400 hover:border-gray-500'}`}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>)}
                      <ImageUploadField label="Ad image" value={form.imageUrl} attribution={form.imageAttribution}
                        onUpload={f=>handleImageUpload(f,'imageUrl')} onClear={()=>setForm(f=>({...f,imageUrl:null,imageAttribution:null}))}
                        onBrowseStock={()=>{setStockTarget('imageUrl');setShowStockPicker(true)}}/>

                      {/* ── Image focal point & zoom — shown only when an ad image is set ── */}
                      {form.imageUrl && (
                        <div className="space-y-2 pt-1 border-t border-theme-bdr">
                          <div className="flex items-center justify-between">
                            <label className="label mb-0">Image framing</label>
                            <button onClick={()=>setForm(f=>({...f,imageFocalX:50,imageFocalY:50,imageZoom:1}))}
                              className="text-[10px] text-gray-500 hover:text-gray-300">Reset</button>
                          </div>

                          {/* 3×3 focal-point quick-select */}
                          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4,background:'var(--elevated)',borderRadius:8,padding:6}}>
                            {[[0,0,'↖'],[50,0,'↑'],[100,0,'↗'],[0,50,'←'],[50,50,'·'],[100,50,'→'],[0,100,'↙'],[50,100,'↓'],[100,100,'↘']].map(([x,y,icon])=>{
                              const ax = form.imageFocalX??50, ay = form.imageFocalY??50
                              const active = Math.abs(ax-x)<1 && Math.abs(ay-y)<1
                              return (
                                <button key={`${x}-${y}`}
                                  onClick={()=>setForm(f=>({...f,imageFocalX:x,imageFocalY:y}))}
                                  style={{padding:'5px 0',borderRadius:6,border:'1px solid',fontSize:13,lineHeight:1,cursor:'pointer',transition:'all 0.1s',
                                    borderColor:active?'rgba(91,74,232,0.6)':'transparent',
                                    background:active?'rgba(91,74,232,0.2)':'transparent',
                                    color:active?'#7B6FF0':'var(--text2)'}}>
                                  {icon}
                                </button>
                              )
                            })}
                          </div>

                          {/* Fine-tune X */}
                          <div>
                            <div className="flex justify-between mb-0.5">
                              <span className="text-[10px] text-gray-400">← Horizontal →</span>
                              <span className="text-[10px] text-gray-500">{Math.round(form.imageFocalX??50)}%</span>
                            </div>
                            <input type="range" min="0" max="100" step="1" value={form.imageFocalX??50}
                              onChange={e=>setField('imageFocalX',+e.target.value)}
                              className="w-full h-1.5 appearance-none rounded-full bg-theme-elevated accent-purple-500 cursor-pointer"/>
                          </div>

                          {/* Fine-tune Y */}
                          <div>
                            <div className="flex justify-between mb-0.5">
                              <span className="text-[10px] text-gray-400">↑ Vertical ↓</span>
                              <span className="text-[10px] text-gray-500">{Math.round(form.imageFocalY??50)}%</span>
                            </div>
                            <input type="range" min="0" max="100" step="1" value={form.imageFocalY??50}
                              onChange={e=>setField('imageFocalY',+e.target.value)}
                              className="w-full h-1.5 appearance-none rounded-full bg-theme-elevated accent-purple-500 cursor-pointer"/>
                          </div>

                          {/* Zoom */}
                          <div>
                            <div className="flex justify-between mb-0.5">
                              <span className="text-[10px] text-gray-400">Zoom</span>
                              <span className="text-[10px] text-gray-500">{Math.round((form.imageZoom??1)*100)}%</span>
                            </div>
                            <input type="range" min="1" max="2.5" step="0.05" value={form.imageZoom??1}
                              onChange={e=>setField('imageZoom',+e.target.value)}
                              className="w-full h-1.5 appearance-none rounded-full bg-theme-elevated accent-purple-500 cursor-pointer"/>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="card space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-xs text-gray-300 flex items-center gap-1.5">✨ Animation</h2>
                        {showAnimation && (
                          <button onClick={()=>setAnimKey(k=>k+1)} className="text-[10px] text-purple-400 bg-purple-600/10 border border-purple-500/20 px-2 py-0.5 rounded-full">↺ Replay</button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[{id:'none',label:'None',emoji:'⬜'},{id:'fade',label:'Fade',emoji:'✨'},{id:'typewriter',label:'Typewriter',emoji:'⌨️'}].map(opt=>(
                          <button key={opt.id} onClick={()=>{setField('animEffect',opt.id);if(opt.id!=='none'){setShowAnimation(true);setAnimKey(k=>k+1)}else{setShowAnimation(false)}}}
                            className={`flex flex-col items-center gap-0.5 py-2 rounded-lg border text-[10px] font-medium transition-all ${(form.animEffect||'fade')===opt.id?'bg-purple-600/20 border-purple-500/50 text-purple-300':'bg-theme-elevated border-theme-bdr2 text-gray-400 hover:border-gray-500'}`}>
                            <span>{opt.emoji}</span>{opt.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-[9px] text-gray-600">Animation plays on canvas preview and video export. PNG export is always static.</p>
                    </div>

                    <div className="card space-y-3">
                      <h2 className="font-semibold text-xs text-gray-300 flex items-center gap-1.5"><Type size={12} className="text-purple-400"/>Typography</h2>
                      <div>
                        <label className="label">Font</label>
                        <div className="flex gap-2">
                          <select className="input text-xs flex-1" value={form.fontFamily}
                            onChange={e=>{setField('fontFamily',e.target.value);setForm(f=>({...f,fontFamily:e.target.value,customFontData:null,customFontName:''}));loadGoogleFont(e.target.value.replace(/ /g,'+'));track('font_changed',{font:e.target.value})}}
                            style={{fontFamily:form.fontFamily}}>
                            {FONT_LIST.map(f=><option key={f.id} value={f.label}>{f.label} ({f.category})</option>)}
                          </select>
                          <label className="flex items-center gap-1 text-[10px] text-purple-400 cursor-pointer bg-purple-600/10 border border-purple-500/20 px-2 py-1 rounded-lg whitespace-nowrap">
                            <Upload size={10}/>{form.customFontName?'✓':'Upload'}
                            <input type="file" accept=".ttf,.otf,.woff,.woff2" className="hidden" onChange={e=>e.target.files?.[0]&&handleCustomFontUpload(e.target.files[0])}/>
                          </label>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className="label">Text colour</label>
                          <div className="flex items-center gap-1.5">
                            <input type="color" className="w-9 h-8 rounded border border-theme-bdr2 bg-theme-bg cursor-pointer" value={form.textColor||'#0f172a'} onChange={e=>setField('textColor',e.target.value)}/>
                            <input className="input text-xs flex-1" placeholder="Default" value={form.textColor} onChange={e=>setField('textColor',e.target.value)}/>
                          </div>
                        </div>
                        <div><label className="label">Sub colour</label>
                          <div className="flex items-center gap-1.5">
                            <input type="color" className="w-9 h-8 rounded border border-theme-bdr2 bg-theme-bg cursor-pointer" value={form.subTextColor||'#475569'} onChange={e=>setField('subTextColor',e.target.value)}/>
                            <input className="input text-xs flex-1" placeholder="Default" value={form.subTextColor} onChange={e=>setField('subTextColor',e.target.value)}/>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── PUBLISH TAB ── */}
                {activeTab === 'publish' && (
                  <div className="space-y-3">
                    <div className="card space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5"><TrendingUp size={13} className={qualMeta.text}/><h2 className="font-semibold text-xs text-gray-300">Ad Quality</h2></div>
                        <span className={`font-bold text-xl ${qualMeta.text}`}>{qualScore}<span className="text-xs font-normal text-gray-500">/100</span></span>
                      </div>
                      <div className="w-full bg-theme-elevated rounded-full h-1.5">
                        <div className={`${qualMeta.bg} h-1.5 rounded-full transition-all duration-500`} style={{width:`${qualScore}%`}}/>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        {qualChecks.map(c=>(
                          <div key={c.label} className={`flex items-center gap-1 text-[10px] ${c.ok?'text-green-400':'text-gray-500'}`}>
                            {c.ok?<Check size={9} className="text-green-400 shrink-0"/>:<AlertTriangle size={9} className="text-yellow-500 shrink-0"/>}
                            {c.label}
                          </div>
                        ))}
                      </div>
                      {qualScore===100&&<p className="text-[10px] text-green-400">✨ Perfect score!</p>}
                    </div>
                    <div className="card space-y-2">
                      <h2 className="font-semibold text-xs text-gray-300 flex items-center gap-1.5"><Monitor size={12} className="text-purple-400"/>Target platforms</h2>
                      <div className="grid grid-cols-3 gap-1.5">
                        {PLATFORMS.map(p=>(
                          <button key={p.id} onClick={()=>setField('platforms',form.platforms.includes(p.id)?form.platforms.filter(x=>x!==p.id):[...form.platforms,p.id])}
                            className={`text-[10px] px-1 py-1.5 rounded-lg border transition-all ${form.platforms.includes(p.id)?'bg-purple-600/20 border-purple-500/50 text-purple-300':'bg-theme-elevated border-theme-bdr2 text-gray-400 hover:border-gray-500'}`}>
                            {form.platforms.includes(p.id)&&<Check size={8} className="inline mr-0.5"/>}{p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Custom file mode — minimal panel */}
                {form.customFile && activeTab !== 'publish' && (
                  <div className="space-y-3">
                    <div className="card space-y-3 text-center">
                      <div className="w-16 h-16 rounded-xl overflow-hidden mx-auto border border-theme-bdr2">
                        <img src={form.customFile} className="w-full h-full object-cover"/>
                      </div>
                      <p className="text-xs text-gray-300 font-medium">Custom design active</p>
                      <p className="text-[11px] text-gray-500">Template controls are hidden. Only platforms &amp; copy apply.</p>
                      <button onClick={()=>setField('customFile',null)}
                        className="btn-secondary w-full text-xs flex items-center justify-center gap-1.5 text-red-400 border-red-500/20 hover:bg-red-500/10">
                        <X size={11}/> Remove — use template
                      </button>
                    </div>
                    <button onClick={()=>setActiveTab('publish')} className="btn-primary w-full text-xs flex items-center justify-center gap-1.5">
                      <Monitor size={12}/> Publish settings
                    </button>
                  </div>
                )}

              </div>
            </div>

            {/* ── CENTER CANVAS ── */}
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#0b0b17',overflow:'hidden',gap:14,padding:24,position:'relative'}}>
              {/* Canvas */}
              <div style={{position:'relative',width:previewW,height:previewH,borderRadius:12,overflow:'hidden',boxShadow:'0 28px 80px rgba(0,0,0,0.7)',flexShrink:0}}
                onClick={()=>setSelectedField(null)}>
                <div style={{position:'absolute',top:0,left:0,width:activeFormat.w,height:activeFormat.h,transform:`scale(${previewScale})`,transformOrigin:'top left'}}>
                  <FormatWrapper ad={form} format={form.format||'square'} animated={form.format!=='square'||showAnimation}>
                    {form.customFile
                      ?<img src={form.customFile} style={{width:1080,height:1080,objectFit:'cover',display:'block'}}/>
                      :<SelectedTemplate key={showAnimation?`anim-${animKey}`:'static'} ad={form} selectedField={selectedField} onFieldClick={handleFieldClick} animated={showAnimation} animEffect={form.animEffect||'fade'}/>}
                  </FormatWrapper>
                </div>
                {showSafeZones&&<SafeZoneOverlay format={form.format} previewW={previewW} previewH={previewH} canvasW={activeFormat.w} canvasH={activeFormat.h}/>}
              </div>

              {/* Quality pill */}
              <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,padding:'5px 14px'}}>
                <TrendingUp size={12} style={{color:qualScore>=80?'#4ade80':qualScore>=55?'#facc15':'#f87171'}}/>
                <span style={{fontSize:11,color:'rgba(255,255,255,0.4)'}}>Quality</span>
                <span style={{fontSize:12,fontWeight:600,color:qualScore>=80?'#4ade80':qualScore>=55?'#facc15':'#f87171'}}>{qualScore}/100</span>
                <div style={{width:80,height:4,borderRadius:2,background:'rgba(255,255,255,0.08)'}}>
                  <div style={{height:'100%',borderRadius:2,transition:'width 0.4s',width:`${qualScore}%`,background:qualScore>=80?'#4ade80':qualScore>=55?'#facc15':'#f87171'}}/>
                </div>
                <button onClick={()=>setActiveTab('publish')} style={{fontSize:10,color:'rgba(255,255,255,0.3)',background:'none',border:'none',cursor:'pointer'}}>Details</button>
              </div>

              {/* Animation toggle + Export buttons */}
              <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center'}}>
                {/* Animation preview toggle */}
                <button
                  onClick={()=>{
                    if(showAnimation){ setShowAnimation(false) }
                    else { setShowAnimation(true); setAnimKey(k=>k+1) }
                  }}
                  title={showAnimation ? 'Stop animation' : 'Preview animation'}
                  style={{display:'flex',alignItems:'center',gap:4,fontSize:12,padding:'6px 12px',borderRadius:8,cursor:'pointer',transition:'all 0.15s',
                    border: showAnimation ? '1px solid rgba(91,74,232,0.5)' : '1px solid rgba(255,255,255,0.10)',
                    background: showAnimation ? 'rgba(91,74,232,0.25)' : 'rgba(255,255,255,0.03)',
                    color: showAnimation ? '#a5b4fc' : 'rgba(255,255,255,0.45)',
                  }}>
                  {showAnimation ? '⬛' : '▶'} Animate
                </button>
                {/* PNG export */}
                <button onClick={handleDownloadTemplate} disabled={exportingImg}
                  style={{display:'flex',alignItems:'center',gap:5,fontSize:12,padding:'6px 14px',borderRadius:8,border:'1px solid rgba(255,255,255,0.12)',background:'rgba(255,255,255,0.05)',color:'rgba(255,255,255,0.65)',cursor:'pointer'}}>
                  {exportingImg?<Loader2 size={12} className="animate-spin"/>:<Download size={12}/>} PNG
                </button>
                {/* Video export */}
                <button onClick={handleExportMp4} disabled={exportingMp4||form.animEffect==='none'}
                  title={form.animEffect==='none' ? 'Enable an animation effect first' : 'Export animated video (.webm)'}
                  style={{display:'flex',alignItems:'center',gap:5,fontSize:12,padding:'6px 14px',borderRadius:8,border:'1px solid rgba(91,74,232,0.35)',background:'rgba(91,74,232,0.12)',color: exportingMp4||form.animEffect==='none' ? 'rgba(165,180,252,0.3)' : '#a5b4fc',cursor: exportingMp4||form.animEffect==='none' ? 'not-allowed' : 'pointer'}}>
                  {exportingMp4?<><Loader2 size={12} className="animate-spin"/>Recording…</>:<><Download size={12}/>Video</>}
                </button>
                <button onClick={()=>setShowCustomExport(s=>!s)}
                  style={{display:'flex',alignItems:'center',gap:4,fontSize:12,padding:'6px 10px',borderRadius:8,border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.03)',color:'rgba(255,255,255,0.35)',cursor:'pointer'}}>
                  <Maximize2 size={11}/>{showCustomExport?'▲':'▼'}
                </button>
              </div>
              {showCustomExport&&(
                <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:12}}>
                  <CustomExportPanel onExport={handleDownloadCustom} exporting={exportingImg}/>
                </div>
              )}
            </div>

            {/* ── RIGHT PANEL ── */}
            <div style={{borderLeft:'1px solid var(--bdr)',overflowY:'auto',background:'var(--surface)',display:'flex',flexDirection:'column',position:'relative'}}>
              {/* Drag handle on left edge — hover glows purple */}
              <div onMouseDown={startRightPanelResize}
                style={{position:'absolute',top:0,left:0,width:5,height:'100%',cursor:'col-resize',zIndex:20,background:'transparent',transition:'background 0.12s'}}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(91,74,232,0.25)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
              />
              <div style={{padding:'14px 12px 10px',borderBottom:'1px solid var(--bdr)',flexShrink:0}}>
                <h3 style={{fontSize:12,fontWeight:600,color:'var(--text2)',display:'flex',alignItems:'center',gap:6}}>
                  <Monitor size={13}/> Platform Preview
                </h3>
              </div>
              <div style={{padding:'8px 8px 0',display:'flex',gap:3,flexWrap:'wrap',flexShrink:0}}>
                {AD_PREVIEW_PLATFORMS.map(p=>(
                  <button key={p} onClick={()=>setPreviewPlatform(p)}
                    style={{fontSize:11,fontWeight:500,padding:'3px 9px',borderRadius:20,border:'none',cursor:'pointer',textTransform:'capitalize',transition:'all 0.15s',
                      background:previewPlatform===p?'#5B4AE8':'var(--elevated)',
                      color:previewPlatform===p?'#fff':'var(--text2)'}}>
                    {p}
                  </button>
                ))}
              </div>
              <div style={{padding:'10px 8px',display:'flex',alignItems:'flex-start',justifyContent:'center',flex:1,overflowY:'auto'}}>
                {/* Dynamic scale: fill the panel width for each platform's native preview width */}
                {(() => {
                  const NATIVE_W = { facebook:340, instagram:320, linkedin:380, tiktok:240, youtube:360, snapchat:240 }
                  const nativeW = NATIVE_W[previewPlatform] || 340
                  const fillScale = Math.min(1.0, (rightPanelWidth - 24) / nativeW)
                  return (
                    <div ref={platformRef} style={{transform:`scale(${fillScale})`,transformOrigin:'top center',width:nativeW,flexShrink:0}}>
                      <AdPreviews ad={form} platform={previewPlatform} creatives={creatives} large/>
                    </div>
                  )
                })()}
              </div>
              <div style={{padding:'0 10px 12px',flexShrink:0}}>
                <button onClick={handleDownloadPlatform} disabled={exportingImg}
                  style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:6,fontSize:12,padding:'8px',borderRadius:8,border:'1px solid var(--bdr2)',background:'var(--elevated)',color:'var(--text)',cursor:'pointer'}}>
                  {exportingImg?<Loader2 size={12} className="animate-spin"/>:<Download size={12}/>}
                  {exportingImg?'Exporting…':`Download ${previewPlatform} PNG`}
                </button>
              </div>
            </div>

          </div>
        </div>
      </>
    )
  }

  // ── Full preview view ────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <Toast toast={toast} />

      {/* Hidden export target */}
      <div style={{ position: 'fixed', left: -9999, top: -9999, zIndex: -1, pointerEvents: 'none' }}>
        <div ref={exportRef}><SelectedTemplate ad={form} /></div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('list')} className="btn-ghost flex items-center gap-1 text-gray-400">
            <ChevronLeft size={16} /> Back
          </button>
          <h1 className="text-xl font-bold">{form.name || form.jobTitle || 'Preview'}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openEdit(editingAd)} className="btn-secondary">Edit</button>
          <button onClick={handleDownloadTemplate} disabled={exportingImg} className="btn-primary flex items-center gap-2">
            {exportingImg ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Download PNG
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TEMPLATES.map(t => (
          <button key={t.id}
            onClick={() => setField('templateId', t.id)}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${form.templateId === t.id ? 'bg-purple-600 border-purple-600 text-white' : 'bg-theme-elevated border-theme-bdr2 text-gray-400 hover:border-gray-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center bg-theme-bg rounded-xl border border-theme-bdr p-6 min-h-[600px]">
        <div style={{ width: 540, height: 540, position: 'relative', overflow: 'hidden', borderRadius: 12, boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: 1080, transform: 'scale(0.5)', transformOrigin: 'top left', pointerEvents: 'none' }}>
            <SelectedTemplate ad={form} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── CustomExportPanel ─────────────────────────────────────────────────────────
function CustomExportPanel({ onExport, exporting }) {
  const [customW, setCustomW] = useState(1200)
  const [customH, setCustomH] = useState(630)

  return (
    <div className="bg-theme-bg rounded-xl border border-theme-bdr2 p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {EXPORT_SIZES.filter(s => s.id !== 'sq' && s.id !== 'custom').map(s => (
          <button
            key={s.id}
            onClick={() => onExport(s.w, s.h, s.label)}
            disabled={exporting}
            className="text-left text-xs p-2 rounded-lg bg-theme-elevated hover:bg-theme-bdr2 border border-theme-bdr2 hover:border-purple-500/40 transition-colors disabled:opacity-40"
          >
            <p className="font-medium text-theme-text">{s.label}</p>
            <p className="text-gray-500">{s.w}×{s.h}</p>
            <p className="text-gray-600 text-[10px]">{s.desc}</p>
          </button>
        ))}
      </div>
      {/* Custom */}
      <div className="border-t border-theme-bdr2 pt-2">
        <p className="text-xs text-gray-500 mb-1.5">Custom dimensions</p>
        <div className="flex items-center gap-2">
          <input type="number" className="input text-xs py-1.5" value={customW} onChange={e => setCustomW(+e.target.value)} placeholder="Width" />
          <span className="text-gray-600 text-xs">×</span>
          <input type="number" className="input text-xs py-1.5" value={customH} onChange={e => setCustomH(+e.target.value)} placeholder="Height" />
          <button
            onClick={() => onExport(customW, customH, 'custom')}
            disabled={exporting || !customW || !customH}
            className="btn-secondary text-xs px-3 py-1.5 whitespace-nowrap disabled:opacity-40"
          >
            <Download size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── AiCopyField ───────────────────────────────────────────────────────────────
function AiCopyField({ label, field, value, maxLength, multiline, placeholder, onChange, jobContext, onToast }) {
  const [loading, setLoading] = useState(false)
  const [showContext, setShowContext] = useState(false)
  const [contextText, setContextText] = useState('')

  async function handleFill() {
    setLoading(true)
    try {
      const text = await generateAdCopy(field, jobContext, contextText)
      onChange(text)
    } catch {
      onToast('AI generation failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const hasContext = contextText.trim().length > 0

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="label mb-0">
          {label}
          {maxLength && <span className="text-gray-600 normal-case font-normal ml-1">({value.length}/{maxLength})</span>}
        </label>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowContext(s => !s)}
            title="Add context for better AI generation"
            className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border transition-colors ${hasContext ? 'text-blue-400 bg-blue-600/10 border-blue-500/30 hover:bg-blue-600/20' : 'text-gray-500 bg-theme-elevated border-theme-bdr2 hover:text-gray-300'}`}
          >
            <PenLine size={9} />
            {hasContext ? 'Context ✓' : 'Add context'}
          </button>
          <button
            onClick={handleFill}
            disabled={loading}
            title="Fill with AI"
            className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 px-2 py-0.5 rounded-full transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
            {loading ? 'Generating…' : 'Fill with AI'}
          </button>
        </div>
      </div>

      {showContext && (
        <div className="mb-2 bg-theme-bg border border-theme-bdr2 rounded-lg p-3 space-y-2">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Give context about the role &amp; company. The more detail, the better.
          </p>
          <textarea
            className="input resize-none text-sm leading-relaxed"
            rows={4}
            placeholder={`e.g. "We're a 50-person fintech startup in Kraków (Series A), fully remote, strong equity package. We build payment infra for European SMEs. The role leads a 4-person backend team, greenfield architecture work, lots of ownership. Culture is async, low-ego, results-focused."`}
            value={contextText}
            onChange={e => setContextText(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <button onClick={() => setContextText('')} className="text-[11px] text-gray-600 hover:text-gray-400">Clear</button>
            <button onClick={handleFill} disabled={loading}
              className="flex items-center gap-1 text-xs btn-primary py-1 px-3">
              {loading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
              Generate with context
            </button>
          </div>
        </div>
      )}

      {multiline ? (
        <textarea className="input resize-none" style={{ height: '6rem' }} maxLength={maxLength}
          placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
      ) : (
        <input className="input" maxLength={maxLength} placeholder={placeholder}
          value={value} onChange={e => onChange(e.target.value)} />
      )}
    </div>
  )
}

// ── ImageUploadField ──────────────────────────────────────────────────────────
function ImageUploadField({ label, value, attribution, onUpload, onClear, onBrowseStock, small }) {
  const onDrop = useCallback(files => files[0] && onUpload(files[0]), [onUpload])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, maxFiles: 1 })

  return (
    <div>
      <label className="label">{label}</label>
      {value ? (
        <div>
          <div className="relative inline-block">
            <img src={value} alt={label} className={`rounded-lg object-cover ${small ? 'w-16 h-16' : 'w-full h-32'}`} />
            <button onClick={onClear} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors">
              <X size={11} />
            </button>
          </div>
          {attribution && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`badge text-[10px] ${attribution.free ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                {attribution.free ? 'Free' : `$${attribution.cost}`} · {attribution.source}
              </span>
              {attribution.photographer && <span className="text-[10px] text-gray-600">by {attribution.photographer}</span>}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${isDragActive ? 'border-purple-500 bg-purple-500/5' : 'border-theme-bdr2 hover:border-[#3e3e52]'}`}>
            <input {...getInputProps()} />
            <Upload size={18} className="text-gray-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Drop or click to upload</p>
          </div>
          <button onClick={onBrowseStock} type="button"
            className="w-full btn-ghost flex items-center justify-center gap-2 text-xs border border-dashed border-theme-bdr2 py-2 rounded-lg">
            <Camera size={13} className="text-purple-400" /> Browse stock photos
          </button>
        </div>
      )}
    </div>
  )
}

// ── AdCard ────────────────────────────────────────────────────────────────────
function AdCard({ ad, onEdit, onPreview, onDelete, onExportJson, onDuplicate }) {
  const TemplComp = TEMPLATES.find(t => t.id === ad.templateId)?.component
  const { score } = calcQualityScore(ad)
  const meta = scoreColor(score)
  return (
    <div className="card hover:border-theme-bdr2 transition-colors group">
      {TemplComp ? (
        <div className="relative w-full h-36 rounded-lg overflow-hidden mb-3 bg-theme-bg">
          <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: 1080, transform: 'scale(0.133)', transformOrigin: 'top left', pointerEvents: 'none' }}>
            <TemplComp ad={ad} />
          </div>
          {/* Quality badge */}
          <div className={`absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-medium ${meta.text}`}>
            <TrendingUp size={9} /> {score}
          </div>
        </div>
      ) : ad.imageUrl ? (
        <div className="relative mb-3">
          <img src={ad.imageUrl} alt={ad.name} className="w-full h-36 object-cover rounded-lg" />
          <div className={`absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-medium ${meta.text}`}>
            <TrendingUp size={9} /> {score}
          </div>
        </div>
      ) : (
        <div className="w-full h-36 rounded-lg bg-theme-elevated flex items-center justify-center mb-3">
          <Image size={28} className="text-gray-700" />
        </div>
      )}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{ad.name || ad.jobTitle || 'Untitled Ad'}</p>
          {ad.company && <p className="text-xs text-gray-500 truncate">{ad.company}</p>}
        </div>
        {ad.logoUrl && <img src={ad.logoUrl} alt="logo" className="w-7 h-7 rounded-md object-cover shrink-0" />}
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {ad.location && <span className="badge bg-theme-elevated text-gray-400 text-xs"><MapPin size={9} className="mr-0.5 inline" />{ad.location}</span>}
        {ad.jobType && <span className="badge bg-theme-elevated text-gray-400 text-xs">{ad.jobType}</span>}
        <span className={`badge text-[10px] border ${score >= 80 ? 'bg-green-500/10 text-green-400 border-green-500/20' : score >= 55 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
          {meta.label}
        </span>
      </div>
      <div className="flex gap-1.5">
        <button onClick={onPreview} className="btn-ghost p-1.5 flex-1 flex items-center justify-center gap-1 text-xs"><Eye size={13} /> Preview</button>
        <button onClick={onEdit} className="btn-secondary p-1.5 flex-1 flex items-center justify-center gap-1 text-xs">Edit</button>
        <button onClick={onDuplicate} title="Duplicate" className="btn-ghost p-1.5"><Copy size={14} /></button>
        <button onClick={onExportJson} title="Export JSON" className="btn-ghost p-1.5"><FileJson size={14} /></button>
        <button onClick={onDelete} className="btn-ghost p-1.5 text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
      </div>
    </div>
  )
}

// ── ImportDropzone ────────────────────────────────────────────────────────────
function ImportDropzone({ onFile, onClose }) {
  const onDrop = useCallback(files => files[0] && onFile(files[0]), [onFile])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/json': ['.json'] }, maxFiles: 1 })
  return (
    <div className="card border-purple-500/30 relative">
      <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-300"><X size={16} /></button>
      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><FileJson size={15} className="text-purple-400" /> Import ad from JSON</h3>
      <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-purple-500 bg-purple-500/5' : 'border-theme-bdr2 hover:border-[#3e3e52]'}`}>
        <input {...getInputProps()} />
        <Upload size={24} className="text-gray-600 mx-auto mb-2" />
        <p className="text-sm text-gray-400">Drop a <code className="text-purple-400">.adboard.json</code> file here</p>
        <p className="text-xs text-gray-600 mt-1">or click to browse</p>
      </div>
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-theme-elevated text-theme-text border border-theme-bdr2'}`}>
      {toast.msg}
    </div>
  )
}
