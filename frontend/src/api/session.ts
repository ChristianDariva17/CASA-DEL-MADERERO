const TOKEN_KEY = 'cm.token'

/** Fired when the API rejects the stored token, so the app can sign out. */
export const UNAUTHORIZED_EVENT = 'cm:unauthorized'

// Fallback for browsers where localStorage throws (e.g. blocked site data).
let memoryToken: string | null = null

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? memoryToken
  } catch {
    return memoryToken
  }
}

export function setToken(token: string | null): void {
  memoryToken = token
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Storage unavailable: the in-memory copy lasts until reload.
  }
}
