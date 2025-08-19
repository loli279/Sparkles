import { HistoryEntry, SurveyAnswers, AchievementID } from "../types";
import { ACHIEVEMENT_CHECKS } from "../achievements";

// Gets all unique achievements from the entire history
export const getUnlockedAchievements = (history: HistoryEntry[]): AchievementID[] => {
    const allAchievements = history.reduce((acc, entry) => {
        return acc.concat(entry.unlockedAchievements);
    }, [] as AchievementID[]);
    
    return [...new Set(allAchievements)];
};


// Checks the current submission against all achievement criteria
export const checkAndUnlockAchievements = (history: HistoryEntry[], currentAnswers: SurveyAnswers): AchievementID[] => {
    const alreadyUnlocked = getUnlockedAchievements(history);
    const newlyUnlocked: AchievementID[] = [];

    for (const id in ACHIEVEMENT_CHECKS) {
        const achievementId = id as AchievementID;
        if (alreadyUnlocked.includes(achievementId)) {
            continue; // Don't check if already unlocked
        }

        const check = ACHIEVEMENT_CHECKS[achievementId];
        if (check(history, currentAnswers)) {
            newlyUnlocked.push(achievementId);
        }
    }

    return newlyUnlocked;
};
