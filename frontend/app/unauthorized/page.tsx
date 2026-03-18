'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function UnauthorizedPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  const handleRedirect = () => {
    if (user?.role === 'admin') {
      router.push('/admin')
    } else if (user?.role === 'student') {
      router.push('/student')
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
          </p>
          <button
            onClick={handleRedirect}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Your Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}