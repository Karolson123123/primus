"use client";

import { useTheme } from './ThemeProvider';
import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="icon"
      className="bg-transparent border-[var(--yellow)] hover:bg-[var(--yellow)] hover:text-white"
    >
      {theme === 'dark' ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] invert" />
      )}
    </Button>
  );
};