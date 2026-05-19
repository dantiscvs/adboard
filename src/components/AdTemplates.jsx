/**
 * Ad Templates — 1080×1080px, inline styles only (safe for html-to-image).
 * Each receives a single `ad` prop.
 */
import { TEMPLATE_I18N, JOB_TYPE_I18N } from '../constants'

function translateJobType(language, jobType) {
  return JOB_TYPE_I18N[language]?.[jobType] ?? jobType
}

// ── helpers ──────────────────────────────────────────────────────────────────

function hex(color, opacity = 1) {
  if (!color) return `rgba(124,58,237,${opacity})`
  if (opacity === 1) return color
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${opacity})`
}

function darken(color, amount = 40) {
  if (!color || !color.startsWith('#')) return '#4c1d95'
  const r = Math.max(0, parseInt(color.slice(1, 3), 16) - amount)
  const g = Math.max(0, parseInt(color.slice(3, 5), 16) - amount)
  const b = Math.max(0, parseInt(color.slice(5, 7), 16) - amount)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function LogoMark({ src, company, size = 80, radius = 16, color = '#7c3aed', bg = 'transparent' }) {
  if (src) {
    const bgColor = bg === 'accent' ? color : bg === 'transparent' ? 'transparent' : '#ffffff'
    return (
      <div style={{
        width: size, height: size, borderRadius: radius,
        background: bgColor,
        overflow: 'hidden', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img
          src={src}
          alt={company}
          style={{ width: '88%', height: '88%', objectFit: 'contain' }}
        />
      </div>
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: color, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: size * 0.42, fontWeight: 700, fontFamily: 'Inter,sans-serif',
    }}>
      {company?.[0]?.toUpperCase() || 'C'}
    </div>
  )
}

function Chip({ children, bg = '#f3f4f6', color = '#374151', size = 22 }) {
  return (
    <span style={{
      background: bg, color, padding: `${size * 0.36}px ${size}px`,
      borderRadius: 100, fontSize: size, fontWeight: 500, fontFamily: 'Inter,sans-serif',
      display: 'inline-block', whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

// ── Scale helpers — applied inside each template ───────────────────────────────
// ts=title, ls=logo, cs=chip/tag, ss=spacing
function makeScalers(ad) {
  const ts   = n => Math.round(n * (ad.titleScale    ?? 1))
  const ls   = n => Math.round(n * (ad.logoScale     ?? 1))
  const cs   = n => Math.round(n * (ad.tagScale      ?? 1))
  const ss   = n => Math.round(n * (ad.spacingScale  ?? 1))
  const ctas = n => Math.round(n * (ad.ctaScale      ?? 1))
  const cos  = n => Math.round(n * (ad.companyScale  ?? 1))
  const tls  = n => Math.round(n * (ad.taglineScale  ?? 1))
  const hs   = n => Math.round(n * (ad.headlineScale ?? 1))
  return { ts, ls, cs, ss, ctas, cos, tls, hs }
}

// ── Background image style helper ────────────────────────────────────────────
// Returns inline styles for a full-bleed background <img> that respects the
// imageFocalX / imageFocalY (0-100 percent each) and imageZoom (≥1) fields.
function bgImgStyle(ad, extra = {}) {
  const x    = ad?.imageFocalX ?? 50
  const y    = ad?.imageFocalY ?? 50
  const zoom = ad?.imageZoom   ?? 1
  return {
    position: 'absolute', inset: 0, width: '100%', height: '100%',
    objectFit: 'cover',
    objectPosition: `${x}% ${y}%`,
    ...(zoom > 1 ? { transform: `scale(${zoom})`, transformOrigin: `${x}% ${y}%` } : {}),
    ...extra,
  }
}

// ── Color helpers — luminance & per-colorStyle palette ────────────────────────
// Returns relative luminance (0=black, 1=white) for a #rrggbb hex string.
function getLuminance(hex) {
  if (!hex || !hex.startsWith('#') || hex.length < 7) return 0.5
  const toLinear = c => {
    const v = parseInt(hex.slice(c, c + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * toLinear(1) + 0.7152 * toLinear(3) + 0.0722 * toLinear(5)
}

// Resolves the full colour palette that templates should use, based on the
// ad's colorStyle field.  colorStyle values:
//   'default'  — classic white/dark bg, brand as accent      (current behaviour)
//   'branded'  — brand colour is the background, auto text
//   'gradient' — brand → dark gradient background, white text
//   'dark'     — deep dark surface, brand accent (like Bold template)
//
// Rules for user overrides:
//   textColor / subTextColor are respected in every mode when explicitly set.
export function resolveColors(ad) {
  const accent = ad.brandColor || '#7c3aed'
  const style  = ad.colorStyle  || 'default'
  const lum    = getLuminance(accent)
  // text on top of a solid brand-coloured bg
  const onBrand = lum > 0.40 ? '#000000' : '#ffffff'

  if (style === 'branded') {
    const sub  = lum > 0.40 ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.65)'
    const card = lum > 0.40 ? 'rgba(0,0,0,0.09)' : 'rgba(255,255,255,0.16)'
    return {
      bg:        accent,
      mainText:  ad.textColor    || onBrand,
      subText:   ad.subTextColor || sub,
      chipBg:    card,
      chipColor: onBrand,
      ctaBg:     onBrand,
      ctaColor:  accent,
      cardBg:    card,
      accentTxt: lum > 0.40 ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.9)',
      borderClr: lum > 0.40 ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.22)',
      stripe:    lum > 0.40 ? 'rgba(0,0,0,0.20)' : 'rgba(255,255,255,0.35)',
    }
  }
  if (style === 'gradient') {
    return {
      bg:        `linear-gradient(135deg,${accent} 0%,${darken(accent,55)} 100%)`,
      mainText:  ad.textColor    || '#ffffff',
      subText:   ad.subTextColor || 'rgba(255,255,255,0.7)',
      chipBg:    'rgba(255,255,255,0.18)',
      chipColor: '#ffffff',
      ctaBg:     '#ffffff',
      ctaColor:  accent,
      cardBg:    'rgba(255,255,255,0.12)',
      accentTxt: 'rgba(255,255,255,0.9)',
      borderClr: 'rgba(255,255,255,0.22)',
      stripe:    'rgba(255,255,255,0.35)',
    }
  }
  if (style === 'dark') {
    return {
      bg:        '#080812',
      mainText:  ad.textColor    || '#ffffff',
      subText:   ad.subTextColor || '#94a3b8',
      chipBg:    hex(accent, 0.15),
      chipColor: accent,
      ctaBg:     accent,
      ctaColor:  '#ffffff',
      cardBg:    'rgba(255,255,255,0.06)',
      accentTxt: hex(accent, 0.85),
      borderClr: 'rgba(255,255,255,0.12)',
      stripe:    accent,
    }
  }
  // default — white background, brand as accent
  return {
    bg:        '#ffffff',
    mainText:  ad.textColor    || '#0f172a',
    subText:   ad.subTextColor || '#475569',
    chipBg:    '#f1f5f9',
    chipColor: '#334155',
    ctaBg:     accent,
    ctaColor:  '#ffffff',
    cardBg:    '#f8fafc',
    accentTxt: accent,
    borderClr: '#e2e8f0',
    stripe:    accent,
  }
}

// ── Animation helpers ─────────────────────────────────────────────────────────
// Returns { styleTag, a, tw } where:
//   styleTag — a <style> element injected into the template root
//   a(n)     — returns { className } for fade-up staggered entrance (n = 0-6)
//   tw()     — returns { className } for the job-title element
//              typewriter effect when animEffect='typewriter', else same as a(3)
//
// The CSS animations deliberately do NOT use Tailwind classes so they survive
// inside html-to-image (which can mis-handle utility classes in some versions).
function makeAnimHelpers(animated, effect = 'fade') {
  if (!animated) return { styleTag: null, a: () => ({}), tw: () => ({}) }

  const isTypewriter = effect === 'typewriter'
  const css = `
    @keyframes _t_fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0);    }
    }
    @keyframes _t_fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes _t_type {
      from { clip-path: inset(0 100% 0 0); }
      to   { clip-path: inset(0 0%   0 0); }
    }
    ._t_a0 { animation: _t_fadeIn  0.5s 0.00s ease both; }
    ._t_a1 { animation: _t_fadeUp  0.5s 0.20s ease both; }
    ._t_a2 { animation: _t_fadeUp  0.5s 0.40s ease both; }
    ._t_a3 { animation: _t_fadeUp  0.6s 0.60s ease both; }
    ._t_a4 { animation: _t_fadeUp  0.5s 0.90s ease both; }
    ._t_a5 { animation: _t_fadeUp  0.5s 1.10s ease both; }
    ._t_a6 { animation: _t_fadeUp  0.5s 1.30s ease both; }
    ${isTypewriter
      ? `._t_tw { animation: _t_type 0.9s 0.55s steps(32) both; }`
      : `._t_tw { animation: _t_fadeUp 0.6s 0.60s ease both; }`
    }
  `
  return {
    styleTag: <style>{css}</style>,
    a:  (n) => ({ className: `_t_a${n}` }),
    tw: ()  => ({ className: '_t_tw'    }),
  }
}

// ── Interactive element helpers (editor mode only) ────────────────────────────
// _hs – merges a selection outline into an existing inline-style object.
// _hc – returns an onClick prop (empty object in export mode when ofc is undefined).
function _hs(name, sf, ofc, base) {
  return {
    ...base,
    ...(ofc ? { cursor: 'pointer' } : {}),
    ...(sf === name
      ? { outline: '3px solid rgba(124,58,237,0.85)', outlineOffset: 6, borderRadius: 8 }
      : {}),
  }
}
function _hc(name, ofc) {
  return ofc ? { onClick: e => { e.stopPropagation(); ofc(name) } } : {}
}

// ── Template 1: Classic ───────────────────────────────────────────────────────
export function ClassicTemplate({ ad = {}, selectedField, onFieldClick, animated = false, animEffect = 'fade' }) {
  const { jobTitle, company, location, salary, jobType, logoUrl, brandColor: bc, headline, ctaText, fontFamily, customTags = [], language, hiringTagline, logoBg } = ad
  const accent = bc || '#7c3aed'
  const ff = fontFamily ? `${fontFamily},Inter,sans-serif` : 'Inter,sans-serif'
  const i18n = TEMPLATE_I18N[language] || TEMPLATE_I18N['English']
  const { ts, ls, cs, ss, ctas, cos, tls, hs } = makeScalers(ad)
  const { styleTag, a, tw } = makeAnimHelpers(animated, animEffect)
  const c = resolveColors(ad)

  return (
    <div style={{ width: 1080, height: 1080, background: c.bg, fontFamily: ff, position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>
      {styleTag}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 14, background: c.stripe }} />
      <div style={{ position: 'absolute', top: 0, left: 14, right: 0, height: 6, background: hex(accent, 0.12) }} />

      <div style={{ padding: `${ss(72)}px ${ss(80)}px ${ss(72)}px ${ss(96)}px`, height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        <div {...a(0)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: ss(72) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: ss(24) }}>
            <LogoMark src={logoUrl} company={company} size={ls(104)} radius={ls(20)} color={accent} bg={logoBg} />
            <div>
              <p style={_hs('company', selectedField, onFieldClick, { fontSize: cos(28), fontWeight: 700, color: c.mainText, margin: 0, lineHeight: 1.2 })} {..._hc('company', onFieldClick)}>{company || 'Your Company'}</p>
              <p style={_hs('hiringTagline', selectedField, onFieldClick, { fontSize: tls(20), color: c.subText, margin: 0, marginTop: 4, fontWeight: 400 })} {..._hc('hiringTagline', onFieldClick)}>{hiringTagline || i18n.tagline}</p>
            </div>
          </div>
          <div style={{ background: c.cardBg, border: `2px solid ${c.borderClr}`, borderRadius: 12, padding: `${ss(12)}px ${ss(24)}px` }}>
            <p style={{ fontSize: cs(16), fontWeight: 600, color: c.accentTxt, margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{i18n.openPos}</p>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <p {...a(1)} style={{ fontSize: cs(22), fontWeight: 600, color: c.accentTxt, margin: 0, marginBottom: ss(20), textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            {i18n.hiring}
          </p>
          <h1 {...tw()} style={_hs('jobTitle', selectedField, onFieldClick, { fontSize: ts(jobTitle && jobTitle.length > 20 ? 68 : 82), fontWeight: 800, color: c.mainText, margin: 0, lineHeight: 1.05, marginBottom: ss(32), letterSpacing: '-0.02em' })} {..._hc('jobTitle', onFieldClick)}>
            {jobTitle || 'Job Title'}
          </h1>
          {headline && (
            <p {...a(4)} style={_hs('headline', selectedField, onFieldClick, { fontSize: hs(26), color: c.subText, margin: 0, marginBottom: ss(48), lineHeight: 1.4, fontWeight: 400 })} {..._hc('headline', onFieldClick)}>{headline}</p>
          )}
          <div {...a(5)} style={{ display: 'flex', gap: ss(16), flexWrap: 'wrap', marginTop: headline ? 0 : ss(48) }}>
            {location && <Chip bg={c.chipBg} color={c.chipColor} size={cs(22)}>📍 {location}</Chip>}
            {salary && <Chip bg={c.chipBg} color={c.chipColor} size={cs(22)}>💰 {salary}</Chip>}
            {jobType && <Chip bg={c.chipBg} color={c.chipColor} size={cs(22)}>{translateJobType(language, jobType)}</Chip>}
            {customTags.filter(t => t.key || t.value).map((t, i) => (
              <Chip key={i} bg={c.chipBg} color={c.chipColor} size={cs(22)}>
                {t.key && t.value ? `${t.key}: ${t.value}` : t.key || t.value}
              </Chip>
            ))}
          </div>
        </div>

        <div {...a(6)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: ss(48) }}>
          <div style={_hs('ctaText', selectedField, onFieldClick, { background: c.ctaBg, color: c.ctaColor, padding: `${ctas(20)}px ${ctas(44)}px`, borderRadius: 14, fontSize: ctas(22), fontWeight: 600 })} {..._hc('ctaText', onFieldClick)}>
            {ctaText || i18n.cta} →
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Template 2: Bold Dark ─────────────────────────────────────────────────────
export function BoldTemplate({ ad = {}, selectedField, onFieldClick, animated = false, animEffect = 'fade' }) {
  const { jobTitle, company, location, salary, jobType, logoUrl, brandColor: bc, ctaText, fontFamily, customTags = [], textColor, subTextColor, language, hiringTagline, logoBg } = ad
  const accent = bc || '#7c3aed'
  const ff = fontFamily ? `${fontFamily},Inter,sans-serif` : 'Inter,sans-serif'
  const mainColor = textColor || '#ffffff'
  const subColor = subTextColor || '#94a3b8'
  const i18n = TEMPLATE_I18N[language] || TEMPLATE_I18N['English']
  const { ts, ls, cs, ss, ctas, tls } = makeScalers(ad)
  const { styleTag, a, tw } = makeAnimHelpers(animated, animEffect)

  return (
    <div style={{ width: 1080, height: 1080, background: '#080812', fontFamily: ff, position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>
      {styleTag}
      <div style={{ position: 'absolute', top: -260, right: -260, width: 640, height: 640, borderRadius: '50%', background: hex(accent, 0.08), pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -180, left: -180, width: 480, height: 480, borderRadius: '50%', background: hex(accent, 0.05), pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, background: `linear-gradient(90deg, ${accent}, ${darken(accent, -30)})` }} />

      <div style={{ padding: `${ss(72)}px ${ss(80)}px`, height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        <div {...a(0)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: ss(80) }}>
          <div>
            <LogoMark src={logoUrl} company={company} size={ls(96)} radius={ls(18)} color={accent} bg={logoBg} />
            {hiringTagline && <p style={_hs('hiringTagline', selectedField, onFieldClick, { fontSize: tls(16), color: hex(accent, 0.6), margin: 0, marginTop: 8, fontWeight: 500 })} {..._hc('hiringTagline', onFieldClick)}>{hiringTagline}</p>}
          </div>
          <div style={{ background: hex(accent, 0.12), border: `1px solid ${hex(accent, 0.3)}`, borderRadius: 100, padding: `${ss(12)}px ${ss(28)}px` }}>
            <p style={{ fontSize: cs(17), fontWeight: 600, color: accent, margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{i18n.hiring}</p>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p {...a(1)} style={{ fontSize: cos(20), fontWeight: 500, color: hex(accent, 0.8), margin: 0, marginBottom: ss(20), textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            {company || 'Company'} {i18n.lookingFor}
          </p>
          <h1 {...tw()} style={_hs('jobTitle', selectedField, onFieldClick, { fontSize: ts(jobTitle && jobTitle.length > 22 ? 72 : 90), fontWeight: 900, color: mainColor, margin: 0, lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: ss(52) })} {..._hc('jobTitle', onFieldClick)}>
            {jobTitle || 'Job Title'}
          </h1>
          <div {...a(4)} style={{ display: 'flex', flexDirection: 'column', gap: ss(16) }}>
            {location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: ss(14) }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, flexShrink: 0 }} />
                <span style={{ fontSize: cs(24), color: subColor, fontWeight: 400 }}>📍 {location}</span>
              </div>
            )}
            {salary && (
              <div style={{ display: 'flex', alignItems: 'center', gap: ss(14) }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, flexShrink: 0 }} />
                <span style={{ fontSize: cs(24), color: subColor, fontWeight: 400 }}>💰 {salary}</span>
              </div>
            )}
            {jobType && (
              <div style={{ display: 'flex', alignItems: 'center', gap: ss(14) }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, flexShrink: 0 }} />
                <span style={{ fontSize: cs(24), color: subColor, fontWeight: 400 }}>⏱ {translateJobType(language, jobType)}</span>
              </div>
            )}
            {customTags.filter(t => t.key || t.value).map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: ss(14) }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, flexShrink: 0 }} />
                <span style={{ fontSize: cs(24), color: subColor, fontWeight: 400 }}>
                  {t.key && t.value ? `${t.key}: ${t.value}` : t.key || t.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div {...a(5)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: ss(48) }}>
          <div style={_hs('ctaText', selectedField, onFieldClick, { background: accent, color: '#fff', padding: `${ctas(20)}px ${ctas(44)}px`, borderRadius: 12, fontSize: ctas(22), fontWeight: 700 })} {..._hc('ctaText', onFieldClick)}>
            {ctaText || i18n.cta}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Template 3: Gradient ──────────────────────────────────────────────────────
export function GradientTemplate({ ad = {}, selectedField, onFieldClick, animated = false, animEffect = 'fade' }) {
  const { jobTitle, company, location, salary, jobType, logoUrl, brandColor: bc, headline, ctaText, fontFamily, customTags = [], textColor, subTextColor, language, hiringTagline, logoBg } = ad
  const accent = bc || '#7c3aed'
  const dark = darken(accent, 50)
  const ff = fontFamily ? `${fontFamily},Inter,sans-serif` : 'Inter,sans-serif'
  const mainColor = textColor || '#ffffff'
  const subColor = subTextColor || 'rgba(255,255,255,0.7)'
  const i18n = TEMPLATE_I18N[language] || TEMPLATE_I18N['English']
  const { ts, ls, cs, ss, ctas, cos, tls, hs } = makeScalers(ad)
  const { styleTag, a, tw } = makeAnimHelpers(animated, animEffect)

  return (
    <div style={{ width: 1080, height: 1080, background: `linear-gradient(135deg, ${accent} 0%, ${dark} 100%)`, fontFamily: ff, position: 'relative', overflow: 'hidden', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {styleTag}
      <div style={{ position: 'absolute', top: -100, left: -100, width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
      <div style={{ position: 'absolute', bottom: -150, right: -150, width: 600, height: 600, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
      <div style={{ position: 'absolute', top: '30%', right: '-5%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

      <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 32, padding: `${ss(64)}px ${ss(72)}px`, width: 860, boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>
        <div {...a(0)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: ss(48) }}>
          <LogoMark src={logoUrl} company={company} size={ls(114)} radius={ls(22)} color="rgba(255,255,255,0.3)" bg={logoBg} />
          <p style={_hs('company', selectedField, onFieldClick, { fontSize: cos(22), fontWeight: 600, color: mainColor, margin: 0, marginTop: ss(16) })} {..._hc('company', onFieldClick)}>{company || 'Your Company'}</p>
          <p style={_hs('hiringTagline', selectedField, onFieldClick, { fontSize: tls(17), color: 'rgba(255,255,255,0.5)', margin: 0, marginTop: 4 })} {..._hc('hiringTagline', onFieldClick)}>{hiringTagline || i18n.isHiring}</p>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', marginBottom: ss(48) }} />

        <div style={{ textAlign: 'center', marginBottom: ss(40) }}>
          <h1 {...tw()} style={_hs('jobTitle', selectedField, onFieldClick, { fontSize: ts(jobTitle && jobTitle.length > 20 ? 60 : 72), fontWeight: 800, color: mainColor, margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' })} {..._hc('jobTitle', onFieldClick)}>
            {jobTitle || 'Job Title'}
          </h1>
          {headline && (
            <p {...a(4)} style={_hs('headline', selectedField, onFieldClick, { fontSize: hs(22), color: subColor, margin: 0, marginTop: ss(16), lineHeight: 1.4 })} {..._hc('headline', onFieldClick)}>{headline}</p>
          )}
        </div>

        <div {...a(5)} style={{ display: 'flex', gap: ss(12), justifyContent: 'center', flexWrap: 'wrap', marginBottom: ss(48) }}>
          {location && <Chip bg="rgba(255,255,255,0.15)" color="#fff" size={cs(20)}>📍 {location}</Chip>}
          {salary && <Chip bg="rgba(255,255,255,0.15)" color="#fff" size={cs(20)}>💰 {salary}</Chip>}
          {jobType && <Chip bg="rgba(255,255,255,0.25)" color="#fff" size={cs(20)}>{translateJobType(language, jobType)}</Chip>}
          {customTags.filter(t => t.key || t.value).map((t, i) => (
            <Chip key={i} bg="rgba(255,255,255,0.2)" color="#fff" size={cs(20)}>
              {t.key && t.value ? `${t.key}: ${t.value}` : t.key || t.value}
            </Chip>
          ))}
        </div>

        <div {...a(6)} style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: '#fff', color: accent, padding: `${ctas(18)}px ${ctas(56)}px`, borderRadius: 12, fontSize: ctas(20), fontWeight: 700 }}>
            {ctaText || i18n.cta} →
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Template 4: Split ─────────────────────────────────────────────────────────
export function SplitTemplate({ ad = {}, selectedField, onFieldClick, animated = false, animEffect = 'fade' }) {
  const { jobTitle, company, location, salary, jobType, logoUrl, brandColor: bc, headline, ctaText, fontFamily, customTags = [], textColor, subTextColor, language, hiringTagline, logoBg } = ad
  const accent = bc || '#7c3aed'
  const ff = fontFamily ? `${fontFamily},Inter,sans-serif` : 'Inter,sans-serif'
  const mainColor = textColor || '#0f172a'
  const subColor = subTextColor || '#64748b'
  const i18n = TEMPLATE_I18N[language] || TEMPLATE_I18N['English']
  const { ts, ls, cs, ss, ctas, cos, tls, hs } = makeScalers(ad)
  const { styleTag, a, tw } = makeAnimHelpers(animated, animEffect)

  return (
    <div style={{ width: 1080, height: 1080, fontFamily: ff, display: 'flex', overflow: 'hidden', boxSizing: 'border-box' }}>
      {styleTag}
      <div {...a(0)} style={{ width: 400, background: accent, display: 'flex', flexDirection: 'column', padding: `${ss(72)}px ${ss(52)}px`, boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: 'rgba(0,0,0,0.1)' }} />
        <div style={{ position: 'absolute', top: -80, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />

        <div style={{ position: 'relative', zIndex: 1, marginBottom: 'auto' }}>
          <LogoMark src={logoUrl} company={company} size={ls(114)} radius={ls(20)} color="rgba(255,255,255,0.2)" bg={logoBg} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={_hs('hiringTagline', selectedField, onFieldClick, { fontSize: tls(16), fontWeight: 600, color: 'rgba(255,255,255,0.6)', margin: 0, marginBottom: ss(12), textTransform: 'uppercase', letterSpacing: '0.12em' })} {..._hc('hiringTagline', onFieldClick)}>
            {hiringTagline || i18n.nowHiring}
          </p>
          <p style={_hs('company', selectedField, onFieldClick, { fontSize: cos(34), fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2 })} {..._hc('company', onFieldClick)}>
            {company || 'Your Company'}
          </p>
          {jobType && (
            <div style={{ marginTop: ss(20), display: 'inline-block', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: `${ss(8)}px ${ss(18)}px`, borderRadius: 100, fontSize: cs(16), fontWeight: 600 }}>
              {translateJobType(language, jobType)}
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, background: '#ffffff', padding: `${ss(72)}px ${ss(60)}px`, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        <p {...a(1)} style={{ fontSize: cs(18), fontWeight: 600, color: '#94a3b8', margin: 0, marginBottom: ss(20), textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {i18n.openRole}
        </p>

        <h1 {...tw()} style={_hs('jobTitle', selectedField, onFieldClick, { fontSize: ts(jobTitle && jobTitle.length > 18 ? 58 : 72), fontWeight: 800, color: mainColor, margin: 0, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: ss(32) })} {..._hc('jobTitle', onFieldClick)}>
          {jobTitle || 'Job Title'}
        </h1>

        {headline && (
          <p {...a(4)} style={_hs('headline', selectedField, onFieldClick, { fontSize: hs(22), color: subColor, margin: 0, marginBottom: ss(40), lineHeight: 1.5, fontWeight: 400 })} {..._hc('headline', onFieldClick)}>{headline}</p>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: ss(20), justifyContent: 'center' }}>
          {location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: ss(16), padding: `${ss(16)}px ${ss(24)}px`, background: '#f8fafc', borderRadius: 12 }}>
              <span style={{ fontSize: cs(26) }}>📍</span>
              <div>
                <p style={{ fontSize: cs(13), color: '#94a3b8', margin: 0, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{i18n.location}</p>
                <p style={{ fontSize: cs(20), color: mainColor, margin: 0, fontWeight: 600, marginTop: 2 }}>{location}</p>
              </div>
            </div>
          )}
          {salary && (
            <div style={{ display: 'flex', alignItems: 'center', gap: ss(16), padding: `${ss(16)}px ${ss(24)}px`, background: '#f8fafc', borderRadius: 12 }}>
              <span style={{ fontSize: cs(26) }}>💰</span>
              <div>
                <p style={{ fontSize: cs(13), color: '#94a3b8', margin: 0, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{i18n.salary}</p>
                <p style={{ fontSize: cs(20), color: mainColor, margin: 0, fontWeight: 600, marginTop: 2 }}>{salary}</p>
              </div>
            </div>
          )}
          {customTags.filter(t => t.key || t.value).map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: ss(16), padding: `${ss(16)}px ${ss(24)}px`, background: '#f8fafc', borderRadius: 12 }}>
              <span style={{ fontSize: cs(20), fontWeight: 600, color: accent }}>✦</span>
              <div>
                {t.key && <p style={{ fontSize: cs(13), color: '#94a3b8', margin: 0, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.key}</p>}
                <p style={{ fontSize: cs(20), color: mainColor, margin: 0, fontWeight: 600, marginTop: t.key ? 2 : 0 }}>{t.value || t.key}</p>
              </div>
            </div>
          ))}
        </div>

        <div {...a(6)} style={{ marginTop: ss(40), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={_hs('ctaText', selectedField, onFieldClick, { background: accent, color: '#fff', padding: `${ctas(18)}px ${ctas(40)}px`, borderRadius: 12, fontSize: ctas(20), fontWeight: 600 })} {..._hc('ctaText', onFieldClick)}>
            {ctaText || i18n.cta} →
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Template 5: Custom (image background) ─────────────────────────────────────
export function CustomTemplate({ ad = {}, selectedField, onFieldClick, animated = false, animEffect = 'fade' }) {
  const { jobTitle, company, location, salary, jobType, logoUrl, brandColor: bc, imageUrl, ctaText, fontFamily, customTags = [], textColor, subTextColor, language, hiringTagline, logoBg } = ad
  const accent = bc || '#7c3aed'
  const ff = fontFamily ? `${fontFamily},Inter,sans-serif` : 'Inter,sans-serif'
  const mainColor = textColor || '#ffffff'
  const subColor = subTextColor || 'rgba(255,255,255,0.75)'
  const i18n = TEMPLATE_I18N[language] || TEMPLATE_I18N['English']
  const { ts, ls, cs, ss, ctas, cos, tls } = makeScalers(ad)
  const { styleTag, a, tw } = makeAnimHelpers(animated, animEffect)

  return (
    <div style={{ width: 1080, height: 1080, fontFamily: ff, position: 'relative', overflow: 'hidden', background: '#111', boxSizing: 'border-box' }}>
      {styleTag}
      {imageUrl
        ? <img src={imageUrl} alt="bg" style={bgImgStyle(ad)} />
        : <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${accent}, #0f0f1a)` }} />
      }
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.15) 100%)' }} />

      <div style={{ position: 'absolute', inset: 0, padding: `${ss(64)}px ${ss(72)}px`, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        <div {...a(0)}>
          <LogoMark src={logoUrl} company={company} size={ls(100)} radius={ls(18)} color={accent} bg={logoBg} />
          {hiringTagline && <p style={_hs('hiringTagline', selectedField, onFieldClick, { fontSize: tls(18), color: 'rgba(255,255,255,0.6)', margin: 0, marginTop: 8, fontWeight: 500 })} {..._hc('hiringTagline', onFieldClick)}>{hiringTagline}</p>}
        </div>

        <div style={{ marginTop: 'auto' }}>
          {jobType && (
            <div {...a(2)} style={{ display: 'inline-block', background: accent, color: '#fff', padding: `${ss(8)}px ${ss(20)}px`, borderRadius: 100, fontSize: cs(18), fontWeight: 600, marginBottom: ss(24) }}>
              {translateJobType(language, jobType)}
            </div>
          )}
          <h1 {...tw()} style={_hs('jobTitle', selectedField, onFieldClick, { fontSize: ts(jobTitle && jobTitle.length > 22 ? 64 : 80), fontWeight: 800, color: mainColor, margin: 0, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: ss(24) })} {..._hc('jobTitle', onFieldClick)}>
            {jobTitle || 'Job Title'}
          </h1>
          <p {...a(4)} style={_hs('company', selectedField, onFieldClick, { fontSize: cos(26), color: subColor, margin: 0, marginBottom: ss(16), fontWeight: 500 })} {..._hc('company', onFieldClick)}>
            {company || 'Your Company'}
          </p>
          <div {...a(5)} style={{ display: 'flex', gap: ss(12), flexWrap: 'wrap', marginBottom: ss(40) }}>
            {location && <Chip bg="rgba(255,255,255,0.15)" color="#fff" size={cs(20)}>📍 {location}</Chip>}
            {salary && <Chip bg="rgba(255,255,255,0.15)" color="#fff" size={cs(20)}>💰 {salary}</Chip>}
            {customTags.filter(t => t.key || t.value).map((t, i) => (
              <Chip key={i} bg="rgba(255,255,255,0.2)" color="#fff" size={cs(20)}>
                {t.key && t.value ? `${t.key}: ${t.value}` : t.key || t.value}
              </Chip>
            ))}
          </div>
          <div {...a(6)} style={{ display: 'flex', alignItems: 'center', gap: ss(24) }}>
            <div style={_hs('ctaText', selectedField, onFieldClick, { background: accent, color: '#fff', padding: `${ctas(18)}px ${ctas(44)}px`, borderRadius: 12, fontSize: ctas(20), fontWeight: 600 })} {..._hc('ctaText', onFieldClick)}>
              {ctaText || i18n.cta} →
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Template 6: Tags ──────────────────────────────────────────────────────────
export function TagsTemplate({ ad = {}, selectedField, onFieldClick, animated = false, animEffect = 'fade' }) {
  const { jobTitle, company, location, salary, jobType, logoUrl, brandColor: bc, ctaText, fontFamily, customTags = [], language, hiringTagline, logoBg } = ad
  const accent = bc || '#7c3aed'
  const ff = fontFamily ? `${fontFamily},Inter,sans-serif` : 'Inter,sans-serif'
  const i18n = TEMPLATE_I18N[language] || TEMPLATE_I18N['English']
  const { ts, ls, cs, ss, ctas, cos, tls } = makeScalers(ad)
  const { styleTag, a, tw } = makeAnimHelpers(animated, animEffect)
  const c = resolveColors(ad)

  const autoTags = [
    jobType && translateJobType(language, jobType),
  ].filter(Boolean)

  const customTagItems = customTags
    .filter(t => t.key || t.value)
    .map(t => t.value || t.key)

  const allTags = [...new Set([...autoTags, ...customTagItems])]

  return (
    <div style={{ width: 1080, height: 1080, background: c.bg, fontFamily: ff, position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>
      {styleTag}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, background: c.stripe }} />

      <div style={{ padding: `${ss(72)}px ${ss(80)}px`, height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        <div {...a(0)} style={{ display: 'flex', alignItems: 'center', gap: ss(24), marginBottom: ss(52) }}>
          <LogoMark src={logoUrl} company={company} size={ls(104)} radius={ls(20)} color={accent} bg={logoBg} />
          <div>
            <p style={_hs('company', selectedField, onFieldClick, { fontSize: cos(32), fontWeight: 700, color: c.mainText, margin: 0, lineHeight: 1.2 })} {..._hc('company', onFieldClick)}>{company || 'Your Company'}</p>
            <p style={_hs('hiringTagline', selectedField, onFieldClick, { fontSize: tls(20), color: c.subText, margin: 0, marginTop: 6, fontWeight: 400 })} {..._hc('hiringTagline', onFieldClick)}>{hiringTagline || i18n.isHiring}</p>
          </div>
        </div>

        <h1 {...tw()} style={_hs('jobTitle', selectedField, onFieldClick, { fontSize: ts(jobTitle && jobTitle.length > 22 ? 68 : 86), fontWeight: 900, color: c.mainText, margin: 0, lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: ss(20) })} {..._hc('jobTitle', onFieldClick)}>
          {jobTitle || 'Job Title'}
        </h1>

        {location && (
          <p {...a(4)} style={{ fontSize: ts(24), color: c.subText, margin: 0, marginBottom: ss(36), fontWeight: 500 }}>
            📍 {location}
          </p>
        )}

        <div {...a(5)} style={{ display: 'flex', flexWrap: 'wrap', gap: ss(16), flex: 1, alignContent: 'flex-start' }}>
          {allTags.map((tag, i) => (
            <span key={i} style={{ background: c.chipBg, color: c.chipColor, padding: `${ss(14)}px ${ss(30)}px`, borderRadius: 100, fontSize: cs(26), fontWeight: 600, fontFamily: 'Inter,sans-serif', display: 'inline-block', whiteSpace: 'nowrap' }}>
              {tag}
            </span>
          ))}
        </div>

        <div {...a(6)} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: ss(48) }}>
          <div style={_hs('ctaText', selectedField, onFieldClick, { background: c.ctaBg, color: c.ctaColor, padding: `${ctas(20)}px ${ctas(44)}px`, borderRadius: 14, fontSize: ctas(22), fontWeight: 600 })} {..._hc('ctaText', onFieldClick)}>
            {ctaText || i18n.cta} →
          </div>
          {salary && (
            <div style={{ background: c.cardBg, border: `1.5px solid ${c.borderClr}`, borderRadius: 14, padding: `${ss(18)}px ${ss(32)}px`, textAlign: 'right' }}>
              <p style={{ fontSize: cs(13), fontWeight: 600, color: c.accentTxt, margin: 0, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{i18n.salary}</p>
              <p style={{ fontSize: ts(28), fontWeight: 800, color: c.accentTxt, margin: 0, marginTop: 6 }}>💰 {salary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── FormatWrapper — extends 1080×1080 creative to vertical / landscape ─────────
// Used for TikTok/Snapchat (9:16 = 1080×1920) and YouTube/Banner (16:9 = 1920×1080).
// The base creative sits in its natural 1080×1080 area; extra canvas is brand-colored.
// ── FormatWrapper ─────────────────────────────────────────────────────────────
// Wraps the base 1080×1080 creative into the target canvas format.
// `animated` — enables CSS entrance animations (preview only, not PNG export).
//
// Safe zones baked in:
//   Vertical  (1080×1920): top 130px, bottom 280px, right 150px  → avoid
//   Landscape (1920×1080): top 60px, bottom 80px                 → avoid
export function FormatWrapper({ ad = {}, format, animated = false, children }) {
  const accent = ad.brandColor || '#7c3aed'
  const ff     = ad.fontFamily ? `${ad.fontFamily},Inter,sans-serif` : 'Inter,sans-serif'
  const white  = '#ffffff'

  // Collect display tags — jobType shown as accent chip separately, so chips row = location + salary (or custom tags)
  const rawTags = (ad.customTags || []).map(t => t.value ? `${t.key}: ${t.value}` : t.key).filter(Boolean)
  const detailChips = [ad.location, ad.salary].filter(Boolean)
  const chips = rawTags.length > 0 ? rawTags : detailChips

  // ── VERTICAL (1080×1920) ────────────────────────────────────────────────────
  // Design: full-bleed bg image / gradient, heavy bottom-of-screen gradient,
  // all content anchored to the bottom of the safe zone (above 280px unsafe margin).
  // Right content margin avoids the 150px action-button zone.
  if (format === 'vertical') {
    const hasBg = !!ad.imageUrl
    const { ts, cs, ctas, cos } = makeScalers(ad)
    const i18n = TEMPLATE_I18N[ad.language] || TEMPLATE_I18N['English']

    // CSS animations — injected via <style> tag, only when animated=true
    const animStyles = animated ? `
      @keyframes _fw_slideUp  { from { opacity:0; transform:translateY(40px) } to { opacity:1; transform:translateY(0) } }
      @keyframes _fw_fadeIn   { from { opacity:0 }                             to { opacity:1 } }
      ._fw_a0 { animation: _fw_fadeIn   0.6s ease both }
      ._fw_a1 { animation: _fw_slideUp  0.5s 0.15s ease both }
      ._fw_a2 { animation: _fw_slideUp  0.5s 0.30s ease both }
      ._fw_a3 { animation: _fw_slideUp  0.5s 0.45s ease both }
      ._fw_a4 { animation: _fw_slideUp  0.5s 0.60s ease both }
      ._fw_a5 { animation: _fw_slideUp  0.5s 0.75s ease both }
    ` : ''

    const a = (n) => animated ? { className: `_fw_a${n}` } : {}

    return (
      <div style={{ width: 1080, height: 1920, position: 'relative', overflow: 'hidden', fontFamily: ff, background: '#000' }}>
        {animated && <style>{animStyles}</style>}

        {/* ── Background ── */}
        {hasBg ? (
          <img src={ad.imageUrl} alt="" style={bgImgStyle(ad, { opacity: 0.65 })} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${hex(accent, 0.9)} 0%, ${darken(accent, 50)} 100%)` }} />
        )}

        {/* ── Gradient overlays for readability ── */}
        {/* Top fade */}
        <div {...a(0)} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 400, background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)' }} />
        {/* Bottom fade — heavy, anchors text */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1100, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.5) 55%, transparent 100%)' }} />

        {/* ── Logo + company — above 342px top safe zone (TikTok sponsored label) ── */}
        <div {...a(1)} style={{ position: 'absolute', top: 380, left: 72, display: 'flex', alignItems: 'center', gap: 28 }}>
          {ad.logoUrl && (
            <div style={{ width: cos(96), height: cos(96), borderRadius: 20, overflow: 'hidden', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src={ad.logoUrl} alt={ad.company} style={{ width: '82%', height: '82%', objectFit: 'contain' }} />
            </div>
          )}
          <div>
            {ad.company && <p style={{ color: white, fontSize: cos(30), fontWeight: 700, margin: 0, lineHeight: 1.2 }}>{ad.company}</p>}
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: cos(24), margin: 0, marginTop: 4, fontWeight: 400 }}>
              {ad.hiringTagline || i18n.tagline || 'is hiring'}
            </p>
          </div>
        </div>

        {/* ── Main content block — above 608px bottom safe zone (TikTok captions + CTA + sound) ── */}
        <div style={{ position: 'absolute', bottom: 640, left: 72, right: 240 }}>

          {/* Job type chip */}
          {(ad.jobType) && (
            <div {...a(2)}>
              <span style={{ display: 'inline-block', background: accent, color: white, borderRadius: 100, padding: '12px 32px', fontSize: cs(24), fontWeight: 700, letterSpacing: '0.04em', marginBottom: 28, textTransform: 'uppercase' }}>
                {translateJobType(ad.language, ad.jobType)}
              </span>
            </div>
          )}

          {/* Job title — large hero text */}
          <h1 {...a(3)} style={{ color: white, fontSize: (ad.jobTitle || '').length > 28 ? ts(70) : ts(88), fontWeight: 900, margin: '0 0 36px', lineHeight: 1.05, letterSpacing: '-0.03em' }}>
            {ad.jobTitle || 'We\'re Hiring'}
          </h1>

          {/* Details row */}
          <div {...a(4)} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}>
            {ad.location && <span style={{ color: 'rgba(255,255,255,0.82)', fontSize: cs(28), fontWeight: 500 }}>📍 {ad.location}</span>}
            {ad.salary   && <span style={{ color: 'rgba(255,255,255,0.82)', fontSize: cs(28), fontWeight: 500 }}>💰 {ad.salary}</span>}
          </div>

          {/* Chips — max 3 to keep it clean */}
          {chips.length > 0 && (
            <div {...a(4)} style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 52 }}>
              {chips.slice(0, 3).map((tag, i) => (
                <span key={i} style={{ background: 'rgba(255,255,255,0.14)', border: '1.5px solid rgba(255,255,255,0.28)', backdropFilter: 'blur(6px)', color: white, padding: '12px 30px', borderRadius: 100, fontSize: cs(24), fontWeight: 500 }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA button */}
          <div {...a(5)} style={{ display: 'inline-block', background: white, color: accent, borderRadius: 20, padding: '28px 72px', fontSize: ctas(32), fontWeight: 900, letterSpacing: '-0.01em', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
            {ad.ctaText || i18n.cta || 'Apply Now'} →
          </div>
        </div>
      </div>
    )
  }

  // ── LANDSCAPE (1920×1080) ────────────────────────────────────────────────────
  // Design: brand text panel left (840px) + creative right (1080px).
  // Safe zones: top 60px (title overlay), bottom 80px (player controls).
  if (format === 'landscape') {
    const i18n = TEMPLATE_I18N[ad.language] || TEMPLATE_I18N['English']
    const animStyles = animated ? `
      @keyframes _fw_sl { from { opacity:0; transform:translateX(-30px) } to { opacity:1; transform:translateX(0) } }
      ._fw_la0 { animation: _fw_sl 0.5s 0.1s ease both }
      ._fw_la1 { animation: _fw_sl 0.5s 0.25s ease both }
      ._fw_la2 { animation: _fw_sl 0.5s 0.40s ease both }
      ._fw_la3 { animation: _fw_sl 0.5s 0.55s ease both }
    ` : ''
    const la = (n) => animated ? { className: `_fw_la${n}` } : {}

    // Content-aware sizing: reduce font and gap when many fields are present
    const detailCount = [ad.location, ad.salary, ad.jobType].filter(Boolean).length
    const hasLogo = !!ad.logoUrl
    const headlineText = ad.headline || ad.jobTitle || ''
    const headlineLong = headlineText.length > 35
    const contentDense = detailCount >= 2 || hasLogo
    const headlineFontSize = headlineLong ? (contentDense ? 44 : 52) : (contentDense ? 56 : 64)
    const detailFontSize = contentDense ? 20 : 24
    const panelGap = contentDense ? 24 : 32

    return (
      <div style={{ width: 1920, height: 1080, display: 'flex', background: accent, fontFamily: ff, overflow: 'hidden' }}>
        {animated && <style>{animStyles}</style>}

        {/* Left brand panel — content within safe zone (top:100, bottom:130) */}
        <div style={{ width: 840, height: 1080, flexShrink: 0, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '130px 80px 150px' }}>
          {/* Subtle texture */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%)' }} />

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: panelGap, maxHeight: 800, overflow: 'hidden' }}>
            {/* Logo */}
            {hasLogo && (
              <div {...la(0)} style={{ width: 80, height: 80, borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <img src={ad.logoUrl} alt={ad.company} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
              </div>
            )}

            {/* Company + headline */}
            <div {...la(1)} style={{ color: white }}>
              {ad.company && <p style={{ fontSize: 20, fontWeight: 600, margin: '0 0 12px', opacity: 0.65, letterSpacing: '0.1em', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ad.company}</p>}
              <h2 style={{ fontSize: headlineFontSize, fontWeight: 900, margin: 0, lineHeight: 1.08, letterSpacing: '-0.025em', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {headlineText || 'We\'re Hiring'}
              </h2>
            </div>

            {/* Details — show max 2 to avoid overflow */}
            <div {...la(2)} style={{ display: 'flex', flexDirection: 'column', gap: 10, color: 'rgba(255,255,255,0.8)', fontSize: detailFontSize, fontWeight: 500 }}>
              {ad.location && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📍 {ad.location}</span>}
              {ad.salary   && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>💰 {ad.salary}</span>}
              {ad.jobType  && <span>⏱ {translateJobType(ad.language, ad.jobType)}</span>}
            </div>

            {/* CTA */}
            <div {...la(3)} style={{ display: 'inline-block' }}>
              <div style={{ background: white, color: accent, borderRadius: 14, padding: '18px 48px', fontSize: 24, fontWeight: 800, letterSpacing: '-0.01em', display: 'inline-block' }}>
                {ad.ctaText || i18n.cta || 'Apply Now'} →
              </div>
            </div>
          </div>
        </div>

        {/* Right: base creative (1080×1080), clips neatly to 1080px high) */}
        <div style={{ width: 1080, height: 1080, flexShrink: 0 }}>{children}</div>
      </div>
    )
  }

  // ── SQUARE — just the creative as-is ────────────────────────────────────────
  return children
}

// ── Per-template optimal scale defaults ──────────────────────────────────────
// Applied automatically when the user switches to a template so it looks
// great out of the box. Users can still override via the Layout sliders.
const SCALE_DEFAULTS = {
  titleScale: 1, logoScale: 1, tagScale: 1, spacingScale: 1,
  ctaScale: 1, companyScale: 1, taglineScale: 1, headlineScale: 1,
}

// ── Registry ──────────────────────────────────────────────────────────────────
export const TEMPLATES = [
  { id: 'tags',     label: 'Tags',      desc: 'Hashtag-driven, salary badge',    component: TagsTemplate,
    defaults: { ...SCALE_DEFAULTS } },
  { id: 'classic',  label: 'Classic',   desc: 'Clean & professional',            component: ClassicTemplate,
    defaults: { ...SCALE_DEFAULTS } },
  { id: 'bold',     label: 'Bold Dark', desc: 'High impact, dark',               component: BoldTemplate,
    defaults: { ...SCALE_DEFAULTS, titleScale: 0.9, spacingScale: 0.9 } },
  { id: 'gradient', label: 'Gradient',  desc: 'Colorful & modern',               component: GradientTemplate,
    defaults: { ...SCALE_DEFAULTS } },
  // Split has a fixed 1080×1080 canvas split in two columns; with many content
  // items (tags, salary, location) the right column overflows at 100% spacing.
  // These tighter defaults keep everything on-canvas for typical job ads.
  { id: 'split',    label: 'Split',     desc: 'Two-column layout',               component: SplitTemplate,
    defaults: { titleScale: 0.88, logoScale: 0.88, tagScale: 0.82, spacingScale: 0.72, ctaScale: 0.95, companyScale: 0.88, taglineScale: 0.9, headlineScale: 0.88 } },
  { id: 'custom',   label: 'Custom',    desc: 'Use your ad image as background', component: CustomTemplate,
    defaults: { ...SCALE_DEFAULTS } },
]

// ── Template preview thumbnail ────────────────────────────────────────────────
// Renders a template at a scaled-down size. Use `size` to control the
// output box dimension (the inner div is always 1080×1080 and CSS-scaled).
export function TemplateThumbnail({ templateId, ad, size = 220 }) {
  const entry = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0]
  const Comp = entry.component
  const scale = size / 1080

  return (
    <div style={{ width: size, height: size, position: 'relative', overflow: 'hidden', borderRadius: 10 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
        <Comp ad={ad} />
      </div>
    </div>
  )
}
