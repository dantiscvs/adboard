import { useParams, Link, Navigate } from 'react-router-dom'
import MarketingLayout from '../components/MarketingLayout'
import SEO from '../components/SEO'
import ArticleBody from '../components/ArticleBody'
import { BLOG_POSTS } from '../content/blogPosts'
import { PRODUCT_LPS } from '../content/productLPs'
import { Clock, User, ArrowLeft, ArrowRight } from 'lucide-react'

export default function BlogPost() {
  const { slug } = useParams()
  const p = BLOG_POSTS[slug]
  if (!p) return <Navigate to="/blog" replace />

  const date = new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  function resolveInternal(block) {
    // Blog internal links can point to other blog posts (by slug) OR product pages (by `to`)
    if (block.to) {
      const productSlug = block.to.replace('/product/', '')
      const prod = PRODUCT_LPS[productSlug]
      return { to: block.to, title: prod?.title || block.label }
    }
    if (block.slug && BLOG_POSTS[block.slug]) {
      return { to: `/blog/${block.slug}`, title: BLOG_POSTS[block.slug].title }
    }
    return null
  }

  return (
    <MarketingLayout>
      <SEO
        title={p.title}
        description={p.excerpt}
        canonical={`https://hireads.app/blog/${slug}`}
        type="article"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: p.title,
          description: p.excerpt,
          datePublished: p.date,
          dateModified: p.date,
          author: { '@type': 'Person', name: p.author },
          publisher: { '@type': 'Organization', name: 'HireAds', logo: { '@type': 'ImageObject', url: 'https://hireads.app/favicon.svg' } },
          mainEntityOfPage: `https://hireads.app/blog/${slug}`,
        }}
      />

      <article className="max-w-3xl mx-auto px-6 pt-12 pb-20">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-theme-muted hover:text-theme-text2 mb-8">
          <ArrowLeft size={14} /> All articles
        </Link>

        <div className="flex flex-wrap gap-2 mb-4">
          {p.tags?.map(t => (
            <span key={t} className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-purple-600/15 text-purple-300 border border-purple-500/20">{t}</span>
          ))}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{p.title}</h1>
        <p className="text-lg text-theme-text2 mb-6 leading-relaxed">{p.excerpt}</p>
        <div className="flex items-center gap-4 text-sm text-theme-muted pb-8 mb-10 border-b border-theme-bdr">
          <span className="flex items-center gap-1.5"><User size={13} /> {p.author}</span>
          <span className="flex items-center gap-1.5"><Clock size={13} /> {p.readingMinutes} min read</span>
          <span>{date}</span>
        </div>

        <ArticleBody blocks={p.body} resolveInternal={resolveInternal} />

        {/* Related */}
        {p.related?.length > 0 && (
          <section className="mt-14 pt-10 border-t border-theme-bdr">
            <h2 className="text-xl font-bold mb-5">Keep reading</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {p.related.map(r => {
                const rp = BLOG_POSTS[r]
                if (!rp) return null
                return (
                  <Link key={r} to={`/blog/${r}`}
                    className="block p-4 rounded-xl bg-theme-card border border-theme-bdr hover:border-purple-500/40 transition-colors group">
                    <p className="font-semibold mb-1 group-hover:text-purple-400 transition-colors">{rp.title}</p>
                    <p className="text-xs text-theme-text2 leading-relaxed">{rp.excerpt}</p>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="mt-14 p-8 rounded-2xl bg-gradient-to-br from-purple-600/10 to-indigo-600/10 border border-purple-500/20 text-center">
          <h3 className="text-xl font-bold mb-2">Ready to run recruitment ads without the hassle?</h3>
          <p className="text-sm text-theme-text2 mb-5">Pre-verified ad accounts. Free ATS. Anti-ban AI copy. From €23 minimum spend.</p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2">
            Start free <ArrowRight size={14} />
          </Link>
        </section>
      </article>
    </MarketingLayout>
  )
}
