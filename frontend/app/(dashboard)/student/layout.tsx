// app/(dashboard)/student/layout.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { Header } from '@/components/common/Header'
import Link from 'next/link'
import {
  HomeIcon,
  ExclamationCircleIcon,
  CreditCardIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ClockIcon,
  CogIcon,
  BellIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/student', icon: HomeIcon },
  { name: 'Profile', href: '/student/profile', icon: UserCircleIcon },
  { name: 'Movements', href: '/student/movements', icon: ClockIcon },
  { name: 'Complaints', href: '/student/complaints', icon: ExclamationCircleIcon },
  { name: 'Payments', href: '/student/payments', icon: CreditCardIcon },
  { name: 'Notices', href: '/student/notices', icon: BellIcon },
  { name: 'Settings', href: '/student/settings', icon: CogIcon },
]

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, redirecting to login')
      router.push('/student-login')
      return
    }

    // Check role-based access
    if (user.role !== 'student') {
      console.log('Non-student trying to access student area')
      router.push('/unauthorized')
    }
  }, [isAuthenticated, user, pathname, router])

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // Extract student info safely
  const studentName = user?.studentProfile?.fullName || user?.email || 'Student'
  const roomNumber = user?.studentProfile?.roomNumber || 'N/A'

  // Helper function to check if a route is active
  const isActiveRoute = (href: string) => {
    if (href === '/student') {
      return pathname === '/student' || pathname === '/student'
    }
    return pathname === href
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-gray-900/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Student Portal</h2>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md hover:bg-gray-800"
          >
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>
        </div>
        
        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                isActiveRoute(item.href)
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Mobile sidebar footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="flex items-center mb-3 text-white">
            <div className="flex-1">
              <p className="text-sm font-medium truncate">{studentName}</p>
              <p className="text-xs text-gray-400">Room: {roomNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-shrink-0">
        <div className="flex flex-col w-full bg-gray-900">
          <nav className="flex-1 mt-8 space-y-1 px-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop sidebar footer */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center text-white">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{studentName}</p>
                <p className="text-xs text-gray-400">Room: {roomNumber}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Common Header for desktop */}
        <div className="hidden lg:block">
          <Header />
        </div>

        {/* Mobile header */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between p-4 bg-white border-b">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold">Student Portal</h1>
            <div className="w-8" /> {/* Spacer for balance */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}