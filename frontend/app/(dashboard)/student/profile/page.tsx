// frontend/app/(dashboard)/student/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import { 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  HomeIcon,
  AcademicCapIcon,
  IdentificationIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  CameraIcon
} from '@heroicons/react/24/outline'

const profileSchema = z.object({
  phone: z.string()
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')
    .transform(val => val.replace(/\D/g, '')),
  alternatePhone: z.string()
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')
    .or(z.literal(''))
    .optional()
    .transform(val => val ? val.replace(/\D/g, '') : val),
  currentAddress: z.string().optional(),
  guardianPhone: z.string()
    .regex(/^\d{10}$/, 'Guardian phone must be exactly 10 digits')
    .or(z.literal(''))
    .optional()
    .transform(val => val ? val.replace(/\D/g, '') : val),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function StudentProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('personal')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  })

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 10) {
      e.target.value = value
    } else {
      e.target.value = value.slice(0, 10)
    }
  }

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/students/profile')
      setProfileData(response.data)
      
      reset({
        phone: response.data.phone || '',
        alternatePhone: response.data.alternatePhone || '',
        currentAddress: response.data.currentAddress || '',
        guardianPhone: response.data.guardianPhone || '',
      })
      
      if (response.data.profilePicture) {
        setProfileImage(response.data.profilePicture)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSaving(true)
      
      const cleanedData = {
        ...data,
        phone: data.phone?.replace(/\D/g, ''),
        alternatePhone: data.alternatePhone?.replace(/\D/g, ''),
        guardianPhone: data.guardianPhone?.replace(/\D/g, '')
      }
      
      const response = await api.put('/students/profile', cleanedData)
      
      setProfileData({
        ...profileData,
        ...cleanedData
      })
      
      if (user) {
        updateUser({
          ...user,
          studentProfile: {
            ...user.studentProfile,
            ...cleanedData
          }
        })
      }
      
      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    reset({
      phone: profileData?.phone || '',
      alternatePhone: profileData?.alternatePhone || '',
      currentAddress: profileData?.currentAddress || '',
      guardianPhone: profileData?.guardianPhone || '',
    })
    setIsEditing(false)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    const formData = new FormData()
    formData.append('profilePicture', file)

    try {
      const response = await api.post('/students/upload-profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      setProfileImage(response.data.profilePicture)
      toast.success('Profile picture updated')
      fetchProfile()
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload profile picture')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load profile data</p>
      </div>
    )
  }

  // Mobile tabs for better organization
  const tabs = [
    { id: 'personal', label: 'Personal', icon: UserIcon },
    { id: 'contact', label: 'Contact', icon: PhoneIcon },
    { id: 'academic', label: 'Academic', icon: AcademicCapIcon },
    { id: 'hostel', label: 'Hostel', icon: HomeIcon },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header Section - Mobile Responsive */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white p-1">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                      <UserIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 sm:p-2 shadow-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <CameraIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
              
              {/* Basic Info */}
              <div className="text-white text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold">{profileData.fullName}</h1>
                <p className="text-blue-100 text-sm">Student ID: {profileData.studentId}</p>
                <p className="text-blue-100 text-sm">Roll Number: {profileData.rollNumber}</p>
              </div>
            </div>
            
            {/* Edit Button - Mobile Responsive */}
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm sm:text-base"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-white text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Cancel</span>
                  </button>
                  <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSaving || !isDirty}
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <CheckIcon className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="lg:hidden border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Profile Content - Mobile Responsive */}
        <form className="p-4 sm:p-6 space-y-6">
          {/* Desktop view - All sections visible */}
          <div className="hidden lg:block space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-gray-400" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="text"
                    value={profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'Not provided'}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <input
                    type="text"
                    value={profileData.gender || 'Not specified'}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 capitalize"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={profileData.bloodGroup || 'Not provided'}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PhoneIcon className="w-5 h-5 mr-2 text-gray-400" />
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number {isEditing && '*'}
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    maxLength={10}
                    pattern="\d{10}"
                    onInput={handlePhoneInput}
                    placeholder="9876543210"
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isEditing 
                        ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                        : 'border-gray-300 bg-gray-50 text-gray-500'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alternate Phone
                  </label>
                  <input
                    {...register('alternatePhone')}
                    type="tel"
                    maxLength={10}
                    pattern="\d{10}"
                    onInput={handlePhoneInput}
                    placeholder="9876543210"
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isEditing 
                        ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                        : 'border-gray-300 bg-gray-50 text-gray-500'
                    }`}
                  />
                  {errors.alternatePhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.alternatePhone.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile view - Tab-based sections */}
          <div className="lg:hidden">
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <h2 className="text-base font-semibold text-gray-900 flex items-center">
                  <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                  Personal Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profileData.fullName}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="text"
                      value={profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'Not provided'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                    <input
                      type="text"
                      value={profileData.gender || 'Not specified'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 capitalize text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Blood Group</label>
                    <input
                      type="text"
                      value={profileData.bloodGroup || 'Not provided'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-4">
                <h2 className="text-base font-semibold text-gray-900 flex items-center">
                  <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                  Contact Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Phone Number {isEditing && '*'}
                    </label>
                    <input
                      {...register('phone')}
                      type="tel"
                      maxLength={10}
                      pattern="\d{10}"
                      onInput={handlePhoneInput}
                      placeholder="9876543210"
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${
                        isEditing 
                          ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                          : 'border-gray-300 bg-gray-50 text-gray-500'
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Alternate Phone
                    </label>
                    <input
                      {...register('alternatePhone')}
                      type="tel"
                      maxLength={10}
                      pattern="\d{10}"
                      onInput={handlePhoneInput}
                      placeholder="9876543210"
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${
                        isEditing 
                          ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                          : 'border-gray-300 bg-gray-50 text-gray-500'
                      }`}
                    />
                    {errors.alternatePhone && (
                      <p className="mt-1 text-xs text-red-600">{errors.alternatePhone.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Guardian Phone
                    </label>
                    <input
                      {...register('guardianPhone')}
                      type="tel"
                      maxLength={10}
                      pattern="\d{10}"
                      onInput={handlePhoneInput}
                      placeholder="9876543210"
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${
                        isEditing 
                          ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                          : 'border-gray-300 bg-gray-50 text-gray-500'
                      }`}
                    />
                    {errors.guardianPhone && (
                      <p className="mt-1 text-xs text-red-600">{errors.guardianPhone.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Guardian Name</label>
                    <input
                      type="text"
                      value={profileData.guardianName || 'Not provided'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'academic' && (
              <div className="space-y-4">
                <h2 className="text-base font-semibold text-gray-900 flex items-center">
                  <AcademicCapIcon className="w-4 h-4 mr-2 text-gray-400" />
                  Academic Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">College Name</label>
                    <input
                      type="text"
                      value={profileData.collegeName || 'Not provided'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Course</label>
                    <input
                      type="text"
                      value={profileData.course || 'Not provided'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={profileData.department || 'Not provided'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Academic Year</label>
                    <input
                      type="text"
                      value={profileData.academicYear || 'Not provided'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hostel' && (
              <div className="space-y-4">
                <h2 className="text-base font-semibold text-gray-900 flex items-center">
                  <HomeIcon className="w-4 h-4 mr-2 text-gray-400" />
                  Hostel Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Room Number</label>
                    <input
                      type="text"
                      value={profileData.roomDetails?.roomNumber || profileData.room?.roomNumber || 'Not Assigned'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Floor</label>
                    <input
                      type="text"
                      value={profileData.roomDetails?.floor || profileData.room?.floor || '-'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Monthly Rent</label>
                    <input
                      type="text"
                      value={
                        profileData.roomDetails?.rentAmount 
                          ? `₹${profileData.roomDetails.rentAmount}` 
                          : profileData.room?.monthlyRent 
                            ? `₹${profileData.room.monthlyRent}` 
                            : '-'
                      }
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Admission Date</label>
                    <input
                      type="text"
                      value={profileData.admissionDate ? new Date(profileData.admissionDate).toLocaleDateString() : 'Not provided'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      profileData.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {profileData.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}