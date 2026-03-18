// frontend/components/admin/StudentDetails.tsx
import React from 'react';
import { format } from 'date-fns';

interface StudentDetailsProps {
  student: any;
}

export const StudentDetails: React.FC<StudentDetailsProps> = ({ student }) => {
  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Full Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{student.fullName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Student ID</dt>
            <dd className="mt-1 text-sm text-gray-900">{student.studentId}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{student.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Phone</dt>
            <dd className="mt-1 text-sm text-gray-900">{student.phone}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {student.dateOfBirth && format(new Date(student.dateOfBirth), 'MMM dd, yyyy')}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Gender</dt>
            <dd className="mt-1 text-sm text-gray-900 capitalize">{student.gender}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Blood Group</dt>
            <dd className="mt-1 text-sm text-gray-900">{student.bloodGroup}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                student.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {student.status}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      {/* Room Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Room Information</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Room Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{student.room?.roomNumber || 'Not Assigned'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Room Type</dt>
            <dd className="mt-1 text-sm text-gray-900 capitalize">{student.room?.type || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Floor</dt>
            <dd className="mt-1 text-sm text-gray-900">{student.room?.floor || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Monthly Rent</dt>
            <dd className="mt-1 text-sm text-gray-900">₹{student.room?.monthlyRent || '-'}</dd>
          </div>
        </dl>
      </div>

      {/* Guardian Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Guardian Information</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Guardian Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{student.guardianName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Guardian Phone</dt>
            <dd className="mt-1 text-sm text-gray-900">{student.guardianPhone}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Relation</dt>
            <dd className="mt-1 text-sm text-gray-900">{student.guardianRelation}</dd>
          </div>
        </dl>
      </div>

      {/* Recent Payments */}
      {student.payments && student.payments.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Payments</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receipt #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {student.payments.slice(0, 5).map((payment: any) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.receiptNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{payment.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};