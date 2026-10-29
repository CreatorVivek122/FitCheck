import React, { useState } from 'react';
import { Camera, Compass, Sparkles, Zap, Heart, ArrowRight, ChevronRight } from 'lucide-react';

interface HeroSectionProps {
  onStartCheck: (occasion?: string) => void;
  onExploreStyles: () => void;
}

const OCCASION_TAGS = [
  'College',
  'Date night',
  'Party',
  'Diwali fit',
  'Office',
  'Streetwear',
];

const TRENDING_FITS = [
  {
    id: 'trend-1',
    title: 'Minimalist Relaxed Streetwear',
    occasion: 'College',
    score: 94,
    style: 'Modern Streetwear',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80',
    tags: ['Oversized Denim', 'White Tee', 'Layered Chain'],
    colors: ['#2B2E3A', '#EFEFEF', '#B38B6D'],
  },
  {
    id: 'trend-2',
    title: 'Contemporary Smart Casual',
    occasion: 'Office',
    score: 92,
    style: 'Quiet Luxury',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=700&q=80',
    tags: ['Tailored Blazer', 'Cream Trousers', 'Loafers'],
    colors: ['#1C1D21', '#E8DEC8', '#8C7261'],
  },
  {
    id: 'trend-3',
    title: 'Evening Velvet & Subtle Contrast',
    occasion: 'Date Night',
    score: 89,
    style: 'Evening Allure',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=700&q=80',
    tags: ['Silk Slip', 'Leather Coat', 'Pointed Heels'],
    colors: ['#6D1F2F', '#0D0D0E', '#C2A383'],
  },
  {
    id: 'trend-4',
    title: 'High-Cadence Utility Gorpcore',
    occasion: 'Everyday',
    score: 88,
    style: 'Gorpcore',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=700&q=80',
    tags: ['Cargo Shell', 'Tech Fleece', 'Trail Runners'],
    colors: ['#3A443B', '#1E201E', '#D1C2A5'],
  },
  {
    id: 'trend-5',
    title: 'Festive Fusion Brocade Drape',
    occasion: 'Party',
    score: 95,
    style: 'Desi Fusion',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=700&q=80',
    tags: ['Embroidered Kurta', 'Straight Pant', 'Jutti'],
    colors: ['#99253B', '#E5B974', '#F4EDE4'],
  },
];

