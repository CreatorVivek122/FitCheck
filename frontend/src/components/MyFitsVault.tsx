import React, { useState, useEffect } from 'react';
import { Search, Trash2, GitCompare, PlusCircle, Sparkles, AlertCircle, RefreshCw, Layers } from 'lucide-react';
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [occasionFilter, setOccasionFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'score_desc' | 'score_asc'>('newest');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const res = await api.listReports({
        q: searchQuery,
        occasion: occasionFilter,
        sort: sortBy,
      });
      setReports(res.items);
    } catch (err: any) {
      setLoadError(err?.message || 'Could not load your saved fits.');
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
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '36px 0 90px' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <span className="badge" style={{ marginBottom: '8px' }}>
            <Layers size={13} /> Private Wardrobe Archive
          </span>
          <h2 style={{ fontSize: '2.4rem' }}>My Looks & Fits</h2>
          <p className="lead" style={{ fontSize: '0.96rem', margin: 0 }}>
            Your personal archive of evaluated outfits, styling notes, and scores.
          </p>
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
          <Search size={16} style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--mute)',
          }} />
          <input
            type="search"
            placeholder="Search fits by aesthetic, notes, occasion..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{
              paddingLeft: '40px',
              borderRadius: 'var(--radius-full)',
            }}
          />
        </div>

        <select
          value={occasionFilter}
          onChange={(e) => setOccasionFilter(e.target.value)}
          className="form-select"
          style={{ width: 'auto', minWidth: '160px', borderRadius: 'var(--radius-full)' }}
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
          className="form-select"
          style={{ width: 'auto', minWidth: '180px', borderRadius: 'var(--radius-full)' }}
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
          zIndex: 35,
          marginBottom: '28px',
          padding: '16px 24px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, rgba(244, 155, 172, 0.95) 0%, rgba(220, 120, 145, 0.95) 100%)',
          color: '#120e14',
          boxShadow: '0 12px 35px rgba(244, 155, 172, 0.4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          animation: 'fadeIn 0.25s ease',
        }}>
          <div>
            <strong style={{ fontSize: '1.02rem' }}>2 Fits Selected for Head-to-Head Comparison</strong>
            <div style={{ fontSize: '0.84rem', opacity: 0.9 }}>Ready to review score deltas and occasion verdict.</div>
          </div>
          <button
            onClick={() => onCompareSelected(selectedForCompare[0], selectedForCompare[1])}
            className="btn"
            style={{
              backgroundColor: '#120e14',
              color: '#ffffff',
              borderColor: '#120e14',
              fontWeight: 600,
            }}
          >
            <GitCompare size={16} />
            Compare Now
          </button>
        </div>
      )}

      {loadError && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '14px 20px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} />
            <span>{loadError}</span>
          </div>
          <button onClick={fetchReports} className="btn sm outline">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Outfit Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--mute)' }}>
          <Sparkles size={24} className="spin" style={{ color: 'var(--acc)', marginBottom: '10px' }} />
          <div>Curating your wardrobe...</div>
        </div>
      ) : reports.length === 0 ? (
        <div className="card" style={{
          textAlign: 'center',
          padding: '64px 20px',
          background: 'var(--card-subtle)',
          border: '1px solid var(--line)',
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--acc2)',
            color: 'var(--acc)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
          }}>
            <Sparkles size={28} />
          </div>
          <h3 style={{ marginBottom: '8px', fontSize: '1.4rem' }}>Your style journey starts here.</h3>
          <p className="mute" style={{ marginBottom: '24px', maxWidth: '440px', margin: '0 auto 24px' }}>
            Analyze your first outfit to begin curating your private wardrobe library with AI style scores.
          </p>
          <button onClick={onGoToStudio} className="btn primary lg">
            <PlusCircle size={17} />
            Analyze Your First Outfit
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
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
                  padding: '14px',
                  background: 'var(--card-subtle)',
                  border: isSelected ? '2px solid var(--acc)' : '1px solid var(--line)',
                  boxShadow: isSelected ? '0 0 20px rgba(244, 155, 172, 0.3)' : 'var(--shadow-sm)',
                }}
              >
                {/* Outfit Image Card */}
                <div
                  onClick={() => onSelectReport(report)}
                  style={{
                    position: 'relative',
                    aspectRatio: '3/4',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    backgroundColor: '#120e14',
                    cursor: 'pointer',
                    marginBottom: '14px',
                  }}
                >
                  {report.image_url ? (
                    <img
                      src={api.resolveImageUrl(report.image_url)}
                      alt={report.style_title}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fb = e.currentTarget.parentElement?.querySelector('.fallback-box') as HTMLElement;
                        if (fb) fb.style.display = 'flex';
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  ) : null}

                  <div
                    className="fallback-box"
                    style={{
                      display: report.image_url ? 'none' : 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      height: '100%',
                      backgroundColor: 'var(--card-subtle)',
                      color: 'var(--mute)',
                      padding: '16px',
                      textAlign: 'center',
                    }}
                  >
                    <Sparkles size={26} style={{ color: 'var(--acc)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{report.style_title}</span>
                  </div>

                  {/* Score Pill in Top Right (matching inspiration UI) */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(18, 14, 22, 0.88)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(244, 155, 172, 0.35)',
                    color: 'var(--ok)',
                    borderRadius: 'var(--radius-full)',
                    padding: '3px 10px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <span>✦</span>
                    <span>{report.overall_score || '—'}/100</span>
                  </div>
                </div>

                {/* Metadata */}
                <div style={{ marginBottom: '12px' }}>
                  <h3
                    onClick={() => onSelectReport(report)}
                    style={{
                      fontSize: '1.18rem',
                      marginBottom: '4px',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    {report.style_title}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem',
                    color: 'var(--mute)',
                  }}>
                    <span>{new Date(report.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span style={{ color: 'var(--acc)', fontWeight: 600 }}>Rubric v{report.rubric_version}</span>
                  </div>
                </div>

                {/* Inline Note */}
                <input
                  type="text"
                  placeholder="Add a styling note..."
                  defaultValue={report.user_note || ''}
                  onBlur={(e) => handleNoteChange(report.id, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--line)',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    color: 'var(--ink)',
                    fontSize: '0.85rem',
                    marginBottom: '14px',
                    fontFamily: 'inherit',
                    outline: 'none',
                  }}
                />

                {/* Card Actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 'auto',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--line)',
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    userSelect: 'none',
                    color: isSelected ? 'var(--acc)' : 'var(--ink-secondary)',
                    fontWeight: isSelected ? 600 : 400,
                  }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCompare(report.id)}
                      style={{ accentColor: 'var(--acc)' }}
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
                    title="Delete outfit"
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
          backgroundColor: '#120e14',
          color: '#ffffff',
          border: '1px solid var(--line-strong)',
          padding: '12px 24px',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 80,
          fontSize: '0.9rem',
          fontWeight: 600,
        }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
};
