import React, { useState } from 'react';
import { Milestone, Task, Project } from '../../types';
import { CheckCircle2, PlayCircle, AlertTriangle, Layers, RotateCcw } from 'lucide-react';

interface IsometricTowerProps {
  project: Project;
  milestones: Milestone[];
  tasks: Task[];
}

export const IsometricTower3D: React.FC<IsometricTowerProps> = ({ project, milestones, tasks }) => {
  const [rotateX, setRotateX] = useState(55);
  const [rotateZ, setRotateZ] = useState(-35);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);

  const sortedMilestones = [...milestones].sort((a, b) => b.orderIndex - a.orderIndex); // Bottom to top

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    setRotateX(55 + y * 25);
    setRotateZ(-35 + x * 35);
  };

  const handleReset = () => {
    setRotateX(55);
    setRotateZ(-35);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#8b5cf6" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              3D Isometric Milestone Elevation Tower
            </h4>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Volumetric stacked architecture for {project.name} — Move mouse to tilt in 3D space
          </p>

        </div>

        <button
          className="btn btn-ghost"
          onClick={handleReset}
          style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <RotateCcw size={12} /> Reset 3D Angle
        </button>
      </div>

      {/* 3D Viewport Container */}
      <div
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          handleReset();
        }}
        style={{
          width: '100%',
          height: '380px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          perspective: '1200px',
          cursor: 'grab',
          userSelect: 'none',
          position: 'relative',
          background: 'radial-gradient(circle at 50% 60%, rgba(139, 92, 246, 0.08), transparent 70%)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Helper Hint */}
        <div style={{ position: 'absolute', top: '12px', left: '16px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          🎮 Move cursor to inspect 3D layers ({Math.round(rotateX)}°, {Math.round(rotateZ)}°)
        </div>

        {/* 3D World Stage */}
        <div
          style={{
            position: 'relative',
            width: '260px',
            height: '260px',
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotateX}deg) rotateZ(${rotateZ}deg)`,
            transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Ground Grid Base */}
          <div
            style={{
              position: 'absolute',
              width: '320px',
              height: '320px',
              left: '-30px',
              top: '-30px',
              border: '2px dashed rgba(139, 92, 246, 0.3)',
              borderRadius: '24px',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 80%)',
              transform: 'translateZ(-20px)',
              pointerEvents: 'none',
            }}
          />

          {/* Stacking Isometric Milestone Slabs */}
          {sortedMilestones.map((ms, idx) => {
            const msTasks = tasks.filter((t) => t.milestoneId === ms.id);
            const msDone = msTasks.filter((t) => t.status === 'DONE').length;
            const msPct = msTasks.length > 0 ? Math.round((msDone / msTasks.length) * 100) : (ms.status === 'DONE' ? 100 : 0);

            // Layer height offset in 3D space
            const elevationZ = idx * 60;
            const isDone = ms.status === 'DONE';
            const isInProgress = ms.status === 'IN_PROGRESS';
            const isBlocked = ms.status === 'BLOCKED';

            const slabColor = isDone
              ? 'rgba(16, 185, 129, 0.75)'
              : isInProgress
              ? 'rgba(59, 130, 246, 0.75)'
              : isBlocked
              ? 'rgba(239, 68, 68, 0.75)'
              : 'rgba(148, 163, 184, 0.35)';

            const glowShadow = isDone
              ? '0 0 24px rgba(16, 185, 129, 0.5)'
              : isInProgress
              ? '0 0 28px rgba(59, 130, 246, 0.6)'
              : isBlocked
              ? '0 0 24px rgba(239, 68, 68, 0.5)'
              : 'none';

            return (
              <div
                key={ms.id}
                onClick={() => setSelectedMilestone(selectedMilestone === ms.id ? null : ms.id)}
                style={{
                  position: 'absolute',
                  width: '240px',
                  height: '140px',
                  left: '10px',
                  top: '60px',
                  transformStyle: 'preserve-3d',
                  transform: `translateZ(${elevationZ}px)`,
                  transition: 'transform 0.4s ease, box-shadow 0.4s ease',
                  cursor: 'pointer',
                }}
              >
                {/* Top Face of 3D Slab */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: slabColor,
                    backdropFilter: 'blur(8px)',
                    border: '2px solid rgba(255, 255, 255, 0.6)',
                    borderRadius: '16px',
                    boxShadow: glowShadow,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '14px',
                    color: '#ffffff',
                    transform: 'translateZ(18px)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                      Level {sortedMilestones.length - idx}: {ms.name}
                    </span>
                    {isDone && <CheckCircle2 size={16} color="#ffffff" />}
                    {isInProgress && <PlayCircle size={16} color="#ffffff" />}
                    {isBlocked && <AlertTriangle size={16} color="#ffffff" />}
                  </div>

                  {/* Progress Bar inside 3D Slab */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 600, marginBottom: '3px' }}>
                      <span>{ms.status.replace('_', ' ')}</span>
                      <span>{msPct}%</span>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: 'rgba(0,0,0,0.3)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${msPct}%`, height: '100%', background: '#ffffff', borderRadius: '3px' }} />
                    </div>
                  </div>
                </div>

                {/* 3D Side Depth Extrusions */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '18px',
                    background: 'rgba(0, 0, 0, 0.35)',
                    transformOrigin: 'bottom',
                    transform: 'rotateX(-90deg)',
                    borderBottomLeftRadius: '16px',
                    borderBottomRightRadius: '16px',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '18px',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.45)',
                    transformOrigin: 'right',
                    transform: 'rotateY(90deg)',
                    borderTopRightRadius: '16px',
                    borderBottomRightRadius: '16px',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 3D Tower Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '14px', fontSize: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 600 }}>
          <span style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '2px' }} /> Completed Tier
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#3b82f6', fontWeight: 600 }}>
          <span style={{ width: '10px', height: '10px', background: '#3b82f6', borderRadius: '2px' }} /> Active Tier
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontWeight: 600 }}>
          <span style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '2px' }} /> Blocked Tier
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
          <span style={{ width: '10px', height: '10px', background: 'var(--border-color)', borderRadius: '2px' }} /> Future Tier
        </span>
      </div>
    </div>
  );
};
