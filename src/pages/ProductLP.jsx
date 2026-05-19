import { useParams, Link, Navigate } from 'react-router-dom'
import MarketingLayout from '../components/MarketingLayout'
import SEO from '../components/SEO'
import { PRODUCT_LPS, PLATFORM_LOGOS } from '../content/productLPs'
import { ArrowRight, Check, Sparkles, Heart, MessageCircle, Send } from 'lucide-react'

export default function ProductLP() {
  const { slug } = useParams()
  const data = PRODUCT_LPS[slug]
  if (!data) return <Navigate to="/" replace />

  return (
    <MarketingLayout>
      <SEO
        title={`${data.title} — Recruitment Ads`}
        description={data.tagline + ' ' + data.hero.slice(0, 120)}
        canonical={`https://hireads.app/product/${slug}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: `HireAds — ${data.title}`,
          applicationCategory: 'BusinessApplication',
          description: data.tagline,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
          operatingSystem: 'Web',
        }}
      />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-14">
        <nav className="text-xs text-theme-muted mb-6">
          <Link to="/" className="hover:text-theme-text2">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/product" className="hover:text-theme-text2">Product</Link>
          <span className="mx-2">/</span>
          <span className="text-theme-text2">{data.title}</span>
        </nav>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600/10 border border-purple-500/20 text-xs text-purple-400 mb-5">
          <Sparkles size={12} /> Product
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-[1.1]">{data.title}</h1>
        <p className="text-xl text-theme-text2 mb-6 max-w-3xl">{data.tagline}</p>
        <p className="text-base text-theme-text2 mb-8 max-w-3xl leading-relaxed">{data.hero}</p>
        <div className="flex flex-wrap gap-3">
          <Link to={data.cta.to} className="btn-primary inline-flex items-center gap-2">
            {data.cta.label} <ArrowRight size={16} />
          </Link>
          <Link to="/contact" className="btn-secondary">Talk to us</Link>
        </div>
      </section>

      {/* Platform badges */}
      {data.platforms?.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-10">
          <p className="text-xs text-theme-muted mb-3 uppercase tracking-wide">Works on</p>
          <div className="flex flex-wrap gap-2">
            {data.platforms.map(p => (
              <span key={p} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-theme-card border border-theme-bdr text-sm">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: PLATFORM_LOGOS[p]?.color }} />
                {PLATFORM_LOGOS[p]?.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Bullets */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-6">What you get</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {data.bullets.map((b, i) => (
            <div key={i} className="flex gap-3 p-4 rounded-xl bg-theme-card border border-theme-bdr">
              <Check size={18} className="text-green-400 shrink-0 mt-0.5" />
              <p className="text-sm text-theme-text2 leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lead Ads flow diagram */}
      {data.flowDiagram && (
        <section className="max-w-5xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold mb-8 text-center">How the flow works</h2>
          <div className="grid md:grid-cols-4 gap-4 relative">
            {data.flowDiagram.map((s, i) => (
              <div key={i} className="relative p-5 rounded-xl bg-gradient-to-br from-purple-600/10 to-indigo-600/10 border border-purple-500/20">
                <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm mb-3">{s.step}</div>
                <p className="font-semibold mb-1">{s.label}</p>
                <p className="text-xs text-theme-text2 leading-relaxed">{s.detail}</p>
                {i < data.flowDiagram.length - 1 && (
                  <ArrowRight size={16} className="hidden md:block absolute top-1/2 -right-3 text-purple-400" />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Competitors table (ATS only) */}
      {data.competitors && (
        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold mb-6 text-center">How we compare</h2>
          <div className="rounded-xl border border-theme-bdr overflow-hidden">
            {data.competitors.map((c, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-5 py-4 ${c.highlight ? 'bg-purple-600/10 border-l-4 border-purple-500' : 'bg-theme-card'} ${i > 0 ? 'border-t border-theme-bdr' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-semibold ${c.highlight ? 'text-purple-300' : ''}`}>{c.name}</span>
                  {c.highlight && <Sparkles size={14} className="text-purple-400" />}
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-sm text-theme-text2">{c.gripe}</span>
                  <span className={`font-mono font-semibold ${c.highlight ? 'text-green-400' : 'text-theme-text2'}`}>{c.price}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mockup social comments */}
      {data.mockupComments?.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold mb-6">What candidates say</h2>
          <div className="space-y-3">
            {data.mockupComments.map((c, i) => (
              <div key={i} className="flex gap-3 p-4 rounded-xl bg-theme-card border border-theme-bdr">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shrink-0 flex items-center justify-center text-white text-xs font-bold">
                  {c.author.split(' ').map(x => x[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1">{c.author}</p>
                  <p className="text-sm text-theme-text2 leading-relaxed">{c.body}</p>
                  <div className="flex gap-4 mt-2 text-xs text-theme-muted">
                    <span className="inline-flex items-center gap-1"><Heart size={12} /> {c.likes}</span>
                    <span className="inline-flex items-center gap-1"><MessageCircle size={12} /> Reply</span>
                    <span className="inline-flex items-center gap-1"><Send size={12} /> Share</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {data.faq?.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold mb-6">Frequently asked</h2>
          <div className="space-y-3">
            {data.faq.map((f, i) => (
              <details key={i} className="group rounded-xl bg-theme-card border border-theme-bdr p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="cursor-pointer flex items-center justify-between font-semibold">
                  {f.q}
                  <span className="text-theme-muted group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="mt-3 text-sm text-theme-text2 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Related products — internal linking */}
      {data.related?.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold mb-6">Keep exploring</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {data.related.map(r => {
              const related = PRODUCT_LPS[r]
              if (!related) return null
              return (
                <Link
                  key={r}
                  to={`/product/${r}`}
                  className="block p-5 rounded-xl bg-theme-card border border-theme-bdr hover:border-purple-500/40 transition-colors group"
                >
                  <p className="font-semibold mb-1.5 group-hover:text-purple-400 transition-colors">{related.title}</p>
                  <p className="text-xs text-theme-text2 leading-relaxed">{related.tagline}</p>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-3">Ready to stop losing candidates?</h2>
        <p className="text-theme-text2 mb-6">Free to start. No credit card. 100 PLN minimum ad spend when you launch.</p>
        <Link to={data.cta.to} className="btn-primary inline-flex items-center gap-2">
          {data.cta.label} <ArrowRight size={16} />
        </Link>
      </section>
    </MarketingLayout>
  )
}
