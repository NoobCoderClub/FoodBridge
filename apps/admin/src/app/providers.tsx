'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@repo/ui/theme-provider';
import { Toaster } from '@repo/ui/toast';
import { queryClient } from '@/lib/query-client';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster>{children}</Toaster>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
