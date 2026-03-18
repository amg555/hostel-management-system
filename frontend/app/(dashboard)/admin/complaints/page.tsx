// frontend/app/(dashboard)/admin/complaints/page.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ComplaintTable } from '@/components/admin/ComplaintTable'

export default function ComplaintsPage() {
  const [filter, setFilter] = useState('all')

  const { data: complaints, isLoading, refetch } = useQuery({
    queryKey: ['admin-complaints', filter],
    queryFn: async () => {
      const response = await api.get('/complaints', {
        params: filter !== 'all' ? { status: filter } : {}
      })
      return response.data
    }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Complaint Management</h1>

      <div className="flex gap-2">
        {['all', 'open', 'in_progress', 'resolved', 'closed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === status
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      <ComplaintTable
        complaints={complaints?.complaints || []}
        isLoading={isLoading}
        onUpdate={refetch}
      />
    </div>
  )
}