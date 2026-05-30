/**
 * App Providers
 *
 * Root-level providers wrapper for the application.
 * Encapsulates QueryClient, theme, and any future global contexts.
 */
import React, { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/shared/config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: config.query.staleTime,
      gcTime: config.query.gcTime,
      retry: config.query.retry,
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Wraps the app with all necessary providers.
 * Add new global providers here (e.g., auth context, feature flags).
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
