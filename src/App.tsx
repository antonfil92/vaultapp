import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ActiveTab,
  PasswordGeneratorOptions,
  VaultItem,
  VaultStatus,
} from './types';
import { generatePassword, analyzePassword, copyToClipboard } from './utils/crypto';
import { PLATFORM_POLICIES } from './utils/platformPolicies';
import { getStoredEncryptedVault } from './utils/vaultCrypto';
import { Header } from './components/Header';
import { PasswordDisplay } from './components/PasswordDisplay';
import { GeneratorControls } from './components/GeneratorControls';
import { StrengthMeter } from './components/StrengthMeter';
import { PlatformPoliciesView } from './components/PlatformPoliciesView';
import { VaultManager } from './components/VaultManager';
import { VaultAuditView } from './components/VaultAuditView';
import { BatchGeneratorModal } from './components/BatchGeneratorModal';
import { ClipboardToast } from './components/ClipboardToast';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('generator');

  // Generator Options State
  const [options, setOptions] = useState<PasswordGeneratorOptions>({
    mode: 'random',
    length: 16,
    useUppercase: true,
    useLowercase: true,
    useNumbers: true,
    useSymbols: true,
    customSymbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    avoidAmbiguous: false,
    avoidSequential: true,
    minEachType: true,
    wordCount: 4,
    separator: '-',
    capitalizeWords: true,
    includeNumberInPassphrase: true,
    includeSymbolInPassphrase: true,
  });

  const [password, setPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string>('');
  const [isBatchOpen, setIsBatchOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Vault State
  const [vaultStatus, setVaultStatus] = useState<VaultStatus>('locked');
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [masterPassword, setMasterPassword] = useState<string>('');
  const [copiedVaultId, setCopiedVaultId] = useState<string | null>(null);

  // Audio tone generator for satisfying mechanical click feedback
  const playClickSound = useCallback((frequency = 600, duration = 0.04) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context not allowed or failed
    }
  }, [soundEnabled]);

  // Generate password function
  const handleGenerate = useCallback(() => {
    const newPwd = generatePassword(options);
    setPassword(newPwd);
    setCopied(false);
    playClickSound(580, 0.05);
  }, [options, playClickSound]);

  // Initial password generation on mount
  useEffect(() => {
    handleGenerate();
  }, []);

  // Hotkey support: Spacebar to regenerate when not inside text inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && activeTab === 'generator') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handleGenerate();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate, activeTab]);

  // Auto-lock vault timer after 15 minutes of inactivity
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (vaultStatus === 'unlocked') {
      inactivityTimerRef.current = setTimeout(() => {
        setVaultStatus('locked');
        setMasterPassword('');
        setVaultItems([]);
      }, 15 * 60 * 1000); // 15 minutes
    }
  }, [vaultStatus]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => resetInactivityTimer();
    events.forEach((ev) => window.addEventListener(ev, handleActivity));
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleActivity));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [resetInactivityTimer]);

  // Check vault status initially
  useEffect(() => {
    const stored = getStoredEncryptedVault();
    if (!stored) {
      setVaultStatus('uninitialized');
    } else {
      setVaultStatus('locked');
    }
  }, []);

  // Lock vault handler
  const handleLockVault = () => {
    setVaultStatus('locked');
    setMasterPassword('');
    setVaultItems([]);
    playClickSound(350, 0.08);
  };

  // Copy password to clipboard
  const handleCopyMainPassword = async () => {
    if (!password) return;
    const success = await copyToClipboard(password);
    if (success) {
      setCopied(true);
      setCopiedText(password);
      setToastVisible(true);
      playClickSound(880, 0.06);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Copy vault password
  const handleCopyVaultText = async (text: string, itemId?: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      if (itemId) setCopiedVaultId(itemId);
      setCopiedText(text);
      setToastVisible(true);
      playClickSound(880, 0.06);
      setTimeout(() => setCopiedVaultId(null), 2000);
    }
  };

  // Apply platform preset
  const handleApplyPreset = (platformId: 'google' | 'instagram' | 'facebook' | 'apple' | 'github') => {
    const policy = PLATFORM_POLICIES.find((p) => p.id === platformId);
    if (policy && policy.generatorPreset) {
      setOptions((prev) => ({
        ...prev,
        ...policy.generatorPreset,
      }));
      // Generate immediately with the new preset
      setTimeout(() => {
        const fresh = generatePassword({
          ...options,
          ...policy.generatorPreset,
        });
        setPassword(fresh);
        playClickSound(750, 0.06);
      }, 50);
    }
  };

  // Quick replacement generation from Audit view
  const handleGenerateReplacementFromAudit = (item: VaultItem) => {
    const platformPreset = PLATFORM_POLICIES.find((p) => p.id === item.platform)?.generatorPreset;
    const updatedOptions = {
      ...options,
      ...(platformPreset || { length: 18, useUppercase: true, useLowercase: true, useNumbers: true, useSymbols: true }),
    };
    const replacement = generatePassword(updatedOptions);
    setPassword(replacement);
    setActiveTab('vault');
  };

  const strength = analyzePassword(password);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        vaultStatus={vaultStatus}
        onLockVault={handleLockVault}
        onQuickGenerate={handleGenerate}
        vaultItemsCount={vaultItems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab 1: Password Generator */}
        {activeTab === 'generator' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            {/* Top: High Visibility Display */}
            <PasswordDisplay
              password={password}
              strength={strength}
              onRegenerate={handleGenerate}
              onCopy={handleCopyMainPassword}
              onSaveToVault={() => setActiveTab('vault')}
              onOpenBatch={() => setIsBatchOpen(true)}
              copied={copied}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(!soundEnabled)}
            />

            {/* Split Grid: Generator Controls on Left, Strength Analysis on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7">
                <GeneratorControls
                  options={options}
                  setOptions={setOptions}
                  onApplyPreset={handleApplyPreset}
                />
              </div>

              <div className="lg:col-span-5">
                <StrengthMeter strength={strength} passwordLength={password.length} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Platform Policies & Sync */}
        {activeTab === 'platforms' && (
          <div className="animate-in fade-in duration-150">
            <PlatformPoliciesView
              currentPassword={password}
              onSetPassword={setPassword}
              onApplyPreset={(p) => {
                handleApplyPreset(p);
                setActiveTab('generator');
              }}
              generatorOptions={options}
            />
          </div>
        )}

        {/* Tab 3: Encrypted Vault (Password Manager) */}
        {activeTab === 'vault' && (
          <div className="animate-in fade-in duration-150">
            <VaultManager
              currentGeneratedPassword={password}
              vaultStatus={vaultStatus}
              setVaultStatus={setVaultStatus}
              vaultItems={vaultItems}
              setVaultItems={setVaultItems}
              masterPassword={masterPassword}
              setMasterPassword={setMasterPassword}
              onCopyPassword={(pwd) => handleCopyVaultText(pwd)}
              copiedId={copiedVaultId}
            />
          </div>
        )}

        {/* Tab 4: Security & Breach Audit */}
        {activeTab === 'audit' && (
          <div className="animate-in fade-in duration-150">
            <VaultAuditView
              vaultItems={vaultItems}
              onGenerateReplacement={handleGenerateReplacementFromAudit}
              onOpenVault={() => setActiveTab('vault')}
            />
          </div>
        )}
      </main>

      {/* Batch Generator Modal */}
      <BatchGeneratorModal
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        options={options}
        onSelectPassword={(pwd) => setPassword(pwd)}
      />

      {/* Auto-Clear Clipboard Toast */}
      <ClipboardToast
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        copiedText={copiedText}
      />

      {/* Clean Editorial Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-400">VaultKey</span>
            <span aria-hidden="true">·</span>
            <span>Zero-Knowledge Client-Side AES-256-GCM Vault</span>
            <span aria-hidden="true">·</span>
            <span>Cryptographic CSPRNG</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>Compliant with Google, Instagram & Meta Policies</span>
            <span aria-hidden="true">·</span>
            <span>100% In-Browser Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
