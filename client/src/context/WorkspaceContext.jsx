import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth, validateToken } from './AuthContext';

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

      // Validate saved workspace is assigned to this user
      const savedId = localStorage.getItem('ims_active_workspace');
      let initial = null;
      if (savedId) {
        const isAssigned = data.workspaces.find(w => w.id === parseInt(savedId));
        if (isAssigned) {
          initial = isAssigned;
        } else {
          localStorage.removeItem('ims_active_workspace');
          initial = data.workspaces[0] || null;
        }
      } else {
        initial = data.workspaces[0] || null;
      }

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
      const token = localStorage.getItem('ims_token');
      const decoded = validateToken(token);
      if (decoded?.role !== 'admin') return;

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
