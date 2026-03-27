'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';
import { useAuthState } from '@/providers/auth-provider';

const TOKEN_COOKIE = 'sg_access_token';

function hasAuthCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some((c) => c.trim().startsWith(`${TOKEN_COOKIE}=`));
}

export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  const AuthGuard: React.FC<P> = (props) => {
    const { isAuthenticated } = useAuthState();
    const router = useRouter();

    // isAuthenticated is true after login within the same session.
    // hasAuthCookie() catches page refreshes where state resets but the cookie persists.
    const canAccess = isAuthenticated || hasAuthCookie();

    useEffect(() => {
      if (!canAccess) {
        router.replace('/login');
      }
    }, [canAccess, router]);

    if (!canAccess) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: '#f1f5f9',
        }}>
          <Spin size="large" />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  AuthGuard.displayName = `withAuth(${WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component'})`;

  return AuthGuard;
}
