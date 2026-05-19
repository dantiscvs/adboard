import { Link } from 'react-router-dom'
import {
  ArrowRight, Check, Sparkles, Image as ImageIcon, Globe, Target, Shield,
  MessageSquare, Users, Zap, BookOpen, Newspaper, Star, Play,
} from 'lucide-react'
import MarketingLayout from '../components/MarketingLayout'
import SEO from '../components/SEO'
import { LogoMark } from '../components/Logo'
import { PRODUCT_LPS, PRODUCT_LP_SLUGS, PLATFORM_LOGOS } from '../content/productLPs'
import { BLOG_POSTS, BLOG_POST_SLUGS } from '../content/blogPosts'
import { KNOWLEDGE_ARTICLES, KNOWLEDGE_SECTIONS } from '../content/knowledgeArticles'

const FEATURE_ICON = {
  'job-ad-creator': <ImageIcon size={20} />,
  'ai-copy':        <Sparkles size={20} />,
  'lead-ads':       <Zap size={20} />,
  'ats':            <Users size={20} />,
  'campaigns':      <Globe size={20} />,
  'targeting':      <Target size={20} />,
}

const TRUST_LOGOS = ['Meta', 'TikTok', 'LinkedIn', 'YouTube', 'Snapchat', 'Threads']

const TESTIMONIALS = [
  {
    quote: 'We replaced our €169/mo Workable plan and our agency. Hires are up, ad spend is down. The anti-ban scanner alone saved us a €3,000 PIP fine.',
    author: 'Daria Wiśniewska',
    role: 'Head of Talent, Allenort Tech',
    rating: 5,
  },
  {
    quote: 'Setup time from "decided to try it" to "first lead in the ATS" was 22 minutes. That includes me figuring out the targeting wizard.',
    author: 'Tomasz Kowalski',
    role: 'TA Lead, Booksy',
    rating: 5,
  },
  {
    quote: 'TikTok and Snap pulled in candidates we never reached on LinkedIn. Cost-per-application is a quarter of what it was on Indeed.',
    author: 'Priya Sharma',
    role: 'People Ops, Pitch',
    rating: 5,
  },
]

const STATS = [
  { value: '€3.40', label: 'Median CPA — warehouse roles' },
  { value: '95%',   label: 'Reduction in ad rejections' },
  { value: '22 min', label: 'From signup to first lead' },
  { value: '50+',   label: 'Languages supported' },
]

const FAQ = [
  {
    q: 'Do I need a Meta Business Manager or LinkedIn Recruiter account?',
    a: 'No. We run your ads from HireAds-verified business accounts on every platform — Meta, TikTok, LinkedIn, YouTube, Snapchat. Skip the 3–8 weeks of verification and passport uploads.',
  },
  {
    q: 'How is the ATS really free?',
    a: 'It\'s free while you have at least one active ad campaign. We make money on the 7% management fee, so when you\'re recruiting we both win. Pause campaigns and the ATS goes read-only — you never lose data.',
  },
  {
    q: 'What\'s the minimum spend?',
    a: '100 PLN (~€23). Enough for a 3–5 day micro-test on a single platform. Most accounts ramp to €30–100/day after seeing first results.',
  },
  {
    q: 'How does the anti-ban AI work?',
    a: 'Three layers — platform policy (Meta, TikTok, LinkedIn), employment law (EU 2000/78/EC, Polish Labour Code, US Title VII, UK Equality Act), and quality-score signals. It flags issues before submission and suggests safer rewrites.',
  },
  {
    q: 'Can I export my data?',
    a: 'Always. One click dumps all candidates, notes, emails, stage history, and ad creatives as CSV + JSON. We don\'t do hostage-tech.',
  },
  {
    q: 'Where are you based and how do you handle GDPR?',
    a: 'Warsaw, Poland. Data is stored in EU (AWS Frankfurt). We act as data processor for candidate data; you remain controller. Full DPA available — see /legal/privacy.',
  },
]

// Sort once per render
const recentPosts = [...BLOG_POST_SLUGS]
  .sort((a, b) => new Date(BLOG_POSTS[b].date) - new Date(BLOG_POSTS[a].date))
  .slice(0, 3)

const featuredKb = KNOWLEDGE_SECTIONS.slice(0, 4)
  .map(s => ({ section: s, slug: s.slugs[0], article: KNOWLEDGE_ARTICLES[s.slugs[0]] }))
  .filter(x => x.article)

