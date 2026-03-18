// frontend/components/admin/ComplaintTable.tsx
import React, { useState } from 'react';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface Complaint {
  id: string;
  complaintNumber: string;
  student: {
    fullName: string;
    studentId: string;
    roomNumber?: string;
  };
  category: string;
  subject: string;
  description?: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

interface ComplaintTableProps {
  complaints: Complaint[];
  isLoading?: boolean;
  onUpdate: () => void;
}

export const ComplaintTable: React.FC<ComplaintTableProps> = ({ 
  complaints, 
  isLoading,
  onUpdate 
}) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const updateStatus = async (complaintId: string, newStatus: string) => {
    setUpdatingId(complaintId);
    try {
      await api.put(`/complaints/${complaintId}`, { status: newStatus });
      toast.success('Complaint status updated');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colors[priority as keyof typeof colors] || colors.low}`}>
        <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
        {priority}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'open':
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case 'in_progress':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'closed':
        return <CheckCircleIcon className="h-4 w-4 text-gray-500" />;
      case 'rejected':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Complaint
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {complaints.map((complaint) => (
              <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      #{complaint.complaintNumber}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 truncate max-w-xs">
                      {complaint.subject}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {complaint.student.fullName}
                    </p>
                    <p className="text-xs text-gray-500">
                      ID: {complaint.student.studentId}
                    </p>
                    {complaint.student.roomNumber && (
                      <p className="text-xs text-gray-500">
                        Room: {complaint.student.roomNumber}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 capitalize">
                    {complaint.category.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPriorityBadge(complaint.priority)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={complaint.status}
                    onChange={(e) => updateStatus(complaint.id, e.target.value)}
                    disabled={updatingId === complaint.id}
                    className="text-sm rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    <p>{format(new Date(complaint.createdAt), 'MMM dd, yyyy')}</p>
                    <p className="text-xs">{format(new Date(complaint.createdAt), 'hh:mm a')}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button className="text-gray-600 hover:text-gray-900">
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden">
        <div className="divide-y divide-gray-200">
          {complaints.map((complaint) => (
            <div key={complaint.id} className="p-4 hover:bg-gray-50 transition-colors">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500">
                      #{complaint.complaintNumber}
                    </span>
                    {getPriorityBadge(complaint.priority)}
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    {complaint.subject}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{complaint.student.fullName}</span>
                    <span>•</span>
                    <span>Room {complaint.student.roomNumber || 'N/A'}</span>
                  </div>
                </div>
                <button
                  onClick={() => setExpandedId(expandedId === complaint.id ? null : complaint.id)}
                  className="p-1"
                >
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Card Details */}
              {expandedId === complaint.id && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                  <p className="text-xs text-gray-600">{complaint.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {format(new Date(complaint.createdAt), 'MMM dd, yyyy hh:mm a')}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full capitalize">
                      {complaint.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Update Status
                </label>
                <select
                  value={complaint.status}
                  onChange={(e) => updateStatus(complaint.id, e.target.value)}
                  disabled={updatingId === complaint.id}
                  className="w-full text-sm rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {complaints.length === 0 && (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No complaints</h3>
          <p className="mt-1 text-sm text-gray-500">No complaints have been filed yet.</p>
        </div>
      )}
    </div>
  );
};