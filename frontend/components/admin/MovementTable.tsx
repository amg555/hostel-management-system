// frontend/components/admin/MovementTable.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { 
  HomeIcon, 
  MapPinIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  CalendarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Movement {
  id: string;
  studentId: string;
  type: 'check_out' | 'check_in' | 'home_leave' | 'home_return';
  reason: string;
  destination?: string;
  checkOutTime?: string;
  checkInTime?: string;
  expectedReturnTime?: string;
  actualReturnTime?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'active';
  transportMode?: string;
  emergencyContact?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    fullName: string;
    studentId: string;
    roomId: string;
    phone: string;
    guardianPhone: string;
  };
}

interface MovementTableProps {
  filter?: 'all' | 'home' | 'overdue' | 'active';
}

export const MovementTable: React.FC<MovementTableProps> = ({ filter = 'all' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Build query parameters based on filter
  const getQueryParams = () => {
    const params: any = {
      page,
      limit
    };

    if (filter === 'home') {
      params.isAtHome = 'true';
    } else if (filter === 'overdue') {
      // This will be handled by filtering the results
    } else if (filter === 'active') {
      params.status = 'active';
    }

    if (typeFilter) params.type = typeFilter;
    if (statusFilter) params.status = statusFilter;

    return params;
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['movements', filter, page, typeFilter, statusFilter],
    queryFn: async () => {
      const response = await api.get('/movements', { params: getQueryParams() });
      return response.data;
    }
  });

  // Filter for overdue movements
  const getFilteredMovements = () => {
    if (!data?.movements) return [];
    
    let filtered = data.movements;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((movement: Movement) => 
        movement.student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply overdue filter
    if (filter === 'overdue') {
      filtered = filtered.filter((movement: Movement) => {
        if (movement.expectedReturnTime && 
            (movement.status === 'active' || movement.status === 'approved')) {
          return new Date(movement.expectedReturnTime) < new Date();
        }
        return false;
      });
    }

    return filtered;
  };

  const handleStatusUpdate = async (movementId: string, newStatus: string) => {
    try {
      await api.put(`/movements/${movementId}`, { status: newStatus });
      toast.success('Movement status updated successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to update movement status');
    }
  };

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
      active: { color: 'bg-purple-100 text-purple-800', icon: ExclamationTriangleIcon }
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

  const exportToCSV = () => {
    const movements = getFilteredMovements();
    const headers = ['Student Name', 'Student ID', 'Type', 'Reason', 'Destination', 'Status', 'Check Out', 'Expected Return', 'Actual Return'];
    
    const csvContent = [
      headers.join(','),
      ...movements.map((m: Movement) => [
        m.student.fullName,
        m.student.studentId,
        m.type,
        `"${m.reason}"`,
        m.destination || '',
        m.status,
        m.checkOutTime ? format(new Date(m.checkOutTime), 'yyyy-MM-dd HH:mm') : '',
        m.expectedReturnTime ? format(new Date(m.expectedReturnTime), 'yyyy-MM-dd HH:mm') : '',
        m.actualReturnTime ? format(new Date(m.actualReturnTime), 'yyyy-MM-dd HH:mm') : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `movements-${filter}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const filteredMovements = getFilteredMovements();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load movements</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header and Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {filter === 'home' && 'Students at Home'}
              {filter === 'overdue' && 'Overdue Returns'}
              {filter === 'active' && 'Active Movements'}
              {filter === 'all' && 'All Movements'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredMovements.length} {filteredMovements.length === 1 ? 'record' : 'records'} found
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Types</option>
              <option value="check_out">Check Out</option>
              <option value="check_in">Check In</option>
              <option value="home_leave">Home Leave</option>
              <option value="home_return">Home Return</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2 text-gray-500" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Movement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMovements.map((movement: Movement) => {
              const isOverdue = movement.expectedReturnTime && 
                new Date(movement.expectedReturnTime) < new Date() &&
                (movement.status === 'active' || movement.status === 'approved');

              return (
                <tr key={movement.id} className={isOverdue ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {movement.student.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {movement.student.studentId}
                      </div>
                      <div className="text-sm text-gray-500">
                        Room: {movement.student.roomId || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getMovementIcon(movement.type)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {movement.type.replace(/_/g, ' ').toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {movement.reason}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {movement.destination && (
                        <div className="flex items-center text-gray-600 mb-1">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {movement.destination}
                        </div>
                      )}
                      {movement.transportMode && (
                        <div className="text-gray-600 mb-1">
                          Transport: {movement.transportMode}
                        </div>
                      )}
                      {(movement.emergencyContact || movement.student.phone) && (
                        <div className="flex items-center text-gray-600">
                          <PhoneIcon className="h-4 w-4 mr-1" />
                          {movement.emergencyContact || movement.student.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="space-y-1">
                      {movement.checkOutTime && (
                        <div>
                          <span className="font-medium">Out:</span>{' '}
                          {format(new Date(movement.checkOutTime), 'MMM dd, hh:mm a')}
                        </div>
                      )}
                      {movement.expectedReturnTime && (
                        <div className={isOverdue ? 'text-red-600 font-medium' : ''}>
                          <span className="font-medium">Expected:</span>{' '}
                          {format(new Date(movement.expectedReturnTime), 'MMM dd, hh:mm a')}
                        </div>
                      )}
                      {movement.actualReturnTime && (
                        <div>
                          <span className="font-medium">Returned:</span>{' '}
                          {format(new Date(movement.actualReturnTime), 'MMM dd, hh:mm a')}
                        </div>
                      )}
                      {isOverdue && (
                        <div className="text-red-600 text-xs font-medium">
                          Overdue by {Math.floor((new Date().getTime() - new Date(movement.expectedReturnTime!).getTime()) / (1000 * 60 * 60))} hours
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(movement.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      {movement.status === 'active' && movement.type === 'home_leave' && (
                        <button
                          onClick={() => handleStatusUpdate(movement.id, 'completed')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Mark Returned
                        </button>
                      )}
                      {movement.status === 'active' && movement.type === 'check_out' && (
                        <button
                          onClick={() => handleStatusUpdate(movement.id, 'completed')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Mark Checked In
                        </button>
                      )}
                      <button
                        onClick={() => {
                          // You can implement a modal to show full details
                          console.log('View details:', movement);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredMovements.length === 0 && (
          <div className="text-center py-12">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No movements found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.total)} of {data.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              {[...Array(data.totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 border rounded-md ${
                    page === i + 1
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              )).slice(Math.max(0, page - 3), Math.min(data.totalPages, page + 2))}
              <button
                onClick={() => setPage(Math.min(data.totalPages, page + 1))}
                disabled={page === data.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};