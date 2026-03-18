// app/(dashboard)/layout.tsx
'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (pathname.startsWith('/student')) {
        router.push('/student-login')
      } else if (pathname.startsWith('/admin')) {
        router.push('/admin-login')
      }
    }
  }, [isAuthenticated, user, pathname, router])

  return <>{children}</>
}