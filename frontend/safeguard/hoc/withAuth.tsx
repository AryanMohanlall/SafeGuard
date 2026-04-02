'use client';

import React, { useEffect, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Spin } from 'antd';
import { useAuthState } from '@/providers/auth-provider';

const TOKEN_COOKIE = 'sg_access_token';

function hasAuthCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some((c) => c.trim().startsWith(`${TOKEN_COOKIE}=`));
}

const spinScreen = (
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

function subscribe() { return () => {}; }

export const RESTRICTED_ROUTE_PREFIXES = ['/monitor', '/incident-graph', '/cases', '/alerts'];
export const OFFICIAL_ROLE_PATTERN = /^official$/i;

export const isRestrictedPath = (pathname: string) =>
  RESTRICTED_ROUTE_PREFIXES.some((routePrefix) => pathname === routePrefix || pathname.startsWith(`${routePrefix}/`));

export const hasOfficialRole = (roleNames: string[] | undefined) =>
  (roleNames ?? []).some((roleName) => OFFICIAL_ROLE_PATTERN.test(roleName));

export const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const AuthGuard: React.FC<P> = (props) => {
    const { isAuthenticated, isReady, user } = useAuthState();
    const router = useRouter();
    const pathname = usePathname();
    const mounted = useSyncExternalStore(subscribe, () => true, () => false);

    // isAuthenticated is true after login within the same session.
    // hasAuthCookie() catches page refreshes where state resets but the cookie persists.
    const canAccess = isAuthenticated || hasAuthCookie();
    const restrictedPath = isRestrictedPath(pathname);
    const isUnauthorizedForRoute = restrictedPath && canAccess && isReady && !hasOfficialRole(user?.roleNames);

    useEffect(() => {
      if (mounted && !canAccess) {
        router.replace('/login');
      }

      if (mounted && isUnauthorizedForRoute) {
        router.replace('/dashboard');
      }
    }, [mounted, canAccess, isUnauthorizedForRoute, router]);

    // Keep server and client first-pass identical to avoid hydration mismatch.
    // hasAuthCookie() always returns false on the server, so we defer the real
    // check until after mount when document.cookie is available.
    if (!mounted || !isReady) return spinScreen;

    if (!canAccess || isUnauthorizedForRoute) return spinScreen;

    return <WrappedComponent {...props} />;
  };

  AuthGuard.displayName = `withAuth(${WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component'})`;

  return AuthGuard;
}
