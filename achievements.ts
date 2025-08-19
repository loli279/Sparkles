

import { Achievement, AchievementID, HistoryEntry, SurveyAnswers } from "./types";

export const ALL_ACHIEVEMENTS: Record<AchievementID, Achievement> = {
    FIRST_CHAT: {
        id: 'FIRST_CHAT',
        name: 'First Chat!',
        description: 'You started your first weekly check-in. Great start!',
        icon: '🎉',
    },
    CONSISTENT_BRUSHER: {
        id: 'CONSISTENT_BRUSHER',
        name: 'Consistent Brusher',
        description: "You've reported brushing twice a day. Keep it up!",
        icon: '🪥',
    },
    FLOSS_CHAMPION: {
        id: 'FLOSS_CHAMPION',
        name: 'Floss Champion',
        description: 'You reported flossing every day. Your gums are happy!',
        icon: '🏆',
    },
    SUPER_SMILE_STREAK: {
        id: 'SUPER_SMILE_STREAK',
        name: 'Super Smile Streak',
        description: 'You completed 3 weekly check-ins. Look at you go!',
        icon: '🌟',
    },
    HEALTHY_HYDRATOR: {
        id: 'HEALTHY_HYDRATOR',
        name: 'Healthy Hydrator',
        description: 'You mentioned drinking water. Excellent choice!',
        icon: '💧',
    },
    DENTIST_FAN: {
        id: 'DENTIST_FAN',
        name: 'Dentist Fan',
        description: "You feel great about visiting the dentist. That's awesome!",
        icon: '😄',
    },
    BRUSHING_STREAK_3: {
        id: 'BRUSHING_STREAK_3',
        name: '3-Week Brush Streak',
        description: "Three weeks of great brushing in a row. You're on fire!",
        icon: '🔥',
    },
    BRUSHING_STREAK_7: {
        id: 'BRUSHING_STREAK_7',
        name: '7-Week Brush Streak',
        description: "That's 7 weeks of awesome brushing. A true habit!",
        icon: '✨',
    },
    BRUSHING_STREAK_14: {
        id: 'BRUSHING_STREAK_14',
        name: '14-Week Brush Streak',
        description: 'Wow! 14 weeks of consistent brushing. Your smile is legendary!',
        icon: '💎',
    }
};

const isBrushingGood = (answers: SurveyAnswers) =>
  answers.q1_brush_frequency === 'Twice' || answers.q1_brush_frequency === 'More than twice';

const calculateBrushingStreak = (history: HistoryEntry[], currentAnswers: SurveyAnswers): number => {
  if (!isBrushingGood(currentAnswers)) return 0;
  
  let streak = 1;
  // History is newest to oldest, so we iterate through it
  for (const entry of history) {
    if (isBrushingGood(entry.answers)) {
      streak++;
    } else {
      break; // Streak is broken
    }
  }
  return streak;
};

type AchievementCheck = (history: HistoryEntry[], currentAnswers: SurveyAnswers) => boolean;

export const ACHIEVEMENT_CHECKS: Record<AchievementID, AchievementCheck> = {
    FIRST_CHAT: (history) => history.length === 0,
    CONSISTENT_BRUSHER: (_, currentAnswers) => isBrushingGood(currentAnswers),
    FLOSS_CHAMPION: (_, currentAnswers) => 
        currentAnswers.q5_floss_frequency === 'Every day!',
    SUPER_SMILE_STREAK: (history) => history.length === 2, // The current submission would be the 3rd
    HEALTHY_HYDRATOR: (_, currentAnswers) =>
        (currentAnswers.q8_drinks || '').toLowerCase().includes('water'),
    DENTIST_FAN: (_, currentAnswers) =>
        currentAnswers.q13_dentist_feeling === 'I like it!',
    BRUSHING_STREAK_3: (history, currentAnswers) => calculateBrushingStreak(history, currentAnswers) === 3,
    BRUSHING_STREAK_7: (history, currentAnswers) => calculateBrushingStreak(history, currentAnswers) === 7,
    BRUSHING_STREAK_14: (history, currentAnswers) => calculateBrushingStreak(history, currentAnswers) === 14,
};