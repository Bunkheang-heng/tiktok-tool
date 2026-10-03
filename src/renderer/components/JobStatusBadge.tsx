import React from 'react';
import { JobStatus } from '../../core/types/job';

interface Props {
  status: JobStatus | string;
}

export const JobStatusBadge: React.FC<Props> = ({ status }) => {
  let bg = 'rgba(148, 163, 184, 0.15)';
  let color = '#94a3b8';
  let border = 'rgba(148, 163, 184, 0.3)';

  switch (status) {
    case 'DELIVERED':
      bg = 'rgba(16, 185, 129, 0.15)';
      color = '#34d399';
      border = 'rgba(16, 185, 129, 0.35)';
      break;
    case 'SCHEDULED':
      bg = 'rgba(99, 102, 241, 0.15)';
      color = '#818cf8';
      border = 'rgba(99, 102, 241, 0.35)';
      break;
    case 'STARTING':
    case 'TOPIC_SELECTING':
    case 'SCRIPT_GENERATING':
    case 'SCRIPT_READY':
    case 'VIDEO_GENERATING':
    case 'VIDEO_READY':
    case 'AUDIO_GENERATING':
    case 'SUBTITLE_GENERATING':
    case 'RENDERING':
    case 'METADATA_GENERATING':
    case 'TELEGRAM_SENDING':
      bg = 'rgba(6, 182, 212, 0.15)';
      color = '#38bdf8';
      border = 'rgba(6, 182, 212, 0.35)';
      break;
    case 'RETRYING':
      bg = 'rgba(245, 158, 11, 0.15)';
      color = '#fbbf24';
      border = 'rgba(245, 158, 11, 0.35)';
      break;
    case 'FAILED':
    case 'FAILED_FINAL':
      bg = 'rgba(244, 63, 94, 0.15)';
      color = '#fb7185';
      border = 'rgba(244, 63, 94, 0.35)';
      break;
    case 'INTERRUPTED':
      bg = 'rgba(234, 88, 12, 0.15)';
      color = '#fb923c';
      border = 'rgba(234, 88, 12, 0.35)';
      break;
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.5px',
        borderRadius: '9999px',
        background: bg,
        color,
        border: `1px solid ${border}`,
        textTransform: 'uppercase'
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}`
        }}
      />
      {status.replace(/_/g, ' ')}
    </span>
  );
};
