import { Link } from 'react-router-dom'
import MarketingLayout from '../components/MarketingLayout'
import SEO from '../components/SEO'
import { KNOWLEDGE_SECTIONS, KNOWLEDGE_ARTICLES } from '../content/knowledgeArticles'
import { BookOpen, Clock } from 'lucide-react'

export default function KnowledgeIndex() {
  return (
    <MarketingLayout>
      <SEO
        title="Knowledge Base — Performance Recruitment Handbook"
        description="The complete handbook for running performance-marketing recruitment campaigns in 2026. Platforms, budgets, targeting, tracking, objectives, formats."
        canonical="https://hireads.app/knowledge"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'HireAds Knowledge Base',
          description: 'Performance recruitment marketing handbook',
        }}
      />

      <section className="max-w-6xl mx-auto px-6 pt-14 pb-10">
        <p className="text-sm text-purple-400 font-semibold mb-3 uppercase tracking-wide flex items-center gap-2">
          <BookOpen size={14} /> Knowledge Base
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">The performance-recruitment handbook</h1>
        <p className="text-lg text-theme-text2 max-w-2xl">
          Everything you need to run paid ads for hiring across Meta, TikTok, LinkedIn, YouTube and Snapchat. Written for in-house recruiters and talent-acquisition specialists.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20 space-y-10">
        {KNOWLEDGE_SECTIONS.map(section => (
          <div key={section.id}>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="w-1 h-6 bg-purple-500 rounded-full" />
              {section.label}
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {section.slugs.map(slug => {
                const a = KNOWLEDGE_ARTICLES[slug]
                if (!a) return null
                return (
                  <Link
                    key={slug}
                    to={`/knowledge/${slug}`}
                    className="block p-5 rounded-xl bg-theme-card border border-theme-bdr hover:border-purple-500/40 transition-colors group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${difficultyColor(a.difficulty)}`}>
                        {a.difficulty || 'guide'}
                      </span>
                      <span className="text-[11px] text-theme-muted flex items-center gap-1">
                        <Clock size={10} /> {a.readingMinutes}m
                      </span>
                    </div>
                    <p className="font-semibold mb-1 group-hover:text-purple-400 transition-colors">{a.title}</p>
                    <p className="text-xs text-theme-text2 leading-relaxed">{a.excerpt}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </section>
    </MarketingLayout>
  )
}

function difficultyColor(d) {
  if (d === 'beginner') return 'bg-green-500/15 text-green-400 border border-green-500/20'
  if (d === 'advanced') return 'bg-red-500/15 text-red-400 border border-red-500/20'
  return 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
}
