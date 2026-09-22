'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface AccessibilityContextType {
  highContrast: boolean;
  toggleHighContrast: () => void;
  largeText: boolean;
  toggleLargeText: () => void;
  resetAccessibility: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);

  useEffect(() => {
    // Load from localStorage if available
    try {
      const savedContrast = localStorage.getItem('trustvote_high_contrast');
      if (savedContrast === 'true') {
        setHighContrast(true);
        document.documentElement.classList.add('high-contrast');
      }
      const savedLarge = localStorage.getItem('trustvote_large_text');
      if (savedLarge === 'true') {
        setLargeText(true);
        document.documentElement.classList.add('large-text');
      }
    } catch (e) {}
  }, []);

  const toggleHighContrast = () => {
    setHighContrast((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('trustvote_high_contrast', String(next));
      } catch (e) {}
      if (next) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
      return next;
    });
  };

  const toggleLargeText = () => {
    setLargeText((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('trustvote_large_text', String(next));
      } catch (e) {}
      if (next) {
        document.documentElement.classList.add('large-text');
      } else {
        document.documentElement.classList.remove('large-text');
      }
      return next;
    });
  };

  const resetAccessibility = () => {
    setHighContrast(false);
    setLargeText(false);
    try {
      localStorage.removeItem('trustvote_high_contrast');
      localStorage.removeItem('trustvote_large_text');
    } catch (e) {}
    document.documentElement.classList.remove('high-contrast', 'large-text');
  };

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        toggleHighContrast,
        largeText,
        toggleLargeText,
        resetAccessibility,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
