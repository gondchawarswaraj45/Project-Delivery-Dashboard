import React, { useState, useEffect } from 'react';
import { Project, Task, StructuredUpdate, ViewMode } from '../../types';
import { useProjectContext } from '../../context/ProjectContext';
import { extractStructuredUpdate } from '../../utils/aiExtractor';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Send,
  Check,
  Mail,
  MessageSquare,
  PhoneCall,
  Edit3,
  Bot,
  Play,
  Pause,
  Zap,
  Code2
} from 'lucide-react';

interface AIUpdateProcessorCardProps {
  project: Project;
  viewMode: ViewMode;
}

type IngestionChannel = 'email' | 'slack' | 'call' | 'custom';

interface ChannelSample {
  channel: IngestionChannel;
  title: string;
  sender: string;
  senderRole: string;
  time: string;
  subjectOrChannel: string;
  text: string;
}

const CHANNEL_SAMPLES: ChannelSample[] = [
  {
    channel: 'email',
    title: 'Customer Email',
    sender: 'Suresh Mahajan',
    senderRole: 'VP of Ops @ Pune Robotics',
    time: 'Today, 11:20 AM',
    subjectOrChannel: 'Subject: Re: API Telemetry Gateway & Live Stream Credentials',
    text: 'Hi Rahul, We have completed the drone waypoint verification on our end and API configuration is approved. However, our IT security group is holding the live OAuth stream credentials until the data processing agreement is countersigned. Please hold on the mission dispatch fleet setup for now.',
  },
  {
    channel: 'slack',
    title: 'Internal Slack / Teams',
    sender: 'Rahul Deshmukh',
    senderRole: 'Implementation Lead',
    time: 'Today, 11:45 AM',
    subjectOrChannel: '#delivery-drone-fleet (Slack)',
    text: '@channel Quick sync update: Robot integration drivers and sensor telemetry calibration are both DONE and verified on staging. Mission dispatch is BLOCKED until client IT delivers OAuth tokens. Pushing health to AT RISK.',
  },
  {
    channel: 'call',
    title: 'Client Call Transcript',
    sender: 'Priya & Suresh (Zoom)',
    senderRole: 'Weekly Delivery Standup',
    time: 'Yesterday, 4:00 PM',
    subjectOrChannel: 'Meeting Transcript (Audio-to-Text)',
    text: 'Priya Kulkarni: "Discovery phase is 100% complete. We finished robot drivers yesterday and telemetry testing is underway. Once credentials arrive, we will execute the final production deployment by Aug 26."',
  },
  {
    channel: 'custom',
    title: 'Custom Raw Text',
    sender: 'Live Operator',
    senderRole: 'Manual Input',
    time: 'Just now',
    subjectOrChannel: 'Freeform text paste box',
    text: '',
  },
];

