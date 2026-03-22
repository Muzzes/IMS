import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);
  const title = pathParts.length > 0 
    ? pathParts[0]
    : 'Dashboard';

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors font-sans text-gray-900 dark:text-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col lg:pl-[220px] max-lg:pl-16 transition-all duration-300 h-full">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto w-full pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
