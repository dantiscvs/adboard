/**
 * HireAds Analytics — lightweight front-end event tracker.
 * Stores events in localStorage under `hireads_events`.
 * Max 5000 events (ring buffer — oldest dropped first).
 */

const KEY = 'hireads_events'
const MAX = 5000

let _sessionId = null
function getSession() {
  if (!_sessionId) _sessionId = crypto.randomUUID()
  return _sessionId
}

export function track(event, data = {}) {
  try {
    const user = (() => {
      try {
        return JSON.parse(localStorage.getItem('adboard_auth') || '{}')?.state?.user
      } catch { return null }
    })()

    const entry = {
      id: crypto.randomUUID(),
      userId: user?.id || null,
      email: user?.email || 'anonymous',
      event,
      data,
      ts: new Date().toISOString(),
      sessionId: getSession(),
    }

    const events = JSON.parse(localStorage.getItem(KEY) || '[]')
    if (events.length >= MAX) events.splice(0, events.length - MAX + 1)
    events.push(entry)
    localStorage.setItem(KEY, JSON.stringify(events))
  } catch {
    // Never throw — analytics must never break the app
  }
}

export function getEvents() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch { return [] }
}

export function clearEvents() {
  localStorage.removeItem(KEY)
}
