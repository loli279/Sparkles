
import { HistoryEntry } from '../types';
import { getFromStorage, saveToStorage } from '../utils/storage';

const getStorageKey = (userId: string) => `dentalBuddySurveyHistory_${userId}`;

export const getSurveyHistory = (userId: string): HistoryEntry[] => {
  if (!userId) return [];
  return getFromStorage<HistoryEntry[]>(getStorageKey(userId), []);
};

export const saveSurveyHistory = (userId: string, history: HistoryEntry[]): void => {
  if (!userId) return;
  saveToStorage(getStorageKey(userId), history);
};

export const deleteHistoryForUser = (userId: string): void => {
    if(!userId) return;
    try {
        localStorage.removeItem(getStorageKey(userId));
    } catch (error) {
        console.error("Failed to delete survey history from localStorage", error);
    }
}