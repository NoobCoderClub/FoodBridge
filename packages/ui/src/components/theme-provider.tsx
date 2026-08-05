'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * `attribute="class"` matches the `@custom-variant dark (&:is(.dark *))` already
 * declared in the design system, so the `dark:` variant keys off a class on
 * <html> rather than a media query. next-themes injects a blocking script that
 * sets that class before first paint, which is what prevents the flash of the
 * wrong theme.
 *
 * The consuming <html> element needs suppressHydrationWarning.
 */
function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

export { ThemeProvider };
