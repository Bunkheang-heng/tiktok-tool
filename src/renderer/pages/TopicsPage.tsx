import React, { useEffect, useState } from 'react';
import { Star, Plus, Trash2, CheckCircle2, Clock } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Beginner',
  'Technical Analysis',
  'Risk Management',
  'Psychology',
  'Macro'
];

export const TopicsPage: React.FC = () => {
  const [topics, setTopics] = useState<any[]>([]);
  const [category, setCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const [title, setTitle] = useState('');
  const [khmerTitle, setKhmerTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Beginner');
  const [cooldownDays, setCooldownDays] = useState(7);

  const loadTopics = async () => {
    if (window.api) {
      const data = await window.api.getTopics();
      setTopics(data);
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const handleTogglePin = async (topic: any) => {
    if (window.api) {
      await window.api.pinTopic(topic.id, !topic.pinnedForNext);
      loadTopics();
    }
  };

  const handleDelete = async (topicId: string) => {
    if (confirm('Delete this topic from library?')) {
      if (window.api) {
        await window.api.deleteTopic(topicId);
        loadTopics();
      }
    }
  };

  const handleCreateTopic = async () => {
    if (!title.trim() || !khmerTitle.trim()) return;
    if (window.api) {
      await window.api.addTopic({
        title,
        khmerTitle,
        category: newCategory,
        cooldownDays
      });
      setShowAddModal(false);
      setTitle('');
      setKhmerTitle('');
      loadTopics();
    }
  };

  const filteredTopics = topics.filter((t) => {
    if (category === 'All') return true;
    return t.category === category;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff' }}>Trading Topics Curriculum</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Curated Khmer trading education topics with automatic cooldown rotation
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Topic
        </button>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`btn ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCategory(cat)}
            style={{ padding: '6px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Topics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            className="glass-panel"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: topic.pinnedForNext
                ? '1px solid var(--accent-amber)'
                : '1px solid var(--border)',
              background: topic.pinnedForNext
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(18, 24, 38, 0.8) 100%)'
                : 'var(--bg-card)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: '#818cf8',
                    fontWeight: 600
                  }}
                >
                  {topic.category}
                </span>

                <button
                  onClick={() => handleTogglePin(topic)}
                  title={topic.pinnedForNext ? 'Pinned for Next Job' : 'Pin for Next Job'}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: topic.pinnedForNext ? 'var(--accent-amber)' : 'var(--text-muted)'
                  }}
                >
                  <Star size={16} fill={topic.pinnedForNext ? 'currentColor' : 'none'} />
                </button>
              </div>

              <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', marginBottom: '6px' }}>
                {topic.title}
              </h4>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-khmer)',
                  lineHeight: '1.5',
                  marginBottom: '14px'
                }}
              >
                {topic.khmerTitle}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                fontSize: '11px',
                color: 'var(--text-muted)'
              }}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                <span>Used: <strong style={{ color: '#ffffff' }}>{topic.useCount}x</strong></span>
                <span>Cooldown: <strong style={{ color: '#ffffff' }}>{topic.cooldownDays}d</strong></span>
              </div>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(topic.id)}
                style={{ padding: '4px 6px', fontSize: '11px' }}
                title="Delete topic"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Topic Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div
            className="glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '480px', padding: '24px', backgroundColor: '#101422' }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', marginBottom: '16px' }}>
              Add Custom Trading Topic
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>English Title</label>
                <input
                  type="text"
                  placeholder="e.g. Risk-to-Reward ratio in Gold trading"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Khmer Title / Description</label>
                <input
                  type="text"
                  placeholder="e.g. សមាមាត្រ Risk-to-Reward ក្នុងការ Trade មាស"
                  value={khmerTitle}
                  onChange={(e) => setKhmerTitle(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Category</label>
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                  <option value="Beginner">Beginner</option>
                  <option value="Technical Analysis">Technical Analysis</option>
                  <option value="Risk Management">Risk Management</option>
                  <option value="Psychology">Psychology</option>
                  <option value="Macro">Macro</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Cooldown (Days)</label>
                <input
                  type="number"
                  value={cooldownDays}
                  onChange={(e) => setCooldownDays(parseInt(e.target.value, 10))}
                  min={1}
                  max={60}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleCreateTopic}>
                  Save Topic
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
