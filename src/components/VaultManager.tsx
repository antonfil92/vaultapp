import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  Plus,
  Search,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  ExternalLink,
  Download,
  Upload,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Globe,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { VaultItem, VaultStatus } from '../types';
import {
  encryptVault,
  decryptVault,
  getStoredEncryptedVault,
  saveStoredEncryptedVault,
  exportVaultToCsv,
  downloadFile,
  parseImportedVault,
} from '../utils/vaultCrypto';
import { analyzePassword } from '../utils/crypto';

interface VaultManagerProps {
  currentGeneratedPassword: string;
  vaultStatus: VaultStatus;
  setVaultStatus: React.Dispatch<React.SetStateAction<VaultStatus>>;
  vaultItems: VaultItem[];
  setVaultItems: React.Dispatch<React.SetStateAction<VaultItem[]>>;
  masterPassword: string;
  setMasterPassword: (pwd: string) => void;
  onCopyPassword: (pwd: string) => void;
  copiedId: string | null;
  onSelectPlatformPreset?: (platformId: string) => void;
}

export const VaultManager: React.FC<VaultManagerProps> = ({
  currentGeneratedPassword,
  vaultStatus,
  setVaultStatus,
  vaultItems,
  setVaultItems,
  masterPassword,
  setMasterPassword,
  onCopyPassword,
  copiedId,
}) => {
  const [unlockInput, setUnlockInput] = useState('');
  const [setupConfirmInput, setSetupConfirmInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formPlatform, setFormPlatform] = useState('google');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formCategory, setFormCategory] = useState<VaultItem['category']>('Social');
  const [formShowPassword, setFormShowPassword] = useState(false);

  // Revealed passwords state in list
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  // Import file ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Check if vault exists on mount
  useEffect(() => {
    const stored = getStoredEncryptedVault();
    if (!stored) {
      if (vaultStatus !== 'unlocked') {
        setVaultStatus('uninitialized');
      }
    } else {
      if (vaultStatus !== 'unlocked') {
        setVaultStatus('locked');
      }
    }
  }, [vaultStatus, setVaultStatus]);

  // Handle Master Password Setup
  const handleSetupVault = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (unlockInput.length < 8) {
      setErrorMessage('Master password must be at least 8 characters for cryptographic security.');
      return;
    }
    if (unlockInput !== setupConfirmInput) {
      setErrorMessage('Master passwords do not match. Please verify carefully.');
      return;
    }

    setIsProcessing(true);
    try {
      // Seed with initial welcome / sample credentials or empty
      const initialItems: VaultItem[] = [
        {
          id: crypto.randomUUID(),
          title: 'Google Account (Personal)',
          platform: 'google',
          username: 'user@gmail.com',
          password: currentGeneratedPassword || 'K9#xM!92qP$vL@71',
          url: 'https://myaccount.google.com',
          notes: 'Two-factor authentication enabled via Google Prompt.',
          category: 'Social',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const encrypted = await encryptVault(initialItems, unlockInput);
      saveStoredEncryptedVault(encrypted);
      setMasterPassword(unlockInput);
      setVaultItems(initialItems);
      setVaultStatus('unlocked');
      setUnlockInput('');
      setSetupConfirmInput('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initialize encrypted vault.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Vault Unlock
  const handleUnlockVault = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const stored = getStoredEncryptedVault();
    if (!stored) {
      setVaultStatus('uninitialized');
      return;
    }

    setIsProcessing(true);
    try {
      const items = await decryptVault(stored, unlockInput);
      setMasterPassword(unlockInput);
      setVaultItems(items);
      setVaultStatus('unlocked');
      setUnlockInput('');
    } catch {
      setErrorMessage('Invalid Master Password. Unable to decrypt zero-knowledge ciphertext.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Open modal for new item
  const handleOpenAddModal = (initialPassword?: string) => {
    setEditingItem(null);
    setFormTitle('');
    setFormPlatform('google');
    setFormUsername('');
    setFormPassword(initialPassword || currentGeneratedPassword || '');
    setFormUrl('https://accounts.google.com');
    setFormNotes('');
    setFormCategory('Social');
    setFormShowPassword(false);
    setIsModalOpen(true);
  };

  // Open modal for editing item
  const handleOpenEditModal = (item: VaultItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormPlatform(item.platform || 'other');
    setFormUsername(item.username);
    setFormPassword(item.password);
    setFormUrl(item.url);
    setFormNotes(item.notes);
    setFormCategory(item.category);
    setFormShowPassword(false);
    setIsModalOpen(true);
  };

  // Save Item (Create or Edit)
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formPassword.trim()) {
      alert('Please provide at least a title and a password.');
      return;
    }

    let updatedList: VaultItem[];
    if (editingItem) {
      updatedList = vaultItems.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              title: formTitle.trim(),
              platform: formPlatform,
              username: formUsername.trim(),
              password: formPassword,
              url: formUrl.trim(),
              notes: formNotes.trim(),
              category: formCategory,
              updatedAt: Date.now(),
            }
          : item
      );
    } else {
      const newItem: VaultItem = {
        id: crypto.randomUUID(),
        title: formTitle.trim(),
        platform: formPlatform,
        username: formUsername.trim(),
        password: formPassword,
        url: formUrl.trim(),
        notes: formNotes.trim(),
        category: formCategory,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      updatedList = [newItem, ...vaultItems];
    }

    try {
      const encrypted = await encryptVault(updatedList, masterPassword);
      saveStoredEncryptedVault(encrypted);
      setVaultItems(updatedList);
      setIsModalOpen(false);
    } catch {
      alert('Error encrypting and persisting vault.');
    }
  };

  // Delete Item
  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this credential? This cannot be undone.')) return;
    const updated = vaultItems.filter((i) => i.id !== id);
    try {
      const encrypted = await encryptVault(updated, masterPassword);
      saveStoredEncryptedVault(encrypted);
      setVaultItems(updated);
    } catch {
      alert('Failed to delete item.');
    }
  };

  // Toggle reveal password in list
  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Export Encrypted Backup
  const handleExportEncryptedBackup = () => {
    const stored = getStoredEncryptedVault();
    if (!stored) return;
    const jsonStr = JSON.stringify(stored, null, 2);
    downloadFile(jsonStr, `vaultkey_backup_${new Date().toISOString().slice(0, 10)}.enc.json`, 'application/json');
  };

  // Export CSV
  const handleExportCsv = () => {
    const csvStr = exportVaultToCsv(vaultItems);
    downloadFile(csvStr, `vaultkey_passwords_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  };

  // Handle File Import
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const importedItems = parseImportedVault(content);

        if (importedItems.length === 0) {
          alert('Could not parse any valid credentials from the selected file.');
          return;
        }

        const newVaultItems: VaultItem[] = importedItems.map((item) => ({
          id: crypto.randomUUID(),
          title: item.title || 'Imported Credential',
          platform: item.platform || 'other',
          username: item.username || '',
          password: item.password || '',
          url: item.url || '',
          notes: item.notes || '',
          category: (item.category as any) || 'Personal',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }));

        const merged = [...newVaultItems, ...vaultItems];
        const encrypted = await encryptVault(merged, masterPassword);
        saveStoredEncryptedVault(encrypted);
        setVaultItems(merged);
        alert(`Successfully imported ${newVaultItems.length} credentials into your encrypted vault.`);
      } catch (err: any) {
        alert(`Failed to import file: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filtered vault items
  const filteredItems = vaultItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.url.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesPlatform = platformFilter === 'all' || item.platform === platformFilter;

    return matchesSearch && matchesCategory && matchesPlatform;
  });

  // State: UNINITIALIZED (Setup Master Password)
  if (vaultStatus === 'uninitialized') {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-950/80 border border-indigo-800/80 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Create Zero-Knowledge Encrypted Vault</h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
              Your credentials are encrypted client-side using <strong>AES-256-GCM</strong> with 100,000 rounds of PBKDF2
              key derivation. Only your Master Password can decrypt your vault.
            </p>
          </div>

          <form onSubmit={handleSetupVault} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Set Master Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={unlockInput}
                onChange={(e) => setUnlockInput(e.target.value)}
                placeholder="Choose a strong master password..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Confirm Master Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={setupConfirmInput}
                onChange={(e) => setSetupConfirmInput(e.target.value)}
                placeholder="Retype master password..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isProcessing ? 'Deriving Keys & Encrypting...' : 'Initialize Secure Vault'}</span>
            </button>
          </form>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-[11px] text-slate-400">
            🔒 <strong>Zero-Knowledge Principle:</strong> We never transmit, log, or store your master password.
            Keep it safe!
          </div>
        </div>
      </div>
    );
  }

  // State: LOCKED (Enter Master Password to Unlock)
  if (vaultStatus === 'locked') {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-7 h-7 text-indigo-400" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Vault is Locked</h2>
            <p className="text-xs text-slate-400">
              Enter your Master Password to decrypt your stored credentials.
            </p>
          </div>

          <form onSubmit={handleUnlockVault} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Master Password</label>
              <input
                type="password"
                required
                autoFocus
                value={unlockInput}
                onChange={(e) => setUnlockInput(e.target.value)}
                placeholder="Enter Master Password..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>{isProcessing ? 'Decrypting Vault...' : 'Unlock Vault'}</span>
            </button>
          </form>

          <div className="text-xs text-slate-500">
            Encrypted with AES-256-GCM authenticated cipher.
          </div>
        </div>
      </div>
    );
  }

  // State: UNLOCKED (Active Vault Management)
  return (
    <div className="space-y-6">
      {/* Top action controls: Search, Filter, Add, Export, Import */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center">
              <Unlock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Zero-Knowledge Encrypted Vault</span>
                <span className="text-xs text-slate-400 font-normal">({vaultItems.length} records)</span>
              </h2>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>AES-256-GCM Authenticated</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 font-medium">Unlocked Session Active</span>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenAddModal(currentGeneratedPassword)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-600/30 transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Current Password</span>
            </button>

            <button
              onClick={() => handleOpenAddModal('')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 text-slate-400" />
              <span>Add Custom</span>
            </button>

            <button
              onClick={handleExportCsv}
              title="Export unencrypted CSV for 1Password or Bitwarden"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportEncryptedBackup}
              title="Export fully encrypted JSON backup"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Encrypted Backup</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Import</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logins, emails, sites..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="Social">Social Media</option>
              <option value="Work">Work & Business</option>
              <option value="Finance">Banking & Finance</option>
              <option value="Personal">Personal</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Platforms</option>
              <option value="google">Google</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="apple">Apple ID</option>
              <option value="microsoft">Microsoft</option>
              <option value="github">GitHub</option>
              <option value="other">Other Platforms</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vault Items List */}
      {filteredItems.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">No Credentials Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || categoryFilter !== 'all' || platformFilter !== 'all'
                ? 'No stored passwords matched your filter query.'
                : 'Your encrypted vault is currently empty. Add your first login credential or import an existing CSV.'}
            </p>
          </div>
          <button
            onClick={() => handleOpenAddModal(currentGeneratedPassword)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            Save Current Generated Password
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const isRevealed = revealedIds.has(item.id);
            const pwdAnalysis = analyzePassword(item.password);
            const isCopied = copiedId === item.id;

            let platformBadgeColor = '#64748b';
            if (item.platform === 'google') platformBadgeColor = '#4285F4';
            else if (item.platform === 'instagram') platformBadgeColor = '#E1306C';
            else if (item.platform === 'facebook') platformBadgeColor = '#1877F2';
            else if (item.platform === 'apple') platformBadgeColor = '#A2AAAD';
            else if (item.platform === 'github') platformBadgeColor = '#8957e5';

            return (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm space-y-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div className="space-y-3">
                  {/* Card Top: Title, Platform & Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: platformBadgeColor }}
                      >
                        {item.title.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white line-clamp-1">{item.title}</h4>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <span>{item.category}</span>
                          {item.platform && item.platform !== 'other' && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="capitalize">{item.platform}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
                        title="Edit credential"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                        title="Delete credential"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Username / Login */}
                  {item.username && (
                    <div className="flex items-center justify-between text-xs p-2 bg-slate-950/70 border border-slate-800/80 rounded-lg">
                      <span className="text-slate-400 truncate max-w-[200px]">{item.username}</span>
                      <button
                        onClick={() => onCopyPassword(item.username)}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Login</span>
                      </button>
                    </div>
                  )}

                  {/* Password row */}
                  <div className="flex items-center justify-between text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg gap-2">
                    <div className="font-mono text-sm truncate flex-1 select-all">
                      {isRevealed ? (
                        <span className="text-slate-100">{item.password}</span>
                      ) : (
                        <span className="text-slate-500 tracking-widest">••••••••••••</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleReveal(item.id)}
                        className="p-1 text-slate-400 hover:text-slate-200 rounded"
                        title={isRevealed ? 'Hide' : 'Reveal'}
                      >
                        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => onCopyPassword(item.password)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                          isCopied ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                      >
                        {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Notes / URL */}
                  {item.notes && <p className="text-xs text-slate-400 line-clamp-2 italic">{item.notes}</p>}
                </div>

                {/* Card Footer: Strength indicator & site link */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    {pwdAnalysis.score >= 70 ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span style={{ color: pwdAnalysis.color }} className="font-medium">
                      {pwdAnalysis.label} ({pwdAnalysis.entropyBits} bits)
                    </span>
                  </div>

                  {item.url && (
                    <a
                      href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors truncate max-w-[140px]"
                    >
                      <span className="truncate">{item.url.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Credential Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-400" />
                <span>{editingItem ? 'Edit Credential' : 'Save Credential to Vault'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-100 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Account / Service Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Google Workspace, Instagram"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Platform</label>
                  <select
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="google">Google</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="apple">Apple ID</option>
                    <option value="microsoft">Microsoft</option>
                    <option value="github">GitHub</option>
                    <option value="other">Other / Custom</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Username / Email</label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="e.g. name@example.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Social">Social</option>
                    <option value="Work">Work</option>
                    <option value="Finance">Finance</option>
                    <option value="Personal">Personal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Password field with generation helpers */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-medium">Password *</label>
                  {currentGeneratedPassword && currentGeneratedPassword !== formPassword && (
                    <button
                      type="button"
                      onClick={() => setFormPassword(currentGeneratedPassword)}
                      className="text-indigo-400 hover:text-indigo-300 text-[11px]"
                    >
                      Use Generator's Current Password
                    </button>
                  )}
                </div>

                <div className="relative flex items-center">
                  <input
                    type={formShowPassword ? 'text' : 'password'}
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setFormShowPassword(!formShowPassword)}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {formShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Website URL</label>
                <input
                  type="text"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://accounts.google.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Encrypted Notes & 2FA Recovery Keys</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Additional security notes, answers to security questions, or backup codes..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-white font-semibold bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-colors"
                >
                  Encrypt & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
