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

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 900);
    bgGrad.addColorStop(0, '#fbf9f5');
    bgGrad.addColorStop(1, '#efe6dd');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 600, 900);

    // Border line
    ctx.strokeStyle = '#e2d7c9';
    ctx.lineWidth = 12;
    ctx.strokeRect(16, 16, 568, 868);

    // Header Branding
    ctx.fillStyle = '#6d1f2f';
    ctx.font = 'italic 500 32px Newsreader, serif';
    ctx.textAlign = 'center';
    ctx.fillText('FitCheck', 300, 72);

    ctx.fillStyle = '#736b63';
    ctx.font = '500 12px "DM Sans", sans-serif';
    ctx.fillText('EDITORIAL AI STYLE REPORT', 300, 94);

    // Load and draw photo
    if (report.image_url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Draw image frame
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(50, 120, 500, 500, [16]);
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

        ctx.drawImage(img, sX, sY, sW, sH, 50, 120, 500, 500);
        ctx.restore();

        // Draw FitScore Badge over corner of image
        ctx.fillStyle = '#6d1f2f';
        ctx.beginPath();
        ctx.roundRect(410, 140, 120, 56, [28]);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px "DM Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${report.overall_score || 0}`, 456, 176);

        ctx.font = '500 12px "DM Sans", sans-serif';
        ctx.fillText('/100', 496, 176);

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
      ctx.fillStyle = '#1f1d1b';
      ctx.font = '400 36px Newsreader, serif';
      ctx.textAlign = 'center';
      ctx.fillText(report.style_title, 300, 670);

      // Subtitle
      ctx.fillStyle = '#736b63';
      ctx.font = '400 15px "DM Sans", sans-serif';
      ctx.fillText(report.style_description.slice(0, 55) + '...', 300, 702);

      // Extracted Color Palette Swatches
      if (report.extracted_palette && report.extracted_palette.length > 0) {
        const startX = 300 - (report.extracted_palette.length * 36) / 2;
        report.extracted_palette.forEach((p, idx) => {
          ctx.beginPath();
          ctx.arc(startX + idx * 36 + 18, 750, 14, 0, Math.PI * 2);
          ctx.fillStyle = p.hex;
          ctx.fill();
          ctx.strokeStyle = 'rgba(0,0,0,0.15)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      }

      // Footer
      ctx.fillStyle = '#a69e96';
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
      backgroundColor: 'rgba(22, 20, 19, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 60,
      padding: '20px',
    }}>
      <div className="card" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '24px',
        backgroundColor: 'var(--card)',
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
          }}
        >
          <X size={20} />
        </button>

        <h3 style={{ marginBottom: '4px', textAlign: 'center' }}>Share Your FitCheck</h3>
        <p className="mute" style={{ fontSize: '0.88rem', marginBottom: '16px', textAlign: 'center' }}>
          Formatted for Instagram Stories, TikTok, or group chats.
        </p>

        {/* Canvas Display */}
        <div style={{
          width: '100%',
          maxWidth: '300px',
          aspectRatio: '9/13.5',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '20px',
        }}>
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'center' }}>
          <button onClick={handleDownload} className="btn primary" style={{ flex: 1 }}>
            <Download size={16} />
            Download Image
          </button>
          <button onClick={handleCopy} className="btn" style={{ flex: 1 }}>
            {copied ? <Check size={16} style={{ color: 'var(--ok)' }} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  );
};
