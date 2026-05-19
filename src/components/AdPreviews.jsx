import { useState } from 'react'
import { Image as ImageIcon, Heart, MessageCircle, Share2, Bookmark, ThumbsUp, MoreHorizontal, Play } from 'lucide-react'
import { PLATFORM_COPY_LIMITS, PLATFORM_FORMAT } from '../constants'

// ── Generic placeholder image ────────────────────────────────────────────────
function AdImage({ src, alt, className }) {
  if (src) return <img src={src} alt={alt} className={className} />
  return (
    <div className={`${className} bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center`}>
      <ImageIcon size={28} className="text-gray-500" />
    </div>
  )
}

// ── Creative slot — shows rendered template or falls back to raw imageUrl ─────
// slotWidth / creativeW / creativeH: dimensions of creative element (default 1080×1080).
// className controls position (relative/absolute) — we never override it in style.
function CreativeSlot({ creative, ad, alt, slotWidth, creativeW = 1080, creativeH = 1080, className }) {
  if (creative) {
    const scale = slotWidth / creativeW
    // Don't set position in style — let className handle absolute/relative
    return (
      <div className={className} style={{ overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: creativeW, height: creativeH,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
        }}>
          {creative}
        </div>
      </div>
    )
  }
  if (ad.imageUrl) return <img src={ad.imageUrl} alt={alt} className={className} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
  return (
    <div className={`${className} bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center`}>
      <ImageIcon size={28} className="text-gray-500" />
    </div>
  )
}

