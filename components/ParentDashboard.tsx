
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { getChildrenForParent, removeChild } from '../services/parentService';
import { createChildAccount } from '../services/userService';
import { getSurveyHistory } from '../services/historyService';
import { triggerExportDownload, handleImportFile } from '../services/backupService';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../state/AppContext';

const AVATARS = ['🦷', '✨', '😄', '🌟', '🚀', '🦊', '🦄', '🤖', '🦖', '🐼', '🐯', '🐧'];

interface ParentDashboardProps {
  parent: User;
}

const ChildCreationSuccessModal: React.FC<{ child: User, pin: string, onClose: () => void }> = ({ child, pin, onClose }) => (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl border border-gray-700"
        >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white">Account Created!</h2>
            <p className="text-gray-400 my-4">Here are the login details for <span className="font-bold text-violet-400">{child.username}</span>. Please save them somewhere safe!</p>
            <div className="bg-gray-900/50 border-2 border-dashed border-gray-700 rounded-xl p-6 my-6 w-full">
                <div className="mb-4">
                    <p className="text-sm text-gray-500 font-semibold">Username:</p>
                    <p className="text-2xl font-extrabold text-white tracking-wider my-1">{child.username}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-semibold">4-Digit PIN:</p>
                    <p className="text-4xl font-extrabold text-violet-400 tracking-[0.2em] my-1">{pin}</p>
                </div>
            </div>
            <button
                onClick={onClose}
                className="w-full mt-4 py-3 px-4 bg-violet-600 text-white rounded-lg shadow-lg text-lg font-bold hover:bg-violet-500 transition-colors"
            >
                All Done!
            </button>
        </motion.div>
    </div>
);

const AddChildForm: React.FC<{ parent: User; onChildAdded: (child: User, pin: string) => void }> = ({ parent, onChildAdded }) => {
    const { dispatch } = useAppContext();
    const [newChildUsername, setNewChildUsername] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
    const [error, setError] = useState<string | null>(null);

    const handleAddChild = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const { user: newChild, pin, updatedParent } = await createChildAccount(parent, newChildUsername, selectedAvatar);
            dispatch({ type: 'UPDATE_USER_STATE', payload: updatedParent });
            onChildAdded(newChild, pin);
            setNewChildUsername('');
        } catch(err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }
    };

    return (
        <motion.form 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            onSubmit={handleAddChild}
            className="bg-gray-700/50 p-6 rounded-lg mb-6 border border-gray-600 space-y-4"
        >
            <h3 className="text-xl font-bold text-white">Create a New Child Account</h3>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div>
                <input type="text" value={newChildUsername} onChange={e => setNewChildUsername(e.target.value)} placeholder="Child's Username" className="w-full bg-gray-800 p-2 rounded border border-gray-600 focus:ring-violet-500 focus:border-violet-500 text-white" required />
            </div>
            <div>
                <p className="font-semibold mb-2 text-gray-300">Choose an Avatar</p>
                <div className="flex flex-wrap gap-2">
                    {AVATARS.map(avatar => (
                        <button type="button" key={avatar} onClick={() => setSelectedAvatar(avatar)} className={`w-12 h-12 text-3xl rounded-full flex items-center justify-center border-2 ${selectedAvatar === avatar ? 'border-violet-400 bg-gray-600' : 'border-transparent'}`}>
                            {avatar}
                        </button>
                    ))}
                </div>
            </div>
            <button type="submit" className="w-full md:w-auto bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-500 transition-colors">Create Account</button>
        </motion.form>
    );
};


