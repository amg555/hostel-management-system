// frontend/components/admin/ExpenseTable.tsx
import React from 'react';
import { format } from 'date-fns';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: string;
  vendor?: string;
  invoiceNumber?: string;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
}

interface ExpenseTableProps {
  expenses: Expense[];
  isLoading?: boolean;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  isLoading,
  onEdit,
  onDelete
}) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      maintenance: 'bg-orange-100 text-orange-800',
      utilities: 'bg-blue-100 text-blue-800',
      salaries: 'bg-green-100 text-green-800',
      supplies: 'bg-purple-100 text-purple-800',
      food: 'bg-yellow-100 text-yellow-800',
      security: 'bg-red-100 text-red-800',
      cleaning: 'bg-teal-100 text-teal-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodIcon = (method: string) => {
    const icons: Record<string, string> = {
      cash: '💵',
      bank_transfer: '🏦',
      cheque: '📝',
      upi: '📱',
      card: '💳'
    };
    return icons[method] || '💰';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">No expenses found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vendor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment Method
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Invoice #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {expenses.map((expense) => (
            <tr key={expense.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(expense.date), 'MMM dd, yyyy')}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div>
                  <div className="font-medium">{expense.description}</div>
                  {expense.notes && (
                    <div className="text-xs text-gray-500 mt-1">{expense.notes}</div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getCategoryColor(expense.category)}`}>
                  {expense.category}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {expense.vendor || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                ₹{expense.amount.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="mr-1">{getPaymentMethodIcon(expense.paymentMethod)}</span>
                  <span className="capitalize">{expense.paymentMethod.replace('_', ' ')}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {expense.invoiceNumber || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(expense)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this expense?')) {
                          onDelete(expense.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Summary Row */}
      <div className="bg-gray-50 px-6 py-3 border-t">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-900">Total Expenses:</span>
          <span className="text-lg font-bold text-gray-900">
            ₹{expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};