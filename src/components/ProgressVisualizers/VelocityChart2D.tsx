import React from 'react';
import { Project, Task } from '../../types';

interface VelocityChartProps {
  project: Project;
  tasks: Task[];
}

export const VelocityChart2D: React.FC<VelocityChartProps> = ({ project, tasks }) => {
  const totalTasks = Math.max(tasks.length, 1);
  const doneTasks = tasks.filter(t => t.status === 'DONE').length;
  const currentPct = Math.round((doneTasks / totalTasks) * 100);


  // SVG dimensions
  const width = 600;
  const height = 180;
  const padding = 35;

  // Coordinate math
  const startX = padding;
  const endX = width - padding;
  const baselineY = height - padding;
  const targetY = padding;

  // Midpoint actual progress coordinate
  const currentX = startX + (endX - startX) * (project.progress / 100);
  const currentY = baselineY - (baselineY - targetY) * (doneTasks / totalTasks);

  // Path generators
  const baselinePath = `M ${startX} ${baselineY} L ${endX} ${targetY}`;
  const actualPath = `M ${startX} ${baselineY} Q ${(startX + currentX) / 2} ${baselineY}, ${currentX} ${currentY}`;
  const areaPath = `M ${startX} ${baselineY} Q ${(startX + currentX) / 2} ${baselineY}, ${currentX} ${currentY} L ${currentX} ${baselineY} Z`;

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            2D Velocity &amp; S-Curve Burn-Up Trajectory
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Baseline planned timeline vs live velocity tracking
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)' }}>
            <span style={{ width: '12px', height: '2px', background: '#94a3b8', borderStyle: 'dashed' }} /> Planned Target
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981', fontWeight: 600 }}>
            <span style={{ width: '12px', height: '3px', background: '#10b981' }} /> Actual Velocity ({currentPct}%)
          </span>
        </div>
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', minWidth: '420px' }}>
          <defs>
            <linearGradient id="velocityArea" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="velocityStroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={startX} y1={baselineY} x2={endX} y2={baselineY} stroke="var(--border-color)" strokeWidth="1" />
          <line x1={startX} y1={(baselineY + targetY) / 2} x2={endX} y2={(baselineY + targetY) / 2} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
          <line x1={startX} y1={targetY} x2={endX} y2={targetY} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />

          {/* Area fill under actual trajectory */}
          <path d={areaPath} fill="url(#velocityArea)" />

          {/* Planned baseline track */}
          <path d={baselinePath} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 4" opacity="0.7" />

          {/* Actual velocity line */}
          <path d={actualPath} fill="none" stroke="url(#velocityStroke)" strokeWidth="3.5" strokeLinecap="round" />

          {/* Current progress point glow */}
          <circle cx={currentX} cy={currentY} r="7" fill="#10b981" stroke="var(--bg-card)" strokeWidth="3" />
          <circle cx={currentX} cy={currentY} r="12" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.4" className="pulse-circle" />

          {/* Start and Target anchors */}
          <circle cx={startX} cy={baselineY} r="4" fill="var(--text-muted)" />
          <circle cx={endX} cy={targetY} r="5" fill="#3b82f6" />

          {/* Labels */}
          <text x={startX} y={height - 10} fontSize="10" fill="var(--text-muted)" textAnchor="start">
            Start: {project.startDate}
          </text>
          <text x={endX} y={height - 10} fontSize="10" fill="var(--text-muted)" textAnchor="end">
            Target: {project.targetDate}
          </text>
          <text x={currentX} y={Math.max(16, currentY - 12)} fontSize="11" fontWeight="bold" fill="var(--text-main)" textAnchor="middle">
            {doneTasks} Done ({currentPct}%)
          </text>

          <text x={startX + 4} y={targetY + 4} fontSize="9" fill="var(--text-muted)">
            100% Scope ({totalTasks} tasks)
          </text>
        </svg>
      </div>
    </div>
  );
};
