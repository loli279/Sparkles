import React from 'react';
import { HistoryEntry, AchievementID, User, ChildView } from '../types';
import ProgressCharts from './ProgressCharts';
import AchievementsDisplay from './AchievementsDisplay';
import { DENTAL_FACTS } from '../constants/dentalFacts';
import { motion } from 'framer-motion';
import DrSparkleStory from './DrSparkleStory';
import QuickBites from './QuickBites';
import { useSound } from '../hooks/useSound';
import { APP_VERSION } from '../constants';

interface DashboardProps {
    user: User;
    isGuest: boolean;
    history: HistoryEntry[];
    achievements: AchievementID[];
    onNavigate: (view: ChildView) => void;
}

const getDayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now as any) - (start as any);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const cardHover = {
    y: -5,
    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.07)",
    transition: { type: 'spring' as const, stiffness: 300 }
};

const Dashboard: React.FC<DashboardProps> = ({ user, isGuest, history, achievements, onNavigate }) => {
  const latestHistoryEntry = history.length > 0 ? history[0] : undefined;
  const factIndex = getDayOfYear() % DENTAL_FACTS.length;
  const fact = DENTAL_FACTS[factIndex];
  const isFirstTimeUser = history.length === 0;
  const { playSound } = useSound();
  
  const handleNavigate = (view: ChildView) => {
    playSound('click');
    onNavigate(view);
  }

  return (
    <motion.div 
        className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-6 font-sans h-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
      {/* Header */}
      <motion.header className="lg:col-span-4" variants={itemVariants}>
        <h2 className="text-4xl font-black text-[var(--color-text-strong)]">Hello {user.username}! 👋</h2>
        <p className="text-xl text-[var(--color-text-secondary)] mt-1">
          {isFirstTimeUser ? "Welcome to your Smile Hub!" : "Ready for your check-in or have a question?"}
        </p>
      </motion.header>

      {isGuest && (
         <motion.div variants={itemVariants} className="lg:col-span-4 bg-[var(--color-warning-light)] p-4 rounded-2xl shadow-md border-2 border-amber-300 text-amber-900 text-center flex items-center justify-center gap-4">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="text-lg font-bold">You're in Guest Mode!</h3>
              <p className="opacity-90 mt-1 text-sm">Your progress won't be saved. Sign up for free to track your history and achievements!</p>
            </div>
        </motion.div>
      )}
      
      {/* CTA Section */}
      <motion.div variants={itemVariants} className="lg:col-span-4">
         {isFirstTimeUser ? (
             <DrSparkleStory onStartSurvey={() => handleNavigate('chat')} />
         ) : (
             <motion.div whileHover={cardHover} className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] p-8 rounded-2xl shadow-xl text-white flex flex-col sm:flex-row justify-between items-center h-full">
                <div className="text-center sm:text-left mb-6 sm:mb-0">
                    <h3 className="text-4xl font-extrabold mb-2">Ready to Chat?</h3>
                    <p className="max-w-md opacity-90">Start your weekly check-in or ask Dr. Sparkle any question!</p>
                </div>
                <motion.button
                    onClick={() => handleNavigate('chat')}
                    className="flex-shrink-0 flex items-center justify-center gap-3 py-4 px-8 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white rounded-full shadow-lg text-lg font-bold"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring' as const, stiffness: 300 }}
                >
                    <span role="img" aria-label="Survey icon">💬</span>
                    <span>Open Chat</span>
                </motion.button>
            </motion.div>
         )}
      </motion.div>

      {/* Progress Section */}
      <motion.div variants={itemVariants} whileHover={cardHover} className="lg:col-span-4 xl:col-span-2 bg-[var(--color-card-bg)] p-6 rounded-2xl shadow-lg border border-[var(--color-border)]">
        <h3 className="text-2xl font-bold text-[var(--color-text-strong)] mb-4">Your Progress Tracker</h3>
        <ProgressCharts history={history} />
      </motion.div>
      
      {/* Achievements Section */}
      <motion.div variants={itemVariants} whileHover={cardHover} className="lg:col-span-4 xl:col-span-2 bg-[var(--color-card-bg)] p-6 rounded-2xl shadow-lg border border-[var(--color-border)]">
        <h3 className="text-2xl font-bold text-[var(--color-text-strong)] mb-4">Your Achievements</h3>
        <AchievementsDisplay unlockedIds={achievements} />
      </motion.div>

      {/* NEW: Smile Plan Promo Card */}
       <motion.div variants={itemVariants} whileHover={cardHover} className="lg:col-span-4 xl:col-span-2">
        <button onClick={() => handleNavigate('smilePlan')} className="bg-gradient-to-br from-teal-400 to-cyan-500 p-6 rounded-2xl shadow-xl text-white flex flex-col h-full text-left w-full group">
            <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold bg-white/30 px-2 py-1 rounded-full">PLAN</span>
                <h4 className="font-extrabold text-2xl">Weekly Smile Plan</h4>
            </div>
            <p className="opacity-95 leading-relaxed flex-grow">Get daily tips and healthy food ideas from Dr. Sparkle in a fun 7-day calendar view!</p>
            <div className="mt-4 font-bold flex items-center gap-2">
                View Your Plan 
                <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </div>
        </button>
      </motion.div>
      
      {/* Quick Bites Section */}
       <motion.div variants={itemVariants} whileHover={cardHover} className="lg:col-span-4 xl:col-span-2">
        <QuickBites 
            fact={fact} 
            motivationalMessage={latestHistoryEntry?.motivationalMessage} 
        />
       </motion.div>
       
       <motion.footer variants={itemVariants} className="lg:col-span-4 text-center text-xs text-[var(--color-text-secondary)] mt-4">
          Dr. Sparkle v{APP_VERSION}
        </motion.footer>
    </motion.div>
  );
};

export default Dashboard;