import { PasswordGeneratorOptions, PasswordStrength, CrackTimeEstimates } from '../types';
import { PASSPHRASE_WORDS } from './wordlist';

export const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
export const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const NUMBER_CHARS = '0123456789';
export const DEFAULT_SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Ambiguous characters that easily confuse human eyes or optical scanners
export const AMBIGUOUS_CHARS = new Set(['l', '1', 'I', 'o', '0', 'O', '|', '`', '\'', '"', ';', ':']);

/**
 * Get a cryptographically secure random integer in range [0, max - 1]
 */
export function getSecureRandomInt(max: number): number {
  if (max <= 0) return 0;
  const array = new Uint32Array(1);
  const maxUint = 0xffffffff;
  const limit = maxUint - (maxUint % max);
  let randomVal = 0;
  do {
    window.crypto.getRandomValues(array);
    randomVal = array[0];
  } while (randomVal >= limit);
  return randomVal % max;
}

/**
 * Filter ambiguous characters out of a character set
 */
function filterAmbiguous(charset: string): string {
  return charset
    .split('')
    .filter((char) => !AMBIGUOUS_CHARS.has(char))
    .join('');
}

/**
 * Fisher-Yates cryptographically secure shuffle
 */
function secureShuffle(array: string[]): string[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generates a password according to the provided options
 */
export function generatePassword(options: PasswordGeneratorOptions): string {
  if (options.mode === 'pin') {
    let pin = '';
    const digits = options.avoidAmbiguous ? '23456789' : NUMBER_CHARS;
    for (let i = 0; i < options.length; i++) {
      pin += digits[getSecureRandomInt(digits.length)];
    }
    return pin;
  }

  if (options.mode === 'passphrase') {
    const wordCount = Math.max(2, Math.min(10, options.wordCount || 4));
    const selectedWords: string[] = [];
    const wordListLength = PASSPHRASE_WORDS.length;

    for (let i = 0; i < wordCount; i++) {
      let word = PASSPHRASE_WORDS[getSecureRandomInt(wordListLength)];
      if (options.capitalizeWords) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      selectedWords.push(word);
    }

    let result = selectedWords.join(options.separator || '-');

    if (options.includeNumberInPassphrase) {
      const num = getSecureRandomInt(90) + 10; // 10 - 99
      result += (options.separator || '-') + num;
    }

    if (options.includeSymbolInPassphrase) {
      const symbols = options.customSymbols || '!@#$%&*';
      const sym = symbols[getSecureRandomInt(symbols.length)];
      result += sym;
    }

    return result;
  }

  // Random character generator
  let lowercase = LOWERCASE_CHARS;
  let uppercase = UPPERCASE_CHARS;
  let numbers = NUMBER_CHARS;
  let symbols = options.customSymbols || DEFAULT_SYMBOL_CHARS;

  if (options.avoidAmbiguous) {
    lowercase = filterAmbiguous(lowercase);
    uppercase = filterAmbiguous(uppercase);
    numbers = filterAmbiguous(numbers);
    symbols = filterAmbiguous(symbols);
  }

  let fullPool = '';
  const mandatoryChars: string[] = [];

  if (options.useLowercase && lowercase.length > 0) {
    fullPool += lowercase;
    if (options.minEachType) {
      mandatoryChars.push(lowercase[getSecureRandomInt(lowercase.length)]);
    }
  }

  if (options.useUppercase && uppercase.length > 0) {
    fullPool += uppercase;
    if (options.minEachType) {
      mandatoryChars.push(uppercase[getSecureRandomInt(uppercase.length)]);
    }
  }

  if (options.useNumbers && numbers.length > 0) {
    fullPool += numbers;
    if (options.minEachType) {
      mandatoryChars.push(numbers[getSecureRandomInt(numbers.length)]);
    }
  }

  if (options.useSymbols && symbols.length > 0) {
    fullPool += symbols;
    if (options.minEachType) {
      mandatoryChars.push(symbols[getSecureRandomInt(symbols.length)]);
    }
  }

  // Fallback if no sets were selected
  if (fullPool.length === 0) {
    fullPool = lowercase || LOWERCASE_CHARS;
  }

  const length = Math.max(options.length, mandatoryChars.length);
  const remainingLength = length - mandatoryChars.length;
  const resultChars = [...mandatoryChars];

  for (let i = 0; i < remainingLength; i++) {
    resultChars.push(fullPool[getSecureRandomInt(fullPool.length)]);
  }

  return secureShuffle(resultChars).join('');
}

/**
 * Calculates theoretical entropy in bits: L * log2(poolSize)
 */
export function calculateEntropy(password: string): number {
  if (!password) return 0;

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33; // standard symbols

  if (poolSize === 0) return 0;

  let entropy = password.length * Math.log2(poolSize);

  // Penalty for repetitive characters
  const uniqueChars = new Set(password).size;
  if (uniqueChars < password.length * 0.5) {
    entropy *= 0.75;
  }

  // Penalty for simple sequential runs (e.g. 123, abc)
  const lower = password.toLowerCase();
  if (
    /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/.test(lower) ||
    /012|123|234|345|456|567|678|789|890/.test(password) ||
    /qwer|asdf|zxcv/.test(lower)
  ) {
    entropy = Math.max(10, entropy - 15);
  }

  return Math.round(entropy);
}

/**
 * Estimate brute-force crack time across multiple threat models
 */
export function estimateCrackTime(entropyBits: number): CrackTimeEstimates {
  if (entropyBits <= 0) {
    return {
      onlineThrottled: 'Instant',
      offlineGpu: 'Instant',
      supercomputer: 'Instant',
    };
  }

  const totalCombinations = Math.pow(2, entropyBits);

  const formatSeconds = (seconds: number): string => {
    if (seconds < 1) return 'Instant (< 1s)';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    const minutes = seconds / 60;
    if (minutes < 60) return `${Math.round(minutes)} minutes`;
    const hours = minutes / 60;
    if (hours < 24) return `${Math.round(hours)} hours`;
    const days = hours / 24;
    if (days < 365) return `${Math.round(days)} days`;
    const years = days / 365;
    if (years < 1000) return `${Math.round(years)} years`;
    if (years < 1000000) return `${(years / 1000).toFixed(1)}k years`;
    if (years < 1000000000) return `${(years / 1000000).toFixed(1)}M years`;
    if (years < 1e12) return `${(years / 1e9).toFixed(1)} Billion years`;
    return 'Centuries+ (Trillions of years)';
  };

  // 1. Online throttled web attacks (approx 100 guesses / hour = 0.027 guesses/sec)
  const onlineSecs = totalCombinations / 0.027;

  // 2. High-end offline GPU rig (Hashcat with 8x RTX 4090: ~100 Billion NTLM/MD5 hashes / sec)
  const offlineSecs = totalCombinations / 100_000_000_000;

  // 3. Nation-state distributed supercomputer (100 Trillion guesses / sec)
  const supercomputerSecs = totalCombinations / 100_000_000_000_000;

  return {
    onlineThrottled: formatSeconds(onlineSecs),
    offlineGpu: formatSeconds(offlineSecs),
    supercomputer: formatSeconds(supercomputerSecs),
  };
}

/**
 * Evaluates password strength comprehensively
 */
export function analyzePassword(password: string): PasswordStrength {
  const length = password.length;
  let uppercase = 0;
  let lowercase = 0;
  let numbers = 0;
  let symbols = 0;

  for (const ch of password) {
    if (/[A-Z]/.test(ch)) uppercase++;
    else if (/[a-z]/.test(ch)) lowercase++;
    else if (/[0-9]/.test(ch)) numbers++;
    else symbols++;
  }

  const entropyBits = calculateEntropy(password);
  const crackTimes = estimateCrackTime(entropyBits);

  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (length === 0) {
    return {
      score: 0,
      entropyBits: 0,
      label: 'Very Weak',
      color: '#ef4444',
      crackTime: crackTimes,
      crackTimeHeadline: 'Instant',
      warnings: ['No password entered'],
      suggestions: ['Generate a password to get started'],
      charCounts: { length: 0, uppercase: 0, lowercase: 0, numbers: 0, symbols: 0 },
    };
  }

  if (length < 8) {
    warnings.push('Length is shorter than the industry standard 8 characters.');
  } else if (length < 12) {
    suggestions.push('Expanding length to 14+ characters exponentially increases security.');
  }

  if (uppercase === 0) suggestions.push('Include uppercase letters.');
  if (lowercase === 0) suggestions.push('Include lowercase letters.');
  if (numbers === 0) suggestions.push('Include digits (0-9).');
  if (symbols === 0) suggestions.push('Include special symbols (!@#$%^&*).');

  // Check repetition
  const unique = new Set(password).size;
  if (length > 4 && unique / length < 0.6) {
    warnings.push('Contains frequently repeated characters.');
  }

  // Calculate score 0 to 100
  let score = 0;
  if (entropyBits >= 90) score = 100;
  else if (entropyBits >= 75) score = 85 + Math.round(((entropyBits - 75) / 15) * 15);
  else if (entropyBits >= 55) score = 65 + Math.round(((entropyBits - 55) / 20) * 20);
  else if (entropyBits >= 35) score = 40 + Math.round(((entropyBits - 35) / 20) * 25);
  else score = Math.max(5, Math.round((entropyBits / 35) * 35));

  let label: PasswordStrength['label'] = 'Very Weak';
  let color = '#ef4444'; // red-500

  if (score >= 90) {
    label = 'Military Grade';
    color = '#10b981'; // emerald-500
  } else if (score >= 70) {
    label = 'Strong';
    color = '#06b6d4'; // cyan-500
  } else if (score >= 50) {
    label = 'Fair';
    color = '#f59e0b'; // amber-500
  } else if (score >= 30) {
    label = 'Weak';
    color = '#f97316'; // orange-500
  }

  return {
    score,
    entropyBits,
    label,
    color,
    crackTime: crackTimes,
    crackTimeHeadline: crackTimes.offlineGpu,
    warnings,
    suggestions,
    charCounts: { length, uppercase, lowercase, numbers, symbols },
  };
}

/**
 * Copy string to user clipboard safely
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}
