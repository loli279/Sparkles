import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, User } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { askGeneralQuestion } from '../services/geminiService';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import { useSound } from '../hooks/useSound';
import { useSettings } from '../contexts/SettingsContext';

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

interface QuestionChatProps {
  user: User;
  onBack: () => void;
}

const QuestionChat: React.FC<QuestionChatProps> = ({ user, onBack }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'initial',
            sender: 'bot',
            text: `Hi ${user.username}! I'm Dr. Sparkle. ✨\n\nWhat's on your mind? You can ask me anything about keeping your teeth healthy and strong!`
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const { playSound } = useSound();
    const { settings } = useSettings();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleSendMessage = useCallback(async (text: string) => {
        playSound('click');
        const userMessage: Message = { id: uuidv4(), sender: 'user', text };
        
        const messageHistoryForApi = [...messages, userMessage];
        setMessages(messageHistoryForApi);
        setIsLoading(true);

        const responseText = await askGeneralQuestion(messageHistoryForApi, settings.aiPersonality, text);
        playSound('message');
        const botMessage: Message = { id: uuidv4(), sender: 'bot', text: responseText };

        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
    }, [playSound, messages, settings.aiPersonality]);
    
    return (
        <div className="p-4 md:p-8 space-y-6 flex flex-col h-full">
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
                    <h2 className="text-3xl font-extrabold text-[var(--color-text-strong)]">Ask Dr. Sparkle</h2>
                    <p className="text-[var(--color-text-secondary)] text-md">Get answers to your dental questions!</p>
                </div>
            </div>

            <div className="flex-grow bg-slate-50 p-4 sm:p-6 rounded-2xl border border-[var(--color-border)] shadow-inner overflow-y-auto">
                 <div className="space-y-6">
                    {messages.map((msg, index) => (
                       <motion.div 
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index === messages.length -1 ? 0.2 : 0 }}
                        >
                           <MessageBubble message={msg} userAvatar={user.avatar} />
                       </motion.div>
                    ))}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                             <div className={`flex items-end gap-3 justify-start`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xl border-2 bg-slate-200 border-slate-300`}>
                                    🦷
                                </div>
                                <div className="px-5 py-3 rounded-2xl inline-block shadow-md bg-white text-[var(--color-text-primary)] rounded-bl-none border border-[var(--color-border)]">
                                    <TypingIndicator />
                                </div>
                             </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="p-2">
                <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
            </div>
        </div>
    );
};

export default QuestionChat;
