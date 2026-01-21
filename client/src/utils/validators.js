// utils/validators.js
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateName = (name) => {
  return name.trim().length >= 2;
};

export const validateResumeFile = (file) => {
  if (!file) return { isValid: false, error: 'Please select a file' };
  
  if (!file.type.includes('pdf')) {
    return { isValid: false, error: 'Only PDF files are allowed' };
  }
  
  if (file.size > 5 * 1024 * 1024) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }
  
  return { isValid: true, error: null };
};

export const validateAnswer = (answer) => {
  const trimmed = answer.trim();
  if (trimmed.length < 10) {
    return { isValid: false, error: 'Answer must be at least 10 characters' };
  }
  if (trimmed.length > 5000) {
    return { isValid: false, error: 'Answer must be less than 5000 characters' };
  }
  return { isValid: true, error: null };
};

export const getScoreColor = (score) => {
  if (score >= 9) return '#10B981'; // Green
  if (score >= 7) return '#3B82F6'; // Blue
  if (score >= 5) return '#F59E0B'; // Orange
  return '#EF4444'; // Red
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const calculateDuration = (start, end) => {
  const startTime = new Date(start);
  const endTime = new Date(end);
  const diffMs = endTime - startTime;
  const minutes = Math.floor(diffMs / 60000);
  return minutes > 0 ? `${minutes} min` : '< 1 min';
};