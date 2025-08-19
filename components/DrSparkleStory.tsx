
import React, { useState } from 'react';
import { useSound } from '../hooks/useSound';
import { motion, AnimatePresence } from 'framer-motion';

interface DrSparkleStoryProps {
  onStartSurvey: () => void;
}

const storyParts = [
    {
        icon: '🤫',
        text: "Hey there, Smile Superhero! Dr. Sparkle here. Let me tell you a secret: your teeth have a super-strong armor called **enamel**. It's the hardest stuff in your whole body!"
    },
    {
        icon: '👾',
        text: "But even superheroes have a weakness! Enamel's weakness is the sneaky **Sugar Gremlins**. They party on leftover sweets and make a sticky mess called **plaque**. That's how cavities start!"
    },
    {
        icon: '🛡️',
        text: "Your mission is to protect your enamel armor! Your toothbrush is a super-scrubber, and brushing for **2 whole minutes** is how you send those gremlins packing! 🪥"
    },
    {
        icon: '🎯',
        text: "Ready to check on your armor and make sure your smile is safe and strong? Let's start our first mission together!"
    }
];

const storyVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 15 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const DrSparkleStory: React.FC<DrSparkleStoryProps> = ({ onStartSurvey }) => {
    const [currentPart, setCurrentPart] = useState(0);
    const { playSound } = useSound();

    const handleNextPart = () => {
        playSound('click');
        if (currentPart < storyParts.length - 1) {
            setCurrentPart(currentPart + 1);
        } else {
            onStartSurvey();
        }
    }

    return (
        <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] p-6 rounded-2xl shadow-xl text-white flex flex-col h-full">
            <h3 className="text-3xl font-extrabold mb-4 text-center">The Legend of the Sugar Gremlins!</h3>
            <div className="flex-grow flex flex-col justify-center min-h-[220px]">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentPart}
                        variants={storyVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="flex flex-col items-center text-center"
                    >
                        <motion.div 
                            className="text-6xl mb-4 drop-shadow-md"
                            initial={{scale: 0.5, rotate: -20}}
                            animate={{scale: 1, rotate: 0}}
                            transition={{type: 'spring' as const, stiffness: 180, damping: 12}}
                        >
                            {storyParts[currentPart].icon}
                        </motion.div>
                        <p 
                            className="opacity-95 leading-relaxed text-lg"
                            dangerouslySetInnerHTML={{ __html: storyParts[currentPart].text }}
                        >
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="mt-6 text-center">
                <motion.button
                    onClick={handleNextPart}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 py-4 px-8 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white rounded-full shadow-lg text-lg font-bold"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <span>{currentPart < storyParts.length - 1 ? 'Tell Me More!' : "Start My First Mission!"}</span>
                </motion.button>
            </div>
        </div>
    );
};

export default DrSparkleStory;