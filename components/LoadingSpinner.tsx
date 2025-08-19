
import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8">
      <motion.div
        style={{
          width: 70,
          height: 70,
        }}
      >
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-lg">
          {/* Tooth Body */}
          <motion.path
            d="M20,40 C10,60 10,80 20,100 L35,115 L65,115 L80,100 C90,80 90,60 80,40 C70,20 30,20 20,40 Z"
            fill="#FFFFFF"
            stroke="var(--color-primary)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
          {/* Sparkle */}
          <motion.path
            d="M75,20 L80,5 L85,20 L100,25 L85,30 L80,45 L75,30 L60,25 Z"
            fill="var(--color-accent)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: 360 }}
            transition={{ delay: 0.8, duration: 1, type: 'spring', stiffness: 200, damping: 10 }}
          />
        </svg>
      </motion.div>
      <p className="text-[var(--color-text-secondary)] text-lg font-semibold">
        Dr. Sparkle is preparing your report...
      </p>
    </div>
  );
};

export default LoadingSpinner;