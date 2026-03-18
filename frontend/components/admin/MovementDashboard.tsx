// frontend/components/admin/MovementDashboard.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { 
  HomeIcon, 
  UserGroupIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

export const MovementDashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['movement-stats'],
    queryFn: async () => {
      const response = await api.get('/movements/stats');
      return response.data;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: studentsAtHome, isLoading: studentsLoading } = useQuery({
    queryKey: ['students-at-home'],
    queryFn: async () => {
      const response = await api.get('/movements/students-at-home');
      return response.data;
    },
    refetchInterval: 30000
  });

  if (statsLoading || studentsLoading) {
    return <div>Loading movement data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">In Hostel</p>
              <p className="text-3xl font-bold text-green-600">
                {stats?.stats.studentsInHostel || 0}
              </p>
            </div>
            <UserGroupIcon className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">At Home</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats?.stats.studentsAtHome || 0}
              </p>
            </div>
            <HomeIcon className="h-10 w-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Local Out</p>
              <p className="text-3xl font-bold text-yellow-600">
                {stats?.stats.studentsLocalOut || 0}
              </p>
            </div>
            <MapPinIcon className="h-10 w-10 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-3xl font-bold text-red-600">
                {stats?.stats.overdueReturnsCount || 0}
              </p>
            </div>
            <ExclamationTriangleIcon className="h-10 w-10 text-red-500" />
          </div>
        </div>
      </div>

      {/* Students Currently at Home */}
      {studentsAtHome?.studentsAtHome?.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Students Currently at Home</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Left On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Expected Return
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentsAtHome.studentsAtHome.map((leave: any) => {
                  const isOverdue = leave.expectedReturnTime && 
                    new Date(leave.expectedReturnTime) < new Date();
                  
                  return (
                    <tr key={leave.id} className={isOverdue ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {leave.student.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {leave.student.studentId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {leave.destination || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(leave.checkOutTime), 'MMM dd, hh:mm a')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {leave.expectedReturnTime 
                          ? format(new Date(leave.expectedReturnTime), 'MMM dd, hh:mm a')
                          : 'Not specified'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {leave.emergencyContact || leave.student.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isOverdue ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Overdue
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            On Leave
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Overdue Returns */}
      {stats?.overdueReturns?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-900">Overdue Returns</h3>
          </div>
          <div className="space-y-2">
            {stats.overdueReturns.map((movement: any) => (
              <div key={movement.id} className="bg-white rounded p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{movement.student.fullName}</p>
                  <p className="text-sm text-gray-500">
                    Expected: {format(new Date(movement.expectedReturnTime), 'MMM dd, hh:mm a')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Phone: {movement.student.phone}</p>
                  <p className="text-xs text-red-600">
                    Overdue by {Math.floor((new Date().getTime() - new Date(movement.expectedReturnTime).getTime()) / (1000 * 60 * 60))} hours
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};