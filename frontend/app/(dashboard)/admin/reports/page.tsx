// frontend/app/(dashboard)/admin/reports/page.tsx
'use client'

import { useState } from 'react'
import { FinancialReport } from '@/components/admin/reports/FinancialReport'
import { OccupancyReport } from '@/components/admin/reports/OccupancyReport'
import { StudentReport } from '@/components/admin/reports/StudentReport'
import { ComplaintReport } from '@/components/admin/reports/ComplaintReport'
import { CalendarIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('financial')
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  })

  const tabs = [
    { id: 'financial', label: 'Financial Report' },
    { id: 'occupancy', label: 'Occupancy Report' },
    { id: 'students', label: 'Student Report' },
    { id: 'complaints', label: 'Complaint Report' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        
        {/* Date Range Selector */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'financial' && <FinancialReport dateRange={dateRange} />}
        {activeTab === 'occupancy' && <OccupancyReport dateRange={dateRange} />}
        {activeTab === 'students' && <StudentReport dateRange={dateRange} />}
        {activeTab === 'complaints' && <ComplaintReport dateRange={dateRange} />}
      </div>
    </div>
  )
}