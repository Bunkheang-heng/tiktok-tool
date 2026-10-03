import React from 'react';
import { Play, RotateCw } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
  onGenerateNow: () => void;
  onRefresh: () => void;
  isGenerating?: boolean;
}

export const Header: React.FC<Props> = ({
  title,
  subtitle,
  onGenerateNow,
  onRefresh,
  isGenerating
}) => {
  return (
    <header
      style={{
        height: '68px',
        padding: '0 28px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(10, 13, 20, 0.7)',
        backdropFilter: 'blur(12px)',
        flexShrink: 0
      }}
    >
      <div>
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.3px'
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className="btn btn-secondary"
          onClick={onRefresh}
          title="Refresh data"
          style={{ padding: '8px 12px' }}
        >
          <RotateCw size={15} />
        </button>

        <button
          className="btn btn-primary"
          onClick={onGenerateNow}
          disabled={isGenerating}
          style={{ opacity: isGenerating ? 0.7 : 1 }}
        >
          <Play size={15} fill="currentColor" />
          {isGenerating ? 'Generating Video...' : 'Generate Now'}
        </button>
      </div>
    </header>
  );
};
