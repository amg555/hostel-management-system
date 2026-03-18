// frontend/app/(dashboard)/student/settings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { 
  KeyIcon, 
  UserIcon, 
  EnvelopeIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/stores/authStore'
import { useRouter, useSearchParams } from 'next/navigation'

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type PasswordForm = z.infer<typeof passwordSchema>

export default function StudentSettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, updateUser } = useAuthStore()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordChangeSection, setPasswordChangeSection] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema)
  })

  // Check if we need to show password change on mount
  useEffect(() => {
    const changePassword = searchParams.get('changePassword')
    if (changePassword === 'true' || user?.requirePasswordChange === true) {
      setPasswordChangeSection(true)
      // Scroll to password section
      setTimeout(() => {
        document.getElementById('password-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [searchParams, user])

  // Watch password for strength indicator
  const watchPassword = watch('newPassword')

  const calculatePasswordStrength = (password: string) => {
    if (!password) return 0
    let strength = 0
    if (password.length >= 8) strength++
    if (password.match(/[a-z]+/)) strength++
    if (password.match(/[A-Z]+/)) strength++
    if (password.match(/[0-9]+/)) strength++
    if (password.match(/[^A-Za-z0-9]+/)) strength++
    return strength
  }

  const onPasswordSubmit = async (data: PasswordForm) => {
    setIsChangingPassword(true)
    try {
      await api.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })
      
      // Update user to remove requirePasswordChange flag
      if (user?.requirePasswordChange) {
        const updatedUser = { ...user, requirePasswordChange: false }
        updateUser(updatedUser)
      }
      
      toast.success('Password changed successfully!', {
        icon: '✅',
        duration: 4000
      })
      
      reset()
      setPasswordChangeSection(false)
      
      // If this was a required password change, redirect to dashboard
      if (user?.requirePasswordChange) {
        setTimeout(() => {
          router.replace('/student/dashboard')
        }, 1500)
      }
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const sendPasswordResetEmail = async () => {
    try {
      await api.post('/auth/forgot-password', {
        email: user?.email
      })
      toast.success('Password reset link sent to your email')
    } catch (error) {
      toast.error('Failed to send reset email')
    }
  }

  const getPasswordStrengthColor = () => {
    const strength = calculatePasswordStrength(watchPassword)
    if (strength <= 2) return 'bg-red-500'
    if (strength <= 3) return 'bg-yellow-500'
    if (strength <= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    const strength = calculatePasswordStrength(watchPassword)
    if (strength <= 2) return 'Weak'
    if (strength <= 3) return 'Fair'
    if (strength <= 4) return 'Good'
    return 'Strong'
  }

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'N/A'
    try {
      return new Date(date).toLocaleString()
    } catch {
      return 'N/A'
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account security and preferences</p>
      </div>

      {/* Critical Alert for Password Change */}
      {user?.requirePasswordChange === true && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900">Security Alert: Password Change Required</h3>
              <p className="text-sm text-red-700 mt-1">
                You are using a temporary password. For your account security, you must change your password immediately.
              </p>
              <button
                onClick={() => {
                  setPasswordChangeSection(true)
                  document.getElementById('password-section')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                Change Password Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center mb-4">
          <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Name</label>
            <p className="mt-1 text-sm text-gray-900">{user?.studentProfile?.fullName || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Student ID</label>
            <p className="mt-1 text-sm text-gray-900">{user?.studentProfile?.studentId || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="mt-1 text-sm text-gray-900">{user?.email || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Phone</label>
            <p className="mt-1 text-sm text-gray-900">{user?.studentProfile?.phone || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Roll Number</label>
            <p className="mt-1 text-sm text-gray-900">{user?.studentProfile?.rollNumber || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Room Number</label>
            <p className="mt-1 text-sm text-gray-900">{user?.studentProfile?.room?.roomNumber || 'Not Assigned'}</p>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div id="password-section" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center mb-4">
          <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Security</h2>
        </div>

        {/* First Login Alert */}
        {user?.requirePasswordChange === true && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-900">Password Change Required</p>
              <p className="text-sm text-amber-700 mt-1">
                You must change your password from the temporary one provided by the administrator.
              </p>
            </div>
          </div>
        )}

        {/* Password Change Form */}
        {(passwordChangeSection || user?.requirePasswordChange) ? (
          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  {...register('currentPassword')}
                  type={showCurrentPassword ? 'text' : 'password'}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showCurrentPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  {...register('newPassword')}
                  type={showNewPassword ? 'text' : 'password'}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {watchPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Password Strength:</span>
                    <span className={`text-xs font-medium ${
                      calculatePasswordStrength(watchPassword) <= 2 ? 'text-red-600' :
                      calculatePasswordStrength(watchPassword) <= 3 ? 'text-yellow-600' :
                      calculatePasswordStrength(watchPassword) <= 4 ? 'text-blue-600' :
                      'text-green-600'
                    }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                      style={{ width: `${(calculatePasswordStrength(watchPassword) / 5) * 100}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Password must contain:
                    <ul className="list-disc list-inside mt-1">
                      <li className={watchPassword?.length >= 8 ? 'text-green-600' : ''}>At least 8 characters</li>
                      <li className={watchPassword?.match(/[A-Z]/) ? 'text-green-600' : ''}>One uppercase letter</li>
                      <li className={watchPassword?.match(/[a-z]/) ? 'text-green-600' : ''}>One lowercase letter</li>
                      <li className={watchPassword?.match(/[0-9]/) ? 'text-green-600' : ''}>One number</li>
                      <li className={watchPassword?.match(/[^A-Za-z0-9]/) ? 'text-green-600' : ''}>One special character</li>
                    </ul>
                  </div>
                </div>
              )}
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-4">
              {!user?.requirePasswordChange && (
                <button
                  type="button"
                  onClick={() => {
                    reset()
                    setPasswordChangeSection(false)
                  }}
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                  Cancel
                </button>
              )}
              
              <button
                type="submit"
                disabled={isChangingPassword}
                className={`px-4 py-2 ${user?.requirePasswordChange ? 'w-full' : ''} bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium`}
              >
                {isChangingPassword ? 'Changing Password...' : 'Change Password'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Your account is secure</p>
              <p className="text-xs text-gray-500 mt-1">Last password change: {formatDate(user?.updatedAt)}</p>
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={sendPasswordResetEmail}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Send password reset link to email
              </button>
              
              <button
                onClick={() => setPasswordChangeSection(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Change Password
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Login History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <KeyIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Account Activity</h2>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-900">Last Login</p>
              <p className="text-xs text-gray-500">{formatDate(user?.lastLogin)}</p>
            </div>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-900">Account Created</p>
              <p className="text-xs text-gray-500">{formatDate(user?.createdAt)}</p>
            </div>
          </div>
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">Account Status</p>
              <p className="text-xs text-gray-500">
                {user?.isActive ? (
                  <span className="text-green-600">Active</span>
                ) : (
                  <span className="text-red-600">Inactive</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}