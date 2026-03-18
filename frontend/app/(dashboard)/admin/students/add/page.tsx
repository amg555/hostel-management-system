// frontend/app/(dashboard)/admin/students/add/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { StudentForm } from '@/components/admin/StudentForm'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

export default function AddStudentPage() {
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    try {
      const response = await api.post('/students', data)
      
      // Check if we got credentials in the response
      if (response.data?.credentials) {
        // The StudentForm component will handle showing the credentials
        return response.data;
      }
      
      toast.success('Student added successfully')
      
      // Navigate after a short delay to allow the modal to be shown
      setTimeout(() => {
        router.push('/admin/students')
      }, 2000)
      
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add student')
      throw error;
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Add New Student</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <StudentForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}