const MARQUEE_ITEMS = [
  'OLD MONEY',
  'STREETWEAR',
  'CLEAN GIRL',
  'COQUETTE',
  'GORPCORE',
  'INDIE SLEAZE',
  'DESI FUSION',
  'Y2K',
  'QUIET LUXURY',
  'MINIMALIST',
];

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartCheck, onExploreStyles }) => {
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filteredTrending = selectedFilter === 'All'
    ? TRENDING_FITS
    : TRENDING_FITS.filter((f) => f.occasion.toLowerCase() === selectedFilter.toLowerCase());

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Soft Ambient Rose Halo Glow (Inspired by Image 1 & 2) */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        right: '-10%',
        width: '650px',
        height: '650px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(244, 155, 172, 0.16) 0%, rgba(109, 31, 47, 0.08) 45%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Main Hero Section */}
      <section style={{
        position: 'relative',
        zIndex: 1,
        padding: '52px 0 36px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)',
          gap: '40px',
          alignItems: 'center',
        }} className="hero-grid">
          <style>{`
            @media (max-width: 980px) {
              .hero-grid {
                grid-template-columns: 1fr !important;
                gap: 48px !important;
              }
              .hero-visual-col {
                order: 2;
                max-width: 480px;
                margin: 0 auto;
                width: 100%;
              }
              .hero-text-col {
                order: 1;
                text-align: left;
              }
            }
          `}</style>

          {/* Left Hero Column: Typography & CTAs */}
          <div className="hero-text-col">
            {/* Pill Badge (from Image 1 & 2) */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '22px' }}>
              <div className="badge" style={{
                background: 'rgba(244, 155, 172, 0.14)',
                color: 'var(--acc)',
                border: '1px solid rgba(244, 155, 172, 0.35)',
                padding: '5px 14px',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
              }}>
                <Sparkles size={13} />
                AI POWERED FASHION ANALYSIS
              </div>
              <div className="badge green hide-on-mobile" style={{
                fontSize: '0.74rem',
                fontWeight: 700,
              }}>
                10K+ FITS CHECKED THIS WEEK
              </div>
            </div>

            {/* Headline */}
            <h1 style={{
              marginBottom: '22px',
              letterSpacing: '-0.03em',
            }}>
              Your Fit.<br />
              <span style={{
                fontStyle: 'italic',
                color: 'var(--acc)',
                textShadow: '0 0 30px rgba(244, 155, 172, 0.35)',
              }}>
                Your Style.
              </span><br />
              Your Score.
            </h1>

            {/* Subtitle / Lead Paragraph */}
            <p className="lead" style={{
              marginBottom: '26px',
              fontSize: '1.08rem',
              color: 'var(--mute)',
            }}>
              Get instant, AI-powered feedback on your outfits before heading to college, work, a date, or a party. 
              Discover your style, improve your fits, and dress with confidence.
            </p>

            {/* Quick Occasion Pills (from Image 1 & 2) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '32px',
            }}>
              <span style={{
                fontSize: '0.8rem',
                color: 'var(--mute)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 600,
                marginRight: '4px',
              }}>
                Quick Vibe:
              </span>
              {OCCASION_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onStartCheck(tag)}
                  className="pill-btn"
                  style={{ fontSize: '0.84rem', padding: '5px 14px' }}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* CTAs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
              marginBottom: '38px',
            }}>
              <button
                onClick={() => onStartCheck()}
                className="btn primary lg"
                style={{
                  padding: '12px 30px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '1rem',
                  gap: '10px',
                }}
              >
                <Camera size={18} strokeWidth={2.2} />
                <span>Check My Fit</span>
                <ArrowRight size={17} />
              </button>

              <button
                onClick={onExploreStyles}
                className="btn outline lg"
                style={{
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.98rem',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                }}
              >
                <Compass size={17} />
                <span>Explore Aesthetic Styles</span>
              </button>
            </div>

            {/* Value Proposition Highlights (from Image 2) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '24px',
              paddingTop: '16px',
              borderTop: '1px solid var(--line)',
              fontSize: '0.88rem',
              color: 'var(--ink-secondary)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={15} style={{ color: 'var(--acc)' }} />
                <span>AI Style Score</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={15} style={{ color: 'var(--gold)' }} />
                <span>Detailed Feedback</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Heart size={15} style={{ color: 'var(--ok)' }} />
                <span>Personalized Upgrades</span>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Tilted Polaroid Cards & Doodles (matching Image 1 & Image 2) */}
          <div className="hero-visual-col" style={{ position: 'relative', minHeight: '460px' }}>
            {/* Playful Doodles (inspired by Image 2 annotations) */}
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '-20px',
              zIndex: 10,
              pointerEvents: 'none',
            }}>
              <span className="doodle-text" style={{ fontSize: '1.25rem' }}>
                Good Vibes 👑
              </span>
            </div>

            <div style={{
              position: 'absolute',
              top: '20px',
              right: '-15px',
              zIndex: 10,
              pointerEvents: 'none',
              textAlign: 'right',
            }}>
              <span className="doodle-text" style={{ fontSize: '1.15rem' }}>
                Better Fits,<br />Bigger Confidence ❤️
              </span>
            </div>

            <div style={{
              position: 'absolute',
              bottom: '30px',
              right: '-10px',
              zIndex: 10,
              pointerEvents: 'none',
            }}>
              <span className="doodle-text" style={{ fontSize: '1.2rem' }}>
                Style Up 💫
              </span>
            </div>

            {/* Polaroid Stack Showcase */}
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '380px',
              margin: '0 auto',
              paddingTop: '20px',
            }}>
              {/* Back Card: Pastel/Lavender Tilt (from Image 1) */}
              <div
                style={{
                  position: 'absolute',
                  top: '20px',
                  left: '0px',
                  width: '240px',
                  height: '340px',
                  background: 'linear-gradient(145deg, #a78bfa 0%, #7c3aed 100%)',
                  borderRadius: '16px',
                  transform: 'rotate(-10deg)',
                  boxShadow: '0 12px 35px rgba(0, 0, 0, 0.45)',
                  border: '3px solid rgba(255, 255, 255, 0.85)',
                  padding: '10px',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                }}
              >
                <div style={{
                  background: '#ffffff',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#1a1820',
                  textAlign: 'center',
                }}>
                  Dark Academia
                </div>
              </div>

              {/* Main Center Card: Streetwear Polaroid (from Image 2) */}
              <div
                className="polaroid-card"
                style={{
                  position: 'relative',
                  width: '275px',
                  margin: '0 auto',
                  transform: 'rotate(4deg)',
                  zIndex: 4,
                  cursor: 'pointer',
                  border: '2px solid rgba(244, 155, 172, 0.4)',
                }}
                onClick={() => onStartCheck('Modern Streetwear')}
              >
                {/* Score Badge on Card (from Image 1 & 2) */}
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '-12px',
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #a3e635 0%, #65a30d 100%)',
                  color: '#0d1303',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  boxShadow: '0 4px 18px rgba(163, 230, 53, 0.45)',
                  border: '3px solid #ffffff',
                  zIndex: 10,
                }}>
                  92
                </div>

                <div style={{
                  width: '100%',
                  height: '320px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  position: 'relative',
                  background: '#1a1820',
                }}>
                  <img
                    src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=700&q=80"
                    alt="Streetwear Look"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  {/* Floating AI FitScore pill on card (from Image 2) */}
                  <div style={{
                    position: 'absolute',
                    top: '14px',
                    left: '12px',
                    background: 'rgba(18, 14, 22, 0.82)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(244, 155, 172, 0.4)',
                    borderRadius: 'var(--radius-full)',
                    padding: '4px 12px',
                    fontSize: '0.72rem',
                    color: '#ffffff',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <span style={{ color: 'var(--acc)' }}>AI FIT SCORE</span>
                    <span style={{ color: 'var(--ok)', fontWeight: 700 }}>💎 92/100</span>
                  </div>
                </div>

                {/* Bottom Polaroid Tag & Extracted Palette (from Image 2) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '10px',
                  padding: '0 4px',
                }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#666', textTransform: 'uppercase' }}>
                      Style
                    </span>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111' }}>
                      Streetwear Oversized
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {['#1C1D21', '#4F5D75', '#D8D4D5', '#E892A2'].map((c, i) => (
                      <span
                        key={i}
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: c,
                          border: '1px solid rgba(0,0,0,0.1)',
                          display: 'inline-block',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Fit Score Breakdown Box (from Image 1) */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-25px',
                  right: '-15px',
                  width: '240px',
                  background: 'var(--card-solid)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid var(--line-strong)',
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 8,
                }}
              >
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: 'var(--mute)',
                  marginBottom: '10px',
                  textTransform: 'uppercase',
                }}>
                  Fit Score Breakdown
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '3px' }}>
                      <span style={{ color: 'var(--ink)' }}>Color match</span>
                      <span style={{ color: 'var(--ok)', fontWeight: 700 }}>9/10</span>
                    </div>
                    <div style={{ height: '5px', backgroundColor: 'var(--line)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '90%', height: '100%', backgroundColor: 'var(--ok)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '3px' }}>
                      <span style={{ color: 'var(--ink)' }}>Proportions</span>
                      <span style={{ color: 'var(--acc)', fontWeight: 700 }}>8/10</span>
                    </div>
                    <div style={{ height: '5px', backgroundColor: 'var(--line)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '80%', height: '100%', backgroundColor: 'var(--acc)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '3px' }}>
                      <span style={{ color: 'var(--ink)' }}>Occasion fit</span>
                      <span style={{ color: 'var(--purple)', fontWeight: 700 }}>9/10</span>
                    </div>
                    <div style={{ height: '5px', backgroundColor: 'var(--line)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '90%', height: '100%', backgroundColor: 'var(--purple)' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Ribbon Banner (Directly from Image 1) */}
      <div style={{
        margin: '40px -24px 48px',
        position: 'relative',
        zIndex: 2,
      }}>
        <div className="marquee-ribbon">
          <div className="marquee-content">
            {MARQUEE_ITEMS.concat(MARQUEE_ITEMS).map((item, index) => (
              <span key={index} style={{ display: 'inline-flex', alignItems: 'center', gap: '36px' }}>
                <span>{item}</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Trending Fits This Week Section (Directly from Image 2) */}
      <section style={{ padding: '24px 0 60px', position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
        }}>
          <div>
            <h2 style={{ fontSize: '1.85rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Trending Fits This Week
              <ArrowRight size={20} style={{ color: 'var(--acc)' }} />
            </h2>
            <p className="mute" style={{ fontSize: '0.92rem' }}>
              Explore how stylists score top aesthetics and dial in color harmonies.
            </p>
          </div>

          {/* Occasion Filter Tabs (from Image 2) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
            maxWidth: '100%',
          }}>
            {['All', 'College', 'Office', 'Date Night', 'Party', 'Everyday'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`pill-btn ${selectedFilter === filter ? 'active' : ''}`}
                style={{ fontSize: '0.84rem' }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Trending Fits Card Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
          gap: '20px',
        }}>
          {filteredTrending.map((fit) => (
            <div
              key={fit.id}
              className="card hoverable"
              style={{
                padding: '0',
                overflow: 'hidden',
                background: 'var(--card-subtle)',
                border: '1px solid var(--line)',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
              }}
              onClick={() => onStartCheck(fit.occasion)}
            >
              {/* Photo with Overlay Badge */}
              <div style={{ position: 'relative', width: '100%', height: '280px', overflow: 'hidden' }}>
                <img
                  src={fit.image}
                  alt={fit.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                
                {/* Score Pill Badge (from Image 2) */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(18, 14, 22, 0.85)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(244, 155, 172, 0.35)',
                  borderRadius: 'var(--radius-full)',
                  padding: '3px 10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--ok)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <span>✦</span>
                  <span>{fit.score}/100</span>
                </div>

                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '10px',
                  background: 'rgba(18, 14, 22, 0.75)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2px 8px',
                  fontSize: '0.72rem',
                  color: '#ffffff',
                }}>
                  {fit.occasion}
                </div>
              </div>

              {/* Card Meta Content */}
              <div style={{ padding: '16px 16px 18px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', marginBottom: '4px', fontWeight: 500 }}>
                    {fit.title}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--mute)' }}>
                    Style: {fit.style}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--line)',
                }}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {fit.colors.map((c, i) => (
                      <span
                        key={i}
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: c,
                          display: 'inline-block',
                          border: '1px solid rgba(255,255,255,0.2)',
                        }}
                      />
                    ))}
                  </div>

                  <span style={{
                    fontSize: '0.82rem',
                    color: 'var(--acc)',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}>
                    Check Fit <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
