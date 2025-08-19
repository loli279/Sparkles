import { Settings } from '../types';
import { getFromStorage, saveToStorage } from '../utils/storage';

const getStorageKey = (userId: string) => `dentalBuddySettings_${userId}`;

const DEFAULT_SETTINGS: Settings = {
  parentEmail: '',
  enableEmailSummary: false,
  theme: 'light',
  fontSize: 'md',
  language: 'en',
  notifications: true,
  aiPersonality: 'friendly',
};

export const getSettings = (userId: string): Settings => {
  if (!userId) return DEFAULT_SETTINGS;
  const storedSettings = getFromStorage<Partial<Settings>>(getStorageKey(userId), {});
  return { ...DEFAULT_SETTINGS, ...storedSettings };
};

export const saveSettings = (userId: string, settings: Settings): void => {
  if (!userId) return;
  saveToStorage(getStorageKey(userId), settings);
};

export const deleteSettingsForUser = (userId: string): void => {
    if(!userId) return;
    try {
        localStorage.removeItem(getStorageKey(userId));
    } catch (error) {
        console.error("Failed to delete settings from localStorage", error);
    }
}