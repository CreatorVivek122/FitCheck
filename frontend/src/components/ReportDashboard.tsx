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
  Info
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

  const handleSaveToVault = async () => {
    try {
      // Confetti celebration
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#6d1f2f', '#efe4de', '#3f5b45', '#b58c42'],
      });
      setIsSaved(true);
      setSaveMessage('Saved to your private wardrobe vault!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch {
      setSaveMessage('Failed to save.');
    }
  };

  const getScoreStatus = (score: number | null) => {
    if (!score) return 'Uncalibrated';
    if (score >= 88) return 'Flawlessly Coordinated';
    if (score >= 80) return 'Effortlessly Balanced';
    if (score >= 72) return 'Cohesive & Contemporary';
    return 'Room for Creative Styling';
  };

  const pillars = [
    { key: 'color_coordination', label: 'Color Harmony' },
    { key: 'styling', label: 'Styling & Detailing' },
    { key: 'fit_proportion', label: 'Proportion & Drape' },
    { key: 'occasion_match', label: 'Occasion Alignment' },
  ];

  return (
    <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '40px 0 90px' }}>
      {/* Top Banner Disclaimer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 18px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'var(--card-subtle)',
        border: '1px solid var(--line)',
        marginBottom: '32px',
        fontSize: '0.86rem',
        color: 'var(--mute)',
      }}>
        <Info size={16} style={{ color: 'var(--acc)', flexShrink: 0 }} />
        <span>
          <strong>Styling Guidance:</strong> FitCheck evaluates visible garments and color relationships. 
          Fashion is subjective, and scores represent editorial styling guidance—never judgments of attractiveness.
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: report.image_url ? '4fr 7fr' : '1fr',
        gap: '36px',
        alignItems: 'start',
      }}>
        {/* Left Column: Outfit Image & Palette */}
        {report.image_url && (
          <div style={{ position: 'sticky', top: '96px' }}>
            <div className="card" style={{ padding: '12px', overflow: 'hidden' }}>
              <img
                src={report.image_url}
                alt={report.style_title}
                style={{
                  width: '100%',
                  borderRadius: 'var(--radius-sm)',
                  maxHeight: '480px',
                  objectFit: 'cover',
                  display: 'block',
                  backgroundColor: 'var(--card-subtle)',
                }}
              />

              {/* Extracted Color Palette Chips */}
              {report.extracted_palette && report.extracted_palette.length > 0 && (
                <div style={{ marginTop: '16px', padding: '0 4px 6px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem',
                    color: 'var(--mute)',
                    marginBottom: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    <Palette size={14} />
                    Extracted Palette
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {report.extracted_palette.map((c, i) => (
                      <div
                        key={i}
                        title={`${c.name} (${c.hex})`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 8px',
                          borderRadius: '999px',
                          backgroundColor: 'var(--bg)',
                          border: '1px solid var(--line)',
                          fontSize: '0.75rem',
                        }}
                      >
                        <span
                          style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            backgroundColor: c.hex,
                            border: '1px solid rgba(0,0,0,0.1)',
                          }}
                        />
                        <span style={{ fontWeight: 500 }}>{c.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Column: Detailed Breakdown */}
        <div>
          <div style={{ marginBottom: '24px' }}>
            <span className="badge" style={{ marginBottom: '8px' }}>
              <Sparkles size={12} /> Editorial Verdict
            </span>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{report.style_title}</h1>
            <p className="mute" style={{ fontSize: '1.05rem', margin: 0 }}>
              {report.style_description}
            </p>
          </div>

          {/* Primary FitScore Card */}
          <div className="card" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '28px',
            background: 'linear-gradient(135deg, var(--card) 0%, var(--card-subtle) 100%)',
            border: '1px solid var(--line-strong)',
          }}>
            <div>
              <span style={{
                fontSize: '0.82rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--mute)',
                fontWeight: 600,
              }}>
                Overall FitScore
              </span>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '4.2rem',
                lineHeight: 1,
                color: 'var(--acc)',
                margin: '4px 0',
              }}>
                {report.overall_score !== null ? report.overall_score : '—'}
                <span style={{ fontSize: '1.4rem', color: 'var(--mute)' }}> / 100</span>
              </div>
              <span className="badge sage">
                {getScoreStatus(report.overall_score)}
              </span>
            </div>

            <div style={{ textAlign: 'right', maxWidth: '240px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '4px' }}>
                Confidence Level
              </span>
              <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                {report.overall_confidence}
              </span>
              <p className="mute" style={{ fontSize: '0.8rem', marginTop: '6px' }}>
                Rubric v{report.rubric_version}
              </p>
              <span className="badge" style={{ marginTop: '4px', fontSize: '0.72rem' }}>
                {report.model_id.includes('gemini') ? '✨ Gemini 2.5 Flash' : 'CV Heuristics'}
              </span>
            </div>
          </div>

          {/* 4 Pillars Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}>
            {pillars.map(({ key, label }) => {
              const detail = report.scores[key];
              const scoreVal = detail?.score;
              return (
                <div key={key} className="card" style={{ padding: '18px 16px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--mute)', fontWeight: 600 }}>
                    {label}
                  </span>
                  <div style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '2rem',
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
                      backgroundColor: 'var(--acc)',
                    }} />
                  </div>
                  <p className="mute" style={{ fontSize: '0.8rem', margin: 0, lineHeight: 1.4 }}>
                    {detail?.rationale || 'Observation recorded.'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* What Works Well */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
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
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
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
          <div className="card" style={{ marginBottom: '32px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
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

          {/* Actions Toolbar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            paddingTop: '16px',
            borderTop: '1px solid var(--line)',
          }}>
            <button
              onClick={handleSaveToVault}
              disabled={isSaved}
              className="btn primary"
            >
              <Bookmark size={16} />
              {isSaved ? 'Saved in My Fits' : 'Save to My Fits'}
            </button>

            <button
              onClick={() => onOpenShareModal(report)}
              className="btn"
            >
              <Share2 size={16} />
              Share Card
            </button>

            <a
              href={api.getExportUrl(report.id)}
              download={`fitcheck-report-${report.id.slice(0, 8)}.txt`}
              className="btn"
            >
              <Download size={16} />
              Download Report
            </a>

            <button
              onClick={() => onOpenCompare(report.id)}
              className="btn"
            >
              <GitCompare size={16} />
              Compare Fits
            </button>

            <button
              onClick={onAnalyzeAnother}
              className="btn"
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
              fontSize: '0.9rem',
              fontWeight: 500,
            }}>
              {saveMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
