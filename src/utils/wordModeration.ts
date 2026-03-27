const bannedWords = [
  "idiota", "burro", "estúpido", "imbecil", "otário", "merda", "porra",
  "caralho", "foda", "puta", "viado", "bicha", "cuzão", "fdp", "filho da puta",
  "desgraça", "puta que pariu", "arrombado", "bosta", "cacete", "pinto", "cu",
  "buceta", "piroca", "rola", "pau", "xoxota", "boceta", "bundão", "retardado",
  "fuck", "shit", "bitch", "asshole", "bastard", "damn"
];

export const isWordAllowed = (word: string): boolean => {
  const normalizedWord = word.toLowerCase().trim();
  if (bannedWords.some(banned => normalizedWord.includes(banned))) return false;
  return true;
};

export const normalizeWord = (word: string): string => word.toLowerCase().trim();
