import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const WorkspaceContext = createContext(null);

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
};

export const WorkspaceProvider = ({ children }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = useCallback(async () => {
    if (!user) {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/workspaces/my-workspaces');
      setWorkspaces(data.workspaces);

      // Restore active workspace from localStorage or use first
      const savedId = localStorage.getItem('ims_active_workspace');
      const saved = data.workspaces.find(w => w.id === parseInt(savedId));
      const initial = saved || data.workspaces[0] || null;

      setActiveWorkspace(initial);
      if (initial) {
        localStorage.setItem('ims_active_workspace', initial.id);
      }
    } catch {
      // Silently fail — auth interceptor handles 401
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const switchWorkspace = (id) => {
    if (id === null) {
      // Admin: "All workspaces" mode
      setActiveWorkspace(null);
      localStorage.removeItem('ims_active_workspace');
      return;
    }
    // Validate the workspace is in the user's assigned list before switching
    const ws = workspaces.find(w => w.id === id);
    if (!ws) return; // Silently block unauthorized workspace access
    setActiveWorkspace(ws);
    localStorage.setItem('ims_active_workspace', ws.id);
  };

  const resetWorkspace = useCallback(() => {
    setWorkspaces([]);
    setActiveWorkspace(null);
    localStorage.removeItem('ims_active_workspace');
  }, []);

  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      activeWorkspace,
      switchWorkspace,
      loading,
      refreshWorkspaces: fetchWorkspaces,
      resetWorkspace
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};
