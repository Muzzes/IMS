import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useAuth } from '../../hooks/useAuth';
import { ChevronDown, Check, Globe } from 'lucide-react';

export default function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, switchWorkspace } = useWorkspace();
  const { role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-md bg-gray-800/50 p-2 text-sm text-gray-300 border border-gray-700/50 hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center overflow-hidden">
          {activeWorkspace ? (
            <>
              <div className="h-2.5 w-2.5 rounded-full mr-2 shrink-0" style={{ backgroundColor: activeWorkspace.color }}></div>
              <span className="truncate">{activeWorkspace.name}</span>
            </>
          ) : (
            <>
              <Globe className="h-4 w-4 mr-2 shrink-0 text-blue-400" />
              <span className="truncate">Global View</span>
            </>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-full rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 z-50">
          {role === 'admin' && (
            <button
              onClick={() => { switchWorkspace(null); setIsOpen(false); }}
              className="flex w-full items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2 text-blue-400" />
                Global View
              </div>
              {activeWorkspace === null && <Check className="h-4 w-4 text-primary" />}
            </button>
          )}
          
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => { switchWorkspace(ws.id); setIsOpen(false); }}
              className="flex w-full items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="flex items-center">
                <div className="h-2.5 w-2.5 rounded-full mr-2" style={{ backgroundColor: ws.color }}></div>
                {ws.name}
              </div>
              <div className="flex items-center">
                <span className="bg-gray-100 dark:bg-gray-700 text-xs px-2 py-0.5 rounded-full mr-2">{ws.productCount}</span>
                {activeWorkspace?.id === ws.id && <Check className="h-4 w-4 text-primary" />}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
