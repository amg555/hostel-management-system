// frontend/app/(dashboard)/student/movements/page.tsx
'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { format } from 'date-fns'
import { 
  ArrowRightIcon, 
  ArrowLeftIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  ChartBarIcon,
  HomeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import { MovementForm } from '@/components/student/MovementForm'
import { MovementHistory } from '@/components/student/MovementHistory'
import toast from 'react-hot-toast'

interface Movement {
  id: string
  studentId: string
  type: 'check_out' | 'check_in' | 'home_leave' | 'home_return'
  reason: string
  destination?: string
  checkOutTime?: string
  expectedReturnTime?: string
  checkInTime?: string
  actualReturnTime?: string
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'active'
  transportMode?: string
  emergencyContact?: string
  remarks?: string
  createdAt: string
  updatedAt: string
}

interface MovementStatus {
  status: 'in' | 'out'
  location: 'hostel' | 'home' | 'local_out'
  activeHomeLeave?: Movement
  lastMovement?: Movement
  studentId: string
}

export default function MovementsPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  // Fetch movement status
  const { data: statusData, isLoading: statusLoading, error: statusError } = useQuery<MovementStatus>({
    queryKey: ['movement-status'],
    queryFn: async () => {
      const response = await api.get('/movements/status')
      return response.data
    },
    retry: 1
  })

  // Fetch movement history
  const { data: movementsData, isLoading: movementsLoading } = useQuery({
    queryKey: ['my-movements'],
    queryFn: async () => {
      const response = await api.get('/movements/my-movements')
      return response.data
    },
    retry: 1
  })

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['movement-status'] })
    queryClient.invalidateQueries({ queryKey: ['my-movements'] })
    setShowForm(false)
    toast.success('Movement recorded successfully!')
  }

  const movements = movementsData?.movements || []
  const currentStatus = statusData?.status || 'in'
  const location = statusData?.location || 'hostel'
  const isLoading = statusLoading || movementsLoading

  // Calculate statistics
  const stats = {
    totalMovements: movements.length,
    checkOuts: movements.filter((m: Movement) => m.type === 'check_out').length,
    checkIns: movements.filter((m: Movement) => m.type === 'check_in').length,
    homeLeaves: movements.filter((m: Movement) => m.type === 'home_leave').length,
    homeReturns: movements.filter((m: Movement) => m.type === 'home_return').length,
    activeMovements: movements.filter((m: Movement) => m.status === 'active').length
  }

  const getActionButtonConfig = () => {
    if (location === 'home') {
      return {
        text: 'Return from Home',
        icon: HomeIcon,
        color: 'bg-green-600 hover:bg-green-700'
      }
    } else if (location === 'local_out') {
      return {
        text: 'Check In',
        icon: ArrowLeftIcon,
        color: 'bg-blue-600 hover:bg-blue-700'
      }
    } else {
      return {
        text: 'Record Movement',
        icon: ArrowRightIcon,
        color: 'bg-indigo-600 hover:bg-indigo-700'
      }
    }
  }

  const buttonConfig = getActionButtonConfig()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading movement data...</p>
        </div>
      </div>
    )
  }

  if (statusError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Failed to load movement data</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const getLocationConfig = () => {
    switch(location) {
      case 'home':
        return {
          bgColor: 'from-purple-50 to-purple-100 border-purple-200',
          iconColor: 'text-purple-600',
          textColor: 'text-purple-700',
          icon: HomeIcon,
          statusText: 'AT HOME'
        }
      case 'local_out':
        return {
          bgColor: 'from-yellow-50 to-orange-50 border-yellow-200',
          iconColor: 'text-yellow-600',
          textColor: 'text-yellow-700',
          icon: MapPinIcon,
          statusText: 'OUTSIDE (LOCAL)'
        }
      default:
        return {
          bgColor: 'from-green-50 to-emerald-50 border-green-200',
          iconColor: 'text-green-600',
          textColor: 'text-green-700',
          icon: CheckCircleIcon,
          statusText: 'IN HOSTEL'
        }
    }
  }

  const locationConfig = getLocationConfig()
  const StatusIcon = locationConfig.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Movement Records</h1>
            <p className="text-sm text-gray-500 mt-1">Track your check-in, check-out, and home leave history</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center px-4 py-2 rounded-lg text-white transition-all transform hover:scale-105 ${
              showForm 
                ? 'bg-gray-600 hover:bg-gray-700' 
                : buttonConfig.color
            }`}
          >
            {showForm ? (
              <>
                <XMarkIcon className="h-5 w-5 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <buttonConfig.icon className="h-5 w-5 mr-2" />
                {buttonConfig.text}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-center">
            <ChartBarIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.totalMovements}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-center">
            <ArrowRightIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">{stats.checkOuts}</p>
            <p className="text-xs text-gray-500">Check Outs</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-center">
            <ArrowLeftIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{stats.checkIns}</p>
            <p className="text-xs text-gray-500">Check Ins</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-center">
            <HomeIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">{stats.homeLeaves}</p>
            <p className="text-xs text-gray-500">Home Leaves</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-center">
            <HomeIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{stats.homeReturns}</p>
            <p className="text-xs text-gray-500">Returns</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-center">
            <ClockIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">{stats.activeMovements}</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
        </div>
      </div>

      {/* Current Status Card */}
      <div className={`relative overflow-hidden rounded-lg shadow-sm bg-gradient-to-r ${locationConfig.bgColor} border-2`}>
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <div className={`p-3 rounded-full bg-white bg-opacity-50`}>
                  <StatusIcon className={`h-8 w-8 ${locationConfig.iconColor}`} />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">Current Location</h2>
                  <p className={`text-2xl font-bold mt-1 ${locationConfig.textColor}`}>
                    {locationConfig.statusText}
                  </p>
                </div>
              </div>
              
              {(statusData?.activeHomeLeave || statusData?.lastMovement) && (
                <div className="mt-6 p-4 bg-white bg-opacity-70 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    {statusData?.activeHomeLeave ? 'Active Home Leave Details' : 'Last Movement Details'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {statusData?.activeHomeLeave && (
                      <>
                        <div className="flex items-center">
                          <span className="text-gray-500 min-w-[80px]">Destination:</span>
                          <span className="ml-2 font-medium">{statusData.activeHomeLeave.destination || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-500 min-w-[80px]">Transport:</span>
                          <span className="ml-2 font-medium capitalize">{statusData.activeHomeLeave.transportMode || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-500 min-w-[80px]">Left on:</span>
                          <span className="ml-2 font-medium">
                            {format(new Date(statusData.activeHomeLeave.checkOutTime || statusData.activeHomeLeave.createdAt), 'MMM dd, hh:mm a')}
                          </span>
                        </div>
                        {statusData.activeHomeLeave.expectedReturnTime && (
                          <div className="flex items-center">
                            <span className="text-gray-500 min-w-[80px]">Expected:</span>
                            <span className="ml-2 font-medium">
                              {format(new Date(statusData.activeHomeLeave.expectedReturnTime), 'MMM dd, hh:mm a')}
                            </span>
                          </div>
                        )}
                        <div className="md:col-span-2 flex items-start">
                          <span className="text-gray-500 min-w-[80px]">Reason:</span>
                          <span className="ml-2 font-medium">{statusData.activeHomeLeave.reason}</span>
                        </div>
                      </>
                    )}
                    
                    {!statusData?.activeHomeLeave && statusData?.lastMovement && (
                      <>
                        <div className="flex items-center">
                          <span className="text-gray-500 min-w-[80px]">Type:</span>
                          <span className="ml-2 font-medium">
                            {statusData.lastMovement.type.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-500 min-w-[80px]">Time:</span>
                          <span className="ml-2 font-medium">
                            {format(new Date(statusData.lastMovement.createdAt), 'MMM dd, hh:mm a')}
                          </span>
                        </div>
                        <div className="md:col-span-2 flex items-start">
                          <span className="text-gray-500 min-w-[80px]">Reason:</span>
                          <span className="ml-2 font-medium">{statusData.lastMovement.reason}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Movement Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">
            Record Movement
          </h3>
          <MovementForm 
            currentStatus={currentStatus}
            location={location}
            activeHomeLeave={statusData?.activeHomeLeave}
            onSuccess={handleFormSuccess}
          />
        </div>
      )}

      {/* Movement History */}
      <MovementHistory 
        movements={movements}
        isLoading={movementsLoading}
      />
    </div>
  )
}