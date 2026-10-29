import React, { useState } from 'react';
import { Sparkles, Sun, Moon, User, Layers, GitCompare, Compass, Plus, Menu, X } from 'lucide-react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Overview' },
    { id: 'check', label: 'AI FitCheck', icon: <Sparkles size={14} style={{ color: 'var(--acc)' }} /> },
    { id: 'fits', label: 'My Looks', badge: savedCount > 0 ? savedCount : null },
    { id: 'compare', label: 'Compare', icon: <GitCompare size={14} /> },
    { id: 'community', label: 'Discover', icon: <Compass size={14} /> },
  ];

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'var(--header-bg)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--line)',
      transition: 'background-color 0.25s ease, border-color 0.25s ease',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '74px',
        gap: '16px',
      }}>
        {/* Brand Logo with AI Stylist Pill */}
        <div 
          onClick={() => handleNavClick('home')} 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <span style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.95rem',
            fontWeight: 500,
            color: 'var(--ink)',
            letterSpacing: '-0.03em',
          }}>
            FitCheck<span style={{ color: 'var(--acc)' }}>.</span>
          </span>
          <span className="badge" style={{
            fontSize: '0.66rem',
            padding: '2px 9px',
            background: 'var(--acc2)',
            color: 'var(--acc)',
            border: '1px solid var(--line-strong)',
            fontWeight: 700,
            letterSpacing: '0.06em',
          }}>
            AI STYLIST
          </span>
        </div>

        {/* Desktop Segmented Nav Pill Container */}
        <nav className="hide-on-mobile" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 6px',
          background: 'var(--header-nav-bg)',
          border: '1px solid var(--header-nav-border)',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.2s ease',
        }}>
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: isActive ? 'var(--nav-active-bg)' : 'transparent',
                  border: isActive ? '1px solid var(--nav-active-border)' : '1px solid transparent',
                  color: isActive ? 'var(--nav-active-text)' : 'var(--nav-inactive-text)',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 16px',
                  fontSize: '0.86rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--nav-hover-text)';
                    e.currentTarget.style.background = 'var(--nav-hover-bg)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--nav-inactive-text)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== null && (
                  <span style={{
                    fontSize: '0.7rem',
                    backgroundColor: 'var(--acc)',
                    color: 'var(--btn-primary-text)',
                    fontWeight: 700,
                    borderRadius: '999px',
                    padding: '0 6px',
                    minWidth: '18px',
                    height: '18px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Desktop Actions */}
        <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle dark/light mode"
            className="btn sm"
            style={{
              padding: '0 10px',
              minWidth: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'var(--card)',
              borderColor: 'var(--line)',
              color: 'var(--ink)',
            }}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={16} style={{ color: 'var(--acc)' }} /> : <Moon size={16} style={{ color: 'var(--acc)' }} />}
          </button>

          {/* Profile Button */}
          <button
            onClick={onOpenProfile}
            aria-label="Open profile settings"
            className="btn sm"
            style={{
              padding: '0 14px',
              height: '38px',
              background: 'var(--card)',
              borderColor: 'var(--line)',
              color: 'var(--ink)',
            }}
          >
            <User size={15} style={{ color: 'var(--mute)' }} />
            <span>Profile</span>
          </button>

          {/* Primary Action Button */}
          <button
            onClick={() => handleNavClick('check')}
            className="btn primary sm"
            style={{
              padding: '0 18px',
              height: '40px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Check Fit</span>
          </button>
        </div>

        {/* Mobile Navigation Toggle Button */}
        <div style={{ display: 'none' }} className="mobile-toggle-wrapper">
          <style>{`
            @media (max-width: 900px) {
              .mobile-toggle-wrapper {
                display: flex !important;
                align-items: center;
                gap: 8px;
              }
            }
          `}</style>
          
          <button
            onClick={() => handleNavClick('check')}
            className="btn primary sm"
            style={{ padding: '0 14px', height: '36px', fontSize: '0.82rem' }}
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Fit</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Open navigation menu"
            className="btn sm"
            style={{
              padding: '0',
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--card-subtle)',
              border: '1px solid var(--line)',
              color: 'var(--ink)',
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Drawer Sheet */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--header-bg)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--line)',
          padding: '16px 20px 24px',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: isActive ? 'var(--acc2)' : 'transparent',
                    border: `1px solid ${isActive ? 'var(--line-strong)' : 'transparent'}`,
                    color: isActive ? 'var(--acc)' : 'var(--ink)',
                    fontSize: '1rem',
                    fontWeight: isActive ? 600 : 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {item.icon || <Layers size={16} />}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span style={{
                      fontSize: '0.75rem',
                      backgroundColor: 'var(--acc)',
                      color: 'var(--btn-primary-text)',
                      fontWeight: 700,
                      borderRadius: '999px',
                      padding: '2px 8px',
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div style={{
              height: '1px',
              backgroundColor: 'var(--line)',
              margin: '12px 0',
            }} />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  onToggleTheme();
                  setMobileMenuOpen(false);
                }}
                className="btn outline sm"
                style={{ flex: 1, height: '42px', gap: '8px' }}
              >
                {isDark ? <Sun size={16} style={{ color: 'var(--acc)' }} /> : <Moon size={16} style={{ color: 'var(--acc)' }} />}
                <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              <button
                onClick={() => {
                  onOpenProfile();
                  setMobileMenuOpen(false);
                }}
                className="btn outline sm"
                style={{ flex: 1, height: '42px', gap: '8px' }}
              >
                <User size={16} />
                <span>My Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
