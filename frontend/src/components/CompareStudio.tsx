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
    <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '40px 0 90px' }}>
      <button
        onClick={onBackToFits}
        className="btn sm"
        style={{ marginBottom: '24px' }}
      >
        <ArrowLeft size={15} /> Back to Wardrobe Vault
      </button>

      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <span className="badge" style={{ marginBottom: '10px' }}>
          <GitCompare size={13} /> Head-to-Head Comparison
        </span>
        <h2>Compare Two Looks</h2>
        <p className="mute">
          Evaluate color harmony, proportions, and occasion suitability between two outfits.
        </p>
      </div>

      {/* Selectors */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          alignItems: 'center',
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Outfit A
            </label>
            <select
              value={selectedA}
              onChange={(e) => setSelectedA(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--line)',
                backgroundColor: 'var(--card-subtle)',
                color: 'var(--ink)',
                fontSize: '0.9rem',
              }}
            >
              {reports.map((r) => (
                <option key={r.id} value={r.id} disabled={r.id === selectedB}>
                  {r.style_title} ({r.overall_score || '—'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Outfit B
            </label>
            <select
              value={selectedB}
              onChange={(e) => setSelectedB(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--line)',
                backgroundColor: 'var(--card-subtle)',
                color: 'var(--ink)',
                fontSize: '0.9rem',
              }}
            >
              {reports.map((r) => (
                <option key={r.id} value={r.id} disabled={r.id === selectedA}>
                  {r.style_title} ({r.overall_score || '—'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Target Occasion
            </label>
            <input
              type="text"
              value={targetOccasion}
              onChange={(e) => setTargetOccasion(e.target.value)}
              placeholder="e.g. Office, Date Night..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--line)',
                backgroundColor: 'var(--card-subtle)',
                color: 'var(--ink)',
                fontSize: '0.9rem',
              }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          marginBottom: '20px',
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--mute)' }}>
          Computing comparative breakdown...
        </div>
      ) : result ? (
        <div>
          {/* Side-by-side Visual Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '32px',
          }}>
            {/* Fit A */}
            <div className="card" style={{
              border: result.winning_report_id === result.report_a.id ? '2px solid var(--acc)' : '1px solid var(--line)',
              position: 'relative',
            }}>
              {result.winning_report_id === result.report_a.id && (
                <span className="badge" style={{ position: 'absolute', top: '16px', right: '16px' }}>
                  <Trophy size={13} /> Higher Styling Score
                </span>
              )}
              {result.report_a.image_url && (
                <img
                  src={result.report_a.image_url}
                  alt={result.report_a.style_title}
                  style={{
                    width: '100%',
                    aspectRatio: '3/4',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '16px',
                  }}
                />
              )}
              <h3 style={{ marginBottom: '4px' }}>Fit A: {result.report_a.style_title}</h3>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.5rem',
                color: 'var(--acc)',
                marginBottom: '10px',
              }}>
                {result.report_a.overall_score || '—'}
                <span style={{ fontSize: '1rem', color: 'var(--mute)' }}> / 100</span>
              </div>
              <p className="mute" style={{ fontSize: '0.88rem' }}>{result.report_a.style_description}</p>
            </div>

            {/* Fit B */}
            <div className="card" style={{
              border: result.winning_report_id === result.report_b.id ? '2px solid var(--acc)' : '1px solid var(--line)',
              position: 'relative',
            }}>
              {result.winning_report_id === result.report_b.id && (
                <span className="badge" style={{ position: 'absolute', top: '16px', right: '16px' }}>
                  <Trophy size={13} /> Higher Styling Score
                </span>
              )}
              {result.report_b.image_url && (
                <img
                  src={result.report_b.image_url}
                  alt={result.report_b.style_title}
                  style={{
                    width: '100%',
                    aspectRatio: '3/4',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '16px',
                  }}
                />
              )}
              <h3 style={{ marginBottom: '4px' }}>Fit B: {result.report_b.style_title}</h3>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.5rem',
                color: 'var(--acc)',
                marginBottom: '10px',
              }}>
                {result.report_b.overall_score || '—'}
                <span style={{ fontSize: '1rem', color: 'var(--mute)' }}> / 100</span>
              </div>
              <p className="mute" style={{ fontSize: '0.88rem' }}>{result.report_b.style_description}</p>
            </div>
          </div>

          {/* Verdict & Occasion Advice */}
          <div className="card" style={{
            marginBottom: '28px',
            backgroundColor: 'var(--card-subtle)',
            border: '1px solid var(--line-strong)',
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={18} style={{ color: 'var(--gold)' }} />
              Comparative Verdict
            </h3>
            <p style={{ fontSize: '1.05rem', fontWeight: 500, marginBottom: '12px' }}>
              {result.verdict}
            </p>
            <p className="mute" style={{ margin: 0, fontSize: '0.92rem' }}>
              <strong>Occasion Advice:</strong> {result.occasion_advice}
            </p>
          </div>

          {/* Pillar Comparisons Table */}
          <div className="card">
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
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--line)',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{pillarName}</span>
                  <span className="badge sage" style={{ fontSize: '0.8rem' }}>
                    {comparisonText}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          Select two distinct outfits from your wardrobe to begin comparison.
        </div>
      )}
    </div>
  );
};
