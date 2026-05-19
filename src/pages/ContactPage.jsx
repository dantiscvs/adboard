import { useState } from 'react'
import MarketingLayout from '../components/MarketingLayout'
import SEO from '../components/SEO'
import { Mail, MessageSquare, Building2, MapPin, Clock, Check } from 'lucide-react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', company: '', topic: 'sales', message: '' })

  function submit(e) {
    e.preventDefault()
    // Client-only prototype: store locally, show success state
    const tickets = JSON.parse(localStorage.getItem('hireads_contact_tickets') || '[]')
    tickets.push({ ...form, at: new Date().toISOString() })
    localStorage.setItem('hireads_contact_tickets', JSON.stringify(tickets))
    setSubmitted(true)
  }

  return (
    <MarketingLayout>
      <SEO
        title="Contact"
        description="Talk to HireAds — sales, support, partnerships, press. We reply within one business day."
        canonical="https://hireads.app/contact"
      />

      <section className="max-w-5xl mx-auto px-6 pt-14 pb-10">
        <p className="text-sm text-purple-400 font-semibold mb-3 uppercase tracking-wide">Contact</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Let&apos;s talk.</h1>
        <p className="text-lg text-theme-text2 max-w-2xl">
          Sales, support, partnerships, press — we read everything. Typical reply within one business day (Warsaw time).
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-6">
        {/* Details */}
        <div className="space-y-4">
          <InfoCard icon={<Mail size={16} />}       label="Email"      value="hello@hireads.app" />
          <InfoCard icon={<MessageSquare size={16} />} label="Sales"   value="sales@hireads.app" />
          <InfoCard icon={<Mail size={16} />}       label="Privacy"    value="privacy@hireads.app" />
          <InfoCard icon={<Building2 size={16} />}  label="Press"      value="press@hireads.app" />
          <InfoCard icon={<MapPin size={16} />}     label="Office"     value="ul. Marszałkowska 1, Warsaw, Poland" />
          <InfoCard icon={<Clock size={16} />}      label="Hours"      value="Mon–Fri, 09:00–18:00 CET" />
        </div>

        {/* Form */}
        <div className="md:col-span-2">
          {submitted ? (
            <div className="rounded-2xl bg-green-500/10 border border-green-500/30 p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Check size={24} className="text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Message received</h3>
              <p className="text-sm text-theme-text2">We&apos;ll reply to <span className="font-mono">{form.email}</span> within one business day.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="rounded-2xl bg-theme-card border border-theme-bdr p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Name" required>
                  <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </Field>
                <Field label="Work email" required>
                  <input type="email" className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </Field>
              </div>
              <Field label="Company">
                <input className="input" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
              </Field>
              <Field label="Topic" required>
                <select className="input" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}>
                  <option value="sales">Sales / Demo</option>
                  <option value="support">Support</option>
                  <option value="partnership">Partnership</option>
                  <option value="press">Press</option>
                  <option value="privacy">Privacy / GDPR</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="Message" required>
                <textarea rows={5} className="input resize-none" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
              </Field>
              <div className="pt-2">
                <button type="submit" className="btn-primary">Send message</button>
                <p className="text-xs text-theme-muted mt-3">
                  By submitting you agree to our <a href="/legal/privacy" className="underline hover:text-theme-text2">Privacy Policy</a>.
                </p>
              </div>
            </form>
          )}
        </div>
      </section>
    </MarketingLayout>
  )
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-xl bg-theme-card border border-theme-bdr p-4 flex gap-3 items-start">
      <div className="w-8 h-8 rounded-lg bg-purple-600/15 flex items-center justify-center text-purple-400 shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-theme-muted uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm text-theme-text break-all">{value}</p>
      </div>
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="label">{label}{required && ' *'}</label>
      {children}
    </div>
  )
}
