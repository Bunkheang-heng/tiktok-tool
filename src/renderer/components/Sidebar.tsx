import React from 'react';
import {
  LayoutDashboard,
  ListOrdered,
  CalendarClock,
  Lightbulb,
  History,
  Settings,
  ScrollText,
  Activity
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'queue'
  | 'schedule'
  | 'topics'
  | 'history'
  | 'settings'
  | 'logs';

interface Props {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  schedulerRunning: boolean;
  appMode: string;
}

export const Sidebar: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  schedulerRunning,
  appMode
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'queue', label: 'Queue & Jobs', icon: ListOrdered },
    { id: 'schedule', label: 'Schedule', icon: CalendarClock },
    { id: 'topics', label: 'Trading Topics', icon: Lightbulb },
    { id: 'history', label: 'Content History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'logs', label: 'Logs & Events', icon: ScrollText }
  ];

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        flexShrink: 0
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}
        >
          <Activity size={20} color="#ffffff" />
        </div>
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '16px',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.3px'
            }}
          >
            Ben10 FX
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Content Automation
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as NavTab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                border: isActive
                  ? '1px solid rgba(16, 185, 129, 0.3)'
                  : '1px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon
                size={18}
                color={isActive ? 'var(--accent-emerald)' : 'var(--text-muted)'}
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer Status Widget */}
      <div
        style={{
          padding: '16px 16px',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Scheduler</span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: schedulerRunning ? 'var(--accent-emerald)' : 'var(--accent-amber)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: schedulerRunning ? 'var(--accent-emerald)' : 'var(--accent-amber)'
              }}
            />
            {schedulerRunning ? 'Active' : 'Paused'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mode</span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: appMode === 'production' ? 'var(--accent-cyan)' : '#a855f7'
            }}
          >
            {appMode}
          </span>
        </div>
      </div>
    </aside>
  );
};
