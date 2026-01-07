import { memo } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../utils/cn';

export const ThemeToggle = memo(() => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'p-2 rounded-lg transition-all',
        'bg-gray-200 dark:bg-gray-800',
        'hover:bg-gray-300 dark:hover:bg-gray-700',
        'active:scale-95'
      )}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-gray-700" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-400" />
      )}
    </button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';
