import React, { useState, useEffect, useRef } from 'react';
import { User, HistoryEntry, SurveyAnswers, Message, Question } from '../types';
import { INITIAL_SURVEY_QUESTIONS, WEEKLY_SURVEY_QUESTIONS } from '../constants';
import { generateWeeklyReport } from '../services/geminiService';
import { checkAndUnlockAchievements } from '../services/achievementService';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../hooks/useSound';
import { useAppContext } from '../state/AppContext';
import { useSettings } from '../contexts/SettingsContext';

import MessageBubble from './MessageBubble';
import LoadingSpinner from './LoadingSpinner';

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

interface ChatFlowProps {
  onExit: () => void;
}

const chatContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.8,
        },
    },
};

const chatMessageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } },
};

const ChatFlow: React.FC<ChatFlowProps> = ({ onExit }) => {
    const { state, dispatch } = useAppContext();
    const { user, history, chatHistory } = state;
    const { settings } = useSettings();

    const isFirstTime = history.length === 0;
    const questions = isFirstTime ? INITIAL_SURVEY_QUESTIONS : WEEKLY_SURVEY_QUESTIONS;
    const { playSound } = useSound();

    const [view, setView] = useState<'form' | 'loading' | 'feedback'>('form');
    const [answers, setAnswers] = useState<SurveyAnswers>(() => 
        questions.reduce((acc, q) => ({ ...acc, [q.id]: '' }), {})
    );
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    };

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        if(view === 'feedback' && messages.length > 0) {
            messages.forEach((msg, index) => {
                setTimeout(() => {
                    if (msg.sender === 'system') {
                        playSound('achievement');
                    } else {
                        playSound('message');
                    }
                }, index * 800);
            });
        }
    }, [messages, view, playSound]);

    const handleAnswerChange = (id: string, value: string) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        playSound('complete');
        setView('loading');
        
        let timeSinceLastCheckin: string | null = null;
        if (!isFirstTime && history[0]?.date) {
            const lastDate = new Date(history[0].date);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - lastDate.getTime());
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) timeSinceLastCheckin = 'earlier today';
            else if (diffDays === 1) timeSinceLastCheckin = 'yesterday';
            else timeSinceLastCheckin = `${diffDays} days ago`;
        }
        
        const { profile, story, feedback, motivationalMessage } = await generateWeeklyReport(user.id, chatHistory, settings.aiPersonality, answers, timeSinceLastCheckin);
        const newlyUnlocked = checkAndUnlockAchievements(history, answers);

        const newEntry: HistoryEntry = {
            id: uuidv4(),
            date: new Date().toISOString(),
            answers,
            profile,
            story,
            feedback,
            motivationalMessage,
            unlockedAchievements: newlyUnlocked,
        };
        
        const storyMessages: Message[] = story.map(text => ({ id: uuidv4(), sender: 'bot', text }));
        const feedbackMessages: Message[] = feedback.map(text => ({ id: uuidv4(), sender: 'bot', text }));
        const achievementMessages: Message[] = newlyUnlocked.map(id => ({ id: uuidv4(), sender: 'system', text: `Achievement Unlocked: ${id}` }));

        const introMessage: Message = { id: uuidv4(), sender: 'bot', text: "Awesome, thank you! While I whip up your personalized report, let me tell you a quick story... 📖" };
        const finalMessage: Message = { id: uuidv4(), sender: 'bot', text: "Great job! I've saved this full report to your **History** tab. You can look back at it any time! Just click the 'History' button in the sidebar. I've even made it glow for you! 🟢" };
        
        const allDisplayMessages = [introMessage, ...storyMessages, ...feedbackMessages, ...achievementMessages, finalMessage];
        
        setMessages(allDisplayMessages);
        setView('feedback');
        
        dispatch({ type: 'ADD_HISTORY_ENTRY', payload: newEntry });
        dispatch({ type: 'SET_HAS_NEW_REPORT', payload: true });
    };

    const answeredCount = Object.values(answers).filter(a => a.trim() !== '').length;
    const isFormValid = answeredCount === questions.length;

    if (!user) return null;

    const renderForm = () => (
        <div className="p-4 sm:p-8">
            <h2 className="text-4xl font-black text-[var(--color-text-strong)]">{isFirstTime ? "Your First Check-in!" : "Weekly Check-in!"}</h2>
            <p className="text-[var(--color-text-secondary)] mt-2 text-lg">{isFirstTime ? "A few questions to get to know your dental habits." : "Just a few quick questions to see how you did this week."}</p>
            <form onSubmit={handleSubmit} className="space-y-8 mt-8 w-full">
                {questions.map((question, index) => (
                    <motion.div 
                        key={question.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <label htmlFor={question.id} className="block text-md font-bold text-slate-700 mb-3">
                            {`${index + 1}. ${question.text}`}
                        </label>
                        {question.type === 'choice' && question.options ? (
                            <div className="flex flex-wrap gap-3">
                                {question.options.map(option => (
                                    <motion.button
                                        type="button"
                                        key={option}
                                        onClick={() => {
                                            playSound('click');
                                            handleAnswerChange(question.id, option)
                                        }}
                                        className={`px-4 py-2 rounded-xl font-semibold border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] ${
                                            answers[question.id] === option
                                                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md'
                                                : 'bg-white text-slate-700 border-slate-300 hover:border-[var(--color-primary)] hover:bg-violet-50'
                                        }`}
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {option}
                                    </motion.button>
                                ))}
                            </div>
                        ) : (
                            <input
                                type="text"
                                id={question.id}
                                value={answers[question.id]}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"
                                placeholder={question.placeholder || 'Type your answer here...'}
                                required
                            />
                        )}
                    </motion.div>
                ))}
                <motion.button
                    type="submit"
                    disabled={!isFormValid}
                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white btn-primary disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200"
                    whileHover={{ scale: isFormValid ? 1.02 : 1, y: isFormValid ? -2 : 0 }}
                    whileTap={{ scale: isFormValid ? 0.98 : 1 }}
                >
                    Get My Report from Dr. Sparkle!
                </motion.button>
            </form>
        </div>
    );

    const renderFeedback = () => (
        <div className="flex flex-col h-full w-full">
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
                <motion.div 
                    className="space-y-6"
                    variants={chatContainerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {messages.map((msg) => (
                       <motion.div key={msg.id} variants={chatMessageVariants}>
                           <MessageBubble message={msg} userAvatar={user.avatar} />
                       </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                </motion.div>
            </main>
            <AnimatePresence>
                {messages.length > 0 && (
                    <motion.footer 
                        className="p-4 border-t border-[var(--color-border)] bg-white/70 backdrop-blur-md"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: messages.length * 0.8, duration: 0.5 } }}
                    >
                        <motion.button 
                            onClick={() => {
                                playSound('click');
                                onExit();
                            }} 
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white btn-primary"
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            All Done! Back to Dashboard
                        </motion.button>
                    </motion.footer>
                )}
            </AnimatePresence>
        </div>
    );
    
    const renderLoading = () => (
        <div className="flex flex-col items-center justify-center h-full">
            <LoadingSpinner />
        </div>
    );

    switch(view) {
        case 'form': return renderForm();
        case 'loading': return renderLoading();
        case 'feedback': return renderFeedback();
        default: return renderForm();
    }
};

export default ChatFlow;