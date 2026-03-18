import React from 'react';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface ExpenseTrackerProps {
  expenses?: any[];
  totalBudget?: number;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ 
  expenses = [], 
  totalBudget = 100000 
}) => {
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = totalBudget - totalExpenses;
  const budgetUsedPercentage = (totalExpenses / totalBudget) * 100;

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      maintenance: '🔧',
      utilities: '💡',
      salaries: '💰',
      supplies: '📦',
      food: '🍽️',
      security: '🔒',
      cleaning: '🧹',
      repairs: '🔨',
      other: '📋'
    };
    return icons[category] || '📋';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Expense Tracker</h2>
      
      {/* Budget Overview */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Budget Utilization</span>
          <span className="text-sm font-medium">{budgetUsedPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              budgetUsedPercentage > 90 ? 'bg-red-600' :
              budgetUsedPercentage > 70 ? 'bg-yellow-600' :
              'bg-green-600'
            }`}
            style={{ width: `${Math.min(budgetUsedPercentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className="text-gray-500">Spent: ₹{totalExpenses.toLocaleString()}</span>
          <span className="text-gray-500">Remaining: ₹{remainingBudget.toLocaleString()}</span>
        </div>
      </div>

      {/* Recent Expenses */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Expenses</h3>
        <div className="space-y-2">
          {expenses.slice(0, 5).map((expense) => (
            <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getCategoryIcon(expense.category)}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                  <p className="text-xs text-gray-500">
                    {expense.category} • {format(new Date(expense.date), 'MMM dd')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-red-600">-₹{expense.amount}</p>
                <p className="text-xs text-gray-500">{expense.paymentMethod}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Summary */}
      <div className="mt-6 pt-6 border-t">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Category Breakdown</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(
            expenses.reduce((acc: any, exp) => {
              acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
              return acc;
            }, {})
          ).map(([category, amount]: [string, any]) => (
            <div key={category} className="flex justify-between text-sm">
              <span className="text-gray-600 capitalize">{category}:</span>
              <span className="font-medium">₹{amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};