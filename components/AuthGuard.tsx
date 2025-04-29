import React, { useEffect } from 'react';
import { usePathname, useRouter, useSegments } from 'expo-router';
import { useGlobalContext } from '@/lib/global-provider';

type AuthGuardProps = {
  children: React.ReactNode;
};

/**
 * Component that controls access to routes based on authentication state
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isLogged, loading } = useGlobalContext();
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip protection during loading
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    // If not authenticated and not in auth group, redirect to sign-in
    if (!isLogged && !inAuthGroup) {
      // Use requestAnimationFrame to ensure we're not navigating during render
      requestAnimationFrame(() => {
        router.replace('/(auth)/sign-in');
      });
    }

    // If authenticated and in auth group, redirect to home
    if (isLogged && inAuthGroup) {
      // Use requestAnimationFrame to ensure we're not navigating during render
      requestAnimationFrame(() => {
        router.replace('/');
      });
    }
  }, [isLogged, loading, segments]);

  // We always render the children to avoid rendering issues
  // The navigation logic above will handle redirects as needed
  return <>{children}</>;
};

export default AuthGuard;