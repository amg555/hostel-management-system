import React from 'react';
import { 
  CurrencyRupeeIcon, 
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
  HomeIcon 
} from '@heroicons/react/24/outline';

interface DashboardStatsProps {
  stats?: {
    pendingAmount: number;
    openComplaints: number;
    currentMonth: string;
    daysInHostel: number;
  };
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Pending Payment',
      value: `₹${stats?.pendingAmount || 0}`,
      icon: CurrencyRupeeIcon,
      color: 'bg-yellow-50 text-yellow-600',
      bgIcon: 'bg-yellow-100',
    },
    {
      title: 'Open Complaints',
      value: stats?.openComplaints || 0,
      icon: ClipboardDocumentCheckIcon,
      color: 'bg-blue-50 text-blue-600',
      bgIcon: 'bg-blue-100',
    },
    {
      title: 'Current Month',
      value: stats?.currentMonth || new Date().toLocaleDateString('en-US', { month: 'long' }),
      icon: CalendarDaysIcon,
      color: 'bg-green-50 text-green-600',
      bgIcon: 'bg-green-100',
    },
    {
      title: 'Days in Hostel',
      value: stats?.daysInHostel || 0,
      icon: HomeIcon,
      color: 'bg-purple-50 text-purple-600',
      bgIcon: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-full ${stat.bgIcon}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};