'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ExpenseTable } from '@/components/admin/ExpenseTable'
import { ExpenseForm } from '@/components/admin/ExpenseForm'
import { PlusIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function ExpensesPage() {
  const [showForm, setShowForm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })

  const { data: expenses, isLoading, refetch } = useQuery({
    queryKey: ['expenses', dateRange],
    queryFn: async () => {
      const response = await api.get('/expenses', { params: dateRange })
      return response.data
    },
  })

  // ✅ Handle form submission
  const handleAddExpense = async (formData: any) => {
    try {
      setIsSaving(true)
      await api.post('/expenses', formData)
      toast.success('Expense added successfully!')
      setShowForm(false)
      refetch()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add expense')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <PlusIcon className="h-5 w-5" />
          Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">
            ₹{expenses?.totalAmount || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">This Month</p>
          <p className="text-2xl font-bold">₹{expenses?.monthlyTotal || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Transactions</p>
          <p className="text-2xl font-bold">{expenses?.total || 0}</p>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <ExpenseForm
            onSubmit={handleAddExpense}     // ✅ updated prop name
            onCancel={() => setShowForm(false)}
            isLoading={isSaving}
          />
        </div>
      )}

      <ExpenseTable expenses={expenses?.expenses || []} isLoading={isLoading} />
    </div>
  )
}
