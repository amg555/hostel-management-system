// frontend/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { UserIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // If already authenticated, redirect to appropriate dashboard
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'student') {
        router.push('/student/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl w-full px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Hostel Management System
          </h1>
          <p className="text-xl text-gray-600">
            Select your login type to continue
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Student Login Card */}
          <Link href="/student-login">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-blue-500">
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 p-6 rounded-full mb-6">
                  <AcademicCapIcon className="h-16 w-16 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Student Login
                </h2>
                <p className="text-gray-600 text-center mb-6">
                  Access your room details, make complaints, track payments, and more
                </p>
                <div className="inline-flex items-center text-blue-600 font-semibold">
                  Login as Student
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Admin Login Card */}
          <Link href="/admin-login">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-indigo-500">
              <div className="flex flex-col items-center">
                <div className="bg-indigo-100 p-6 rounded-full mb-6">
                  <UserIcon className="h-16 w-16 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Admin Login
                </h2>
                <p className="text-gray-600 text-center mb-6">
                  Manage students, rooms, payments, generate reports, and handle complaints
                </p>
                <div className="inline-flex items-center text-indigo-600 font-semibold">
                  Login as Admin
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Student accounts are created by the hostel administration.
          </p>
          <p className="mt-1">
            Contact your hostel admin if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}