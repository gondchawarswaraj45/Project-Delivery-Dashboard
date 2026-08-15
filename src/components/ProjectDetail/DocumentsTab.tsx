import React from 'react';
import { FileText, Download, Eye, EyeOff, Lock, FileCode, Paperclip } from 'lucide-react';
import { useProjectContext } from '../../context/ProjectContext';
import { Project } from '../../types';

interface DocumentsTabProps {
  project: Project;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({ project }) => {
  const { documents, toggleDocumentVisibility, viewMode } = useProjectContext();

  const projectDocs = documents.filter((d) => d.projectId === project.id);

  // In Customer view, filter out internal-only documents! (Requirement #14)
  const visibleDocs = projectDocs.filter((d) => {
    if (viewMode === 'customer') return d.visibleToCustomer;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Project Documents & Assets</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {viewMode === 'customer' ? 'Customer accessible handover materials' : 'All delivery documents & internal specifications'}
          </p>
        </div>
      </div>

      {/* Documents List */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table className="project-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Type</th>
              <th>Size</th>
              <th>Uploaded</th>
              <th>Customer Visibility</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleDocs.map((doc) => (
              <tr key={doc.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', color: '#60a5fa' }}>
                      <FileText size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>{doc.name}</div>
                    </div>
                  </div>
                </td>

                <td style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {doc.fileType}
                </td>

                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{doc.fileSize || 'N/A'}</td>

                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{doc.uploadedAt}</td>

                <td>
                  {viewMode === 'internal' ? (
                    <button
                      className="btn btn-ghost"
                      onClick={() => toggleDocumentVisibility(doc.id)}
                      style={{
                        fontSize: '0.75rem',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        background: doc.visibleToCustomer ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: doc.visibleToCustomer ? '#34d399' : '#f87171',
                        border: `1px solid ${doc.visibleToCustomer ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      }}
                    >
                      {doc.visibleToCustomer ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{doc.visibleToCustomer ? 'Customer Visible' : 'Internal Only'}</span>
                    </button>
                  ) : (
                    <span className="status-badge ON_TRACK" style={{ fontSize: '0.7rem' }}>
                      <Eye size={10} /> Visible
                    </span>
                  )}
                </td>

                <td>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Downloading ${doc.name}`);
                    }}
                    className="btn btn-ghost"
                    style={{ padding: '6px', color: '#60a5fa' }}
                    title="Download document"
                  >
                    <Download size={16} />
                  </a>
                </td>
              </tr>
            ))}

            {visibleDocs.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No customer accessible documents uploaded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
