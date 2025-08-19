export interface User {
  id:string; // A sanitized version of the user's username
  username: string;
  avatar: string; // The selected emoji avatar
  passwordHash?: string; // Optional for children and provider-based accounts
  salt?: string; // Optional for children and provider-based accounts
  loginPinHash?: string; // For child's 4-digit PIN
  saltPin?: string; // Salt for PIN hash
  secretCode: string; // Kid-friendly code for account recovery
  hasSeenTutorial?: boolean;
  lastSeenVersion?: string;

  // Role-based fields
  role: 'parent' | 'child';
  parentId?: string; // For children
  childIds?: string[]; // For parents
  authProvider?: 'password' | 'google';

  // New Game Data
  gameData?: {
    points: number;
    upgrades: {
      shield: number;
      scanner: number;
    }
  };
}

export type AIPersonality = 'friendly' | 'superhero' | 'robot';

export interface Settings {
  parentEmail: string;
  enableEmailSummary: boolean;
  theme: 'light' | 'dark';
  fontSize: 'sm' | 'md' | 'lg';
  language: 'en' | 'es' | 'fr';
  notifications: boolean;
  aiPersonality: AIPersonality;
}

export interface Message {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  plan?: string[];
}

export interface Question {
  id: string;
  text: string;
  type: 'choice' | 'text';
  options?: string[];
  placeholder?: string;
}

export type SurveyAnswers = {
  [key: string]: string;
};

export interface HistoryEntry {
  id: string;
  date: string;
  answers: SurveyAnswers;
  feedback: string[];
  story: string[];
  profile: string;
  motivationalMessage?: string;
  unlockedAchievements: AchievementID[];
}

export type AchievementID = 
  | 'FIRST_CHAT'
  | 'CONSISTENT_BRUSHER'
  | 'FLOSS_CHAMPION'
  | 'SUPER_SMILE_STREAK'
  | 'HEALTHY_HYDRATOR'
  | 'DENTIST_FAN'
  | 'BRUSHING_STREAK_3'
  | 'BRUSHING_STREAK_7'
  | 'BRUSHING_STREAK_14';

export interface Achievement {
  id: AchievementID;
  name: string;
  description: string;
  icon: string;
}

export interface DayPlan {
    tip: string;
    foodSuggestion: string;
}

export interface WeeklySmilePlan {
    Monday: DayPlan;
    Tuesday: DayPlan;
    Wednesday: DayPlan;
    Thursday: DayPlan;
    Friday: DayPlan;
    Saturday: DayPlan;
    Sunday: DayPlan;
}

export interface AppBackup {
  source: 'DrSparkleApp';
  version: string;
  exportDate: string;
  data: {
    users: Record<string, User>;
    histories: Record<string, HistoryEntry[]>;
    settings: Record<string, Settings>;
    plans: Record<string, WeeklySmilePlan | null>;
    chatHistories: Record<string, Message[]>;
  }
}

// ===================================
//  Centralized State Management Types
// ===================================

export type ChildView = 'dashboard' | 'chat' | 'history' | 'historyDetail' | 'settings' | 'smilePlan' | 'play';
export type ParentView = 'parentDashboard' | 'childDetailView';

export interface AppState {
    user: User | null;
    isGuest: boolean;
    childView: ChildView;
    parentView: ParentView;
    history: HistoryEntry[];
    chatHistory: Message[];
    selectedHistoryEntry: HistoryEntry | null;
    selectedChild: User | null;
    showOnboarding: boolean;
    showUpdateNotes: boolean;
    hasNewReport: boolean;
    isLoading: boolean;
}

export type AppAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; isGuest: boolean } }
  | { type: 'LOGOUT' }
  | { type: 'SET_CHILD_VIEW'; payload: ChildView }
  | { type: 'SET_PARENT_VIEW'; payload: ParentView }
  | { type: 'SET_HISTORY'; payload: HistoryEntry[] }
  | { type: 'ADD_HISTORY_ENTRY'; payload: HistoryEntry }
  | { type: 'SELECT_HISTORY_ENTRY'; payload: HistoryEntry }
  | { type: 'SELECT_CHILD'; payload: User }
  | { type: 'COMPLETE_ONBOARDING'; payload: User }
  | { type: 'CLOSE_UPDATE_NOTES'; payload: User }
  | { type: 'SET_HAS_NEW_REPORT'; payload: boolean }
  | { type: 'UPDATE_USER_STATE'; payload: Partial<User> }
  | { type: 'SET_CHAT_HISTORY'; payload: Message[] }
  | { type: 'ADD_CHAT_MESSAGE'; payload: Message };