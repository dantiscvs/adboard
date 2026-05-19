import { Link } from 'react-router-dom'
import { Lightbulb, AlertTriangle, Info, Sparkles, ArrowRight } from 'lucide-react'

// Renders a Block[] from blog / knowledge data into styled HTML.
export default function ArticleBody({ blocks, resolveInternal }) {
  if (!Array.isArray(blocks)) return null
  return (
    <div className="prose-article space-y-5">
      {blocks.map((b, i) => <Block key={i} block={b} resolveInternal={resolveInternal} />)}
    </div>
  )
}

function Block({ block, resolveInternal }) {
  switch (block.type) {
    case 'p':
      return <p className="text-theme-text2 leading-relaxed">{block.text}</p>
    case 'h2':
      return <h2 className="text-2xl font-bold mt-10 mb-3 text-theme-text">{block.text}</h2>
    case 'h3':
      return <h3 className="text-lg font-semibold mt-6 mb-2 text-theme-text">{block.text}</h3>
    case 'ul':
      return (
        <ul className="space-y-2 list-disc pl-6 text-theme-text2">
          {block.items?.map((it, i) => <li key={i} className="leading-relaxed">{it}</li>)}
        </ul>
      )
    case 'ol':
      return (
        <ol className="space-y-2 list-decimal pl-6 text-theme-text2">
          {block.items?.map((it, i) => <li key={i} className="leading-relaxed">{it}</li>)}
        </ol>
      )
    case 'quote':
      return (
        <blockquote className="border-l-4 border-purple-500 pl-5 py-2 italic text-theme-text2">
          "{block.text}"
          {block.cite && <footer className="mt-2 text-xs not-italic text-theme-muted">— {block.cite}</footer>}
        </blockquote>
      )
    case 'stat':
      return (
        <div className="rounded-xl bg-gradient-to-br from-purple-600/10 to-indigo-600/10 border border-purple-500/20 p-5 my-2">
          <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{block.value}</p>
          <p className="text-sm text-theme-text mt-1">{block.label}</p>
          {block.source && <p className="text-xs text-theme-muted mt-2">Source: {block.source}</p>}
        </div>
      )
    case 'callout':
      return <Callout {...block} />
    case 'formula':
      return (
        <div className="rounded-lg bg-theme-card border border-theme-bdr p-4 font-mono text-sm">
          {block.label && <p className="text-xs text-theme-muted mb-1 font-sans">{block.label}</p>}
          <code className="text-theme-text">{block.expression}</code>
        </div>
      )
    case 'internal': {
      const resolved = resolveInternal?.(block)
      if (!resolved) return null
      return (
        <Link
          to={resolved.to}
          className="flex items-center gap-3 p-4 rounded-xl bg-theme-card border border-theme-bdr hover:border-purple-500/40 transition-colors group no-underline"
        >
          <Sparkles size={16} className="text-purple-400 shrink-0" />
          <span className="text-sm text-theme-text flex-1">{block.label || resolved.title}</span>
          <ArrowRight size={14} className="text-theme-muted group-hover:text-purple-400 transition-colors" />
        </Link>
      )
    }
    default:
      return null
  }
}

function Callout({ kind = 'info', title, text }) {
  const config = {
    tip:     { icon: <Lightbulb size={16} />,     color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/30' },
    warning: { icon: <AlertTriangle size={16} />, color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/30' },
    info:    { icon: <Info size={16} />,          color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/30' },
  }[kind] || { icon: <Info size={16} />, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' }

  return (
    <div className={`rounded-xl border p-4 ${config.bg}`}>
      <div className={`flex items-center gap-2 mb-1.5 font-semibold ${config.color}`}>
        {config.icon}
        {title}
      </div>
      <p className="text-sm text-theme-text2 leading-relaxed">{text}</p>
    </div>
  )
}
