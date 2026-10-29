import React, { useState, useEffect } from 'react';
import { Search, Trash2, GitCompare, PlusCircle } from 'lucide-react';
import type { FitReport } from '../types';
import { api } from '../services/api';

interface MyFitsVaultProps {
  onSelectReport: (report: FitReport) => void;
  onCompareSelected: (reportAId: string, reportBId: string) => void;
  onGoToStudio: () => void;
}

export const MyFitsVault: React.FC<MyFitsVaultProps> = ({
  onSelectReport,
  onCompareSelected,
  onGoToStudio,
}) => {
  const [reports, setReports] = useState<FitReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [occasionFilter, setOccasionFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'score_desc' | 'score_asc'>('newest');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.listReports({
        q: searchQuery,
        occasion: occasionFilter,
        sort: sortBy,
      });
      setReports(res.items);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [searchQuery, occasionFilter, sortBy]);

  const handleNoteChange = async (reportId: string, note: string) => {
    try {
      await api.updateReport(reportId, { user_note: note });
      setToastMessage('Note updated.');
      setTimeout(() => setToastMessage(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!window.confirm('Delete this outfit report from your wardrobe vault?')) return;
    try {
      await api.deleteReport(reportId);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      setSelectedForCompare((prev) => prev.filter((id) => id !== reportId));
      setToastMessage('Outfit removed.');
      setTimeout(() => setToastMessage(null), 2000);
    } catch {
      setToastMessage('Failed to delete report.');
    }
  };

  const toggleCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare((prev) => prev.filter((x) => x !== id));
    } else {
      if (selectedForCompare.length >= 2) {
        setSelectedForCompare([selectedForCompare[1], id]);
      } else {
        setSelectedForCompare((prev) => [...prev, id]);
      }
    }
  };

  return (
    <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '40px 0 90px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>My Wardrobe Vault</h2>
          <p className="mute">Your private library of evaluated outfits, styling notes, and scores.</p>
        </div>
        <button onClick={onGoToStudio} className="btn primary">
          <PlusCircle size={16} />
          Check New Fit
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '28px',
        flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mute)' }} />
          <input
            type="search"
            placeholder="Search notes, style title, aesthetic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--line)',
              backgroundColor: 'var(--card)',
              color: 'var(--ink)',
              fontSize: '0.92rem',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <select
          value={occasionFilter}
          onChange={(e) => setOccasionFilter(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--line)',
            backgroundColor: 'var(--card)',
            color: 'var(--ink)',
            fontSize: '0.92rem',
            fontFamily: 'inherit',
          }}
        >
          <option value="">All Occasions</option>
          <option value="Everyday / Casual">Casual</option>
          <option value="College & Campus">College</option>
          <option value="Office & Smart Casual">Office</option>
          <option value="Date Night & Cocktails">Date Night</option>
          <option value="Modern Streetwear">Streetwear</option>
          <option value="Party & Evening Event">Party</option>
          <option value="Wedding & Festive Traditional">Traditional</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          style={{
            padding: '10px 16px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--line)',
            backgroundColor: 'var(--card)',
            color: 'var(--ink)',
            fontSize: '0.92rem',
            fontFamily: 'inherit',
          }}
        >
          <option value="newest">Sort: Newest First</option>
          <option value="score_desc">Sort: Highest FitScore</option>
          <option value="score_asc">Sort: Lowest FitScore</option>
        </select>
      </div>

      {/* Floating Compare Action Bar if 2 selected */}
      {selectedForCompare.length === 2 && (
        <div style={{
          position: 'sticky',
          top: '84px',
          zIndex: 30,
          marginBottom: '24px',
          padding: '14px 20px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--acc)',
          color: '#ffffff',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div>
            <strong>2 Outfits Selected for Head-to-Head Comparison</strong>
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Ready to review score deltas and occasion verdict.</div>
          </div>
          <button
            onClick={() => onCompareSelected(selectedForCompare[0], selectedForCompare[1])}
            className="btn"
            style={{ backgroundColor: '#ffffff', color: 'var(--acc)', borderColor: '#ffffff' }}
          >
            <GitCompare size={16} />
            Compare Now
          </button>
        </div>
      )}

      {/* Outfit Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--mute)' }}>
          Loading your fits...
        </div>
      ) : reports.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '64px 20px' }}>
          <h3 style={{ marginBottom: '8px' }}>Your style journey starts here.</h3>
          <p className="mute" style={{ marginBottom: '24px' }}>
            Analyze your first outfit to begin curating your private wardrobe library.
          </p>
          <button onClick={onGoToStudio} className="btn primary">
            <PlusCircle size={16} />
            Analyze Your First Outfit
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px',
        }}>
          {reports.map((report) => {
            const isSelected = selectedForCompare.includes(report.id);
            return (
              <div
                key={report.id}
                className="card hoverable"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '16px',
                  border: isSelected ? '2px solid var(--acc)' : '1px solid var(--line)',
                }}
              >
                {/* Outfit Image */}
                <div
                  onClick={() => onSelectReport(report)}
                  style={{
                    position: 'relative',
                    aspectRatio: '3/4',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    backgroundColor: 'var(--card-subtle)',
                    cursor: 'pointer',
                    marginBottom: '14px',
                  }}
                >
                  {report.image_url ? (
                    <img
                      src={report.image_url}
                      alt={report.style_title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--mute)' }}>
                      No Image
                    </div>
                  )}

                  {/* Score Pill */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(26, 25, 24, 0.85)',
                    backdropFilter: 'blur(4px)',
                    color: '#fff',
                    borderRadius: 'var(--radius-full)',
                    padding: '4px 10px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}>
                    {report.overall_score || '—'}
                  </div>
                </div>

                {/* Metadata */}
                <div style={{ marginBottom: '12px' }}>
                  <h3
                    onClick={() => onSelectReport(report)}
                    style={{ fontSize: '1.2rem', marginBottom: '4px', cursor: 'pointer' }}
                  >
                    {report.style_title}
                  </h3>
                  <span className="mute" style={{ fontSize: '0.82rem' }}>
                    {new Date(report.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {/* Inline Note */}
                <input
                  type="text"
                  placeholder="Add a styling note..."
                  defaultValue={report.user_note || ''}
                  onBlur={(e) => handleNoteChange(report.id, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--line)',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--ink)',
                    fontSize: '0.85rem',
                    marginBottom: '14px',
                    fontFamily: 'inherit',
                  }}
                />

                {/* Card Actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 'auto',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--line)',
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCompare(report.id)}
                    />
                    Compare
                  </label>

                  <button
                    onClick={() => handleDelete(report.id)}
                    aria-label="Delete report"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--mute)',
                      padding: '4px',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--ink)',
          color: 'var(--bg)',
          padding: '10px 20px',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 80,
          fontSize: '0.9rem',
          fontWeight: 500,
        }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
};
