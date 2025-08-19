import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuizGame from './QuizGame';
import GremlinSweeper from './GremlinSweeper';
import { useAppContext } from '../state/AppContext';

type PlayView = 'menu' | 'quiz' | 'sweeper';

const Card: React.FC<{ onClick: () => void, title: string, description: string, icon: string, disabled?: boolean, tag?: string }> = 
({ onClick, title, description, icon, disabled, tag }) => (
    <motion.button
        onClick={onClick}
        disabled={disabled}
        className="relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-[var(--color-border)] text-left w-full h-full flex flex-col items-start hover:border-[var(--color-primary)] hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.98 }}
    >
        {tag && <div className="absolute top-4 right-4 bg-accent-light text-accent-dark text-xs font-bold px-2 py-1 rounded-full">{tag}</div>}
        <div className="text-5xl mb-4">{icon}</div>
        <h3 className="text-2xl font-bold text-[var(--color-text-strong)]">{title}</h3>
        <p className="text-md text-[var(--color-text-secondary)] mt-2 flex-grow">{description}</p>
        <div className="mt-4 text-[var(--color-primary)] font-bold flex items-center gap-2">
            Play Now <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
        </div>
    </motion.button>
);

const PlayScreen: React.FC = () => {
    const { state } = useAppContext();
    const [view, setView] = useState<PlayView>('menu');

    const renderContent = () => {
        switch (view) {
            case 'quiz':
                return <QuizGame onExit={() => setView('menu')} />;
            case 'sweeper':
                return <GremlinSweeper onExit={() => setView('menu')} />;
            case 'menu':
            default:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card 
                            onClick={() => setView('quiz')}
                            icon="🧠"
                            title="Dental Quiz"
                            description="Answer fun trivia questions to earn points for the Gremlin Sweeper game!"
                        />
                        <Card 
                            onClick={() => setView('sweeper')}
                            icon="👾"
                            title="Gremlin Sweeper"
                            description="Use your smarts to find the hidden Sugar Gremlins without getting a cavity! Like Minesweeper, but for your teeth."
                            disabled={state.isGuest}
                            tag={state.isGuest ? "Sign up to play" : undefined}
                        />
                    </div>
                );
        }
    }

    return (
        <div className="p-4 md:p-8 space-y-6 animate-fade-in h-full flex flex-col">
            <header className="pb-5 border-b border-[var(--color-border)] flex-shrink-0">
                <h2 className="text-4xl font-black text-[var(--color-text-strong)]">Play Zone</h2>
                <p className="text-[var(--color-text-secondary)] mt-2 text-lg">Have fun while learning about dental health!</p>
            </header>
            <main className="flex-grow flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="w-full"
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default PlayScreen;
