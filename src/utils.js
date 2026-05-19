import { toPng } from 'html-to-image'
import { saveAs } from 'file-saver'

export async function downloadAdAsImage(ref, filename = 'ad') {
  if (!ref.current) return
  try {
    const dataUrl = await toPng(ref.current, { pixelRatio: 2, cacheBust: true })
    saveAs(dataUrl, `${filename}.png`)
  } catch (err) {
    console.error('Image export failed:', err)
    throw err
  }
}

export function exportAdAsJson(ad) {
  const payload = {
    version: '1',
    exportedAt: new Date().toISOString(),
    ad,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  saveAs(blob, `${ad.name || 'ad'}.adboard.json`)
}

export function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        resolve(data)
      } catch {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

export function resizeImageToBase64(file, maxWidth = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    const isPng = file.type === 'image/png' || file.name?.endsWith('.png')
    img.onload = () => {
      const ratio = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * ratio)
      canvas.height = Math.round(img.height * ratio)
      const ctx = canvas.getContext('2d')
      if (!isPng) {
        // Fill white before drawing so JPEG has no black transparent areas
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      // PNG preserves transparency; everything else → JPEG
      resolve(isPng
        ? canvas.toDataURL('image/png')
        : canvas.toDataURL('image/jpeg', quality)
      )
    }
    img.onerror = reject
    img.src = url
  })
}

// ── Generic n8n action caller ─────────────────────────────────────────────────
export async function callN8nAction(webhookUrl, payload) {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`n8n error: ${res.status}`)
  return res.json()
}

// Generate a single ad copy field via AI
// Falls back to template strings if no webhook configured
export async function generateAdCopy(field, context, contextPrompt = '') {
  const webhookUrl = localStorage.getItem('adboard_n8n_url')
  if (webhookUrl) {
    try {
      const data = await callN8nAction(webhookUrl, {
        action: 'generate_ad_copy',
        field,
        context,
        language: context.language || 'English',
        ...(contextPrompt ? { contextPrompt } : {}),
      })
      if (data?.value) return data.value
    } catch {
      // fall through to template
    }
  }
  // Offline fallback templates — structured for social media best practices:
  // Hook → Role → Details → CTA, using line breaks not paragraphs
  const { jobTitle = 'this role', company = 'us', location = '', salary = '', jobType = '' } = context

  if (field === 'headline') {
    const headlines = [
      `${jobTitle} — Join ${company}`,
      `We're Hiring: ${jobTitle}`,
      `${company} is Looking for a ${jobTitle}`,
    ]
    return headlines[Math.floor(Math.random() * headlines.length)]
  }

  if (field === 'primaryText') {
    const hooks = [
      'Your next big move starts here. 🚀',
      'Ready to build something great? 🔥',
      `Looking for ${jobType || 'a new role'}? This one's for you. 👇`,
      'Big opportunity. Right now. 🎯',
    ]
    const hook = hooks[Math.floor(Math.random() * hooks.length)]

    const lines = [hook, '']

    if (contextPrompt) {
      // Use provided context, keep it tight
      const sentences = contextPrompt.replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+/)
      lines.push(...sentences.slice(0, 2))
      lines.push('')
    } else {
      lines.push(`${company} is hiring a ${jobTitle}.`)
      lines.push('')
    }

    // Details block — one line each, emoji anchors
    if (location) lines.push(`📍 ${location}`)
    if (salary)   lines.push(`💰 ${salary}`)
    if (jobType)  lines.push(`⏱ ${jobType}`)

    if (location || salary || jobType) lines.push('')

    lines.push('Tap Apply — we\'d love to talk.')

    return lines.join('\n')
  }

  return 'Apply Now'
}

// Suggest a job title based on user's ad history
export async function suggestJobTitle(previousTitles) {
  const webhookUrl = localStorage.getItem('adboard_n8n_url')
  if (webhookUrl && previousTitles.length > 0) {
    try {
      const data = await callN8nAction(webhookUrl, {
        action: 'suggest_job_title',
        userHistory: previousTitles,
      })
      if (data?.value) return data.value
    } catch {
      // fall through
    }
  }
  return previousTitles[previousTitles.length - 1] || ''
}

