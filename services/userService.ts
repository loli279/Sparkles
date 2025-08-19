import { User } from '../types';
import { generateSecretCode } from '../utils/secretCodeGenerator';
import { getFromStorage, saveToStorage } from '../utils/storage';

const USERS_STORAGE_KEY = 'dentalBuddyUsers';

// --- Cryptography Helpers ---
const bufToHex = (buffer: ArrayBuffer) => Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');

const hexToBuf = (hex: string): ArrayBuffer => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes.buffer;
};

const generateSalt = (): string => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return bufToHex(array.buffer);
};

const hashValue = async (value: string, salt: string): Promise<string> => {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(value),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: hexToBuf(salt),
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        256
    );
    return bufToHex(bits);
};

// --- User Management ---
export const getUsers = (): Record<string, User> => {
    return getFromStorage<Record<string, User>>(USERS_STORAGE_KEY, {});
};

export const saveUsers = (users: Record<string, User>): void => {
    saveToStorage(USERS_STORAGE_KEY, users);
};

const defaultGameData = {
  points: 0,
  upgrades: { shield: 0, scanner: 0 },
};

export const signUpParent = async (username: string, password: string, avatar: string): Promise<User> => {
    const users = getUsers();
    const userId = username.toLowerCase().trim();

    if (!userId || !password || !avatar) {
        throw new Error("Username, password, and avatar are required.");
    }
    
    if (users[userId]) {
        throw new Error("Username already exists. Please choose another one or sign in.");
    }
    
    const salt = generateSalt();
    const passwordHash = await hashValue(password, salt);
    const secretCode = generateSecretCode();
    
    const newUser: User = {
        id: userId,
        username: username.trim(),
        avatar,
        passwordHash,
        salt,
        secretCode,
        role: 'parent',
        childIds: [],
        hasSeenTutorial: true,
        authProvider: 'password'
    };

    users[userId] = newUser;
    saveUsers(users);
    
    return newUser;
};

export const signInOrUpWithGoogle = async (email: string, name: string, avatar: string): Promise<User> => {
    const users = getUsers();
    const userId = email.toLowerCase().trim();

    // If user exists, just return them
    const existingUser = users[userId];
    if (existingUser) {
        if (existingUser.authProvider !== 'google') {
            throw new Error("This email is already registered with a password. Please sign in using your password.");
        }
        return existingUser;
    }

    // Otherwise, create a new user
    const secretCode = generateSecretCode();
    const newUser: User = {
        id: userId,
        username: name.trim(),
        avatar,
        secretCode,
        role: 'parent',
        childIds: [],
        hasSeenTutorial: true,
        authProvider: 'google',
    };

    users[userId] = newUser;
    saveUsers(users);
    return newUser;
}

export const createChildAccount = async (parent: User, username: string, avatar: string): Promise<{ user: User; pin: string, updatedParent: User }> => {
    const users = getUsers();
    const childId = username.toLowerCase().trim();
    
    if (users[childId]) {
        throw new Error("This username is already taken. Please choose another.");
    }

    const saltPin = generateSalt();
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const loginPinHash = await hashValue(pin, saltPin);

    const newChild: User = {
        id: childId,
        username,
        avatar,
        loginPinHash,
        saltPin,
        secretCode: 'N/A',
        role: 'child',
        parentId: parent.id,
        hasSeenTutorial: false,
        gameData: defaultGameData,
    };

    users[childId] = newChild;
    
    let updatedParent: User = parent;
    const parentUser = users[parent.id];
    if (parentUser) {
        parentUser.childIds = [...(parentUser.childIds || []), newChild.id];
        users[parent.id] = parentUser;
        updatedParent = parentUser;
    }

    saveUsers(users);
    return { user: newChild, pin, updatedParent };
};

export const signIn = async (username: string, password: string): Promise<User> => {
    const users = getUsers();
    const userId = username.toLowerCase().trim();
    const user = users[userId];

    if (!user) throw new Error("Username not found. Have you signed up yet?");
    if (user.role !== 'parent') throw new Error("This form is for parent accounts. Please use the child login.");
    
    if (user.authProvider === 'google') {
        throw new Error("This account was created with Google Sign-In. Please use the Google Sign-In button.");
    }

    if (!user.salt || !user.passwordHash) {
        throw new Error("Your account is not secure. Please try resetting your password.");
    }

    const passwordHash = await hashValue(password, user.salt);
    if (passwordHash !== user.passwordHash) throw new Error("Incorrect password. Please try again.");

    return user;
};

export const signInChild = async (username: string, pin: string): Promise<User> => {
    const users = getUsers();
    const userId = username.toLowerCase().trim();
    const user = users[userId];
    
    if (!user) throw new Error("Username not found. Please ask your parent to check the username.");
    if (user.role !== 'child' || !user.saltPin || !user.loginPinHash) throw new Error("This account is not a valid child account.");
    
    const pinHash = await hashValue(pin, user.saltPin);
    if (pinHash !== user.loginPinHash) throw new Error("Incorrect PIN. Please try again.");
    
    // Ensure gameData exists for older users
    if (!user.gameData) {
        user.gameData = defaultGameData;
    }

    return user;
};

export const findUserBySecretCode = (secretCode: string): User | null => {
    if (!secretCode.trim()) return null;
    const users = getUsers();
    const normalizedCode = secretCode.toLowerCase().trim();
    
    return Object.values(users).find(user => 
        user.role === 'parent' && user.secretCode?.toLowerCase() === normalizedCode
    ) || null;
}

export const resetPassword = async (userId: string, newPassword: string): Promise<void> => {
    if(!userId || !newPassword) throw new Error("User ID and new password are required.");
    
    const users = getUsers();
    const user = users[userId];

    if (!user || user.role !== 'parent' || !user.salt) throw new Error("User not found or not eligible for password reset.");

    user.passwordHash = await hashValue(newPassword, user.salt);
    users[userId] = user;
    saveUsers(users);
}

export const updateUser = (updatedUser: Partial<User> & { id: string }): void => {
    if (!updatedUser?.id || updatedUser.id === 'guest') return;
    const users = getUsers();
    if (users[updatedUser.id]) {
        users[updatedUser.id] = { ...users[updatedUser.id], ...updatedUser };
        saveUsers(users);
    }
};

export const deleteUser = (userId: string): void => {
    if (!userId) return;
    const users = getUsers();
    if (users[userId]) {
        delete users[userId];
        saveUsers(users);
    }
};