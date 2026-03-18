import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'hooks/useTheme';
import './ThemeToggle.scss';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className={`theme-toggle-icon ${isDark ? 'hidden' : 'visible'}`}>
        <Sun size={18} />
      </span>
      <span className={`theme-toggle-icon ${isDark ? 'visible' : 'hidden'}`}>
        <Moon size={18} />
      </span>
    </button>
  );
};
