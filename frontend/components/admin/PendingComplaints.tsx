// frontend/components/admin/PendingComplaints.tsx
import React from 'react';
import { format } from 'date-fns';
import { ExclamationTriangleIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Complaint {
  id: string;
  complaintNumber?: string;
  studentName: string;
  category: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  status: string;
}

interface PendingComplaintsProps {
  complaints?: Complaint[];
}

export const PendingComplaints: React.FC<PendingComplaintsProps> = ({ complaints = [] }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      maintenance: '🔧',
      cleanliness: '🧹',
      food: '🍽️',
      security: '🔒',
      noise: '🔊',
      internet: '📶',
      electricity: '💡',
      water: '💧',
      other: '📋'
    };
    return icons[category] || '📋';
  };

  // Default complaints if none provided
  const defaultComplaints: Complaint[] = [
    {
      id: '1',
      complaintNumber: 'CMP-001',
      studentName: 'John Doe',
      category: 'maintenance',
      subject: 'AC not working in Room 101',
      priority: 'high',
      createdAt: new Date().toISOString(),
      status: 'pending'
    },
    {
      id: '2',
      complaintNumber: 'CMP-002',
      studentName: 'Jane Smith',
      category: 'cleanliness',
      subject: 'Bathroom needs cleaning',
      priority: 'medium',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      status: 'pending'
    },
    {
      id: '3',
      complaintNumber: 'CMP-003',
      studentName: 'Mike Johnson',
      category: 'food',
      subject: 'Food quality issue',
      priority: 'low',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      status: 'pending'
    }
  ];

  const displayComplaints = complaints.length > 0 ? complaints : defaultComplaints;
  const pendingComplaints = displayComplaints.filter(c => c.status === 'pending' || c.status === 'open');

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">Pending Complaints</h3>
          {pendingComplaints.length > 0 && (
            <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-semibold">
              {pendingComplaints.length}
            </span>
          )}
        </div>
        <Link href="/admin/complaints" className="text-sm text-indigo-600 hover:text-indigo-900">
          View all
        </Link>
      </div>

      <div className="space-y-3">
        {pendingComplaints.slice(0, 5).map((complaint) => (
          <div
            key={complaint.id}
            className="border rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-lg">{getCategoryIcon(complaint.category)}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {complaint.subject}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span>{complaint.studentName}</span>
                  <span>•</span>
                  <span>{format(new Date(complaint.createdAt), 'MMM dd, h:mm a')}</span>
                  <span>•</span>
                  <span className="capitalize">{complaint.category}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                    complaint.priority
                  )}`}
                >
                  {complaint.priority}
                </span>
                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        ))}

        {pendingComplaints.length === 0 && (
          <div className="text-center py-8">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No pending complaints</p>
          </div>
        )}
      </div>

      {pendingComplaints.length > 5 && (
        <div className="mt-4 pt-4 border-t">
          <Link
            href="/admin/complaints"
            className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
          >
            View {pendingComplaints.length - 5} more complaints →
          </Link>
        </div>
      )}
    </div>
  );
};