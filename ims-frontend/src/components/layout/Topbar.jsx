import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { Search, Bell, Sun, Moon, LogOut, User } from 'lucide-react';

export default function Topbar({ title }) {
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 transition-colors">
      <div className="flex flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">{title}</h1>
        </div>
      </div>
      
      <div className="flex flex-1 justify-center max-sm:hidden">
        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 dark:text-gray-100 dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-colors outline-none"
            placeholder="Search everywhere..."
          />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-x-4 lg:gap-x-6">
        <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 block w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900"></span>
        </button>
        
        <button onClick={toggleTheme} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 max-lg:hidden" />

        <div className="flex items-center gap-x-4 relative group cursor-pointer">
          <div className="flex bg-primary/10 h-9 w-9 items-center justify-center rounded-full text-primary font-medium hover:bg-primary/20 transition-colors">
             U
          </div>
          <div className="hidden group-hover:block absolute right-0 top-full mt-2 w-48 rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none overflow-hidden">
            <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <User className="mr-2 h-4 w-4" /> Profile
            </button>
            <button onClick={logout} className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
