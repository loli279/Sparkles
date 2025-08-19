import React, { useState, useCallback } from 'react';
import { Message } from '../types';
import { ALL_ACHIEVEMENTS } from '../achievements';
import { motion } from 'framer-motion';
import { explainDentalConcept } from '../services/geminiService';
import TypingIndicator from './TypingIndicator';
import { useSettings } from '../contexts/SettingsContext';

const sparkleAnimation = {
  initial: { scale: 0, opacity: 0, y: 10 },
  animate: { 
    scale: [1, 1.2, 1], 
    opacity: [1, 0.8, 1, 0], 
    rotate: [0, 10, -10, 0],
    transition: { duration: 1, repeat: Infinity, repeatDelay: 2 }
  },
};

const AchievementBubble: React.FC<{ text: string }> = ({ text }) => {
    const achievementId = text.split(':')[1]?.trim();
    if (!achievementId || !(achievementId in ALL_ACHIEVEMENTS)) {
        return <p className="text-slate-500 italic">{text}</p>;
    }

    const achievement = ALL_ACHIEVEMENTS[achievementId as keyof typeof ALL_ACHIEVEMENTS];

    return (
        <div className="relative bg-gradient-to-br from-amber-400 to-orange-500 p-4 rounded-2xl shadow-lg my-4 max-w-md text-white overflow-hidden">
            {/* Sparkle effects */}
            <motion.div className="absolute top-0 right-0 text-3xl" {...sparkleAnimation}>✨</motion.div>
            <motion.div className="absolute bottom-2 left-4 text-xl" {...sparkleAnimation} transition={{...sparkleAnimation.animate.transition, delay: 0.5}}>🌟</motion.div>
             
            <h4 className="font-bold text-white flex items-center gap-2 relative z-10">
                <span className="text-2xl animate-pulse">🎉</span>
                Achievement Unlocked!
            </h4>
            <div className="flex items-center gap-4 mt-3 relative z-10">
                <motion.span 
                    className="text-5xl"
                    initial={{scale: 0.5, rotate: -15}}
                    animate={{scale: 1, rotate: 0}}
                    transition={{type: 'spring' as const, stiffness: 200, damping: 10}}
                >
                    {achievement.icon}
                </motion.span>
                <div>
                    <p className="font-extrabold text-lg text-white drop-shadow-sm">{achievement.name}</p>
                    <p className="text-sm text-white/90">{achievement.description}</p>
                </div>
            </div>
            {/* Subtle glow */}
            <div className="absolute -inset-20 bg-white/20 blur-3xl opacity-30 animate-pulse"></div>
        </div>
    );
};


const ParsedMessageContent: React.FC<{ text: string }> = ({ text }) => {
    const [explanations, setExplanations] = useState<Record<number, string>>({});
    const [isLoadingExplanation, setIsLoadingExplanation] = useState<Record<number, boolean>>({});
    const { settings } = useSettings();

    const handleExplainClick = useCallback(async (concept: string, index: number) => {
        if (isLoadingExplanation[index] || explanations[index]) return; // Don't fetch if already loading or loaded

        setIsLoadingExplanation(prev => ({ ...prev, [index]: true }));
        try {
            const explanation = await explainDentalConcept(concept, settings.aiPersonality);
            setExplanations(prev => ({ ...prev, [index]: explanation }));
        } catch (error) {
            console.error("Failed to get explanation:", error);
            setExplanations(prev => ({ ...prev, [index]: "Oops! Dr. Sparkle is a bit busy to explain that right now." }));
        } finally {
            setIsLoadingExplanation(prev => ({ ...prev, [index]: false }));
        }
    }, [isLoadingExplanation, explanations, settings.aiPersonality]);
    
    // Split the text by newlines to process it line by line
    return (
        <div>
            {text.split('\n').map((line, index) => {
                // Check for bold headings like **What You're Doing Great! 🌟**
                if (line.match(/^\*\*(.*)\*\*$/)) {
                    return <strong key={index} className="block mt-2 mb-1 text-lg">{line.replace(/\*\*/g, '')}</strong>;
                }
                // Check for bullet points like "- Keep brushing for 2 full minutes..."
                if (line.startsWith('- ')) {
                    const concept = line.substring(2);
                    return (
                        <div key={index} className="pl-4 mt-1 relative">
                             <p className="flex items-start gap-2">
                                <span className="text-[var(--color-primary)] font-bold mt-1">•</span>
                                <span>{concept}</span>
                                <button
                                    onClick={() => handleExplainClick(concept, index)}
                                    className="ml-2 px-2 py-0.5 text-xs font-bold text-[var(--color-primary)] bg-violet-100 rounded-full hover:bg-violet-200 transition-colors disabled:opacity-50"
                                    disabled={!!explanations[index] || isLoadingExplanation[index]}
                                >
                                    Why?
                                </button>
                            </p>
                            {isLoadingExplanation[index] && <div className="mt-2 ml-4"><TypingIndicator /></div>}
                            {explanations[index] && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-2 p-3 bg-violet-50 border-l-4 border-violet-300 rounded-r-lg"
                                >
                                    <p className="text-sm text-[var(--color-text-secondary)]">{explanations[index]}</p>
                                </motion.div>
                            )}
                        </div>
                    );
                }
                return <p key={index}>{line}</p>;
            })}
        </div>
    );
};

const MessageBubble: React.FC<{ message: Message, userAvatar: string }> = ({ message, userAvatar }) => {
  const { sender, text } = message;

  if (sender === 'system') {
    return (
        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
        >
            <AchievementBubble text={text} />
        </motion.div>
    )
  }

  const isUser = sender === 'user';

  return (
    <div className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xl border-2 ${isUser ? 'order-2 bg-violet-100 border-violet-200' : 'order-1 bg-slate-200 border-slate-300'}`}>
        {isUser ? userAvatar : '🦷'}
      </div>
      <div className={`flex flex-col space-y-2 text-md max-w-lg ${isUser ? 'order-1 items-end' : 'order-2 items-start'}`}>
        <div>
          <div
            className={`px-5 py-3 rounded-2xl inline-block shadow-md ${
              isUser
                ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white rounded-br-none'
                : 'bg-white text-[var(--color-text-primary)] rounded-bl-none border border-[var(--color-border)]'
            }`}
          >
           {isUser ? (
             <div className="whitespace-pre-wrap">{text}</div>
           ) : (
             <ParsedMessageContent text={text} />
           )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
