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
  if (workspaces.length === 0) return null;

  return (
    <div ref={ref} className="relative mt-2 mb-2" style={{ padding: '8px 10px', margin: '8px 12px', background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
      <button
        onClick={() => { if(user?.role === 'admin') setOpen(!open) }}
        className={`w-full flex items-center gap-2.5 px-1 py-1 transition-all duration-200 ${user?.role === 'admin' ? 'cursor-pointer group' : 'cursor-default'}`}
        id="workspace-switcher-btn"
      >
        <span
          className="rounded-full shrink-0"
          style={{ width: '8px', height: '8px', backgroundColor: activeWorkspace?.color || '#818cf8' }}
        />
        <span className="truncate flex-1 text-left" style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500 }}>
          {activeWorkspace?.name || 'All Workspaces'}
        </span>
        {user?.role === 'admin' && (
          <HiChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 py-1 animate-scaleIn origin-top"
             style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)', borderRadius: '10px' }}>
          {workspaces.map(ws => (
            <button
              key={ws.id}
              onClick={() => { switchWorkspace(ws.id); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors nav-item"
              style={{
                color: activeWorkspace?.id === ws.id ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              id={`workspace-option-${ws.id}`}
            >
              <span className="rounded-full shrink-0" style={{ width: '8px', height: '8px', backgroundColor: ws.color || '#818cf8' }} />
              <span className="truncate">{ws.name}</span>
            </button>
          ))}

          {user?.role === 'admin' && (
            <>
              <div className="my-1" style={{ borderTop: '1px solid var(--border-faint)' }} />
              <button
                onClick={() => { switchWorkspace(null); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors nav-item"
                style={{ color: !activeWorkspace ? 'var(--accent-bright)' : 'var(--text-secondary)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                id="workspace-option-all"
              >
                <HiGlobeAlt className="w-4 h-4" style={{ color: 'var(--accent-bright)' }} />
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
