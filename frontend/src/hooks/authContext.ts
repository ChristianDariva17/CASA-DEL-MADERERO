import { createContext, useContext } from 'react'
import type { User, UserRole } from '../api/types'

export interface AuthState {
  user: User | null
  /** True while the stored token is being checked on first load. */
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (fullName: string, email: string, password: string) => Promise<User>
  logout: () => void
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const state = useContext(AuthContext)
  if (!state) throw new Error('useAuth must be used inside <AuthProvider>')
  return state
}

/** Where each role lands after signing in. */
export const HOME_BY_ROLE: Record<UserRole, string> = {
  admin: '/admin',
  customer: '/mi-cuenta',
}

/**
 * Validates a `?next=` redirect: only same-site paths, never "//host" or a URL,
 * and never the admin area for a customer.
 */
export function safeNext(next: string | null, role: UserRole): string | null {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return null
  if (next.startsWith('/admin') && role !== 'admin') return null
  return next
}
