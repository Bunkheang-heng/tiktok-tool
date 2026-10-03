import React, { useEffect, useState } from 'react';
import { Clock, Plus, Trash2, Check } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const SchedulePage: React.FC = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newSlotName, setNewSlotName] = useState<string>('');
  const [newSlotTime, setNewSlotTime] = useState<string>('12:00');
  const [newSlotDays, setNewSlotDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const loadSlots = async () => {
    if (window.api) {
      const data = await window.api.getScheduleSlots();
      setSlots(data);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const handleToggleSlot = async (slot: any) => {
    if (window.api) {
      await window.api.updateScheduleSlot(slot.id, { enabled: !slot.enabled });
      loadSlots();
    }
  };

  const handleTimeChange = async (slotId: string, time: string) => {
    if (window.api) {
      await window.api.updateScheduleSlot(slotId, { localTime: time });
      loadSlots();
    }
  };

  const handleToggleDay = async (slot: any, dayIdx: number) => {
    const updatedDays = slot.daysOfWeek.includes(dayIdx)
      ? slot.daysOfWeek.filter((d: number) => d !== dayIdx)
      : [...slot.daysOfWeek, dayIdx].sort();

    if (window.api) {
      await window.api.updateScheduleSlot(slot.id, { daysOfWeek: updatedDays });
      loadSlots();
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (confirm('Delete this schedule slot?')) {
      if (window.api) {
        await window.api.deleteScheduleSlot(slotId);
        loadSlots();
      }
    }
  };

  const handleCreateSlot = async () => {
    if (!newSlotName.trim()) return;
    if (window.api) {
      await window.api.addScheduleSlot({
        name: newSlotName,
        localTime: newSlotTime,
        daysOfWeek: newSlotDays,
        enabled: true
      });
      setShowAddModal(false);
      setNewSlotName('');
      loadSlots();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff' }}>Daily Schedule Slots</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Configure when Ben10 FX automatically prepares and delivers your trading videos
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Slot
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {slots.map((slot) => (
          <div
            key={slot.id}
            className="glass-panel"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              border: slot.enabled ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border)'
            }}
          >
            {/* Header & Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>{slot.name}</h4>
                <span style={{ fontSize: '11px', color: slot.enabled ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                  {slot.enabled ? 'Active Scheduled' : 'Disabled'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className={`btn ${slot.enabled ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleToggleSlot(slot)}
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                >
                  {slot.enabled ? 'Enabled' : 'Disabled'}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteSlot(slot.id)}
                  style={{ padding: '6px' }}
                  title="Delete slot"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Time Picker */}
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Execution Time (24h)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={16} color="var(--text-muted)" />
                <input
                  type="time"
                  defaultValue={slot.localTime}
                  onBlur={(e) => handleTimeChange(slot.id, e.target.value)}
                  style={{ width: '140px', fontWeight: 600, fontSize: '15px' }}
                />
              </div>
            </div>

            {/* Days Selector */}
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                Active Days of Week
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {DAYS.map((dayName, idx) => {
                  const isSelected = slot.daysOfWeek.includes(idx);
                  return (
                    <button
                      key={dayName}
                      onClick={() => handleToggleDay(slot, idx)}
                      style={{
                        padding: '6px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: isSelected
                          ? '1px solid var(--accent-emerald)'
                          : '1px solid var(--border)',
                        background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0,0,0,0.2)',
                        color: isSelected ? '#ffffff' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      {dayName}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div
            className="glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '420px', padding: '24px', backgroundColor: '#101422' }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', marginBottom: '16px' }}>
              Add Schedule Slot
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Slot Name</label>
                <input
                  type="text"
                  placeholder="e.g. Midnight Drop"
                  value={newSlotName}
                  onChange={(e) => setNewSlotName(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Time</label>
                <input
                  type="time"
                  value={newSlotTime}
                  onChange={(e) => setNewSlotTime(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleCreateSlot}>
                  Create Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
