// Types
export interface Checkin {
  id: string;
  user_name: string;
  user_email: string;
  matricula: string;
  created_at: string;
}

export interface WordEntry {
  id: string;
  text: string;
  created_at: string;
}

export interface Evaluation {
  id: string;
  rating_general: number;
  best_moment: string;
  improvements: string;
  team_energy: string;
  phrase_completion: string;
  user_name: string;
  created_at: string;
}

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

// Checkins
export const getCheckins = (): Checkin[] => {
  const data = localStorage.getItem('checkins');
  return data ? JSON.parse(data) : [];
};

export const addCheckin = (checkin: Omit<Checkin, 'id' | 'created_at'>): Checkin => {
  const checkins = getCheckins();
  const newCheckin: Checkin = {
    ...checkin,
    id: generateId(),
    created_at: new Date().toISOString()
  };
  checkins.push(newCheckin);
  localStorage.setItem('checkins', JSON.stringify(checkins));
  return newCheckin;
};

// Word Cloud
export const getWords = (): WordEntry[] => {
  const data = localStorage.getItem('word_cloud');
  return data ? JSON.parse(data) : [];
};

export const addWord = (text: string): WordEntry => {
  const words = getWords();
  const newWord: WordEntry = {
    id: generateId(),
    text,
    created_at: new Date().toISOString()
  };
  words.push(newWord);
  localStorage.setItem('word_cloud', JSON.stringify(words));
  return newWord;
};

// Evaluations
export const getEvaluations = (): Evaluation[] => {
  const data = localStorage.getItem('evaluations');
  return data ? JSON.parse(data) : [];
};

export const addEvaluation = (evaluation: Omit<Evaluation, 'id' | 'created_at'>): Evaluation => {
  const evaluations = getEvaluations();
  const newEvaluation: Evaluation = {
    ...evaluation,
    id: generateId(),
    created_at: new Date().toISOString()
  };
  evaluations.push(newEvaluation);
  localStorage.setItem('evaluations', JSON.stringify(evaluations));
  return newEvaluation;
};

// Current User
export const setCurrentUser = (name: string) => {
  localStorage.setItem('userName', name);
};

export const getCurrentUser = (): string | null => {
  return localStorage.getItem('userName');
};
