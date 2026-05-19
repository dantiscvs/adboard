import { Link, Navigate, useParams } from 'react-router-dom'
import MarketingLayout from '../components/MarketingLayout'
import SEO from '../components/SEO'
import { Shield, FileText } from 'lucide-react'

// Single file hosts both Terms and Privacy. Routed via /legal/:kind.
const LAST_UPDATED = '2026-03-15'

const TERMS_SECTIONS = [
  {
    h: '1. Who we are',
    p: 'HireAds (“we”, “us”, “our”) is a recruitment-advertising platform operated by HireAds sp. z o.o., registered in Poland (KRS: 0000000000, NIP: 0000000000, REGON: 000000000), with registered office at ul. Marszałkowska 1, 00-000 Warsaw. You can reach us at legal@hireads.app.',
  },
  {
    h: '2. Your account',
    p: 'To use HireAds you must be 18+ and represent a legally registered business. You are responsible for all activity under your account, for keeping login credentials secret, and for the accuracy of information you submit. We can suspend accounts that violate these Terms or applicable law.',
  },
  {
    h: '3. The service',
    p: 'HireAds lets you (a) create job-ad creatives, (b) launch paid advertising campaigns on third-party platforms (Meta, TikTok, LinkedIn, YouTube, Snapchat) through HireAds-operated ad accounts, (c) collect candidate leads and manage them in our ATS. The ATS is free while you maintain at least one active advertising campaign; if no campaign has been active for 30 consecutive days, we may switch the ATS to read-only until a new campaign launches.',
  },
  {
    h: '4. Fees',
    p: 'You pay (a) the ad spend you choose (minimum 100 PLN per campaign), and (b) a 7% management fee on that ad spend. Invoices are issued in PLN, VAT-free under the EU reverse-charge mechanism for B2B customers outside Poland. Payment is processed by Stripe. Ad spend is non-refundable once submitted to a third-party platform. Management fees are refundable pro-rata if we fail to deliver the campaign.',
  },
  {
    h: '5. Content you upload',
    p: 'You keep all rights to the content you upload (logos, photos, ad copy, job descriptions). By uploading, you grant us a worldwide, royalty-free licence to host, process, and transmit the content for the purpose of delivering the service — including to third-party ad platforms. You warrant that your content does not infringe any intellectual-property right and that you have the legal basis to advertise the role.',
  },
  {
    h: '6. Anti-discrimination commitment',
    p: 'Job advertisements distributed through HireAds must not discriminate on the basis of race, colour, national or ethnic origin, gender, sexual orientation, gender identity, age, religion, disability, marital or family status, or any other category protected by applicable employment law. Our AI anti-ban scanner assists with detection but does not replace your legal obligations. We reserve the right to refuse or pause any ad that violates this clause.',
  },
  {
    h: '7. Ad platform policies',
    p: 'Third-party platforms have their own policies and may reject, restrict, or remove ads for any reason at their sole discretion. Examples include Meta Commerce Policies, TikTok Advertising Policies, LinkedIn Professional Community Policies. We do our best to flag likely violations before submission; we are not liable for platform rejections or associated downtime.',
  },
  {
    h: '8. Data protection',
    p: 'We act as a data processor for candidate data you collect via Lead Ads and the ATS. A Data Processing Agreement forms part of these Terms (see our Privacy Policy). You are the data controller; you decide retention, purpose, and lawful basis. EU candidates retain GDPR rights (access, rectification, erasure, portability, objection, restriction).',
  },
  {
    h: '9. Acceptable use',
    p: 'You will not: (a) advertise roles that are illegal in the target jurisdiction; (b) misrepresent the employer, salary, location, or job type; (c) collect candidate data for purposes other than the advertised role without separate consent; (d) attempt to reverse-engineer, scrape, or overload the service; (e) re-sell HireAds access without written permission.',
  },
  {
    h: '10. Warranties and liability',
    p: 'The service is provided “as is” with no warranty of specific results. We do not guarantee number of applications, cost-per-lead, or campaign outcomes. Our total liability in any 12-month period is capped at the management fees you paid in the preceding 12 months. Nothing in these Terms limits liability for death, personal injury, fraud, or anything that cannot lawfully be limited.',
  },
  {
    h: '11. Termination',
    p: 'You may close your account at any time from the Account page. We may terminate with 30 days notice for convenience, or immediately for breach. On termination, you can export all your ATS data for 90 days as CSV + JSON; after that we delete it, except where law requires retention.',
  },
  {
    h: '12. Changes',
    p: 'We may update these Terms; material changes will be notified by email at least 14 days before taking effect. Continued use after the effective date constitutes acceptance. The current version is always at /legal/terms.',
  },
  {
    h: '13. Governing law',
    p: 'These Terms are governed by the laws of Poland. Disputes shall be resolved by the courts competent for the registered office of HireAds sp. z o.o., except where mandatory consumer-protection law grants a different venue. Nothing prevents good-faith negotiation or EU online dispute resolution via the ODR platform at ec.europa.eu/consumers/odr.',
  },
]

