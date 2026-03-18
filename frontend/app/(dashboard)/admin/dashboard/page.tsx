// app/(dashboard)/admin/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { StatCard } from '@/components/common/StatCard'
import { OccupancyChart } from '@/components/admin/OccupancyChart'
import { RevenueChart } from '@/components/admin/RevenueChart'
import { RecentActivities } from '@/components/admin/RecentActivities'
import { PendingComplaints } from '@/components/admin/PendingComplaints'
import { PaymentOverview } from '@/components/admin/PaymentOverview'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchDashboardStats()
  }, [])
  
  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back! Here's what's happening in your hostel today.
        </p>
      </div>
      
      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          change="+12% from last month"
          trend="up"
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Occupancy Rate"
          value={`${stats?.occupancyRate || 0}%`}
          change="+5% from last month"
          trend="up"
          icon="🏠"
          color="green"
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${stats?.monthlyRevenue?.toLocaleString() || 0}`}
          change="+8% from last month"
          trend="up"
          icon="💰"
          color="yellow"
        />
        <StatCard
          title="Pending Payments"
          value={stats?.pendingPayments || 0}
          change="-3% from last month"
          trend="down"
          icon="⏰"
          color="red"
        />
      </div>
      
      {/* Charts - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Occupancy Trends</h2>
          <OccupancyChart data={stats?.occupancyData} />
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h2>
          <RevenueChart data={stats?.revenueData} />
        </div>
      </div>
      
      {/* Bottom Section - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h2>
            <PaymentOverview payments={stats?.recentPayments} />
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Complaints</h2>
            <PendingComplaints complaints={stats?.pendingComplaints} />
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
            <RecentActivities activities={stats?.recentActivities} />
          </div>
        </div>
      </div>
    </div>
  )
}