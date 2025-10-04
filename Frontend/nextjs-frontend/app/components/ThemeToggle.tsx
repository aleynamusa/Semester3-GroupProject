'use client';
import React, {useEffect, useState} from 'react';
import { Sun, Moon } from 'lucide-react'; 

export default function ThemeToggle() {
     const [isDark, setIsDark] = useState(true);

    useEffect(() => {
    // Apply dark mode by default on load
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:scale-105 transition"
      aria-label="Toggle theme"
    >
      {isDark ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
