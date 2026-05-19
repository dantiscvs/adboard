import { useParams, Link, Navigate } from 'react-router-dom'
import MarketingLayout from '../components/MarketingLayout'
import SEO from '../components/SEO'
import ArticleBody from '../components/ArticleBody'
import { KNOWLEDGE_ARTICLES, KNOWLEDGE_SECTIONS } from '../content/knowledgeArticles'
import { PRODUCT_LPS } from '../content/productLPs'
import { Clock, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react'

export default function KnowledgeArticle() {
  const { slug } = useParams()
  const a = KNOWLEDGE_ARTICLES[slug]
  if (!a) return <Navigate to="/knowledge" replace />

  const section = KNOWLEDGE_SECTIONS.find(s => s.id === a.section)
  const updated = a.updated ? new Date(a.updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

  function resolveInternal(block) {
    if (block.to) {
      const productSlug = block.to.replace('/product/', '')
      const prod = PRODUCT_LPS[productSlug]
      return { to: block.to, title: prod?.title || block.label }
    }
    if (block.slug && KNOWLEDGE_ARTICLES[block.slug]) {
      return { to: `/knowledge/${block.slug}`, title: KNOWLEDGE_ARTICLES[block.slug].title }
    }
    return null
  }

  return (
    <MarketingLayout>
      <SEO
        title={a.title}
        description={a.excerpt}
        canonical={`https://hireads.app/knowledge/${slug}`}
        type="article"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: a.title,
          description: a.excerpt,
          dateModified: a.updated,
          author: { '@type': 'Organization', name: 'HireAds' },
          proficiencyLevel: a.difficulty,
        }}
      />

      <article className="max-w-3xl mx-auto px-6 pt-12 pb-20">
        <nav className="text-xs text-theme-muted mb-8 flex items-center gap-2">
          <Link to="/knowledge" className="hover:text-theme-text2 inline-flex items-center gap-1"><BookOpen size={12} /> Knowledge</Link>
          <span>/</span>
          {section && (<><span className="text-theme-text2">{section.label}</span><span>/</span></>)}
          <span className="text-theme-text2 truncate">{a.title}</span>
        </nav>

        <div className="flex items-center gap-3 mb-4">
          <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${a.difficulty === 'beginner' ? 'bg-green-500/15 text-green-400 border border-green-500/20' : a.difficulty === 'advanced' ? 'bg-red-500/15 text-red-400 border border-red-500/20' : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'}`}>
            {a.difficulty || 'guide'}
          </span>
          <span className="text-xs text-theme-muted flex items-center gap-1"><Clock size={11} /> {a.readingMinutes} min</span>
          {updated && <span className="text-xs text-theme-muted">Updated {updated}</span>}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{a.title}</h1>
        <p className="text-lg text-theme-text2 mb-10 leading-relaxed pb-8 border-b border-theme-bdr">{a.excerpt}</p>

        <ArticleBody blocks={a.body} resolveInternal={resolveInternal} />

        {/* Related */}
        {a.related?.length > 0 && (
          <section className="mt-14 pt-10 border-t border-theme-bdr">
            <h2 className="text-xl font-bold mb-5">Related articles</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {a.related.map(r => {
                const ra = KNOWLEDGE_ARTICLES[r]
                if (!ra) return null
                return (
                  <Link key={r} to={`/knowledge/${r}`}
                    className="block p-4 rounded-xl bg-theme-card border border-theme-bdr hover:border-purple-500/40 transition-colors group">
                    <p className="font-semibold mb-1 group-hover:text-purple-400 transition-colors">{ra.title}</p>
                    <p className="text-xs text-theme-text2 leading-relaxed">{ra.excerpt}</p>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        <section className="mt-14 p-8 rounded-2xl bg-gradient-to-br from-purple-600/10 to-indigo-600/10 border border-purple-500/20 text-center">
          <h3 className="text-xl font-bold mb-2">Try HireAds free</h3>
          <p className="text-sm text-theme-text2 mb-5">Run your first recruitment campaign in minutes. Free ATS included.</p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2">
            Get started <ArrowRight size={14} />
          </Link>
        </section>
      </article>
    </MarketingLayout>
  )
}
