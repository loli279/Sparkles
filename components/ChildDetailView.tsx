
import React, { useState, useEffect } from 'react';
import { User, HistoryEntry, Settings } from '../types';
import { getSurveyHistory } from '../services/historyService';
import { getSettings } from '../services/settingsService';
import HistoryDetail from './HistoryDetail';
import { useAppContext } from '../state/AppContext';

interface ChildDetailViewProps {
  user: User; // This will be the child user object
}

const ChildDetailView: React.FC<ChildDetailViewProps> = ({ user }) => {
  const { dispatch } = useAppContext();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

  useEffect(() => {
    setHistory(getSurveyHistory(user.id));
    setSettings(getSettings(user.id));
  }, [user]);

  const handleBackToParentDashboard = () => {
    dispatch({ type: 'SET_PARENT_VIEW', payload: 'parentDashboard' });
  };
  
  if (selectedEntry) {
    return (
        <div className="bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-700">
            <div className="bg-white rounded-xl overflow-hidden">
             {/* The HistoryDetail component is designed for light mode, so this wrapper works well */}
             <HistoryDetail entry={selectedEntry} onBack={() => setSelectedEntry(null)} />
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-gray-200">
      <div className="flex items-center gap-4">
        <button
          onClick={handleBackToParentDashboard}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors text-2xl"
        >
          &larr;
        </button>
        <div className="flex items-center gap-4">
           <div className="w-16 h-16 text-4xl rounded-full flex items-center justify-center bg-gray-700 border-4 border-gray-600">
                {user.avatar}
            </div>
            <div>
                <h2 className="text-3xl font-bold text-white">{user.username}'s Progress</h2>
                <p className="text-gray-400 font-mono">Child Account</p>
            </div>
        </div>
      </div>
      
      {/* Settings Info */}
      <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700">
        <h3 className="text-2xl font-bold text-white mb-4">Child's Settings</h3>
        {settings ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-300">
            <div><p className="font-semibold text-gray-400">Theme</p><p className="font-bold text-lg">{settings.theme}</p></div>
            <div><p className="font-semibold text-gray-400">Font Size</p><p className="font-bold text-lg">{settings.fontSize}</p></div>
            <div><p className="font-semibold text-gray-400">Notifications</p><p className={`font-bold text-lg ${settings.notifications ? 'text-green-400' : 'text-red-400'}`}>{settings.notifications ? 'Enabled' : 'Disabled'}</p></div>
          </div>
        ) : (
            <p className="text-gray-500">Could not load settings.</p>
        )}
      </div>

      {/* History List */}
      <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700">
        <h3 className="text-2xl font-bold text-white mb-4">Survey History ({history.length})</h3>
        {history.length > 0 ? (
           <ul className="space-y-3">
              {history.map(entry => (
                <li key={entry.id}>
                  <button
                    onClick={() => setSelectedEntry(entry)}
                    className="w-full text-left p-4 bg-gray-900/50 rounded-lg border-2 border-gray-700 hover:border-violet-500 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-violet-500 transition-all duration-200 flex justify-between items-center group"
                  >
                    <div>
                      <p className="font-bold text-white">Survey from {new Date(entry.date).toLocaleString()}</p>
                      <p className="text-sm text-gray-400">Profile: "{entry.profile}"</p>
                    </div>
                    <span className="text-violet-400 font-bold text-3xl transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
                  </button>
                </li>
              ))}
           </ul>
        ) : (
             <div className="text-center text-gray-500 py-8 bg-gray-900/40 rounded-lg">
                <p className="font-semibold">This child has not completed any check-ins yet.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ChildDetailView;