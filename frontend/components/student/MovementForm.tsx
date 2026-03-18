// frontend/components/student/MovementForm.tsx
import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  ArrowRightIcon, 
  ArrowLeftIcon,
  CalendarIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  HomeIcon,
  PhoneIcon,
  TruckIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const movementSchema = z.object({
  type: z.enum(['check_in', 'check_out', 'home_leave', 'home_return']),
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
  expectedReturnTime: z.string().optional(),
  destination: z.string().optional(),
  emergencyContact: z.string().optional(),
  transportMode: z.enum(['bus', 'train', 'flight', 'car', 'other', '']).optional(),
  remarks: z.string().optional()
});

type MovementFormData = z.infer<typeof movementSchema>;

interface MovementFormProps {
  onSuccess?: () => void;
  currentStatus?: 'in' | 'out';
  location?: 'hostel' | 'home' | 'local_out';
  activeHomeLeave?: any;
}

export const MovementForm: React.FC<MovementFormProps> = ({ 
  onSuccess,
  currentStatus = 'in',
  location = 'hostel',
  activeHomeLeave
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      type: 'check_out',
      reason: '',
      expectedReturnTime: '',
      destination: '',
      emergencyContact: '',
      transportMode: '',
      remarks: ''
    }
  });

  const movementType = watch('type');

  // Use useMemo to calculate available movement types
  const availableTypes = useMemo(() => {
    if (location === 'home') {
      return [{ value: 'home_return', label: 'Return from Home', icon: HomeIcon }];
    } else if (location === 'local_out') {
      return [{ value: 'check_in', label: 'Check In', icon: ArrowLeftIcon }];
    } else {
      // When in hostel, both options should be available
      return [
        { value: 'check_out', label: 'Local Out', icon: ArrowRightIcon },
        { value: 'home_leave', label: 'Leave to Home', icon: HomeIcon }
      ];
    }
  }, [location]);

  // Set the initial movement type based on location
  useEffect(() => {
    if (availableTypes.length > 0) {
      const currentType = watch('type');
      const isCurrentTypeAvailable = availableTypes.some(t => t.value === currentType);
      
      // Only change if current type is not available in the new location
      if (!isCurrentTypeAvailable) {
        setValue('type', availableTypes[0].value as any);
      }
    }
  }, [location]); // Only depend on location changes

  const onSubmit = async (data: MovementFormData) => {
    try {
      const submitData: any = {
        type: data.type,
        reason: data.reason
      };

      if (data.type === 'home_leave') {
        if (!data.destination) {
          toast.error('Destination is required for home leave');
          return;
        }
        submitData.destination = data.destination;
        submitData.emergencyContact = data.emergencyContact;
        submitData.transportMode = data.transportMode || null;
        if (data.expectedReturnTime) {
          submitData.expectedReturnTime = new Date(data.expectedReturnTime).toISOString();
        }
      } else if (data.type === 'check_out' && data.expectedReturnTime) {
        submitData.expectedReturnTime = new Date(data.expectedReturnTime).toISOString();
      }

      if (data.remarks) {
        submitData.remarks = data.remarks;
      }

      const response = await api.post('/movements', submitData);
      toast.success(response.data.message || 'Movement recorded successfully');
      
      reset();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to record movement');
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  const getStatusColor = () => {
    if (location === 'home') return 'from-purple-50 to-purple-100 border-purple-200';
    if (location === 'local_out') return 'from-yellow-50 to-orange-50 border-yellow-200';
    return 'from-green-50 to-emerald-50 border-green-200';
  };

  const getStatusText = () => {
    if (location === 'home') return 'AT HOME';
    if (location === 'local_out') return 'OUTSIDE (LOCAL)';
    return 'IN HOSTEL';
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Status Indicator */}
      <div className={`relative overflow-hidden rounded-lg p-4 bg-gradient-to-r ${getStatusColor()} border-2`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Current Location</p>
            <p className="text-xl font-bold mt-1 text-gray-800">
              {getStatusText()}
            </p>
            {activeHomeLeave && (
              <p className="text-xs text-gray-500 mt-1">
                Left on: {new Date(activeHomeLeave.checkOutTime).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="p-3 rounded-full bg-white bg-opacity-50">
            {location === 'home' ? (
              <HomeIcon className="h-6 w-6 text-purple-600" />
            ) : location === 'local_out' ? (
              <MapPinIcon className="h-6 w-6 text-yellow-600" />
            ) : (
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            )}
          </div>
        </div>
      </div>

      {/* Movement Type Selection - Only show if more than one option */}
      {availableTypes.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Movement Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 gap-3">
            {availableTypes.map((type) => {
              const Icon = type.icon;
              return (
                <label
                  key={type.value}
                  className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all ${
                    movementType === type.value 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                      : 'border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    {...register('type')}
                    value={type.value}
                    className="sr-only"
                  />
                  <div className="flex items-center flex-1">
                    <Icon className={`h-5 w-5 mr-3 ${
                      movementType === type.value ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <div>
                      <span className={`font-medium ${
                        movementType === type.value ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {type.label}
                      </span>
                      {type.value === 'home_leave' && (
                        <p className="text-xs text-gray-500 mt-1">
                          For extended leave to go home or hometown
                        </p>
                      )}
                      {type.value === 'check_out' && (
                        <p className="text-xs text-gray-500 mt-1">
                          For short local outings within the city
                        </p>
                      )}
                    </div>
                  </div>
                  {movementType === type.value && (
                    <CheckCircleIcon className="h-5 w-5 text-blue-600 ml-2" />
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Single option display */}
      {availableTypes.length === 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
            <p className="text-sm text-blue-800">
              You will record: <strong>{availableTypes[0].label}</strong>
            </p>
          </div>
          <input type="hidden" {...register('type')} value={availableTypes[0].value} />
        </div>
      )}

      {/* Reason Field */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <DocumentTextIcon className="h-4 w-4 mr-2" />
          Reason <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          {...register('reason')}
          rows={3}
          className={`w-full rounded-lg border ${
            errors.reason ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
          } shadow-sm focus:border-indigo-500`}
          placeholder={
            movementType === 'home_leave' 
              ? 'Reason for going home (e.g., Family function, Medical emergency, Vacation, Festival)'
              : movementType === 'home_return'
              ? 'Any remarks about your return'
              : movementType === 'check_out'
              ? 'Where are you going? (e.g., Shopping, Movie, Restaurant, etc.)'
              : 'Remarks for checking in'
          }
        />
        {errors.reason && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
            {errors.reason.message}
          </p>
        )}
      </div>

      {/* Home Leave Specific Fields */}
      {movementType === 'home_leave' && (
        <>
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MapPinIcon className="h-4 w-4 mr-2" />
              Destination <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              {...register('destination')}
              type="text"
              className={`w-full rounded-lg border ${
                errors.destination ? 'border-red-300' : 'border-gray-300'
              } shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
              placeholder="City/Town you're traveling to (e.g., Mumbai, Delhi, etc.)"
            />
            {errors.destination && (
              <p className="mt-1 text-sm text-red-600">Destination is required</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <TruckIcon className="h-4 w-4 mr-2" />
                Mode of Transport
              </label>
              <select
                {...register('transportMode')}
                className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select transport mode</option>
                <option value="bus">Bus</option>
                <option value="train">Train</option>
                <option value="flight">Flight</option>
                <option value="car">Private Car</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <PhoneIcon className="h-4 w-4 mr-2" />
                Emergency Contact
              </label>
              <input
                {...register('emergencyContact')}
                type="tel"
                className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Contact during leave (optional)"
              />
            </div>
          </div>
        </>
      )}

      {/* Expected Return Time */}
      {(movementType === 'check_out' || movementType === 'home_leave') && (
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Expected Return Time
            {movementType === 'home_leave' && <span className="text-red-500 ml-1">*</span>}
            {movementType === 'check_out' && <span className="text-gray-400 text-xs ml-2">(Optional)</span>}
          </label>
          <input
            {...register('expectedReturnTime')}
            type="datetime-local"
            min={getMinDateTime()}
            className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            {movementType === 'home_leave' 
              ? 'Please provide expected return date and time'
              : 'Leave empty if returning today'}
          </p>
        </div>
      )}

      {/* Additional Remarks */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <DocumentTextIcon className="h-4 w-4 mr-2" />
          Additional Remarks
          <span className="text-gray-400 text-xs ml-2">(Optional)</span>
        </label>
        <textarea
          {...register('remarks')}
          rows={2}
          className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Any additional information you want to add..."
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          movementType === 'home_leave'
            ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:ring-purple-500'
            : movementType === 'home_return'
            ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:ring-green-500'
            : movementType === 'check_out'
            ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-red-500'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500'
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Recording Movement...
          </span>
        ) : (
          <>
            {availableTypes.find(t => t.value === movementType)?.icon && 
              React.createElement(availableTypes.find(t => t.value === movementType)!.icon, 
                { className: "h-5 w-5 mr-2" })
            }
            Confirm {availableTypes.find(t => t.value === movementType)?.label}
          </>
        )}
      </button>

      {/* Info Note */}
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-xs text-gray-600 text-center">
          <strong>Note:</strong> All movements are recorded for safety and security purposes. 
          {movementType === 'check_out' && ' Please check in when you return.'}
          {movementType === 'home_leave' && ' Safe travels! Remember to return on time.'}
          {location === 'local_out' && ' Please check in immediately upon your return.'}
          {location === 'home' && ' Welcome back! Please confirm your return.'}
        </p>
      </div>
    </form>
  );
};

export default MovementForm;