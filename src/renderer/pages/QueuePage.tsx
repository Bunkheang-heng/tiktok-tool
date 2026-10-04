import React, { useEffect, useState } from 'react';
import { JobStatusBadge } from '../components/JobStatusBadge';
import { FolderOpen, Send, RefreshCw, Eye, X, XCircle } from 'lucide-react';

export const QueuePage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobDetails, setJobDetails] = useState<any | null>(null);

  const loadJobs = async () => {
    if (window.api) {
      const data = await window.api.getJobs();
      setJobs(data);
    }
  };

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (jobId: string) => {
    if (window.api && (window.api as any).cancelJob) {
      await (window.api as any).cancelJob(jobId, 'Cancelled via UI');
      await loadJobs();
    }
  };


  const handleOpenDetails = async (jobId: string) => {
    setSelectedJobId(jobId);
    if (window.api) {
      const details = await window.api.getJobDetails(jobId);
      setJobDetails(details);
    }
  };

  const handleOpenFolder = async (jobId: string) => {
    if (window.api) await window.api.openJobFolder(jobId);
  };

  const handleResend = async (jobId: string) => {
    if (window.api) {
      await window.api.resendToTelegram(jobId);
      alert('Resent to Telegram!');
    }
  };

  const handleRetry = async (jobId: string) => {
    if (window.api) {
      await window.api.retryJob(jobId);
      loadJobs();
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (filter === 'active') {
      return !['DELIVERED', 'FAILED_FINAL', 'CANCELLED', 'SCHEDULED'].includes(job.status);
    }
    if (filter === 'completed') return job.status === 'DELIVERED';
    if (filter === 'failed') return job.status === 'FAILED' || job.status === 'FAILED_FINAL';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        {['all', 'active', 'completed', 'failed'].map((tab) => (
          <button
            key={tab}
            className={`btn ${filter === tab ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(tab)}
            style={{ textTransform: 'capitalize', padding: '6px 16px', fontSize: '12px' }}
          >
            {tab} ({
              jobs.filter((j) => {
                if (tab === 'active') return !['DELIVERED', 'FAILED_FINAL', 'CANCELLED', 'SCHEDULED'].includes(j.status);
                if (tab === 'completed') return j.status === 'DELIVERED';
                if (tab === 'failed') return j.status === 'FAILED' || j.status === 'FAILED_FINAL';
                return true;
              }).length
            })
          </button>
        ))}
      </div>

      {/* Jobs Table */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 14px', fontWeight: 500 }}>Job ID</th>
                <th style={{ padding: '12px 14px', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '12px 14px', fontWeight: 500 }}>Current Step</th>
                <th style={{ padding: '12px 14px', fontWeight: 500 }}>Retries</th>
                <th style={{ padding: '12px 14px', fontWeight: 500 }}>Scheduled / Started</th>
                <th style={{ padding: '12px 14px', fontWeight: 500, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No jobs match this filter.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr
                    key={job.id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <td style={{ padding: '14px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      {job.id.slice(0, 8)}...
                    </td>
                    <td style={{ padding: '14px' }}>
                      <JobStatusBadge status={job.status} />
                    </td>
                    <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>
                      {job.currentStep || '-'}
                    </td>
                    <td style={{ padding: '14px', color: job.retryCount > 0 ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
                      {job.retryCount} / {job.maxRetries}
                    </td>
                    <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>
                      {job.startedAt
                        ? new Date(job.startedAt).toLocaleTimeString()
                        : job.scheduledAt
                        ? new Date(job.scheduledAt).toLocaleTimeString()
                        : '-'}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleOpenDetails(job.id)}
                          title="View Details"
                          style={{ padding: '5px 8px' }}
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleOpenFolder(job.id)}
                          title="Open Folder"
                          style={{ padding: '5px 8px' }}
                        >
                          <FolderOpen size={13} />
                        </button>
                        {job.status === 'DELIVERED' && (
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleResend(job.id)}
                            title="Resend to Telegram"
                            style={{ padding: '5px 8px' }}
                          >
                            <Send size={13} />
                          </button>
                        )}
                        {(job.status === 'FAILED' || job.status === 'FAILED_FINAL' || job.status === 'INTERRUPTED') && (
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleRetry(job.id)}
                            title="Retry"
                            style={{ padding: '5px 8px' }}
                          >
                            <RefreshCw size={13} />
                          </button>
                        )}
                        {!['DELIVERED', 'FAILED', 'FAILED_FINAL', 'CANCELLED'].includes(job.status) && (
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleCancel(job.id)}
                            title="Cancel Job"
                            style={{ padding: '5px 8px', color: '#f43f5e' }}
                          >
                            <XCircle size={13} />
                          </button>
                        )}
                      </div>

                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedJobId && jobDetails && (
        <div className="modal-overlay" onClick={() => setSelectedJobId(null)}>
          <div
            className="glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '760px',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '28px',
              backgroundColor: '#101422'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                  Job Details: {jobDetails.job.id}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Created: {new Date(jobDetails.job.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedJobId(null)}
                style={{ padding: '6px' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Generated Content Section */}
            {jobDetails.content ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: 600, textTransform: 'uppercase' }}>
                    TikTok Title (Khmer)
                  </span>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', marginTop: '4px', fontFamily: 'var(--font-khmer)' }}>
                    {jobDetails.content.titleKhmer}
                  </div>
                </div>

                <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Hook (First 3 Seconds)
                  </span>
                  <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '4px', fontFamily: 'var(--font-khmer)' }}>
                    {jobDetails.content.hook}
                  </div>
                </div>

                <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Spoken Khmer Narration Script
                  </span>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.6', fontFamily: 'var(--font-khmer)', whiteSpace: 'pre-wrap' }}>
                    {jobDetails.content.scriptKhmer}
                  </div>
                </div>

                <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--accent-indigo)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Video Visual Prompt
                  </span>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', fontFamily: 'monospace' }}>
                    {jobDetails.content.videoPrompt}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Hashtags
                  </span>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {jobDetails.content.hashtags?.map((tag: string, i: number) => (
                      <span key={i} style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Content generation has not produced output for this job yet.
              </div>
            )}

            {/* Audit Events */}
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '10px' }}>
              Execution Lifecycle Events
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {jobDetails.events?.map((evt: any) => (
                <div
                  key={evt.id}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.2)',
                    borderLeft: `3px solid ${evt.level === 'error' ? 'var(--accent-rose)' : 'var(--accent-emerald)'}`,
                    fontSize: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>{evt.type}</span>
                    <span>{new Date(evt.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div style={{ color: 'var(--text-primary)', marginTop: '2px' }}>
                    {evt.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
