import React from 'react';
import { HistoryEntry } from '../types';
import { motion } from 'framer-motion';
import { useAppContext } from '../state/AppContext';

interface HistoryListProps {
  history: HistoryEntry[];
}

const HistoryList: React.FC<HistoryListProps> = ({ history }) => {
  const { dispatch } = useAppContext();

  const handleSelectEntry = (entry: HistoryEntry) => {
    dispatch({ type: 'SELECT_HISTORY_ENTRY', payload: entry });
  };
  
  return (
    <div className="p-8 space-y-6 animate-fade-in h-full">
      <div className="pb-5 border-b border-slate-200">
        <h2 className="text-4xl font-black text-slate-800">Survey History</h2>
        <p className="text-slate-500 mt-2 text-lg">Review your past check-ins and see how far you've come!</p>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-4/5 text-center text-slate-500">
            <span className="text-7xl mb-4">📂</span>
            <p className="font-semibold text-xl">No History Yet</p>
            <p className="mt-1">Complete your first survey to start tracking your progress.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {history.map((entry, index) => (
            <motion.li 
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
            >
              <motion.button
                onClick={() => handleSelectEntry(entry)}
                className="w-full text-left p-5 bg-white rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-shadow duration-200 flex justify-between items-center shadow-md group"
                whileHover={{ y: -3, borderColor: 'var(--color-primary)', boxShadow: 'var(--shadow-lg)'}}
                transition={{ type: 'spring' as const, stiffness: 300 }}
              >
                <div className="flex items-center gap-5">
                    <div className="bg-[var(--color-primary-light)] p-4 rounded-lg text-3xl">
                        <span>📝</span>
                    </div>
                    <div>
                      <p className="font-bold text-lg text-slate-800">Survey from {new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p className="text-sm text-slate-500">{new Date(entry.date).toLocaleTimeString()}</p>
                    </div>
                </div>
                <span className="text-[var(--color-primary)] font-bold text-4xl transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
              </motion.button>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryList;