
import { AppState, AppAction, User } from '../types';
import { APP_VERSION } from '../constants';
import { getSurveyHistory, saveSurveyHistory } from '../services/historyService';
import { getChatHistory, saveChatHistory } from '../services/chatService';
import { updateUser as saveUser } from '../services/userService';

export const initialState: AppState = {
    user: null,
    isGuest: false,
    childView: 'dashboard',
    parentView: 'parentDashboard',
    history: [],
    chatHistory: [],
    selectedHistoryEntry: null,
    selectedChild: null,
    showOnboarding: false,
    showUpdateNotes: false,
    hasNewReport: false,
    isLoading: false,
};

export const appReducer = (state: AppState, action: AppAction): AppState => {
    switch (action.type) {
        case 'LOGIN_START':
            return { ...state, isLoading: true };

        case 'LOGIN_SUCCESS': {
            const { user, isGuest } = action.payload;
            const history = isGuest ? [] : getSurveyHistory(user.id);
            const chatHistory = isGuest ? [] : getChatHistory(user.id);
            const showOnboarding = user.role === 'child' && !isGuest && !user.hasSeenTutorial;
            const showUpdateNotes = !isGuest && !showOnboarding && user.lastSeenVersion !== APP_VERSION;

            return {
                ...state, // Use current state as the base to avoid wiping data
                user,
                isGuest,
                history,
                chatHistory,
                showOnboarding,
                showUpdateNotes,
                isLoading: false,
                // Reset view-specific state on new login
                childView: 'dashboard',
                parentView: 'parentDashboard',
                selectedHistoryEntry: null,
                selectedChild: null,
            };
        }
        
        case 'LOGOUT':
            return { ...initialState };

        case 'SET_CHILD_VIEW':
            return { ...state, childView: action.payload, selectedHistoryEntry: null };

        case 'SET_PARENT_VIEW':
            return { ...state, parentView: action.payload };

        case 'SET_HISTORY':
            return { ...state, history: action.payload };

        case 'ADD_HISTORY_ENTRY': {
            if (!state.user) return state;
            const updatedHistory = [action.payload, ...state.history];
            if (!state.isGuest) {
                saveSurveyHistory(state.user.id, updatedHistory);
            }
            return { ...state, history: updatedHistory };
        }

        case 'SELECT_HISTORY_ENTRY':
            return { ...state, selectedHistoryEntry: action.payload, childView: 'historyDetail' };
        
        case 'SELECT_CHILD':
            return { ...state, selectedChild: action.payload, parentView: 'childDetailView' };

        case 'COMPLETE_ONBOARDING': {
            if (!state.user || state.isGuest) return { ...state, showOnboarding: false };
            const updatedUser: User = { ...action.payload, hasSeenTutorial: true, lastSeenVersion: APP_VERSION };
            saveUser(updatedUser);
            return { ...state, showOnboarding: false, user: updatedUser, showUpdateNotes: false };
        }

        case 'CLOSE_UPDATE_NOTES': {
            if (!state.user) return state;
            if (state.isGuest) return { ...state, showUpdateNotes: false };
            const updatedUser: User = { ...action.payload, lastSeenVersion: APP_VERSION };
            saveUser(updatedUser);
            return { ...state, showUpdateNotes: false, user: updatedUser };
        }
        
        case 'SET_HAS_NEW_REPORT':
            return { ...state, hasNewReport: action.payload };

        case 'UPDATE_USER_STATE': {
            if (!state.user) return state;
            const updatedUser = { ...state.user, ...action.payload };
             if (!state.isGuest) {
                saveUser(updatedUser as User & { id: string });
            }
            return { ...state, user: updatedUser };
        }
        
        case 'SET_CHAT_HISTORY': {
             if (!state.user || state.isGuest) return { ...state, chatHistory: action.payload };
             saveChatHistory(state.user.id, action.payload);
             return { ...state, chatHistory: action.payload };
        }
        
        case 'ADD_CHAT_MESSAGE': {
            if (!state.user) return state;
            const newHistory = [...state.chatHistory, action.payload];
            if (!state.isGuest) {
                saveChatHistory(state.user.id, newHistory);
            }
            return { ...state, chatHistory: newHistory };
        }

        default:
            return state;
    }
};
