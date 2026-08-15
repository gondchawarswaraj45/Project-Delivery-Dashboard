import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

import { useProjectContext } from '../../context/ProjectContext';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose }) => {
  const { customers, users, addNewProject } = useProjectContext();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [selectedOwnerIds, setSelectedOwnerIds] = useState<string[]>([users[0]?.id || '', users[1]?.id || '']);
  const [targetDate, setTargetDate] = useState('2026-09-30');
  const [milestonesStr, setMilestonesStr] = useState('Discovery, Configuration, Integration, Handover');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const msArray = milestonesStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    addNewProject(
      {
        name,
        description,
        customerId,
        targetDate,
      },
      msArray.length > 0 ? msArray : ['Discovery', 'Implementation', 'Handover'],
      selectedOwnerIds
    );

    onClose();
  };

  const toggleOwner = (userId: string) => {
    if (selectedOwnerIds.includes(userId)) {
      if (selectedOwnerIds.length > 1) {
        setSelectedOwnerIds(selectedOwnerIds.filter((id) => id !== userId));
      }
    } else {
      setSelectedOwnerIds([...selectedOwnerIds, userId]);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Create New Project</h2>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Project Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Autonomous Fleet Monitoring"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Customer *
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
              }}
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id} style={{ background: '#111827' }}>
                  {c.name} ({c.industry})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Project Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief summary of deployment scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
                resize: 'vertical',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Project Owners (Select multiple)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {users.map((u) => {
                const selected = selectedOwnerIds.includes(u.id);
                return (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => toggleOwner(u.id)}
                    className="btn"
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.8rem',
                      background: selected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255,255,255,0.05)',
                      border: selected ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                      color: selected ? '#fff' : 'var(--text-muted)',
                    }}
                  >
                    <span>[{u.initials}] {u.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Target Completion Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Milestones (comma separated)
            </label>
            <input
              type="text"
              value={milestonesStr}
              onChange={(e) => setMilestonesStr(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Plus size={16} />
              <span>Create Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
