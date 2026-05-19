import { Link } from 'react-router-dom'
import MarketingLayout from '../components/MarketingLayout'
import SEO from '../components/SEO'
import { Target, Users, Sparkles, Building2 } from 'lucide-react'

const TEAM = [
  { name: 'Daniel T.', role: 'Founder & CEO', bio: '10+ years in performance marketing for tech scale-ups. Ex-Typeform, ex-Booksy growth.' },
  { name: 'Ana Kowalska', role: 'Head of Recruitment Science', bio: 'PhD in I/O Psychology. Previously designed hiring frameworks at SWPS University and Allegro.' },
  { name: 'Mark Levin', role: 'Head of Growth', bio: 'Built paid acquisition for two Series-A HR-tech startups to 7-figure ARR.' },
  { name: 'Sofia Ng', role: 'ATS Product Lead', bio: 'Ex-Workable engineering manager. Believes recruiters deserve better tools.' },
]

const VALUES = [
  { icon: <Target size={18} />, title: 'Outcomes over vanity', text: 'Impressions don&apos;t hire anyone. We obsess over cost-per-application and apply-to-interview rate.' },
  { icon: <Users size={18} />, title: 'Candidate respect', text: 'Every ad we ship is screened against employment law. Candidates deserve honest roles, not bait-and-switch.' },
  { icon: <Sparkles size={18} />, title: 'Speed of thought', text: 'From idea to launched campaign in 15 minutes. If you have to wait, we failed.' },
  { icon: <Building2 size={18} />, title: 'Recruiter-built', text: 'Every feature was asked for by a working recruiter. We ship what moves your shortlist.' },
]

export default function AboutPage() {
  return (
    <MarketingLayout>
      <SEO
        title="About"
        description="HireAds is a recruitment-advertising platform built by performance-marketers and I/O psychologists. We run ads on Meta, TikTok, LinkedIn, YouTube and Snap — with a free ATS."
        canonical="https://hireads.app/about"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'HireAds',
          url: 'https://hireads.app',
          logo: 'https://hireads.app/favicon.svg',
          foundingDate: '2024',
          address: { '@type': 'PostalAddress', addressCountry: 'PL', addressLocality: 'Warsaw' },
        }}
      />

      <section className="max-w-3xl mx-auto px-6 pt-16 pb-10">
        <p className="text-sm text-purple-400 font-semibold mb-3 uppercase tracking-wide">About HireAds</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Recruitment hasn&apos;t changed in 15 years. We&apos;re fixing that.</h1>
        <div className="space-y-5 text-lg text-theme-text2 leading-relaxed">
          <p>
            Job boards charge per post. ATSs charge per seat. Agencies charge 20% of salary. Meanwhile the candidates you actually want are scrolling Instagram, LinkedIn and TikTok — and your roles aren&apos;t there.
          </p>
          <p>
            HireAds puts them there. We run your job ads on every major social platform from pre-verified business accounts, pipe the leads into a free ATS, and layer on AI copy that won\'t get you banned for discriminatory language you didn\'t know was discriminatory.
          </p>
          <p>
            We&apos;re based in Warsaw, fully bootstrapped, and built by people who&apos;ve both hired and been hired. We don&apos;t take investor money because we don&apos;t want to be forced into pricing models that screw our users.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-bold mb-8">What we believe</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {VALUES.map(v => (
            <div key={v.title} className="p-5 rounded-xl bg-theme-card border border-theme-bdr">
              <div className="w-9 h-9 rounded-lg bg-purple-600/15 flex items-center justify-center text-purple-400 mb-3">
                {v.icon}
              </div>
              <p className="font-semibold mb-1.5">{v.title}</p>
              <p className="text-sm text-theme-text2 leading-relaxed">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-bold mb-8">The team</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {TEAM.map(m => (
            <div key={m.name} className="p-5 rounded-xl bg-theme-card border border-theme-bdr flex gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shrink-0 flex items-center justify-center text-white font-bold">
                {m.name.split(' ').map(x => x[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold">{m.name}</p>
                <p className="text-xs text-purple-400 mb-2">{m.role}</p>
                <p className="text-sm text-theme-text2 leading-relaxed">{m.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-14 text-center">
        <h2 className="text-2xl font-bold mb-3">Want to work with us?</h2>
        <p className="text-theme-text2 mb-5">We&apos;re always open to talking with recruiters, growth marketers, and candidates.</p>
        <Link to="/contact" className="btn-primary">Get in touch</Link>
      </section>
    </MarketingLayout>
  )
}
