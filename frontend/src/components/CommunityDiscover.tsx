import React, { useState } from 'react';
import { Compass, Flame, Heart, Shield, Sparkles } from 'lucide-react';

interface CommunityDiscoverProps {
  onJoinChallenge: () => void;
}

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
    <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '40px 0 90px' }}>
      {/* Privacy Guarantee Pill */}
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
        <Shield size={16} style={{ color: 'var(--ok)', flexShrink: 0 }} />
        <span>
          <strong>Community Preview:</strong> Outfits shared here are voluntarily opted in by creators. 
          Your personal analyses and wardrobe vault are 100% private and never published without your explicit confirmation.
        </span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="badge" style={{ marginBottom: '10px' }}>
          <Compass size={13} /> Discover & Social
        </span>
        <h2>Community & Daily Challenges</h2>
        <p className="mute">
          Explore trending styling approaches, vote in friendly Fit Battles, and participate in daily prompts.
        </p>
      </div>

      {/* Daily Challenge Card */}
      <div className="card" style={{
        marginBottom: '48px',
        background: 'linear-gradient(135deg, var(--card) 0%, var(--card-subtle) 100%)',
        border: '1px solid var(--line-strong)',
        padding: '32px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ maxWidth: '580px' }}>
            <span className="badge gold" style={{ marginBottom: '12px' }}>
              <Flame size={13} /> Daily Style Challenge
            </span>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
              "Monochrome Minimalism: 3 Tones, 1 Silhouette"
            </h3>
            <p className="mute" style={{ fontSize: '0.95rem', marginBottom: '18px' }}>
              Style an outfit utilizing variations of a single color family (e.g., oatmeal, cream, camel, or slate, charcoal, obsidian). 
              Focus on texture layering over color contrast.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={onJoinChallenge} className="btn primary sm">
                <Sparkles size={14} /> Submit Outfit for Challenge
              </button>
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Challenge Ends In
            </span>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--ink)' }}>
              14h : 22m
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--ok)', fontWeight: 600 }}>
              427 Stylists Participated
            </span>
          </div>
        </div>
      </div>

      {/* Fit Battle Section */}
      <div style={{ marginBottom: '24px' }}>
        <h3>Trending Community Looks</h3>
        <p className="mute" style={{ fontSize: '0.9rem' }}>
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
          },
          {
            id: 'fit2',
            title: 'Boxy Leather & Raw Denim',
            creator: '@elias_k',
            fitScore: 88,
            bg: 'linear-gradient(135deg, #2b1f24 0%, #171114 100%)',
            tags: ['Streetwear', 'Contrast'],
          },
          {
            id: 'fit3',
            title: 'Deconstructed Linen & Derby',
            creator: '@maya_atelier',
            fitScore: 82,
            bg: 'linear-gradient(135deg, #1f2824 0%, #111714 100%)',
            tags: ['Smart Casual', 'Textures'],
          },
        ].map((item) => (
          <div key={item.id} className="card hoverable" style={{ padding: '16px' }}>
            <div style={{
              height: '320px',
              borderRadius: 'var(--radius-sm)',
              background: item.bg,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '16px',
              color: '#fff',
              marginBottom: '14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                  {item.creator}
                </span>
                <span style={{
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderRadius: '999px',
                  padding: '4px 10px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}>
                  AI {item.fitScore}
                </span>
              </div>

              <div>
                <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '4px' }}>{item.title}</h4>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {item.tags.map((t, idx) => (
                    <span key={idx} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
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
                  borderColor: voted[item.id] ? 'var(--ok)' : 'var(--line-strong)',
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
