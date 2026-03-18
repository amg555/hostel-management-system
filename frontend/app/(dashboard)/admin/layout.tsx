// app/(dashboard)/admin/layout.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import Link from 'next/link'
import {
  HomeIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  ClipboardDocumentListIcon,
  ArrowsRightLeftIcon,
  MegaphoneIcon,
  ChartBarIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  PowerIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Students', href: '/admin/students', icon: UserGroupIcon },
  { name: 'Rooms', href: '/admin/rooms', icon: BuildingOfficeIcon },
  { name: 'Payments', href: '/admin/payments', icon: CurrencyRupeeIcon },
  { name: 'Complaints', href: '/admin/complaints', icon: ClipboardDocumentListIcon },
  { name: 'Movements', href: '/admin/movements', icon: ArrowsRightLeftIcon },
  { name: 'Notices', href: '/admin/notices', icon: MegaphoneIcon },
  { name: 'Expenses', href: '/admin/expenses', icon: BanknotesIcon },
  { name: 'Reports', href: '/admin/reports', icon: ChartBarIcon },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/admin-login')
      return
    }

    if (user.role !== 'admin') {
      router.push('/unauthorized')
    }
  }, [isAuthenticated, user, pathname, router])

  const handleLogout = () => {
    logout()
    router.push('/admin-login')
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const isActiveRoute = (href: string) => pathname === href

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/80 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b bg-indigo-600">
          <div className="flex items-center">
            <span className="text-2xl">🏠</span>
            <span className="ml-2 text-xl font-bold text-white">HostelHub</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md text-white hover:bg-indigo-700 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Mobile User Info */}
        <div className="px-4 py-4 border-b bg-gray-50">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
              <UserCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Admin</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="px-2 py-4 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-3 py-2.5 mb-1 rounded-lg transition-all duration-200
                ${isActiveRoute(item.href)
                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className={`h-5 w-5 mr-3 ${
                isActiveRoute(item.href) ? 'text-indigo-600' : 'text-gray-400'
              }`} />
              <span className="text-sm">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Mobile Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <PowerIcon className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white border-r border-gray-200">
          {/* Desktop Logo */}
          <div className="flex items-center h-16 px-6 bg-indigo-600">
            <span className="text-2xl">🏠</span>
            <span className="ml-2 text-xl font-bold text-white">HostelHub</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto bg-white">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = isActiveRoute(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2.5 mb-1 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 mr-3 ${
                    isActive ? 'text-indigo-600' : 'text-gray-400'
                  }`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Desktop User Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Admin</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <PowerIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Mobile menu button */}
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>

              {/* Page Title - Desktop */}
              <div className="hidden lg:block">
                <h1 className="text-xl font-semibold text-gray-900">
                  {navigation.find(item => isActiveRoute(item.href))?.name || 'Dashboard'}
                </h1>
              </div>

              {/* Mobile Logo */}
              <div className="flex items-center lg:hidden">
                <span className="text-xl">🏠</span>
                <span className="ml-2 text-base font-semibold text-gray-900">HostelHub</span>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Notifications */}
                <div className="relative">
                  <button 
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors relative"
                  >
                    <BellIcon className="h-6 w-6" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
                  </button>

                  {notificationOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40 lg:hidden" 
                        onClick={() => setNotificationOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <div className="p-4 border-b border-gray-200">
                          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          <div className="p-4 hover:bg-gray-50 cursor-pointer">
                            <p className="text-sm text-gray-900">New student registered</p>
                            <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                          </div>
                          <div className="p-4 hover:bg-gray-50 cursor-pointer">
                            <p className="text-sm text-gray-900">Payment received</p>
                            <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                          </div>
                        </div>
                        <div className="p-4 border-t border-gray-200">
                          <button className="text-sm text-indigo-600 hover:text-indigo-500">
                            View all notifications
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Profile - Desktop only */}
                <div className="hidden sm:block relative">
                  <button 
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <UserCircleIcon className="h-6 w-6 text-gray-400" />
                  </button>

                  {profileOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setProfileOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <Link
                          href="/admin/settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setProfileOpen(false)}
                        >
                          Settings
                        </Link>
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}