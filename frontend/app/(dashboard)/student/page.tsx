// app/(dashboard)/student/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { 
  HomeIcon, 
  CreditCardIcon, 
  BellIcon, 
  ExclamationCircleIcon,
  ArrowRightIcon,
  CalendarIcon,
  UserCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { format } from 'date-fns'

// Responsive Stat Card
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  subtitle, 
  link 
}: {
  title: string
  value: string | number
  icon: any
  color: string
  subtitle?: string
  link?: string
}) => {
  const content = (
    <div className={`bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all p-4 sm:p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1 truncate">{subtitle}</p>
          )}
        </div>
        <div className={`p-2 sm:p-3 rounded-full ${color.replace('border-', 'bg-').replace('500', '100')} hidden sm:block`}>
          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${color.replace('border-', 'text-')}`} />
        </div>
      </div>
    </div>
  )

  if (link) {
    return (
      <Link href={link} className="block">
        {content}
      </Link>
    )
  }

  return content
}

// Responsive Quick Action Button
const QuickActionButton = ({ 
  title, 
  icon: Icon, 
  href, 
  color 
}: {
  title: string
  icon: any
  href: string
  color: string
}) => (
  <Link
    href={href}
    className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg ${color} hover:opacity-90 transition-opacity`}
  >
    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white mb-1 sm:mb-2" />
    <span className="text-xs sm:text-sm font-medium text-white text-center">{title}</span>
  </Link>
)

export default function StudentDashboard() {
  const { user } = useAuthStore()
  const [greeting, setGreeting] = useState('')

  const studentName = user?.studentProfile?.fullName || user?.email || 'Student'
  const roomNumber = user?.studentProfile?.roomNumber || 'Not Assigned'

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => {
      const response = await api.get('/students/dashboard')
      return response.data
    }
  })

  const { data: noticesData } = useQuery({
    queryKey: ['recent-notices'],
    queryFn: async () => {
      const response = await api.get('/notices?limit=3')
      return response.data
    }
  })

  const { data: paymentData } = useQuery({
    queryKey: ['payment-status'],
    queryFn: async () => {
      const response = await api.get('/payments/status')
      return response.data
    }
  })

  const { data: movementStatus } = useQuery({
    queryKey: ['movement-status'],
    queryFn: async () => {
      const response = await api.get('/movements/status')
      return response.data
    }
  })

  const { data: complaintsData } = useQuery({
    queryKey: ['recent-complaints'],
    queryFn: async () => {
      const response = await api.get('/complaints?limit=3')
      return response.data
    }
  })

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const stats = dashboardData?.stats || {}
  const notices = noticesData?.notices || noticesData || []
  const complaints = complaintsData?.complaints || complaintsData || []

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Welcome Header - Mobile Responsive */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
              {greeting}, {studentName.split(' ')[0]}!
            </h1>
            <p className="text-blue-100 mt-1 text-sm sm:text-base">
              {format(new Date(), 'EEEE, MMMM dd, yyyy')}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs sm:text-sm text-blue-100">Room Number</p>
            <p className="text-xl sm:text-2xl font-bold">{roomNumber}</p>
          </div>
        </div>
      </div>

      {/* Key Stats - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Status"
          value={movementStatus?.status === 'in' ? 'In Hostel' : 'Outside'}
          icon={movementStatus?.status === 'in' ? CheckCircleIcon : XCircleIcon}
          color={movementStatus?.status === 'in' ? 'border-green-500' : 'border-yellow-500'}
          subtitle={movementStatus?.lastMovement ? `Since ${format(new Date(movementStatus.lastMovement.createdAt), 'hh:mm a')}` : ''}
          link="/student/movements"
        />
        
        <StatCard
          title="Payment"
          value={paymentData?.status || 'Pending'}
          icon={CreditCardIcon}
          color={paymentData?.status === 'Paid' ? 'border-green-500' : 'border-red-500'}
          subtitle={paymentData?.nextDueDate ? `Due: ${format(new Date(paymentData.nextDueDate), 'MMM dd')}` : ''}
          link="/student/payments"
        />
        
        <StatCard
          title="Complaints"
          value={stats.activeComplaints || 0}
          icon={ExclamationCircleIcon}
          color="border-orange-500"
          subtitle={`${stats.resolvedComplaints || 0} resolved`}
          link="/student/complaints"
        />
        
        <StatCard
          title="Notices"
          value={stats.unreadNotices || 0}
          icon={BellIcon}
          color="border-purple-500"
          subtitle={`${stats.totalNotices || 0} total`}
          link="/student/notices"
        />
      </div>

      {/* Quick Actions - Mobile Responsive */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <QuickActionButton
            title="Complaint"
            icon={ExclamationCircleIcon}
            href="/student/complaints"
            color="bg-red-500"
          />
          <QuickActionButton
            title="Movement"
            icon={ArrowRightIcon}
            href="/student/movements"
            color="bg-blue-500"
          />
          <QuickActionButton
            title="Payments"
            icon={CurrencyRupeeIcon}
            href="/student/payments"
            color="bg-green-500"
          />
          <QuickActionButton
            title="Profile"
            icon={UserCircleIcon}
            href="/student/profile"
            color="bg-purple-500"
          />
        </div>
      </div>

      {/* Recent Items - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Notices - Mobile Responsive */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm">
          <div className="p-4 sm:p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Notices</h2>
              <Link href="/student/notices" className="text-xs sm:text-sm text-blue-600 hover:text-blue-700">
                View All →
              </Link>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            {notices.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {notices.slice(0, 3).map((notice: any) => (
                  <div key={notice.id} className="flex items-start space-x-3">
                    <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
                      notice.priority === 'high' 
                        ? 'bg-red-100' 
                        : notice.priority === 'medium'
                        ? 'bg-yellow-100'
                        : 'bg-blue-100'
                    }`}>
                      <BellIcon className={`h-3 w-3 sm:h-4 sm:w-4 ${
                        notice.priority === 'high' 
                          ? 'text-red-600' 
                          : notice.priority === 'medium'
                          ? 'text-yellow-600'
                          : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-900 truncate">{notice.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(notice.createdAt), 'MMM dd, hh:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4 text-sm">No recent notices</p>
            )}
          </div>
        </div>

        {/* My Complaints - Mobile Responsive */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm">
          <div className="p-4 sm:p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">My Complaints</h2>
              <Link href="/student/complaints" className="text-xs sm:text-sm text-blue-600 hover:text-blue-700">
                View All →
              </Link>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            {complaints.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {complaints.slice(0, 3).map((complaint: any) => (
                  <div key={complaint.id} className="flex items-start space-x-3">
                    <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
                      complaint.status === 'resolved' 
                        ? 'bg-green-100' 
                        : complaint.status === 'in_progress'
                        ? 'bg-yellow-100'
                        : 'bg-gray-100'
                    }`}>
                      <ExclamationCircleIcon className={`h-3 w-3 sm:h-4 sm:w-4 ${
                        complaint.status === 'resolved' 
                          ? 'text-green-600' 
                          : complaint.status === 'in_progress'
                          ? 'text-yellow-600'
                          : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-900 truncate">{complaint.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          complaint.status === 'resolved'
                            ? 'bg-green-100 text-green-700'
                            : complaint.status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {complaint.status?.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(complaint.createdAt), 'MMM dd')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4 text-sm">No complaints filed</p>
            )}
          </div>
        </div>
      </div>

      {/* Room & Payment Info - Mobile Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Room Information</h2>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between py-2 border-b text-sm">
              <span className="text-gray-600">Room Number</span>
              <span className="font-medium">{roomNumber}</span>
            </div>
            <div className="flex justify-between py-2 border-b text-sm">
              <span className="text-gray-600">Floor</span>
              <span className="font-medium">{user?.studentProfile?.floor || '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b text-sm">
              <span className="text-gray-600">Room Type</span>
              <span className="font-medium">{user?.studentProfile?.roomType || 'Standard'}</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-600">Occupancy</span>
              <span className="font-medium">{user?.studentProfile?.roomOccupancy || '-'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Payment Summary</h2>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between py-2 border-b text-sm">
              <span className="text-gray-600">Current Status</span>
              <span className={`font-medium ${
                paymentData?.status === 'Paid' ? 'text-green-600' : 'text-red-600'
              }`}>
                {paymentData?.status || 'Pending'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b text-sm">
              <span className="text-gray-600">Last Payment</span>
              <span className="font-medium">
                {paymentData?.lastPaymentDate 
                  ? format(new Date(paymentData.lastPaymentDate), 'MMM dd')
                  : '-'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b text-sm">
              <span className="text-gray-600">Amount Due</span>
              <span className="font-medium">₹{paymentData?.amountDue || '0'}</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-600">Next Due</span>
              <span className="font-medium">
                {paymentData?.nextDueDate 
                  ? format(new Date(paymentData.nextDueDate), 'MMM dd')
                  : '-'}
              </span>
            </div>
          </div>
          <Link
            href="/student/payments"
            className="mt-4 w-full block text-center py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            View Payment History
          </Link>
        </div>
      </div>
    </div>
  )
}