// ── Stock photo helpers ───────────────────────────────────────────────────────
export async function searchUnsplash(query, accessKey) {
  if (!accessKey) throw new Error('Unsplash key not configured')
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${accessKey}` } }
  )
  if (!res.ok) throw new Error('Unsplash search failed')
  const data = await res.json()
  return (data.results || []).map(p => ({
    id: p.id,
    thumb: p.urls.small,
    regular: p.urls.regular,
    photographer: p.user.name,
    photographerUrl: p.user.links.html,
    downloadUrl: p.links.download_location,
    source: 'Unsplash',
    free: true,
  }))
}

export async function searchPexels(query, apiKey) {
  if (!apiKey) throw new Error('Pexels key not configured')
  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=12`,
    { headers: { Authorization: apiKey } }
  )
  if (!res.ok) throw new Error('Pexels search failed')
  const data = await res.json()
  return (data.photos || []).map(p => ({
    id: String(p.id),
    thumb: p.src.medium,
    regular: p.src.large,
    photographer: p.photographer,
    photographerUrl: p.photographer_url,
    downloadUrl: null,
    source: 'Pexels',
    free: true,
  }))
}

// Fetch a remote image URL and convert to base64 (for html-to-image compatibility)
export async function fetchImageAsBase64(url, downloadUrl) {
  // For Unsplash: trigger download count first (API terms requirement)
  if (downloadUrl) {
    const key = localStorage.getItem('adboard_unsplash_key')
    if (key) {
      fetch(downloadUrl, { headers: { Authorization: `Client-ID ${key}` } }).catch(() => {})
    }
  }
  const res = await fetchWithTimeout(url, 15000)
  if (!res.ok) throw new Error('Failed to fetch image')
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objUrl = URL.createObjectURL(blob)
    img.onload = () => {
      const ratio = Math.min(1, 1200 / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(objUrl)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = reject
    img.src = objUrl
  })
}

export async function sendToN8n(webhookUrl, message, sessionId) {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId, context: 'adboard-chat', timestamp: new Date().toISOString() }),
  })
  if (!res.ok) throw new Error(`n8n webhook error: ${res.status}`)
  const data = await res.json()
  return data.reply || data.output || data.text || 'No response'
}

export async function textToSpeech(text, apiKey, voiceId) {
  if (!apiKey || !voiceId) return null
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    })
    if (!res.ok) return null
    const blob = await res.blob()
    return URL.createObjectURL(blob)
  } catch {
    return null
  }
}

// ── CORS proxy helpers ─────────────────────────────────────────────────────────
const CORS_PROXIES = [
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
]

function fetchWithTimeout(url, ms = 10000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return fetch(url, { signal: controller.signal })
    .then(r => { clearTimeout(timer); return r })
    .catch(err => { clearTimeout(timer); throw err })
}

// Race all proxies simultaneously — first valid response wins
export async function fetchViaProxy(url) {
  const controllers = CORS_PROXIES.map(() => new AbortController())

  const attempts = CORS_PROXIES.map((buildUrl, i) => {
    const timer = setTimeout(() => controllers[i].abort(), 10000)
    return fetch(buildUrl(url), { signal: controllers[i].signal })
      .then(async res => {
        clearTimeout(timer)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const text = await res.text()
        if (!text || text.length < 50) throw new Error('Empty response')
        return text
      })
      .catch(err => { clearTimeout(timer); throw err })
  })

  // Try each in order of resolution; cancel the rest once one succeeds
  return new Promise((resolve, reject) => {
    let settled = 0
    let lastErr
    attempts.forEach((p, i) =>
      p.then(text => {
        // Cancel remaining requests
        controllers.forEach((c, j) => { if (j !== i) c.abort() })
        resolve(text)
      }).catch(err => {
        lastErr = err
        if (++settled === attempts.length) {
          reject(new Error(`Could not fetch page via any proxy. ${lastErr?.message || ''}`))
        }
      })
    )
  })
}

// ── Resolve a relative URL against a base URL ──────────────────────────────────
function resolveUrl(href, base) {
  if (!href) return null
  try {
    return new URL(href, base).href
  } catch { return null }
}

