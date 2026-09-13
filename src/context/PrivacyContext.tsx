import React, { createContext, useContext, useState, useEffect } from 'react';
import { brl, isPrivacyModeActive, setPrivacyModeActive } from '../utils';

interface PrivacyContextType {
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
  formatBrl: (valor: number | undefined | null) => string;
}

const PrivacyContext = createContext<PrivacyContextType>({
  isPrivacyMode: false,
  togglePrivacyMode: () => {},
  formatBrl: (v) => brl(v),
});

export const PrivacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(() => isPrivacyModeActive());

  useEffect(() => {
    const handleSync = () => {
      setIsPrivacyMode(isPrivacyModeActive());
    };
    window.addEventListener('privacy_mode_changed', handleSync);
    return () => window.removeEventListener('privacy_mode_changed', handleSync);
  }, []);

  const togglePrivacyMode = () => {
    const next = !isPrivacyMode;
    setIsPrivacyMode(next);
    setPrivacyModeActive(next);
  };

  const formatBrl = (valor: number | undefined | null): string => {
    return brl(valor, isPrivacyMode);
  };

  return (
    <PrivacyContext.Provider value={{ isPrivacyMode, togglePrivacyMode, formatBrl }}>
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = () => useContext(PrivacyContext);
