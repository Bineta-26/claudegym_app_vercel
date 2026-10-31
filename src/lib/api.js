// Tiny fetch wrapper for the PulseFit /api functions. The browser never talks to the database directly.

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.status = status
    this.code = code
  }
  /** True when the problem is the database/server being unreachable rather than the request. */
  get isOffline() {
    return this.code === 'DB_UNAVAILABLE' || this.code === 'DB_NOT_SETUP' || this.code === 'SERVER_UNREACHABLE'
  }
}

/** Today's date in the user's own timezone, e.g. "2026-10-24". */
export function localDate(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export async function api(path, { method = 'GET', body, query } = {}) {
  const qs = query ? '?' + new URLSearchParams(query).toString() : ''
  let res
  try {
    res = await fetch(`/api${path}${qs}`, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError("We can't reach the PulseFit server. Check your internet connection and try again.", 0, 'SERVER_UNREACHABLE')
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    /* non-JSON response */
  }

  if (!res.ok) {
    // With no JSON body, the error came from the proxy/host (e.g. the local API server isn't running)
    if (!data && res.status >= 500) {
      throw new ApiError("We can't reach the PulseFit server right now. Please try again in a moment.", res.status, 'SERVER_UNREACHABLE')
    }
    throw new ApiError(data?.error || 'Something went wrong. Please try again.', res.status, data?.code)
  }
  return data
}