const PRIVACY_SECTIONS = [
  {
    h: '1. Who is the controller',
    p: 'HireAds sp. z o.o., ul. Marszałkowska 1, 00-000 Warsaw, Poland, is the data controller of information you submit while using the HireAds website and account system. For candidate data collected through Lead Ads and the ATS, you (the employer) are the controller and we act as processor under the DPA included in our Terms.',
  },
  {
    h: '2. What we collect',
    p: 'Account data: name, work email, company name, billing details. Usage data: IP, device, pages visited, features used, timestamps. Ad-campaign data: the creatives, targeting, budgets and metrics associated with your account. Communications: support tickets, emails you send us.',
  },
  {
    h: '3. Why we collect it',
    p: 'To deliver the service (contract performance, GDPR Art. 6(1)(b)), to comply with tax and anti-fraud law (Art. 6(1)(c)), to improve the product and security (legitimate interests, Art. 6(1)(f)), and — where applicable — to send product updates you opted into (consent, Art. 6(1)(a)).',
  },
  {
    h: '4. Who we share it with',
    p: 'Sub-processors include: Stripe (payments), Postmark (transactional email), Twilio (SMS), Amazon Web Services (eu-central-1 hosting), Vercel (static asset delivery), Sentry (error tracking), and the advertising platforms you target (Meta, TikTok, LinkedIn, YouTube, Snapchat). A full sub-processor list with DPAs is available on request.',
  },
  {
    h: '5. Where we store it',
    p: 'Primary storage is in the European Union (AWS eu-central-1, Frankfurt). Backups are encrypted and stored in the same region. Sub-processors outside the EEA rely on Standard Contractual Clauses plus supplementary measures per Schrems II.',
  },
  {
    h: '6. How long we keep it',
    p: 'Account data is retained for the lifetime of the account plus 6 years for tax/audit (Polish Accountancy Act). Usage logs are retained for 12 months for security. Candidate data retention is set by you in the ATS — default is 24 months with an automatic reminder at month 23.',
  },
  {
    h: '7. Your rights',
    p: 'Under GDPR you have rights to access, rectification, erasure, portability, restriction, and objection. To exercise them, email privacy@hireads.app. We respond within 30 days. You can also complain to the Polish data-protection authority (UODO) or your local EU DPA.',
  },
  {
    h: '8. Cookies',
    p: 'We use strictly-necessary cookies (login session, CSRF) by default. Analytics and product-usage cookies are opt-in via the consent banner. We do not use advertising cookies on our own marketing site.',
  },
  {
    h: '9. Security',
    p: 'Passwords are hashed with bcrypt cost 12. Data in transit uses TLS 1.3. Data at rest is encrypted with AES-256 via AWS KMS. We run quarterly penetration tests and an annual SOC 2 Type II audit (report available under NDA).',
  },
  {
    h: '10. Children',
    p: 'HireAds is for business use by people 18+. We do not knowingly collect data from children; if you believe a child submitted data, email privacy@hireads.app and we will delete it.',
  },
  {
    h: '11. Changes',
    p: 'We update this policy as the service evolves. Material changes are emailed at least 14 days in advance. The current version is always at /legal/privacy; older versions are kept on request.',
  },
]

export default function LegalPages() {
  const { kind } = useParams()
  if (kind !== 'terms' && kind !== 'privacy') return <Navigate to="/" replace />

  const isTerms = kind === 'terms'
  const sections = isTerms ? TERMS_SECTIONS : PRIVACY_SECTIONS
  const title = isTerms ? 'Terms of Service' : 'Privacy Policy'
  const icon = isTerms ? <FileText size={18} /> : <Shield size={18} />
  const description = isTerms
    ? 'The contract between you and HireAds — fees, data, platform rules, termination.'
    : 'How HireAds collects, uses, stores and protects personal data — GDPR-compliant.'

  return (
    <MarketingLayout>
      <SEO
        title={title}
        description={description}
        canonical={`https://hireads.app/legal/${kind}`}
      />
      <article className="max-w-3xl mx-auto px-6 pt-12 pb-20">
        <div className="flex items-center gap-2 text-sm text-purple-400 mb-3 font-semibold">
          {icon} Legal
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
        <p className="text-sm text-theme-muted mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="space-y-8">
          {sections.map(s => (
            <section key={s.h} id={s.h.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>
              <h2 className="text-xl font-bold mb-3 text-theme-text">{s.h}</h2>
              <p className="text-theme-text2 leading-relaxed">{s.p}</p>
            </section>
          ))}
        </div>

        <div className="mt-14 pt-10 border-t border-theme-bdr flex flex-wrap gap-4 text-sm">
          <Link to={isTerms ? '/legal/privacy' : '/legal/terms'} className="text-purple-400 hover:text-purple-300">
            {isTerms ? '→ Privacy Policy' : '→ Terms of Service'}
          </Link>
          <Link to="/contact" className="text-theme-text2 hover:text-theme-text">Contact us</Link>
        </div>
      </article>
    </MarketingLayout>
  )
}
