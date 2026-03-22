import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { useWorkspace } from '../hooks/useWorkspace';
import { Plus, ChevronRight } from 'lucide-react';

export default function WorkspaceList() {
  const { workspaces } = useWorkspace();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);

  return (
    <PageWrapper
      title="Workspaces"
      subtitle="Manage your business locations or separate companies"
      actionButton={
        <button onClick={() => setIsAdding(true)} className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm font-medium transition-colors">
          <Plus className="h-4 w-4 mr-2" /> New Workspace
        </button>
      }
    >
      {isAdding && (
         <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-4">
           <h3 className="text-lg font-medium mb-4">Create Workspace</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <input type="text" placeholder="Workspace Name" className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border outline-none" />
             <input type="text" placeholder="Description" className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border outline-none" />
             <input type="color" defaultValue="#3b82f6" className="block w-full h-10 rounded-md border-gray-300 dark:border-gray-600 cursor-pointer" />
           </div>
           <div className="mt-4 flex gap-2">
             <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors">Cancel</button>
             <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-600 rounded-md transition-colors">Save</button>
           </div>
         </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {workspaces.map((ws) => (
              <tr key={ws.id} onClick={() => navigate(`/settings/workspaces/${ws.id}`)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full mr-3" style={{ backgroundColor: ws.color }}></div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{ws.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {ws.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {ws.userCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {ws.productCount} items
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <ChevronRight className="h-5 w-5 text-gray-400 inline-block" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}
