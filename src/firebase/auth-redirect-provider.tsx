'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { useUser } from './auth/use-user';
import { Loader2 } from 'lucide-react';

const AUTH_ROUTES = ['/login', '/signup'];
const PUBLIC_ROUTES = ['/'];

interface AuthRedirectProviderProps {
  children: ReactNode;
}

export function AuthRedirectProvider({ children }: AuthRedirectProviderProps) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isUserLoading) {
      return;
    }

    const isAuthRoute = AUTH_ROUTES.includes(pathname);
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isProtectedRoute = !isAuthRoute && !isPublicRoute;

    let shouldRedirect = false;

    // If user is logged in and on an auth page (login/signup), redirect to dashboard
    if (user && isAuthRoute) {
      router.replace('/dashboard');
      shouldRedirect = true;
    }

    // If user is not logged in and on a protected page, redirect to login
    if (!user && isProtectedRoute) {
      router.replace('/login');
      shouldRedirect = true;
    }
    
    setIsRedirecting(shouldRedirect);

  }, [user, isUserLoading, pathname, router]);

  if (isUserLoading || isRedirecting) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
