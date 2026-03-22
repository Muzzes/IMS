import React, { createContext, useState, useEffect } from 'react';
import { mockWorkspaces } from '../utils/mockData';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const { role } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch
    setTimeout(() => {
      setWorkspaces(mockWorkspaces);
      const saved = localStorage.getItem('activeWorkspace');
      if (saved) {
        const found = mockWorkspaces.find(w => w.id === parseInt(saved));
        if (found) {
          setActiveWorkspace(found);
        } else if (role !== 'admin' && mockWorkspaces.length > 0) {
          setActiveWorkspace(mockWorkspaces[0]);
        }
      } else if (role !== 'admin' && mockWorkspaces.length > 0) {
        setActiveWorkspace(mockWorkspaces[0]);
      }
      setLoading(false);
    }, 500);
  }, [role]);

  const switchWorkspace = (id) => {
    setLoading(true);
    setTimeout(() => {
      if (id === null) {
        setActiveWorkspace(null); // global view
        localStorage.removeItem('activeWorkspace');
        toast.success(`Switched to Global View`);
      } else {
        const found = workspaces.find(w => w.id === id);
        if (found) {
          setActiveWorkspace(found);
          localStorage.setItem('activeWorkspace', id.toString());
          toast.success(`Switched to ${found.name}`);
        }
      }
      setLoading(false);
    }, 300); // Brief delay for UX
  };

  return (
    <WorkspaceContext.Provider value={{ workspaces, activeWorkspace, switchWorkspace, isLoadingWorkspace: loading }}>
      {children}
    </WorkspaceContext.Provider>
  );
};
