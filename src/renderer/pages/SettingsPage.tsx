import React, { useEffect, useState } from 'react';
import { Save, Send, CheckCircle2, ShieldCheck, Cpu, HardDrive } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [config, setConfig] = useState<any>({
    appMode: 'mock',
    telegramBotToken: '',
    telegramChatId: '',
    telegramNotifyLevel: 'normal',
    geminiApiKey: '',
    geminiModel: 'gemini-2.0-flash',
    videoProvider: 'mock',
    ttsProvider: 'mock',
    ffmpegPath: '',
    storageDir: './storage',
    startWithWindows: false,
    minimizeToTray: true
  });

  const [saving, setSaving] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (window.api) {
      window.api.getSettings().then((cfg) => {
        if (cfg) setConfig(cfg);
      });
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      if (window.api) {
        await window.api.updateSettings(config);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    setTestingTelegram(true);
    try {
      if (window.api) {
        // Save current settings first
        await window.api.updateSettings(config);
        await window.api.testTelegram();
        alert('Test notification sent successfully to your Telegram account!');
      }
    } catch (err: any) {
      alert(`Telegram test failed: ${err.message}`);
    } finally {
      setTestingTelegram(false);
    }
  };

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '840px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff' }}>Application Settings</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Configure Telegram credentials, AI models, media providers, and background behavior
          </p>
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          <Save size={16} />
          {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      {saveSuccess && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid var(--accent-emerald)',
            color: '#34d399',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} /> Settings successfully saved and applied!
        </div>
      )}

      {/* 1. Environment & Mode */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={18} color="var(--accent-cyan)" /> Application Operating Mode
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Execution Mode</label>
            <select
              value={config.appMode}
              onChange={(e) => setConfig({ ...config, appMode: e.target.value })}
            >
              <option value="mock">Mock Mode (Offline fixtures, no API credits spent)</option>
              <option value="production">Production Mode (Real Gemini, TTS, Telegram & FFmpeg)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Telegram Delivery */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={18} color="var(--accent-emerald)" /> Telegram Bot Delivery
          </h4>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleTestTelegram}
            disabled={testingTelegram}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            {testingTelegram ? 'Sending Test...' : 'Test Connection'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Telegram Bot Token</label>
            <input
              type="password"
              placeholder="e.g. 123456789:AAH..."
              value={config.telegramBotToken}
              onChange={(e) => setConfig({ ...config, telegramBotToken: e.target.value })}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Telegram Chat ID</label>
            <input
              type="text"
              placeholder="e.g. 987654321"
              value={config.telegramChatId}
              onChange={(e) => setConfig({ ...config, telegramChatId: e.target.value })}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Notification Verbosity</label>
            <select
              value={config.telegramNotifyLevel}
              onChange={(e) => setConfig({ ...config, telegramNotifyLevel: e.target.value })}
            >
              <option value="minimal">Minimal (Only Final Video Delivery)</option>
              <option value="normal">Normal (Start, Topic, Video, and Final Delivery)</option>
              <option value="detailed">Detailed (Every State Transition & Retry)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. AI / Gemini LLM */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="var(--accent-indigo)" /> Gemini AI Configuration
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Gemini API Key</label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={config.geminiApiKey}
              onChange={(e) => setConfig({ ...config, geminiApiKey: e.target.value })}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Gemini Model</label>
            <input
              type="text"
              placeholder="gemini-2.0-flash"
              value={config.geminiModel}
              onChange={(e) => setConfig({ ...config, geminiModel: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* 4. Video, Voice & Storage */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HardDrive size={18} color="var(--accent-amber)" /> Media & Storage Pipelines
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Video Generator Provider</label>
            <select
              value={config.videoProvider}
              onChange={(e) => setConfig({ ...config, videoProvider: e.target.value })}
            >
              <option value="notebooklm">Google NotebookLM (Automated Studio Video Overview)</option>
              <option value="browser">Browser Playwright Worker</option>
              <option value="mock">Mock Video Generator (Offline Test)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Google Notebook URL</label>
            <input
              type="text"
              placeholder="https://notebook.google.com/notebook/2419265c-bfcb-4dfa-9ee8-52ad6926b5fa"
              value={config.notebookUrl || ''}
              onChange={(e) => setConfig({ ...config, notebookUrl: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Khmer Voice / TTS</label>
            <select
              value={config.ttsProvider}
              onChange={(e) => setConfig({ ...config, ttsProvider: e.target.value })}
            >
              <option value="mock">Mock Audio</option>
              <option value="google">Google Khmer Voice (Built-in)</option>
              <option value="edge">Edge Neural Khmer Voice</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>FFmpeg Executable Path</label>
            <input
              type="text"
              placeholder="Leave blank to use system PATH ffmpeg"
              value={config.ffmpegPath}
              onChange={(e) => setConfig({ ...config, ffmpegPath: e.target.value })}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Storage Directory</label>
            <input
              type="text"
              value={config.storageDir}
              onChange={(e) => setConfig({ ...config, storageDir: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* 5. System & Background Behavior */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', marginBottom: '16px' }}>
          Windows Desktop Behavior
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={config.startWithWindows}
              onChange={(e) => setConfig({ ...config, startWithWindows: e.target.checked })}
              style={{ width: '16px', height: '16px' }}
            />
            <span>Start Ben10 FX Automation when Windows starts</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={config.minimizeToTray}
              onChange={(e) => setConfig({ ...config, minimizeToTray: e.target.checked })}
              style={{ width: '16px', height: '16px' }}
            />
            <span>Minimize to Windows system tray instead of closing when window is closed</span>
          </label>
        </div>
      </div>
    </form>
  );
};
