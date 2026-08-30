import { create } from 'zustand'
import * as authApi from '../api/auth'

const useAuthStore = create((set, get) => ({
  user: null,
  status: 'idle', // idle | loading | ready
  isStaff: () => get().user?.account_type === 'staff',
  can: (permission) => !!get().user?.permissions?.includes(permission),
  hasRole: (role) => !!get().user?.roles?.includes(role),

  async hydrate() {
    if (get().status === 'ready') return
    set({ status: 'loading' })
    try {
      const user = await authApi.me()
      set({ user, status: 'ready' })
    } catch {
      set({ user: null, status: 'ready' })
    }
  },

  async login(credentials) {
    const user = await authApi.login(credentials)
    set({ user, status: 'ready' })
    return user
  },

  async register(data) {
    const user = await authApi.register(data)
    set({ user, status: 'ready' })
    return user
  },

  async logout() {
    await authApi.logout()
    set({ user: null })
  },
}))

export default useAuthStore
