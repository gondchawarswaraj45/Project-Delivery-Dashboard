import React, { useState } from 'react';
import { ArrowLeft, Lock, Eye, Calendar, Users as UsersIcon, Clock } from 'lucide-react';
import { useProjectContext } from '../../context/ProjectContext';
import { OverviewTab } from './OverviewTab';
import { MilestonesTab } from './MilestonesTab';
import { IssuesTab } from './IssuesTab';
import { ActivityTab } from './ActivityTab';
import { DocumentsTab } from './DocumentsTab';

export const ProjectDetail: React.FC = () => {
  const { selectedProjectId, setSelectedProjectId, projects, customers, users, viewMode, setViewMode, tasks } = useProjectContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'issues' | 'activity' | 'documents'>('overview');


  const project = projects.find((p) => p.id === selectedProjectId);
  if (!project) return null;

  const customer = customers.find((c) => c.id === project.customerId);
  const owners = users.filter((u) => project.ownerIds.includes(u.id));

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const completedTasksCount = projectTasks.filter((t) => t.status === 'DONE').length;
  const computedProgress = projectTasks.length > 0
    ? Math.round((completedTasksCount / projectTasks.length) * 100)
    : project.progress;


  // Calculate days remaining
  const daysRemaining = Math.max(
    0,
    Math.ceil((new Date(project.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  // Stale detection: > 7 days since last update
  const daysSinceUpdate = Math.floor((Date.now() - new Date(project.lastUpdated).getTime()) / (1000 * 60 * 60 * 24));
  const isStale = daysSinceUpdate > 7;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Back to Projects link */}
      <button
        className="btn btn-ghost"
        onClick={() => setSelectedProjectId(null)}
        style={{ marginBottom: '20px', padding: '4px 10px', color: 'var(--text-muted)' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Projects</span>
      </button>

      {/* Customer View Banner */}
      {viewMode === 'customer' && (
        <div className="customer-view-banner animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Eye size={18} />
            <div>
              <strong>Customer View Active</strong> — Presenting client-safe milestone data for <strong>{project.name}</strong>. Sensitive internal blocker logs, developer issue tags, and credentials are automatically redacted.
            </div>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => setViewMode('internal')}
            style={{ fontSize: '0.75rem', padding: '4px 10px', background: '#fff', color: '#047857', border: '1px solid #a7f3d0' }}
          >
            <Lock size={12} /> Switch to Internal View
          </button>
        </div>
      )}

      {/* Stale Project Warning Banner (Internal only) */}
      {isStale && viewMode === 'internal' && (
        <div
          className="animate-fade-in"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 20px', marginBottom: '16px',
            background: 'var(--status-stale-bg)',
            border: '1px solid var(--status-stale-border)',
            borderRadius: 'var(--radius-md)',
            gap: '12px', flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={16} color="var(--status-stale-color)" />
            <span style={{ fontWeight: 700, color: 'var(--status-stale-color)', fontSize: '0.9rem' }}>
              ⚠ Internal Alert: No status movement for {daysSinceUpdate} days
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Last updated: {new Date(project.lastUpdated).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <button
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 14px', border: '1px solid var(--status-stale-border)', color: 'var(--status-stale-color)' }}
            onClick={() => alert(`Owner update request sent to: ${owners.map(o => o.email).join(', ')}`)}
          >
            📧 Ask Owner for Update
          </button>
        </div>
      )}

      {/* Project Header Banner */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              {customer?.name || 'Customer Project'} • {customer?.industry}
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)', marginBottom: '8px' }}>
              {project.name}
            </h1>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '700px' }}>
              {project.description}
            </div>
          </div>

          {/* Right Status & Completion */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className={`status-badge ${project.status}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                ● {viewMode === 'internal' ? project.status.replace('_', ' ') : (project.status === 'ON_TRACK' ? 'On Track' : project.status === 'BLOCKED' ? 'Action Needed' : project.status === 'AT_RISK' ? 'In Progress' : 'Completed')}
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {computedProgress}% Complete
              </span>
            </div>

            {/* View Mode Toggle Switcher on Detail Header */}
            <div className="view-toggle" style={{ marginTop: '8px' }}>
              <button
                className={viewMode === 'internal' ? 'active internal' : ''}
                onClick={() => setViewMode('internal')}
                title="View full internal notes, developer issues, and raw updates"
              >
                <Lock size={12} />
                <span>Internal View</span>
              </button>
              <button
                className={viewMode === 'customer' ? 'active customer' : ''}
                onClick={() => setViewMode('customer')}
                title="View customer-safe milestone data and approved deliverables"
              >
                <Eye size={12} />
                <span>Customer View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Owners & Dates Meta Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          {/* Owners (Internal) vs Implementation Contacts (Customer) */}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UsersIcon size={14} /> {viewMode === 'internal' ? 'Internal Owners' : 'Your Delivery Team'}
            </div>
            <div className="owners-stack">
              {owners.map((owner) => (
                <div key={owner.id} className="owner-pill" title={`${owner.name} (${owner.role})`}>
                  <div className="avatar-circle">{owner.initials}</div>
                  <span>{owner.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} /> Kickoff Date
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>{project.startDate}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} /> Expected Delivery
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>{project.targetDate}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} /> Timeline Buffer
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#38bdf8' }}>{daysRemaining} Days Remaining</div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px', overflowX: 'auto' }}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'milestones', label: 'Milestones' },
          { key: 'issues', label: viewMode === 'internal' ? 'Issues & Bugs' : 'Support Inquiries' },
          { key: 'activity', label: viewMode === 'internal' ? 'Activity & AI Updates' : 'Latest Updates' },
          { key: 'documents', label: 'Documents & Assets' },
        ].map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className="btn btn-ghost"
              style={{
                fontSize: '0.9rem',
                padding: '10px 18px',
                borderRadius: '0',
                borderBottom: active ? '2px solid #38bdf8' : '2px solid transparent',
                color: active ? '#38bdf8' : 'var(--text-muted)',
                fontWeight: active ? 700 : 500,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab Component Render */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && <OverviewTab project={project} />}
        {activeTab === 'milestones' && <MilestonesTab project={project} />}
        {activeTab === 'issues' && <IssuesTab project={project} />}
        {activeTab === 'activity' && <ActivityTab project={project} />}
        {activeTab === 'documents' && <DocumentsTab project={project} />}
      </div>
    </div>
  );
};
