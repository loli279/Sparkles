import React from 'react';
import { motion } from 'framer-motion';

interface QuickBitesProps {
  fact: string;
  motivationalMessage?: string;
}

const QuickBites: React.FC<QuickBitesProps> = ({ fact, motivationalMessage }) => {
  return (
    <div className="bg-[var(--color-card-bg)] p-6 rounded-2xl shadow-lg border border-[var(--color-border)] h-full flex flex-col gap-6">
      {/* Dental Fact */}
      <div className="flex-1">
        <h4 className="font-bold text-[var(--color-accent-dark)] dark:text-[var(--color-accent)] flex items-center gap-2 mb-2">
            <span role="img" aria-label="lightbulb" className="text-2xl">💡</span>
            <span className="text-xl">Fact of the Day</span>
        </h4>
        <p className="text-[var(--color-text-secondary)] leading-relaxed">{fact}</p>
      </div>

      {motivationalMessage && (
        <>
            <div className="border-t border-[var(--color-border-light)]"></div>
            {/* Motivational Message */}
            <div className="flex-1">
                <h3 className="text-xl font-bold text-[var(--color-text-strong)] mb-2 flex items-center gap-2">Dr. Sparkle's Note ✨</h3>
                <div className="bg-[var(--color-primary-light)] p-4 rounded-lg h-full flex items-center">
                    <p className="text-[var(--color-text-primary)] text-center italic text-md leading-relaxed w-full">"{motivationalMessage}"</p>
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export default QuickBites;
