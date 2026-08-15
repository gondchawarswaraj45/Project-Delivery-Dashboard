import React from 'react';
import { CheckCircle2, PlayCircle, AlertTriangle, Circle, ArrowRight } from 'lucide-react';
import { Milestone, Task } from '../../types';

interface RoadmapProps {
  milestones: Milestone[];
  tasks: Task[];
}

export const MilestoneRoadmap2D: React.FC<RoadmapProps> = ({ milestones, tasks }) => {
  const sortedMilestones = [...milestones].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Milestone Delivery Pipeline (2D Node Graph)
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Sequential stage progression &amp; dependency completion flow
          </p>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-primary)', padding: '4px 10px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          {sortedMilestones.filter(m => m.status === 'DONE').length} / {sortedMilestones.length} Stages Passed
        </span>
      </div>

      {/* Horizontal Connected Node Tracker */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${sortedMilestones.length}, 1fr)`,
          gap: '12px',
          position: 'relative',
          padding: '16px 0',
        }}
      >
        {sortedMilestones.map((ms, index) => {
          const msTasks = tasks.filter(t => t.milestoneId === ms.id);
          const msDone = msTasks.filter(t => t.status === 'DONE').length;
          const msPct = msTasks.length > 0 ? Math.round((msDone / msTasks.length) * 100) : (ms.status === 'DONE' ? 100 : 0);

          const isDone = ms.status === 'DONE';
          const isInProgress = ms.status === 'IN_PROGRESS';
          const isBlocked = ms.status === 'BLOCKED';

          const nodeColor = isDone
            ? '#10b981'
            : isInProgress
            ? '#3b82f6'
            : isBlocked
            ? '#ef4444'
            : 'var(--text-subtle)';

          const nodeBg = isDone
            ? 'rgba(16, 185, 129, 0.12)'
            : isInProgress
            ? 'rgba(59, 130, 246, 0.12)'
            : isBlocked
            ? 'rgba(239, 68, 68, 0.12)'
            : 'var(--bg-surface)';

          return (
            <div
              key={ms.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {/* Connecting line to next node */}
              {index < sortedMilestones.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '24px',
                    left: '50%',
                    width: '100%',
                    height: '3px',
                    background: isDone
                      ? '#10b981'
                      : isInProgress
                      ? 'linear-gradient(90deg, #3b82f6, var(--border-color))'
                      : 'var(--border-color)',
                    zIndex: -1,
                    transition: 'background 0.3s ease',
                  }}
                />
              )}

              {/* Node Icon Circle */}
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: nodeBg,
                  border: `2px solid ${nodeColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isInProgress
                    ? '0 0 16px rgba(59, 130, 246, 0.4)'
                    : isDone
                    ? '0 0 10px rgba(16, 185, 129, 0.25)'
                    : 'none',
                  animation: isInProgress ? 'pulseGlow 2s infinite' : 'none',
                  marginBottom: '10px',
                  transition: 'all 0.3s ease',
                }}
              >
                {isDone && <CheckCircle2 size={22} color="#10b981" />}
                {isInProgress && <PlayCircle size={22} color="#3b82f6" />}
                {isBlocked && <AlertTriangle size={22} color="#ef4444" />}
                {!isDone && !isInProgress && !isBlocked && (
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Stage Title */}
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px', maxWidth: '140px', lineHeight: 1.3 }}>
                {ms.name}
              </div>

              {/* Status & Subtask percentage */}
              <span
                className={`status-badge ${ms.status}`}
                style={{ fontSize: '0.7rem', padding: '2px 8px', marginBottom: '6px' }}
              >
                {ms.status.replace('_', ' ')}
              </span>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {msDone}/{msTasks.length} tasks ({msPct}%)
              </div>

              {/* Mini Segment progress bar */}
              <div style={{ width: '80%', height: '4px', background: 'var(--border-color)', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${msPct}%`,
                    background: nodeColor,
                    borderRadius: '2px',
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
