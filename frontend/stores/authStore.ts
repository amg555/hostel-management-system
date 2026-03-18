//D:\PROJECTS\WEB PROJECTS\hostel-management-system\frontend\stores\authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StudentProfile {
  id?: string
  fullName?: string
  rollNumber?: string
  phoneNumber?: string
  email?: string
  course?: string
  year?: string
  department?: string
  roomId?: string
  [key: string]: any // Allow additional properties
}

interface User {
  id: string
  email: string
  name?: string
  phoneNumber?: string
  role: 'student' | 'admin' | 'staff'
  studentProfile?: StudentProfile
  isActive?: boolean
  requirePasswordChange?: boolean
  lastLogin?: string | Date
  createdAt?: string | Date
  updatedAt?: string | Date
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  setAuth: (token: string, user: User) => void
  logout: () => void
  updateUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      
      setAuth: (token, user) => set({
        token,
        user,
        isAuthenticated: true,
      }),
      
      logout: () => set({
        token: null,
        user: null,
        isAuthenticated: false,
      }),
      
      updateUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
    }
  )
)