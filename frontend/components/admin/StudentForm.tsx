import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { EyeIcon, EyeSlashIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Updated schema with custom rent amount
const studentSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string()
    .regex(/^\d{10,}$/, 'Phone number must be at least 10 digits and contain only numbers'),
  alternatePhone: z.string()
    .regex(/^\d{10,}$/, 'Phone number must be at least 10 digits and contain only numbers')
    .or(z.string().length(0))
    .optional(),
  dateOfBirth: z.string(),
  gender: z.enum(['male', 'female', 'other']),
  permanentAddress: z.string().min(1, 'Address is required'),
  currentAddress: z.string().optional(),
  guardianName: z.string().min(1, 'Guardian name is required'),
  guardianPhone: z.string()
    .regex(/^\d{10,}$/, 'Guardian phone must be at least 10 digits and contain only numbers'),
  guardianRelation: z.string().min(1, 'Guardian relationship is required'),
  bloodGroup: z.string(),
  collegeName: z.string(),
  course: z.string(),
  academicYear: z.string(),
  roomId: z.string().optional(),
  admissionDate: z.string(),
  rollNumber: z.string().min(1, 'Enroll number is required'),
  department: z.string(),
  customRentAmount: z.string().optional()
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  onSubmit: (data: StudentFormData) => Promise<any>;
  initialData?: Partial<StudentFormData>;
  isLoading?: boolean;
}

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: {
    email: string;
    password: string;
    studentId: string;
    name: string;
  };
}