export const AIUpdateProcessorCard: React.FC<AIUpdateProcessorCardProps> = ({ project, viewMode }) => {
  const { tasks, applyAIUpdate, triggerLinearWebhook } = useProjectContext();
  const [selectedChannel, setSelectedChannel] = useState<IngestionChannel>('email');
  const [rawText, setRawText] = useState(CHANNEL_SAMPLES[0].text);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedResult, setExtractedResult] = useState<StructuredUpdate | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [showJsonCode, setShowJsonCode] = useState(false);
  
  // Real-Time Stream Simulation State
  const [isSimulatingStream, setIsSimulatingStream] = useState(false);
  const [streamStep, setStreamStep] = useState<number>(0);
  const [streamLog, setStreamLog] = useState<Array<{ time: string; icon: string; message: string; tag: string }>>([]);

  const projectTasks = tasks.filter((t) => t.projectId === project.id);

  // Auto-play Real-Time Ingestion Stream Simulation
  useEffect(() => {
    let timer: any;
    if (isSimulatingStream) {
      if (streamStep === 0) {
        setStreamLog([
          {
            time: new Date().toLocaleTimeString(),
            icon: '💬',
            message: 'Incoming Slack: "Waypoint dispatch tested and verified on staging."',
            tag: 'INGESTED',
          },
        ]);
        timer = setTimeout(() => setStreamStep(1), 1600);
      } else if (streamStep === 1) {
        setStreamLog((prev) => [
          {
            time: new Date().toLocaleTimeString(),
            icon: '🤖',
            message: 'AI Extracted: Task "Mission dispatch setup" -> DONE (Confidence 96%)',
            tag: 'EXTRACTED',
          },
          ...prev,
        ]);
        timer = setTimeout(() => setStreamStep(2), 1600);
      } else if (streamStep === 2) {
        setStreamLog((prev) => [
          {
            time: new Date().toLocaleTimeString(),
            icon: '📊',
            message: 'State Synchronized: Project Progress 73% -> 82% (ON TRACK)',
            tag: 'SYNCED',
          },
          ...prev,
        ]);
        timer = setTimeout(() => {
          setIsSimulatingStream(false);
          setStreamStep(0);
        }, 3000);
      }
    }
    return () => clearTimeout(timer);
  }, [isSimulatingStream, streamStep]);

  // If in customer view, show executive summary
  if (viewMode === 'customer') {
    return (
      <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <CheckCircle2 size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Verified Executive Delivery Summary
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Customer-safe progress status synthesized and verified by delivery team
            </p>
          </div>
        </div>
        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
          {project.customerSummary || 'All operational deliverables are proceeding according to the agreed project schedule. Technical integration testing is active and waypoint verification is complete.'}
        </div>
      </div>
    );
  }

  const handleChannelSelect = (sample: ChannelSample) => {
    setSelectedChannel(sample.channel);
    setRawText(sample.text);
    setExtractedResult(null);
  };

  // Handle Process Update
  const handleProcessUpdate = async () => {
    if (!rawText.trim()) return;
    setIsProcessing(true);
    setIsApplied(false);

    try {
      const response = await fetch(`http://localhost:8000/api/projects/${project.id}/ai-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: rawText }),
      });
      if (response.ok) {
        const data = await response.json();
        setExtractedResult(data);
      } else {
        const fallback = extractStructuredUpdate(rawText, project, projectTasks);
        setExtractedResult(fallback);
      }
    } catch (err) {
      const fallback = extractStructuredUpdate(rawText, project, projectTasks);
      setExtractedResult(fallback);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Apply Changes
  const handleApplyChanges = async () => {
    if (!extractedResult) return;
    await applyAIUpdate(project.id, extractedResult, rawText);
    setIsApplied(true);
    setTimeout(() => {
      setExtractedResult(null);
      setIsApplied(false);
    }, 1800);
  };

  const activeSample = CHANNEL_SAMPLES.find((s) => s.channel === selectedChannel);

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        border: '1.5px solid rgba(139, 92, 246, 0.35)',
        background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.03) 0%, var(--bg-surface) 100%)',
      }}
    >
      {/* Top Bar with Live Simulation Ticker */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <Bot size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Synthetic Update Ingestion Inbox
              </h3>
              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(249, 115, 22, 0.15)', color: '#f97316', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                ⚡ Groq API Ready
              </span>
              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                LIVE FEED
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Processes multi-channel communications (Emails, Slack, Calls) with high-speed Groq Llama-3 LLM
            </p>
          </div>

        </div>

        {/* Live Simulation Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setIsSimulatingStream(true);
              setStreamStep(0);
            }}
            disabled={isSimulatingStream}
            style={{
              fontSize: '0.78rem',
              padding: '6px 12px',
              borderRadius: '6px',
              background: isSimulatingStream ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              color: isSimulatingStream ? '#10b981' : 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
            }}
          >
            {isSimulatingStream ? <RefreshCw size={13} className="spin" /> : <Play size={13} />}
            <span>{isSimulatingStream ? 'Simulating Live Stream...' : '▶ Simulate Live Stream'}</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => triggerLinearWebhook('Robot integration drivers', 'DONE')}
            style={{
              fontSize: '0.78rem',
              padding: '6px 12px',
              borderRadius: '6px',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
            }}
          >
            <Zap size={13} />
            <span>⚡ Linear Webhook</span>
          </button>
        </div>
      </div>

      {/* Real-time Stream Ticker Display */}
      {streamLog.length > 0 && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px 14px',
            borderRadius: '6px',
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>
            <span>LIVE UPDATE STREAM LOG</span>
            <span>● CONNECTED</span>
          </div>
          {streamLog.map((log, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-main)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{log.time}</span>
              <span>{log.icon}</span>
              <span style={{ flex: 1 }}>{log.message}</span>
              <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: '#c084fc', fontWeight: 600 }}>
                {log.tag}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Multi-Channel Ingestion Selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center', fontWeight: 600, marginRight: '4px' }}>
          Ingest Channel:
        </span>
        {CHANNEL_SAMPLES.map((sample) => {
          const isActive = selectedChannel === sample.channel;
          const Icon =
            sample.channel === 'email'
              ? Mail
              : sample.channel === 'slack'
              ? MessageSquare
              : sample.channel === 'call'
              ? PhoneCall
              : Edit3;

          return (
            <button
              key={sample.channel}
              type="button"
              className="btn btn-ghost"
              onClick={() => handleChannelSelect(sample)}
              style={{
                fontSize: '0.78rem',
                padding: '6px 12px',
                borderRadius: '8px',
                background: isActive ? 'rgba(139, 92, 246, 0.18)' : 'var(--bg-primary)',
                border: isActive ? '1.5px solid #8b5cf6' : '1px solid var(--border-color)',
                color: isActive ? '#c084fc' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} />
              <span>{sample.title}</span>
            </button>
          );
        })}
      </div>

      {/* Simulated Channel Message Metadata Bar */}
      {selectedChannel !== 'custom' && activeSample && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '6px 6px 0 0',
            background: 'rgba(139, 92, 246, 0.08)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            borderBottom: 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-main)',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, color: '#c084fc' }}>{activeSample.sender}</span>
            <span style={{ color: 'var(--text-muted)' }}>({activeSample.senderRole})</span>
            <span style={{ color: 'var(--border-color)' }}>•</span>
            <span style={{ color: 'var(--text-muted)' }}>{activeSample.subjectOrChannel}</span>
          </div>
          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{activeSample.time}</span>
        </div>
      )}

      {/* Textarea Input */}
      <textarea
        rows={selectedChannel === 'custom' ? 4 : 3}
        placeholder="Paste customer emails, Slack messages, or meeting notes here..."
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: selectedChannel !== 'custom' ? '0 0 var(--radius-sm) var(--radius-sm)' : 'var(--radius-sm)',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-main)',
          fontSize: '0.875rem',
          lineHeight: 1.5,
          resize: 'vertical',
          marginBottom: '14px',
          boxSizing: 'border-box',
        }}
      />

      {/* Action Trigger Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Targeting <strong>{project.name}</strong> • {projectTasks.length} tasks indexed
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {rawText.trim() && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setRawText('');
                setExtractedResult(null);
              }}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              Clear
            </button>
          )}

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleProcessUpdate}
            disabled={isProcessing || !rawText.trim()}
            style={{
              fontSize: '0.85rem',
              padding: '8px 18px',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600,
            }}
          >
            {isProcessing ? (
              <>
                <RefreshCw size={14} className="spin" />
                <span>Extracting Entities &amp; Intent...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Translate to Structured State</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Structured Extraction Result Card */}
      {extractedResult && (
        <div
          style={{
            marginTop: '20px',
            padding: '18px 20px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-primary)',
            border: '1.5px solid rgba(139, 92, 246, 0.4)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#c084fc" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Extracted Delivery Intelligence
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {extractedResult.engine && (
                <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.18)', color: '#c084fc', fontWeight: 600 }}>
                  ⚡ {extractedResult.engine}
                </span>
              )}
              <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 600 }}>
                {Math.round((extractedResult.confidence || 0.94) * 100)}% AI Confidence
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: extractedResult.project_status === 'BLOCKED' ? '#ef4444' : extractedResult.project_status === 'AT_RISK' ? '#f59e0b' : '#10b981' }}>
                Health Projection: {extractedResult.project_status || 'ON_TRACK'}
              </span>
            </div>

          </div>

          {/* Detected Task Updates */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            {extractedResult.updates && extractedResult.updates.length > 0 ? (
              extractedResult.updates.map((u, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {u.status === 'DONE' && <CheckCircle2 size={14} color="#10b981" />}
                    {u.status === 'BLOCKED' && <AlertTriangle size={14} color="#ef4444" />}
                    {u.status === 'IN_PROGRESS' && <Clock size={14} color="#3b82f6" />}
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.task_title || u.task}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`status-badge ${u.status}`}>
                      ● {u.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No direct task state movement detected in text. Summary updated.
              </div>
            )}
          </div>

          {/* Blockers */}
          {extractedResult.blockers && extractedResult.blockers.length > 0 && (
            <div style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', marginBottom: '14px', fontSize: '0.8rem', color: '#ef4444' }}>
              <strong>Blocker Identified:</strong> {extractedResult.blockers.join(', ')}
            </div>
          )}

          {/* Customer Summary Preview */}
          {extractedResult.customer_summary && (
            <div style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.2)', marginBottom: '16px', fontSize: '0.8rem', color: 'var(--text-main)' }}>
              <strong>Generated Customer Summary:</strong> {extractedResult.customer_summary}
            </div>
          )}

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowJsonCode(!showJsonCode)}
              style={{ fontSize: '0.78rem', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}
            >
              <Code2 size={13} />
              <span>{showJsonCode ? 'Hide JSON Schema' : '{ } View JSON Schema'}</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleApplyChanges}
              disabled={isApplied}
              style={{
                fontSize: '0.85rem',
                padding: '8px 20px',
                background: isApplied ? '#10b981' : '#2563eb',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 700,
              }}
            >
              {isApplied ? (
                <>
                  <Check size={16} />
                  <span>State Synchronized to Project!</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Apply Updates to Project State</span>
                </>
              )}
            </button>
          </div>

          {/* JSON Schema Code Block */}
          {showJsonCode && (
            <pre
              className="json-preview"
              style={{
                marginTop: '12px',
                padding: '12px',
                background: '#090d16',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: '#a78bfa',
                overflowX: 'auto',
              }}
            >
              {JSON.stringify(extractedResult, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};
