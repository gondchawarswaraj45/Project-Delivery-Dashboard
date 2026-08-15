import React, { useState } from 'react';
import { Project, Milestone, Task } from '../../types';
import { RadialProgressRing } from './RadialProgressRing';
import { MilestoneRoadmap2D } from './MilestoneRoadmap2D';
import { VelocityChart2D } from './VelocityChart2D';
import { IsometricTower3D } from './IsometricTower3D';
import { HoloOrbit3DCanvas } from './HoloOrbit3DCanvas';
import {
  PieChart,
  Layers,
  Orbit,
  TrendingUp,
  GitCommit,
  LayoutGrid,
  Sparkles,
  BarChart2
} from 'lucide-react';

interface ProgressSuiteProps {
  project: Project;
  milestones: Milestone[];
  tasks: Task[];
}

export type VisualizerMode = 'all' | 'radial' | 'roadmap' | 'velocity' | 'tower3d' | 'orbit3d';

export const ProgressSuite: React.FC<ProgressSuiteProps> = ({ project, milestones, tasks }) => {
  const [activeVisualizer, setActiveVisualizer] = useState<VisualizerMode>('all');

  const projectMilestones = milestones.filter((m) => m.projectId === project.id);
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const doneTasks = projectTasks.filter((t) => t.status === 'DONE').length;
  const inProgressTasks = projectTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const blockedTasks = projectTasks.filter((t) => t.status === 'BLOCKED').length;
  const notStartedTasks = projectTasks.filter((t) => t.status === 'NOT_STARTED').length;

  const total = Math.max(projectTasks.length, 1);
  const donePct = Math.round((doneTasks / total) * 100);
  const inProgPct = Math.round((inProgressTasks / total) * 100);
  const blockedPct = Math.round((blockedTasks / total) * 100);
  const notStartedPct = Math.max(0, 100 - donePct - inProgPct - blockedPct);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Visualizer Suite Header & Mode Bar */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#2563eb" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Multi-Dimensional 2D &amp; 3D Progress Visualizer Suite
              </h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Interactive dimensional tracking: 2D linear/radial/stepper metrics + 3D isometric &amp; orbital canvas
            </p>
          </div>

          {/* Interactive Mode Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All 2D + 3D Views', icon: LayoutGrid },
              { id: 'radial', label: '2D Radial & Gauge', icon: PieChart },
              { id: 'roadmap', label: '2D Pipeline Roadmap', icon: GitCommit },
              { id: 'velocity', label: '2D Burn-Up Trajectory', icon: TrendingUp },
              { id: 'tower3d', label: '3D Isometric Tower', icon: Layers },
              { id: 'orbit3d', label: '3D Holo-Orbit Canvas', icon: Orbit },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeVisualizer === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveVisualizer(tab.id as VisualizerMode)}
                  className="btn btn-ghost"
                  style={{
                    fontSize: '0.78rem',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    background: active ? 'rgba(37, 99, 235, 0.15)' : 'var(--bg-primary)',
                    border: active ? '1px solid #2563eb' : '1px solid var(--border-color)',
                    color: active ? '#2563eb' : 'var(--text-muted)',
                    fontWeight: active ? 700 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={13} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2D Segmented Task Breakdown Strip */}
        <div style={{ background: 'var(--bg-primary)', padding: '14px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.8rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BarChart2 size={14} color="#3b82f6" /> 2D Segmented Task Scope Spectrum
            </span>
            <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{project.progress}% Complete</span>
          </div>

          <div style={{ display: 'flex', height: '14px', borderRadius: '7px', overflow: 'hidden', background: 'var(--border-color)' }}>
            {donePct > 0 && <div style={{ width: `${donePct}%`, background: 'linear-gradient(90deg, #10b981, #34d399)', transition: 'width 0.8s' }} title={`Done: ${donePct}%`} />}
            {inProgPct > 0 && <div style={{ width: `${inProgPct}%`, background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', transition: 'width 0.8s' }} title={`In Progress: ${inProgPct}%`} />}
            {blockedPct > 0 && <div style={{ width: `${blockedPct}%`, background: 'linear-gradient(90deg, #ef4444, #f87171)', transition: 'width 0.8s' }} title={`Blocked: ${blockedPct}%`} />}
            {notStartedPct > 0 && <div style={{ width: `${notStartedPct}%`, background: 'rgba(148, 163, 184, 0.4)', transition: 'width 0.8s' }} title={`Not Started: ${notStartedPct}%`} />}
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '0.72rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981', fontWeight: 600 }}>
              ● {doneTasks} Done ({donePct}%)
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
              ● {notStartedTasks} Pending ({notStartedPct}%)
            </span>
          </div>
        </div>
      </div>

      {/* Render Selected Visualizer Sub-Views */}
      {(activeVisualizer === 'all' || activeVisualizer === 'radial') && (
        <RadialProgressRing
          percentage={project.progress}
          status={project.status}
          tasks={projectTasks}
        />
      )}

      {(activeVisualizer === 'all' || activeVisualizer === 'roadmap') && (
        <MilestoneRoadmap2D
          milestones={projectMilestones}
          tasks={projectTasks}
        />
      )}

      {(activeVisualizer === 'all' || activeVisualizer === 'velocity') && (
        <VelocityChart2D
          project={project}
          tasks={projectTasks}
        />
      )}

      {(activeVisualizer === 'all' || activeVisualizer === 'tower3d') && (
        <IsometricTower3D
          project={project}
          milestones={projectMilestones}
          tasks={projectTasks}
        />
      )}

      {(activeVisualizer === 'all' || activeVisualizer === 'orbit3d') && (
        <HoloOrbit3DCanvas
          project={project}
          tasks={projectTasks}
        />
      )}
    </div>
  );
};
