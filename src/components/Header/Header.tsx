import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Lock, Eye, RefreshCw, Sun, Moon } from 'lucide-react';
import { useProjectContext } from '../../context/ProjectContext';

export const Header: React.FC = () => {
  const { viewMode, setViewMode, setSelectedProjectId, resetToDemoData } = useProjectContext();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  return (
    <header className="app-header">
      <div className="brand" onClick={() => setSelectedProjectId(null)}>
        <div className="brand-icon">
          <LayoutDashboard size={20} />
        </div>
        <div>
          <h1 className="brand-title">Project Delivery Dashboard</h1>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Internal vs Customer View Toggle Switcher */}
        <div className="view-toggle">
          <button
            className={viewMode === 'internal' ? 'active internal' : ''}
            onClick={() => setViewMode('internal')}
            title="Full information mode - Internal team view"
          >
            <Lock size={14} />
            <span>Internal View</span>
          </button>
          <button
            className={viewMode === 'customer' ? 'active customer' : ''}
            onClick={() => setViewMode('customer')}
            title="Safe information mode - Customer client view"
          >
            <Eye size={14} />
            <span>Customer View</span>
          </button>
        </div>

        {/* Theme Toggle Button (Light/White theme default) */}
        <button
          className="btn btn-secondary"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'White'} theme`}
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          <span>{theme === 'light' ? 'Dark' : 'White'} Theme</span>
        </button>

        {/* Reset Demo Data Button */}
        <button
          className="btn btn-ghost"
          onClick={() => {
            if (window.confirm('Reset all projects back to synthetic demo data?')) {
              resetToDemoData();
            }
          }}
          title="Reset back to initial 8 synthetic demo projects"
          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
        >
          <RefreshCw size={14} />
          <span>Reset Demo</span>
        </button>
      </div>
    </header>
  );
};
