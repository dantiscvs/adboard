# HireAds

Job ad SaaS dashboard — React 18 + Vite 5 + Tailwind CSS v3 (dark theme). Domain: hireads.io. Admin: dantiscvs@gmail.com.

## Dev commands

```bash
npm run dev       # start dev server
npm run build     # generate sitemap then Vite build
npm run preview   # preview production build
```

## Architecture

- **Auth:** localStorage (`adboard_users`), Zustand persist store (`adboard_auth`)
- **Ads:** Zustand persist store (`adboard_ads`), campaigns (`hireads_campaigns`), brand kit (`hireads_brandkit`)
- **Analytics:** `hireads_events` localStorage, tracked via `src/analytics.js` `track()` function
- **Admin:** dantiscvs@gmail.com auto-gets `isAdmin:true` on login; `/admin` route protected by `AdminRoute`

## Key files

| File | Purpose |
|------|---------|
| `src/store.js` | Zustand stores (auth, ads, campaigns, brand kit) |
| `src/utils.js` | `loadGoogleFont()`, CORS proxy logo fetch, export helpers |
| `src/analytics.js` | `track()` event logger |
| `src/App.jsx` | Router + route guards |
| `src/components/AdTemplates.jsx` | 5 templates (Classic, Bold, Gradient, Split, Custom) |
| `src/components/AdPreviews.jsx` | Export preview + html-to-image rendering |
| `src/pages/AdminPage.jsx` | Admin dashboard (charts, user table, event log) |
| `src/pages/AdsPage.jsx` | Main ad creation flow |
| `src/pages/CampaignPage.jsx` | Campaign management |

## Conventions

- Ad templates use **inline styles only** (no Tailwind inside the 1080×1080 canvas — html-to-image requires it)
- CORS proxy for external fetches: `api.allorigins.win/raw?url=`
- 22 Google Fonts loaded on demand via `loadGoogleFont()` in `utils.js`
- Export sizes: Square (1080×1080), LinkedIn (1200×628), Banner, Story, Email, Leaderboard, Custom
- Platforms: LinkedIn added with 1200×628 landscape preview aspect ratio
- API keys (Unsplash/Pexels) in env vars; optional user override in Account settings
