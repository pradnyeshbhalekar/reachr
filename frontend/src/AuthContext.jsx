import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

function decodeJwt(token) {
  const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(payload))
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem('reachr_auth')
    return stored ? JSON.parse(stored) : null
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const authToken = params.get('authToken')
    if (!authToken) return

    try {
      const payload = decodeJwt(authToken)
      setAuth({ token: authToken, user: { id: payload.sub, email: payload.email, name: payload.name } })
    } catch {
      // ignore malformed token
    }

    params.delete('authToken')
    const search = params.toString()
    window.history.replaceState({}, '', window.location.pathname + (search ? `?${search}` : ''))
  }, [])

  useEffect(() => {
    if (auth) {
      localStorage.setItem('reachr_auth', JSON.stringify(auth))
    } else {
      localStorage.removeItem('reachr_auth')
    }
  }, [auth])

  const login = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`
  }

  const logout = () => setAuth(null)

  return (
    <AuthContext.Provider value={{
      user: auth?.user || null,
      token: auth?.token || null,
      isAuthenticated: !!auth,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
