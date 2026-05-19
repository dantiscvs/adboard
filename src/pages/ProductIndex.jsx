import { Link } from 'react-router-dom'
import MarketingLayout from '../components/MarketingLayout'
import SEO from '../components/SEO'
import { PRODUCT_LPS, PRODUCT_LP_SLUGS } from '../content/productLPs'
import { ArrowRight } from 'lucide-react'

export default function ProductIndex() {
  return (
    <MarketingLayout>
      <SEO
        title="Product"
        description="Everything HireAds does: job ad creator, AI copy with anti-ban, Lead Ads flow, free ATS, multi-platform campaigns, targeting."
        canonical="https://hireads.app/product"
      />
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">The complete recruitment ad stack</h1>
        <p className="text-lg text-theme-text2 max-w-2xl">
          Six tools that replace your entire recruitment funnel — from first scroll to signed offer letter.
        </p>
      </section>
      <section className="max-w-5xl mx-auto px-6 pb-20 grid md:grid-cols-2 gap-4">
        {PRODUCT_LP_SLUGS.map(slug => {
          const p = PRODUCT_LPS[slug]
          return (
            <Link
              key={slug}
              to={`/product/${slug}`}
              className="group p-6 rounded-2xl bg-theme-card border border-theme-bdr hover:border-purple-500/40 transition-all"
            >
              <h2 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors flex items-center justify-between">
                {p.title} <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h2>
              <p className="text-sm text-theme-text2 mb-3">{p.tagline}</p>
              <p className="text-xs text-theme-muted leading-relaxed line-clamp-3">{p.hero}</p>
            </Link>
          )
        })}
      </section>
    </MarketingLayout>
  )
}
