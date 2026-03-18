// frontend/app/(dashboard)/admin/students/page.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { StudentTable } from '@/components/admin/StudentTable'
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon 
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['students', page, searchTerm],
    queryFn: async () => {
      const response = await api.get('/students', {
        params: { page, search: searchTerm, limit: 10 }
      })
      return response.data
    }
  })

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Students Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            {data?.total || 0} total students
          </p>
        </div>
        
        <Link
          href="/admin/students/add"
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Student</span>
        </Link>
      </div>

      {/* Search and Filters - Mobile Responsive */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </button>
            
            {/* Desktop Filter Buttons */}
            <div className="hidden sm:flex gap-2">
              <button className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
              </button>
              
              <button className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* Mobile Filters Dropdown */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 sm:hidden">
              <div className="grid grid-cols-2 gap-3">
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
                
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>All Rooms</option>
                  <option>Assigned</option>
                  <option>Unassigned</option>
                </select>
                
                <button className="col-span-2 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Export Data
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Student Table - Already responsive */}
        <StudentTable
          students={data?.students || []}
          isLoading={isLoading}
          currentPage={page}
          totalPages={data?.totalPages || 1}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}