const ParentDashboard: React.FC<ParentDashboardProps> = ({ parent }) => {
  const { dispatch } = useAppContext();
  const [children, setChildren] = useState<User[]>([]);
  const [historyCounts, setHistoryCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [createdChildInfo, setCreatedChildInfo] = useState<{ child: User; pin: string } | null>(null);

  const fetchChildren = useCallback(() => {
    setIsLoading(true);
    const childUsers = getChildrenForParent(parent.id);
    setChildren(childUsers);
    
    const counts: Record<string, number> = {};
    childUsers.forEach(child => {
      counts[child.id] = getSurveyHistory(child.id).length;
    });
    setHistoryCounts(counts);
    setIsLoading(false);

    if (childUsers.length === 0) {
        setIsAddingChild(true);
    }
  }, [parent.id]);

  useEffect(() => {
    fetchChildren();
  }, [parent, fetchChildren]);
  
  const handleDeleteChild = async (child: User) => {
    if (window.confirm(`Are you sure you want to permanently delete the account for "${child.username}"? This will erase all their data and cannot be undone.`)) {
        try {
            const updatedParent = removeChild(parent, child.id);
            dispatch({ type: 'UPDATE_USER_STATE', payload: updatedParent });
        } catch (error) {
            console.error("Failed to delete child:", error);
            alert("Could not delete child account. See console for details.");
        }
    }
  };

  const handleChildAdded = (child: User, pin: string) => {
      setCreatedChildInfo({ child, pin });
      setIsAddingChild(false);
  }

  const handleExportClick = () => {
    triggerExportDownload();
  };

  const handleImportChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        try {
            await handleImportFile(file);
            alert('Data imported successfully! The dashboard will now refresh.');
            window.location.reload();
        } catch (err) {
            alert(`Error importing data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
        event.target.value = '';
    }
  };

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {createdChildInfo && (
            <ChildCreationSuccessModal
                child={createdChildInfo.child}
                pin={createdChildInfo.pin}
                onClose={() => setCreatedChildInfo(null)}
            />
        )}
      </AnimatePresence>
      <div className="bg-gray-800/50 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-700 animate-fade-in text-gray-200">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-3xl font-bold text-white mb-1">Your Family</h2>
                <p className="text-gray-400 mb-6">Manage your children's accounts and view their progress.</p>
            </div>
            <button onClick={() => setIsAddingChild(!isAddingChild)} className="bg-violet-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-violet-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-violet-500">
                {isAddingChild ? 'Cancel' : 'Add Child'}
            </button>
        </div>
        
        <AnimatePresence>
            {isAddingChild && <AddChildForm parent={parent} onChildAdded={handleChildAdded} />}
        </AnimatePresence>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-300">
            <thead className="bg-gray-700/50 text-xs text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold">Avatar</th>
                <th className="p-4 font-semibold">Username</th>
                <th className="p-4 font-semibold">Check-ins</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {isLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center p-8">
                        <div className="flex justify-center items-center gap-3 text-gray-400">
                            <svg className="animate-spin h-6 w-6 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-lg font-semibold">Loading Family...</span>
                        </div>
                    </td>
                  </tr>
              ) : children.length > 0 ? children.map(child => (
                <tr key={child.id} className="hover:bg-gray-700/40">
                  <td className="p-4"><div className="w-10 h-10 text-2xl rounded-full flex items-center justify-center bg-gray-700">{child.avatar}</div></td>
                  <td className="p-4 font-bold text-white">{child.username}</td>
                  <td className="p-4 font-semibold text-lg">{historyCounts[child.id] || 0}</td>
                  <td className="p-4 flex items-center gap-2">
                    <button onClick={() => dispatch({type: 'SELECT_CHILD', payload: child})} className="bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-sky-500 transition-colors text-sm">View Progress</button>
                    <button onClick={() => handleDeleteChild(child)} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-500 transition-colors text-sm">Delete</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="text-center p-8 text-gray-500">No children added yet. Click 'Add Child' to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-gray-800/50 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-700 text-gray-200">
        <h2 className="text-3xl font-bold text-white mb-1">Backup &amp; Restore</h2>
        <p className="text-gray-400 mb-6">Save all your family's data to a file or restore from a backup.</p>
        <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={handleExportClick} className="bg-green-600 text-white font-semibold px-5 py-3 rounded-lg hover:bg-green-500 transition-colors flex-1">Export All Data</button>
             <label className="bg-sky-600 text-white font-semibold px-5 py-3 rounded-lg hover:bg-sky-500 transition-colors cursor-pointer text-center flex-1">
                Import from Backup
                <input type="file" accept=".json" onChange={handleImportChange} className="hidden" />
            </label>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
