import React, { createContext, useContext, useState, useEffect } from 'react';

const ACCESS_STORAGE_KEY = 'tubepulse_access_code_granted';
export const VALID_ACCESS_CODE = 'freedownload2026';

interface AccessCodeContextType {
  isUnlocked: boolean;
  unlockWithCode: (code: string) => boolean;
  lockAccess: () => void;
}

const AccessCodeContext = createContext<AccessCodeContextType | undefined>(undefined);

export const AccessCodeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ACCESS_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const unlockWithCode = (code: string): boolean => {
    const sanitized = code.trim().toLowerCase();
    if (sanitized === VALID_ACCESS_CODE.toLowerCase()) {
      setIsUnlocked(true);
      try {
        localStorage.setItem(ACCESS_STORAGE_KEY, 'true');
      } catch (e) {
        console.error('Storage error:', e);
      }
      return true;
    }
    return false;
  };

  const lockAccess = () => {
    setIsUnlocked(false);
    try {
      localStorage.removeItem(ACCESS_STORAGE_KEY);
    } catch (e) {
      console.error('Storage error:', e);
    }
  };

  return (
    <AccessCodeContext.Provider value={{ isUnlocked, unlockWithCode, lockAccess }}>
      {children}
    </AccessCodeContext.Provider>
  );
};

export const useAccessCode = () => {
  const context = useContext(AccessCodeContext);
  if (!context) {
    throw new Error('useAccessCode must be used within an AccessCodeProvider');
  }
  return context;
};
