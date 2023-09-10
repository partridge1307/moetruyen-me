'use client';

import { useColorScheme, useLocalStorage } from '@mantine/hooks';
import { useEffect } from 'react';

const ThemeChangeClient = () => {
  const colorScheme = useColorScheme();
  const [colorStorage] = useLocalStorage({
    key: 'theme',
    defaultValue: 'dark',
  });

  useEffect(() => {
    if (
      colorStorage === 'dark' ||
      (!('theme' in localStorage) && colorScheme === 'dark')
    ) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [colorScheme, colorStorage]);

  return null;
};

export default ThemeChangeClient;
