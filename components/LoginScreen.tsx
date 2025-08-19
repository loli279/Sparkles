import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import { signIn, signInChild, signUpParent, findUserBySecretCode, resetPassword, signInOrUpWithGoogle } from '../services/userService';
import { handleImportFile } from '../services/backupService';
import { useAppContext } from '../state/AppContext';
import GoogleIcon from './icons/GoogleIcon';

// --- Sub-Components for Login Screen ---

const AVATARS = ['🦷', '✨', '😄', '🌟', '🚀', '🦊', '🦄', '🤖', '🦖', '🐼', '🐯', '🐧'];

type Mode = 'selectRole' | 'parentSignIn' | 'parentSignUp' | 'childSignIn' | 'recovery' | 'signUpSuccess';

const SignUpSuccessPopup: React.FC<{ user: User; onContinue: () => void }> = ({ user, onContinue }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
        className="w-full h-full flex flex-col items-center justify-center text-center p-8"
    >
        <div className="text-7xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-4xl font-black text-slate-800">Account Created!</h2>
        <p className="text-slate-500 my-4 text-lg max-w-md">Welcome, <span className="font-bold text-[var(--color-primary)]">{user.username}</span>! Here is your secret recovery code. Please write it down and keep it somewhere safe!</p>
        <div className="bg-violet-50 border-2 border-dashed border-violet-300 rounded-2xl p-6 my-6 w-full max-w-sm">
            <p className="text-sm text-slate-500 font-semibold">Your Secret Recovery Code:</p>
            <p className="text-3xl font-extrabold text-[var(--color-primary)] tracking-wider my-2">{user.secretCode}</p>
            <p className="text-xs text-slate-400">You will need this code if you ever forget your password.</p>
        </div>
        <button onClick={onContinue} className="w-full max-w-sm mt-4 py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white btn-primary">
            Got it! Let's Go!
        </button>
    </motion.div>
);

const RecoveryForm: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [step, setStep] = useState<'enterCode' | 'showResult' | 'resetPassword'>('enterCode');
    const [secretCode, setSecretCode] = useState('');
    const [foundUser, setFoundUser] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleFindUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const user = findUserBySecretCode(secretCode);
            user ? (setFoundUser(user), setStep('showResult')) : setError("Sorry, that secret code was not found.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!foundUser || !newPassword) return;
        setError(null);
        setIsLoading(true);
        try {
            await resetPassword(foundUser.id, newPassword);
            setSuccessMessage(`Password for "${foundUser.username}" has been updated!`);
            setTimeout(() => onBack(), 3000);
        } catch(err) {
            setError(err instanceof Error ? err.message : "Failed to reset password.");
        } finally {
            setIsLoading(false);
        }
    }

    if (successMessage) {
        return <div className="text-center p-8"><div className="text-5xl mb-4">✅</div><h3 className="text-2xl font-bold text-slate-800">Success!</h3><p className="text-slate-500 mt-2">{successMessage}</p></div>;
    }
    
    const renderContent = () => {
        if (step === 'showResult' && foundUser) {
            return (
                <>
                    <h3 className="text-3xl font-bold text-slate-800">We found you!</h3>
                    <p className="text-slate-500 mt-2">Your username is: <span className="font-bold text-[var(--color-primary)] text-xl">{foundUser.username}</span></p>
                    <form onSubmit={handleResetPassword} className="mt-8 space-y-4">
                        <p className="font-semibold text-slate-600">Enter a new password below.</p>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-2 border-[var(--color-border)] rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]" placeholder="New Password" required />
                        <button type="submit" disabled={isLoading || !newPassword} className="w-full py-3 btn-primary text-white rounded-lg font-bold disabled:opacity-50">{isLoading ? 'Resetting...' : 'Reset Password'}</button>
                    </form>
                </>
            );
        }
        return (
            <>
                <h3 className="text-3xl font-bold text-slate-800">Account Recovery</h3>
                <p className="text-slate-500 mt-2">Enter your special Secret Code to find your account.</p>
                <form onSubmit={handleFindUser} className="mt-8 space-y-4">
                    <input type="text" value={secretCode} onChange={(e) => setSecretCode(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-2 border-[var(--color-border)] rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]" placeholder="e.g., PurpleFoxMoon1234" required />
                    <button type="submit" disabled={isLoading} className="w-full py-3 btn-primary text-white rounded-lg font-bold disabled:opacity-50">{isLoading ? 'Searching...' : 'Find My Account'}</button>
                </form>
            </>
        );
    }
    return <div className="w-full text-center p-4">{renderContent()}<button type="button" onClick={onBack} className="mt-4 text-sm text-slate-500 hover:text-slate-800">Back to Sign In</button>{error && <p className="text-red-600 text-sm mt-2">{error}</p>}</div>;
}

