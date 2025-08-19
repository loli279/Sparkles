
import React from 'react';
import { HistoryEntry, Message } from '../types';
import { ALL_QUESTIONS_MAP } from '../constants';
import { motion } from 'framer-motion';
import MessageBubble from './MessageBubble';

interface HistoryDetailProps {
  entry: HistoryEntry;
  onBack: () => void;
}

const HistoryDetail: React.FC<HistoryDetailProps> = ({ entry, onBack }) => {
  const { feedback, story = [], answers, profile, unlockedAchievements } = entry;

  const chatMessages: Message[] = [
      ...story.map((text, index) => ({
          id: `story-${index}`,
          sender: 'bot' as const,
          text,
      })),
      ...feedback.map((text, index) => ({
          id: `feedback-${index}`,
          sender: 'bot' as const,
          text,
      })),
      ...unlockedAchievements.map((achId, index) => ({
          id: `ach-${index}`,
          sender: 'system' as const,
          text: `Achievement Unlocked: ${achId}`,
      }))
  ];

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <motion.button
                onClick={onBack}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-2xl font-bold"
            >
                &larr;
            </motion.button>
            <div>
                <h2 className="text-3xl font-extrabold text-[var(--color-text-strong)]">Reviewing Your Survey</h2>
                <p className="text-[var(--color-text-secondary)] text-md">From {new Date(entry.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
        </div>
        <p className="text-sm font-bold text-[var(--color-primary)] bg-white inline-block px-3 py-1 rounded-full border border-violet-200">
            Profile: {profile}
        </p>
      </div>
      
      {/* Interactive Chat Log */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-50 p-6 rounded-2xl border border-[var(--color-border)] shadow-lg space-y-4"
      >
        {chatMessages.map((msg, index) => (
             <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
            >
                <MessageBubble message={msg} userAvatar="?" />
            </motion.div>
        ))}
      </motion.div>

      {/* User's Answers Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-2xl shadow-lg border border-[var(--color-border)]"
      >
        <h4 className="text-2xl font-bold text-slate-700 mb-6">Your Answers</h4>
        <ul className="space-y-5 text-slate-600">
            {Object.entries(answers).map(([questionId, answer]) => {
                const question = ALL_QUESTIONS_MAP.get(questionId);
                if (!answer || !question) return null;
                
                return (
                    <li key={questionId} className="border-b border-slate-100 pb-5 last:border-b-0 last:pb-0">
                        <p className="font-semibold text-slate-500">{question.text}</p>
                        <p className="pl-2 pt-1.5 font-bold text-[var(--color-primary)] text-xl">↳ {answer}</p>
                    </li>
                );
            })}
        </ul>
      </motion.div>
    </div>
  );
};

export default HistoryDetail;