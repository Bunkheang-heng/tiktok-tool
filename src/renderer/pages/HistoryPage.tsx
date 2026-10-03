import React, { useEffect, useState } from 'react';
import { FolderOpen, Send, Film, CheckCircle2 } from 'lucide-react';
import { JobStatusBadge } from '../components/JobStatusBadge';

export const HistoryPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);

  const loadCompletedJobs = async () => {
    if (window.api) {
      const allJobs = await window.api.getJobs();
      setJobs(allJobs.filter((j: any) => j.status === 'DELIVERED'));
    }
  };

  useEffect(() => {
    loadCompletedJobs();
  }, []);

  const handleOpenFolder = async (jobId: string) => {
    if (window.api) await window.api.openJobFolder(jobId);
  };

  const handleResend = async (jobId: string) => {
    if (window.api) {
      await window.api.resendToTelegram(jobId);
      alert('Video package sent to Telegram!');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff' }}>Delivered Video History</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          All completed 1080x1920 Khmer trading education videos ready for TikTok upload
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '20px' }}>
        {jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            <Film size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.5 }} />
            <p style={{ fontSize: '14px' }}>No finished videos in history yet.</p>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>Once a scheduled job runs or you click Generate Now, your delivered MP4s will appear here.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 14px', fontWeight: 500 }}>Completed At</th>
                  <th style={{ padding: '12px 14px', fontWeight: 500 }}>Job ID</th>
                  <th style={{ padding: '12px 14px', fontWeight: 500 }}>Delivery Status</th>
                  <th style={{ padding: '12px 14px', fontWeight: 500 }}>Video File</th>
                  <th style={{ padding: '12px 14px', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '14px', color: 'var(--text-primary)' }}>
                      {job.completedAt ? new Date(job.completedAt).toLocaleString() : '-'}
                    </td>
                    <td style={{ padding: '14px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      {job.id.slice(0, 8)}...
                    </td>
                    <td style={{ padding: '14px' }}>
                      <JobStatusBadge status={job.status} />
                    </td>
                    <td style={{ padding: '14px', color: 'var(--accent-emerald)', fontFamily: 'monospace', fontSize: '12px' }}>
                      final.mp4 (1080x1920)
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleOpenFolder(job.id)}
                          title="Open Output Folder in Explorer"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          <FolderOpen size={14} /> Open Folder
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleResend(job.id)}
                          title="Resend to Telegram"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          <Send size={14} /> Resend
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
