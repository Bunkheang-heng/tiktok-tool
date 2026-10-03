import React, { useEffect, useState } from 'react';
import { Sidebar, NavTab } from '../components/Sidebar';
import { Header } from '../components/Header';
import { DashboardPage } from '../pages/DashboardPage';
import { QueuePage } from '../pages/QueuePage';
import { SchedulePage } from '../pages/SchedulePage';
import { TopicsPage } from '../pages/TopicsPage';
import { HistoryPage } from '../pages/HistoryPage';
import { SettingsPage } from '../pages/SettingsPage';
import { LogsPage } from '../pages/LogsPage';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [dashboardState, setDashboardState] = useState<any>({
    schedulerRunning: true,
    activeJob: null,
    nextRun: null,
    nextSlotName: 'Morning Drop',
    recentJobs: [],
    stats: { completed: 0, failed: 0, totalTopics: 0, mode: 'mock' }
  });
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const loadDashboard = async () => {
    if (window.api) {
      try {
        const state = await window.api.getDashboardState();
        if (state) setDashboardState(state);
      } catch (err) {
        console.error('Failed to load dashboard state:', err);
      }
    }
  };

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateNow = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      if (window.api) {
        await window.api.generateNow();
        await loadDashboard();
        // Automatically take user to Queue tab to see live generation!
        setCurrentTab('queue');
      }
    } catch (err: any) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const getPageTitle = (tab: NavTab): { title: string; subtitle: string } => {
    switch (tab) {
      case 'dashboard':
        return {
          title: 'Mission Control',
          subtitle: 'Real-time overview of your automated content pipeline'
        };
      case 'queue':
        return {
          title: 'Generation Queue',
          subtitle: 'Inspect live generation progress, scripts, and video artifacts'
        };
      case 'schedule':
        return {
          title: 'Automation Schedule',
          subtitle: 'Manage daily slots and automatic video preparation times'
        };
      case 'topics':
        return {
          title: 'Trading Curriculum',
          subtitle: 'Educational topics across 5 categories with smart rotation'
        };
      case 'history':
        return {
          title: 'Delivered Videos',
          subtitle: 'Access rendered MP4 packages ready for manual TikTok upload'
        };
      case 'settings':
        return {
          title: 'Configuration',
          subtitle: 'Credentials, API keys, AI models, and system preferences'
        };
      case 'logs':
        return {
          title: 'Audit & Diagnostic Logs',
          subtitle: 'Detailed state machine transitions and execution logs'
        };
    }
  };

  const { title, subtitle } = getPageTitle(currentTab);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        schedulerRunning={dashboardState.schedulerRunning}
        appMode={dashboardState.stats?.mode || 'mock'}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Header
          title={title}
          subtitle={subtitle}
          onGenerateNow={handleGenerateNow}
          onRefresh={loadDashboard}
          isGenerating={isGenerating}
        />

        <main
          style={{
            flex: 1,
            padding: '28px',
            overflowY: 'auto',
            backgroundColor: 'var(--bg-main)'
          }}
        >
          {currentTab === 'dashboard' && (
            <DashboardPage state={dashboardState} onRefresh={loadDashboard} />
          )}
          {currentTab === 'queue' && <QueuePage />}
          {currentTab === 'schedule' && <SchedulePage />}
          {currentTab === 'topics' && <TopicsPage />}
          {currentTab === 'history' && <HistoryPage />}
          {currentTab === 'settings' && <SettingsPage />}
          {currentTab === 'logs' && <LogsPage />}
        </main>
      </div>
    </div>
  );
};
