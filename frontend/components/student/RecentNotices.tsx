// components/student/RecentNotices.tsx
import React from 'react';
import { format } from 'date-fns';
import { MegaphoneIcon } from '@heroicons/react/24/outline';

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  createdAt: string;
}

interface RecentNoticesProps {
  notices?: Notice[];
}

export const RecentNotices: React.FC<RecentNoticesProps> = ({ notices = [] }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex items-center">
          <MegaphoneIcon className="h-5 w-5 text-gray-600 mr-2" />
          <h2 className="text-lg font-semibold">Recent Notices</h2>
        </div>
      </div>
      
      <div className="p-6">
        {notices.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No notices available</p>
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => (
              <div key={notice.id} className="border-l-4 border-indigo-500 pl-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{notice.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{notice.content}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(notice.priority)}`}>
                    {notice.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {format(new Date(notice.createdAt), 'MMM dd, yyyy')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};