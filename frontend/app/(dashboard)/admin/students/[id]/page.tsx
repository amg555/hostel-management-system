// frontend/app/(dashboard)/admin/students/[id]/page.tsx
'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function StudentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', studentId],
    queryFn: async () => {
      const response = await api.get(`/students/${studentId}`)
      return response.data
    },
    enabled: !!studentId
  })

  if (isLoading) {
    return <div className="p-6">Loading student details...</div>
  }

  if (!student) {
    return <div className="p-6">Student not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Student Details</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-500">Student ID</dt>
                <dd className="text-sm font-medium">{student.studentId}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Full Name</dt>
                <dd className="text-sm font-medium">{student.fullName}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="text-sm font-medium">{student.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Phone</dt>
                <dd className="text-sm font-medium">{student.phone}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Status</dt>
                <dd className="text-sm font-medium">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    student.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {student.status}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Room Information</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-500">Room Number</dt>
                <dd className="text-sm font-medium">{student.room?.roomNumber || 'Not Assigned'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Floor</dt>
                <dd className="text-sm font-medium">{student.room?.floor || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Monthly Rent</dt>
                <dd className="text-sm font-medium">₹{student.room?.monthlyRent || 0}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.push(`/admin/students/${studentId}/edit`)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Edit Student
          </button>
          <button
            onClick={() => router.push('/admin/students')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back to List
          </button>
        </div>
      </div>
    </div>
  )
}