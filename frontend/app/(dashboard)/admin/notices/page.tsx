// frontend/app/(dashboard)/admin/notices/page.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { NoticeList } from '@/components/admin/NoticeList'
import { NoticeForm } from '@/components/admin/NoticeForm'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function NoticesPage() {
  const [showForm, setShowForm] = useState(false)

  const { data: notices, isLoading, refetch } = useQuery({
    queryKey: ['notices'],
    queryFn: async () => {
      const response = await api.get('/notices')
      return response.data
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Notice Board</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <PlusIcon className="h-5 w-5" />
          Create Notice
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Create New Notice</h2>
          <NoticeForm
            onSuccess={() => {
              setShowForm(false)
              refetch()
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <NoticeList notices={notices?.notices || []} isLoading={isLoading} onUpdate={refetch} />
    </div>
  )
}