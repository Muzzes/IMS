import { useState, useRef, useEffect } from 'react';
import { HiChevronDown, HiGlobeAlt } from 'react-icons/hi2';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';

const WorkspaceSwitcher = () => {
  const { workspaces, activeWorkspace, switchWorkspace } = useWorkspace();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (workspaces.length <= 1 && user?.role !== 'admin') return null;

  return (
    <div ref={ref} className="relative px-3 mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl
                   bg-white/60 dark:bg-surface-800/60 backdrop-blur-sm
                   border border-surface-200 dark:border-surface-700
                   hover:border-primary-300 dark:hover:border-primary-600
                   transition-all duration-200 group"
        id="workspace-switcher-btn"
      >
        <span
          className="w-3 h-3 rounded-full shrink-0 ring-2 ring-white dark:ring-surface-900"
          style={{ backgroundColor: activeWorkspace?.color || '#6366f1' }}
        />
        <span className="text-sm font-semibold text-surface-800 dark:text-surface-100 truncate flex-1 text-left">
          {activeWorkspace?.name || 'All Workspaces'}
        </span>
        <HiChevronDown className={`w-4 h-4 text-surface-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-3 right-3 mt-1 z-50
                        bg-white dark:bg-surface-800 rounded-xl shadow-xl
                        border border-surface-200 dark:border-surface-700
                        py-1 animate-scaleIn origin-top">
          {workspaces.map(ws => (
            <button
              key={ws.id}
              onClick={() => { switchWorkspace(ws.id); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm
                         hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors
                         ${activeWorkspace?.id === ws.id ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold' : 'text-surface-700 dark:text-surface-300'}`}
              id={`workspace-option-${ws.id}`}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ws.color || '#6366f1' }} />
              <span className="truncate">{ws.name}</span>
            </button>
          ))}

          {user?.role === 'admin' && (
            <>
              <div className="border-t border-surface-200 dark:border-surface-700 my-1" />
              <button
                onClick={() => { switchWorkspace(null); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm
                           hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors
                           ${!activeWorkspace ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold' : 'text-surface-700 dark:text-surface-300'}`}
                id="workspace-option-all"
              >
                <HiGlobeAlt className="w-3.5 h-3.5 text-primary-500" />
                <span>All Workspaces</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkspaceSwitcher;
