import { create } from 'zustand'
import { authApi, type User } from '../lib/auth'

const REFRESH_KEY = 'darouna_refresh_token'

interface AuthState {
  user: User | null
  role: 'syndic' | 'resident' | 'gardien' | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  setTokens: (accessToken: string, refreshToken: string) => void
  initFromStorage: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  role: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setTokens: (accessToken, refreshToken) => {
    ;(window as any).__darounaAccessToken = accessToken
    localStorage.setItem(REFRESH_KEY, refreshToken)
    set({ accessToken })
  },

  login: async (email, password) => {
    const res = await authApi.login(email, password)
    const { accessToken, refreshToken, user } = res.data.data
    get().setTokens(accessToken, refreshToken)
    set({ user, role: user.role, isAuthenticated: true })
  },

  logout: async () => {
    const refreshToken = localStorage.getItem(REFRESH_KEY)
    if (refreshToken) {
      try { await authApi.logout(refreshToken) } catch { /* ignore */ }
    }
    ;(window as any).__darounaAccessToken = null
    localStorage.removeItem(REFRESH_KEY)
    set({ user: null, role: null, accessToken: null, isAuthenticated: false })
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem(REFRESH_KEY)
    if (!refreshToken) { set({ isLoading: false }); return }
    try {
      const res = await authApi.refresh(refreshToken)
      const newToken = res.data.data.accessToken
      ;(window as any).__darounaAccessToken = newToken
      set({ accessToken: newToken })
      const meRes = await authApi.me()
      const user = meRes.data.data
      set({ user, role: user.role, isAuthenticated: true })
    } catch {
      localStorage.removeItem(REFRESH_KEY)
      set({ user: null, role: null, accessToken: null, isAuthenticated: false })
    } finally {
      set({ isLoading: false })
    }
  },

  initFromStorage: async () => {
    await get().refreshToken()
  },
}))
