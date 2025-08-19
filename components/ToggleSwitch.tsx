import React from 'react';
import { motion } from 'framer-motion';

interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: () => void;
  label: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isOn, onToggle, label }) => {
  return (
    <div
      onClick={onToggle}
      className={`flex w-14 h-8 rounded-full items-center p-1 cursor-pointer transition-colors duration-300 ${isOn ? 'bg-[var(--color-primary)] justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'}`}
    >
        <span className="sr-only">{label}</span>
      <motion.div
        className="w-6 h-6 bg-white rounded-full shadow-md"
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
      />
    </div>
  );
};

export default ToggleSwitch;
