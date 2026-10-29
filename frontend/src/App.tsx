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

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('home');
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('fitcheck-theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [activeReport, setActiveReport] = useState<FitReport | null>(null);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [compareIds, setCompareIds] = useState<{ idA?: string; idB?: string }>({});

  const [shareModalReport, setShareModalReport] = useState<FitReport | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('fitcheck-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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

      <main className="container" style={{ flex: 1, paddingBottom: '60px' }}>
        {currentView === 'home' && (
          <HeroSection
            onStartCheck={() => setCurrentView('check')}
            onExploreStyles={() => setCurrentView('community')}
          />
        )}

        {currentView === 'check' && (
          <StudioSection
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}

        {currentView === 'result' && activeReport && (
          <ReportDashboard
            report={activeReport}
            onAnalyzeAnother={() => setCurrentView('check')}
            onOpenCompare={(id) => handleOpenCompare(id)}
            onOpenShareModal={(rep) => setShareModalReport(rep)}
          />
        )}

        {currentView === 'fits' && (
          <MyFitsVault
            onSelectReport={(rep) => {
              setActiveReport(rep);
              setCurrentView('result');
            }}
            onCompareSelected={(idA, idB) => handleOpenCompare(idA, idB)}
            onGoToStudio={() => setCurrentView('check')}
          />
        )}

        {currentView === 'compare' && (
          <CompareStudio
            initialReportAId={compareIds.idA}
            initialReportBId={compareIds.idB}
            onBackToFits={() => setCurrentView('fits')}
          />
        )}

        {currentView === 'community' && (
          <CommunityDiscover
            onJoinChallenge={() => setCurrentView('check')}
          />
        )}
      </main>

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
        backgroundColor: 'var(--bg)',
        padding: '36px 0',
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '0.88rem',
          color: 'var(--mute)',
        }}>
          <div>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--ink)', marginRight: '10px' }}>
              FitCheck
            </span>
            <span>Your Fit. Your Style. Your Score.</span>
          </div>
          <div>
            <span>Scores are subjective AI guidance · Private by default</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
