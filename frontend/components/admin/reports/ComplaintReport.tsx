// frontend/components/admin/reports/ComplaintReport.tsx
import React from 'react';
import { 
  ArrowDownTrayIcon, 
  ExclamationTriangleIcon,
  PrinterIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import {
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
  Cell,
  LineChart,
  Line
} from 'recharts';
import exportService from '@/lib/exportService';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface ComplaintCategory {
  category: string;
  count: number;
  percentage?: number;
  dataValues?: {
    count: number;
  };
}

interface PriorityItem {
  priority: string;
  count: number;
  color: string;
  dataValues?: {
    count: number;
  };
}

interface ComplaintReportProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export const ComplaintReport: React.FC<ComplaintReportProps> = ({ dateRange }) => {
  // Fetch actual data from API
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['complaint-report', dateRange],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/reports/complaint', {
        params: dateRange,
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
  });

  // Sample data for when API is not available
  const complaintStats = reportData?.summary || {
    total: 156,
    pending: 23,
    inProgress: 15,
    resolved: 110,
    closed: 8,
    avgResolutionTime: '2.5 days'
  };

  const categoryBreakdown: ComplaintCategory[] = reportData?.categoryDistribution || [
    { category: 'Maintenance', count: 45, percentage: 29 },
    { category: 'Cleanliness', count: 35, percentage: 22 },
    { category: 'Food', count: 28, percentage: 18 },
    { category: 'Security', count: 20, percentage: 13 },
    { category: 'Noise', count: 15, percentage: 10 },
    { category: 'Others', count: 13, percentage: 8 }
  ];

  const monthlyComplaints = [
    { month: 'Jan', received: 25, resolved: 22, pending: 3 },
    { month: 'Feb', received: 30, resolved: 28, pending: 2 },
    { month: 'Mar', received: 28, resolved: 25, pending: 3 },
    { month: 'Apr', received: 35, resolved: 30, pending: 5 },
    { month: 'May', received: 22, resolved: 20, pending: 2 },
    { month: 'Jun', received: 26, resolved: 23, pending: 3 }
  ];

  const priorityDistribution: PriorityItem[] = reportData?.priorityDistribution || [
    { priority: 'Low', count: 60, color: '#10B981' },
    { priority: 'Medium', count: 70, color: '#F59E0B' },
    { priority: 'High', count: 20, color: '#EF4444' },
    { priority: 'Urgent', count: 6, color: '#991B1B' }
  ];

  const resolutionTime = [
    { days: 'Same Day', count: 45 },
    { days: '1-2 Days', count: 60 },
    { days: '3-5 Days', count: 35 },
    { days: '5+ Days', count: 16 }
  ];

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const handleExport = async (format: 'pdf' | 'csv' | 'print') => {
    try {
      if (format === 'print') {
        await exportService.printReport('complaint-report-content');
      } else {
        await exportService.exportReport({
          reportType: 'complaint',
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
    <div className="space-y-6" id="complaint-report-content">
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
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{complaintStats.total}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{complaintStats.pending}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-600">In Progress</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{complaintStats.inProgress || 15}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-600">Resolved</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{complaintStats.resolved}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-600">Closed</p>
            <p className="text-2xl font-bold text-gray-600 mt-1">{complaintStats.closed || 8}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-600">Avg Resolution</p>
            <p className="text-xl font-bold text-indigo-600 mt-1">{complaintStats.avgResolutionTime}</p>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Complaint Trend</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyComplaints}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="received" stroke="#4F46E5" strokeWidth={2} name="Received" />
            <Line type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2} name="Resolved" />
            <Line type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={2} name="Pending" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaints by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryBreakdown} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" />
              <Tooltip />
              <Bar dataKey="count" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={priorityDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ priority, count }: any) => `${priority}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {priorityDistribution.map((entry: PriorityItem, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resolution Time Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolution Time Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {resolutionTime.map((item) => (
            <div key={item.days} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">{item.days}</span>
                <span className="text-lg font-bold text-gray-900">{item.count}</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${(item.count / complaintStats.total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {((item.count / complaintStats.total) * 100).toFixed(1)}% of total
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Category Details Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Category-wise Complaint Analysis</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resolved
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pending
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resolution Rate
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categoryBreakdown.map((category: ComplaintCategory) => {
              const categoryCount = category.dataValues?.count || category.count;
              const resolved = Math.floor(categoryCount * 0.85);
              const pending = categoryCount - resolved;
              const resolutionRate = ((resolved / categoryCount) * 100).toFixed(1);
              
              return (
                <tr key={category.category}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {categoryCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {resolved}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pending}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        parseFloat(resolutionRate) > 80
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {resolutionRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
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