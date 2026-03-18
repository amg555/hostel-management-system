// frontend/app/(dashboard)/admin/movements/page.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { MovementDashboard } from '@/components/admin/MovementDashboard'
import { MovementTable } from '@/components/admin/MovementTable'

export default function AdminMovementsPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'all' | 'home' | 'overdue'>('dashboard')

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Movements
            </button>
            <button
              onClick={() => setActiveTab('home')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'home'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Students at Home
            </button>
            <button
              onClick={() => setActiveTab('overdue')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overdue'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overdue Returns
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'dashboard' && <MovementDashboard />}
      {activeTab === 'all' && <MovementTable filter="all" />}
      {activeTab === 'home' && <MovementTable filter="home" />}
      {activeTab === 'overdue' && <MovementTable filter="overdue" />}
    </div>
  )
}