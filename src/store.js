import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { track } from './analytics'

const ADMIN_EMAIL = 'dantiscvs@gmail.com'
function withAdmin(user) {
  if (!user) return user
  return user.email === ADMIN_EMAIL ? { ...user, isAdmin: true } : user
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      register: ({ name, email, password }) => {
        const users = JSON.parse(localStorage.getItem('adboard_users') || '[]')
        if (users.find(u => u.email === email)) throw new Error('Email already registered')
        const newUser = withAdmin({
          id: crypto.randomUUID(),
          name,
          email,
          password,
          plan: 'free',
          createdAt: new Date().toISOString(),
        })
        localStorage.setItem('adboard_users', JSON.stringify([...users, newUser]))
        set({ user: newUser })
        track('register', { email })
        return newUser
      },
      login: (email, password) => {
        const users = JSON.parse(localStorage.getItem('adboard_users') || '[]')
        const found = users.find(u => u.email === email && u.password === password)
        if (!found) throw new Error('Invalid email or password')
        const user = withAdmin(found)
        // Persist isAdmin flag back to user list
        if (user.isAdmin && !found.isAdmin) {
          const updated = users.map(u => u.email === email ? user : u)
          localStorage.setItem('adboard_users', JSON.stringify(updated))
        }
        set({ user })
        track('login', { email })
        return user
      },
      logout: () => set({ user: null }),
      upgradePlan: () =>
        set(state => ({
          user: state.user ? { ...state.user, plan: 'paid' } : null,
        })),
    }),
    { name: 'adboard_auth' }
  )
)

// ─── Theme ───────────────────────────────────────────────────────────────────
export const useThemeStore = create(
  persist(
    (set) => ({
      dark: true,
      toggle: () => set(state => ({ dark: !state.dark })),
    }),
    { name: 'hireads_theme' }
  )
)

