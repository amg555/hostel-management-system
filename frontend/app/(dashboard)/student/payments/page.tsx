'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PaymentHistory } from '@/components/student/PaymentHistory'
import { format } from 'date-fns'
import { CreditCardIcon, CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'

export default function PaymentsPage() {
  // Fetch student's own payments
  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['student-payments'],
    queryFn: async () => {
      const response = await api.get('/payments/my-payments')
      return response.data
    }
  })

  // Fetch payment status
  const { data: statusData } = useQuery({
    queryKey: ['payment-status'],
    queryFn: async () => {
      const response = await api.get('/payments/status')
      return response.data
    }
  })

  // Calculate totals
  const payments = paymentsData?.payments || []
  const totalPaid = payments
    .filter((p: any) => p.status === 'completed')
    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
  
  const pendingAmount = statusData?.amountDue || 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
        {statusData?.status === 'Pending' && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Pay Now
          </button>
        )}
      </div>

      {/* Payment Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalPaid}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Amount</p>
              <p className="text-2xl font-bold text-gray-900">₹{pendingAmount}</p>
            </div>
            <ExclamationCircleIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Rent</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{statusData?.roomDetails?.rentAmount || 0}
              </p>
            </div>
            <CreditCardIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Next Due Date</p>
              <p className="text-lg font-bold text-gray-900">
                {statusData?.nextDueDate 
                  ? format(new Date(statusData.nextDueDate), 'MMM dd, yyyy') 
                  : 'N/A'}
              </p>
            </div>
            <ClockIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Current Month Status */}
      {statusData && (
        <div className={`p-4 rounded-lg ${
          statusData.status === 'Paid' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-center">
            {statusData.status === 'Paid' ? (
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <ExclamationCircleIcon className="h-5 w-5 text-yellow-600 mr-2" />
            )}
            <span className={`font-medium ${
              statusData.status === 'Paid' ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {statusData.status === 'Paid' 
                ? 'Current month payment completed' 
                : `Payment pending for ${format(new Date(), 'MMMM yyyy')}`}
            </span>
          </div>
        </div>
      )}

      {/* Payment History Table */}
      <PaymentHistory 
        payments={payments} 
        isLoading={isLoading} 
      />
    </div>
  )
}