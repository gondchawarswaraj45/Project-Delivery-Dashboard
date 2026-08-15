import React, { useState } from 'react';
import { Plus, User } from 'lucide-react';
import { useProjectContext } from '../../context/ProjectContext';
import { Project, IssueCategory } from '../../types';


interface IssuesTabProps {
  project: Project;
}

export const IssuesTab: React.FC<IssuesTabProps> = ({ project }) => {
  const { issues, users, addIssue, viewMode } = useProjectContext();
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for creating issue
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IssueCategory>(viewMode === 'customer' ? 'Support' : 'Bug');
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [ownerId, setOwnerId] = useState(users[0]?.id || '');
  const [description, setDescription] = useState('');

  const projectIssues = issues.filter((i) => i.projectId === project.id);

  // Filter issues based on view mode (Hide internalOnly in Customer view!) and Category filter
  const visibleIssues = projectIssues.filter((i) => {
    if (viewMode === 'customer' && i.internalOnly) return false;
    if (categoryFilter === 'ALL') return true;
    return i.category === categoryFilter;
  });

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const issueCount = projectIssues.length + 101;
    const prefix = category === 'Bug' ? 'BUG' : category === 'Implementation' ? 'IMP' : category === 'Support' ? 'SUP' : 'REQ';
    const code = `${prefix}-${issueCount}`;

    addIssue({
      projectId: project.id,
      code,
      title,
      category,
      status: 'Open',
      priority,
      ownerId: ownerId || users[0]?.id || 'u1',
      internalOnly: viewMode === 'customer' ? false : category === 'Bug',
      description,
    });

    setIsModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const internalCategories = ['ALL', 'Bug', 'Feature Request', 'Question', 'Support', 'Implementation'];
  const customerCategories = ['ALL', 'Support', 'Feature Request', 'Question', 'Implementation'];
  const activeCategories = viewMode === 'internal' ? internalCategories : customerCategories;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Taxonomy Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {viewMode === 'internal' ? 'Project Issues & Engineering Tickets (Internal)' : 'Support Requests & Collaboration Items (Customer)'}
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {viewMode === 'internal'
              ? `Full issue taxonomy including confidential internal bugs (${visibleIssues.length} items)`
              : `Customer-safe support tickets and inquiries (${visibleIssues.length} visible)`}
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => {
          setCategory(viewMode === 'customer' ? 'Support' : 'Bug');
          setIsModalOpen(true);
        }}>
          <Plus size={16} />
          <span>{viewMode === 'internal' ? 'Log Issue' : 'Submit Support Request'}</span>
        </button>
      </div>

      {/* Category Taxonomy Buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {activeCategories.map((cat) => {
          const active = categoryFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className="btn btn-ghost"
              style={{
                fontSize: '0.8rem',
                padding: '6px 14px',
                borderRadius: '16px',
                background: active ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255,255,255,0.03)',
                border: active ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                color: active ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: active ? 600 : 400,
              }}
            >
              {cat === 'ALL' ? 'All' : cat}
            </button>
          );
        })}
      </div>

      {/* Issue Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {visibleIssues.map((issue) => {
          const owner = users.find((u) => u.id === issue.ownerId);
          return (
            <div key={issue.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#60a5fa',
                    background: 'rgba(59, 130, 246, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {issue.code}
                </span>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {viewMode === 'internal' && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: issue.internalOnly ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                        color: issue.internalOnly ? '#f87171' : '#34d399',
                        fontWeight: 600,
                      }}
                    >
                      {issue.internalOnly ? '🔒 Internal' : '🌐 Customer'}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {issue.category}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: issue.status === 'Open' ? '#ef4444' : issue.status === 'In Progress' ? '#f59e0b' : '#10b981',
                    }}
                  >
                    ● {issue.status}
                  </span>
                </div>
              </div>

              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>{issue.title}</div>

              {issue.description && (
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{issue.description}</div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                <span>Priority: <strong style={{ color: issue.priority === 'HIGH' ? '#f87171' : 'var(--text-main)' }}>{issue.priority}</strong></span>
                {owner && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={12} /> {viewMode === 'internal' ? `Owner: ${owner.name.split(' ')[0]}` : `Assigned: ${owner.name.split(' ')[0]}`}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {visibleIssues.length === 0 && (
          <div className="glass-panel" style={{ padding: '40px', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
            {viewMode === 'customer'
              ? 'No customer-facing support requests currently open for this project.'
              : 'No issues match the selected category filter.'}
          </div>
        )}
      </div>

      {/* Log Issue / Support Request Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
              {viewMode === 'internal' ? 'Log New Internal Issue' : 'Submit Support Request / Inquiry'}
            </h3>
            <form onSubmit={handleCreateIssue} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {viewMode === 'internal' ? 'Issue Title *' : 'Request Subject *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={viewMode === 'internal' ? 'e.g. API authentication failing on staging' : 'e.g. Need assistance with WiFi subnet configuration'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as IssueCategory)}
                    style={{ width: '100%', padding: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)' }}
                  >
                    {viewMode === 'internal' && <option value="Bug">Bug (Internal)</option>}
                    <option value="Support">Support</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Question">Question</option>
                    <option value="Implementation">Implementation</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    style={{ width: '100%', padding: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)' }}
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              {viewMode === 'internal' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Assignee / Owner
                  </label>
                  <select
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)' }}
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}


              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Description / Context
                </label>
                <textarea
                  rows={3}
                  value={description}
                  placeholder={viewMode === 'internal' ? 'Detailed stack trace, error code, or environment details...' : 'Describe the question or assistance required...'}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {viewMode === 'internal' ? 'Submit Issue' : 'Send to Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
