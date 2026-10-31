import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, RefreshCw, Sparkles, Check, AlertCircle, ArrowRight, Shield, Camera } from 'lucide-react';
import { api } from '../services/api';
import type { FitReport } from '../types';

interface StudioSectionProps {
  onAnalysisComplete: (report: FitReport) => void;
  defaultOccasion?: string;
  defaultStyle?: string;
  defaultTone?: string;
}

const OCCASIONS = [
  'Everyday / Casual',
  'College & Campus',
  'Office & Smart Casual',
  'Date Night & Cocktails',
  'Modern Streetwear',
  'Party & Evening Event',
  'Wedding & Festive Traditional',
  'Gym & Athleisure',
];

const STYLES = [
  'Let AI decide',
  'Minimalist & Tonal',
  'Modern Streetwear',
  'Old Money / Quiet Luxury',
  'Y2K & Vintage Retro',
  'Smart Casual Tailored',
  'Clean Athleisure',
];

const TONES = [
  'Honest & Direct',
  'Gentle & Encouraging',
  'Editorial Stylist Deep-Dive',
];

export const StudioSection: React.FC<StudioSectionProps> = ({
  onAnalysisComplete,
  defaultOccasion = 'Everyday / Casual',
  defaultStyle = 'Let AI decide',
  defaultTone = 'Honest & Direct',
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [occasion, setOccasion] = useState(defaultOccasion);
  const [targetStyle, setTargetStyle] = useState(defaultStyle);
  const [feedbackTone, setFeedbackTone] = useState(defaultTone);

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  previewUrlRef.current = previewUrl;

  useEffect(() => {
    return () => {
      if (previewUrlRef.current && previewUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleFile = (selectedFile: File) => {
    setErrorMessage(null);
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
      setErrorMessage('Please upload a valid JPG, PNG, or WEBP image.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 10 MB limit. Please select a smaller photo.');
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    const img = new Image();
    img.onload = () => {
      if (img.width < 150 || img.height < 150) {
        setErrorMessage('Image dimensions too small. Please use an image at least 150px wide.');
        URL.revokeObjectURL(objectUrl);
        return;
      }
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setFile(selectedFile);
      setPreviewUrl(objectUrl);
    };
    img.onerror = () => {
      setErrorMessage('Unable to read image file. It may be corrupt.');
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  };

  const handleClear = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setActiveStep(1); // Uploading

    try {
      // 1. Upload to backend
      const uploadResp = await api.uploadImage(file);
      setActiveStep(2); // Analyzing

      // 2. Trigger analysis
      const analysisJob = await api.createAnalysis({
        imageId: uploadResp.id,
        occasion,
        targetStyle,
        feedbackTone,
      });

      setActiveStep(3); // Finalizing

      if (analysisJob.report) {
        setTimeout(() => {
          setIsProcessing(false);
          onAnalysisComplete(analysisJob.report!);
        }, 600);
      } else {
        throw new Error('Analysis completed but report could not be generated.');
      }
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err?.message || 'Analysis could not be completed. Please try again.');
    }
  };

  const steps = [
    'Preparing image file...',
    'Decoding silhouette & garments...',
    'Analyzing palette harmony & contrast...',
    'Generating tailored styling report...',
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '36px 0 80px' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1.2s linear infinite;
        }
        @media (max-width: 820px) {
          .studio-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '38px' }}>
        <span className="badge" style={{ marginBottom: '12px' }}>
          <Sparkles size={13} /> FitCheck Studio
        </span>
        <h2 style={{ fontSize: '2.4rem', marginBottom: '8px' }}>Check Your Fit</h2>
        <p className="lead" style={{ margin: '0 auto', fontSize: '1.02rem' }}>
          Upload your outfit photo for instant AI scoring, color harmony breakdown, and custom styling advice.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: previewUrl ? '1fr 1fr' : '1fr',
        gap: '32px',
        alignItems: 'start',
      }} className="studio-grid">
        {/* Upload Zone */}
        <div className="card" style={{
          background: 'var(--card-subtle)',
          border: '1px solid var(--line)',
        }}>
          {!previewUrl ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? 'var(--acc)' : 'var(--line-strong)'}`,
                backgroundColor: isDragging ? 'var(--acc2)' : 'var(--card)',
                borderRadius: 'var(--radius-md)',
                padding: '60px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--acc2)',
                color: 'var(--acc)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                border: '1px solid rgba(244, 155, 172, 0.3)',
                boxShadow: '0 4px 20px rgba(244, 155, 172, 0.2)',
              }}>
                <Camera size={28} />
              </div>
              <h3 style={{ marginBottom: '8px', fontSize: '1.3rem' }}>Drop your fit photo here</h3>
              <p className="mute" style={{ fontSize: '0.92rem', marginBottom: '20px' }}>
                or click to browse from your device · JPG, PNG, WEBP (up to 10 MB)
              </p>
              <span className="btn primary sm" style={{ padding: '8px 24px' }}>
                <Upload size={15} /> Select Photo
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFile(e.target.files[0]);
                  e.target.value = '';
                }}
              />
            </div>
          ) : (
            <div>
              <div style={{
                position: 'relative',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                backgroundColor: 'var(--card-subtle)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--line-strong)',
              }}>
                <img
                  src={previewUrl}
                  alt="Uploaded outfit preview"
                  style={{
                    width: '100%',
                    maxHeight: '440px',
                    objectFit: 'contain',
                    display: 'block',
                    margin: '0 auto',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn sm"
                >
                  <RefreshCw size={14} /> Replace
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="btn sm outline"
                  style={{ color: 'var(--acc)', borderColor: 'var(--line)' }}
                >
                  <X size={14} /> Remove
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFile(e.target.files[0]);
                  e.target.value = '';
                }}
              />
            </div>
          )}

          {errorMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              marginTop: '18px',
              fontSize: '0.9rem',
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Styling Preferences & Submission Card */}
        <div className="card" style={{
          background: 'var(--card-subtle)',
          border: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>
              Where are you heading? (Occasion)
            </label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="form-select"
            >
              {OCCASIONS.map((occ) => (
                <option key={occ} value={occ}>
                  {occ}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>
              Target Aesthetic
            </label>
            <select
              value={targetStyle}
              onChange={(e) => setTargetStyle(e.target.value)}
              className="form-select"
            >
              {STYLES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>
              Stylist Feedback Tone
            </label>
            <select
              value={feedbackTone}
              onChange={(e) => setFeedbackTone(e.target.value)}
              className="form-select"
            >
              {TONES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div style={{
            padding: '14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--card-subtle)',
            border: '1px solid var(--line)',
            fontSize: '0.84rem',
            color: 'var(--mute)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}>
            <Shield size={16} style={{ color: 'var(--ok)', flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Private by default:</strong> Your image is analyzed strictly for garment color and styling harmony. 
              Photos are never shared publicly without your explicit choice.
            </span>
          </div>

          {/* Processing Stages */}
          {isProcessing ? (
            <div style={{
              padding: '20px',
              backgroundColor: 'rgba(244, 155, 172, 0.06)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(244, 155, 172, 0.2)',
            }}>
              <div style={{
                height: '6px',
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '999px',
                overflow: 'hidden',
                marginBottom: '16px',
              }}>
                <div style={{
                  height: '100%',
                  width: `${(activeStep / (steps.length - 1)) * 100}%`,
                  backgroundColor: 'var(--acc)',
                  transition: 'width 0.4s ease',
                  boxShadow: '0 0 12px var(--acc)',
                }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {steps.map((st, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '0.88rem',
                      color: i <= activeStep ? 'var(--ink)' : 'var(--mute)',
                      fontWeight: i === activeStep ? 600 : 400,
                    }}
                  >
                    {i < activeStep ? (
                      <Check size={15} style={{ color: 'var(--ok)' }} />
                    ) : i === activeStep ? (
                      <RefreshCw size={15} className="spin" style={{ color: 'var(--acc)' }} />
                    ) : (
                      <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1px solid var(--mute)' }} />
                    )}
                    <span>{st}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <button
              onClick={handleAnalyze}
              disabled={!file}
              className="btn primary lg"
              style={{
                width: '100%',
                padding: '14px 20px',
                fontSize: '1rem',
                marginTop: '10px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              <Sparkles size={17} />
              <span>Score & Analyze My Fit</span>
              <ArrowRight size={17} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
