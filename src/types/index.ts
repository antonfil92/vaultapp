export type GeneratorMode = 'random' | 'passphrase' | 'pin';

export interface PasswordGeneratorOptions {
  mode: GeneratorMode;
  length: number;
  useUppercase: boolean;
  useLowercase: boolean;
  useNumbers: boolean;
  useSymbols: boolean;
  customSymbols: string;
  avoidAmbiguous: boolean; // e.g. 0, O, o, 1, l, I, |
  avoidSequential: boolean; // e.g. abc, 123
  minEachType: boolean; // Guarantee at least one of each selected charset
  // Passphrase specific
  wordCount: number;
  separator: string;
  capitalizeWords: boolean;
  includeNumberInPassphrase: boolean;
  includeSymbolInPassphrase: boolean;
}

export interface CrackTimeEstimates {
  onlineThrottled: string; // 100 attempts / hour
  offlineGpu: string; // 100 Billion attempts / sec (modern RTX 4090 / Hashcat array)
  supercomputer: string; // 100 Trillion attempts / sec (nation-state / quantum cluster)
}

export interface PasswordStrength {
  score: number; // 0 to 100
  entropyBits: number;
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Military Grade';
  color: string;
  crackTime: CrackTimeEstimates;
  crackTimeHeadline: string;
  warnings: string[];
  suggestions: string[];
  charCounts: {
    length: number;
    uppercase: number;
    lowercase: number;
    numbers: number;
    symbols: number;
  };
}

export interface PlatformRule {
  id: string;
  label: string;
  description: string;
  validator: (password: string) => boolean;
}

export interface PlatformPolicy {
  id: 'google' | 'instagram' | 'facebook' | 'apple' | 'microsoft' | 'github' | 'x' | 'amazon';
  name: string;
  brandColor: string;
  iconName: string;
  description: string;
  minLength: number;
  maxLength: number;
  recommendedLength: number;
  requiresUppercase?: boolean;
  requiresLowercase?: boolean;
  requiresNumbers?: boolean;
  requiresSymbols?: boolean;
  allowedSymbolsDescription: string;
  disallowedPatterns: string[];
  recommendedRules: PlatformRule[];
  officialSecurityUrl: string;
  mfaTips: string[];
  generatorPreset: Partial<PasswordGeneratorOptions>;
}

export interface PlatformComplianceResult {
  platformId: string;
  platformName: string;
  isCompliant: boolean;
  score: number; // percentage
  ruleResults: {
    ruleId: string;
    label: string;
    passed: boolean;
    description: string;
  }[];
}

export interface VaultItem {
  id: string;
  title: string;
  platform: string; // 'google' | 'instagram' | 'facebook' | 'apple' | 'microsoft' | 'github' | 'x' | 'other'
  username: string;
  password: string;
  url: string;
  notes: string;
  category: 'Social' | 'Work' | 'Finance' | 'Personal' | 'Other';
  createdAt: number;
  updatedAt: number;
  isFavorite?: boolean;
  tags?: string[];
}

export interface EncryptedVaultData {
  salt: string; // base64
  iv: string; // base64
  ciphertext: string; // base64
  version: number;
  updatedAt: number;
}

export type VaultStatus = 'uninitialized' | 'locked' | 'unlocked';

export type ActiveTab = 'generator' | 'platforms' | 'vault' | 'audit';
