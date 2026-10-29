import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { StudioSection } from './components/StudioSection';
import { ReportDashboard } from './components/ReportDashboard';
import { MyFitsVault } from './components/MyFitsVault';
import { CompareStudio } from './components/CompareStudio';
import { CommunityDiscover } from './components/CommunityDiscover';
import { ShareCardModal } from './components/ShareCardModal';
import { ProfileModal } from './components/ProfileModal';
import type { FitReport } from './types';
import { api } from './services/api';
import { Sparkles, Home, Layers, GitCompare, Compass } from 'lucide-react';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('home');
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('fitcheck-theme');
    if (saved) return saved === 'dark';
    return true; // Default to luxury dark aesthetic shown in inspiration screenshots
  });

  const [activeReport, setActiveReport] = useState<FitReport | null>(null);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [compareIds, setCompareIds] = useState<{ idA?: string; idB?: string }>({});
  const [selectedOccasion, setSelectedOccasion] = useState<string>('Everyday / Casual');

  const [shareModalReport, setShareModalReport] = useState<FitReport | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('fitcheck-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('fitcheck-theme', 'light');
    }
  }, [isDark]);

  const refreshSavedCount = async () => {
    try {
      const res = await api.listReports({ limit: 1 });
      setSavedCount(res.total);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshSavedCount();
  }, [activeReport, currentView]);

  const handleAnalysisComplete = (report: FitReport) => {
    setActiveReport(report);
    setCurrentView('result');
    refreshSavedCount();
  };

  const handleOpenCompare = (reportAId: string, reportBId?: string) => {
    setCompareIds({ idA: reportAId, idB: reportBId });
    setCurrentView('compare');
  };

  const handleStartCheckWithOccasion = (occ?: string) => {
    if (occ) {
      const OCCASION_MAP: { [k: string]: string } = {
        'college': 'College & Campus',
        'date night': 'Date Night & Cocktails',
        'party': 'Party & Evening Event',
        'diwali fit': 'Wedding & Festive Traditional',
        'office': 'Office & Smart Casual',
        'streetwear': 'Modern Streetwear',
      };
      const normalized = OCCASION_MAP[occ.toLowerCase()] || occ;
      setSelectedOccasion(normalized);
    }
    setCurrentView('check');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        savedCount={savedCount}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <main className="container" style={{ flex: 1, paddingBottom: '90px' }}>
        {currentView === 'home' && (
          <HeroSection
            onStartCheck={handleStartCheckWithOccasion}
            onExploreStyles={() => {
              setCurrentView('community');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'check' && (
          <StudioSection
            defaultOccasion={selectedOccasion}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}

        {currentView === 'result' && activeReport && (
          <ReportDashboard
            report={activeReport}
            onAnalyzeAnother={() => {
              setCurrentView('check');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenCompare={(id) => handleOpenCompare(id)}
            onOpenShareModal={(rep) => setShareModalReport(rep)}
          />
        )}

        {currentView === 'fits' && (
          <MyFitsVault
            onSelectReport={(rep) => {
              setActiveReport(rep);
              setCurrentView('result');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onCompareSelected={(idA, idB) => handleOpenCompare(idA, idB)}
            onGoToStudio={() => {
              setCurrentView('check');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'compare' && (
          <CompareStudio
            initialReportAId={compareIds.idA}
            initialReportBId={compareIds.idB}
            onBackToFits={() => {
              setCurrentView('fits');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'community' && (
          <CommunityDiscover
            onJoinChallenge={(styleOrOccasion) => handleStartCheckWithOccasion(styleOrOccasion)}
          />
        )}
      </main>

      {/* Mobile Floating Bottom Navigation Bar (thumb-friendly for smartphones) */}
      <nav className="mobile-bottom-bar" style={{
        position: 'fixed',
        bottom: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 24px)',
        maxWidth: '420px',
        height: '62px',
        backgroundColor: 'var(--bottom-bar-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--bottom-bar-border)',
        borderRadius: 'var(--radius-full)',
        boxShadow: 'var(--shadow-md)',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 8px',
        zIndex: 45,
      }}>
        <style>{`
          @media (max-width: 900px) {
            .mobile-bottom-bar {
              display: flex !important;
            }
          }
        `}</style>

        {[
          { id: 'home', label: 'Overview', icon: <Home size={18} /> },
          { id: 'check', label: 'Check Fit', icon: <Sparkles size={18} style={{ color: 'var(--acc)' }} />, isPrimary: true },
          { id: 'fits', label: 'My Looks', icon: <Layers size={18} />, badge: savedCount > 0 ? savedCount : null },
          { id: 'compare', label: 'Compare', icon: <GitCompare size={18} /> },
          { id: 'community', label: 'Discover', icon: <Compass size={18} /> },
        ].map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                background: item.isPrimary ? 'var(--acc)' : 'transparent',
                border: 'none',
                color: item.isPrimary ? 'var(--btn-primary-text)' : (isActive ? 'var(--acc)' : 'var(--nav-inactive-text)'),
                borderRadius: item.isPrimary ? '50%' : 'var(--radius-sm)',
                width: item.isPrimary ? '46px' : 'auto',
                height: item.isPrimary ? '46px' : 'auto',
                minWidth: item.isPrimary ? '46px' : '52px',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: item.isPrimary ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {item.icon}
              {!item.isPrimary && (
                <span style={{ fontSize: '0.65rem', fontWeight: isActive ? 700 : 500 }}>
                  {item.label}
                </span>
              )}
              {item.badge !== null && !item.isPrimary && (
                <span style={{
                  position: 'absolute',
                  top: '0px',
                  right: '10px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--acc)',
                  color: 'var(--btn-primary-text)',
                  fontSize: '0.58rem',
                  fontWeight: 800,
                  display: 'flex',
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

      {/* Share Card Modal */}
      {shareModalReport && (
        <ShareCardModal
          report={shareModalReport}
          onClose={() => setShareModalReport(null)}
        />
      )}

      {/* Profile & Privacy Settings Modal */}
      {isProfileOpen && (
        <ProfileModal
          onClose={() => setIsProfileOpen(false)}
          onDataWiped={() => {
            setActiveReport(null);
            setSavedCount(0);
            setCurrentView('home');
          }}
        />
      )}

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--line)',
        backgroundColor: 'var(--header-bg)',
        padding: '40px 0 30px',
        position: 'relative',
        zIndex: 10,
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          fontSize: '0.88rem',
          color: 'var(--mute)',
        }}>
          <div>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--ink)', marginRight: '10px' }}>
              FitCheck<span style={{ color: 'var(--acc)' }}>.</span>
            </span>
            <span>Your Fit. Your Style. Your Score.</span>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span>Private by default</span>
            <span>·</span>
            <span>Subjective styling feedback</span>
            <span>·</span>
            <span>© 2026 FitCheck</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
