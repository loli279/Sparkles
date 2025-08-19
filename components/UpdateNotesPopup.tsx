import React from 'react';
import { motion } from 'framer-motion';

interface UpdateNotesPopupProps {
  version: string;
  changes: string[];
  onClose: () => void;
}

const UpdateNotesPopup: React.FC<UpdateNotesPopupProps> = ({ version, changes, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-[var(--color-card-bg)] p-8 rounded-3xl max-w-lg w-full text-center shadow-2xl relative transform border-4 border-white/10"
      >
        <div className="text-7xl mb-4">🚀</div>
        <h2 className="text-3xl font-black text-gradient-primary mb-2">What's New in v{version}</h2>
        <p className="text-[var(--color-text-secondary)] mb-8 text-lg">We've made some improvements to make Dr. Sparkle even better!</p>

        <ul className="space-y-3 text-left mb-10">
          {changes.map((change, index) => (
            <li key={index} className="flex items-start gap-4 p-3 bg-[var(--color-bg-base)] rounded-xl border border-[var(--color-border)]">
              <div className="text-2xl pt-1">✅</div>
              <div>
                <p className="text-[var(--color-text-primary)]">{change}</p>
              </div>
            </li>
          ))}
        </ul>

        <button
          onClick={onClose}
          className="w-full sm:w-auto py-3 px-12 btn-primary text-white rounded-full shadow-lg text-lg font-bold transition-transform transform hover:scale-105 hover:-translate-y-1 focus:outline-none focus:ring-4 ring-offset-2 ring-[var(--color-primary-dark)]"
        >
          Got It!
        </button>
      </motion.div>
    </div>
  );
};

export default UpdateNotesPopup;
