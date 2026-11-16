import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import { getToken, setToken, UNAUTHORIZED_EVENT } from '../api/session'
import type { Session, User } from '../api/types'
import { AuthContext, type AuthState } from './authContext'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => getToken() !== null)

  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    api
      .me()
      .then((me) => {
        if (!cancelled) setUser(me)
      })
      .catch(() => {
        if (!cancelled) setToken(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  // Any 401 on an authenticated call means the token is no longer valid.
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout)
  }, [logout])

  const start = useCallback((session: Session) => {
    setToken(session.accessToken)
    setUser(session.user)
    return session.user
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      login: (email, password) => api.login(email, password).then(start),
      register: (fullName, email, password) => api.register(fullName, email, password).then(start),
      logout,
    }),
    [user, loading, start, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
