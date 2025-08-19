import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../state/AppContext';
import { useSettings } from '../contexts/SettingsContext';
import { useSound } from '../hooks/useSound';
import { sendMessageToChat, generateWeeklyReport } from '../services/geminiService';
import { checkAndUnlockAchievements } from '../services/achievementService';

import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import LoadingSpinner from './LoadingSpinner';
import { INITIAL_SURVEY_QUESTIONS, WEEKLY_SURVEY_QUESTIONS } from '../constants';
import { Question, SurveyAnswers, Message, HistoryEntry } from '../types';

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

type SurveyState = {
    questions: Question[];
    answers: SurveyAnswers;
    currentIndex: number;
} | null;

const ChatView: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { user, isGuest, history, chatHistory } = state;
    const { settings } = useSettings();
    const { playSound } = useSound();

    const [isLoading, setIsLoading] = useState(false);
    const [surveyState, setSurveyState] = useState<SurveyState>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isLoading, scrollToBottom]);
    
    const addMessage = useCallback((message: Message, sound: 'message' | 'achievement' | null = 'message') => {
        dispatch({ type: 'ADD_CHAT_MESSAGE', payload: message });
        if (sound) playSound(sound);
    }, [dispatch, playSound]);

    const handleSendMessage = useCallback(async (text: string) => {
        if (!user || surveyState) return;
        playSound('click');
        const userMessage: Message = { id: uuidv4(), sender: 'user', text };
        addMessage(userMessage, null);
        setIsLoading(true);

        const responseText = await sendMessageToChat(user.id, [...chatHistory, userMessage], settings.aiPersonality, text);
        setIsLoading(false);
        const botMessage: Message = { id: uuidv4(), sender: 'bot', text: responseText };
        addMessage(botMessage);
    }, [user, surveyState, chatHistory, settings.aiPersonality, addMessage, playSound]);

    const startSurvey = useCallback(() => {
        if (isGuest) {
            addMessage({id: uuidv4(), sender: 'bot', text: "Weekly check-ins are only available for registered users. But you can still ask me anything!"});
            return;
        }
        playSound('click');
        const questions = history.length === 0 ? INITIAL_SURVEY_QUESTIONS : WEEKLY_SURVEY_QUESTIONS;
        const firstQuestion = questions[0];
        
        addMessage({id: uuidv4(), sender: 'bot', text: "Great! Let's start your check-in. Here's the first question:"}, null);
        setTimeout(() => {
            addMessage({ id: uuidv4(), sender: 'bot', text: firstQuestion.text });
        }, 600);
        
        setSurveyState({
            questions,
            answers: {},
            currentIndex: 0,
        });
    }, [isGuest, history.length, addMessage, playSound]);

    const handleSurveyAnswer = useCallback((answer: string) => {
        if (!surveyState || !user) return;
        
        playSound('click');
        const { questions, answers, currentIndex } = surveyState;
        
        const userMessage: Message = { id: uuidv4(), sender: 'user', text: answer };
        addMessage(userMessage, null);

        const newAnswers = { ...answers, [questions[currentIndex].id]: answer };
        const nextIndex = currentIndex + 1;

        if (nextIndex < questions.length) {
            setSurveyState({ ...surveyState, answers: newAnswers, currentIndex: nextIndex });
            const nextQuestion = questions[nextIndex];
            setTimeout(() => addMessage({ id: uuidv4(), sender: 'bot', text: nextQuestion.text }), 600);
        } else {
            // Survey finished
            setSurveyState(null);
            finishSurvey(newAnswers);
        }
    }, [surveyState, user, addMessage, playSound]);

    const finishSurvey = async (finalAnswers: SurveyAnswers) => {
        if (!user) return;
        
        setIsLoading(true);
        addMessage({ id: uuidv4(), sender: 'bot', text: "Awesome, all done! Let me prepare your weekly report... This might take a moment. 🧑‍🔬" }, 'message');

        let timeSinceLastCheckin: string | null = null;
        if (history.length > 0 && history[0]?.date) {
            const diffDays = Math.round((new Date().getTime() - new Date(history[0].date).getTime()) / (1000 * 60 * 60 * 24));
            timeSinceLastCheckin = `${diffDays} days ago`;
        }

        const report = await generateWeeklyReport(user.id, chatHistory, settings.aiPersonality, finalAnswers, timeSinceLastCheckin);
        setIsLoading(false);
        
        const newlyUnlocked = checkAndUnlockAchievements(history, finalAnswers);
        const newEntry: HistoryEntry = {
            id: uuidv4(), date: new Date().toISOString(), answers: finalAnswers,
            ...report, unlockedAchievements: newlyUnlocked
        };
        dispatch({ type: 'ADD_HISTORY_ENTRY', payload: newEntry });

        const allNewMessages = [
            ...report.story.map(text => ({ id: uuidv4(), sender: 'bot' as const, text })),
            ...report.feedback.map(text => ({ id: uuidv4(), sender: 'bot' as const, text })),
            ...newlyUnlocked.map(id => ({ id: uuidv4(), sender: 'system' as const, text: `Achievement Unlocked: ${id}` })),
        ];
        
        let delay = 500;
        for (const msg of allNewMessages) {
            setTimeout(() => {
                addMessage(msg, msg.sender === 'system' ? 'achievement' : 'message');
            }, delay);
            delay += 1200; // Stagger the messages
        }
        
        setTimeout(() => {
            dispatch({ type: 'SET_HAS_NEW_REPORT', payload: true });
        }, delay);
    }
    
    if (!user) return null;

    const currentQuestion = surveyState ? surveyState.questions[surveyState.currentIndex] : null;

    return (
        <div className="flex flex-col h-full w-full bg-slate-50">
            <header className="p-4 border-b border-[var(--color-border)] flex-shrink-0 bg-white shadow-sm">
                <h2 className="text-2xl font-extrabold text-[var(--color-text-strong)] text-center">Chat with Dr. Sparkle</h2>
            </header>
            
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
                <div className="space-y-6">
                    {chatHistory.map(msg => (
                       <motion.div 
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                           <MessageBubble message={msg} userAvatar={user.avatar} />
                       </motion.div>
                    ))}
                    {isLoading && <TypingIndicator />}
                    <div ref={messagesEndRef} className="h-1" />
                </div>
            </main>

            <footer className="p-4 border-t border-[var(--color-border)] bg-white/80 backdrop-blur-md">
                {surveyState && currentQuestion ? (
                    <div className="flex flex-col items-center gap-3">
                         {currentQuestion.type === 'choice' ? (
                            <div className="flex flex-wrap justify-center gap-2">
                                {currentQuestion.options?.map(opt => (
                                    <motion.button 
                                      key={opt} 
                                      onClick={() => handleSurveyAnswer(opt)} 
                                      whileHover={{y: -2}}
                                      className="px-4 py-2 rounded-xl font-semibold border-2 bg-white text-slate-700 border-slate-300 hover:border-[var(--color-primary)] hover:bg-violet-50"
                                    >
                                        {opt}
                                    </motion.button>
                                ))}
                            </div>
                         ) : (
                            <form 
                              onSubmit={e => {
                                e.preventDefault();
                                const input = (e.target as HTMLFormElement).elements.namedItem('surveyInput') as HTMLInputElement;
                                handleSurveyAnswer(input.value);
                                input.value = '';
                              }} 
                              className="w-full"
                            >
                                <input 
                                  name="surveyInput" 
                                  className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none" 
                                  placeholder={currentQuestion.placeholder} 
                                  required 
                                  autoComplete="off"
                                />
                            </form>
                         )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <motion.button 
                            onClick={startSurvey}
                            className="w-full text-center py-2.5 px-4 bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold rounded-full hover:bg-violet-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading || isGuest}
                            title={isGuest ? "Sign up to use the weekly check-in" : ""}
                        >
                            Start Weekly Check-in 📝
                        </motion.button>
                        <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
                    </div>
                )}
            </footer>
        </div>
    );
};

export default ChatView;