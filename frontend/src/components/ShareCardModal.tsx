import React, { useRef, useEffect, useState } from 'react';
import { X, Download, Copy, Check } from 'lucide-react';
import type { FitReport } from '../types';
import { api } from '../services/api';

interface ShareCardModalProps {
  report: FitReport;
  onClose: () => void;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({ report, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Card dimensions (standard 9:16 vertical story format: 600 x 900)
    canvas.width = 600;
    canvas.height = 900;

    // Luxury Dark Gradient Background (matching new UI)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 900);
    bgGrad.addColorStop(0, '#130f17');
    bgGrad.addColorStop(0.5, '#0e0b12');
    bgGrad.addColorStop(1, '#18121d');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 600, 900);

    // Subtle ambient glow at top
    const glow = ctx.createRadialGradient(300, 150, 20, 300, 150, 280);
    glow.addColorStop(0, 'rgba(244, 155, 172, 0.15)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 600, 500);

    // Border line (Blush pink accent border)
    ctx.strokeStyle = 'rgba(244, 155, 172, 0.28)';
    ctx.lineWidth = 4;
    ctx.strokeRect(18, 18, 564, 864);

    // Header Branding
    ctx.fillStyle = '#ffffff';
    ctx.font = '500 32px Newsreader, serif';
    ctx.textAlign = 'center';
    ctx.fillText('FitCheck.', 300, 68);

    ctx.fillStyle = '#f49bac';
    ctx.font = '700 11px "DM Sans", sans-serif';
    ctx.fillText('EDITORIAL AI FASHION ANALYSIS', 300, 90);

    // Load and draw photo
    if (report.image_url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Draw image frame
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(50, 115, 500, 500, [18]);
        ctx.clip();

        // Calculate aspect fill
        const imgRatio = img.width / img.height;
        const targetRatio = 500 / 500;
        let sW, sH, sX, sY;
        if (imgRatio > targetRatio) {
          sH = img.height;
          sW = img.height * targetRatio;
          sX = (img.width - sW) / 2;
          sY = 0;
        } else {
          sW = img.width;
          sH = img.width / targetRatio;
          sX = 0;
          sY = (img.height - sH) / 2;
        }

        ctx.drawImage(img, sX, sY, sW, sH, 50, 115, 500, 500);
        ctx.restore();

        // Image stroke overlay
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(50, 115, 500, 500, [18]);
        ctx.stroke();

        // Draw FitScore Badge in bottom-right corner of image
        ctx.fillStyle = '#f49bac';
        ctx.beginPath();
        ctx.roundRect(390, 545, 140, 52, [26]);
        ctx.fill();

        ctx.fillStyle = '#120e14';
        ctx.font = 'bold 24px "DM Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${report.overall_score || 0}`, 438, 580);

        ctx.font = '600 13px "DM Sans", sans-serif';
        ctx.fillText('/ 100', 484, 580);

        drawBottomDetails();
      };
      img.onerror = () => {
        drawBottomDetails();
      };
      img.src = api.resolveImageUrl(report.image_url);
    } else {
      drawBottomDetails();
    }

    function drawBottomDetails() {
      if (!ctx) return;
      // Style Title
      ctx.fillStyle = '#ffffff';
      ctx.font = '500 32px Newsreader, serif';
      ctx.textAlign = 'center';
      ctx.fillText(report.style_title, 300, 665);

      // Subtitle
      ctx.fillStyle = '#a69ea9';
      ctx.font = '400 14px "DM Sans", sans-serif';
      ctx.fillText(report.style_description.slice(0, 55) + '...', 300, 696);

      // Extracted Color Palette Swatches
      if (report.extracted_palette && report.extracted_palette.length > 0) {
        const startX = 300 - (report.extracted_palette.length * 36) / 2;
        report.extracted_palette.forEach((p, idx) => {
          ctx.beginPath();
          ctx.arc(startX + idx * 36 + 18, 745, 14, 0, Math.PI * 2);
          ctx.fillStyle = p.hex;
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.25)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      }

      // Footer
      ctx.fillStyle = '#6e6573';
      ctx.font = '500 12px "DM Sans", sans-serif';
      ctx.fillText('Your Fit. Your Style. Your Score. · fitcheck.ai', 300, 830);
    }
  }, [report]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `fitcheck-${report.style_title.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
      });
    } catch {
      // fallback
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
        maxWidth: '460px',
        width: '100%',
        padding: '24px',
        backgroundColor: 'var(--modal-bg)',
        border: '1px solid var(--line-strong)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--mute)',
            padding: '4px',
          }}
        >
          <X size={20} />
        </button>

        <h3 style={{ marginBottom: '4px', textAlign: 'center', fontSize: '1.35rem' }}>
          Magazine Share Card
        </h3>
        <p className="mute" style={{ fontSize: '0.86rem', marginBottom: '18px', textAlign: 'center' }}>
          High-res vertical 9:16 story format for Instagram, TikTok, or friends.
        </p>

        {/* Canvas Display */}
        <div style={{
          width: '100%',
          maxWidth: '280px',
          aspectRatio: '9/13.5',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.65)',
          border: '1px solid rgba(244, 155, 172, 0.3)',
          marginBottom: '20px',
        }}>
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
          <button onClick={handleDownload} className="btn primary" style={{ flex: 1 }}>
            <Download size={16} />
            Download PNG
          </button>
          <button onClick={handleCopy} className="btn outline" style={{ flex: 1 }}>
            {copied ? <Check size={16} style={{ color: 'var(--ok)' }} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};
