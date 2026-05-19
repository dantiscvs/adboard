// Product landing-page data. Each entry renders a rich marketing page at
// /product/:slug via src/pages/ProductLP.jsx. Keep copy concise and concrete.

export const PLATFORM_LOGOS = {
  facebook:  { name: 'Facebook',  color: '#1877F2' },
  instagram: { name: 'Instagram', color: '#E1306C' },
  tiktok:    { name: 'TikTok',    color: '#010101' },
  youtube:   { name: 'YouTube',   color: '#FF0000' },
  snapchat:  { name: 'Snapchat',  color: '#FFFC00' },
  linkedin:  { name: 'LinkedIn',  color: '#0A66C2' },
  threads:   { name: 'Threads',   color: '#000000' },
}

export const PRODUCT_LPS = {
  'job-ad-creator': {
    title: 'Job Ad Creator',
    tagline: 'Design recruitment ads that actually convert.',
    hero: 'Stop fighting Canva. HireAds gives you a purpose-built editor for job ads — with live multi-platform previews, smart templates localised into 50 languages, and a drag-and-drop canvas that renders pixel-perfect on Facebook 4:5, TikTok 9:16, LinkedIn 1.91:1 and everything in between.',
    bullets: [
      'Live preview on Facebook, Instagram, TikTok, YouTube, Snapchat, LinkedIn and Threads — what you see is exactly what candidates scroll past.',
      'Platform-aware font sizing: TikTok needs a chunkier hierarchy than an Instagram 4:5 feed. We adjust automatically so your ad never looks cramped.',
      'Drag-and-drop logos, photos and custom shapes around the canvas — Canva-level freedom, with a safety net that preserves the golden design rules.',
      '50-language template library: Polish, Ukrainian, Romanian, Portuguese, Bengali, Swahili… swap the whole ad copy with one dropdown.',
      '1080×1080 PNG export in one click, ready for any ad manager.',
    ],
    platforms: ['facebook', 'instagram', 'tiktok', 'linkedin', 'youtube', 'snapchat'],
    mockupComments: [
      { author: 'Maya R.', body: 'Hey @Norris this might be what you\'re looking for — they\'re hiring React devs 👀', likes: 12 },
      { author: 'Tomasz K.', body: 'Cleanest job ad I\'ve seen on my feed this month.', likes: 34 },
      { author: 'Priya S.', body: 'Just applied. The flow from ad → form took me 40 seconds.', likes: 8 },
    ],
    cta: { label: 'Build your first ad free', to: '/register' },
    related: ['ai-copy', 'lead-ads', 'campaigns'],
    faq: [
      { q: 'Does it really render like the live platform?', a: 'Yes. We mirror each platform\'s current chrome, aspect ratio, caption truncation and CTA placement. A Facebook preview shows 125 chars with a "see more" link; TikTok clamps at 100. You can also toggle the platform overlay off to screenshot just the creative.' },
      { q: 'Can I upload my own fonts?', a: 'Yes — upload a TTF/OTF or pick from 22 free Google Fonts. Custom fonts persist on your account and render correctly in exports.' },
      { q: 'What image sizes does it export?', a: '1080×1080 square, 1080×1350 portrait (IG/FB), 1080×1920 vertical (Stories/TikTok/Reels/Snap), 1200×628 landscape (LinkedIn), plus YouTube thumbnail ratios.' },
    ],
  },

  'ai-copy': {
    title: 'AI Copy + Anti-Ban Engine',
    tagline: 'Hooks that convert. Compliance that doesn\'t get you banned.',
    hero: 'Our AI writes primary text in the proven Hook → Stakes → Benefits → CTA structure, tuned per-platform (125 chars on Meta, 100 on TikTok, 80 on Snap). The anti-ban layer scans every draft against Meta / TikTok / LinkedIn ad policies AND local employment law — flagging discrimination on race, age, ethnicity, gender or religion before you ever upload.',
    bullets: [
      'Platform-specific copy: a Meta post reads differently from a TikTok caption. The AI knows.',
      'Anti-ban scanner catches the silent killers: "young team", "native English speaker", "digital native", "recent graduate only", "salesman wanted" — all flagged with safer rewrites.',
      'Employment-law compliance across EU, UK, US and APAC jurisdictions. We cite the specific article you\'d be violating.',
      'Tone controls: "Challenger", "Corporate", "Friendly", "Urgent" — pick the voice, keep the compliance.',
      'One-click regenerate and A/B variant spinner so you launch 3 hooks, not 1.',
    ],
    platforms: ['facebook', 'instagram', 'tiktok', 'linkedin'],
    mockupComments: [
      { author: 'HR Daria', body: 'The anti-ban caught "young dynamic team" before I submitted. Would\'ve been a €3,000 fine in Poland.', likes: 47 },
      { author: 'TalentOps', body: 'We went from 40% Meta rejections to 2% after switching our copy to HireAds.', likes: 92 },
    ],
    cta: { label: 'Generate compliant copy now', to: '/register' },
    related: ['job-ad-creator', 'campaigns', 'targeting'],
    faq: [
      { q: 'What specifically does "anti-ban" check?', a: 'Three layers. (1) Platform policy: Meta restricted content, TikTok community guidelines, LinkedIn professional community. (2) Employment law: protected-class language per jurisdiction (Title VII US, EU 2000/78/EC, UK Equality Act 2010, Polish Labour Code art. 11³ etc.). (3) Click-bait / misleading claims that tank Quality Score.' },
      { q: 'Will my account still get flagged sometimes?', a: 'Possible but rare. We reduce platform rejections by ~95% in our internal benchmark. The scanner also learns: if Meta rejects something we didn\'t catch, we update rules within 48h for every account.' },
      { q: 'Does it replace my ad agency\'s legal review?', a: 'No — treat it as a first-pass sanity check. For high-volume enterprise hiring, pair it with your employment counsel.' },
    ],
  },

  'lead-ads': {
    title: 'Lead Ads Flow',
    tagline: 'From scroll to interview in 4 steps — no career site required.',
    hero: 'Traditional recruitment funnels leak 70% of interested candidates at the "go to career site → scroll → fill 14-field form" step. HireAds eliminates the leak by running Lead Ads: the candidate taps Apply, their form auto-fills inside the platform, and we pipe the lead straight into our free ATS. Automated mail + SMS confirm they\'re on file within 60 seconds.',
    bullets: [
      'Lead Ads native to Meta, TikTok and LinkedIn — forms open inside the app, no landing page required.',
      'Auto-fill from the candidate\'s platform profile: name, email, phone, experience summary pulled in one tap.',
      'Instant email + SMS confirmation (via Twilio + Postmark under the hood) with a magic-link to upload CV.',
      'Lands in your free HireAds ATS as a new candidate card — status, source, ad creative, cost-per-lead all attached.',
      'Optional passthrough to your existing ATS (Workable, Greenhouse, Lever, Recruitee) via webhook.',
    ],
    platforms: ['facebook', 'instagram', 'tiktok', 'linkedin'],
    flowDiagram: [
      { step: '1', label: 'Scroll', detail: 'Candidate sees your ad while browsing Reels/FYP/LinkedIn feed' },
      { step: '2', label: 'Tap', detail: 'Platform-native form opens, auto-fills from their profile' },
      { step: '3', label: 'Confirm', detail: 'Auto email + SMS within 60 seconds, link to upload CV' },
      { step: '4', label: 'ATS', detail: 'Lead lands in HireAds ATS with full attribution — source, ad, cost' },
    ],
    mockupComments: [
      { author: 'Alex (DevOps)', body: 'Applied on LinkedIn, had an interview scheduled before I finished my coffee.', likes: 28 },
      { author: 'CV Builder', body: '@Anna look — this is that job I was telling you about.', likes: 9 },
    ],
    cta: { label: 'See how the flow works', to: '/register' },
    related: ['ats', 'ai-copy', 'job-ad-creator'],
    faq: [
      { q: 'What\'s the typical cost-per-lead?', a: 'Depends on role and geo, but our benchmark is €3–12 for tech roles in EU, €1–4 for warehouse/retail, €15–40 for senior executives. You set the budget; we optimise.' },
      { q: 'GDPR?', a: 'Yes. Lead-Ad forms carry your privacy policy link. We process on your behalf under a DPA; candidates can request deletion directly via their ATS portal.' },
      { q: 'Can I still link to my own career page?', a: 'Yes — mix "Apply in-app" and "Apply on site" per-campaign. In-app converts ~3× higher on mobile.' },
    ],
  },

  'ats': {
    title: 'Free ATS',
    tagline: 'The applicant tracking system that\'s free when you\'re actually recruiting.',
    hero: 'Most ATSs charge €79–€299 per month regardless of whether you\'re hiring anyone. HireAds flips it: run an active ad campaign and the ATS is free. Pause campaigns, pause billing. Simple kanban pipeline, candidate notes, interview scheduling, bulk email, compliance-safe rejection templates. Built by recruiters tired of Workable\'s bloat.',
    bullets: [
      'Drag-and-drop kanban pipeline: New → Screen → Interview → Offer → Hired. Customize stages per role.',
      'Candidate cards: CV preview, contact, source (which ad / platform / creative), notes, scheduled interviews, email thread.',
      'Bulk actions: reject 40 candidates with a compliant template in 3 clicks (with mandatory feedback per GDPR art. 22).',
      'Interview scheduling via Google Calendar / Outlook two-way sync. Auto-send Zoom/Meet/Teams links.',
      'Team collaboration: assign recruiters, leave internal comments, @mention hiring managers.',
      'Free forever with an active campaign. If you pause all campaigns for 30 days, it switches to read-only (you never lose data).',
    ],
    platforms: [],
    competitors: [
      { name: 'Workable', price: '€169/mo', gripe: 'Pay even when you\'re not hiring' },
      { name: 'Greenhouse', price: '€6k+/yr', gripe: 'Priced for enterprises' },
      { name: 'Recruitee', price: '€199/mo', gripe: 'Feature-gated at the low tier' },
      { name: 'HireAds ATS', price: 'Free', gripe: 'While campaigns are live', highlight: true },
    ],
    mockupComments: [
      { author: 'HR Director', body: 'Moved 87 candidates out of Workable in a weekend. Zero downtime.', likes: 63 },
    ],
    cta: { label: 'Open the ATS', to: '/ats' },
    related: ['lead-ads', 'campaigns', 'job-ad-creator'],
    faq: [
      { q: 'Is there a candidate limit?', a: 'No. Unlimited candidates, unlimited jobs, unlimited team seats while a campaign is live.' },
      { q: 'Can I export my data if I leave?', a: 'Always. One click dumps all candidates, notes, emails and stage history as CSV + JSON.' },
      { q: 'Does it integrate with my calendar?', a: 'Google Calendar, Outlook 365, Fastmail/CalDAV. Two-way sync with availability-match.' },
    ],
  },

  'campaigns': {
    title: 'Multi-Platform Campaigns',
    tagline: 'Launch everywhere from one dashboard. We own the ad accounts.',
    hero: 'Setting up a Meta Business Manager, a TikTok Ads account, a LinkedIn Campaign Manager and getting each verified takes 3–8 weeks and passports. HireAds runs your ads from our pre-verified business accounts on every major platform — you just design, target, set budget and launch. Min. 100 PLN spend, 7% management fee, VAT-free B2B invoicing.',
    bullets: [
      'Pre-verified ad accounts on Meta, TikTok, LinkedIn, YouTube, Snapchat — no setup, no verification wait.',
      'Single dashboard: pause, adjust budget, see spend and leads across every platform in one view.',
      'Transparent pricing: your ad spend + 7% management fee. We invoice in PLN, VAT-free (B2B reverse-charge).',
      'Stripe-secured: Visa, MC, SEPA, BLIK. Pay-as-you-go, no retainer.',
      'Real-time lead analytics: cost-per-application, conversion rate, best-performing creative, platform comparison.',
    ],
    platforms: ['facebook', 'instagram', 'tiktok', 'linkedin', 'youtube', 'snapchat'],
    cta: { label: 'Launch your first campaign', to: '/campaigns' },
    related: ['targeting', 'ai-copy', 'lead-ads'],
    faq: [
      { q: 'Why 7%? I thought it was 2%.', a: 'Stripe + FX + processing costs were eating the old 2% to near-zero margin. 7% lets us invest in anti-ban R&D and keeps the ATS free.' },
      { q: 'Is there a minimum spend?', a: '100 PLN (~€23). Good for a 3–5 day micro-test on a single platform.' },
      { q: 'Can I use my own Meta Business Manager?', a: 'On Enterprise tier, yes. On self-serve we run from ours for speed.' },
    ],
  },

  'targeting': {
    title: 'Precision Targeting',
    tagline: 'Reach the 2% of people who actually fit the role.',
    hero: 'Blasting a Senior React role to 2 million people gets you 50 applications from the wrong 1.95 million. HireAds layers platform-native targeting (interests, job titles, seniority, skills, geo) with recruitment-specific filters (industry, current employer exclusion, commute radius, education tier, seniority level) across all platforms simultaneously.',
    bullets: [
      'Job-title targeting on LinkedIn + inferred job-title via interest clusters on Meta/TikTok.',
      'Skill-based keywords (React, Kubernetes, Revenue Ops, UX Research) synced across platforms.',
      'Commute-radius geofencing down to 5km precision, ideal for hybrid/on-site roles.',
      'Exclude current employees of competitors, or exclusively target them (ethical poach — your choice).',
      'Seniority bracket (Intern → C-Suite) mapped to platform-specific signals.',
    ],
    platforms: ['facebook', 'instagram', 'tiktok', 'linkedin', 'youtube', 'snapchat'],
    cta: { label: 'Try the targeting wizard', to: '/campaigns' },
    related: ['campaigns', 'ai-copy', 'lead-ads'],
    faq: [
      { q: 'What about younger demographics for warehouse / retail?', a: 'TikTok and Snapchat dominate under-25. Our targeting auto-shifts budget allocation by default; you can override.' },
      { q: 'How narrow can I go?', a: 'Technically we can target 500-person audiences. Practically, below ~50k you pay a premium and hit frequency caps fast. We\'ll warn you.' },
    ],
  },
}

export const PRODUCT_LP_SLUGS = Object.keys(PRODUCT_LPS)
