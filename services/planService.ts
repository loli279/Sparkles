
import { WeeklySmilePlan } from '../types';
import { getFromStorage, saveToStorage } from '../utils/storage';

const getStorageKey = (userId: string) => `dentalBuddySmilePlan_${userId}`;

export const getSmilePlan = (userId: string): WeeklySmilePlan | null => {
  if (!userId) return null;
  return getFromStorage<WeeklySmilePlan | null>(getStorageKey(userId), null);
};

export const saveSmilePlan = (userId: string, plan: WeeklySmilePlan): void => {
  if (!userId) return;
  saveToStorage(getStorageKey(userId), plan);
};

export const deleteSmilePlanForUser = (userId: string): void => {
    if(!userId) return;
    try {
        localStorage.removeItem(getStorageKey(userId));
    } catch (error) {
        console.error("Failed to delete smile plan from localStorage", error);
    }
}