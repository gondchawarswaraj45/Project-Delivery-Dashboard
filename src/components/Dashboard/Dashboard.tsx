import React, { useState } from 'react';
import {
  Search,
  Plus,
  Sparkles,
  Bot,
  Clock,
  ChevronRight,
  Filter,
  RefreshCw,
} from 'lucide-react';

import { useProjectContext } from '../../context/ProjectContext';
import { Project, NaturalLanguageQueryResult } from '../../types';
import { processNaturalLanguageQuery } from '../../utils/nlQuery';
import { API_BASE_URL } from '../../utils/apiConfig';
import { NewProjectModal } from './NewProjectModal';


export const Dashboard: React.FC = () => {
  const { projects, customers, users, setSelectedProjectId, tasks, viewMode, setViewMode } = useProjectContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('c1'); // Default to Pune Robotics in Customer View
  const [nlQueryInput, setNlQueryInput] = useState('');
  const [nlResult, setNlResult] = useState<NaturalLanguageQueryResult | null>(null);
  const [isNlLoading, setIsNlLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeOwnerPopover, setActiveOwnerPopover] = useState<string | null>(null);


  // Stale project detection (> 7 days inactive)
  const isProjectStale = (p: Project) => {
    const diffDays = (Date.now() - new Date(p.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 7;
  };

  // Filter projects by customer in Customer View
  const customerScopedProjects = projects.filter((p) => {
    if (viewMode === 'customer' && selectedCustomerId !== 'ALL') {
      return p.customerId === selectedCustomerId;
    }
    return true;
  });

  const staleCount = customerScopedProjects.filter(isProjectStale).length;
  const onTrackCount = customerScopedProjects.filter((p) => p.status === 'ON_TRACK').length;
  const atRiskCount = customerScopedProjects.filter((p) => p.status === 'AT_RISK').length;
  const blockedCount = customerScopedProjects.filter((p) => p.status === 'BLOCKED').length;
  const completedCount = customerScopedProjects.filter((p) => p.status === 'COMPLETED').length;

  // Filter projects logic
  const filteredProjects = customerScopedProjects.filter((p) => {
    const cust = customers.find((c) => c.id === p.customerId);
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Status filter
    if (selectedStatusFilter === 'ON_TRACK') return p.status === 'ON_TRACK';
    if (selectedStatusFilter === 'AT_RISK') return p.status === 'AT_RISK';
    if (selectedStatusFilter === 'BLOCKED') return p.status === 'BLOCKED';
    if (selectedStatusFilter === 'COMPLETED') return p.status === 'COMPLETED';
    if (selectedStatusFilter === 'STALE') return isProjectStale(p);
    if (nlResult && nlResult.matchedProjectIds.length > 0) {
      return nlResult.matchedProjectIds.includes(p.id);
    }

    return true;
  });

  // Handle Natural Language query submit
  const handleNlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlQueryInput.trim()) return;
    setIsNlLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/nl-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: nlQueryInput.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setNlResult(data);
      } else {
        const fallback = processNaturalLanguageQuery(nlQueryInput, projects, tasks, users);
        setNlResult(fallback);
      }
    } catch {
      const fallback = processNaturalLanguageQuery(nlQueryInput, projects, tasks, users);
      setNlResult(fallback);
    } finally {

      setIsNlLoading(false);
    }
  };


  const clearNlQuery = () => {
    setNlQueryInput('');
    setNlResult(null);
  };

  // Helper for last updated relative time string
  const formatLastUpdated = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const currentActiveCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Customer View Banner Callout with Client Account Selector */}
      {viewMode === 'customer' && (
        <div className="customer-view-banner animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.4rem' }}>🏢</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <strong>Client Portal Active:</strong>
                <span style={{ color: '#065f46', fontWeight: 600 }}>
                  {selectedCustomerId === 'ALL' ? 'Multi-Client Overview' : `${currentActiveCustomer?.name} (${currentActiveCustomer?.industry})`}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#047857', marginTop: '2px' }}>
                Secure isolation active — Viewing only your company's projects &amp; verified milestone deliverables.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Customer Switcher Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#065f46', fontWeight: 600 }}>
              <span>Simulate Client:</span>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: '1px solid #6ee7b7',
                  background: '#ffffff',
                  color: '#065f46',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
                <option value="ALL">All Clients (Demo Mode)</option>
              </select>
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => setViewMode('internal')}
              style={{ fontSize: '0.75rem', padding: '5px 12px', background: '#fff', color: '#047857', border: '1px solid #a7f3d0' }}
            >
              Switch to Internal View
            </button>
          </div>
        </div>
      )}

      {/* Top Header Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            {viewMode === 'internal' ? 'Projects Delivery Operations' : 'Client Delivery Portal'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {viewMode === 'internal'
              ? 'Real-time engineering health, multi-owner allocation & AI extracted updates'
              : 'Real-time delivery progress, verified milestone status & target schedules'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder={viewMode === 'internal' ? 'Search projects or owners...' : 'Search your projects...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                fontSize: '0.875rem',
              }}
            />
          </div>

          {viewMode === 'internal' && (
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} />
              <span>New Project</span>
            </button>
          )}
        </div>
      </div>

      {/* PROJECT STATUS — compact summary bar */}
      <div
        className="glass-panel"
        style={{ padding: '14px 20px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '0', flexWrap: 'wrap' }}
      >
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: '18px' }}>
          {viewMode === 'internal' ? 'Project Status' : 'Delivery Overview'}
        </span>

        {[
          { key: 'ALL',       label: `${customerScopedProjects.length} Total`,    color: 'var(--text-main)' },
          { key: 'ON_TRACK',  label: `${onTrackCount} On Track`,   color: 'var(--status-ontrack-color)',   icon: '●' },
          { key: 'AT_RISK',   label: `${atRiskCount} In Progress`,  color: 'var(--status-atrisk-color)',    icon: '●' },
          { key: 'BLOCKED',   label: `${blockedCount} ${viewMode === 'internal' ? 'Blocked' : 'Needs Action'}`, color: 'var(--status-blocked-color)',   icon: '●' },
          { key: 'COMPLETED', label: `${completedCount} Completed`,color: 'var(--status-completed-color)', icon: '●' },
        ].map((item, i) => (
          <button
            key={item.key}
            onClick={() => setSelectedStatusFilter(item.key)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '4px 14px',
              borderRight: i < 4 ? '1px solid var(--border-color)' : 'none',
              display: 'flex', alignItems: 'center', gap: '5px',
              fontWeight: selectedStatusFilter === item.key ? 700 : 400,
              opacity: selectedStatusFilter === item.key ? 1 : 0.75,
            }}
          >
            {item.icon && <span style={{ color: item.color, fontSize: '0.65rem' }}>{item.icon}</span>}
            <span style={{ fontSize: '0.85rem', color: item.color }}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* ⚠ ATTENTION — Stale alert row (Internal only) */}
      {staleCount > 0 && viewMode === 'internal' && (
        <div
          onClick={() => setSelectedStatusFilter('STALE')}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 20px', marginBottom: '12px',
            background: 'var(--status-stale-bg)',
            border: '1px solid var(--status-stale-border)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
          }}
        >
          <Clock size={15} color="var(--status-stale-color)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--status-stale-color)' }}>ATTENTION</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--status-stale-color)' }}>⚠ {staleCount} Stale Project{staleCount > 1 ? 's' : ''} — no activity in 7+ days. Click to view.</span>
        </div>
      )}

      {/* Natural Language Query Assistant (Internal view) */}
      {viewMode === 'internal' && (
        <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.04), rgba(124, 58, 237, 0.04))' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={18} color="#7c3aed" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Portfolio AI Intelligence Assistant
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(249, 115, 22, 0.15)', color: '#f97316', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              ⚡ Powered by Groq Llama 3
            </span>
          </div>

          <form onSubmit={handleNlSubmit} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="text"
              placeholder='Ask about your projects... e.g. "Which projects are behind schedule?" or "Show blocked tasks"'
              value={nlQueryInput}
              onChange={(e) => setNlQueryInput(e.target.value)}
              disabled={isNlLoading}
              style={{
                flex: 1,
                padding: '10px 14px',
                fontSize: '0.9rem',
              }}
            />
            <button
              type="submit"
              className="btn btn-secondary"
              disabled={isNlLoading || !nlQueryInput.trim()}
              style={{ border: '1px solid #7c3aed', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {isNlLoading ? (
                <>
                  <RefreshCw size={14} className="spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Ask AI</span>
                </>
              )}
            </button>
            {nlResult && (
              <button type="button" className="btn btn-ghost" onClick={clearNlQuery} style={{ fontSize: '0.8rem' }}>
                Clear
              </button>
            )}
          </form>

          {/* AI Answer Box */}
          {nlResult && (
            <div className="animate-fade-in" style={{ marginTop: '14px', padding: '14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #7c3aed', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#7c3aed', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} /> AI Portfolio Insights Response:
                </div>
                {nlResult.engine && (
                  <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.18)', color: '#c084fc', fontWeight: 600 }}>
                    ⚡ {nlResult.engine}
                  </span>
                )}
              </div>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                {nlResult.answer}
              </div>
            </div>
          )}
        </div>
      )}


      {/* Filter Tabs Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '8px' }}>
          <Filter size={14} /> Filter:
        </span>

        {[
          { key: 'ALL', label: `All (${customerScopedProjects.length})` },
          { key: 'ON_TRACK', label: `On Track (${onTrackCount})` },
          { key: 'AT_RISK', label: `In Progress (${atRiskCount})` },
          { key: 'BLOCKED', label: `${viewMode === 'internal' ? 'Blocked' : 'Needs Action'} (${blockedCount})` },
          ...(viewMode === 'internal' ? [{ key: 'STALE', label: `⚠ Stale (${staleCount})` }] : []),
          { key: 'COMPLETED', label: `Completed (${completedCount})` },
        ].map((tab) => {
          const active = selectedStatusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedStatusFilter(tab.key)}
              className="btn btn-ghost"
              style={{
                fontSize: '0.8rem',
                padding: '5px 12px',
                borderRadius: '16px',
                background: active ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-surface)',
                border: active ? '1px solid #2563eb' : '1px solid var(--border-color)',
                color: active ? '#2563eb' : 'var(--text-muted)',
                fontWeight: active ? 600 : 400,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Project Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table className="project-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Customer</th>
              <th>{viewMode === 'internal' ? 'Owners' : 'Delivery Team'}</th>
              <th>Progress</th>
              <th>Status</th>
              <th>{viewMode === 'internal' ? 'Last Update' : 'Target Date'}</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((p) => {
              const cust = customers.find((c) => c.id === p.customerId);
              const pOwners = users.filter((u) => p.ownerIds.includes(u.id));
              const stale = isProjectStale(p);
              const daysDiff = Math.floor((Date.now() - new Date(p.lastUpdated).getTime()) / (1000 * 60 * 60 * 24));

              const pTasks = tasks.filter((t) => t.projectId === p.id);
              const pCompleted = pTasks.filter((t) => t.status === 'DONE').length;
              const pProgress = pTasks.length > 0 ? Math.round((pCompleted / pTasks.length) * 100) : p.progress;

              return (
                <tr key={p.id} onClick={() => setSelectedProjectId(p.id)}>
                  {/* Project Name & Description */}
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {viewMode === 'customer' && p.customerSummary ? p.customerSummary : p.description}
                    </div>
                  </td>

                  {/* Customer */}
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{cust?.name || 'Customer'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{cust?.industry}</div>
                  </td>

                  {/* Owners / Delivery Team */}
                  <td>
                    <div style={{ position: 'relative' }}>
                      <div className="owners-stack">
                        {pOwners.map((o) => (
                          <span
                            key={o.id}
                            className="owner-pill"
                            title={`${o.name} (${o.role})`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveOwnerPopover(activeOwnerPopover === `${p.id}-${o.id}` ? null : `${p.id}-${o.id}`);
                            }}
                          >
                            <span className="avatar-circle">{o.initials}</span>
                            <span>{o.name.split(' ')[0]}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>

                  {/* Progress Column with Mini 2D Ring + Bar */}
                  <td style={{ minWidth: '150px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <svg width="24" height="24" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="var(--border-color)"
                          strokeWidth="3.5"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={p.status === 'ON_TRACK' ? '#10b981' : p.status === 'AT_RISK' ? '#f59e0b' : p.status === 'BLOCKED' ? (viewMode === 'internal' ? '#ef4444' : '#f59e0b') : '#3b82f6'}
                          strokeWidth="3.5"
                          strokeDasharray={`${pProgress}, 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>{pProgress}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div
                        className={`progress-bar-fill ${p.status === 'AT_RISK' ? 'at-risk' : p.status === 'BLOCKED' ? (viewMode === 'internal' ? 'blocked' : 'at-risk') : ''}`}
                        style={{ width: `${pProgress}%` }}
                      />
                    </div>
                  </td>


                  {/* Status Badge */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                      <span className={`status-badge ${p.status}`}>
                        ● {viewMode === 'internal' ? p.status.replace('_', ' ') : (p.status === 'ON_TRACK' ? 'On Track' : p.status === 'BLOCKED' ? 'Action Needed' : p.status === 'AT_RISK' ? 'In Progress' : 'Completed')}
                      </span>
                      {stale && viewMode === 'internal' && (
                        <span className="status-badge STALE" title={`No status movement for ${daysDiff} days`}>
                          <Clock size={10} /> {daysDiff}d Stale
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Last Update (Internal) vs Target Date (Customer) */}
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {viewMode === 'internal' ? formatLastUpdated(p.lastUpdated) : p.targetDate}
                  </td>

                  {/* Action arrow */}
                  <td>
                    <ChevronRight size={18} color="var(--text-subtle)" />
                  </td>
                </tr>
              );
            })}

            {filteredProjects.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No projects match your search or status filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Project Modal */}
      <NewProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
