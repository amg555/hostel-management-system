// frontend/app/(dashboard)/admin/settings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import {
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  CurrencyRupeeIcon,
  HomeIcon,
  EnvelopeIcon,
  KeyIcon,
  Cog6ToothIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

// Schema definitions
const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phoneNumber: z.string().optional(),
  designation: z.string().optional()
})

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

const hostelSchema = z.object({
  hostelName: z.string().min(1, 'Hostel name is required'),
  address: z.string().min(1, 'Address is required'),
  totalRooms: z.number().min(1),
  totalCapacity: z.number().min(1),
  maintenanceCharge: z.number().min(0),
  securityDeposit: z.number().min(0),
  lateFeeCharge: z.number().min(0),
  checkInTime: z.string(),
  checkOutTime: z.string()
})

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  paymentReminders: z.boolean(),
  complaintUpdates: z.boolean(),
  maintenanceAlerts: z.boolean(),
  newStudentAlerts: z.boolean(),
  lowOccupancyAlerts: z.boolean()
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>
type HostelFormData = z.infer<typeof hostelSchema>
type NotificationFormData = z.infer<typeof notificationSchema>

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const { user, updateUser } = useAuthStore()

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      designation: user?.designation || ''
    }
  })

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  })

  // Hostel settings form
  const hostelForm = useForm<HostelFormData>({
    resolver: zodResolver(hostelSchema)
  })

  // Notification settings form
  const notificationForm = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema)
  })

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      setIsFetching(true)
      try {
        // Fetch hostel settings
        const hostelRes = await api.get('/settings?group=hostel')
        hostelForm.reset(hostelRes.data)

        // Fetch notification settings
        const notificationRes = await api.get('/settings?group=notifications')
        notificationForm.reset(notificationRes.data)
        
        // Populate profile form from authStore user
        if (user) {
          profileForm.reset({
            name: user.name || 'Admin User',
            email: user.email,
            phoneNumber: user.phoneNumber || '',
            designation: user.designation || 'Administrator'
          })
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
        toast.error('Failed to load settings')
      } finally {
        setIsFetching(false)
      }
    }

    fetchData()
  }, [user, hostelForm, notificationForm, profileForm])

  const handleProfileUpdate = async (data: ProfileFormData) => {
    setIsLoading(true)
    try {
      await api.put('/settings/profile', data)
      if (user) {
        updateUser({ ...user, ...data })
      }
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (data: PasswordFormData) => {
    setIsLoading(true)
    try {
      await api.post('/settings/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })
      toast.success('Password changed successfully')
      passwordForm.reset()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleHostelSettingsUpdate = async (data: HostelFormData) => {
    setIsLoading(true)
    try {
      await api.put('/settings?group=hostel', data)
      toast.success('Hostel settings updated successfully')
    } catch (error) {
      toast.error('Failed to update hostel settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationSettingsUpdate = async (data: NotificationFormData) => {
    setIsLoading(true)
    try {
      await api.put('/settings?group=notifications', data)
      toast.success('Notification settings updated successfully')
    } catch (error) {
      toast.error('Failed to update notification settings')
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserCircleIcon },
    { id: 'password', label: 'Password', icon: KeyIcon },
    { id: 'hostel', label: 'Hostel Settings', icon: HomeIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'fees', label: 'Fee Settings', icon: CurrencyRupeeIcon },
    { id: 'email', label: 'Email Templates', icon: EnvelopeIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'backup', label: 'Backup & Restore', icon: DocumentTextIcon }
  ]

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your application settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
                <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        {...profileForm.register('name')}
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      {profileForm.formState.errors.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {profileForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        {...profileForm.register('email')}
                        type="email"
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 bg-opacity-100"
                      />
                      {profileForm.formState.errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {profileForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        {...profileForm.register('phoneNumber')}
                        type="tel"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Designation</label>
                      <input
                        {...profileForm.register('designation')}
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Password Settings */}
            {activeTab === 'password' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Change Password</h2>
                <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Password</label>
                    <input
                      {...passwordForm.register('currentPassword')}
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {passwordForm.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <input
                      {...passwordForm.register('newPassword')}
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input
                      {...passwordForm.register('confirmPassword')}
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Hostel Settings */}
            {activeTab === 'hostel' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Hostel Settings</h2>
                <form onSubmit={hostelForm.handleSubmit(handleHostelSettingsUpdate)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Hostel Name</label>
                      <input
                        {...hostelForm.register('hostelName')}
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <textarea
                        {...hostelForm.register('address')}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Rooms</label>
                      <input
                        {...hostelForm.register('totalRooms', { valueAsNumber: true })}
                        type="number"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Capacity</label>
                      <input
                        {...hostelForm.register('totalCapacity', { valueAsNumber: true })}
                        type="number"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Check-in Time</label>
                      <input
                        {...hostelForm.register('checkInTime')}
                        type="time"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Check-out Time</label>
                      <input
                        {...hostelForm.register('checkOutTime')}
                        type="time"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-4">Fee Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Maintenance Charge (₹)
                        </label>
                        <input
                          {...hostelForm.register('maintenanceCharge', { valueAsNumber: true })}
                          type="number"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Security Deposit (₹)
                        </label>
                        <input
                          {...hostelForm.register('securityDeposit', { valueAsNumber: true })}
                          type="number"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Late Fee Charge (₹)
                        </label>
                        <input
                          {...hostelForm.register('lateFeeCharge', { valueAsNumber: true })}
                          type="number"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>
                <form onSubmit={notificationForm.handleSubmit(handleNotificationSettingsUpdate)} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Notification Channels</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          {...notificationForm.register('emailNotifications')}
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-3 text-sm">Email Notifications</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          {...notificationForm.register('smsNotifications')}
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-3 text-sm">SMS Notifications</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Notification Types</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          {...notificationForm.register('paymentReminders')}
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-3 text-sm">Payment Reminders</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          {...notificationForm.register('complaintUpdates')}
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-3 text-sm">Complaint Updates</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          {...notificationForm.register('maintenanceAlerts')}
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-3 text-sm">Maintenance Alerts</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          {...notificationForm.register('newStudentAlerts')}
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-3 text-sm">New Student Registration Alerts</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          {...notificationForm.register('lowOccupancyAlerts')}
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-3 text-sm">Low Occupancy Alerts</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Other tabs - placeholder content */}
            {['fees', 'email', 'security', 'backup'].includes(activeTab) && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6 capitalize">{activeTab} Settings</h2>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <Cog6ToothIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {activeTab === 'fees' && 'Configure fee structures, payment deadlines, and penalty settings.'}
                    {activeTab === 'email' && 'Customize email templates for various notifications.'}
                    {activeTab === 'security' && 'Manage security settings, two-factor authentication, and access controls.'}
                    {activeTab === 'backup' && 'Configure automatic backups and restore previous data.'}
                  </p>
                  <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    Coming Soon
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}