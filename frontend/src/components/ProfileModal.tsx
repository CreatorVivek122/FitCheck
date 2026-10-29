import React, { useState, useEffect } from 'react';
import { X, User, Download, Trash2, Check } from 'lucide-react';
import { api } from '../services/api';

interface ProfileModalProps {
  onClose: () => void;
  onDataWiped: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose, onDataWiped }) => {
  const [username, setUsername] = useState('');
  const [defaultOccasion, setDefaultOccasion] = useState('Everyday / Casual');
  const [preferredStyle, setPreferredStyle] = useState('Minimalist');
  const [feedbackTone, setFeedbackTone] = useState('Honest and direct');
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProfile().then((data) => {
      setUsername(data.username || 'Fashion Friend');
      setDefaultOccasion(data.default_occasion || 'Everyday / Casual');
      setPreferredStyle(data.preferred_style || 'Minimalist');
      setFeedbackTone(data.feedback_tone || 'Honest and direct');
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateProfile({
        username,
        default_occasion: defaultOccasion,
        preferred_style: preferredStyle,
        feedback_tone: feedbackTone,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2400);
    } catch {
      // ignore
    }
  };

  const handleWipeData = async () => {
    if (!window.confirm('Are you sure you want to permanently delete all your saved fits, reports, and preferences? This cannot be undone.')) {
      return;
    }
    try {
      await api.wipeUserData();
      onDataWiped();
      onClose();
    } catch {
      alert('Failed to wipe data.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'var(--overlay-bg)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 70,
      padding: '20px',
    }}>
      <div className="card" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '32px',
        backgroundColor: 'var(--modal-bg)',
        border: '1px solid var(--line-strong)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--mute)',
            padding: '4px',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: 'var(--acc2)',
            color: 'var(--acc)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(244, 155, 172, 0.3)',
          }}>
            <User size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '2px' }}>Stylist Preferences</h3>
            <p className="mute" style={{ fontSize: '0.85rem', margin: 0 }}>
              Tailor default parameters for your AI outfit analyses.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--mute)' }}>
            Loading settings...
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '6px', color: 'var(--ink)' }}>
                Your Stylist Alias
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '6px', color: 'var(--ink)' }}>
                Default Target Occasion
              </label>
              <input
                type="text"
                value={defaultOccasion}
                onChange={(e) => setDefaultOccasion(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '6px', color: 'var(--ink)' }}>
                Preferred Aesthetic
              </label>
              <input
                type="text"
                value={preferredStyle}
                onChange={(e) => setPreferredStyle(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '6px', color: 'var(--ink)' }}>
                Styling Tone
              </label>
              <select
                value={feedbackTone}
                onChange={(e) => setFeedbackTone(e.target.value)}
                className="form-select"
              >
                <option value="Honest and direct">Honest and direct</option>
                <option value="Gentle and encouraging">Gentle and encouraging</option>
                <option value="Editorial Stylist Deep-Dive">Editorial Stylist Deep-Dive</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" className="btn primary" style={{ flex: 1 }}>
                {isSaved ? <><Check size={16} /> Saved</> : 'Save Preferences'}
              </button>
            </div>
          </form>
        )}

        {/* Data & Privacy Actions */}
        <div style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Data Privacy & GDPR Controls
          </span>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={async () => {
                const archive = await api.exportUserData();
                const blob = new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `fitcheck-gdpr-archive-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
              }}
              className="btn sm outline"
              style={{ flex: 1, gap: '6px' }}
            >
              <Download size={14} /> Export All My Data
            </button>

            <button
              type="button"
              onClick={handleWipeData}
              className="btn sm outline"
              style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)', gap: '6px' }}
            >
              <Trash2 size={14} /> Delete All Records
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
