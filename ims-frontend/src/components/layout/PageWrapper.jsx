import React from 'react';

export default function PageWrapper({ title, subtitle, actionButton, children }) {
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          {title && <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:tracking-tight">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        {actionButton && (
          <div className="mt-4 flex sm:ml-4 sm:mt-0">
            {actionButton}
          </div>
        )}
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}
