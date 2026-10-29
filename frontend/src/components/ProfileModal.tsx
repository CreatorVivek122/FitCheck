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
      backgroundColor: 'rgba(22, 20, 19, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 60,
      padding: '20px',
    }}>
      <div className="card" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '32px',
        backgroundColor: 'var(--card)',
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
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'var(--acc2)',
            color: 'var(--acc)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <User size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.4rem' }}>Stylist Profile & Preferences</h3>
            <p className="mute" style={{ fontSize: '0.85rem', margin: 0 }}>
              Saved in your secure database backend.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--mute)' }}>Loading profile...</div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                Your Name / Handle
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--line)',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--ink)',
                  fontSize: '0.92rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                Default Occasion
              </label>
              <select
                value={defaultOccasion}
                onChange={(e) => setDefaultOccasion(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--line)',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--ink)',
                  fontSize: '0.92rem',
                }}
              >
                <option value="Everyday / Casual">Everyday / Casual</option>
                <option value="College & Campus">College & Campus</option>
                <option value="Office & Smart Casual">Office & Smart Casual</option>
                <option value="Date Night & Cocktails">Date Night & Cocktails</option>
                <option value="Modern Streetwear">Modern Streetwear</option>
                <option value="Party & Evening Event">Party & Evening Event</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                Preferred Style Aesthetic
              </label>
              <select
                value={preferredStyle}
                onChange={(e) => setPreferredStyle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--line)',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--ink)',
                  fontSize: '0.92rem',
                }}
              >
                <option value="Minimalist & Tonal">Minimalist & Tonal</option>
                <option value="Modern Streetwear">Modern Streetwear</option>
                <option value="Old Money / Quiet Luxury">Old Money / Quiet Luxury</option>
                <option value="Y2K & Vintage Retro">Y2K & Vintage Retro</option>
                <option value="Smart Casual Tailored">Smart Casual Tailored</option>
                <option value="Clean Athleisure">Clean Athleisure</option>
              </select>
            </div>

            <button type="submit" className="btn primary" style={{ marginTop: '8px' }}>
              {isSaved ? <Check size={16} /> : null}
              {isSaved ? 'Preferences Saved' : 'Save Preferences'}
            </button>
          </form>
        )}

        {/* Data & Privacy Controls */}
        <div style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--mute)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
            Data Privacy & Export
          </span>

          <a
            href={api.getUserExportUrl()}
            download="fitcheck-archive.json"
            className="btn"
            style={{ width: '100%' }}
          >
            <Download size={15} />
            Export My Data Archive (JSON)
          </a>

          <button
            onClick={handleWipeData}
            className="btn"
            style={{ width: '100%', color: 'var(--acc)', borderColor: 'var(--line-strong)' }}
          >
            <Trash2 size={15} />
            Permanently Wipe All Data
          </button>
        </div>
      </div>
    </div>
  );
};
