import React, { useState, useEffect } from 'react';
import { PageView, User } from './types';
import { storage } from './storage';
import { PrivacyProvider } from './context/PrivacyContext';
import { Sidebar } from './components/Sidebar';
import { BottomNavBar } from './components/BottomNavBar';
import { BackupModal } from './components/BackupModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { OnboardingWizard } from './components/OnboardingWizard';
import { DashboardView } from './components/DashboardView';
import { LancamentosView } from './components/LancamentosView';
import { ContasView } from './components/ContasView';
import { CategoriasView } from './components/CategoriasView';
import { OrcamentoView } from './components/OrcamentoView';
import { RelatoriosView } from './components/RelatoriosView';
import { ImportarView } from './components/ImportarView';
import { MetasView } from './components/MetasView';
import { TransferenciasView } from './components/TransferenciasView';
import { RegrasView } from './components/RegrasView';
import { PlayStoreKitView } from './components/PlayStoreKitView';

export const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>('painel');
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    return !storage.isOnboardingCompleted();
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [appTick, setAppTick] = useState(0);

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const users = storage.getUsers();
    return users[0] || { id: 1, usuario: 'padrão' };
  });

  // Ensure current user is valid on mount or after backup restore
  useEffect(() => {
    const users = storage.getUsers();
    if (users.length > 0 && !users.find(u => u.id === currentUser.id)) {
      setCurrentUser(users[0]);
    }
  }, [currentUser.id, appTick]);

  const handleDataChanged = () => {
    setAppTick(t => t + 1);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'painel':
        return (
          <DashboardView
            key={`painel-${appTick}`}
            currentUser={currentUser}
            onNavigate={setCurrentPage}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
          />
        );
      case 'lancamentos':
        return <LancamentosView key={`lanc-${appTick}`} currentUser={currentUser} />;
      case 'contas':
        return <ContasView key={`contas-${appTick}`} currentUser={currentUser} />;
      case 'categorias':
        return <CategoriasView key={`cat-${appTick}`} currentUser={currentUser} />;
      case 'orcamento':
        return <OrcamentoView key={`orc-${appTick}`} currentUser={currentUser} />;
      case 'relatorios':
        return <RelatoriosView key={`rel-${appTick}`} currentUser={currentUser} />;
      case 'importar':
        return <ImportarView key={`imp-${appTick}`} currentUser={currentUser} onNavigateLancamentos={() => setCurrentPage('lancamentos')} />;
      case 'metas':
        return <MetasView key={`metas-${appTick}`} currentUser={currentUser} />;
      case 'transferencias':
        return <TransferenciasView key={`transf-${appTick}`} currentUser={currentUser} />;
      case 'regras':
        return <RegrasView key={`regras-${appTick}`} currentUser={currentUser} />;
      case 'playstore':
        return <PlayStoreKitView key={`playstore-${appTick}`} />;
      default:
        return (
          <DashboardView
            key={`def-${appTick}`}
            currentUser={currentUser}
            onNavigate={setCurrentPage}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
          />
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F0F2F6] text-[#1E1E1E]">
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        isOpenMobile={isMobileMenuOpen}
        onOpenMobile={() => setIsMobileMenuOpen(true)}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-8">
        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavBar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        onOpenMore={() => setIsMobileMenuOpen(true)}
      />

      {/* Passo a Passo Didático / Onboarding Wizard */}
      {isOnboardingOpen && (
        <OnboardingWizard
          currentUser={currentUser}
          onComplete={() => setIsOnboardingOpen(false)}
          onDataChanged={handleDataChanged}
        />
      )}

      {/* Backup & Safety Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onDataChanged={handleDataChanged}
      />

      {/* PWA Offline indicator toast */}
      <OfflineIndicator />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <PrivacyProvider>
      <AppContent />
    </PrivacyProvider>
  );
};

export default App;
