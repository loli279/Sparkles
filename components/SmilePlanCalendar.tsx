import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WeeklySmilePlan, User } from '../types';
import { getSmilePlan, saveSmilePlan } from '../services/planService';
import { generateWeeklySmilePlan } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { useSound } from '../hooks/useSound';

interface SmilePlanCalendarProps {
  user: User;
  isGuest: boolean;
}

const DayCard: React.FC<{ day: string; date: string; tip: string; food: string; index: number }> = ({ day, date, tip, food, index }) => (
    <motion.div
        className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border border-[var(--color-border)] flex flex-col h-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
    >
        <div className="flex justify-between items-baseline mb-4">
            <h3 className="text-2xl font-black text-gradient-primary">{day}</h3>
            <span className="font-bold text-sm text-[var(--color-text-secondary)]">{date}</span>
        </div>
        <div className="space-y-4 flex-grow">
            <div className="flex items-start gap-3">
                <span className="text-2xl pt-1">💡</span>
                <div>
                    <p className="font-bold text-[var(--color-text-strong)]">Daily Tip</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">{tip}</p>
                </div>
            </div>
            <div className="flex items-start gap-3">
                <span className="text-2xl pt-1">🍎</span>
                <div>
                    <p className="font-bold text-[var(--color-text-strong)]">Healthy Snack</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">{food}</p>
                </div>
            </div>
        </div>
        <div className="border-t border-[var(--color-border-light)] mt-4 pt-4 flex justify-around text-xs font-semibold text-[var(--color-text-secondary)]">
            <span className="flex items-center gap-1.5"><span className="text-lg">☀️</span> Morning Brush</span>
            <span className="flex items-center gap-1.5"><span className="text-lg">🌙</span> Evening Brush</span>
        </div>
    </motion.div>
);

const getNextSevenDays = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const result = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dayName = days[date.getDay()];
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        result.push({ dayName, formattedDate });
    }
    return result;
};


const SmilePlanCalendar: React.FC<SmilePlanCalendarProps> = ({ user, isGuest }) => {
    const [plan, setPlan] = useState<WeeklySmilePlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [weekSchedule, setWeekSchedule] = useState<{dayName: string, formattedDate: string}[]>([]);
    const { playSound } = useSound();

    useEffect(() => {
        setWeekSchedule(getNextSevenDays());
        if (!isGuest) {
            const existingPlan = getSmilePlan(user.id);
            setPlan(existingPlan);
        }
        setIsLoading(false);
    }, [user.id, isGuest]);

    const handleGeneratePlan = async () => {
        playSound('click');
        setIsLoading(true);
        const newPlan = await generateWeeklySmilePlan();
        if (!isGuest) {
            saveSmilePlan(user.id, newPlan);
        }
        setPlan(newPlan);
        setIsLoading(false);
        playSound('complete');
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <LoadingSpinner />
                </div>
            );
        }

        if (plan) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {weekSchedule.map((dayInfo, index) => {
                        const dayPlan = plan[dayInfo.dayName as keyof WeeklySmilePlan];
                        if (!dayPlan) return null; // Should not happen if AI returns all 7 days
                        return (
                            <DayCard
                                key={index}
                                day={dayInfo.dayName}
                                date={dayInfo.formattedDate}
                                tip={dayPlan.tip}
                                food={dayPlan.foodSuggestion}
                                index={index}
                            />
                        );
                    })}
                     <motion.div
                        className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl shadow-lg border border-dashed border-[var(--color-border)] flex flex-col h-full justify-center items-center text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 7 * 0.05 }}
                    >
                         <h3 className="text-xl font-bold text-[var(--color-text-strong)]">Want a new plan?</h3>
                         <p className="text-sm text-[var(--color-text-secondary)] mt-2 mb-4">You can generate a fresh set of tips and snack ideas anytime!</p>
                         <motion.button
                            onClick={handleGeneratePlan}
                            className="btn-primary text-white font-bold py-2 px-6 rounded-full shadow-lg text-md"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={isGuest}
                        >
                            {isGuest ? "Sign up to create plans" : "Regenerate Plan"}
                        </motion.button>
                     </motion.div>
                </div>
            );
        }
        
        return (
            <div className="flex flex-col items-center justify-center text-center h-full bg-[var(--color-card-bg)] p-10 rounded-2xl shadow-xl border border-[var(--color-border)]">
                <span className="text-8xl mb-4">🗓️</span>
                <h2 className="text-4xl font-black text-[var(--color-text-strong)]">Your Weekly Smile Plan</h2>
                <p className="text-[var(--color-text-secondary)] mt-3 max-w-lg text-lg">
                    Let Dr. Sparkle create a personalized 7-day plan just for you, filled with daily tips and healthy snack ideas to keep your smile shining bright!
                </p>
                {isGuest && (
                    <p className="mt-4 p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-sm font-semibold">
                        Sign up for a free account to generate and save your smile plans!
                    </p>
                )}
                <motion.button
                    onClick={handleGeneratePlan}
                    disabled={isLoading || isGuest}
                    className="mt-8 py-4 px-10 text-xl font-bold text-white rounded-full shadow-xl btn-primary disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                >
                    ✨ Generate My Plan
                </motion.button>
            </div>
        );
    };

    return (
        <div className="p-4 md:p-8 space-y-6 animate-fade-in h-full flex flex-col">
            <div className="pb-5 border-b border-[var(--color-border)] flex-shrink-0">
                <h2 className="text-4xl font-black text-[var(--color-text-strong)]">Weekly Smile Plan</h2>
                <p className="text-[var(--color-text-secondary)] mt-2 text-lg">Your 7-day guide to a healthier, happier smile!</p>
            </div>
            <div className="flex-grow">
                <AnimatePresence mode="wait">
                    {renderContent()}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SmilePlanCalendar;