// ── Fetch logo from a website URL ─────────────────────────────────────────────
export async function fetchLogoFromUrl(siteUrl) {
  // Ensure protocol
  const url = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`
  const html = await fetchViaProxy(url)
  const doc = new DOMParser().parseFromString(html, 'text/html')

  const candidates = []

  // 1. <link rel="apple-touch-icon"> — usually high quality
  doc.querySelectorAll('link[rel*="apple-touch-icon"]').forEach(el => {
    const href = resolveUrl(el.getAttribute('href'), url)
    if (href) candidates.push({ src: href, priority: 1 })
  })

  // 2. og:image — may be a banner, skip if very wide
  const ogImg = doc.querySelector('meta[property="og:image"]')?.getAttribute('content')
  if (ogImg) candidates.push({ src: resolveUrl(ogImg, url), priority: 3 })

  // 3. img with "logo" in class, id, alt, src
  doc.querySelectorAll('img').forEach(el => {
    const src = resolveUrl(el.getAttribute('src') || el.getAttribute('data-src'), url)
    if (!src) return
    const text = [el.className, el.id, el.alt, el.src].join(' ').toLowerCase()
    if (text.includes('logo')) candidates.push({ src, priority: 0 })
  })

  // 4. SVG or PNG in header / nav
  doc.querySelectorAll('header img, nav img, .header img, .navbar img').forEach(el => {
    const src = resolveUrl(el.getAttribute('src'), url)
    if (src) candidates.push({ src, priority: 2 })
  })

  // 5. Favicon as fallback
  const favicon = doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]')?.getAttribute('href')
  if (favicon) candidates.push({ src: resolveUrl(favicon, url), priority: 4 })

  // Sort by priority (lower = better), filter nulls
  const sorted = candidates
    .filter(c => c.src && c.src.startsWith('http'))
    .sort((a, b) => a.priority - b.priority)

  if (sorted.length === 0) throw new Error('No logo found on this page')

  // Download best candidate as base64
  const best = sorted[0].src
  try {
    return await fetchImageAsBase64(best, null)
  } catch {
    // Try next candidate
    for (const c of sorted.slice(1)) {
      try { return await fetchImageAsBase64(c.src, null) } catch {}
    }
    throw new Error('Could not download any logo image')
  }
}

// ── Normalise schema.org employmentType → display value ───────────────────────
function normalizeEmploymentType(raw) {
  if (!raw) return null
  const up = String(raw).toUpperCase().replace(/[-\s]/g, '_').trim()
  const map = {
    FULL_TIME: 'Full-time', FULLTIME: 'Full-time',
    PART_TIME: 'Part-time', PARTTIME: 'Part-time',
    CONTRACTOR: 'Contract', CONTRACT: 'Contract',
    TEMPORARY: 'Contract', TEMP: 'Contract',
    INTERN: 'Internship', INTERNSHIP: 'Internship',
    FREELANCE: 'Freelance',
    PER_DIEM: 'Part-time',
    // Unknown values → try substring match
  }
  if (map[up] !== undefined) return map[up]
  const lo = raw.toLowerCase()
  if (lo.includes('part'))     return 'Part-time'
  if (lo.includes('full'))     return 'Full-time'
  if (lo.includes('contract') || lo.includes('temp')) return 'Contract'
  if (lo.includes('intern'))   return 'Internship'
  if (lo.includes('freelance')) return 'Freelance'
  return null
}

// ── Detect employment type from raw page text (multilingual) ──────────────────
function detectJobTypeFromText(text) {
  const t = text.toLowerCase()
  // Part-time checked first — commonly mis-tagged as FULL_TIME in JSON-LD
  if (/\b(part[\s-]?time|teilzeit|část\s*úvazku|część\s*etatu|pół\s*etatu|deltid|temps\s*partiel|media\s*jornada|yarı\s*zamanlı)\b/.test(t)) return 'Part-time'
  if (/\b(full[\s-]?time|vollzeit|pełny\s*etat|heltid|temps\s*plein|jornada\s*completa|tam\s*zamanlı)\b/.test(t)) return 'Full-time'
  if (/\b(freelance|freiberuf|freier\s*mitarbeiter)\b/.test(t)) return 'Freelance'
  if (/\b(praktikum|internship|stażyst|intern\b)/.test(t)) return 'Internship'
  if (/\b(contract|contractor|befristet|umowa\s*zlecenie)\b/.test(t)) return 'Contract'
  return null
}

// ── HTML entity decoder ────────────────────────────────────────────────────────
function decodeHtml(str) {
  if (!str) return str
  const el = document.createElement('textarea')
  el.innerHTML = str
  return el.value
}

// ── Clean a raw page/og title into a short job title ──────────────────────────
function cleanJobTitle(raw) {
  if (!raw) return null
  let t = decodeHtml(raw)
  // Strip common job-board prefixes (pracuj.pl "Oferta pracy", LinkedIn "Job at", etc.)
  t = t.replace(/^(oferta\s+pracy|job\s+offer|job\s+posting|open\s+position|stellenangebot|praca)\s*[-:–]?\s*/i, '').trim()
  // Strip site name appended after | › »
  t = t.split(/\s*[|›»]\s*/)[0].trim()
  // Strip trailing em-dash with site name (e.g. "Title — Site Name")
  t = t.replace(/\s+[-–—]\s+[^-–—]{1,40}$/, '').trim()
  // Strip trailing ", Company - category, location" pattern (pracuj.pl og:title)
  t = t.replace(/,\s+.{3,60}\s+-\s+.{3,60}$/, '').trim()
  // Hard cap
  if (t.length > 120) t = t.slice(0, 120).replace(/\s\S+$/, '').trim()
  return t || null
}

// ── Fetch job details from a posting URL ──────────────────────────────────────
export async function fetchJobFromUrl(jobUrl) {
  const url = jobUrl.startsWith('http') ? jobUrl : `https://${jobUrl}`
  const html = await fetchViaProxy(url)
  const doc = new DOMParser().parseFromString(html, 'text/html')

  const result = {}

  // 1. Try JSON-LD structured data (JobPosting schema) — most reliable
  let jsonLdDescFallback = null
  const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent)
      const items = Array.isArray(data) ? data : [data]
      for (const item of items) {
        if (item['@type'] === 'JobPosting') {
          // cleanJobTitle strips site name suffixes like "| Company" and decodes entities
          result.jobTitle = cleanJobTitle(item.title || item.name)
          result.company  = decodeHtml(
            typeof item.hiringOrganization === 'string'
              ? item.hiringOrganization
              : item.hiringOrganization?.name
          )
          result.location = decodeHtml(
            item.jobLocation?.address?.addressLocality
            || item.jobLocation?.address?.addressRegion
            || (typeof item.jobLocation === 'string' ? item.jobLocation : null)
          )
          if (item.baseSalary?.value?.minValue != null) {
            const min = item.baseSalary.value.minValue
            const max = item.baseSalary.value.maxValue
            const cur = item.baseSalary.currency || ''
            const period = item.baseSalary.value.unitText || ''
            result.salary = max
              ? `${min}–${max} ${cur}${period ? '/' + period.toLowerCase() : ''}`.trim()
              : `${min} ${cur}${period ? '/' + period.toLowerCase() : ''}`.trim()
          }
          // Strip HTML tags from JSON-LD description, then take first paragraph only
          // (full JSON-LD descriptions are often walls of services text)
          const rawDesc = item.description || ''
          const plainDesc = rawDesc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
          if (plainDesc) {
            const decoded = decodeHtml(plainDesc)
            // First line-break-separated chunk, or first 300 chars
            const firstChunk = decoded.split(/\n\n|\r\n\r\n/)[0]?.trim()
            jsonLdDescFallback = (firstChunk && firstChunk.length > 20)
              ? firstChunk.slice(0, 300)
              : decoded.slice(0, 300)
          }
          result.jobType = normalizeEmploymentType(item.employmentType)
          break
        }
      }
      if (result.jobTitle) break
    } catch {}
  }

  // 2. Fallback: OpenGraph / H1 for title
  if (!result.jobTitle) {
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content')
    const h1 = doc.querySelector('h1')?.textContent?.trim()
    result.jobTitle = cleanJobTitle(ogTitle) || cleanJobTitle(h1)
  }

  if (!result.company) {
    // 1. Try common job-board employer DOM selectors
    const companyEl = doc.querySelector(
      '[data-test="text-employerName"], [data-test="employer-name"], ' +
      '[itemprop="name"][itemscope], a[href*="/firma/"], a[href*="/company/"], ' +
      '[class*="employer-name"], [class*="employerName"], [class*="company-name"]'
    )?.textContent?.trim()
      ?.replace(/\s*O firmie.*$/i, '')   // pracuj.pl appends "O firmie"
      ?.replace(/\s+-\s+\w[\w\s]{0,20}$/, '') // strip trailing "- Category" suffix
      ?.trim()

    // 2. Extract from meta description: "Praca [Title], [Company] - category, loc"
    const metaRaw = doc.querySelector('meta[name="description"]')?.getAttribute('content') || ''
    const afterTitle = metaRaw.replace(/^(Praca|Job|Arbeit)\s+[^,]+,\s*/i, '')
    const companyFromMeta = afterTitle.split(/\s+-\s+/)[0]?.trim()
    const validMeta = companyFromMeta && companyFromMeta.length > 2 && companyFromMeta.length < 80
      && companyFromMeta !== result.jobTitle ? companyFromMeta : null

    // 3. Last resort: og:site_name (often the job board itself — not ideal)
    const ogSite = doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content')

    result.company = decodeHtml(companyEl || validMeta || ogSite || null)
  }

  // Prefer meta/og description (short, human-written summary) over JSON-LD wall of text
  const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content')
  const ogDesc   = doc.querySelector('meta[property="og:description"]')?.getAttribute('content')
  const shortDesc = [metaDesc, ogDesc].find(d => d && d.trim().length > 20)
  result.description = shortDesc ? decodeHtml(shortDesc.trim()) : (jsonLdDescFallback || null)

  // Cross-check jobType against actual page text —
  // many employers mis-tag JSON-LD as FULL_TIME even for part-time roles
  const bodyText = doc.body?.textContent || ''
  const textType = detectJobTypeFromText(bodyText)
  if (textType) {
    if (!result.jobType) {
      // No JSON-LD type at all — use text detection
      result.jobType = textType
    } else if (textType === 'Part-time' && result.jobType !== 'Part-time') {
      // Page explicitly says part-time but JSON-LD disagrees → trust the text
      result.jobType = 'Part-time'
    }
  }

  // 3. Common job board selectors for location / salary
  if (!result.location) {
    result.location = doc.querySelector(
      '[data-testid*="location"], .job-location, [class*="location"], [itemprop="addressLocality"]'
    )?.textContent?.trim()
  }
  if (!result.salary) {
    result.salary = doc.querySelector(
      '[data-testid*="salary"], .compensation, [class*="salary"], [class*="pay"], [itemprop="salary"]'
    )?.textContent?.trim()
  }

  // Clean nulls + empty strings
  const final = Object.fromEntries(
    Object.entries(result).filter(([, v]) => v && String(v).trim())
  )
  console.log('[HireAds] fetchJobFromUrl result:', final)
  return final
}

