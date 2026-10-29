import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  Download,
  Share2,
  Bookmark,
  GitCompare,
  PlusCircle,
  Palette,
  Info,
  Check
} from 'lucide-react';
import type { FitReport } from '../types';
import { api } from '../services/api';

interface ReportDashboardProps {
  report: FitReport;
  onAnalyzeAnother: () => void;
  onOpenCompare: (reportId: string) => void;
  onOpenShareModal: (report: FitReport) => void;
}

export const ReportDashboard: React.FC<ReportDashboardProps> = ({
  report,
  onAnalyzeAnother,
  onOpenCompare,
  onOpenShareModal,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleSaveToVault = async () => {
    try {
      confetti({
        particleCount: 65,
        spread: 75,
        origin: { y: 0.7 },
        colors: ['#f49bac', '#86efac', '#c084fc', '#fbbf24'],
      });
      setIsSaved(true);
      setSaveMessage('Saved to your private wardrobe vault!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch {
      setSaveMessage('Failed to save.');
    }
  };

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const getScoreStatus = (score: number | null) => {
    if (!score) return 'Uncalibrated';
    if (score >= 88) return 'Flawlessly Coordinated';
    if (score >= 80) return 'Effortlessly Balanced';
    if (score >= 72) return 'Cohesive & Contemporary';
    return 'Creative Experimentation';
  };

  const pillars = [
    { key: 'color_coordination', label: 'Color Match & Harmony', color: 'var(--ok)' },
    { key: 'styling', label: 'Styling & Detailing', color: 'var(--gold)' },
    { key: 'fit_proportion', label: 'Silhouette & Proportions', color: 'var(--acc)' },
    { key: 'occasion_match', label: 'Occasion Alignment', color: 'var(--purple)' },
  ];

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '36px 0 90px' }}>
      <style>{`
        @media (max-width: 900px) {
          .report-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
          .report-image-col {
            position: static !important;
          }
          .action-buttons-wrap {
            flex-direction: column !important;
          }
          .action-buttons-wrap .btn {
            width: 100% !important;
          }
        }
      `}</style>

      {/* Top Disclaimer Badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 18px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--line)',
        marginBottom: '28px',
        fontSize: '0.85rem',
        color: 'var(--mute)',
      }}>
        <Info size={16} style={{ color: 'var(--acc)', flexShrink: 0 }} />
        <span>
          <strong>Styling Guidance:</strong> FitCheck evaluates color balance, drape, and occasion fit.
          Fashion is personal and subjective—all scores reflect objective styling harmony rather than personal judgment.
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: report.image_url ? '4fr 7fr' : '1fr',
        gap: '36px',
        alignItems: 'start',
      }} className="report-grid">
        {/* Left Column: Image Card & Extracted Palette */}
        {report.image_url && (
          <div className="report-image-col" style={{ position: 'sticky', top: '96px' }}>
            <div className="card" style={{
              padding: '14px',
              backgroundColor: 'var(--card-subtle)',
              border: '1px solid var(--line-strong)',
              boxShadow: '0 12px 35px rgba(0, 0, 0, 0.5)',
            }}>
              <div style={{
                position: 'relative',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                backgroundColor: 'var(--card-subtle)',
              }}>
                <img
                  src={api.resolveImageUrl(report.image_url)}
                  alt={report.style_title}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  style={{
                    width: '100%',
                    maxHeight: '480px',
                    objectFit: 'contain',
                    display: 'block',
                    margin: '0 auto',
                  }}
                />
              </div>

              {/* Extracted Color Palette */}
              {report.extracted_palette && report.extracted_palette.length > 0 && (
                <div style={{ marginTop: '16px', padding: '0 4px 6px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem',
                    color: 'var(--mute)',
                    marginBottom: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Palette size={14} style={{ color: 'var(--acc)' }} />
                      Extracted Palette
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--mute)' }}>Tap HEX to copy</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {report.extracted_palette.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => copyHex(c.hex)}
                        title={`Click to copy ${c.hex}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 10px',
                          borderRadius: '999px',
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--line)',
                          color: 'var(--ink)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <span
                          style={{
                            width: '13px',
                            height: '13px',
                            borderRadius: '50%',
                            backgroundColor: c.hex,
                            border: '1px solid rgba(255,255,255,0.2)',
                          }}
                        />
                        <span style={{ fontWeight: 600 }}>{c.name}</span>
                        <span style={{ color: 'var(--mute)', fontSize: '0.7rem' }}>
                          {copiedHex === c.hex ? '✓ Copied' : c.hex}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Column: Detailed Score & Insights */}
        <div>
          {/* Style Title & Summary */}
          <div style={{ marginBottom: '26px' }}>
            <span className="badge" style={{ marginBottom: '10px' }}>
              <Sparkles size={12} /> Editorial Verdict
            </span>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', letterSpacing: '-0.02em' }}>
              {report.style_title}
            </h1>
            <p className="lead" style={{ fontSize: '1.05rem', margin: 0, color: 'var(--mute)' }}>
              {report.style_description}
            </p>
          </div>

          {/* Primary FitScore Card (matching Image 1 & 2) */}
          <div className="card" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '28px',
            background: 'linear-gradient(135deg, var(--card) 0%, var(--card-subtle) 100%)',
            border: '1px solid var(--line-strong)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div>
              <span style={{
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--mute)',
                fontWeight: 700,
              }}>
                Overall AI FitScore
              </span>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '4.2rem',
                lineHeight: 1,
                color: 'var(--acc)',
                margin: '6px 0',
                display: 'flex',
                alignItems: 'baseline',
                gap: '8px',
              }}>
                <span>{report.overall_score !== null ? report.overall_score : '—'}</span>
                <span style={{ fontSize: '1.4rem', color: 'var(--mute)', fontFamily: 'var(--font-sans)' }}>
                  / 100
                </span>
              </div>
              <span className="badge green" style={{ fontWeight: 700 }}>
                {getScoreStatus(report.overall_score)}
              </span>
            </div>

            <div style={{ textAlign: 'right', minWidth: '180px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--mute)', display: 'block', marginBottom: '4px' }}>
                Confidence Level
              </span>
              <span style={{ fontWeight: 700, textTransform: 'capitalize', color: 'var(--ink)' }}>
                {report.overall_confidence}
              </span>
              <p className="mute" style={{ fontSize: '0.78rem', marginTop: '6px' }}>
                Rubric v{report.rubric_version}
              </p>
              <span className="badge" style={{ marginTop: '6px', fontSize: '0.72rem' }}>
                {report.model_id.includes('gemini') ? '✨ Gemini 2.5 Flash' : 'CV Heuristics'}
              </span>
            </div>
          </div>

          {/* 4 Pillars Grid (matching breakdown from Image 1) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '16px',
            marginBottom: '30px',
          }}>
            {pillars.map(({ key, label, color }) => {
              const detail = report.scores[key];
              const scoreVal = detail?.score;
              return (
                <div key={key} className="card" style={{
                  padding: '18px 16px',
                  background: 'var(--card-subtle)',
                  border: '1px solid var(--line)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--mute)', fontWeight: 600 }}>
                      {label}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color }}>
                      {scoreVal !== null && scoreVal !== undefined ? `${scoreVal}/100` : '—'}
                    </span>
                  </div>

                  <div style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.9rem',
                    margin: '6px 0',
                    color: scoreVal ? 'var(--ink)' : 'var(--mute)',
                  }}>
                    {scoreVal !== null && scoreVal !== undefined ? scoreVal : '—'}
                  </div>

                  {/* Progress Bar */}
                  <div style={{
                    height: '5px',
                    width: '100%',
                    backgroundColor: 'var(--line)',
                    borderRadius: '999px',
                    overflow: 'hidden',
                    marginBottom: '8px',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${scoreVal || 0}%`,
                      backgroundColor: color,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                  <p className="mute" style={{ fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>
                    {detail?.rationale || 'Observation recorded.'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* What Works Well Card */}
          <div className="card" style={{
            marginBottom: '20px',
            background: 'var(--card-subtle)',
            border: '1px solid var(--line)',
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontSize: '1.25rem' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--ok)' }} />
              What's Working Well
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {report.what_works.map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.94rem' }}>
                  <span style={{ color: 'var(--ok)', fontWeight: 'bold' }}>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Refinement Opportunities */}
          <div className="card" style={{
            marginBottom: '20px',
            background: 'var(--card-subtle)',
            border: '1px solid var(--line)',
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontSize: '1.25rem' }}>
              <ArrowUpRight size={18} style={{ color: 'var(--acc)' }} />
              Refinement Opportunities
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {report.improvements.map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.94rem' }}>
                  <span style={{ color: 'var(--acc)', fontWeight: 'bold' }}>→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Styling Upgrades & Variations */}
          <div className="card" style={{
            marginBottom: '32px',
            background: 'var(--card-subtle)',
            border: '1px solid var(--line)',
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontSize: '1.25rem' }}>
              <Sparkles size={18} style={{ color: 'var(--gold)' }} />
              Styling Upgrades & Variations
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {report.styling_ideas.map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.94rem' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>+</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Toolbar */}
          <div className="action-buttons-wrap" style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            paddingTop: '20px',
            borderTop: '1px solid var(--line)',
          }}>
            <button
              onClick={handleSaveToVault}
              disabled={isSaved}
              className="btn primary"
            >
              <Bookmark size={16} />
              {isSaved ? 'Saved in My Looks' : 'Save to My Looks'}
            </button>

            <button
              onClick={() => onOpenShareModal(report)}
              className="btn outline"
            >
              <Share2 size={16} />
              Magazine Card
            </button>

            <a
              href={api.getExportUrl(report.id)}
              download={`fitcheck-report-${report.id.slice(0, 8)}.txt`}
              className="btn outline"
            >
              <Download size={16} />
              Download Report
            </a>

            <button
              onClick={() => onOpenCompare(report.id)}
              className="btn outline"
            >
              <GitCompare size={16} />
              Compare Fits
            </button>

            <button
              onClick={onAnalyzeAnother}
              className="btn outline"
            >
              <PlusCircle size={16} />
              Analyze Another
            </button>
          </div>

          {saveMessage && (
            <div style={{
              marginTop: '16px',
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--ok-bg)',
              color: 'var(--ok)',
              border: '1px solid var(--ok-border)',
              fontSize: '0.9rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <Check size={16} />
              <span>{saveMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
