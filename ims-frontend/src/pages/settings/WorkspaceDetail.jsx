import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { useWorkspace } from '../hooks/useWorkspace';
import { Settings, Shield, Trash2, ArrowLeft } from 'lucide-react';
import { mockWorkspaceUsers } from '../utils/mockData';

export default function WorkspaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { workspaces } = useWorkspace();
  const workspace = workspaces.find(w => w.id === parseInt(id));

  if (!workspace) return <div className="p-8">Workspace not found</div>;

  return (
    <PageWrapper
      title={
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 text-gray-400 hover:text-gray-600 transition-colors">
             <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="h-4 w-4 rounded-full mr-3" style={{ backgroundColor: workspace.color }}></div>
          {workspace.name}
        </div>
      }
      subtitle={workspace.description}
      actionButton={
        <button className="flex items-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium transition-colors">
          <Settings className="h-4 w-4 mr-2" /> Edit Details
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
               <h3 className="text-lg font-medium">Assigned Users</h3>
            </div>
            <div className="p-0">
               <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Access Level</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {mockWorkspaceUsers.filter(u => u.workspace_id === workspace.id).map((u, i) => (
                       <tr key={i}>
                         <td className="px-6 py-4 text-sm font-medium">User ID {u.user_id}</td>
                         <td className="px-6 py-4 text-sm">
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.access_level === 'full' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                              {u.access_level}
                           </span>
                         </td>
                         <td className="px-6 py-4 text-sm text-right">
                           <select defaultValue={u.access_level} className="text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 outline-none p-1">
                             <option value="full">Full Access</option>
                             <option value="read_only">Read Only</option>
                           </select>
                         </td>
                       </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center"><Shield className="h-5 w-5 mr-2 text-primary"/> Security & Data</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500">Products</span>
                <span className="font-medium">{workspace.productCount}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500">Low Stock Items</span>
                <span className="font-medium text-warning">2</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-900/50 p-6">
            <h3 className="text-lg font-medium mb-2 text-red-600 dark:text-red-400">Danger Zone</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Archiving this workspace will hide it from all users but preserve its historical data.
            </p>
            <button className="flex w-full justify-center items-center bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-2 rounded-md hover:bg-red-100 dark:hover:bg-red-500/20 text-sm font-medium transition-colors border border-red-200 dark:border-red-900/50">
               <Trash2 className="h-4 w-4 mr-2" /> Archive Workspace
            </button>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
