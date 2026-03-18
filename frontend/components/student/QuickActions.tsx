// components/student/QuickActions.tsx
import React from 'react';
import { useRouter } from 'next/navigation';
import {
  CurrencyRupeeIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

export const QuickActions: React.FC = () => {
  const router = useRouter();

  const actions = [
    {
      title: 'Pay Fees',
      description: 'Make payment for hostel fees',
      icon: CurrencyRupeeIcon,
      color: 'bg-green-100 text-green-600',
      onClick: () => router.push('/student/payments')
    },
    {
      title: 'Register Complaint',
      description: 'Report issues or problems',
      icon: DocumentTextIcon,
      color: 'bg-blue-100 text-blue-600',
      onClick: () => router.push('/student/complaints/new')
    },
    {
      title: 'Check In/Out',
      description: 'Record your movement',
      icon: ArrowRightOnRectangleIcon,
      color: 'bg-yellow-100 text-yellow-600',
      onClick: () => router.push('/student/movements/new')
    },
    {
      title: 'Feedback',
      description: 'Share your feedback',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-purple-100 text-purple-600',
      onClick: () => router.push('/student/feedback')
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className={`inline-flex p-3 rounded-lg ${action.color} mb-4`}>
            <action.icon className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-gray-900">{action.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{action.description}</p>
        </button>
      ))}
    </div>
  );
};