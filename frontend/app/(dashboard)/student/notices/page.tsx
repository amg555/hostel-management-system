'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { format } from 'date-fns'
import { 
  BellIcon,
  MegaphoneIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface Notice {
  id: string
  title: string
  content: string
  category: 'general' | 'maintenance' | 'event' | 'urgent' | 'academic'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  author: string
  attachments?: string[]
}

export default function StudentNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchNotices()
  }, [])

  const fetchNotices = async () => {
    try {
      // Mock data - replace with actual API call
      const mockNotices: Notice[] = [
        {
          id: '1',
          title: 'Hostel Maintenance Schedule',
          content: 'Water tank cleaning will be carried out on Saturday. Water supply will be disrupted from 10 AM to 2 PM.',
          category: 'maintenance',
          priority: 'high',
          createdAt: new Date().toISOString(),
          author: 'Admin'
        },
        {
          id: '2',
          title: 'Annual Hostel Fest 2024',
          content: 'We are excited to announce the Annual Hostel Fest 2024. Register your participation by next week.',
          category: 'event',
          priority: 'medium',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          author: 'Cultural Committee'
        },
        {
          id: '3',
          title: 'New Mess Menu',
          content: 'The new mess menu will be effective from next Monday. Please check the notice board for details.',
          category: 'general',
          priority: 'low',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          author: 'Mess Committee'
        }
      ]
      
      setNotices(mockNotices)
    } catch (error) {
      console.error('Failed to fetch notices:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'maintenance':
        return <ExclamationTriangleIcon className="h-5 w-5" />
      case 'event':
        return <CalendarIcon className="h-5 w-5" />
      case 'urgent':
        return <BellIcon className="h-5 w-5" />
      case 'academic':
        return <InformationCircleIcon className="h-5 w-5" />
      default:
        return <MegaphoneIcon className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      case 'event':
        return 'bg-blue-100 text-blue-800'
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'academic':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high':
        return 'border-red-500'
      case 'medium':
        return 'border-yellow-500'
      default:
        return 'border-gray-300'
    }
  }

  const filteredNotices = selectedCategory === 'all' 
    ? notices 
    : notices.filter(notice => notice.category === selectedCategory)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notices</h1>
        <p className="text-gray-600 mt-1">Stay updated with hostel announcements</p>
      </div>

      {/* Category Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          All Notices
        </button>
        {['general', 'maintenance', 'event', 'urgent', 'academic'].map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {filteredNotices.map((notice) => (
          <div
            key={notice.id}
            className={`bg-white rounded-lg shadow-sm border-l-4 p-6 ${getPriorityColor(notice.priority)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(notice.category)}`}>
                    {getCategoryIcon(notice.category)}
                    {notice.category}
                  </span>
                  {notice.priority === 'high' && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                      Important
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {notice.title}
                </h3>
                
                <p className="text-gray-600 mb-3">
                  {notice.content}
                </p>
                
                <div className="flex items-center text-sm text-gray-500">
                  <span>{notice.author}</span>
                  <span className="mx-2">•</span>
                  <span>{format(new Date(notice.createdAt), 'MMM dd, yyyy at h:mm a')}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredNotices.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No notices found</p>
          </div>
        )}
      </div>
    </div>
  )
}