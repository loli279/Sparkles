import { getFromStorage, saveToStorage } from '../utils/storage';
import { AppBackup, User, HistoryEntry, Settings, WeeklySmilePlan, Message } from '../types';
import { APP_VERSION } from '../constants';

const exportData = (): AppBackup => {
    const users = getFromStorage<Record<string, User>>('dentalBuddyUsers', {});
    const userIds = Object.keys(users).filter(id => id !== 'guest');

    const histories: Record<string, HistoryEntry[]> = {};
    const settings: Record<string, Settings> = {};
    const plans: Record<string, WeeklySmilePlan | null> = {};
    const chatHistories: Record<string, Message[]> = {};


    userIds.forEach(id => {
        histories[id] = getFromStorage(`dentalBuddySurveyHistory_${id}`, []);
        settings[id] = getFromStorage(`dentalBuddySettings_${id}`, {} as Settings);
        plans[id] = getFromStorage(`dentalBuddySmilePlan_${id}`, null);
        chatHistories[id] = getFromStorage(`dentalBuddyChatHistory_${id}`, []);
    });

    return {
        source: 'DrSparkleApp',
        version: APP_VERSION,
        exportDate: new Date().toISOString(),
        data: { users, histories, settings, plans, chatHistories }
    };
};

const importData = (backup: AppBackup) => {
    if (backup.source !== 'DrSparkleApp') {
        throw new Error('Invalid backup file. This file is not from Dr. Sparkle App.');
    }
    
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('dentalBuddy')) {
            localStorage.removeItem(key);
        }
    });

    saveToStorage('dentalBuddyUsers', backup.data.users);
    
    Object.entries(backup.data.histories).forEach(([userId, history]) => {
        if (history && history.length > 0) saveToStorage(`dentalBuddySurveyHistory_${userId}`, history);
    });
    Object.entries(backup.data.settings).forEach(([userId, setting]) => {
        if (setting) saveToStorage(`dentalBuddySettings_${userId}`, setting);
    });
    Object.entries(backup.data.plans).forEach(([userId, plan]) => {
        if (plan) saveToStorage(`dentalBuddySmilePlan_${userId}`, plan);
    });
    Object.entries(backup.data.chatHistories || {}).forEach(([userId, chatHistory]) => {
        if (chatHistory && chatHistory.length > 0) saveToStorage(`dentalBuddyChatHistory_${userId}`, chatHistory);
    });
};

export const triggerExportDownload = () => {
    try {
        const backupData = exportData();
        const date = new Date().toISOString().split('T')[0];
        const filename = `dr-sparkle-backup-${date}.json`;
        const jsonStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Export failed:", error);
        alert("Could not export data. See console for details.");
    }
};

export const handleImportFile = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!file) return reject(new Error('No file selected.'));
        if (!file.name.endsWith('.json')) return reject(new Error('Invalid file type. Please select a .json backup file.'));

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error('Could not read file content.');
                const backupData = JSON.parse(text);
                importData(backupData);
                resolve();
            } catch (err) {
                reject(err instanceof Error ? err : new Error('Failed to parse backup file.'));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.readAsText(file);
    });
};