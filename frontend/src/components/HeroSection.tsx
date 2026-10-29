import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Palette, Compass } from 'lucide-react';

interface HeroSectionProps {
  onStartCheck: () => void;
  onExploreStyles: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartCheck, onExploreStyles }) => {
  return (
    <div>
      {/* Main Hero Header */}
      <section style={{ padding: '64px 0 48px' }}>
        <div style={{ maxWidth: '820px' }}>
          <div className="badge" style={{ marginBottom: '20px' }}>
            <Sparkles size={13} />
            Editorial AI Styling & Analysis
          </div>
          <h1>
            Your Fit.<br />
            <span style={{ fontStyle: 'italic', color: 'var(--acc)' }}>Your Style.</span><br />
            Your Score.
          </h1>
          <p className="lead" style={{ margin: '24px 0 36px' }}>
            Get instant, grounded feedback on your outfits before heading to college, work, a date, or a party. 
            Objective styling guidance on color coordination, proportions, and effortless upgrades.
          </p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button onClick={onStartCheck} className="btn primary" style={{ padding: '12px 32px' }}>
              Analyze My Outfit
              <ArrowRight size={17} />
            </button>
            <button onClick={onExploreStyles} className="btn">
              <Compass size={17} />
              Explore Aesthetic Styles
            </button>
          </div>
        </div>

        {/* Fashion Aesthetic Visual Moodboard */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          margin: '56px 0 40px',
        }}>
          {[
            {
              title: 'Quiet Luxury',
              subtitle: 'Tailored Tonal Wool',
              bg: 'linear-gradient(135deg, #2b2523 0%, #171514 100%)',
              tag: 'Tonal Minimalist',
              color: '#d4c7b8',
            },
            {
              title: 'Modern Streetwear',
              subtitle: 'Relaxed Silhouette & High Contrast',
              bg: 'linear-gradient(135deg, #3f2a31 0%, #22161b 100%)',
              tag: 'Contemporary Cadence',
              color: '#e4a5b2',
            },
            {
              title: 'Smart Casual',
              subtitle: 'Structured Blazer & Loafers',
              bg: 'linear-gradient(135deg, #1f2c25 0%, #131d17 100%)',
              tag: 'Elevated Everyday',
              color: '#a8c7b0',
            },
            {
              title: 'Evening Allure',
              subtitle: 'Bordeaux Velour & Fine Jewelry',
              bg: 'linear-gradient(135deg, #441c25 0%, #250b12 100%)',
              tag: 'Occasion Ready',
              color: '#f0b5c1',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: item.bg,
                borderRadius: 'var(--radius-md)',
                padding: '24px 20px',
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                color: '#fff',
                boxShadow: 'var(--shadow-md)',
                transition: 'transform 0.3s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span className="badge" style={{
                alignSelf: 'flex-start',
                background: 'rgba(255,255,255,0.15)',
                color: item.color,
                border: '1px solid rgba(255,255,255,0.2)',
              }}>
                {item.tag}
              </span>
              <div>
                <h3 style={{ color: '#fff', marginBottom: '4px', fontSize: '1.35rem' }}>{item.title}</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section style={{ padding: '40px 0 60px', borderTop: '1px solid var(--line)' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
          <span className="badge sage" style={{ marginBottom: '12px' }}>Objective Evaluation</span>
          <h2>Four Pillars of Great Styling</h2>
          <p className="mute">
            FitCheck evaluates visible garments—not personal appearance. Scores are subjective stylistic guidance designed to help you elevate what you wear.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
        }}>
          {[
            {
              title: 'Color Coordination',
              desc: 'Harmonious palette relationships, contrast balance, and deliberate accent placement.',
              icon: Palette,
            },
            {
              title: 'Styling & Detailing',
              desc: 'Layering dynamics, texture pairings, jewelry accents, and footwear synergy.',
              icon: Sparkles,
            },
            {
              title: 'Fit & Proportion',
              desc: 'Visible hemline breaks, sleeve drape, and silhouette balance where camera perspective allows.',
              icon: CheckCircle2,
            },
            {
              title: 'Occasion Match',
              desc: 'Contextual appropriateness for office, casual outing, date night, or festive ceremonies.',
              icon: ShieldCheck,
            },
          ].map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div key={i} className="card hoverable">
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'var(--acc2)',
                  color: 'var(--acc)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}>
                  <Icon size={20} />
                </div>
                <h3 style={{ marginBottom: '8px' }}>{pillar.title}</h3>
                <p className="mute" style={{ fontSize: '0.92rem', margin: 0 }}>{pillar.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

