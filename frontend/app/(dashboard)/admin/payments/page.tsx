// app/(dashboard)/admin/payments/page.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PaymentTable } from '@/components/admin/PaymentTable'
import { RecordPaymentModal } from '@/components/admin/RecordPaymentModal'
import toast from 'react-hot-toast'
import { 
  CurrencyRupeeIcon,
  CalendarIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function PaymentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const queryClient = useQueryClient()
  
  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const response = await api.get('/payments')
      return response.data
    }
  })
  
  const recordPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await api.post('/payments/offline', paymentData)
      return response.data
    },
    onSuccess: () => {
      toast.success('Payment recorded successfully')
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      setIsModalOpen(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to record payment')
    }
  })
  
  const handleRecordPayment = (studentId?: string) => {
    if (studentId) {
      api.get(`/students/${studentId}`).then(response => {
        setSelectedStudent(response.data)
        setIsModalOpen(true)
      })
    } else {
      setIsModalOpen(true)
    }
  }
  
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage and track all hostel payments</p>
        </div>
        
        <button
          onClick={() => handleRecordPayment()}
          className="inline-flex items-center justify-center bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
        >
          <CurrencyRupeeIcon className="h-5 w-5 mr-2" />
          Record Payment
        </button>
      </div>
      
      {/* Payment Stats - Mobile Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 truncate">Today's Collection</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600 mt-1">
                ₹{payments?.todayCollection?.toLocaleString() || 0}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500 flex-shrink-0 hidden sm:block" />
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 truncate">This Month</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-600 mt-1">
                ₹{payments?.monthlyCollection?.toLocaleString() || 0}
              </p>
            </div>
            <CalendarIcon className="h-8 w-8 text-blue-500 flex-shrink-0 hidden sm:block" />
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 truncate">Pending</p>
              <p className="text-lg sm:text-2xl font-bold text-yellow-600 mt-1">
                ₹{payments?.totalPending?.toLocaleString() || 0}
              </p>
            </div>
            <ExclamationCircleIcon className="h-8 w-8 text-yellow-500 flex-shrink-0 hidden sm:block" />
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 truncate">Overdue</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600 mt-1">
                ₹{payments?.overdue?.toLocaleString() || 0}
              </p>
            </div>
            <ExclamationCircleIcon className="h-8 w-8 text-red-500 flex-shrink-0 hidden sm:block" />
          </div>
        </div>
      </div>
      
      {/* Responsive Payment Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <PaymentTable 
          payments={payments?.payments || []} 
          isLoading={isLoading}
          onRecordPayment={handleRecordPayment}
        />
      </div>
      
      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedStudent(null)
        }}
        onSubmit={recordPaymentMutation.mutate}
        student={selectedStudent}
        isLoading={recordPaymentMutation.isPending}
      />
    </div>
  )
}