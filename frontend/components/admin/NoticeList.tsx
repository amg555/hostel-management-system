// frontend/components/admin/NoticeList.tsx
import React from 'react';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

interface NoticeListProps {
  notices: Notice[];
  isLoading?: boolean;
  onUpdate: () => void;
}

export const NoticeList: React.FC<NoticeListProps> = ({ notices, isLoading, onUpdate }) => {
  const toggleStatus = async (noticeId: string) => {
    try {
      await api.patch(`/notices/${noticeId}/toggle`);
      toast.success('Notice status updated');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update notice status');
    }
  };

  const deleteNotice = async (noticeId: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    
    try {
      await api.delete(`/notices/${noticeId}`);
      toast.success('Notice deleted successfully');
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete notice');
    }
  };

  if (isLoading) {
    return <div>Loading notices...</div>;
  }

  return (
    <div className="space-y-4">
      {notices.map((notice) => (
        <div key={notice.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{notice.title}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  notice.priority === 'high' 
                    ? 'bg-red-100 text-red-800'
                    : notice.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {notice.priority}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  notice.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {notice.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{notice.content}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Category: {notice.category}</span>
                <span>By: {notice.createdBy}</span>
                <span>{format(new Date(notice.createdAt), 'MMM dd, yyyy')}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleStatus(notice.id)}
                className="text-indigo-600 hover:text-indigo-900 text-sm"
              >
                {notice.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => deleteNotice(notice.id)}
                className="text-red-600 hover:text-red-900 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {notices.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No notices found
        </div>
      )}
    </div>
  );
};