const ParentForm: React.FC<{ onSetMode: (mode: Mode) => void; onSignUpSuccess: (user: User) => void }> = ({ onSetMode, onSignUpSuccess }) => {
    const { dispatch } = useAppContext();
    const [isSignUp, setIsSignUp] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const handleLoginSuccess = useCallback((user: User, isGuest = false) => {
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, isGuest } });
    }, [dispatch]);

    const handleGoogleSignIn = async () => {
        setError(null);
        setIsLoading(true);
        dispatch({ type: 'LOGIN_START' });
        try {
            // This is a simulation. In a real app, you'd use the Google Auth library.
            const mockGoogleUser = { email: 'test.parent@google.com', name: 'Test Parent', avatar: '🌟' };
            const user = await signInOrUpWithGoogle(mockGoogleUser.email, mockGoogleUser.name, mockGoogleUser.avatar);
            handleLoginSuccess(user);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred during Google Sign-In.");
            setIsLoading(false);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        dispatch({ type: 'LOGIN_START' });

        try {
            if (isSignUp) {
                if (!selectedAvatar) throw new Error("Please choose an avatar!");
                const createdUser = await signUpParent(username, password, selectedAvatar);
                onSignUpSuccess(createdUser);
            } else {
                const user = await signIn(username, password);
                handleLoginSuccess(user);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const isSubmitDisabled = isLoading || !username.trim() || !password.trim() || (isSignUp && !selectedAvatar);

    return (
        <div className="w-full max-w-sm mx-auto">
            <button onClick={() => onSetMode('selectRole')} className="text-sm font-semibold text-slate-500 hover:text-slate-800 mb-4">&larr; Back to roles</button>
            <h2 className="text-4xl font-extrabold text-slate-800 text-center">{isSignUp ? 'Parent Account' : 'Parent Sign In'}</h2>
            <p className="text-slate-500 mt-3 mb-8 text-center">{isSignUp ? 'Create an account to get started.' : 'Sign in to manage your family.'}</p>
            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}
            
            <motion.button 
                onClick={handleGoogleSignIn}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border-2 border-[var(--color-border)] rounded-lg font-bold text-[var(--color-text-primary)] shadow-sm hover:border-[var(--color-border-focus)] transition-colors"
            >
                <GoogleIcon className="w-6 h-6" />
                <span>Sign in with Google</span>
            </motion.button>
            
            <div className="my-6 flex items-center">
                <hr className="flex-grow border-t border-slate-300" />
                <span className="mx-4 text-sm font-semibold text-slate-400">OR</span>
                <hr className="flex-grow border-t border-slate-300" />
            </div>

            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-2 border-[var(--color-border)] rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]" placeholder="your-email@example.com" required />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-2 border-[var(--color-border)] rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]" placeholder="••••••••" required />
                    {isSignUp && (
                        <div>
                            <label className="block text-md font-bold text-slate-700 mb-3">Choose your avatar!</label>
                            <div className="grid grid-cols-4 gap-4">
                                {AVATARS.slice(0, 4).map(avatar => (
                                    <button type="button" key={avatar} onClick={() => setSelectedAvatar(avatar)} className={`aspect-square text-4xl rounded-full flex items-center justify-center border-4 transition-all duration-200 transform hover:scale-110 ${selectedAvatar === avatar ? 'border-[var(--color-primary)] bg-violet-100 scale-110 shadow-lg' : 'border-transparent bg-gray-100'}`}>
                                        {avatar}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="mt-8">
                    <button type="submit" disabled={isSubmitDisabled} className="w-full py-4 btn-primary text-white rounded-xl font-bold shadow-lg disabled:opacity-50">{isLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}</button>
                </div>
                <div className="mt-6 text-center space-y-2">
                    <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]">{isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}</button>
                    {!isSignUp && (
                        <div className="flex justify-around items-center text-sm pt-2">
                            <button type="button" onClick={() => onSetMode('recovery')} className="font-semibold text-slate-500 hover:text-slate-800">Forgot Password?</button>
                            <label className="font-semibold text-slate-500 hover:text-slate-800 cursor-pointer">Import Backup<input type="file" accept=".json" onChange={async e => { if (e.target.files?.[0]) { await handleImportFile(e.target.files[0]); window.location.reload(); }}} className="hidden" /></label>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

const ChildForm: React.FC<{ onSetMode: (mode: Mode) => void }> = ({ onSetMode }) => {
    const { dispatch } = useAppContext();
    const [username, setUsername] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const handleLoginSuccess = useCallback((user: User, isGuest = false) => {
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, isGuest } });
    }, [dispatch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        dispatch({ type: 'LOGIN_START' });
        try {
            const user = await signInChild(username, pin);
            handleLoginSuccess(user);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGuestLogin = () => {
        handleLoginSuccess({ id: 'guest', username: 'Friend', avatar: '👋', secretCode: 'N/A', role: 'child' }, true);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
            <button onClick={() => onSetMode('selectRole')} className="text-sm font-semibold text-slate-500 hover:text-slate-800 mb-4">&larr; Back to roles</button>
            <h2 className="text-4xl font-extrabold text-slate-800 text-center">Hi there!</h2>
            <p className="text-slate-500 mt-3 mb-8 text-center">Please enter your username and your 4-digit PIN.</p>
            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}
            <div className="space-y-6">
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-2 border-[var(--color-border)] rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]" placeholder="your-username" required />
                <input type="password" value={pin} onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ''); if (v.length <= 4) setPin(v); }} className="w-full px-4 py-3 bg-gray-50 border-2 border-[var(--color-border)] rounded-lg shadow-inner text-center text-3xl tracking-[1em] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]" placeholder="••••" maxLength={4} required autoComplete="off" />
            </div>
            <div className="mt-10">
                <button type="submit" disabled={isLoading || !username.trim() || pin.length < 4} className="w-full py-4 btn-primary text-white rounded-xl font-bold shadow-lg disabled:opacity-50">{isLoading ? 'Checking...' : "Let's Go!"}</button>
            </div>
            <div className="mt-8 text-center"><button type="button" onClick={handleGuestLogin} className="font-semibold text-slate-500 hover:text-slate-800">Or Continue as a Guest 👋</button></div>
        </form>
    );
};

const RoleSelection: React.FC<{ onSetMode: (mode: Mode) => void }> = ({ onSetMode }) => (
    <div className="text-center">
        <h2 className="text-4xl font-extrabold text-slate-800">Who are you?</h2>
        <p className="text-slate-500 mt-3 mb-8 text-center">Please select your role to continue.</p>
        <div className="space-y-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onSetMode('parentSignIn')} className="w-full p-6 text-left rounded-2xl bg-violet-50 border-2 border-violet-200 hover:border-violet-400 transition-colors flex items-center gap-6"><span className="text-5xl">👤</span><div><p className="text-2xl font-bold text-slate-800">I'm a Parent</p><p className="text-slate-500">Manage accounts and view progress</p></div></motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onSetMode('childSignIn')} className="w-full p-6 text-left rounded-2xl bg-teal-50 border-2 border-teal-200 hover:border-teal-400 transition-colors flex items-center gap-6"><span className="text-5xl">🧒</span><div><p className="text-2xl font-bold text-slate-800">I'm a Child</p><p className="text-slate-500">Log in to chat with Dr. Sparkle!</p></div></motion.button>
        </div>
    </div>
);

// --- Main LoginScreen Component ---

const LoginScreen: React.FC = () => {
    const { dispatch } = useAppContext();
    const [mode, setMode] = useState<Mode>('selectRole');
    const [newUser, setNewUser] = useState<User | null>(null);

    const handleLoginSuccess = useCallback((user: User) => {
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, isGuest: false } });
    }, [dispatch]);
    
    const handleContinueFromSuccess = () => {
        if (newUser) handleLoginSuccess(newUser);
    };

    const renderContent = () => {
        switch(mode) {
            case 'selectRole': return <RoleSelection onSetMode={setMode} />;
            case 'parentSignIn':
            case 'parentSignUp': return <ParentForm onSetMode={setMode} onSignUpSuccess={(user) => { setNewUser(user); setMode('signUpSuccess'); }} />;
            case 'childSignIn': return <ChildForm onSetMode={setMode} />;
            case 'recovery': return <RecoveryForm onBack={() => setMode('parentSignIn')} />;
            case 'signUpSuccess': return newUser && <SignUpSuccessPopup user={newUser} onContinue={handleContinueFromSuccess} />;
            default: return <RoleSelection onSetMode={setMode} />;
        }
    }
    
    return (
        <div className="h-screen w-screen flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-xl flex overflow-hidden min-h-[720px] border border-gray-200/80">
                <div className="w-1/2 bg-gradient-to-br from-indigo-50 to-violet-100 p-12 flex-col justify-center items-center hidden md:flex relative overflow-hidden">
                    <div className="absolute -top-16 -left-16 w-48 h-48 bg-violet-200 rounded-full opacity-50"></div>
                    <div className="absolute -bottom-24 -right-10 w-64 h-64 bg-indigo-200 rounded-full opacity-50"></div>
                    <div className="text-8xl mb-8 animate-float"><div className="relative"><span className="text-9xl">🦷</span><span className="absolute -top-2 -right-4 text-4xl transform rotate-12">✨</span></div></div>
                    <h1 className="text-4xl font-black text-center mb-4 text-gradient-primary">Welcome to Dr. Sparkle</h1>
                    <p className="text-lg text-center text-[var(--color-text-secondary)] max-w-sm">Your personal AI buddy for a super-healthy, super-bright smile!</p>
                </div>
                <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white">
                    <AnimatePresence mode="wait">
                        <motion.div key={mode} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3, type: 'spring', stiffness: 200, damping: 20 }} className="w-full">
                           {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;