import React, { useState } from 'react';
import { Compass, Flame, Heart, Shield, Sparkles, ArrowRight } from 'lucide-react';

interface CommunityDiscoverProps {
  onJoinChallenge: (styleOrOccasion?: string) => void;
}

const AESTHETIC_GUIDES = [
  {
    name: 'Old Money / Quiet Luxury',
    description: 'Understated tailoring, fine cashmere, neutral palletes (cream, navy, camel), and logo-free silhouettes.',
    tag: 'Classic Elegance',
    color: '#D4C7B8',
  },
  {
    name: 'Modern Streetwear',
    description: 'Oversized boxy cuts, cargo trousers, statement sneakers, and intentional high-contrast layering.',
    tag: 'Contemporary Cadence',
    color: '#F49BAC',
  },
  {
    name: 'Clean Girl',
    description: 'Sleek effortless basics, monochromatic athleisure, neutral blazers, and dewy minimalist detailing.',
    tag: 'Effortless Chic',
    color: '#86EFAC',
  },
  {
    name: 'Gorpcore & Technical',
    description: 'Weatherproof shells, ripstop utility cargos, hiking silhouettes, and muted earth tones with vibrant pops.',
    tag: 'Functional Utility',
    color: '#FBBF24',
  },
  {
    name: 'Coquette & Romantic',
    description: 'Soft pastels, delicate lace, pearl accessories, ribbons, and romantic silhouette proportions.',
    tag: 'Playful Romance',
    color: '#C084FC',
  },
  {
    name: 'Desi Fusion',
    description: 'Traditional kurtas paired with relaxed trousers, juttis, and subtle metallic or brocade accents.',
    tag: 'Heritage Modern',
    color: '#F87171',
  },
];

