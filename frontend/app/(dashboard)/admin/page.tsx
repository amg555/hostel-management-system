'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { StatCard } from '@/components/common/StatCard'
import { OccupancyChart } from '@/components/admin/OccupancyChart'
import { RevenueChart } from '@/components/admin/RevenueChart'
import { RecentActivities } from '@/components/admin/RecentActivities'
import { PendingComplaints } from '@/components/admin/PendingComplaints'
import { PaymentOverview } from '@/components/admin/PaymentOverview'
import { 
  UserGroupIcon, 
  HomeIcon, 
  CurrencyRupeeIcon, 
  ClockIcon,
  UserPlusIcon,
  HomeModernIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  useEffect(() => {
    fetchDashboardStats()
  }, [])
  
  const fetchDashboardStats = async () => {
    try {
      // For now, use mock data since the stats endpoint might not be ready
      setStats({
        totalStudents: 150,
        occupancyRate: 75,
        monthlyRevenue: 450000,
        pendingPayments: 12,
        occupancyData: [],
        revenueData: [],
        recentPayments: [],
        pendingComplaints: [],
        recentActivities: []
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      title: 'Add New Student',
      icon: UserPlusIcon,
      color: 'bg-blue-500',
      href: '/admin/students/add',
      description: 'Register a new student'
    },
    {
      title: 'Manage Rooms',
      icon: HomeModernIcon,
      color: 'bg-green-500',
      href: '/admin/rooms',
      description: 'View and manage rooms'
    },
    {
      title: 'View Payments',
      icon: BanknotesIcon,
      color: 'bg-yellow-500',
      href: '/admin/payments',
      description: 'Track payments'
    },
    {
      title: 'Complaints',
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      href: '/admin/complaints',
      description: 'Handle complaints'
    },
    {
      title: 'Post Notice',
      icon: DocumentTextIcon,
      color: 'bg-purple-500',
      href: '/admin/notices',
      description: 'Create announcements'
    },
    {
      title: 'Reports',
      icon: ChartBarIcon,
      color: 'bg-indigo-500',
      href: '/admin/reports',
      description: 'View analytics'
    }
  ]
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage your hostel operations efficiently
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          change="+12%"
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Occupancy Rate"
          value={`${stats?.occupancyRate || 0}%`}
          change="+5%"
          icon="🏠"
          color="green"
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${stats?.monthlyRevenue || 0}`}
          change="+8%"
          icon="💰"
          color="yellow"
        />
        <StatCard
          title="Pending Payments"
          value={stats?.pendingPayments || 0}
          change="-3%"
          icon="⏰"
          color="red"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.title}
              onClick={() => router.push(action.href)}
              className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className={`p-3 rounded-full ${action.color} text-white mb-2`}>
                <action.icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-gray-900">{action.title}</span>
              <span className="text-xs text-gray-500 text-center mt-1">{action.description}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <OccupancyChart data={stats?.occupancyData} />
        <RevenueChart data={stats?.revenueData} />
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PaymentOverview payments={stats?.recentPayments} />
        <PendingComplaints complaints={stats?.pendingComplaints} />
        <RecentActivities activities={stats?.recentActivities} />
      </div>
    </div>
  )
}