import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getQuizQuestion } from '../services/geminiService';
import { useAppContext } from '../state/AppContext';
import { useSound } from '../hooks/useSound';
import LoadingSpinner from './LoadingSpinner';

interface QuizGameProps {
    onExit: () => void;
}

interface Question {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
}

const QuizGame: React.FC<QuizGameProps> = ({ onExit }) => {
    const { state, dispatch } = useAppContext();
    const { user, isGuest } = state;
    const { playSound } = useSound();

    const [question, setQuestion] = useState<Question | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [score, setScore] = useState(0);

    const fetchQuestion = useCallback(async () => {
        setIsLoading(true);
        setSelectedAnswer(null);
        setIsCorrect(null);
        const q = await getQuizQuestion();
        setQuestion(q);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchQuestion();
    }, [fetchQuestion]);

    const handleAnswer = (index: number) => {
        if (selectedAnswer !== null || !question) return;

        setSelectedAnswer(index);
        const correct = index === question.correctAnswerIndex;
        setIsCorrect(correct);

        if (correct) {
            playSound('achievement');
            const pointsToAdd = 10;
            setScore(s => s + pointsToAdd);
            if (user && !isGuest && user.gameData) {
                const newGameData = { 
                    ...user.gameData, 
                    points: user.gameData.points + pointsToAdd 
                };
                dispatch({ type: 'UPDATE_USER_STATE', payload: { id: user.id, gameData: newGameData } });
            }
        } else {
            playSound('click'); // a less rewarding sound
        }
    };

    const renderButtonState = (index: number) => {
        if (selectedAnswer === null) {
            return 'bg-white hover:bg-violet-50 border-slate-300';
        }
        if (index === question?.correctAnswerIndex) {
            return 'bg-green-100 border-green-400 text-green-800 scale-105';
        }
        if (index === selectedAnswer) {
            return 'bg-red-100 border-red-400 text-red-800';
        }
        return 'bg-slate-100 border-slate-200 opacity-60';
    };

    if (isLoading || !question) {
        return <LoadingSpinner />;
    }

    return (
        <div className="w-full max-w-2xl mx-auto text-center p-4">
            <div className="mb-4 text-right">
                <span className="font-bold text-lg bg-amber-100 text-amber-800 px-4 py-2 rounded-full shadow-sm">
                    ✨ Points: {score + (user?.gameData?.points || 0)}
                </span>
            </div>
            <motion.div initial={{ opacity: 0, y:20 }} animate={{opacity: 1, y: 0}}>
                <h3 className="text-2xl md:text-3xl font-bold text-[var(--color-text-strong)] mb-8">{question.question}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.options.map((option, index) => (
                        <motion.button
                            key={index}
                            onClick={() => handleAnswer(index)}
                            disabled={selectedAnswer !== null}
                            className={`p-4 rounded-xl font-semibold border-2 text-lg transition-all duration-300 ${renderButtonState(index)}`}
                            whileHover={selectedAnswer === null ? { y: -3 } : {}}
                        >
                            {option}
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            <AnimatePresence>
                {isCorrect !== null && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 p-6 rounded-2xl"
                        style={{ background: isCorrect ? 'var(--color-accent-light)' : 'var(--color-warning-light)'}}
                    >
                        <h4 className="text-2xl font-bold" style={{ color: isCorrect ? 'var(--color-accent-dark)' : 'var(--color-warning)'}}>
                            {isCorrect ? 'Correct! (+10 points)' : 'Not Quite!'}
                        </h4>
                        <p className="mt-2 text-[var(--color-text-secondary)]">{question.explanation}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-8 flex justify-center gap-4">
                <button onClick={onExit} className="py-3 px-8 bg-slate-200 text-slate-700 font-bold rounded-full">
                    Back to Menu
                </button>
                {selectedAnswer !== null && (
                     <motion.button
                        onClick={fetchQuestion}
                        className="py-3 px-8 btn-primary text-white font-bold rounded-full shadow-lg"
                        whileHover={{ y: -2 }}
                    >
                        Next Question
                    </motion.button>
                )}
            </div>
        </div>
    );
};

export default QuizGame;
