import { useEffect } from 'react'

// Lightweight runtime SEO. Writes <title>, meta description, canonical, OG,
// Twitter card, and optional JSON-LD. For a real SSR site you'd prerender —
// this at least gives crawlers following JS (Googlebot) good signals.
export default function SEO({
  title,
  description,
  canonical,
  image = '/favicon.svg',
  type = 'website',
  jsonLd,
  noindex = false,
}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — HireAds` : 'HireAds — Job Ads that Actually Hire'
    document.title = fullTitle

    const setMeta = (sel, attr, name, content) => {
      if (!content) return
      let el = document.head.querySelector(sel)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[name="robots"]', 'name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large')

    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    setMeta('meta[property="og:type"]', 'property', 'og:type', type)
    setMeta('meta[property="og:image"]', 'property', 'og:image', image)
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', 'HireAds')

    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle)
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image)

    // Canonical
    let canon = document.head.querySelector('link[rel="canonical"]')
    if (!canon) {
      canon = document.createElement('link')
      canon.setAttribute('rel', 'canonical')
      document.head.appendChild(canon)
    }
    canon.setAttribute('href', canonical || window.location.href.split('?')[0])

    // JSON-LD
    const existingLd = document.head.querySelector('script[data-seo-jsonld]')
    if (existingLd) existingLd.remove()
    if (jsonLd) {
      const s = document.createElement('script')
      s.type = 'application/ld+json'
      s.setAttribute('data-seo-jsonld', '1')
      s.textContent = JSON.stringify(jsonLd)
      document.head.appendChild(s)
    }
  }, [title, description, canonical, image, type, jsonLd, noindex])

  return null
}
