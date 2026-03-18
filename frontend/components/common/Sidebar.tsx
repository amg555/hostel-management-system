// components/common/Sidebar.tsx
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  HomeIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  ClipboardDocumentListIcon,
  ArrowsRightLeftIcon,
  MegaphoneIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const adminMenuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: HomeIcon },
    { href: '/admin/students', label: 'Students', icon: UserGroupIcon },
    { href: '/admin/rooms', label: 'Rooms', icon: HomeIcon },
    { href: '/admin/payments', label: 'Payments', icon: CurrencyRupeeIcon },
    { href: '/admin/complaints', label: 'Complaints', icon: ClipboardDocumentListIcon },
    { href: '/admin/notices', label: 'Notices', icon: MegaphoneIcon },
    { href: '/admin/expenses', label: 'Expenses', icon: CurrencyRupeeIcon },
    { href: '/admin/reports', label: 'Reports', icon: ChartBarIcon },
    { href: '/admin/settings', label: 'Settings', icon: CogIcon },
  ];

  const studentMenuItems = [
    { href: '/student/dashboard', label: 'Dashboard', icon: HomeIcon },
    { href: '/student/profile', label: 'Profile', icon: UserGroupIcon },
    { href: '/student/payments', label: 'Payments', icon: CurrencyRupeeIcon },
    { href: '/student/complaints', label: 'Complaints', icon: ClipboardDocumentListIcon },
    { href: '/student/movements', label: 'Movements', icon: ArrowsRightLeftIcon },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : studentMenuItems;

  return (
    <aside className="w-64 bg-gray-900 min-h-screen">
      <nav className="mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-800 text-white border-l-4 border-indigo-500'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};