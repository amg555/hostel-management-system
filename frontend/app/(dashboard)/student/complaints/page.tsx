// frontend/app/(dashboard)/student/complaints/page.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ComplaintForm } from '@/components/student/ComplaintForm'
import { ComplaintList } from '@/components/student/ComplaintList'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function ComplaintsPage() {
  const [showForm, setShowForm] = useState(false)

  const { data: complaints, isLoading, refetch } = useQuery({
    queryKey: ['student-complaints'],
    queryFn: async () => {
      const response = await api.get('/complaints')
      return response.data
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <PlusIcon className="h-5 w-5" />
          New Complaint
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Register New Complaint</h2>
          <ComplaintForm 
            onSuccess={() => {
              setShowForm(false)
              refetch()
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <ComplaintList 
        complaints={complaints?.complaints || []} 
        isLoading={isLoading}
      />
    </div>
  )
}