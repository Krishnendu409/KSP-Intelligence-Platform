import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from './useThemeStore';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={className ?? 'nav-item w-full'}
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span className="nav-label">{theme === 'dark' ? 'LIGHT' : 'DARK'}</span>
    </button>
  );
};