// ── Parse job ad text — direct Groq API call (no n8n needed) ─────────────────
const GROQ_SYSTEM_PROMPT = `Extract job posting info from the text. Return ONLY a raw JSON object (no markdown, no code fences, no explanation) with exactly these keys:
- jobTitle: string or null
- company: string or null
- location: string or null
- salary: string that includes the currency and pay period when available (e.g. "15 000–25 000 PLN/month", "$80k–$120k/year", "€60 000/year") or null
- jobType: must be exactly one of "Full-time", "Part-time", "Contract", "Freelance", "Internship" — or null
  IMPORTANT for jobType:
  • "umowa o pracę", "umowa zlecenie", "B2B", "kontrakt" describe the CONTRACT TYPE, not work schedule — ignore them when determining jobType
  • Look for work SCHEDULE keywords instead:
    Part-time: "część etatu", "niepełny etat", "½ etatu", "0.5 etatu", "part-time", "Teilzeit", "temps partiel"
    Full-time: "pełny etat", "cały etat", "full-time", "Vollzeit", "temps plein"
  • If no schedule keyword found, set null — do NOT default to Full-time
- description: max 300 char plain-text summary of the role or null
- tags: array of 4–8 short strings capturing key skills, technologies, benefits, or highlights (e.g. ["React", "TypeScript", "Remote", "Equity", "Health insurance"]) — use [] if none found

Set any unknown field to null. Return nothing except the JSON object.`

