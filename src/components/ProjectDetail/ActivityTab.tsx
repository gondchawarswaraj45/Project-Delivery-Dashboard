import React from 'react';
import { Project } from '../../types';
import { useProjectContext } from '../../context/ProjectContext';
import { AIUpdateProcessorCard } from './AIUpdateProcessorCard';
import { Sparkles, CheckCircle2, Clock, Mail, MessageSquare, PhoneCall, Bot, User, Check } from 'lucide-react';

interface ActivityTabProps {
  project: Project;
}

export const ActivityTab: React.FC<ActivityTabProps> = ({ project }) => {
  const { activities, viewMode } = useProjectContext();

  const projectActivities = activities.filter((a) => a.projectId === project.id);

  const renderSourceBadge = (source: string) => {
    switch (source) {
      case 'Email':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontWeight: 600 }}>
            <Mail size={11} /> Customer Email
          </span>
        );
      case 'Slack':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', fontWeight: 600 }}>
            <MessageSquare size={11} /> Slack Message
          </span>
        );
      case 'Call':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontWeight: 600 }}>
            <PhoneCall size={11} /> Call Transcript
          </span>
        );
      case 'Linear':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', fontWeight: 600 }}>
            ⚡ Linear Webhook
          </span>
        );
      case 'AI':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', fontWeight: 600 }}>
            <Sparkles size={11} /> AI Extraction
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 600 }}>
            <User size={11} /> {source}
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Multi-Channel Ingestion Engine (AI Update Processor) */}
      <AIUpdateProcessorCard project={project} viewMode={viewMode} />

      {/* 2. Chronological Activity Stream */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {viewMode === 'internal' ? 'Activity & Diagnostic Audit Trail (Internal)' : 'Delivery Progress & Communication History (Customer)'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {viewMode === 'internal'
                ? 'Chronological event log of scattered channel updates, AI status synchronizations, and task state changes'
                : 'Verified milestones, delivery deliverables, and approved communication updates'}
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {projectActivities.length} total events recorded
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
          {projectActivities.map((act) => {
            const isAI = act.source === 'AI' || act.source === 'Email' || act.source === 'Slack' || act.source === 'Call';
            const isLinear = act.source === 'Linear';

            // Customer View Filter: In customer view, sanitize title and description
            const displayTitle = viewMode === 'customer'
              ? (act.title.includes('AI') ? 'Delivery Progress Synchronized' : act.title.includes('Status Changed') ? 'Schedule Alignment Updated' : act.title)
              : act.title;

            const displayDescription = viewMode === 'customer' && isAI && project.customerSummary
              ? project.customerSummary
              : act.description;

            return (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  gap: '14px',
                  padding: '14px 16px',
                  background: isAI && viewMode === 'internal' ? 'rgba(139, 92, 246, 0.04)' : isLinear && viewMode === 'internal' ? 'rgba(99, 102, 241, 0.04)' : 'var(--bg-primary)',
                  border: isAI && viewMode === 'internal' ? '1px solid rgba(139, 92, 246, 0.25)' : isLinear && viewMode === 'internal' ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: isAI && viewMode === 'internal' ? 'rgba(139, 92, 246, 0.18)' : isLinear && viewMode === 'internal' ? 'rgba(99, 102, 241, 0.18)' : 'rgba(37, 99, 235, 0.1)',
                    color: isAI && viewMode === 'internal' ? '#c084fc' : isLinear && viewMode === 'internal' ? '#818cf8' : '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  {isAI && viewMode === 'internal' ? <Sparkles size={16} /> : isLinear && viewMode === 'internal' ? <CheckCircle2 size={16} /> : <CheckCircle2 size={16} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        {displayTitle}
                      </span>
                      {viewMode === 'internal' && renderSourceBadge(act.source)}
                    </div>

                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(act.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {displayDescription}
                  </div>

                  {/* Raw Text Log (Internal view only) */}
                  {act.rawText && viewMode === 'internal' && (
                    <div style={{ marginTop: '8px', padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      &quot;{act.rawText}&quot;
                    </div>
                  )}
                </div>
              </div>
            );
          })}


          {projectActivities.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No activity logs recorded yet for this project.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