const CredentialsModal: React.FC<CredentialsModalProps> = ({ isOpen, onClose, credentials }) => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(true);
  const [emailSent, setEmailSent] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const sendCredentialsByEmail = async () => {
    try {
      await api.post('/students/send-credentials', {
        email: credentials.email,
        studentId: credentials.studentId,
        password: credentials.password,
        name: credentials.name
      });
      setEmailSent(true);
      toast.success('Credentials sent to student email');
    } catch (error) {
      toast.error('Failed to send credentials');
    }
  };

  const handleClose = () => {
    onClose();
    router.push('/admin/students');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Student Account Created Successfully!</h3>
          <p className="text-sm text-gray-600 mt-1">
            Please save these credentials and share them with the student.
          </p>
        </div>

        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <label className="text-sm font-medium text-gray-700">Student ID</label>
            <div className="flex items-center mt-1">
              <input
                type="text"
                value={credentials.studentId}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
              />
              <button
                onClick={() => copyToClipboard(credentials.studentId, 'Student ID')}
                className="ml-2 p-2 text-gray-500 hover:text-gray-700"
              >
                <ClipboardDocumentIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email (Username)</label>
            <div className="flex items-center mt-1">
              <input
                type="text"
                value={credentials.email}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
              />
              <button
                onClick={() => copyToClipboard(credentials.email, 'Email')}
                className="ml-2 p-2 text-gray-500 hover:text-gray-700"
              >
                <ClipboardDocumentIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Temporary Password</label>
            <div className="flex items-center mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 p-2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
              <button
                onClick={() => copyToClipboard(credentials.password, 'Password')}
                className="ml-2 p-2 text-gray-500 hover:text-gray-700"
              >
                <ClipboardDocumentIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-amber-600 mt-1">
              * The student will be required to change this password on first login
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={sendCredentialsByEmail}
            disabled={emailSent}
            className={`w-full px-4 py-2 rounded-md font-medium ${
              emailSent
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {emailSent ? '✓ Credentials Sent to Student Email' : 'Send Credentials to Student Email'}
          </button>
          
          <button
            onClick={handleClose}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Close & View Students
          </button>
        </div>
      </div>
    </div>
  );
};

export const StudentForm: React.FC<StudentFormProps> = ({ 
  onSubmit, 
  initialData, 
  isLoading 
}) => {
  const router = useRouter();
  const [showCredentials, setShowCredentials] = useState(false);
  const [newCredentials, setNewCredentials] = useState<any>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  const { data: rooms } = useQuery({
    queryKey: ['available-rooms'],
    queryFn: async () => {
      const response = await api.get('/rooms/available');
      return response.data;
    }
  });

  // Ensure all fields have default values to prevent uncontrolled component warnings
  const defaultValues = {
    fullName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    dateOfBirth: '',
    gender: 'male' as const,
    permanentAddress: '',
    currentAddress: '',
    guardianName: '',
    guardianPhone: '',
    guardianRelation: '',
    bloodGroup: '',
    collegeName: '',
    course: '',
    academicYear: '',
    roomId: '',
    admissionDate: '',
    rollNumber: '',
    department: '',
    customRentAmount: '',
    ...initialData // Override with initial data if provided
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues
  });

  const watchedRoomId = watch('roomId');

  // Update selected room when room selection changes
  useEffect(() => {
    if (watchedRoomId && rooms) {
      const room = rooms.find((r: any) => r.id === watchedRoomId);
      setSelectedRoom(room);
      if (!watch('customRentAmount')) {
        setValue('customRentAmount', room?.monthlyRent?.toString() || '');
      }
    } else {
      setSelectedRoom(null);
    }
  }, [watchedRoomId, rooms]);

  // Handle phone number input - only allow digits
  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof StudentFormData) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove all non-digits
    setValue(fieldName, value);
  };

  const handleFormSubmit = async (data: StudentFormData) => {
    try {
      const result = await onSubmit(data);
      if (result?.credentials) {
        setNewCredentials(result.credentials);
        setShowCredentials(true);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleCancel = () => {
    router.push('/admin/students');
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name *</label>
            <input
              {...register('fullName')}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Enroll Number *</label>
            <input
              {...register('rollNumber')}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.rollNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.rollNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email *</label>
            <input
              {...register('email')}
              type="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone * (10 digits)</label>
            <input
              {...register('phone')}
              type="tel"
              onChange={(e) => handlePhoneInput(e, 'phone')}
              placeholder="Enter 10 digit phone number"
              maxLength={10}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Alternate Phone</label>
            <input
              {...register('alternatePhone')}
              type="tel"
              onChange={(e) => handlePhoneInput(e, 'alternatePhone')}
              placeholder="Enter 10 digit phone number"
              maxLength={10}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.alternatePhone && (
              <p className="mt-1 text-sm text-red-600">{errors.alternatePhone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
            <input
              {...register('dateOfBirth')}
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.dateOfBirth && (
              <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Gender *</label>
            <select
              {...register('gender')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Blood Group</label>
            <select
              {...register('bloodGroup')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          {/* Guardian Information */}
          <div className="col-span-2 mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Guardian Information</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Guardian Name *</label>
            <input
              {...register('guardianName')}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.guardianName && (
              <p className="mt-1 text-sm text-red-600">{errors.guardianName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Guardian Phone * (10 digits)</label>
            <input
              {...register('guardianPhone')}
              type="tel"
              onChange={(e) => handlePhoneInput(e, 'guardianPhone')}
              placeholder="Enter 10 digit phone number"
              maxLength={10}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.guardianPhone && (
              <p className="mt-1 text-sm text-red-600">{errors.guardianPhone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Relation *</label>
            <input
              {...register('guardianRelation')}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Academic Information */}
          <div className="col-span-2 mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Information</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">College Name</label>
            <input
              {...register('collegeName')}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Course</label>
            <input
              {...register('course')}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <input
              {...register('department')}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.department && (
              <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Academic Year</label>
            <input
              {...register('academicYear')}
              type="text"
              placeholder="e.g., 2024-2025"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Hostel Information */}
          <div className="col-span-2 mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Hostel Information</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Room</label>
            <select
              {...register('roomId')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select Room</option>
              {rooms?.map((room: any) => (
                <option key={room.id} value={room.id}>
                  {room.roomNumber} - {room.type} (Available: {room.capacity - room.currentOccupancy}) - ₹{room.monthlyRent}/month
                </option>
              ))}
            </select>
            {selectedRoom && (
              <p className="mt-1 text-sm text-gray-600">
                Default Room Rent: ₹{selectedRoom.monthlyRent}/month
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Custom Monthly Rent Amount (₹)
            </label>
            <input
              {...register('customRentAmount')}
              type="number"
              step="0.01"
              placeholder="Leave blank to use room's default rent"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Override the room's default rent for this student
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Admission Date *</label>
            <input
              {...register('admissionDate')}
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.admissionDate && (
              <p className="mt-1 text-sm text-red-600">{errors.admissionDate.message}</p>
            )}
          </div>

          {/* Addresses */}
          <div className="col-span-2 mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Permanent Address *</label>
            <textarea
              {...register('permanentAddress')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.permanentAddress && (
              <p className="mt-1 text-sm text-red-600">{errors.permanentAddress.message}</p>
            )}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Current Address</label>
            <textarea
              {...register('currentAddress')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : (initialData ? 'Update Student' : 'Create Student Account')}
          </button>
        </div>
      </form>

      {/* Credentials Modal */}
      <CredentialsModal
        isOpen={showCredentials}
        onClose={() => {
          setShowCredentials(false);
          setNewCredentials(null);
        }}
        credentials={newCredentials}
      />
    </>
  );
};