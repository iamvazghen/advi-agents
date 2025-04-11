'use client';

import { useTheme } from '@/lib/theme';
import { useEffect } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return <>{children}</>;
}