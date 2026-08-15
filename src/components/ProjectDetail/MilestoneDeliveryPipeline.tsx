import React, { useState } from 'react';
import { Milestone, Task, ViewMode } from '../../types';
import { CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp, Layers } from 'lucide-react';

interface MilestoneDeliveryPipelineProps {
  milestones: Milestone[];
  tasks: Task[];
  viewMode: ViewMode;
  onSelectMilestone?: (milestoneId: string) => void;
}

export const MilestoneDeliveryPipeline: React.FC<MilestoneDeliveryPipelineProps> = ({
  milestones,
  tasks,
  viewMode,
}) => {
  const sortedMilestones = [...milestones].sort((a, b) => a.orderIndex - b.orderIndex);
  
  // Default to expanding the first in-progress or blocked milestone
  const defaultExpandedId = sortedMilestones.find(
    (m) => {
      const mTasks = tasks.filter((t) => t.milestoneId === m.id);
      return mTasks.some((t) => t.status === 'IN_PROGRESS' || t.status === 'BLOCKED');
    }
  )?.id || sortedMilestones[0]?.id || null;

  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(defaultExpandedId);

  const toggleExpand = (id: string) => {
    setExpandedMilestoneId(expandedMilestoneId === id ? null : id);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#2563eb" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {viewMode === 'internal' ? 'Milestone Delivery Pipeline' : 'Project Delivery Milestones'}
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Interactive progression: click any milestone phase to inspect task deliverables &amp; status
          </p>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontWeight: 600 }}>
            <CheckCircle2 size={12} /> Done
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3b82f6', fontWeight: 600 }}>
            <Clock size={12} /> In Progress
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontWeight: 600 }}>
            <AlertCircle size={12} /> Blocked
          </span>
        </div>
      </div>

      {/* Horizontal Pipeline Steps */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(sortedMilestones.length, 1)}, 1fr)`, gap: '12px', marginBottom: '20px' }}>
        {sortedMilestones.map((m, idx) => {
          const mTasks = tasks.filter((t) => t.milestoneId === m.id);
          const doneCount = mTasks.filter((t) => t.status === 'DONE').length;
          const isBlocked = mTasks.some((t) => t.status === 'BLOCKED');
          const isInProgress = mTasks.some((t) => t.status === 'IN_PROGRESS');
          const isAllDone = mTasks.length > 0 && doneCount === mTasks.length;
          const isSelected = expandedMilestoneId === m.id;

          const stepStatus = isAllDone ? 'DONE' : isBlocked ? 'BLOCKED' : isInProgress ? 'IN_PROGRESS' : 'NOT_STARTED';

          const borderColor = isSelected
            ? '#2563eb'
            : stepStatus === 'DONE'
            ? 'rgba(16, 185, 129, 0.4)'
            : stepStatus === 'BLOCKED'
            ? 'rgba(239, 68, 68, 0.4)'
            : stepStatus === 'IN_PROGRESS'
            ? 'rgba(59, 130, 246, 0.4)'
            : 'var(--border-color)';

          const bgColor = isSelected
            ? 'rgba(37, 99, 235, 0.08)'
            : stepStatus === 'DONE'
            ? 'rgba(16, 185, 129, 0.04)'
            : stepStatus === 'BLOCKED'
            ? 'rgba(239, 68, 68, 0.04)'
            : 'var(--bg-surface)';

          return (
            <div
              key={m.id}
              onClick={() => toggleExpand(m.id)}
              style={{
                cursor: 'pointer',
                padding: '14px 16px',
                borderRadius: 'var(--radius-sm)',
                border: `1.5px solid ${borderColor}`,
                background: bgColor,
                transition: 'all 0.15s ease',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {/* Step number and Status icon */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  PHASE {idx + 1}
                </span>
                {stepStatus === 'DONE' && <CheckCircle2 size={16} color="#10b981" />}
                {stepStatus === 'IN_PROGRESS' && <Clock size={16} color="#3b82f6" />}
                {stepStatus === 'BLOCKED' && <AlertCircle size={16} color={viewMode === 'internal' ? '#ef4444' : '#f59e0b'} />}
                {stepStatus === 'NOT_STARTED' && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--border-color)' }} />}
              </div>

              {/* Milestone Name */}
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.25 }}>
                {m.name.replace(/^\d+\.\s*/, '')}
              </div>

              {/* Task Count Ratio */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>{doneCount}/{mTasks.length} {viewMode === 'internal' ? 'tasks' : 'items'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: isSelected ? '#2563eb' : 'var(--text-muted)' }}>
                  {isSelected ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </span>
              </div>

              {/* Progress bar per milestone */}
              <div style={{ height: '4px', borderRadius: '2px', background: 'var(--border-color)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${mTasks.length > 0 ? (doneCount / mTasks.length) * 100 : 0}%`,
                    background: stepStatus === 'DONE' ? '#10b981' : stepStatus === 'BLOCKED' ? '#ef4444' : '#3b82f6',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Milestone Task Drawer */}
      {expandedMilestoneId && (() => {
        const activeMilestone = sortedMilestones.find((m) => m.id === expandedMilestoneId);
        const activeTasks = tasks.filter((t) => t.milestoneId === expandedMilestoneId);

        if (!activeMilestone) return null;

        return (
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {activeMilestone.name} — Task Breakdown ({activeTasks.filter((t) => t.status === 'DONE').length}/{activeTasks.length} Done)
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {viewMode === 'internal' ? 'Internal Operational View' : 'Verified Deliverables'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeTasks.map((t) => {
                const title = (viewMode === 'customer' && t.customerFacingTitle) ? t.customerFacingTitle : t.title;
                const isBlocked = t.status === 'BLOCKED';

                return (
                  <div
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface)',
                      border: `1px solid ${isBlocked ? (viewMode === 'internal' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)') : 'var(--border-color)'}`,
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px' }}>
                      {t.status === 'DONE' && <CheckCircle2 size={16} color="#10b981" />}
                      {t.status === 'IN_PROGRESS' && <Clock size={16} color="#3b82f6" />}
                      {t.status === 'BLOCKED' && <AlertCircle size={16} color={viewMode === 'internal' ? '#ef4444' : '#f59e0b'} />}
                      {t.status === 'NOT_STARTED' && <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid var(--text-muted)' }} />}

                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {title}
                        </div>
                        {isBlocked && (
                          <div style={{ fontSize: '0.75rem', color: viewMode === 'internal' ? '#ef4444' : '#d97706', marginTop: '2px', fontWeight: 500 }}>
                            {viewMode === 'internal'
                              ? `🔒 Internal Blocker: ${t.blocker || 'Blocked on dependency'}`
                              : `● Status: ${t.customerBlockerReason || 'Waiting for required access information.'}`}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Due {t.dueDate}
                      </span>
                      <span className={`status-badge ${t.status}`}>
                        ● {viewMode === 'internal'
                          ? t.status.replace('_', ' ')
                          : t.status === 'DONE'
                          ? 'Completed'
                          : t.status === 'BLOCKED'
                          ? 'Waiting on Access'
                          : t.status === 'IN_PROGRESS'
                          ? 'In Progress'
                          : 'Scheduled'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
