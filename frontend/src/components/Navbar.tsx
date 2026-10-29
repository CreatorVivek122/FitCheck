import React from 'react';
import { Sparkles, Sun, Moon, User, Layers, GitCompare, Compass, PlusCircle } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  savedCount: number;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  isDark,
  onToggleTheme,
  savedCount,
  onOpenProfile,
}) => {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      backgroundColor: 'var(--bg)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--line)',
      transition: 'background-color 0.3s ease',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px',
        gap: '20px',
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('home')} 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <span style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.9rem',
            fontWeight: 500,
            color: 'var(--ink)',
            letterSpacing: '-0.02em',
          }}>
            FitCheck
          </span>
          <span className="badge" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
            AI Stylist
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => onNavigate('home')}
            className="btn sm"
            style={{
              background: currentView === 'home' ? 'var(--acc2)' : 'transparent',
              borderColor: currentView === 'home' ? 'var(--line-strong)' : 'transparent',
              color: currentView === 'home' ? 'var(--ink)' : 'var(--mute)',
            }}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('check')}
            className="btn sm"
            style={{
              background: currentView === 'check' ? 'var(--acc2)' : 'transparent',
              borderColor: currentView === 'check' ? 'var(--line-strong)' : 'transparent',
              color: currentView === 'check' ? 'var(--ink)' : 'var(--mute)',
            }}
          >
            <Sparkles size={14} style={{ color: 'var(--acc)' }} />
            AI FitCheck
          </button>
          <button
            onClick={() => onNavigate('fits')}
            className="btn sm"
            style={{
              background: currentView === 'fits' ? 'var(--acc2)' : 'transparent',
              borderColor: currentView === 'fits' ? 'var(--line-strong)' : 'transparent',
              color: currentView === 'fits' ? 'var(--ink)' : 'var(--mute)',
            }}
          >
            <Layers size={14} />
            My Fits
            {savedCount > 0 && (
              <span style={{
                fontSize: '0.72rem',
                backgroundColor: 'var(--acc)',
                color: '#fff',
                borderRadius: '999px',
                padding: '1px 6px',
                marginLeft: '4px',
              }}>
                {savedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onNavigate('compare')}
            className="btn sm"
            style={{
              background: currentView === 'compare' ? 'var(--acc2)' : 'transparent',
              borderColor: currentView === 'compare' ? 'var(--line-strong)' : 'transparent',
              color: currentView === 'compare' ? 'var(--ink)' : 'var(--mute)',
            }}
          >
            <GitCompare size={14} />
            Compare
          </button>
          <button
            onClick={() => onNavigate('community')}
            className="btn sm"
            style={{
              background: currentView === 'community' ? 'var(--acc2)' : 'transparent',
              borderColor: currentView === 'community' ? 'var(--line-strong)' : 'transparent',
              color: currentView === 'community' ? 'var(--ink)' : 'var(--mute)',
            }}
          >
            <Compass size={14} />
            Discover
          </button>
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onToggleTheme}
            aria-label="Toggle dark mode"
            className="btn sm"
            style={{ padding: '0 10px', minWidth: '38px', borderRadius: '50%' }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={onOpenProfile}
            aria-label="Open profile settings"
            className="btn sm"
            style={{ padding: '0 12px' }}
          >
            <User size={15} />
            <span>Profile</span>
          </button>
          <button
            onClick={() => onNavigate('check')}
            className="btn primary sm"
          >
            <PlusCircle size={15} />
            Check Fit
          </button>
        </div>
      </div>
    </header>
  );
};
