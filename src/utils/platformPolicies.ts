import { PlatformPolicy, PlatformComplianceResult, PasswordGeneratorOptions } from '../types';

export const PLATFORM_POLICIES: PlatformPolicy[] = [
  {
    id: 'google',
    name: 'Google Account',
    brandColor: '#4285F4',
    iconName: 'google',
    description: 'Requires at least 8 characters. Forbids leading/trailing spaces and commonly compromised phrases.',
    minLength: 8,
    maxLength: 100,
    recommendedLength: 16,
    requiresLowercase: true,
    requiresUppercase: true,
    requiresNumbers: true,
    requiresSymbols: true,
    allowedSymbolsDescription: 'All standard ASCII symbols (!@#$%^&*()_+-=[]{}|;:,.<>?) allowed. No leading/trailing spaces.',
    disallowedPatterns: ['Leading or trailing whitespace', 'Password123', 'Google'],
    recommendedRules: [
      {
        id: 'google-len',
        label: 'Minimum 8 Characters',
        description: 'Google requires at least 8 characters for personal and workspace accounts.',
        validator: (pwd) => pwd.length >= 8,
      },
      {
        id: 'google-maxlen',
        label: 'Under 100 Characters',
        description: 'Google limits passwords to a maximum of 100 characters.',
        validator: (pwd) => pwd.length <= 100,
      },
      {
        id: 'google-no-edge-space',
        label: 'No Leading / Trailing Spaces',
        description: 'Google rejects passwords with blank spaces at the start or end.',
        validator: (pwd) => pwd.trim() === pwd && !/^\s|\s$/.test(pwd),
      },
      {
        id: 'google-mix',
        label: 'Letters & Numbers / Symbols Mix',
        description: 'Google recommends combining letters with numbers and punctuation for strong protection.',
        validator: (pwd) => /[a-zA-Z]/.test(pwd) && (/[0-9]/.test(pwd) || /[^a-zA-Z0-9]/.test(pwd)),
      },
      {
        id: 'google-case',
        label: 'Case Sensitivity Variety',
        description: 'Contains both uppercase and lowercase letters.',
        validator: (pwd) => /[a-z]/.test(pwd) && /[A-Z]/.test(pwd),
      },
    ],
    officialSecurityUrl: 'https://support.google.com/accounts/answer/32040',
    mfaTips: [
      'Enable Google 2-Step Verification with Google Prompt on your phone.',
      'Register hardware FIDO2 Passkeys (YubiKey or Touch ID/Windows Hello).',
      'Download and securely store Google 8-digit emergency backup codes.',
    ],
    generatorPreset: {
      mode: 'random',
      length: 16,
      useUppercase: true,
      useLowercase: true,
      useNumbers: true,
      useSymbols: true,
      avoidAmbiguous: false,
      minEachType: true,
    },
  },
  {
    id: 'instagram',
    name: 'Instagram',
    brandColor: '#E1306C',
    iconName: 'instagram',
    description: 'Requires a minimum of 6 characters combining numbers, letters, and punctuation marks.',
    minLength: 6,
    maxLength: 72,
    recommendedLength: 16,
    requiresLowercase: true,
    requiresUppercase: true,
    requiresNumbers: true,
    requiresSymbols: true,
    allowedSymbolsDescription: 'Punctuation and symbols allowed: !@#$%^&*()_+-=[]{};:,.<>?',
    disallowedPatterns: ['Username match', 'Consecutive identical characters > 4', 'Common words'],
    recommendedRules: [
      {
        id: 'ig-len',
        label: 'Minimum 6 Characters (Instagram Minimum)',
        description: 'Instagram mandates at least 6 characters.',
        validator: (pwd) => pwd.length >= 6,
      },
      {
        id: 'ig-rec-len',
        label: 'Recommended 12+ Characters',
        description: 'Security experts recommend at least 12 characters to safeguard public accounts.',
        validator: (pwd) => pwd.length >= 12,
      },
      {
        id: 'ig-combo',
        label: 'Combination of Letters, Numbers & Punctuation',
        description: 'Instagram officially specifies a combination of letters, numbers, and punctuation.',
        validator: (pwd) => /[a-zA-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^a-zA-Z0-9]/.test(pwd),
      },
      {
        id: 'ig-maxlen',
        label: 'Under 72 Characters',
        description: 'Instagram bcrypt-based authentication truncates passwords longer than 72 characters.',
        validator: (pwd) => pwd.length <= 72,
      },
      {
        id: 'ig-variety',
        label: 'High Distinct Character Diversity',
        description: 'Contains at least 8 unique characters to avoid pattern guessing.',
        validator: (pwd) => new Set(pwd).size >= 8,
      },
    ],
    officialSecurityUrl: 'https://help.instagram.com/566810106808145',
    mfaTips: [
      'Enable Two-Factor Authentication via Authenticator App (Google Authenticator or Duo).',
      'Turn on WhatsApp login code delivery as a reliable secondary factor.',
      'Save your 8-digit Instagram backup recovery codes in your encrypted vault.',
    ],
    generatorPreset: {
      mode: 'random',
      length: 16,
      useUppercase: true,
      useLowercase: true,
      useNumbers: true,
      useSymbols: true,
      avoidAmbiguous: true,
      minEachType: true,
    },
  },
  {
    id: 'facebook',
    name: 'Facebook / Meta',
    brandColor: '#1877F2',
    iconName: 'facebook',
    description: 'Requires at least 6 characters. Must not be common words or contain personal details like email/phone.',
    minLength: 6,
    maxLength: 128,
    recommendedLength: 16,
    requiresLowercase: true,
    requiresUppercase: true,
    requiresNumbers: true,
    requiresSymbols: true,
    allowedSymbolsDescription: 'Permits full set of punctuation marks and special symbols.',
    disallowedPatterns: ['Personal email or phone number', 'Dictionary phrases', 'Birthdays'],
    recommendedRules: [
      {
        id: 'fb-len',
        label: 'Minimum 6 Characters',
        description: 'Facebook strictly requires at least 6 characters.',
        validator: (pwd) => pwd.length >= 6,
      },
      {
        id: 'fb-rec-len',
        label: 'Recommended 14+ Characters',
        description: 'Meta Accounts Center recommends 14+ characters to prevent SIM-swap and credential stuffing.',
        validator: (pwd) => pwd.length >= 14,
      },
      {
        id: 'fb-complex',
        label: 'Complex Mixed Characters',
        description: 'Must feature uppercase, lowercase letters, numbers, and symbols.',
        validator: (pwd) =>
          /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^a-zA-Z0-9]/.test(pwd),
      },
      {
        id: 'fb-no-common',
        label: 'No Sequential Numeric Walks',
        description: 'Excludes predictable sequences such as 1234, 0000, 9876.',
        validator: (pwd) => !/1234|2345|3456|4567|5678|6789|9876|0000|1111/.test(pwd),
      },
    ],
    officialSecurityUrl: 'https://www.facebook.com/help/213395615347144',
    mfaTips: [
      'Enable Two-Factor Authentication via Meta Accounts Center.',
      'Configure Security Keys (FIDO / WebAuthn) for physical device verification.',
      'Review Recognized Devices and active sessions regularly.',
    ],
    generatorPreset: {
      mode: 'random',
      length: 18,
      useUppercase: true,
      useLowercase: true,
      useNumbers: true,
      useSymbols: true,
      avoidAmbiguous: false,
      minEachType: true,
    },
  },
  {
    id: 'apple',
    name: 'Apple ID / iCloud',
    brandColor: '#A2AAAD',
    iconName: 'apple',
    description: 'Requires 8+ characters, uppercase, lowercase, numbers, and no 3 identical consecutive characters.',
    minLength: 8,
    maxLength: 32,
    recommendedLength: 16,
    requiresLowercase: true,
    requiresUppercase: true,
    requiresNumbers: true,
    allowedSymbolsDescription: 'Standard symbols supported. Spaces cannot be used.',
    disallowedPatterns: ['3 consecutive identical characters (e.g. aaa, 111)', 'Spaces', 'Account name match'],
    recommendedRules: [
      {
        id: 'apple-len',
        label: 'At Least 8 Characters',
        description: 'Apple ID requires at least 8 characters.',
        validator: (pwd) => pwd.length >= 8,
      },
      {
        id: 'apple-upper-lower-num',
        label: 'Uppercase, Lowercase, and Number',
        description: 'Must include at least one uppercase letter, one lowercase letter, and one digit.',
        validator: (pwd) => /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd),
      },
      {
        id: 'apple-no-consecutive-3',
        label: 'No 3 Consecutive Identical Characters',
        description: 'Apple rejects passwords containing three identical characters in a row (e.g. "aaa" or "777").',
        validator: (pwd) => !/(.)\1\1/.test(pwd),
      },
      {
        id: 'apple-no-spaces',
        label: 'No Whitespace Allowed',
        description: 'Apple accounts do not allow space characters.',
        validator: (pwd) => !/\s/.test(pwd),
      },
    ],
    officialSecurityUrl: 'https://support.apple.com/HT201303',
    mfaTips: [
      'Two-Factor Authentication is built directly into iOS, iPadOS, and macOS.',
      'Set up an Account Recovery Contact and generate an Apple Recovery Key.',
    ],
    generatorPreset: {
      mode: 'random',
      length: 16,
      useUppercase: true,
      useLowercase: true,
      useNumbers: true,
      useSymbols: true,
      avoidAmbiguous: true,
      minEachType: true,
    },
  },
  {
    id: 'microsoft',
    name: 'Microsoft Account',
    brandColor: '#00A4EF',
    iconName: 'microsoft',
    description: 'Requires 8+ characters (up to 256), including at least two character categories.',
    minLength: 8,
    maxLength: 256,
    recommendedLength: 16,
    requiresLowercase: true,
    requiresUppercase: true,
    allowedSymbolsDescription: 'Wide symbol support: `~ ! @ # $ % ^ & * ( ) _ + - = { } | [ ] : " ; \' < > ? , . /',
    disallowedPatterns: ['Password matching email handle', 'Common breached passwords'],
    recommendedRules: [
      {
        id: 'ms-len',
        label: 'Minimum 8 Characters',
        description: 'Microsoft personal accounts require 8+ characters; work accounts typically require 12+.',
        validator: (pwd) => pwd.length >= 8,
      },
      {
        id: 'ms-categories',
        label: 'At Least 2 Character Categories',
        description: 'Requires at least two of: uppercase, lowercase, numbers, or symbols.',
        validator: (pwd) => {
          let count = 0;
          if (/[A-Z]/.test(pwd)) count++;
          if (/[a-z]/.test(pwd)) count++;
          if (/[0-9]/.test(pwd)) count++;
          if (/[^a-zA-Z0-9]/.test(pwd)) count++;
          return count >= 2;
        },
      },
    ],
    officialSecurityUrl: 'https://support.microsoft.com/account-billing/change-your-microsoft-account-password-fdde885b-86da-2965-69fd-4871309f85f8',
    mfaTips: [
      'Use the Microsoft Authenticator app for passwordless phone sign-in.',
      'Enable Windows Hello PIN or biometrics on your PC.',
    ],
    generatorPreset: {
      mode: 'random',
      length: 16,
      useUppercase: true,
      useLowercase: true,
      useNumbers: true,
      useSymbols: true,
      avoidAmbiguous: false,
      minEachType: true,
    },
  },
  {
    id: 'github',
    name: 'GitHub',
    brandColor: '#24292E',
    iconName: 'github',
    description: 'Minimum 8 characters with at least 1 number and 1 lowercase letter, OR 15+ characters of any type.',
    minLength: 8,
    maxLength: 72,
    recommendedLength: 20,
    allowedSymbolsDescription: 'All standard developer ASCII symbols supported.',
    disallowedPatterns: ['Dictionary words', 'Common repository strings'],
    recommendedRules: [
      {
        id: 'gh-dual-spec',
        label: '8+ chars with number & lowercase OR 15+ chars',
        description: 'GitHub password policy requires 8+ chars with lower+number, or 15+ chars regardless of composition.',
        validator: (pwd) => (pwd.length >= 8 && /[a-z]/.test(pwd) && /[0-9]/.test(pwd)) || pwd.length >= 15,
      },
      {
        id: 'gh-rec-entropy',
        label: 'High Entropy Recommended (16+ chars)',
        description: 'For source code repositories and SSH commit signing, 16+ chars is recommended.',
        validator: (pwd) => pwd.length >= 16,
      },
    ],
    officialSecurityUrl: 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-strong-password',
    mfaTips: [
      'GitHub mandates 2FA for all active developers.',
      'Configure Security Keys / WebAuthn and SSH signing keys.',
    ],
    generatorPreset: {
      mode: 'random',
      length: 20,
      useUppercase: true,
      useLowercase: true,
      useNumbers: true,
      useSymbols: true,
      avoidAmbiguous: false,
      minEachType: true,
    },
  },
];

/**
 * Audit any password against all rules of a given platform
 */
export function auditPlatformCompliance(password: string, platformId: string): PlatformComplianceResult {
  const policy = PLATFORM_POLICIES.find((p) => p.id === platformId) || PLATFORM_POLICIES[0];

  const ruleResults = policy.recommendedRules.map((rule) => {
    const passed = rule.validator(password);
    return {
      ruleId: rule.id,
      label: rule.label,
      passed,
      description: rule.description,
    };
  });

  const passedCount = ruleResults.filter((r) => r.passed).length;
  const isCompliant = ruleResults.length > 0 && passedCount === ruleResults.length;
  const score = ruleResults.length > 0 ? Math.round((passedCount / ruleResults.length) * 100) : 0;

  return {
    platformId: policy.id,
    platformName: policy.name,
    isCompliant,
    score,
    ruleResults,
  };
}

/**
 * Returns compliance status for all supported platforms
 */
export function auditAllPlatforms(password: string): PlatformComplianceResult[] {
  return PLATFORM_POLICIES.map((p) => auditPlatformCompliance(password, p.id));
}
