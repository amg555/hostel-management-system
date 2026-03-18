// frontend/components/admin/RecentActivities.tsx
import React from 'react';
import { format } from 'date-fns';
import { 
  UserPlusIcon, 
  CreditCardIcon, 
  ExclamationTriangleIcon,
  HomeIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';

interface Activity {
  id: string;
  type: 'student_joined' | 'payment_received' | 'complaint_filed' | 'room_assigned' | 'student_checkout';
  description: string;
  timestamp: string;
  user?: string;
  metadata?: any;
}

interface RecentActivitiesProps {
  activities?: Activity[];
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities = [] }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'student_joined':
        return <UserPlusIcon className="h-5 w-5 text-green-500" />;
      case 'payment_received':
        return <CreditCardIcon className="h-5 w-5 text-blue-500" />;
      case 'complaint_filed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'room_assigned':
        return <HomeIcon className="h-5 w-5 text-purple-500" />;
      case 'student_checkout':
        return <ClockIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'student_joined':
        return 'bg-green-50';
      case 'payment_received':
        return 'bg-blue-50';
      case 'complaint_filed':
        return 'bg-yellow-50';
      case 'room_assigned':
        return 'bg-purple-50';
      case 'student_checkout':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };

  // Default activities if none provided
  const defaultActivities: Activity[] = [
    {
      id: '1',
      type: 'student_joined',
      description: 'New student John Doe joined',
      timestamp: new Date().toISOString(),
      user: 'John Doe'
    },
    {
      id: '2',
      type: 'payment_received',
      description: 'Payment received from Jane Smith - ₹5000',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: 'Jane Smith'
    },
    {
      id: '3',
      type: 'complaint_filed',
      description: 'Maintenance complaint filed for Room 101',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      user: 'Room 101'
    },
    {
      id: '4',
      type: 'room_assigned',
      description: 'Room 205 assigned to Mike Johnson',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      user: 'Mike Johnson'
    },
    {
      id: '5',
      type: 'student_checkout',
      description: 'Student checkout - Sarah Wilson',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      user: 'Sarah Wilson'
    }
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        <button className="text-sm text-indigo-600 hover:text-indigo-900">
          View all
        </button>
      </div>

      <div className="flow-root">
        <ul className="-mb-8">
          {displayActivities.slice(0, 5).map((activity, activityIdx) => (
            <li key={activity.id}>
              <div className="relative pb-8">
                {activityIdx !== displayActivities.slice(0, 5).length - 1 ? (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getActivityColor(
                        activity.type
                      )}`}
                    >
                      {getActivityIcon(activity.type)}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-500">
                        {activity.description}
                        {activity.user && (
                          <span className="font-medium text-gray-900">
                            {' '}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      <time dateTime={activity.timestamp}>
                        {format(new Date(activity.timestamp), 'h:mm a')}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {displayActivities.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No recent activities
        </div>
      )}
    </div>
  );
};