export const CommunityDiscover: React.FC<CommunityDiscoverProps> = ({ onJoinChallenge }) => {
  const [votes, setVotes] = useState<{ [key: string]: number }>({
    fit1: 142,
    fit2: 189,
    fit3: 215,
  });
  const [voted, setVoted] = useState<{ [key: string]: boolean }>({});

  const handleVote = (id: string) => {
    if (voted[id]) return;
    setVotes((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setVoted((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '36px 0 90px' }}>
      {/* Privacy Guarantee Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'var(--card-subtle)',
        border: '1px solid var(--line)',
        marginBottom: '32px',
        fontSize: '0.86rem',
        color: 'var(--mute)',
      }}>
        <Shield size={17} style={{ color: 'var(--ok)', flexShrink: 0 }} />
        <span>
          <strong>Community Preview:</strong> Looks shared here are voluntarily published. 
          Your personal analyses and wardrobe vault are 100% private by default and never shared without confirmation.
        </span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="badge" style={{ marginBottom: '10px' }}>
          <Compass size={13} /> Discover & Social
        </span>
        <h2 style={{ fontSize: '2.4rem' }}>Community Looks & Style Guide</h2>
        <p className="lead" style={{ margin: '0 auto', fontSize: '1rem' }}>
          Explore trending styling approaches, vote in friendly Fit Battles, and participate in daily prompts.
        </p>
      </div>

      {/* Daily Challenge Card */}
      <div className="card" style={{
        marginBottom: '48px',
        background: 'linear-gradient(135deg, var(--card) 0%, var(--card-subtle) 100%)',
        border: '1px solid var(--line-strong)',
        padding: '32px',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ maxWidth: '600px' }}>
            <span className="badge gold" style={{ marginBottom: '12px' }}>
              <Flame size={13} /> Daily Style Challenge
            </span>
            <h3 style={{ fontSize: '1.85rem', marginBottom: '10px' }}>
              "Monochrome Minimalism: 3 Tones, 1 Silhouette"
            </h3>
            <p className="mute" style={{ fontSize: '0.95rem', marginBottom: '20px', lineHeight: 1.6 }}>
              Style an outfit utilizing variations of a single color family (e.g., oatmeal, cream, camel, or slate, charcoal, obsidian). 
              Focus on texture layering over color contrast.
            </p>
            <button onClick={() => onJoinChallenge('Minimalist & Tonal')} className="btn primary sm">
              <Sparkles size={14} /> Submit Outfit for Challenge
            </button>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Challenge Ends In
            </span>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--ink)' }}>
              14h : 22m
            </div>
            <span style={{ fontSize: '0.84rem', color: 'var(--ok)', fontWeight: 600 }}>
              427 Stylists Participated
            </span>
          </div>
        </div>
      </div>

      {/* Aesthetic Style Dictionary Cards */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Aesthetic Style Playbook</h3>
        <p className="mute" style={{ fontSize: '0.92rem', marginBottom: '24px' }}>
          Curated breakdown of viral and editorial fashion aesthetics to inspire your next fit check.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
        }}>
          {AESTHETIC_GUIDES.map((guide, idx) => (
            <div
              key={idx}
              className="card hoverable"
              style={{
                background: 'var(--card-subtle)',
                border: '1px solid var(--line)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span className="badge" style={{
                  marginBottom: '12px',
                  color: guide.color,
                  borderColor: 'var(--line-strong)',
                  backgroundColor: 'var(--card-subtle)',
                }}>
                  {guide.tag}
                </span>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{guide.name}</h4>
                <p className="mute" style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
                  {guide.description}
                </p>
              </div>

              <button
                onClick={() => onJoinChallenge(guide.name)}
                className="btn sm outline"
                style={{ marginTop: '18px', width: '100%', justifyContent: 'space-between' }}
              >
                <span>Check This Aesthetic</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Community Looks Section */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Trending Community Outfits</h3>
        <p className="mute" style={{ fontSize: '0.92rem' }}>
          Community votes are separate from AI FitScores, reflecting creative personal taste.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
      }}>
        {[
          {
            id: 'fit1',
            title: 'Tonal Cashmere & Wide Trousers',
            creator: '@sora_style',
            fitScore: 84,
            bg: 'linear-gradient(135deg, #3d3532 0%, #1e1b19 100%)',
            tags: ['Quiet Luxury', 'Monochrome'],
            img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80',
          },
          {
            id: 'fit2',
            title: 'Boxy Leather & Raw Denim',
            creator: '@elias_k',
            fitScore: 88,
            bg: 'linear-gradient(135deg, #2b1f24 0%, #171114 100%)',
            tags: ['Streetwear', 'Contrast'],
            img: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=700&q=80',
          },
          {
            id: 'fit3',
            title: 'Deconstructed Linen & Derby',
            creator: '@maya_atelier',
            fitScore: 82,
            bg: 'linear-gradient(135deg, #1f2824 0%, #111714 100%)',
            tags: ['Smart Casual', 'Textures'],
            img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=700&q=80',
          },
        ].map((item) => (
          <div key={item.id} className="card hoverable" style={{
            padding: '16px',
            background: 'var(--card-subtle)',
            border: '1px solid var(--line)',
          }}>
            <div style={{
              height: '320px',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              position: 'relative',
              marginBottom: '14px',
            }}>
              <img
                src={item.img}
                alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: 'rgba(18, 14, 22, 0.82)',
                backdropFilter: 'blur(8px)',
                borderRadius: 'var(--radius-full)',
                padding: '3px 10px',
                fontSize: '0.78rem',
                color: '#fff',
                fontWeight: 600,
              }}>
                {item.creator}
              </div>

              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(18, 14, 22, 0.82)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(244, 155, 172, 0.35)',
                color: 'var(--ok)',
                borderRadius: 'var(--radius-full)',
                padding: '3px 10px',
                fontSize: '0.78rem',
                fontWeight: 700,
              }}>
                ✦ {item.fitScore}/100
              </div>

              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                right: '12px',
                background: 'rgba(18, 14, 22, 0.85)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
              }}>
                <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '2px' }}>{item.title}</h4>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {item.tags.map((t, idx) => (
                    <span key={idx} style={{ fontSize: '0.72rem', color: 'var(--acc)' }}>
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Voting bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--mute)' }}>
                {votes[item.id]} community votes
              </span>
              <button
                onClick={() => handleVote(item.id)}
                className="btn sm"
                style={{
                  backgroundColor: voted[item.id] ? 'var(--ok-bg)' : 'transparent',
                  color: voted[item.id] ? 'var(--ok)' : 'var(--ink)',
                  borderColor: voted[item.id] ? 'var(--ok-border)' : 'var(--line)',
                }}
              >
                <Heart size={14} fill={voted[item.id] ? 'currentColor' : 'none'} />
                {voted[item.id] ? 'Voted' : 'Vote'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
