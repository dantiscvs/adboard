import { useState, useRef, useEffect } from 'react'
import { useChatStore, useAuthStore } from '../store'
import { sendToN8n, textToSpeech } from '../utils'
import { MessageSquare, X, Send, Volume2, Settings, Loader2, Bot, User } from 'lucide-react'

export default function ChatBot() {
  const { messages, isOpen, isLoading, toggleOpen, addMessage, setLoading } = useChatStore()
  const user = useAuthStore(s => s.user)
  const [input, setInput] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState(() => ({
    n8nUrl: localStorage.getItem('adboard_n8n_url') || '',
    elevenLabsKey: localStorage.getItem('adboard_el_key') || '',
    voiceId: localStorage.getItem('adboard_voice_id') || '21m00Tcm4TlvDq8ikWAM',
    unsplashKey: localStorage.getItem('adboard_unsplash_key') || '',
    pexelsKey: localStorage.getItem('adboard_pexels_key') || '',
  }))
  const [audioPlaying, setAudioPlaying] = useState(null)
  const bottomRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  function saveSettings() {
    localStorage.setItem('adboard_n8n_url', settings.n8nUrl)
    localStorage.setItem('adboard_el_key', settings.elevenLabsKey)
    localStorage.setItem('adboard_voice_id', settings.voiceId)
    localStorage.setItem('adboard_unsplash_key', settings.unsplashKey)
    localStorage.setItem('adboard_pexels_key', settings.pexelsKey)
    setShowSettings(false)
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')

    addMessage({ role: 'user', text })

    if (!settings.n8nUrl) {
      addMessage({
        role: 'assistant',
        text: 'Hi! I\'m your HireAds assistant. Please configure the n8n webhook URL in settings (⚙️) to connect me to your AI agent.',
      })
      return
    }

    setLoading(true)
    try {
      const reply = await sendToN8n(settings.n8nUrl, text, user?.id || 'anonymous')
      let audioUrl = null

      if (settings.elevenLabsKey && settings.voiceId) {
        audioUrl = await textToSpeech(reply, settings.elevenLabsKey, settings.voiceId)
      }

      addMessage({ role: 'assistant', text: reply, audioUrl })

      if (audioUrl) {
        playAudio(audioUrl)
      }
    } catch (err) {
      addMessage({ role: 'assistant', text: `Sorry, I couldn't reach the agent. Error: ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  function playAudio(url) {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    const audio = new Audio(url)
    audioRef.current = audio
    audio.play().catch(() => {})
    setAudioPlaying(url)
    audio.onended = () => setAudioPlaying(null)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isConfigured = !!settings.n8nUrl

  return (
    <>
      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 sm:w-96 max-h-[560px] bg-theme-card border border-theme-bdr rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-theme-bdr bg-theme-surface">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-green-400' : 'bg-gray-600'}`} />
              <span className="font-semibold text-sm">HireAds Assistant</span>
              {isConfigured && settings.elevenLabsKey && (
                <span className="badge bg-purple-600/15 text-purple-300 border border-purple-500/20 text-[10px]">
                  🎙 Voice
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSettings(s => !s)}
                className="text-gray-500 hover:text-gray-300 p-1 rounded transition-colors"
              >
                <Settings size={14} />
              </button>
              <button onClick={toggleOpen} className="text-gray-500 hover:text-gray-300 p-1 rounded transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Settings panel */}
          {showSettings && (
            <div className="p-3 border-b border-theme-bdr bg-theme-surface space-y-2">
              <p className="text-xs text-gray-400 font-medium">Configuration</p>
              <div>
                <label className="label text-[10px]">n8n Webhook URL</label>
                <input
                  className="input text-xs py-1.5"
                  placeholder="https://your-n8n.cloud/webhook/..."
                  value={settings.n8nUrl}
                  onChange={e => setSettings(s => ({ ...s, n8nUrl: e.target.value }))}
                />
              </div>
              <div>
                <label className="label text-[10px]">ElevenLabs API Key (optional)</label>
                <input
                  className="input text-xs py-1.5"
                  type="password"
                  placeholder="sk_..."
                  value={settings.elevenLabsKey}
                  onChange={e => setSettings(s => ({ ...s, elevenLabsKey: e.target.value }))}
                />
              </div>
              <div>
                <label className="label text-[10px]">ElevenLabs Voice ID</label>
                <input
                  className="input text-xs py-1.5"
                  placeholder="21m00Tcm4TlvDq8ikWAM"
                  value={settings.voiceId}
                  onChange={e => setSettings(s => ({ ...s, voiceId: e.target.value }))}
                />
                <p className="text-[10px] text-gray-600 mt-0.5">Default: Rachel (ElevenLabs)</p>
              </div>
              <div className="border-t border-theme-bdr pt-2">
                <p className="text-[10px] text-gray-600 mb-2 uppercase tracking-wide font-medium">Stock Photos</p>
                <div>
                  <label className="label text-[10px]">Unsplash Access Key</label>
                  <input
                    className="input text-xs py-1.5"
                    placeholder="Unsplash Client-ID key"
                    value={settings.unsplashKey}
                    onChange={e => setSettings(s => ({ ...s, unsplashKey: e.target.value }))}
                  />
                </div>
                <div className="mt-2">
                  <label className="label text-[10px]">Pexels API Key</label>
                  <input
                    className="input text-xs py-1.5"
                    placeholder="Pexels API key"
                    value={settings.pexelsKey}
                    onChange={e => setSettings(s => ({ ...s, pexelsKey: e.target.value }))}
                  />
                </div>
              </div>
              <button onClick={saveSettings} className="btn-primary w-full text-xs py-1.5">Save</button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
            {messages.length === 0 && (
              <div className="text-center text-gray-600 text-xs py-8">
                <Bot size={28} className="mx-auto mb-2 text-gray-700" />
                <p>Hi! I'm your HireAds assistant.</p>
                <p className="mt-1">Ask me anything about job ads or campaigns.</p>
                {!isConfigured && (
                  <button onClick={() => setShowSettings(true)} className="mt-2 text-purple-400 hover:text-purple-300 text-xs underline">
                    Configure n8n connection ⚙️
                  </button>
                )}
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-purple-600/20 text-purple-400' : 'bg-theme-elevated text-gray-400'}`}>
                  {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                </div>
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`px-3 py-2 rounded-xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-theme-elevated text-theme-text rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                  {msg.audioUrl && (
                    <button
                      onClick={() => playAudio(msg.audioUrl)}
                      className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300"
                    >
                      <Volume2 size={11} />
                      {audioPlaying === msg.audioUrl ? 'Playing…' : 'Play voice'}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-theme-elevated text-gray-400 flex items-center justify-center shrink-0">
                  <Bot size={12} />
                </div>
                <div className="bg-theme-elevated px-3 py-2 rounded-xl rounded-tl-none flex items-center gap-1.5">
                  <Loader2 size={12} className="animate-spin text-gray-500" />
                  <span className="text-xs text-gray-500">Thinking…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-theme-bdr">
            <div className="flex gap-2">
              <textarea
                className="input flex-1 resize-none text-sm py-2 max-h-24"
                rows={1}
                placeholder="Ask something…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="btn-primary px-3 disabled:opacity-40 shrink-0"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={toggleOpen}
        className={`fixed bottom-4 right-4 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all z-50 ${isOpen ? 'bg-theme-elevated text-gray-300 rotate-0' : 'bg-purple-600 text-white hover:bg-purple-500'}`}
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
        {messages.filter(m => m.role === 'assistant').length > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full text-[9px] text-black font-bold flex items-center justify-center">
            {messages.filter(m => m.role === 'assistant').length}
          </span>
        )}
      </button>
    </>
  )
}