export default function Landing() {
  return (
    <MarketingLayout>
      <SEO
        title="Job Ads that Actually Hire"
        description="Run recruitment ads on Meta, TikTok, LinkedIn, YouTube and Snap — plus a free ATS and AI copy that won't get banned. From 100 PLN minimum spend."
        canonical="https://hireads.app/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'HireAds',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          description: 'Performance recruitment ads on every major platform, with a free ATS and anti-ban AI copy.',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
          aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '47' },
        }}
      />

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* gradient backdrop */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-600/[0.07] via-transparent to-transparent" />
        <div
          className="absolute inset-0 -z-10 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(168,85,247,0.18), transparent 50%), radial-gradient(circle at 70% 30%, rgba(236,72,153,0.12), transparent 50%)',
          }}
        />

        <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-purple-600/10 border border-purple-500/20 rounded-full px-4 py-1.5 text-xs text-purple-300 mb-6">
            <Sparkles size={12} />
            Anti-ban AI copy · Free ATS · 100 PLN minimum spend
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold leading-[1.05] tracking-tight mb-6 max-w-4xl mx-auto">
            Job ads that actually <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400">hire</span>.
          </h1>
          <p className="text-lg text-theme-text2 max-w-2xl mx-auto mb-10 leading-relaxed">
            Run recruitment ads on Meta, TikTok, LinkedIn, YouTube and Snap from one dashboard.
            Pre-verified ad accounts, anti-ban AI copy, and a free ATS that pipes leads in within 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-3">
            <Link to="/register" className="btn-primary text-base px-6 py-3 inline-flex items-center gap-2 justify-center">
              Start free <ArrowRight size={16} />
            </Link>
            <Link to="/product" className="btn-secondary text-base px-6 py-3 inline-flex items-center gap-2 justify-center">
              <Play size={14} /> See how it works
            </Link>
          </div>
          <p className="text-xs text-theme-muted">No credit card · 4-minute setup · Cancel anytime</p>
        </div>

        {/* Hero mockup — abstract product card */}
        <div className="max-w-5xl mx-auto px-6 pb-20">
          <HeroMockup />
        </div>
      </section>

      {/* TRUST STRIP — platform logos */}
      <section className="border-y border-theme-bdr bg-theme-surface">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          <p className="text-xs uppercase tracking-widest text-theme-muted">Launches on</p>
          {TRUST_LOGOS.map(name => (
            <span key={name} className="text-sm font-semibold text-theme-text2">{name}</span>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="text-center p-5 rounded-xl bg-theme-card border border-theme-bdr">
              <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">{s.value}</p>
              <p className="text-xs text-theme-text2 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section id="product" className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-purple-400 font-semibold mb-3">Product</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Six tools. One platform. Zero spreadsheets.</h2>
          <p className="text-theme-text2 max-w-2xl mx-auto">
            Replace Workable, your media agency, and three browser tabs of ad managers with HireAds.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRODUCT_LP_SLUGS.map(slug => {
            const p = PRODUCT_LPS[slug]
            return (
              <Link
                key={slug}
                to={`/product/${slug}`}
                className="group p-6 rounded-2xl bg-theme-card border border-theme-bdr hover:border-purple-500/40 transition-all hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20 text-purple-400 flex items-center justify-center mb-4">
                  {FEATURE_ICON[slug]}
                </div>
                <h3 className="font-bold text-lg mb-1.5 group-hover:text-purple-400 transition-colors">{p.title}</h3>
                <p className="text-sm text-theme-text2 leading-relaxed mb-3">{p.tagline}</p>
                <span className="text-xs text-purple-400 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Read more <ArrowRight size={12} />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-theme-surface border-y border-theme-bdr">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-purple-400 font-semibold mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">From scroll to interview in 4 steps</h2>
            <p className="text-theme-text2 max-w-2xl mx-auto">No ad-account verification. No career-site funnel. No 14-field forms.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-5 relative">
            {[
              { n: '01', t: 'Design the ad', d: 'AI writes platform-aware copy. Drag-drop editor renders pixel-perfect on every aspect ratio.', to: '/product/job-ad-creator' },
              { n: '02', t: 'Set targeting', d: 'Job titles, skills, geo, seniority. Layered across Meta, TikTok and LinkedIn from one wizard.', to: '/product/targeting' },
              { n: '03', t: 'Launch instantly', d: 'Pre-verified business accounts. 100 PLN minimum. Stripe-secured. We invoice VAT-free.', to: '/product/campaigns' },
              { n: '04', t: 'Hire from the ATS', d: 'Leads land in 60 seconds with auto email + SMS. Drag through pipeline to offer.', to: '/product/ats' },
            ].map((s, i) => (
              <Link key={s.n} to={s.to} className="group relative p-5 rounded-xl bg-theme-card border border-theme-bdr hover:border-purple-500/40 transition-colors">
                <div className="text-3xl font-black text-purple-600/20 mb-2">{s.n}</div>
                <p className="font-semibold mb-1.5 group-hover:text-purple-400 transition-colors">{s.t}</p>
                <p className="text-xs text-theme-text2 leading-relaxed">{s.d}</p>
                {i < 3 && (
                  <ArrowRight size={16} className="hidden md:block absolute top-1/2 -right-3 text-purple-400/40 group-hover:text-purple-400 transition-colors" />
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI COPY + ANTI-BAN — feature deep-dive */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-purple-400 font-semibold mb-3">AI Copy + Anti-ban</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Hooks that convert. Compliance that doesn&apos;t get you banned.</h2>
            <p className="text-theme-text2 mb-6 leading-relaxed">
              Every draft scans against Meta / TikTok / LinkedIn policy and employment law in EU, UK, US and APAC.
              &ldquo;Young dynamic team&rdquo;, &ldquo;digital native&rdquo;, &ldquo;rockstar&rdquo; — all flagged with safer rewrites before you ever upload.
            </p>
            <ul className="space-y-3 mb-7">
              {[
                'Platform-specific copy (125 chars Meta, 100 TikTok, 80 Snap)',
                'Cites the exact article you\'d be violating',
                'A/B variant spinner — launch 3 hooks, not 1',
                'Tone controls: Challenger, Corporate, Friendly, Urgent',
              ].map(b => (
                <li key={b} className="flex gap-2.5 text-sm text-theme-text2">
                  <Check size={16} className="text-green-400 shrink-0 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>
            <Link to="/product/ai-copy" className="btn-primary inline-flex items-center gap-2">
              See the anti-ban engine <ArrowRight size={14} />
            </Link>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-theme-card to-theme-elevated border border-theme-bdr p-6">
            <CopyMockup />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-theme-surface border-y border-theme-bdr">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-widest text-purple-400 font-semibold mb-3">Loved by recruiters</p>
            <h2 className="text-3xl md:text-4xl font-bold">Real teams. Real hires.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(t => (
              <div key={t.author} className="p-6 rounded-2xl bg-theme-card border border-theme-bdr">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400" fill="currentColor" />
                  ))}
                </div>
                <p className="text-sm text-theme-text leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-theme-bdr">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                    {t.author.split(' ').map(x => x[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.author}</p>
                    <p className="text-xs text-theme-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-purple-400 font-semibold mb-3">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Free until you hire. Honest fees when you do.</h2>
          <p className="text-theme-text2">No seats. No setup. No retainer. No surprise upcharges.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {/* Free */}
          <div className="p-7 rounded-2xl bg-theme-card border border-theme-bdr">
            <span className="inline-block badge bg-theme-elevated text-theme-text2 border border-theme-bdr2 mb-3">Free</span>
            <p className="text-4xl font-bold mb-1">€0</p>
            <p className="text-theme-muted text-sm mb-6">Forever. No card needed.</p>
            <ul className="space-y-2.5 mb-7">
              {[
                'Unlimited job ad creation',
                'AI copy with anti-ban scanner',
                'All 5 templates · 50 languages',
                'Platform previews on 7 networks',
                'PNG / JSON export',
                'Free ATS during active campaigns',
              ].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-theme-text2">
                  <Check size={15} className="text-green-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/register" className="btn-secondary w-full block text-center">Start free</Link>
          </div>
          {/* Pro */}
          <div className="p-7 rounded-2xl border-2 border-purple-500/40 bg-gradient-to-b from-purple-950/30 to-theme-card relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">Most popular</div>
            <span className="inline-block badge bg-purple-600/20 text-purple-300 border border-purple-500/30 mb-3">Pro Campaign</span>
            <p className="text-4xl font-bold mb-1">100 PLN<span className="text-lg font-normal text-theme-text2"> min spend</span></p>
            <p className="text-theme-muted text-sm mb-6">+ 7% management fee · VAT-free invoicing</p>
            <ul className="space-y-2.5 mb-7">
              {[
                'Everything in Free',
                'Multi-platform campaigns',
                'Lead Ads with auto mail + SMS',
                'Pre-verified ad accounts',
                'Stripe (Visa, MC, SEPA, BLIK)',
                'Real-time analytics & attribution',
              ].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-theme-text2">
                  <Check size={15} className="text-purple-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/register" className="btn-primary w-full block text-center">Launch a campaign</Link>
          </div>
        </div>
      </section>

      {/* RESOURCES — blog + KB */}
      <section className="bg-theme-surface border-y border-theme-bdr">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Blog */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-purple-400 font-semibold mb-2 flex items-center gap-1.5"><Newspaper size={12} /> Blog</p>
                  <h2 className="text-2xl font-bold">Latest from the team</h2>
                </div>
                <Link to="/blog" className="text-sm text-theme-text2 hover:text-purple-400">All articles →</Link>
              </div>
              <div className="space-y-3">
                {recentPosts.map(slug => {
                  const p = BLOG_POSTS[slug]
                  return (
                    <Link key={slug} to={`/blog/${slug}`} className="block p-4 rounded-xl bg-theme-card border border-theme-bdr hover:border-purple-500/40 transition-colors group">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {p.tags?.slice(0, 2).map(t => (
                          <span key={t} className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-purple-600/15 text-purple-300 border border-purple-500/20">{t}</span>
                        ))}
                      </div>
                      <p className="font-semibold text-sm mb-1 group-hover:text-purple-400 transition-colors line-clamp-2">{p.title}</p>
                      <p className="text-xs text-theme-text2 line-clamp-2 leading-relaxed">{p.excerpt}</p>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Knowledge */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-purple-400 font-semibold mb-2 flex items-center gap-1.5"><BookOpen size={12} /> Knowledge Base</p>
                  <h2 className="text-2xl font-bold">The recruitment-ads handbook</h2>
                </div>
                <Link to="/knowledge" className="text-sm text-theme-text2 hover:text-purple-400">All sections →</Link>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {featuredKb.map(({ section, slug, article }) => (
                  <Link key={slug} to={`/knowledge/${slug}`} className="block p-4 rounded-xl bg-theme-card border border-theme-bdr hover:border-purple-500/40 transition-colors group">
                    <p className="text-[10px] uppercase tracking-wide text-theme-muted mb-1">{section.label}</p>
                    <p className="font-semibold text-sm mb-1 group-hover:text-purple-400 transition-colors line-clamp-1">{article.title}</p>
                    <p className="text-xs text-theme-text2 line-clamp-2 leading-relaxed">{article.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-purple-400 font-semibold mb-3">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-bold">Quick answers</h2>
        </div>
        <div className="space-y-3">
          {FAQ.map((f, i) => (
            <details key={i} className="group rounded-xl bg-theme-card border border-theme-bdr p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="cursor-pointer flex items-center justify-between font-semibold text-theme-text">
                {f.q}
                <span className="text-theme-muted group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-3 text-sm text-theme-text2 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="text-center text-sm text-theme-text2 mt-8">
          Still have questions? <Link to="/contact" className="text-purple-400 hover:text-purple-300">Get in touch →</Link>
        </p>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-br from-purple-600/20 via-pink-600/10 to-indigo-600/20 border border-purple-500/30 p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-20">
            <LogoMark size={200} />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 relative">Ready to stop losing candidates?</h2>
          <p className="text-theme-text2 mb-8 max-w-xl mx-auto relative">
            Free to start. No credit card. 22 minutes from signup to your first lead in the ATS.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center relative">
            <Link to="/register" className="btn-primary text-base px-7 py-3 inline-flex items-center gap-2 justify-center">
              Start free <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="btn-secondary text-base px-7 py-3 inline-flex items-center gap-2 justify-center">
              <MessageSquare size={14} /> Talk to sales
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}

/* ─── Visual mockups (no images, just CSS) ─────────────────────────────── */

function HeroMockup() {
  return (
    <div className="rounded-2xl border border-theme-bdr bg-gradient-to-br from-theme-card to-theme-elevated overflow-hidden shadow-2xl shadow-purple-500/10">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-theme-bdr bg-theme-surface/50">
        <span className="w-3 h-3 rounded-full bg-red-400/60" />
        <span className="w-3 h-3 rounded-full bg-amber-400/60" />
        <span className="w-3 h-3 rounded-full bg-green-400/60" />
        <span className="ml-3 text-xs text-theme-muted font-mono">app.hireads.app/ads</span>
      </div>
      <div className="grid md:grid-cols-2 gap-0">
        {/* Editor side */}
        <div className="p-6 border-r border-theme-bdr bg-theme-surface/30">
          <p className="text-[10px] uppercase tracking-wide text-theme-muted mb-3">Editor</p>
          <div className="space-y-2.5">
            <FieldMock label="Job title" value="Senior React Developer" />
            <FieldMock label="Company"   value="Allenort Tech" />
            <FieldMock label="Location"  value="Warsaw · Hybrid" />
            <div>
              <p className="text-[10px] uppercase tracking-wide text-theme-muted mb-1.5">AI primary text</p>
              <div className="rounded-lg bg-theme-bg border border-theme-bdr p-3 text-xs text-theme-text2 leading-relaxed">
                Ready to ship at scale? 🚀<br/>
                We&apos;re hiring a Senior React dev in Warsaw.<br/>
                Hybrid · €8–14k · Tap Apply, we&apos;ll talk.
              </div>
            </div>
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] text-green-400 bg-green-500/10 border border-green-500/30 rounded-full px-2 py-1">
            <Check size={10} /> Anti-ban: clear
          </div>
        </div>
        {/* Preview side */}
        <div className="p-6">
          <p className="text-[10px] uppercase tracking-wide text-theme-muted mb-3">Live previews</p>
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(PLATFORM_LOGOS).slice(0, 6).map(p => (
              <div key={p} className="aspect-[4/5] rounded-lg border border-theme-bdr bg-theme-bg overflow-hidden flex flex-col">
                <div className="h-1.5" style={{ background: PLATFORM_LOGOS[p].color }} />
                <div className="flex-1 p-1.5 flex flex-col justify-between">
                  <p className="text-[7px] text-theme-muted">{PLATFORM_LOGOS[p].name}</p>
                  <div className="space-y-0.5">
                    <div className="h-1 rounded-full bg-purple-500/40" style={{ width: '70%' }} />
                    <div className="h-1 rounded-full bg-theme-bdr2" style={{ width: '50%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function FieldMock({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-theme-muted mb-1">{label}</p>
      <div className="rounded-lg bg-theme-bg border border-theme-bdr px-3 py-2 text-xs text-theme-text">{value}</div>
    </div>
  )
}

function CopyMockup() {
  return (
    <div className="space-y-3 font-mono text-xs">
      <p className="text-theme-muted text-[10px] uppercase tracking-wider mb-2">Draft scan</p>
      <Flag kind="warn" text='"Young dynamic team"' detail="Age discrimination · EU 2000/78/EC · suggest: 'collaborative team'" />
      <Flag kind="warn" text='"Digital native required"' detail="Age-coded · UK Equality Act 2010 · suggest: 'comfortable with modern tools'" />
      <Flag kind="info" text='"Rockstar developer"' detail="Gender-coded · Meta policy · suggest: 'experienced developer'" />
      <Flag kind="ok" text="All other lines clear" detail="Ready to publish · 124/125 chars on Meta" />
    </div>
  )
}

function Flag({ kind, text, detail }) {
  const config = {
    warn: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', icon: '!' },
    info: { color: 'text-blue-400',  bg: 'bg-blue-500/10 border-blue-500/30',   icon: 'i' },
    ok:   { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', icon: '✓' },
  }[kind]
  return (
    <div className={`rounded-lg border p-3 ${config.bg}`}>
      <div className="flex items-start gap-2">
        <span className={`w-4 h-4 rounded-full ${config.color} bg-black/20 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5`}>
          {config.icon}
        </span>
        <div className="flex-1">
          <p className={`${config.color} font-semibold text-[11px] mb-0.5`}>{text}</p>
          <p className="text-theme-text2 text-[10px] leading-relaxed font-sans">{detail}</p>
        </div>
      </div>
    </div>
  )
}
