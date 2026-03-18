// frontend/components/admin/PaymentOverview.tsx
import React from 'react';
import { format } from 'date-fns';
import { CurrencyRupeeIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Payment {
  id: string;
  studentName: string;
  amount: number;
  type: string;
  status: 'completed' | 'pending' | 'overdue';
  dueDate?: string;
  paidDate?: string;
}

interface PaymentOverviewProps {
  payments?: Payment[];
}

export const PaymentOverview: React.FC<PaymentOverviewProps> = ({ payments = [] }) => {
  // Default payments if none provided
  const defaultPayments: Payment[] = [
    {
      id: '1',
      studentName: 'John Doe',
      amount: 5000,
      type: 'Monthly Rent',
      status: 'completed',
      paidDate: new Date().toISOString()
    },
    {
      id: '2',
      studentName: 'Jane Smith',
      amount: 5000,
      type: 'Monthly Rent',
      status: 'pending',
      dueDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: '3',
      studentName: 'Mike Johnson',
      amount: 5000,
      type: 'Monthly Rent',
      status: 'overdue',
      dueDate: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '4',
      studentName: 'Sarah Wilson',
      amount: 2500,
      type: 'Maintenance',
      status: 'completed',
      paidDate: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  const displayPayments = payments.length > 0 ? payments : defaultPayments;

  const totalPending = displayPayments
    .filter(p => p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalCompleted = displayPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending':
      case 'overdue':
        return <ClockIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Payment Overview</h3>
        <Link href="/admin/payments" className="text-sm text-indigo-600 hover:text-indigo-900">
          View all
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-medium">Collected</p>
              <p className="text-lg font-bold text-green-900">₹{totalCompleted.toLocaleString()}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-yellow-600 font-medium">Pending</p>
              <p className="text-lg font-bold text-yellow-900">₹{totalPending.toLocaleString()}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Recent Payments List */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Transactions</h4>
        {displayPayments.slice(0, 5).map((payment) => (
          <div
            key={payment.id}
            className="flex items-center justify-between py-2 border-b last:border-0"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <CurrencyRupeeIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  {payment.studentName}
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500">{payment.type}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">
                  {payment.status === 'completed' && payment.paidDate
                    ? `Paid ${format(new Date(payment.paidDate), 'MMM dd')}`
                    : payment.dueDate
                    ? `Due ${format(new Date(payment.dueDate), 'MMM dd')}`
                    : 'No date'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-gray-900">
                ₹{payment.amount.toLocaleString()}
              </span>
              <span
                className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  payment.status
                )}`}
              >
                {getStatusIcon(payment.status)}
                <span>{payment.status}</span>
              </span>
            </div>
          </div>
        ))}

        {displayPayments.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No recent payments
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex space-x-2">
          <button className="flex-1 bg-indigo-600 text-white text-sm py-2 px-3 rounded-md hover:bg-indigo-700 transition-colors">
            Record Payment
          </button>
          <button className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 px-3 rounded-md hover:bg-gray-50 transition-colors">
            Send Reminders
          </button>
        </div>
      </div>
    </div>
  );
};