// ─── Ads ─────────────────────────────────────────────────────────────────────
export const useAdStore = create(
  persist(
    (set) => ({
      ads: [],
      addAd: (ad) =>
        set(state => ({
          ads: [
            ...state.ads,
            {
              ...ad,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),
      updateAd: (id, patch) =>
        set(state => ({
          ads: state.ads.map(a =>
            a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a
          ),
        })),
      deleteAd: (id) => set(state => ({ ads: state.ads.filter(a => a.id !== id) })),
      importAd: (payload) => {
        if (!payload?.ad) throw new Error('Invalid ad JSON — missing "ad" field')
        const ad = {
          ...payload.ad,
          id: crypto.randomUUID(),
          importedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set(state => ({ ads: [...state.ads, ad] }))
        return ad
      },
    }),
    { name: 'adboard_ads' }
  )
)

// ─── Campaigns ───────────────────────────────────────────────────────────────
export const useCampaignStore = create(
  persist(
    (set) => ({
      campaigns: [],
      addCampaign: (campaign) =>
        set(state => ({
          campaigns: [
            ...state.campaigns,
            {
              ...campaign,
              id: crypto.randomUUID(),
              status: 'pending_payment',
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      updateCampaign: (id, patch) =>
        set(state => ({
          campaigns: state.campaigns.map(c =>
            c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c
          ),
        })),
      deleteCampaign: (id) =>
        set(state => ({ campaigns: state.campaigns.filter(c => c.id !== id) })),
    }),
    { name: 'hireads_campaigns' }
  )
)

// ─── ATS (Applicant Tracking) ────────────────────────────────────────────────
// Free while there's an active campaign. Kanban pipeline with candidate cards.
export const ATS_DEFAULT_STAGES = [
  { id: 'new',       label: 'New',       color: '#64748b' },
  { id: 'screen',    label: 'Screen',    color: '#0ea5e9' },
  { id: 'interview', label: 'Interview', color: '#8b5cf6' },
  { id: 'offer',     label: 'Offer',     color: '#f59e0b' },
  { id: 'hired',     label: 'Hired',     color: '#10b981' },
  { id: 'rejected',  label: 'Rejected',  color: '#ef4444' },
]

export const useAtsStore = create(
  persist(
    (set, get) => ({
      candidates: [],
      stages: ATS_DEFAULT_STAGES,

      addCandidate: (c) => set(state => ({
        candidates: [
          ...state.candidates,
          {
            id: crypto.randomUUID(),
            name: c.name || 'Unnamed',
            email: c.email || '',
            phone: c.phone || '',
            role: c.role || '',
            source: c.source || 'manual',
            platform: c.platform || null,
            adId: c.adId || null,
            campaignId: c.campaignId || null,
            stage: c.stage || 'new',
            rating: c.rating || 0,
            cvUrl: c.cvUrl || null,
            notes: c.notes || [],
            events: [{ type: 'created', at: new Date().toISOString() }],
            createdAt: new Date().toISOString(),
          },
        ],
      })),

      updateCandidate: (id, patch) => set(state => ({
        candidates: state.candidates.map(c =>
          c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c
        ),
      })),

      moveCandidate: (id, newStage) => set(state => ({
        candidates: state.candidates.map(c => {
          if (c.id !== id) return c
          return {
            ...c,
            stage: newStage,
            events: [...(c.events || []), { type: 'stage_change', from: c.stage, to: newStage, at: new Date().toISOString() }],
          }
        }),
      })),

      addNote: (id, text) => set(state => ({
        candidates: state.candidates.map(c =>
          c.id === id
            ? { ...c, notes: [...(c.notes || []), { id: crypto.randomUUID(), text, at: new Date().toISOString() }] }
            : c
        ),
      })),

      deleteCandidate: (id) => set(state => ({
        candidates: state.candidates.filter(c => c.id !== id),
      })),

      seedDemoData: () => {
        if (get().candidates.length > 0) return
        const demo = [
          { name: 'Maya Rodriguez', email: 'maya@example.com', phone: '+48 500 100 200', role: 'Senior React Developer', source: 'lead-ad', platform: 'linkedin', stage: 'interview', rating: 4 },
          { name: 'Tomasz Kowalski', email: 'tomasz@example.com', phone: '+48 500 200 300', role: 'Senior React Developer', source: 'lead-ad', platform: 'facebook', stage: 'screen', rating: 3 },
          { name: 'Priya Sharma', email: 'priya@example.com', phone: '+44 7700 900100', role: 'Senior React Developer', source: 'lead-ad', platform: 'tiktok', stage: 'new', rating: 0 },
          { name: 'Noah Kim', email: 'noah@example.com', role: 'Product Designer', source: 'lead-ad', platform: 'instagram', stage: 'offer', rating: 5 },
          { name: 'Lena Schmidt', email: 'lena@example.com', role: 'Product Designer', source: 'manual', stage: 'screen', rating: 4 },
          { name: 'Alex Nowak', email: 'alex@example.com', role: 'Senior React Developer', source: 'lead-ad', platform: 'linkedin', stage: 'new', rating: 0 },
          { name: 'Sofia Martinez', email: 'sofia@example.com', role: 'Senior React Developer', source: 'lead-ad', platform: 'facebook', stage: 'hired', rating: 5 },
          { name: 'Jan Nowicki', email: 'jan@example.com', role: 'Product Designer', source: 'lead-ad', platform: 'tiktok', stage: 'rejected', rating: 1 },
        ]
        demo.forEach(d => get().addCandidate(d))
      },
    }),
    { name: 'hireads_ats' }
  )
)

// ─── Brand Kit ────────────────────────────────────────────────────────────────
export const useBrandKitStore = create(
  persist(
    (set) => ({
      brandColor: '#7c3aed',
      company: '',
      logoUrl: null,
      savedColors: ['#7c3aed', '#2563eb', '#059669', '#dc2626', '#d97706'],
      setBrandColor: (color) => set({ brandColor: color }),
      setCompany: (company) => set({ company }),
      setLogoUrl: (logoUrl) => set({ logoUrl }),
      addSavedColor: (color) =>
        set(state => ({
          savedColors: state.savedColors.includes(color)
            ? state.savedColors
            : [color, ...state.savedColors].slice(0, 10),
        })),
    }),
    { name: 'hireads_brandkit' }
  )
)

// ─── Chat (session only, not persisted) ──────────────────────────────────────
export const useChatStore = create(set => ({
  messages: [],
  isOpen: false,
  isLoading: false,
  toggleOpen: () => set(state => ({ isOpen: !state.isOpen })),
  addMessage: (msg) =>
    set(state => ({
      messages: [
        ...state.messages,
        { ...msg, id: crypto.randomUUID(), timestamp: new Date().toISOString() },
      ],
    })),
  setLoading: (isLoading) => set({ isLoading }),
  clearMessages: () => set({ messages: [] }),
}))
