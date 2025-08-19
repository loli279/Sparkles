import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Contexts & State
import { useAppContext } from './state/AppContext';
import { SettingsProvider } from './contexts/SettingsContext';

// Components
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import ChatView from './components/ChatView';
import PlayScreen from './components/PlayScreen';
import HistoryList from './components/HistoryList';
import HistoryDetail from './components/HistoryDetail';
import SettingsScreen from './components/SettingsScreen';
import ParentDashboard from './components/ParentDashboard';
import ChildDetailView from './components/ChildDetailView';
import OnboardingFlow from './components/OnboardingFlow';
import UpdateNotesPopup from './components/UpdateNotesPopup';
import SmilePlanCalendar from './components/SmilePlanCalendar';

// Icons
import HomeIcon from './components/icons/HomeIcon';
import PencilSquareIcon from './components/icons/PencilSquareIcon';
import CalendarDaysIcon from './components/icons/CalendarDaysIcon';
import ArchiveBoxIcon from './components/icons/ArchiveBoxIcon';
import Cog6ToothIcon from './components/icons/Cog6ToothIcon';
import LogoutIcon from './components/icons/LogoutIcon';
import PuzzlePieceIcon from './components/icons/PuzzlePieceIcon';


// Services
import { getUnlockedAchievements } from './services/achievementService';
import { useSound } from './hooks/useSound';

// Types
import { ChildView } from './types';
import { APP_VERSION, LATEST_CHANGES } from './constants';

// --- Sub-Components ---

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  hasNotification?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick, hasNotification }) => (
  <button
    onClick={onClick}
    className="relative flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:focus-visible:ring-offset-slate-800 focus-visible:ring-[var(--color-primary)]"
  >
    {isActive && (
      <motion.div
        layoutId="active-nav-indicator"
        className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-lg shadow-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
    )}
     {!isActive && hasNotification && (
      <motion.div
        className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--color-accent)] rounded-full border-2 border-[var(--color-bg-app)]"
        animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        title="New report available!"
      />
    )}
    <div className={`relative z-10 mr-4 flex items-center justify-center transition-colors ${
        isActive ? 'text-[var(--color-primary-text)]' : 'text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]'
    }`}>{icon}</div>
    <span className={`relative z-10 font-bold text-md transition-colors ${
        isActive ? 'text-[var(--color-primary-text)]' : 'text-[var(--color-text-primary)]'
    }`}>{label}</span>
  </button>
);

const NavGroup: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="px-4 pt-6 pb-2 text-xs font-bold uppercase text-[var(--color-text-secondary)] tracking-wider">{title}</h3>
        <div className="space-y-1">
            {children}
        </div>
    </div>
);

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

// --- Main App Components ---

