import { Message } from '../types';
import { getFromStorage, saveToStorage } from '../utils/storage';

const getStorageKey = (userId: string) => `dentalBuddyChatHistory_${userId}`;

export const getChatHistory = (userId: string): Message[] => {
  if (!userId) return [];
  return getFromStorage<Message[]>(getStorageKey(userId), []);
};

export const saveChatHistory = (userId: string, history: Message[]): void => {
  if (!userId) return;
  saveToStorage(getStorageKey(userId), history);
};

export const deleteChatHistoryForUser = (userId: string): void => {
    if(!userId) return;
    try {
        localStorage.removeItem(getStorageKey(userId));
    } catch (error) {
        console.error("Failed to delete chat history from localStorage", error);
    }
}