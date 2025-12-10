import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/api'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'guru' | 'siswa'
  nim_nip?: string
  kelas?: string
  jurusan?: string
  phone?: string
  is_active: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  setAuth: (user: User, token: string) => void
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      setAuth: (user, token) => 
        set({ user, token, isAuthenticated: true, error: null }),
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/login', { email, password })
          const { token, access_token, user } = response.data
          
          // Backend might return either 'token' or 'access_token'
          const authToken = access_token || token
          
          if (!authToken) {
            throw new Error('Token tidak ditemukan dalam response')
          }
          
          set({ 
            user, 
            token: authToken, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          })
          return user
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Login gagal'
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: errorMessage 
          })
          throw error
        }
      },
      
      logout: () => {
        // Optional: call logout endpoint
        api.post('/logout').catch(() => {}) // Fire and forget
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          error: null 
        })
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      // Only persist user and token, not loading/error states
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)