const ChildAppContent: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { playSound } = useSound();
    const { user, isGuest, childView, history, selectedHistoryEntry, hasNewReport } = state;

    const handleNavigate = useCallback((view: ChildView) => {
        playSound('click');
        if (view === 'history') {
            dispatch({ type: 'SET_HAS_NEW_REPORT', payload: false });
        }
        dispatch({ type: 'SET_CHILD_VIEW', payload: view });
    }, [dispatch, playSound]);

    const handleLogout = useCallback(() => {
        playSound('click');
        dispatch({ type: 'LOGOUT' });
    }, [dispatch, playSound]);
    
    if (!user || user.role !== 'child') return null;

    const renderUserContent = () => {
        return (
             <AnimatePresence mode="wait">
                <motion.div
                    key={childView}
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                    className="h-full w-full"
                >
                    {(() => {
                        switch (childView) {
                            case 'chat':
                                return <ChatView />;
                            case 'play':
                                return <PlayScreen />;
                            case 'smilePlan':
                                return <SmilePlanCalendar user={user} isGuest={isGuest} />;
                            case 'history':
                                return <HistoryList history={history} />;
                            case 'historyDetail':
                                return selectedHistoryEntry && <HistoryDetail entry={selectedHistoryEntry} onBack={() => handleNavigate('history')} />;
                            case 'settings':
                                return !isGuest && <SettingsScreen />;
                            case 'dashboard':
                            default:
                                return (
                                    <Dashboard 
                                        user={user}
                                        isGuest={isGuest}
                                        history={history}
                                        achievements={getUnlockedAchievements(history)}
                                        onNavigate={handleNavigate}
                                    />
                                );
                        }
                    })()}
                </motion.div>
            </AnimatePresence>
        );
    };

    return (
        <div className="h-screen w-screen p-2 sm:p-4 flex items-center justify-center font-sans">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full h-full max-w-7xl mx-auto flex bg-[var(--color-bg-app)] rounded-3xl shadow-xl border border-[var(--color-border)] overflow-hidden"
            >
                {/* Sidebar */}
                <aside className="w-64 flex-shrink-0 bg-gradient-to-b from-gray-50/50 to-gray-100/60 dark:from-slate-800/50 dark:to-slate-900/60 border-r border-[var(--color-border-light)] p-4 flex flex-col hidden md:flex">
                    <header className="flex-shrink-0 flex items-center gap-3 p-2 mb-4">
                        <div className="text-4xl">🦷</div>
                        <div>
                            <h1 className="text-2xl font-black text-gradient-primary">Dr. Sparkle</h1>
                        </div>
                    </header>
                    
                    <nav className="flex-grow overflow-y-auto pr-2 -mr-2">
                        <NavGroup title="Main">
                            <NavItem icon={<HomeIcon className="w-6 h-6" />} label="Dashboard" isActive={childView === 'dashboard'} onClick={() => handleNavigate('dashboard')} />
                            <NavItem icon={<PencilSquareIcon className="w-6 h-6" />} label="Chat" isActive={childView === 'chat'} onClick={() => handleNavigate('chat')} />
                            <NavItem icon={<PuzzlePieceIcon className="w-6 h-6" />} label="Play Games" isActive={childView === 'play'} onClick={() => handleNavigate('play')} />
                        </NavGroup>

                        <NavGroup title="My Progress">
                            <NavItem icon={<CalendarDaysIcon className="w-6 h-6" />} label="Smile Plan" isActive={childView === 'smilePlan'} onClick={() => handleNavigate('smilePlan')} />
                            <NavItem icon={<ArchiveBoxIcon className="w-6 h-6" />} label="History" isActive={childView === 'history' || childView === 'historyDetail'} onClick={() => handleNavigate('history')} hasNotification={hasNewReport} />
                        </NavGroup>
                    </nav>

                    <footer className="flex-shrink-0 pt-4 mt-auto border-t border-[var(--color-border-light)]">
                         {!isGuest && (
                             <div className="mb-4">
                                <NavItem icon={<Cog6ToothIcon className="w-6 h-6" />} label="Settings" isActive={childView === 'settings'} onClick={() => handleNavigate('settings')} />
                            </div>
                         )}
                        <div className="p-3 bg-white dark:bg-slate-700 rounded-xl flex items-center gap-4 shadow-sm border border-gray-200/80 dark:border-slate-600/80">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-primary-light)] text-2xl border-2 border-violet-200 flex-shrink-0">
                              {user.avatar}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="font-bold text-md text-slate-800 dark:text-slate-100 truncate">{user.username}</p>
                                <button 
                                    onClick={handleLogout}
                                    className="text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors flex items-center gap-1.5"
                                >
                                    <LogoutIcon className="w-4 h-4" />
                                    <span>{isGuest ? 'End Session' : 'Logout'}</span>
                                </button>
                            </div>
                        </div>
                    </footer>
                </aside>
                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto">
                      {renderUserContent()}
                    </div>
                </main>
            </motion.div>
        </div>
    );
}

const ParentAppContent: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { playSound } = useSound();
    const { user, parentView, selectedChild } = state;

    const handleLogout = useCallback(() => {
        playSound('click');
        dispatch({ type: 'LOGOUT' });
    }, [dispatch, playSound]);

    if (!user || user.role !== 'parent') return null;

    const renderParentContent = () => {
         switch (parentView) {
            case 'childDetailView':
                return selectedChild && <ChildDetailView user={selectedChild} />;
            case 'parentDashboard':
            default:
                return <ParentDashboard parent={user} />;
        }
    }

    return (
        <div className="h-screen w-screen flex flex-col font-sans bg-gray-900">
           <header className="w-full bg-slate-800 text-white p-4 shadow-lg flex justify-between items-center z-10">
                <h1 className="text-2xl font-bold">👤 Parent Dashboard</h1>
                <button onClick={handleLogout} className="font-semibold btn-primary px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">Logout</button>
           </header>
           <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                {renderParentContent()}
           </main>
        </div>
    );
};


const App: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { user, isGuest, showUpdateNotes, showOnboarding } = state;

    const handleUpdateNotesClosed = useCallback(() => {
        if (user) {
            dispatch({ type: 'CLOSE_UPDATE_NOTES', payload: user });
        }
    }, [user, dispatch]);
    
    if (!user) {
        return <LoginScreen />;
    }

    const renderMainContent = () => {
        if (user.role === 'parent') {
            return <ParentAppContent />;
        }
        return (
            <SettingsProvider userId={user.id} isGuest={isGuest}>
                <ChildAppContent />
            </SettingsProvider>
        );
    };

    return (
        <>
            {showOnboarding && <OnboardingFlow />}
            <AnimatePresence>
                {showUpdateNotes && (
                    <UpdateNotesPopup
                        version={APP_VERSION}
                        changes={LATEST_CHANGES}
                        onClose={handleUpdateNotesClosed}
                    />
                )}
            </AnimatePresence>
            {renderMainContent()}
        </>
    );
};

export default App;