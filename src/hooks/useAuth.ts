import { useState, useCallback } from 'react'
import { api } from '../services/api'
import type { AuthState } from '../services/types'

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    email: null,
    dept: null,
    token: null,
    isAdmin: false,
    loading: true,
  })

  const initializeAuth = useCallback(async () => {
    try {
      const validation = await api.validateToken()
      if (validation.valid) {
        setAuthState({
          isAuthenticated: true,
          email: api.getStoredEmail(),
          dept: api.getStoredDept(),
          token: api.getStoredToken(),
          isAdmin: !!validation.isAdmin,
          loading: false,
        })
      } else {
        setAuthState(prev => ({ ...prev, loading: false }))
      }
    } catch (error) {
      console.error('Auth initialization failed:', error)
      setAuthState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  const login = useCallback(async (email: string, password: string, dept: string) => {
    try {
      const response = await api.login({ email, password, dept })
      setAuthState({
        isAuthenticated: true,
        email: response.email || null,
        dept: response.dept || null,
        token: response.token || null,
        isAdmin: !!response.isAdmin,
        loading: false,
      })
      return response
    } catch (error) {
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    api.clearAuth()
    setAuthState({
      isAuthenticated: false,
      email: null,
      dept: null,
      token: null,
      isAdmin: false,
      loading: false,
    })
  }, [])

  return {
    ...authState,
    initializeAuth,
    login,
    logout,
  }
}
