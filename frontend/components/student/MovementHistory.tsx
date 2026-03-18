// frontend/components/student/MovementHistory.tsx
import React from 'react';
import { format } from 'date-fns';
import { 
  ArrowRightIcon, 
  ArrowLeftIcon, 
  HomeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface Movement {
  id: string;
  type: 'check_out' | 'check_in' | 'home_leave' | 'home_return';
  reason: string;
  checkOutTime?: string;
  checkInTime?: string;
  expectedReturnTime?: string;
  actualReturnTime?: string;
  destination?: string;
  transportMode?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'active';
  createdAt: string;
}

interface MovementHistoryProps {
  movements: Movement[];
  isLoading: boolean;
}

export const MovementHistory: React.FC<MovementHistoryProps> = ({ movements, isLoading }) => {
  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'check_out':
        return <ArrowRightIcon className="h-5 w-5 text-red-500" />;
      case 'check_in':
        return <ArrowLeftIcon className="h-5 w-5 text-green-500" />;
      case 'home_leave':
        return <HomeIcon className="h-5 w-5 text-purple-500" />;
      case 'home_return':
        return <HomeIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      approved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircleIcon },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      active: { color: 'bg-purple-100 text-purple-800', icon: ExclamationCircleIcon }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </span>
    );
  };

  const getMovementTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      check_out: 'Local Out',
      check_in: 'Check In',
      home_leave: 'Home Leave',
      home_return: 'Return from Home'
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-8">
          <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No movement records found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Movement History</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {movements.map((movement) => (
          <div key={movement.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                {getMovementIcon(movement.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {getMovementTypeLabel(movement.type)}
                  </p>
                  {getStatusBadge(movement.status)}
                </div>
                <p className="mt-1 text-sm text-gray-600">{movement.reason}</p>
                
                {movement.destination && (
                  <p className="mt-1 text-xs text-gray-500">
                    <span className="font-medium">Destination:</span> {movement.destination}
                  </p>
                )}
                
                {movement.transportMode && (
                  <p className="mt-1 text-xs text-gray-500">
                    <span className="font-medium">Transport:</span> {movement.transportMode}
                  </p>
                )}
                
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                  <span>
                    {format(new Date(movement.createdAt), 'MMM dd, yyyy hh:mm a')}
                  </span>
                  
                  {movement.expectedReturnTime && (
                    <span>
                      Expected: {format(new Date(movement.expectedReturnTime), 'MMM dd, hh:mm a')}
                    </span>
                  )}
                  
                  {movement.actualReturnTime && (
                    <span>
                      Returned: {format(new Date(movement.actualReturnTime), 'MMM dd, hh:mm a')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};