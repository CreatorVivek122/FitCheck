import React, { useState, useEffect } from 'react';
import { GitCompare, Trophy, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import type { CompareResult, FitReport } from '../types';

interface CompareStudioProps {
  initialReportAId?: string;
  initialReportBId?: string;
  onBackToFits: () => void;
}

export const CompareStudio: React.FC<CompareStudioProps> = ({
  initialReportAId,
  initialReportBId,
  onBackToFits,
}) => {
  const [reports, setReports] = useState<FitReport[]>([]);
  const [selectedA, setSelectedA] = useState<string>(initialReportAId || '');
  const [selectedB, setSelectedB] = useState<string>(initialReportBId || '');
  const [targetOccasion, setTargetOccasion] = useState<string>('Everyday / Casual');
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listReports({ limit: 50 }).then((res) => {
      setReports(res.items);
      if (!selectedA && res.items.length > 0) setSelectedA(res.items[0].id);
      if (!selectedB && res.items.length > 1) setSelectedB(res.items[1].id);
    });
  }, []);

  useEffect(() => {
    if (selectedA && selectedB && selectedA !== selectedB) {
      runComparison(selectedA, selectedB, targetOccasion);
    }
  }, [selectedA, selectedB, targetOccasion]);

  const runComparison = async (idA: string, idB: string, occ: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.compareReports(idA, idB, occ);
      setResult(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to compare reports.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '36px 0 90px' }}>
      <style>{`
        @media (max-width: 768px) {
          .compare-cards-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .compare-inputs-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <button
        onClick={onBackToFits}
        className="btn sm outline"
        style={{ marginBottom: '24px', gap: '6px' }}
      >
        <ArrowLeft size={15} /> Back to My Looks
      </button>

      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <span className="badge" style={{ marginBottom: '10px' }}>
          <GitCompare size={13} /> Head-to-Head Comparison
        </span>
        <h2 style={{ fontSize: '2.4rem' }}>Compare Two Looks</h2>
        <p className="lead" style={{ margin: '0 auto', fontSize: '1rem' }}>
          Evaluate color harmony, proportions, and occasion suitability between two outfits.
        </p>
      </div>

      {/* Selectors Card */}
      <div className="card" style={{
        marginBottom: '32px',
        background: 'var(--card-subtle)',
        border: '1px solid var(--line)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          alignItems: 'center',
        }} className="compare-inputs-grid">
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--ink)' }}>
              Outfit A
            </label>
            <select
              value={selectedA}
              onChange={(e) => setSelectedA(e.target.value)}
              className="form-select"
            >
              {reports.map((r) => (
                <option key={r.id} value={r.id} disabled={r.id === selectedB}>
                  {r.style_title} ({r.overall_score || '—'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--ink)' }}>
              Outfit B
            </label>
            <select
              value={selectedB}
              onChange={(e) => setSelectedB(e.target.value)}
              className="form-select"
            >
              {reports.map((r) => (
                <option key={r.id} value={r.id} disabled={r.id === selectedA}>
                  {r.style_title} ({r.overall_score || '—'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--ink)' }}>
              Target Occasion
            </label>
            <input
              type="text"
              value={targetOccasion}
              onChange={(e) => setTargetOccasion(e.target.value)}
              placeholder="e.g. Office, Date Night..."
              className="form-input"
            />
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 18px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          marginBottom: '24px',
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--mute)' }}>
          <Sparkles size={24} className="spin" style={{ color: 'var(--acc)', marginBottom: '10px' }} />
          <div>Computing comparative score deltas...</div>
        </div>
      ) : result ? (
        <div>
          {/* Side-by-side Visual Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '32px',
          }} className="compare-cards-grid">
            {/* Fit A */}
            <div className="card" style={{
              border: result.winning_report_id === result.report_a.id
                ? '2px solid var(--acc)'
                : '1px solid var(--line)',
              background: 'var(--card-subtle)',
              position: 'relative',
              boxShadow: result.winning_report_id === result.report_a.id
                ? '0 0 30px rgba(244, 155, 172, 0.25)'
                : 'var(--shadow-sm)',
            }}>
              {result.winning_report_id === result.report_a.id && (
                <span className="badge" style={{ position: 'absolute', top: '16px', right: '16px' }}>
                  <Trophy size={13} /> Higher Styling Score
                </span>
              )}
              {result.report_a.image_url && (
                <div style={{
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--card-subtle)',
                  marginBottom: '16px',
                }}>
                  <img
                    src={api.resolveImageUrl(result.report_a.image_url)}
                    alt={result.report_a.style_title}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    style={{
                      width: '100%',
                      aspectRatio: '3/4',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                </div>
              )}
              <h3 style={{ marginBottom: '4px', fontSize: '1.25rem' }}>Fit A: {result.report_a.style_title}</h3>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.5rem',
                color: 'var(--acc)',
                marginBottom: '10px',
              }}>
                {result.report_a.overall_score || '—'}
                <span style={{ fontSize: '1rem', color: 'var(--mute)', fontFamily: 'var(--font-sans)' }}> / 100</span>
              </div>
              <p className="mute" style={{ fontSize: '0.88rem' }}>{result.report_a.style_description}</p>
            </div>

            {/* Fit B */}
            <div className="card" style={{
              border: result.winning_report_id === result.report_b.id
                ? '2px solid var(--acc)'
                : '1px solid var(--line)',
              background: 'var(--card-subtle)',
              position: 'relative',
              boxShadow: result.winning_report_id === result.report_b.id
                ? '0 0 30px rgba(244, 155, 172, 0.25)'
                : 'var(--shadow-sm)',
            }}>
              {result.winning_report_id === result.report_b.id && (
                <span className="badge" style={{ position: 'absolute', top: '16px', right: '16px' }}>
                  <Trophy size={13} /> Higher Styling Score
                </span>
              )}
              {result.report_b.image_url && (
                <div style={{
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--card-subtle)',
                  marginBottom: '16px',
                }}>
                  <img
                    src={api.resolveImageUrl(result.report_b.image_url)}
                    alt={result.report_b.style_title}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    style={{
                      width: '100%',
                      aspectRatio: '3/4',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                </div>
              )}
              <h3 style={{ marginBottom: '4px', fontSize: '1.25rem' }}>Fit B: {result.report_b.style_title}</h3>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.5rem',
                color: 'var(--acc)',
                marginBottom: '10px',
              }}>
                {result.report_b.overall_score || '—'}
                <span style={{ fontSize: '1rem', color: 'var(--mute)', fontFamily: 'var(--font-sans)' }}> / 100</span>
              </div>
              <p className="mute" style={{ fontSize: '0.88rem' }}>{result.report_b.style_description}</p>
            </div>
          </div>

          {/* Verdict & Occasion Advice */}
          <div className="card" style={{
            marginBottom: '28px',
            backgroundColor: 'var(--card-subtle)',
            border: '1px solid rgba(244, 155, 172, 0.3)',
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={18} style={{ color: 'var(--gold)' }} />
              Comparative Verdict
            </h3>
            <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '10px' }}>
              {result.verdict}
            </p>
            <p className="mute" style={{ margin: 0, fontSize: '0.92rem' }}>
              <strong style={{ color: 'var(--acc)' }}>Occasion Advice:</strong> {result.occasion_advice}
            </p>
          </div>

          {/* Pillar Comparisons Table */}
          <div className="card" style={{ background: 'var(--card-subtle)', border: '1px solid var(--line)' }}>
            <h3 style={{ marginBottom: '16px' }}>Pillar-by-Pillar Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(result.pillar_comparisons).map(([pillarName, comparisonText]) => (
                <div
                  key={pillarName}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--card-subtle)',
                    border: '1px solid var(--line)',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{pillarName}</span>
                  <span className="badge green" style={{ fontSize: '0.8rem' }}>
                    {comparisonText}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--card-subtle)' }}>
          Select two distinct outfits from your wardrobe to begin comparison.
        </div>
      )}
    </div>
  );
};
