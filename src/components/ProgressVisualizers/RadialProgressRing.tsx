import React from 'react';
import { Task } from '../../types';


interface RadialProps {
  percentage: number;
  status: string;
  size?: number;
  strokeWidth?: number;
  tasks?: Task[];
}

export const RadialProgressRing: React.FC<RadialProps> = ({
  percentage,
  status,
  size = 180,
  strokeWidth = 14,
  tasks = [],
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Status color mapping
  const getColor = (st: string) => {
    switch (st) {
      case 'ON_TRACK':
        return { stroke: '#10b981', gradient: ['#10b981', '#34d399'], glow: 'rgba(16, 185, 129, 0.35)' };
      case 'AT_RISK':
        return { stroke: '#f59e0b', gradient: ['#f59e0b', '#fbbf24'], glow: 'rgba(245, 158, 11, 0.35)' };
      case 'BLOCKED':
        return { stroke: '#ef4444', gradient: ['#ef4444', '#f87171'], glow: 'rgba(239, 68, 68, 0.35)' };
      case 'COMPLETED':
      default:
        return { stroke: '#3b82f6', gradient: ['#3b82f6', '#60a5fa'], glow: 'rgba(59, 130, 246, 0.35)' };
    }
  };

  const colors = getColor(status);

  // Speedometer Gauge values
  const gaugeAngle = (percentage / 100) * 180 - 90; // -90deg to +90deg

  const doneCount = tasks.filter(t => t.status === 'DONE').length;
  const inProgCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const blockedCount = tasks.filter(t => t.status === 'BLOCKED').length;
  const notStartedCount = tasks.filter(t => t.status === 'NOT_STARTED').length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
      {/* 1. 2D Precision Circular Radial Ring */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
          Radial Ring Metric
        </div>

        <div style={{ position: 'relative', width: size, height: size }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <defs>
              <linearGradient id={`radialGrad-${status}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.gradient[0]} />
                <stop offset="100%" stopColor={colors.gradient[1]} />
              </linearGradient>
              <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="var(--border-color)"
              strokeWidth={strokeWidth}
              fill="transparent"
              opacity={0.5}
            />

            {/* Animated Progress Arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={`url(#radialGrad-${status})`}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              filter="url(#glowEffect)"
              style={{
                transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </svg>

          {/* Center Content */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
              {percentage}%
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.stroke, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {doneCount} of {tasks.length} total tasks delivered
        </div>
      </div>

      {/* 2. 2D Speedometer Health Meter Gauge */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
          Health Velocity Meter
        </div>

        <div style={{ position: 'relative', width: '220px', height: '125px', overflow: 'hidden' }}>
          <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(0deg)' }}>
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="40%" stopColor="#f59e0b" />
                <stop offset="70%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>

            {/* Semicircle Gauge Track */}
            <path
              d="M 20 110 A 90 90 0 0 1 200 110"
              fill="none"
              stroke="var(--border-color)"
              strokeWidth="16"
              strokeLinecap="round"
              opacity={0.4}
            />

            {/* Filled Gauge Track */}
            <path
              d="M 20 110 A 90 90 0 0 1 200 110"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={283 - (percentage / 100) * 283}
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>

          {/* Needle */}
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '110px',
              width: '4px',
              height: '80px',
              background: 'linear-gradient(to top, var(--text-main), #ef4444)',
              transformOrigin: 'bottom center',
              transform: `translateX(-50%) rotate(${gaugeAngle}deg)`,
              transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
              borderRadius: '3px',
              boxShadow: '0 0 8px rgba(0,0,0,0.3)',
            }}
          />

          {/* Pivot Circle */}
          <div
            style={{
              position: 'absolute',
              bottom: '2px',
              left: '102px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: 'var(--text-main)',
              border: '3px solid var(--bg-card)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '220px', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          <span>0% Stall</span>
          <span>50% Pace</span>
          <span>100% Target</span>
        </div>

        {/* Task Category Counts */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 600 }}>
            {doneCount} Done
          </span>
          <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontWeight: 600 }}>
            {inProgCount} Active
          </span>
          {blockedCount > 0 && (
            <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 600 }}>
              {blockedCount} Blocked
            </span>
          )}
          <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '12px', background: 'var(--bg-primary)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', fontWeight: 600 }}>
            {notStartedCount} Pending
          </span>
        </div>
      </div>
    </div>
  );
};
