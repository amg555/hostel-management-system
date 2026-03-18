// frontend/components/student/ComplaintForm.tsx
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { COMPLAINT_CATEGORIES } from '@/lib/constants'
import { 
  ExclamationTriangleIcon,
  PaperClipIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline'

const complaintSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  subject: z.string().min(3, 'Subject is required'),
  description: z.string().min(10, 'Description must be at least 10 characters')
})

type ComplaintFormData = z.infer<typeof complaintSchema>

interface ComplaintFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({ onSuccess, onCancel }) => {
  const [attachments, setAttachments] = useState<File[]>([])
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      priority: 'medium'
    }
  })

  const priority = watch('priority')

  const onSubmit = async (data: ComplaintFormData) => {
    try {
      const formData = new FormData()
      Object.keys(data).forEach(key => {
        formData.append(key, data[key as keyof ComplaintFormData])
      })
      
      attachments.forEach(file => {
        formData.append('attachments', file)
      })

      await api.post('/complaints', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      toast.success('Complaint registered successfully')
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to register complaint')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Priority Indicator - Mobile Responsive */}
      <div className={`p-3 rounded-lg border ${getPriorityColor(priority)} sm:hidden`}>
        <div className="flex items-center gap-2">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <span className="text-xs font-medium">Priority: {priority.toUpperCase()}</span>
        </div>
      </div>

      {/* Form Fields - Mobile Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            {...register('category')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="">Select Category</option>
            {COMPLAINT_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Priority *
          </label>
          <select
            {...register('priority')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="low">Low - Can wait</option>
            <option value="medium">Medium - Soon</option>
            <option value="high">High - ASAP</option>
            <option value="urgent">Urgent - Immediate</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          Subject *
        </label>
        <input
          {...register('subject')}
          type="text"
          placeholder="Brief title of your complaint"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
        />
        {errors.subject && (
          <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          {...register('description')}
          rows={4}
          placeholder="Describe your issue in detail..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* File Attachments - Mobile Responsive */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          Attachments (Optional)
        </label>
        <div className="mt-1">
          <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-indigo-400 transition-colors">
            <PaperClipIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Click to attach files</span>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,.pdf"
            />
          </label>
        </div>
        
        {attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs sm:text-sm">
                <span className="truncate flex-1">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons - Mobile Responsive */}
      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto flex-1 sm:flex-initial bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Complaint'
          )}
        </button>
      </div>
    </form>
  )
}