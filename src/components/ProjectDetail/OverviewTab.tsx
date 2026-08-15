import React from 'react';
import { Project } from '../../types';
import { useProjectContext } from '../../context/ProjectContext';
import { MilestoneDeliveryPipeline } from './MilestoneDeliveryPipeline';
import { AIUpdateProcessorCard } from './AIUpdateProcessorCard';
import { Activity as ActivityIcon } from 'lucide-react';


interface OverviewTabProps {
  project: Project;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ project }) => {
  const { milestones, tasks, activities, viewMode } = useProjectContext();

  const projectMilestones = milestones.filter((m) => m.projectId === project.id);
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const completedTasks = projectTasks.filter((t) => t.status === 'DONE').length;
  const inProgressTasks = projectTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const blockedTasks = projectTasks.filter((t) => t.status === 'BLOCKED').length;
  const notStartedTasks = projectTasks.filter((t) => t.status === 'NOT_STARTED').length;

  const totalTasks = Math.max(projectTasks.length, 1);
  const donePct = Math.round((completedTasks / totalTasks) * 100);
  const inProgPct = Math.round((inProgressTasks / totalTasks) * 100);
  const blockedPct = Math.round((blockedTasks / totalTasks) * 100);
  const notStartedPct = Math.max(0, 100 - donePct - inProgPct - blockedPct);

  const projectActivities = activities.filter((a) => a.projectId === project.id).slice(0, 3);


  // Relative time format
  const formatLastUpdated = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Project Health & Progress Overview Card */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Project Health
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontWeight: 800 }}>
                {project.status === 'ON_TRACK' && <span style={{ color: 'var(--status-ontrack-color)' }}>🟢 On Track</span>}
                {project.status === 'AT_RISK' && <span style={{ color: 'var(--status-atrisk-color)' }}>🟡 In Progress (Action Needed)</span>}
                {project.status === 'BLOCKED' && <span style={{ color: viewMode === 'internal' ? 'var(--status-blocked-color)' : 'var(--status-atrisk-color)' }}>{viewMode === 'internal' ? '🔴 Blocked' : '🟡 Waiting on Access'}</span>}
                {project.status === 'COMPLETED' && <span style={{ color: 'var(--status-completed-color)' }}>🔵 Completed &amp; Verified</span>}
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                • {donePct}% Complete
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                ({completedTasks}/{projectTasks.length} {viewMode === 'internal' ? 'Tasks Done' : 'Items Delivered'})
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last meaningful update</span>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
              {formatLastUpdated(project.lastUpdated)}
            </div>
          </div>
        </div>

        {/* 2D Segmented Task Breakdown Strip */}
        <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', background: 'var(--border-color)', marginBottom: '12px' }}>
          {donePct > 0 && <div style={{ width: `${donePct}%`, background: '#10b981', transition: 'width 0.6s ease' }} title={`Done: ${donePct}%`} />}
          {inProgPct > 0 && <div style={{ width: `${inProgPct}%`, background: '#3b82f6', transition: 'width 0.6s ease' }} title={`In Progress: ${inProgPct}%`} />}
          {blockedPct > 0 && <div style={{ width: `${blockedPct}%`, background: '#ef4444', transition: 'width 0.6s ease' }} title={`Blocked: ${blockedPct}%`} />}
          {notStartedPct > 0 && <div style={{ width: `${notStartedPct}%`, background: 'rgba(148, 163, 184, 0.4)', transition: 'width 0.6s ease' }} title={`Scheduled: ${notStartedPct}%`} />}
        </div>

        <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981', fontWeight: 600 }}>
            ● {completedTasks} Done ({donePct}%)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#3b82f6', fontWeight: 600 }}>
            ● {inProgressTasks} In Progress ({inProgPct}%)
          </span>
          {blockedTasks > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444', fontWeight: 600 }}>
              ● {blockedTasks} Blocked ({blockedPct}%)
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)' }}>
            ● {notStartedTasks} Scheduled ({notStartedPct}%)
          </span>
        </div>
      </div>

      {/* 2. Interactive Milestone Delivery Pipeline */}
      <MilestoneDeliveryPipeline
        milestones={projectMilestones}
        tasks={projectTasks}
        viewMode={viewMode}
      />

      {/* 3. Star Feature: AI Update Processor */}
      <AIUpdateProcessorCard
        project={project}
        viewMode={viewMode}
      />

      {/* 4. Recent Delivery Activity Stream */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ActivityIcon size={18} color="#3b82f6" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Recent Delivery Activity
            </h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Chronological audit log
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {projectActivities.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '12px' }}>
              No recent updates recorded yet.
            </div>
          ) : (
            projectActivities.map((act) => {
              const isAI = act.source === 'AI';
              const isLinear = act.source === 'Linear';

              return (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: isAI ? 'rgba(192, 132, 252, 0.15)' : isLinear ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: isAI ? '#c084fc' : isLinear ? '#3b82f6' : '#10b981',
                        marginTop: '2px',
                      }}
                    >
                      {act.source}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {act.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {act.description}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>
                    {formatLastUpdated(act.timestamp)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 5. Notes & Executive Summary */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {viewMode === 'internal' ? '🔒 Internal Delivery Notes & Team Diagnostics' : '📋 Executive Delivery Summary'}
        </h3>
        <div style={{ fontSize: '0.925rem', color: 'var(--text-main)', lineHeight: 1.6, background: 'var(--bg-primary)', padding: '14px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          {viewMode === 'internal'
            ? (project.internalNotes || 'No internal team notes recorded.')
            : (project.customerSummary || 'All operational deliverables are progressing according to project schedule.')}
        </div>
      </div>
    </div>
  );
};

