import React from 'react';
import { JobStatusBadge } from '../components/JobStatusBadge';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Send,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';

interface Props {
  state: any;
  onRefresh: () => void;
}

export const DashboardPage: React.FC<Props> = ({ state, onRefresh }) => {
  const { activeJob, nextRun, nextSlotName, stats, recentJobs } = state || {};

  const formatTime = (isoString?: string) => {
    if (!isoString) return 'Not scheduled';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleOpenFolder = async (jobId: string) => {
    if (window.api) {
      await window.api.openJobFolder(jobId);
    }
  };

  const handleResend = async (jobId: string) => {
    if (window.api) {
      await window.api.resendToTelegram(jobId);
      alert('Resent video package to Telegram!');
    }
  };

  const handleRetry = async (jobId: string) => {
    if (window.api) {
      await window.api.retryJob(jobId);
      onRefresh();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Stat Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Next Slot Card */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Next Scheduled Run</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#ffffff' }}>
            {formatTime(nextRun)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {nextSlotName || 'Daily Automation'}
          </div>
        </div>

        {/* Delivered Videos */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Videos Delivered</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#ffffff' }}>
            {stats?.completed ?? 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--accent-emerald)', marginTop: '4px' }}>
            Ready for TikTok upload
          </div>
        </div>

        {/* Failed Jobs */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Failed Jobs</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <AlertCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#ffffff' }}>
            {stats?.failed ?? 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Auto-recovery enabled
          </div>
        </div>

        {/* Total Topics */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Available Topics</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8' }}>
              <Sparkles size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#ffffff' }}>
            {stats?.totalTopics ?? 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Khmer Trading Curriculum
          </div>
        </div>
      </div>

      {/* Active Job Progress Card */}
      {activeJob && (
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(18, 24, 38, 0.9) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-cyan)',
                  boxShadow: '0 0 12px var(--accent-cyan)'
                }}
              />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>
                Job In Progress: {activeJob.id.slice(0, 8)}...
              </h3>
            </div>
            <JobStatusBadge status={activeJob.status} />
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Current Step: <strong style={{ color: '#ffffff' }}>{activeJob.currentStep || 'Initializing'}</strong>
          </p>

          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '9999px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: '60%',
                height: '100%',
                background: 'linear-gradient(90deg, #06b6d4 0%, #10b981 100%)',
                borderRadius: '9999px',
                animation: 'pulse 2s infinite'
              }}
            />
          </div>
        </div>
      )}

      {/* Recent Activity Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>
              Recent Generation Jobs
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Latest executions and Telegram delivery logs
            </p>
          </div>
          <button className="btn btn-secondary" onClick={onRefresh} style={{ padding: '6px 12px', fontSize: '12px' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {(!recentJobs || recentJobs.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
            No recent jobs found. Click "Generate Now" to run your first video!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Job ID</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Started</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Completed</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map((job: any) => (
                  <tr
                    key={job.id}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      transition: 'background 0.15s'
                    }}
                  >
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      {job.id.slice(0, 8)}...
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <JobStatusBadge status={job.status} />
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {job.startedAt ? new Date(job.startedAt).toLocaleTimeString() : '-'}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {job.completedAt ? new Date(job.completedAt).toLocaleTimeString() : '-'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleOpenFolder(job.id)}
                          title="Open Output Folder"
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                        >
                          <FolderOpen size={14} />
                        </button>
                        {job.status === 'DELIVERED' && (
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleResend(job.id)}
                            title="Resend to Telegram"
                            style={{ padding: '6px 10px', fontSize: '12px' }}
                          >
                            <Send size={14} />
                          </button>
                        )}
                        {(job.status === 'FAILED' || job.status === 'FAILED_FINAL' || job.status === 'INTERRUPTED') && (
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleRetry(job.id)}
                            title="Retry Job"
                            style={{ padding: '6px 10px', fontSize: '12px' }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        )}
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
