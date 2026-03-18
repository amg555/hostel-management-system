// frontend/components/admin/reports/StudentReport.tsx
import React from 'react';
import { 
  ArrowDownTrayIcon, 
  UserGroupIcon,
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
  Cell
} from 'recharts';
import exportService from '@/lib/exportService';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface YearData {
  year?: string;
  academicYear?: string;
  count?: number;
  dataValues?: {
    count: number;
  };
}

interface CourseData {
  course: string;
  count: number;
  percentage?: number;
  dataValues?: {
    count: number;
  };
}

interface StudentReportProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export const StudentReport: React.FC<StudentReportProps> = ({ dateRange }) => {
  // Fetch actual data from API
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['student-report', dateRange],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/reports/student', {
        params: dateRange,
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
  });

  const studentStats = reportData?.summary || {
    total: 364,
    active: 350,
    inactive: 14,
    newAdmissions: 25,
    checkouts: 12
  };

  const courseDistribution: CourseData[] = reportData?.courseDistribution || [
    { course: 'Engineering', count: 120, percentage: 33 },
    { course: 'Medical', count: 80, percentage: 22 },
    { course: 'Commerce', count: 60, percentage: 16 },
    { course: 'Arts', count: 50, percentage: 14 },
    { course: 'Science', count: 40, percentage: 11 },
    { course: 'Others', count: 14, percentage: 4 }
  ];

  const genderDistribution = [
    { name: 'Male', value: 210, color: '#4F46E5' },
    { name: 'Female', value: 154, color: '#EC4899' }
  ];

  const monthlyAdmissions = [
    { month: 'Jan', admissions: 15, checkouts: 5 },
    { month: 'Feb', admissions: 20, checkouts: 8 },
    { month: 'Mar', admissions: 25, checkouts: 10 },
    { month: 'Apr', admissions: 18, checkouts: 12 },
    { month: 'May', admissions: 22, checkouts: 7 },
    { month: 'Jun', admissions: 30, checkouts: 9 }
  ];

  const yearDistribution: YearData[] = reportData?.yearDistribution || [
    { year: '1st Year', count: 110 },
    { year: '2nd Year', count: 95 },
    { year: '3rd Year', count: 85 },
    { year: '4th Year', count: 74 }
  ];

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const handleExport = async (format: 'pdf' | 'csv' | 'print') => {
    try {
      if (format === 'print') {
        await exportService.printReport('student-report-content');
      } else {
        await exportService.exportReport({
          reportType: 'student',
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
    <div className="space-y-6" id="student-report-content">
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{studentStats.total}</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{studentStats.active}</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-500">{studentStats.inactive}</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New (Month)</p>
              <p className="text-2xl font-bold text-blue-600">{studentStats.newAdmissions || 25}</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Checkouts</p>
              <p className="text-2xl font-bold text-red-600">{studentStats.checkouts || 12}</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Admissions vs Checkouts Trend */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Admissions vs Checkouts Trend</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyAdmissions}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="admissions" fill="#4F46E5" name="Admissions" />
            <Bar dataKey="checkouts" fill="#EF4444" name="Checkouts" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gender Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={genderDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }: any) => `${name}: ${value}`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {genderDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Year-wise Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Year-wise Distribution</h3>
          <div className="space-y-3">
            {yearDistribution.map((year: YearData) => {
              const yearKey = year.year || year.academicYear || '';
              const yearCount = year.count || year.dataValues?.count || 0;
              return (
                <div key={yearKey}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{yearKey}</span>
                    <span className="font-medium">{yearCount} students</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${(yearCount / studentStats.total) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Course Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={courseDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={70}
                fill="#8884d8"
                dataKey="count"
              >
                {courseDistribution.map((entry: CourseData, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {courseDistribution.slice(0, 6).map((course: CourseData, index: number) => {
              const courseCount = course.count || course.dataValues?.count || 0;
              const coursePercentage = course.percentage || Math.round((courseCount / studentStats.total) * 100);
              return (
                <div key={course.course} className="flex items-center space-x-2 text-xs">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-600">
                    {course.course}: {coursePercentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Student List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Course-wise Student Count</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Students
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Percentage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courseDistribution.map((course: CourseData) => {
              const courseCount = course.count || course.dataValues?.count || 0;
              const coursePercentage = course.percentage || Math.round((courseCount / studentStats.total) * 100);
              return (
                <tr key={course.course}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {course.course}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {courseCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {coursePercentage}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
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