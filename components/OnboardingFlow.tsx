
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../hooks/useSound';
import { useAppContext } from '../state/AppContext';

const onboardingSteps = [
  {
    icon: '👋',
    title: "Hello there!",
    text: "Hi! I'm Dr. Sparkle, your personal AI dental buddy! I'm so excited to help you on your journey to a super-bright, super-healthy smile!",
  },
  {
    icon: '📝',
    title: "Weekly Check-ins",
    text: "Each week, we'll do a quick check-in. You'll answer a few simple questions about your dental habits. It's super fast and easy!",
  },
  {
    icon: '✨',
    title: "Personalized Tips",
    text: "Based on your answers, I'll give you personalized tips and a fun report to help you take the best care of your teeth. We're a team!",
  },
  {
    icon: '🏆',
    title: "Unlock Achievements",
    text: "For being awesome and keeping up with your habits, you'll unlock cool achievements and badges. Let's see if you can collect them all!",
  },
  {
    icon: '🚀',
    title: "Ready to Start?",
    text: "That's it! Your dashboard is all set up and waiting for you. Let's get started on our first adventure together!",
  },
];

const stepVariants = {
  initial: { opacity: 0, y: 30, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 200, damping: 20 } },
  exit: { opacity: 0, y: -30, scale: 0.9, transition: { duration: 0.2 } },
};


const OnboardingFlow: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { user } = state;
  const [step, setStep] = useState(0);
  const { playSound } = useSound();
  
  const handleComplete = useCallback(() => {
    if (user) {
        dispatch({ type: 'COMPLETE_ONBOARDING', payload: user });
    }
  }, [user, dispatch]);

  const handleNext = () => {
    playSound('click');
    if (step < onboardingSteps.length - 1) {
      setStep(step + 1);
    } else {
      playSound('complete');
      handleComplete();
    }
  };

  if (!user || !state.showOnboarding) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 font-sans bg-gradient-to-br from-violet-200 via-indigo-200 to-sky-200">
        <style>{`
          @keyframes gradient-animation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animated-gradient {
            background: linear-gradient(-45deg, #a855f7, #6366f1, #38bdf8, #6ee7b7);
            background-size: 400% 400%;
            animation: gradient-animation 15s ease infinite;
          }
        `}</style>
      <div className="relative w-full h-full flex flex-col justify-between items-center py-10">
        <AnimatePresence mode="wait">
            <motion.div
                key={step}
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-col items-center text-center text-white"
            >
                <motion.div 
                    className="text-8xl mb-6 drop-shadow-lg"
                    initial={{scale: 0.5, rotate: -20}}
                    animate={{scale: 1, rotate: 0}}
                    transition={{type: 'spring' as const, delay: 0.2, stiffness: 150}}
                >
                    {onboardingSteps[step].icon}
                </motion.div>
                
                <h2 className="text-5xl font-black text-white drop-shadow-md mb-4">{onboardingSteps[step].title}</h2>
                
                <p className="text-white/90 text-xl max-w-lg">{onboardingSteps[step].text}</p>
            </motion.div>
        </AnimatePresence>
        
        <div className="flex flex-col items-center">
            {/* Progress Dots */}
            <div className="flex justify-center gap-3 mb-8">
                {onboardingSteps.map((_, index) => (
                    <div 
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === step ? 'bg-white scale-125' : 'bg-white/40'}`}
                    />
                ))}
            </div>

            <motion.button
              onClick={handleNext}
              className="py-4 px-16 bg-white/90 text-[var(--color-primary)] rounded-full shadow-2xl text-xl font-bold transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 ring-offset-4 ring-offset-transparent ring-white/50 backdrop-blur-sm"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              {step === onboardingSteps.length - 1 ? "Let's Go! 🚀" : 'Next'}
            </motion.button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
