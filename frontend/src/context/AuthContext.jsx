import { createContext, useContext, useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('applyd_token')
    const storedUser = localStorage.getItem('applyd_user')
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('applyd_token')
        localStorage.removeItem('applyd_user')
      }
    }
    setLoading(false)
  }, [])

  async function login(email, password) {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    localStorage.setItem('applyd_token', data.token)
    localStorage.setItem('applyd_user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
  }

  async function signup(email, name, password) {
    const data = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, name, password })
    })
    localStorage.setItem('applyd_token', data.token)
    localStorage.setItem('applyd_user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
  }

  function logout() {
    localStorage.removeItem('applyd_token')
    localStorage.removeItem('applyd_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
