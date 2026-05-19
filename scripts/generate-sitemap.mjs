// Generate public/sitemap.xml from our content files.
// Runs at build time via `node scripts/generate-sitemap.mjs`.
// Wired into package.json as a `prebuild` step.

import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SITE = 'https://hireads.app'

// Dynamically import the ESM content modules so we always match source of truth.
const productUrl   = pathToFileURL(resolve(__dirname, '../src/content/productLPs.js')).href
const blogUrl      = pathToFileURL(resolve(__dirname, '../src/content/blogPosts.js')).href
const knowledgeUrl = pathToFileURL(resolve(__dirname, '../src/content/knowledgeArticles.js')).href

const { PRODUCT_LP_SLUGS }      = await import(productUrl)
const { BLOG_POSTS, BLOG_POST_SLUGS } = await import(blogUrl)
const { KNOWLEDGE_ARTICLES, KNOWLEDGE_ARTICLE_SLUGS } = await import(knowledgeUrl)

const staticPages = [
  { loc: '/',               priority: '1.0',  changefreq: 'weekly' },
  { loc: '/product',        priority: '0.9',  changefreq: 'weekly' },
  { loc: '/blog',           priority: '0.9',  changefreq: 'daily'  },
  { loc: '/knowledge',      priority: '0.9',  changefreq: 'weekly' },
  { loc: '/about',          priority: '0.6',  changefreq: 'monthly'},
  { loc: '/contact',        priority: '0.6',  changefreq: 'monthly'},
  { loc: '/legal/terms',    priority: '0.3',  changefreq: 'yearly' },
  { loc: '/legal/privacy',  priority: '0.3',  changefreq: 'yearly' },
]

const productPages = PRODUCT_LP_SLUGS.map(s => ({
  loc: `/product/${s}`, priority: '0.8', changefreq: 'monthly',
}))

const blogPages = BLOG_POST_SLUGS.map(s => ({
  loc: `/blog/${s}`, priority: '0.7', changefreq: 'monthly',
  lastmod: BLOG_POSTS[s].date,
}))

const knowledgePages = KNOWLEDGE_ARTICLE_SLUGS.map(s => ({
  loc: `/knowledge/${s}`, priority: '0.7', changefreq: 'monthly',
  lastmod: KNOWLEDGE_ARTICLES[s].updated,
}))

const urls = [...staticPages, ...productPages, ...blogPages, ...knowledgePages]

const body = urls.map(u => `  <url>
    <loc>${SITE}${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`

const outDir = resolve(__dirname, '../public')
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
const outFile = resolve(outDir, 'sitemap.xml')
writeFileSync(outFile, xml, 'utf8')
console.log(`Sitemap written: ${outFile} (${urls.length} URLs)`)
