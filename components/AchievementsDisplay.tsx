
import React from 'react';
import { AchievementID } from '../types';
import { ALL_ACHIEVEMENTS } from '../achievements';

interface AchievementsDisplayProps {
  unlockedIds: AchievementID[];
}

const AchievementsDisplay: React.FC<AchievementsDisplayProps> = ({ unlockedIds }) => {

    if (unlockedIds.length === 0) {
        return (
            <div className="text-center text-slate-500 py-10 bg-slate-50 rounded-lg">
                <p className="font-semibold text-lg">Your first achievement is waiting!</p>
                <p className="text-sm mt-1">Complete a survey to start your collection. 🏆</p>
            </div>
        );
    }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {Object.values(ALL_ACHIEVEMENTS).map(achievement => {
        const isUnlocked = unlockedIds.includes(achievement.id);
        const isImportant = achievement.id.includes('STREAK') || achievement.id === 'FLOSS_CHAMPION';
        return (
            <div 
                key={achievement.id}
                className={`relative p-4 rounded-xl text-center transition-all duration-300 transform ${
                    isUnlocked 
                    ? 'bg-gradient-to-br from-yellow-50 to-amber-100 border-2 border-amber-300 shadow-md' 
                    : 'bg-slate-100 border-2 border-slate-200'
                }`}
                title={isUnlocked ? achievement.description : 'Locked Achievement'}
            >
                <div className={`text-5xl transition-transform duration-300 flex items-center justify-center h-16 ${isUnlocked ? 'grayscale-0 scale-100' : 'grayscale scale-90 opacity-40'}`}>
                    {achievement.icon}
                </div>
                <p className={`mt-2 font-bold text-xs h-8 flex items-center justify-center ${isUnlocked ? 'text-amber-900' : 'text-slate-500'}`}>
                    {achievement.name}
                </p>
                {!isUnlocked && <div className="text-3xl text-slate-400/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-3">🔒</div>}
                 {isUnlocked && isImportant && <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--color-accent)] rounded-full animate-glow border-2 border-white"></div>}
            </div>
        )
      })}
    </div>
  );
};

export default AchievementsDisplay;