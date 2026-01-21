// utils/constants.js
export const API_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

export const INTERVIEW_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const QUESTION_TYPES = {
  TECHNICAL: 'technical',
  BEHAVIORAL: 'behavioral',
  RESUME_BASED: 'resume_based',
};

export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

export const SCORE_RANGES = {
  EXCELLENT: { min: 9, label: 'Excellent', color: '#10B981' },
  GOOD: { min: 7, max: 8.9, label: 'Good', color: '#3B82F6' },
  AVERAGE: { min: 5, max: 6.9, label: 'Average', color: '#F59E0B' },
  NEEDS_IMPROVEMENT: { min: 0, max: 4.9, label: 'Needs Improvement', color: '#EF4444' },
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['application/pdf'];

export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  INTERVIEW: '/interview',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
};

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  INTERVIEW_SESSION: 'interview_session',
};