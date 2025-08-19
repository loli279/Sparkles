import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Settings } from '../types';
import { getSettings, saveSettings } from '../services/settingsService';

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode; userId: string; isGuest: boolean }> = ({ children, userId, isGuest }) => {
  const [settings, setSettings] = useState<Settings>(() => getSettings(isGuest ? 'guest' : userId));

  useEffect(() => {
    // Re-initialize settings when user changes
    const userSettings = getSettings(isGuest ? 'guest' : userId);
    setSettings(userSettings);
  }, [userId, isGuest]);

  useEffect(() => {
    // Apply theme and font size to the root element
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    document.documentElement.classList.remove('font-size-sm', 'font-size-md', 'font-size-lg');
    document.documentElement.classList.add(`font-size-${settings.fontSize}`);
  }, [settings.theme, settings.fontSize]);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prevSettings => {
      const updated = { ...prevSettings, ...newSettings };
      if (userId && !isGuest) {
        saveSettings(userId, updated);
      }
      return updated;
    });
  }, [userId, isGuest]);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
