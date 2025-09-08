'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ReactNode } from 'react';

export default function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class" // adds `class="dark"` or `class="light"` to <html>
      defaultTheme="system" // or "light" | "dark"
      enableSystem={true}
    >
      {children}
    </NextThemesProvider>
  );
}
