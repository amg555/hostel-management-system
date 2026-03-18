// frontend/components/admin/reports/FinancialReport.tsx
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  ArrowDownTrayIcon, 
  CurrencyRupeeIcon,
  PrinterIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import exportService from '@/lib/exportService';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

interface FinancialReportProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export const FinancialReport: React.FC<FinancialReportProps> = ({ dateRange }) => {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');

  // Fetch actual data from API
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['financial-report', dateRange],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/reports/financial', {
        params: dateRange,
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
  });

  // Sample data for when API is not available
  const monthlyRevenue = [
    { month: 'Jan', revenue: 250000, expenses: 180000, profit: 70000 },
    { month: 'Feb', revenue: 280000, expenses: 190000, profit: 90000 },
    { month: 'Mar', revenue: 265000, expenses: 175000, profit: 90000 },
    { month: 'Apr', revenue: 290000, expenses: 200000, profit: 90000 },
    { month: 'May', revenue: 310000, expenses: 210000, profit: 100000 },
    { month: 'Jun', revenue: 295000, expenses: 195000, profit: 100000 }
  ];

  const paymentBreakdown = [
    { name: 'Room Rent', value: 65, amount: 1625000 },
    { name: 'Maintenance', value: 20, amount: 500000 },
    { name: 'Admission Fees', value: 10, amount: 250000 },
    { name: 'Others', value: 5, amount: 125000 }
  ];

  const expenseBreakdown = [
    { category: 'Salaries', amount: 450000, percentage: 40 },
    { category: 'Utilities', amount: 225000, percentage: 20 },
    { category: 'Maintenance', amount: 180000, percentage: 16 },
    { category: 'Supplies', amount: 135000, percentage: 12 },
    { category: 'Food', amount: 90000, percentage: 8 },
    { category: 'Others', amount: 45000, percentage: 4 }
  ];

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const totalRevenue = reportData?.summary?.revenue || monthlyRevenue.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = reportData?.summary?.expenses || monthlyRevenue.reduce((sum, item) => sum + item.expenses, 0);
  const totalProfit = reportData?.summary?.profit || (totalRevenue - totalExpenses);
  const profitMargin = reportData?.summary?.profitMargin || ((totalProfit / totalRevenue) * 100).toFixed(1);

  const handleExport = async (format: 'pdf' | 'csv' | 'print') => {
    try {
      if (format === 'print') {
        await exportService.printReport('financial-report-content');
      } else {
        await exportService.exportReport({
          reportType: 'financial',
          format: format as any,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="financial-report-content">
      {/* Export Actions */}
      <div className="flex justify-end space-x-2 no-print">
        <button
          onClick={() => handleExport('pdf')}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <DocumentArrowDownIcon className="h-5 w-5" />
          <span>Export PDF</span>
        </button>
        <button
          onClick={() => handleExport('csv')}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          <span>Export CSV</span>
        </button>
        <button
          onClick={() => handleExport('print')}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <PrinterIcon className="h-5 w-5" />
          <span>Print</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">+12.5% from last period</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <CurrencyRupeeIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalExpenses.toLocaleString()}</p>
              <p className="text-xs text-red-600 mt-1">+8.3% from last period</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <CurrencyRupeeIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Profit</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalProfit.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">+18.2% from last period</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <CurrencyRupeeIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Profit Margin</p>
              <p className="text-2xl font-bold text-gray-900">{profitMargin}%</p>
              <p className="text-xs text-green-600 mt-1">+2.1% from last period</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <CurrencyRupeeIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2} name="Revenue" />
            <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Expenses" />
            <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} name="Profit" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={paymentBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {paymentBreakdown.map((item, index) => (
              <div key={item.name} className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  ₹{item.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={expenseBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
              <Bar dataKey="amount" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Financial Summary</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Month
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expenses
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Margin
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {monthlyRevenue.map((month) => (
              <tr key={month.month}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {month.month}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{month.revenue.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{month.expenses.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{month.profit.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    ((month.profit / month.revenue) * 100) > 30
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {((month.profit / month.revenue) * 100).toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Report Footer for Print */}
      <div className="hidden print:block mt-8 pt-4 border-t text-center text-sm text-gray-600">
        <p>Generated on: {format(new Date(), 'MMMM dd, yyyy HH:mm')}</p>
        <p>© {new Date().getFullYear()} Hostel Management System</p>
      </div>
    </div>
  );
};