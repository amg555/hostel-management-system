// hooks/useAuth.ts
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export const useAuth = (requiredRole?: string) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Skip auth check for auth pages
    if (pathname?.startsWith('/admin-login') || 
        pathname?.startsWith('/student-login') || 
        pathname?.startsWith('/forgot-password') ||
        pathname?.startsWith('/register') ||
        pathname?.startsWith('/student-register')) {
      return;
    }

    if (!isAuthenticated) {
      // Redirect to appropriate login page based on required role
      if (requiredRole === 'admin') {
        router.push('/admin-login');
      } else if (requiredRole === 'student') {
        router.push('/student-login');
      } else {
        // Don't redirect to /login as it doesn't exist
        router.push('/');
      }
    } else if (requiredRole && user?.role !== requiredRole) {
      // Redirect to appropriate dashboard if wrong role
      if (user?.role === 'admin') {
        router.push('/admin');
      } else if (user?.role === 'student') {
        router.push('/student');
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, user, requiredRole, router, pathname]);

  return { isAuthenticated, user };
};