export async function parseJobTextWithGroq(text) {
  const apiKey = localStorage.getItem('adboard_groq_key')
  if (!apiKey) return null
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        temperature: 0,
        messages: [
          { role: 'system', content: GROQ_SYSTEM_PROMPT },
          { role: 'user', content: text },
        ],
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Groq ${res.status}: ${err.slice(0, 200)}`)
    }
    const data = await res.json()
    if (data.error) throw new Error(JSON.stringify(data.error))
    const raw = data.choices[0].message.content.trim()
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON in response: ' + raw.slice(0, 200))
    return JSON.parse(match[0])
  } catch (e) {
    console.error('[HireAds] Groq error:', e.message)
    return null
  }
}

// ── Translate ad content fields to a target language via Groq ────────────────
// Translates copywriting fields only; proper nouns (company, location, jobTitle)
// are kept if keepProperNouns=true (default).
export async function translateAdContent(form, targetLanguage, keepProperNouns = true) {
  const apiKey = localStorage.getItem('adboard_groq_key')
  if (!apiKey) return null

  // ctaText and hiringTagline are handled by TEMPLATE_I18N in the caller —
  // exclude them here so Groq only processes open-ended copy fields.
  const payload = {
    ...(form.headline    ? { headline:    form.headline    } : {}),
    ...(form.primaryText ? { primaryText: form.primaryText } : {}),
    ...(form.jobTitle    ? { jobTitle:    form.jobTitle    } : {}),
    ...(!keepProperNouns && form.company  ? { company:  form.company  } : {}),
    ...(!keepProperNouns && form.location ? { location: form.location } : {}),
    customTagValues: (form.customTags || [])
      .filter(t => t.key || t.value)
      .map(t => ({ key: t.key || '', value: t.value || '' })),
  }

  const systemPrompt = `You are a professional translator specialising in recruitment and HR content.
Translate ALL text values in the JSON below to ${targetLanguage}.
- Preserve formatting, punctuation style, and line breaks.
- Keep brand names, URLs, and technical terms untranslated.
- Return ONLY a valid raw JSON object with the exact same keys — no markdown, no code fences, no explanation.`

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(payload) },
        ],
      }),
    })
    if (!res.ok) throw new Error(`Groq ${res.status}`)
    const data = await res.json()
    const raw = data.choices[0].message.content.trim()
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON in Groq translation response')
    const translated = JSON.parse(match[0])

    // Re-merge translated customTagValues back into the form's customTags shape
    const newCustomTags = (form.customTags || []).map((t, i) => ({
      ...t,
      key:   translated.customTagValues?.[i]?.key   ?? t.key,
      value: translated.customTagValues?.[i]?.value ?? t.value,
    }))

    return {
      ...(form.headline    ? { headline:    translated.headline    ?? form.headline    } : {}),
      ...(form.primaryText ? { primaryText: translated.primaryText ?? form.primaryText } : {}),
      ...(form.jobTitle    ? { jobTitle:    translated.jobTitle    ?? form.jobTitle    } : {}),
      ...(!keepProperNouns && form.company  ? { company:  translated.company  ?? form.company  } : {}),
      ...(!keepProperNouns && form.location ? { location: translated.location ?? form.location } : {}),
      customTags: newCustomTags,
    }
  } catch (e) {
    console.error('[HireAds] Groq translation error:', e.message)
    return null
  }
}

// ── Parse job ad text via n8n → Groq LLM (legacy) ────────────────────────────
export async function parseJobTextViaLLM(text) {
  const webhookUrl = localStorage.getItem('adboard_n8n_url')
  if (!webhookUrl) return null
  try {
    const raw = await callN8nAction(webhookUrl, { action: 'parse_job_text', text })
    if (raw === null || raw === undefined) return null
    let data = Array.isArray(raw) ? raw[0] : raw
    if (typeof data === 'string') { try { data = JSON.parse(data) } catch { return null } }
    if (data?.json && typeof data.json === 'object') data = data.json
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null
    return data
  } catch (e) {
    console.error('[HireAds] n8n LLM error:', e.message)
    return null
  }
}

// ── Load a Google Font dynamically ─────────────────────────────────────────────
const _loadedFonts = new Set()
export function loadGoogleFont(fontId) {
  if (!fontId || fontId === 'Inter' || _loadedFonts.has(fontId)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${fontId}:wght@400;500;600;700;800&display=swap`
  document.head.appendChild(link)
  _loadedFonts.add(fontId)
}

export function formatPLN(amount) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(amount)
}

export function timeAgo(isoDate) {
  const diff = Date.now() - new Date(isoDate).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
