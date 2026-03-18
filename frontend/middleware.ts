import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Define protected routes
  const isStudentRoute = path.startsWith('/student')
  const isAdminRoute = path.startsWith('/admin')
  const isAuthRoute = path.includes('/login') || path.includes('/register')
  
  // Get token from cookies (if using cookies) or return next
  // Since we're using localStorage, we can't check auth in middleware
  // This is just for reference if you switch to cookies
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/student/:path*',
    '/admin/:path*',
  ]
}