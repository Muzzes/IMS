import React from 'react';

export default function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
}
