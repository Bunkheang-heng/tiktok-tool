import React, { useEffect, useState } from 'react';
import { FolderOpen, RotateCw, Filter } from 'lucide-react';

export const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [levelFilter, setLevelFilter] = useState<string>('all');

  const loadLogs = async () => {
    if (window.api) {
      const data = await window.api.getRecentLogs(150);
      setLogs(data);
    }
  };

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenFolder = async () => {
    if (window.api) {
      await window.api.openLogFolder();
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (levelFilter === 'all') return true;
    return log.level === levelFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff' }}>System & Pipeline Logs</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Real-time audit events, state transitions, and provider logs
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={loadLogs}>
            <RotateCw size={14} /> Refresh
          </button>
          <button className="btn btn-secondary" onClick={handleOpenFolder}>
            <FolderOpen size={14} /> Open Log Folder
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {['all', 'info', 'warn', 'error'].map((lvl) => (
          <button
            key={lvl}
            className={`btn ${levelFilter === lvl ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setLevelFilter(lvl)}
            style={{ textTransform: 'uppercase', padding: '4px 12px', fontSize: '11px' }}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Logs Container */}
      <div
        className="glass-panel"
        style={{
          padding: '16px',
          fontFamily: 'monospace',
          fontSize: '12px',
          height: 'calc(100vh - 240px)',
          overflowY: 'auto',
          backgroundColor: '#070a10',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        {filteredLogs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
            No log entries match the selected filter.
          </div>
        ) : (
          filteredLogs.map((log) => {
            let levelColor = '#38bdf8'; // info cyan
            if (log.level === 'warn') levelColor = '#fbbf24'; // amber
            if (log.level === 'error') levelColor = '#fb7185'; // rose

            return (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.02)',
                  borderLeft: `3px solid ${levelColor}`
                }}
              >
                <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
                <span
                  style={{
                    color: levelColor,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    width: '45px',
                    flexShrink: 0
                  }}
                >
                  [{log.level}]
                </span>
                <span style={{ color: 'var(--text-secondary)', flexShrink: 0, fontWeight: 500 }}>
                  {log.type}
                </span>
                <span style={{ color: 'var(--text-primary)', wordBreak: 'break-word', flex: 1 }}>
                  {log.message}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
