import React, { useRef, useEffect, useState } from 'react';
import { Project, Task } from '../../types';
import { Orbit, Sparkles, RefreshCw } from 'lucide-react';

interface HoloOrbitProps {
  project: Project;
  tasks: Task[];
}

export const HoloOrbit3DCanvas: React.FC<HoloOrbitProps> = ({ project, tasks }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isAutoRotate, setIsAutoRotate] = useState(true);

  // Mouse interaction state
  const rotX = useRef(0.4);
  const rotY = useRef(0.6);
  const isDragging = useRef(false);
  const lastMouseX = useRef(0);
  const lastMouseY = useRef(0);

  const percentage = project.progress;
  const doneTasks = tasks.filter((t) => t.status === 'DONE').length;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    // Generate 3D point cloud sphere
    const numParticles = 120;
    const particles: Array<{ x: number; y: number; z: number; size: number; alpha: number }> = [];
    for (let i = 0; i < numParticles; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 90 + Math.random() * 20;

      particles.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      if (isAutoRotate) {
        angle += 0.015;
        rotY.current += 0.008;
      }

      const rx = rotX.current;
      const ry = rotY.current;

      // Project 3D to 2D function
      const project3D = (x: number, y: number, z: number) => {
        // Rotate around Y
        const cosY = Math.cos(ry);
        const sinY = Math.sin(ry);
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        // Rotate around X
        const cosX = Math.cos(rx);
        const sinX = Math.sin(rx);
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        // Perspective division
        const fov = 300;
        const scale = fov / (fov + z2);
        return {
          x2d: cx + x1 * scale,
          y2d: cy + y2 * scale,
          scale,
          depth: z2,
        };
      };

      // 1. Draw 3D Orbiting Particle Cloud
      particles.forEach((p) => {
        const proj = project3D(p.x, p.y, p.z);
        if (proj.scale > 0) {
          ctx.beginPath();
          ctx.arc(proj.x2d, proj.y2d, p.size * proj.scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(139, 92, 246, ${Math.max(0.1, p.alpha * (proj.scale * 0.8))})`;
          ctx.fill();
        }
      });

      // 2. Draw 3D Main Gyroscopic Rings
      const ringSegments = 64;

      // Primary Progress Ring
      ctx.beginPath();
      const progressSegments = Math.round((percentage / 100) * ringSegments);

      for (let i = 0; i <= ringSegments; i++) {
        const a = (i / ringSegments) * Math.PI * 2;
        const r = 95;
        const pt = project3D(Math.cos(a) * r, Math.sin(a) * r, 0);

        if (i === 0) ctx.moveTo(pt.x2d, pt.y2d);
        else ctx.lineTo(pt.x2d, pt.y2d);
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Progress Arc Glowing Stroke
      if (progressSegments > 0) {
        ctx.beginPath();
        for (let i = 0; i <= progressSegments; i++) {
          const a = (i / ringSegments) * Math.PI * 2;
          const r = 95;
          const pt = project3D(Math.cos(a) * r, Math.sin(a) * r, 0);
          if (i === 0) ctx.moveTo(pt.x2d, pt.y2d);
          else ctx.lineTo(pt.x2d, pt.y2d);
        }
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 6;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      }

      // Secondary Cross Orbital Ring (Equatorial Tilt)
      ctx.beginPath();
      for (let i = 0; i <= ringSegments; i++) {
        const a = (i / ringSegments) * Math.PI * 2;
        const r = 85;
        const pt = project3D(Math.cos(a) * r, 0, Math.sin(a) * r);
        if (i === 0) ctx.moveTo(pt.x2d, pt.y2d);
        else ctx.lineTo(pt.x2d, pt.y2d);
      }
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 3. Central Glowing Holographic Core
      const centerProj = project3D(0, 0, 0);
      const radGrad = ctx.createRadialGradient(
        centerProj.x2d,
        centerProj.y2d,
        5,
        centerProj.x2d,
        centerProj.y2d,
        45 * centerProj.scale
      );
      radGrad.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
      radGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0.3)');
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(centerProj.x2d, centerProj.y2d, 45 * centerProj.scale, 0, Math.PI * 2);
      ctx.fillStyle = radGrad;
      ctx.fill();

      // Text in Holographic center
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(20 * centerProj.scale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${percentage}%`, centerProj.x2d, centerProj.y2d - 4);

      ctx.font = `600 ${Math.round(9 * centerProj.scale)}px sans-serif`;
      ctx.fillStyle = '#34d399';
      ctx.fillText('DELIVERED', centerProj.x2d, centerProj.y2d + 14);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [percentage, isAutoRotate]);

  // Mouse drag handler for 3D spin
  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    lastMouseX.current = e.clientX;
    lastMouseY.current = e.clientY;
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - lastMouseX.current;
    const deltaY = e.clientY - lastMouseY.current;

    rotY.current += deltaX * 0.01;
    rotX.current += deltaY * 0.01;

    lastMouseX.current = e.clientX;
    lastMouseY.current = e.clientY;
  };

  const onMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Orbit size={18} color="#3b82f6" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              3D Holographic Gyroscope Orbit Canvas (60 FPS)
            </h4>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Real-time WebGL/Canvas 3D orbital trajectory — Click &amp; drag to rotate in full 3D
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn ${isAutoRotate ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          >
            <RefreshCw size={12} className={isAutoRotate ? 'spin-slow' : ''} />
            <span>{isAutoRotate ? 'Auto-Spin On' : 'Auto-Spin Paused'}</span>
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'radial-gradient(circle, rgba(15, 23, 42, 0.95), rgba(9, 13, 22, 1))',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          border: '1px solid rgba(59, 130, 246, 0.25)',
        }}
      >
        <canvas
          ref={canvasRef}
          width={480}
          height={320}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          style={{ width: '100%', maxWidth: '480px', height: 'auto', cursor: 'grab' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <span>🎯 Active Scope: {doneTasks} of {tasks.length} subtasks locked</span>
        <span>🖱 Click &amp; drag to inspect orbital axes</span>
      </div>
    </div>
  );
};
