'use client';

import { SunMoon } from 'lucide-react';
import { SwitchWithIcon } from './ui/Switch';
import { useColorScheme, useLocalStorage } from '@mantine/hooks';
import { useEffect, useState } from 'react';

const ThemeSwitch = () => {
  const colorScheme = useColorScheme();
  const [colorStorage, setColorStorage] = useLocalStorage({
    key: 'theme',
    defaultValue: 'dark',
  });
  const [isChecked, setChecked] = useState(false);

  useEffect(() => {
    if (
      colorStorage === 'dark' ||
      (!('theme' in localStorage) && colorScheme === 'dark')
    ) {
      setChecked(true);
    } else {
      setChecked(false);
    }
  }, [colorScheme, colorStorage]);

  function handleSwitch(checked: boolean) {
    if (checked) {
      document.documentElement.classList.add('dark');
      setColorStorage('dark');
      setChecked(true);
    } else {
      document.documentElement.classList.remove('dark');
      setColorStorage('light');
      setChecked(false);
    }
  }

  return (
    <SwitchWithIcon checked={isChecked} onCheckedChange={handleSwitch}>
      <SunMoon />
    </SwitchWithIcon>
  );
};

export default ThemeSwitch;