// ── Safe-zone overlay for canvas editor preview ───────────────────────────────
// Renders semi-transparent "unsafe" bands so the designer knows where platform
// chrome (navigation, action buttons, swipe handles) overlaps the creative.
// Coordinates are in the creative's native pixel space (scaled to match preview).
// Only needed for vertical (TikTok / Snapchat) and landscape (YouTube).
export function SafeZoneOverlay({ format, previewW, previewH, canvasW, canvasH }) {
  if (!format || format === 'square') return null

  const sx = previewW / canvasW   // scale factors for overlay positions
  const sy = previewH / canvasH

  const band = (style, label) => (
    <div style={{
      position: 'absolute', background: 'rgba(255,60,60,0.18)',
      border: '1px dashed rgba(255,80,80,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none', zIndex: 10,
      ...style,
    }}>
      <span style={{ fontSize: 9, color: 'rgba(255,120,120,0.9)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </div>
  )

  if (format === 'vertical') {
    // TikTok / Instagram Reels / Snapchat — 1080×1920 native
    // Calibrated from TikTok preview at 240×426px (scale ≈ 0.222):
    //   top: "Following/For You" bar (12px) + Sponsored badge (56+20px) = 76px preview → 342px native
    //   bottom: @handle + caption + hashtags + CTA + sound ≈ 135px preview → 608px native
    //   right: action column w-9 + right-2 offset ≈ 50px preview → 225px native
    const topH    = Math.round(342 * sy)
    const bottomH = Math.round(608 * sy)
    const rightW  = Math.round(225 * sx)
    return (
      <>
        {band({ top: 0, left: 0, right: 0, height: topH }, 'Navigation — keep clear')}
        {band({ bottom: 0, left: 0, right: 0, height: bottomH }, 'Captions & CTA — keep clear')}
        {band({ top: topH, bottom: bottomH, right: 0, width: rightW }, 'Actions')}
      </>
    )
  }

  if (format === 'landscape') {
    // YouTube in-stream ad — 1920×1080 native
    // Top: video title overlay + skip-ad countdown area (~100px)
    // Bottom: progress bar + control bar + subscribe CTA (~130px)
    const topH    = Math.round(100 * sy)   // title / skip-ad overlay
    const bottomH = Math.round(130 * sy)   // playback controls + CTA bar
    return (
      <>
        {band({ top: 0, left: 0, right: 0, height: topH }, 'Title / Skip-ad — keep clear')}
        {band({ bottom: 0, left: 0, right: 0, height: bottomH }, 'Controls — keep clear')}
      </>
    )
  }

  return null
}

// ── Platform-aware text with truncation ──────────────────────────────────────
function PlatformText({ text, platform, className }) {
  const [expanded, setExpanded] = useState(false)
  const limit = PLATFORM_COPY_LIMITS[platform]?.primaryText
  if (!text) return null

  // Normalise newlines → visual line breaks for platform chrome
  const display = text.replace(/\n{3,}/g, '\n\n')

  if (!limit || expanded || display.length <= limit) {
    return (
      <p className={className} style={{ whiteSpace: 'pre-line' }}>
        {display}
        {expanded && (
          <button onClick={() => setExpanded(false)} className="ml-1 font-semibold text-inherit opacity-60 hover:opacity-100">
            {' '}see less
          </button>
        )}
      </p>
    )
  }

  const visible = display.slice(0, limit).trimEnd()
  return (
    <p className={className} style={{ whiteSpace: 'pre-line' }}>
      {visible}…{' '}
      <button onClick={() => setExpanded(true)} className="font-semibold text-inherit opacity-70 hover:opacity-100">
        see more
      </button>
    </p>
  )
}

// Publisher avatar — uses company logo if available, else brand-coloured initials
function PublisherAvatar({ ad, size = 10, rounded = 'rounded-full' }) {
  const px = size * 4  // Tailwind size unit → approximate px
  if (ad?.logoUrl) {
    return <img src={ad.logoUrl} alt={ad.company} className={`w-${size} h-${size} ${rounded} object-cover shrink-0`} />
  }
  const initials = (ad?.company || 'HA')
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('')
  const bg = ad?.brandColor || '#5B4AE8'
  return (
    <div
      className={`w-${size} h-${size} ${rounded} flex items-center justify-center text-white font-bold shrink-0`}
      style={{ background: bg, fontSize: px * 0.35, letterSpacing: '-0.02em' }}
    >
      {initials || 'HA'}
    </div>
  )
}

// Client logo — used only inside ad image slots
function Logo({ src, name, size = 10, rounded = 'rounded-full' }) {
  if (src) return <img src={src} alt={name} className={`w-${size} h-${size} ${rounded} object-cover`} />
  return (
    <div className={`w-${size} h-${size} ${rounded} bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs`}>
      {name?.[0]?.toUpperCase() || 'C'}
    </div>
  )
}

// HireAds publisher avatar — shown in all platform preview publisher slots.
// Ads are published from HireAds accounts, not the client's page.
function HireAdsAvatar({ size = 10, rounded = 'rounded-full' }) {
  const px = size * 4
  return (
    <div
      className={`w-${size} h-${size} ${rounded} flex items-center justify-center shrink-0`}
      style={{ background: 'linear-gradient(135deg,#5B4AE8,#7B6FF0)', color: '#fff', fontWeight: 800, fontFamily: 'Inter,sans-serif', fontSize: px * 0.36, letterSpacing: '-0.02em' }}
    >
      HA
    </div>
  )
}

// ── Facebook ─────────────────────────────────────────────────────────────────
function FacebookPreview({ ad, creative }) {
  const company = ad.company || 'Your Company'
  return (
    <div className="w-[340px] bg-white rounded-xl overflow-hidden shadow-2xl font-sans">
      {/* FB Header — published from HireAds page */}
      <div className="px-3 py-2.5 flex items-center gap-2">
        <HireAdsAvatar size={10} />
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-gray-900">HireAds</p>
          <p className="text-[11px] text-gray-400">Sponsored · <span className="text-[#1877F2]">🌐</span></p>
        </div>
        <MoreHorizontal size={16} className="text-gray-400" />
      </div>
      {/* Primary text */}
      <PlatformText
        platform="facebook"
        text={ad.primaryText || `🚀 We're hiring!\n\n${company} is looking for a ${ad.jobTitle || 'talented person'}.${ad.location ? `\n📍 ${ad.location}` : ''}${ad.salary ? `\n💰 ${ad.salary}` : ''}\n\nTap Apply to connect.`}
        className="px-3 pb-2 text-[13px] text-gray-800 leading-snug"
      />
      {/* Creative / Image — square 1080×1080, shown at 1:1 in feed */}
      <CreativeSlot creative={creative} ad={ad} alt="ad" slotWidth={340} className="w-full h-[340px] relative" />
      {/* CTA bar */}
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-gray-100">
        <div>
          <p className="text-[13px] font-semibold text-gray-900">{ad.headline || ad.jobTitle || 'We\'re Hiring!'}</p>
          <p className="text-[11px] text-gray-400">{ad.location || ad.company || 'hireads.io'}</p>
        </div>
        <button
          className="text-[13px] font-semibold px-3 py-1.5 rounded-md text-white"
          style={{ background: ad.brandColor || '#1877F2' }}
        >
          {ad.ctaText || 'Apply Now'}
        </button>
      </div>
      {/* Reactions bar */}
      <div className="px-3 py-2 flex gap-4 text-[12px] text-gray-500">
        <button className="flex items-center gap-1 hover:text-[#1877F2]">
          <ThumbsUp size={14} /> Like
        </button>
        <button className="flex items-center gap-1">
          <MessageCircle size={14} /> Comment
        </button>
        <button className="flex items-center gap-1">
          <Share2 size={14} /> Share
        </button>
      </div>
    </div>
  )
}

// ── Instagram ────────────────────────────────────────────────────────────────
function InstagramPreview({ ad, creative }) {
  const company = ad.company || 'yourcompany'
  return (
    <div className="w-[320px] bg-white rounded-xl overflow-hidden shadow-2xl font-sans">
      {/* IG Header — published from HireAds account */}
      <div className="px-3 py-2 flex items-center gap-2 border-b border-gray-100">
        <HireAdsAvatar size={9} />
        <div className="flex-1">
          <p className="text-[12px] font-semibold text-gray-900">hireads.pl</p>
          <p className="text-[10px] text-gray-400">Sponsored</p>
        </div>
        <MoreHorizontal size={15} className="text-gray-400" />
      </div>
      {/* Creative / Image — square 1080×1080 */}
      <CreativeSlot creative={creative} ad={ad} alt="ad" slotWidth={320} className="w-full h-[320px] relative" />
      {/* CTA */}
      <div
        className="text-white text-center text-[13px] font-semibold py-2.5"
        style={{ background: ad.brandColor || '#E1306C' }}
      >
        {ad.ctaText || 'Apply Now'}
      </div>
      {/* Actions */}
      <div className="px-3 py-2 flex items-center gap-3">
        <Heart size={20} className="text-gray-800" />
        <MessageCircle size={20} className="text-gray-800" />
        <Share2 size={20} className="text-gray-800" />
        <Bookmark size={20} className="text-gray-800 ml-auto" />
      </div>
      {/* Caption */}
      <div className="px-3 pb-3">
        <p className="text-[12px] text-gray-900">
          <span className="font-semibold">hireads.pl </span>
        </p>
        <PlatformText
          platform="instagram"
          text={ad.primaryText || `${ad.jobTitle || 'Job opportunity'} 🚀${ad.location ? `\n📍 ${ad.location}` : ''}${ad.salary ? `\n💰 ${ad.salary}` : ''}\n\nTap Apply 👇`}
          className="text-[12px] text-gray-700 leading-snug mt-0.5"
        />
        <p className="text-[11px] text-[#E1306C] mt-1">
          {['hiring', 'jobopening', ad.jobType?.toLowerCase()].filter(Boolean).map(t => `#${t}`).join(' ')}
        </p>
      </div>
    </div>
  )
}

// ── TikTok ───────────────────────────────────────────────────────────────────
function TikTokPreview({ ad, creative }) {
  const company = ad.company || 'yourcompany'
  return (
    <div className="w-[240px] h-[426px] bg-black rounded-2xl overflow-hidden shadow-2xl relative font-sans">
      {/* Background creative / image — vertical 1080×1920 */}
      <CreativeSlot creative={creative} ad={ad} alt="ad" slotWidth={240} creativeW={1080} creativeH={1920} className="w-full h-full absolute inset-0" />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

      {/* Top bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        <span className="text-white text-[11px]">Following</span>
        <span className="text-white text-[12px] font-semibold">For You</span>
        <span className="text-white text-[11px]">Search</span>
      </div>

      {/* Right sidebar actions */}
      <div className="absolute right-2 bottom-24 flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <div className="w-9 h-9 rounded-full border-2 border-white overflow-hidden">
            <HireAdsAvatar size={9} rounded="rounded-full" />
          </div>
          <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center -mt-2.5">
            <span className="text-white text-[8px] font-bold">+</span>
          </div>
        </div>
        <Heart size={24} className="text-white" fill="white" />
        <MessageCircle size={24} className="text-white" />
        <Bookmark size={24} className="text-white" />
        <Share2 size={22} className="text-white" />
      </div>

      {/* Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-3 pr-14">
        <p className="text-white text-[12px] font-semibold">@hireads.pl</p>
        <PlatformText
          platform="tiktok"
          text={ad.primaryText || `${ad.jobTitle || 'We\'re Hiring'} 🚀 ${ad.location || 'Remote'}`}
          className="text-white text-[11px] mt-0.5 leading-snug"
        />
        <p className="text-white/70 text-[10px] mt-1">
          {['hiring', 'jobs', ad.jobType?.toLowerCase()].filter(Boolean).map(t => `#${t}`).join(' ')}
        </p>
        {/* CTA */}
        <button
          className="mt-2 px-4 py-1.5 rounded-full text-white text-[11px] font-semibold w-full text-center"
          style={{ background: ad.brandColor || '#FE2C55' }}
        >
          {ad.ctaText || 'Apply Now'}
        </button>
        {/* Sound */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="w-3 h-3 rounded-full border border-white flex items-center justify-center">
            <span className="text-[6px] text-white">♪</span>
          </div>
          <p className="text-white/60 text-[9px] truncate">HireAds · Sponsored</p>
        </div>
      </div>

      {/* Sponsored label */}
      <div className="absolute top-14 left-3">
        <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">Sponsored</span>
      </div>
    </div>
  )
}

// ── YouTube ──────────────────────────────────────────────────────────────────
function YouTubePreview({ ad, creative }) {
  const company = ad.company || 'Your Company'
  return (
    <div className="w-[360px] bg-[#0f0f0f] rounded-xl overflow-hidden shadow-2xl font-sans">
      {/* Video area — landscape 1920×1080 */}
      <div className="relative w-full h-[202px] bg-black">
        <CreativeSlot creative={creative} ad={ad} alt="ad" slotWidth={360} creativeW={1920} creativeH={1080} className="w-full h-full absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
            <Play size={20} className="text-white" fill="white" />
          </div>
        </div>
        <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">Ad · 0:30</div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
          <div className="h-full w-1/3 bg-red-600" />
        </div>
      </div>

      {/* Controls */}
      <div className="px-3 py-1.5 bg-black flex items-center gap-3 text-gray-400 text-[11px]">
        <Play size={14} className="text-white" />
        <span className="text-white">0:10</span>
        <div className="flex-1 h-0.5 bg-gray-700 rounded-full">
          <div className="h-full w-1/3 bg-red-600 rounded-full" />
        </div>
        <span>0:30</span>
      </div>

      {/* Info */}
      <div className="p-3 flex gap-2">
        <HireAdsAvatar size={9} rounded="rounded-full" />
        <div className="flex-1 min-w-0">
          <p className="text-white text-[13px] font-medium leading-snug">
            {ad.headline || `${ad.jobTitle} at ${company} | We're Hiring!`}
          </p>
          <p className="text-gray-400 text-[11px] mt-0.5">HireAds · Sponsored</p>
        </div>
      </div>

      {/* CTA */}
      <div className="px-3 pb-3">
        <button
          className="w-full py-2 rounded-sm text-[13px] font-medium text-white"
          style={{ background: ad.brandColor || '#FF0000' }}
        >
          {ad.ctaText || 'Apply Now'} →
        </button>
      </div>
    </div>
  )
}

// ── Snapchat ─────────────────────────────────────────────────────────────────
function SnapchatPreview({ ad, creative }) {
  const company = ad.company || 'Your Company'
  return (
    <div className="w-[240px] h-[426px] rounded-2xl overflow-hidden shadow-2xl relative font-sans bg-black">
      {/* Background creative / image — vertical 1080×1920 */}
      <CreativeSlot creative={creative} ad={ad} alt="ad" slotWidth={240} creativeW={1080} creativeH={1920} className="w-full h-full absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

      {/* Top */}
      <div className="absolute top-3 left-0 right-0 flex items-center justify-center">
        <span className="bg-black/30 backdrop-blur-sm text-white text-[10px] px-3 py-1 rounded-full">Sponsored</span>
      </div>

      {/* Snapchat logo */}
      <div className="absolute top-3 left-3">
        <div className="w-6 h-6 flex items-center justify-center">
          <span className="text-white font-bold text-[14px]">👻</span>
        </div>
      </div>

      {/* Brand — published from HireAds account */}
      <div className="absolute left-3 right-3" style={{ bottom: '120px' }}>
        <div className="flex items-center gap-2 mb-2">
          <HireAdsAvatar size={8} rounded="rounded-full" />
          <p className="text-white text-[12px] font-semibold">HireAds</p>
        </div>
        <p className="text-white text-[13px] font-bold leading-snug">
          {ad.headline || ad.jobTitle || 'We\'re Hiring!'}
        </p>
        <PlatformText
          platform="snapchat"
          text={ad.primaryText || `Join our team ${ad.location ? `in ${ad.location}` : ''}`}
          className="text-white/80 text-[11px] mt-1 leading-snug"
        />
      </div>

      {/* CTA swipe up */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-4">
        <div className="flex flex-col items-center mb-1">
          <div className="w-px h-6 bg-white/50" />
          <div className="w-1 h-1 rounded-full bg-white/50" />
        </div>
        <button
          className="px-8 py-2 rounded-full text-[12px] font-bold text-black"
          style={{ background: '#FFFC00' }}
        >
          {ad.ctaText || 'Apply Now'}
        </button>
        <p className="text-white/50 text-[9px] mt-1.5">Swipe up to apply</p>
      </div>
    </div>
  )
}

// ── LinkedIn ──────────────────────────────────────────────────────────────────
function LinkedInPreview({ ad, creative }) {
  const company = ad.company || 'Your Company'
  return (
    <div className="w-[380px] bg-white rounded-xl overflow-hidden shadow-2xl font-sans">
      {/* Header — published from HireAds company page */}
      <div className="px-4 py-3 flex items-start gap-2 border-b border-gray-100">
        <HireAdsAvatar size={11} rounded="rounded-md" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-gray-900 leading-tight">HireAds</p>
          <p className="text-[11px] text-gray-400">Sponsored · 🌐</p>
        </div>
        <MoreHorizontal size={16} className="text-gray-400 mt-0.5 shrink-0" />
      </div>

      {/* Primary text */}
      <div className="px-4 py-2">
        <PlatformText
          platform="linkedin"
          text={ad.primaryText || `${company} is hiring a ${ad.jobTitle || 'talented professional'}. 🚀${ad.location ? `\n📍 ${ad.location}` : ''}${ad.salary ? `\n💰 ${ad.salary}` : ''}\n\nInterested? Hit Apply below.`}
          className="text-[13px] text-gray-800 leading-snug"
        />
      </div>

      {/* Creative / Image — square 1080×1080 */}
      <CreativeSlot creative={creative} ad={ad} alt="ad" slotWidth={380} className="w-full h-[199px] relative" />

      {/* CTA card */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 bg-gray-50">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-gray-900 truncate">{ad.headline || ad.jobTitle || 'We\'re Hiring!'}</p>
          <p className="text-[11px] text-[#0A66C2]">{ad.company ? `${ad.company}` : 'hireads.io'}</p>
        </div>
        <button
          className="ml-3 text-[12px] font-semibold px-4 py-1.5 rounded border-2 border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2]/5 shrink-0 whitespace-nowrap"
        >
          {ad.ctaText || 'Apply Now'}
        </button>
      </div>

      {/* Reactions */}
      <div className="px-4 py-2.5 flex items-center gap-4 text-[12px] text-gray-500">
        <button className="flex items-center gap-1 hover:text-[#0A66C2]">
          <ThumbsUp size={14} /> Like
        </button>
        <button className="flex items-center gap-1">
          <MessageCircle size={14} /> Comment
        </button>
        <button className="flex items-center gap-1">
          <Share2 size={14} /> Repost
        </button>
        <button className="flex items-center gap-1 ml-auto">
          <Bookmark size={14} /> Save
        </button>
      </div>
    </div>
  )
}

// ── Router ───────────────────────────────────────────────────────────────────
// creatives: { square, vertical, landscape } — each a React element rendered
// at its native canvas size (1080×1080, 1080×1920, 1920×1080).
export default function AdPreviews({ ad, platform, large, creatives = {} }) {
  const scale = large ? 1 : 0.95
  // Pick the right format creative for each platform
  const fmt = PLATFORM_FORMAT[platform] || 'square'
  const creative = creatives[fmt] ?? creatives.square ?? null

  const components = {
    facebook:  <FacebookPreview  ad={ad} creative={creative} />,
    instagram: <InstagramPreview ad={ad} creative={creative} />,
    linkedin:  <LinkedInPreview  ad={ad} creative={creative} />,
    tiktok:    <TikTokPreview    ad={ad} creative={creative} />,
    youtube:   <YouTubePreview   ad={ad} creative={creative} />,
    snapchat:  <SnapchatPreview  ad={ad} creative={creative} />,
  }

  return (
    <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
      {components[platform] || components.facebook}
    </div>
  )
}
