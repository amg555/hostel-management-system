// components/student/PaymentStatus.tsx
import React from 'react';
import { format } from 'date-fns';
import { CurrencyRupeeIcon } from '@heroicons/react/24/outline';

interface Payment {
  id: string;
  amount: number;
  monthYear: string;
  status: string;
  paymentDate: string;
}

interface PaymentStatusProps {
  payments?: Payment[];
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({ payments = [] }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex items-center">
          <CurrencyRupeeIcon className="h-5 w-5 text-gray-600 mr-2" />
          <h2 className="text-lg font-semibold">Recent Payments</h2>
        </div>
      </div>
      
      <div className="p-6">
        {payments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No payment history</p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">₹{payment.amount}</p>
                  <p className="text-sm text-gray-600">{payment.monthYear}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(payment.paymentDate), 'MMM dd')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};