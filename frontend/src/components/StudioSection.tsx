import React, { useState, useRef } from 'react';
import { Upload, X, RefreshCw, Sparkles, Check, AlertCircle, ArrowRight, Shield } from 'lucide-react';
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
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setErrorMessage(null);
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
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 0 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <span className="badge" style={{ marginBottom: '12px' }}>
          <Sparkles size={13} /> FitCheck Studio
        </span>
        <h2>Check Your Fit</h2>
        <p className="mute">
          Upload a full-length outfit photo to receive instant, objective styling feedback.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: previewUrl ? '1fr 1fr' : '1fr',
        gap: '32px',
        alignItems: 'start',
      }}>
        {/* Upload Zone */}
        <div className="card">
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
                backgroundColor: isDragging ? 'var(--acc2)' : 'var(--card-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '56px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--card)',
                color: 'var(--acc)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <Upload size={24} />
              </div>
              <h3 style={{ marginBottom: '8px', fontSize: '1.25rem' }}>Drop your outfit photo here</h3>
              <p className="mute" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                or click to browse from device · JPG, PNG, WEBP (up to 10 MB)
              </p>
              <span className="btn sm">Browse Photo</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
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
                  className="btn sm"
                  style={{ color: 'var(--acc)' }}
                >
                  <X size={14} /> Remove
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
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
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              marginTop: '16px',
              fontSize: '0.9rem',
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Styling Preferences & Submission */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '6px' }}>
              Where are you heading? (Occasion)
            </label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--line)',
                backgroundColor: 'var(--card)',
                color: 'var(--ink)',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
              }}
            >
              {OCCASIONS.map((occ) => (
                <option key={occ} value={occ}>{occ}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '6px' }}>
              Preferred Aesthetic (Target Style)
            </label>
            <select
              value={targetStyle}
              onChange={(e) => setTargetStyle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--line)',
                backgroundColor: 'var(--card)',
                color: 'var(--ink)',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
              }}
            >
              {STYLES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '6px' }}>
              Feedback Tone
            </label>
            <select
              value={feedbackTone}
              onChange={(e) => setFeedbackTone(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--line)',
                backgroundColor: 'var(--card)',
                color: 'var(--ink)',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
              }}
            >
              {TONES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div style={{
            padding: '14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--card-subtle)',
            fontSize: '0.85rem',
            color: 'var(--mute)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}>
            <Shield size={16} style={{ color: 'var(--ok)', flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Private by default:</strong> Your photo is analyzed strictly for clothing coordination. 
              Photos are never shared publicly without your explicit consent.
            </span>
          </div>

          {/* Processing Stages */}
          {isProcessing ? (
            <div style={{ padding: '16px 0' }}>
              <div style={{
                height: '6px',
                width: '100%',
                backgroundColor: 'var(--line)',
                borderRadius: '999px',
                overflow: 'hidden',
                marginBottom: '16px',
              }}>
                <div style={{
                  height: '100%',
                  width: `${(activeStep / (steps.length - 1)) * 100}%`,
                  backgroundColor: 'var(--acc)',
                  transition: 'width 0.4s ease',
                }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {steps.map((st, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.88rem',
                      color: i <= activeStep ? 'var(--ink)' : 'var(--mute)',
                      fontWeight: i === activeStep ? 600 : 400,
                    }}
                  >
                    {i < activeStep ? (
                      <Check size={14} style={{ color: 'var(--ok)' }} />
                    ) : i === activeStep ? (
                      <RefreshCw size={14} className="spin" style={{ color: 'var(--acc)' }} />
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
              className="btn primary"
              style={{ width: '100%', padding: '14px 20px', fontSize: '1rem', marginTop: '10px' }}
            >
              Analyze My Fit
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
