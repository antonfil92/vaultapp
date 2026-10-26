import React from 'react';
import { Shield, KeyRound, Globe, Lock, ShieldCheck, RefreshCw } from 'lucide-react';
import { ActiveTab, VaultStatus } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  vaultStatus: VaultStatus;
  onLockVault: () => void;
  onQuickGenerate: () => void;
  vaultItemsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  vaultStatus,
  onLockVault,
  onQuickGenerate,
  vaultItemsCount,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('generator');
              }}
              className="text-lg font-bold tracking-tight text-white whitespace-nowrap hover:text-indigo-400 transition-colors"
            >
              VaultKey
            </a>
          </div>

          {/* Zone 2: 4 clean single-line nav links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'generator'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <KeyRound className="w-4 h-4 text-indigo-400" />
              <span>Generator</span>
            </button>

            <button
              onClick={() => setActiveTab('platforms')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'platforms'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Platform Policies</span>
            </button>

            <button
              onClick={() => setActiveTab('vault')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'vault'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Encrypted Vault</span>
              {vaultStatus === 'unlocked' && vaultItemsCount > 0 && (
                <span className="text-xs text-slate-400 font-mono">({vaultItemsCount})</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Security Audit</span>
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            {vaultStatus === 'unlocked' ? (
              <button
                onClick={onLockVault}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-300 bg-rose-950/60 border border-rose-900/60 rounded-lg hover:bg-rose-900/80 transition-colors whitespace-nowrap"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Vault</span>
              </button>
            ) : (
              <button
                onClick={onQuickGenerate}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm shadow-indigo-600/30 whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New Password</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile secondary tab bar */}
        <div className="flex md:hidden overflow-x-auto py-2.5 gap-2 border-t border-slate-800/60 scrollbar-none">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${
              activeTab === 'generator' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-900'
            }`}
          >
            Generator
          </button>
          <button
            onClick={() => setActiveTab('platforms')}
            className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${
              activeTab === 'platforms' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-900'
            }`}
          >
            Platform Policies
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${
              activeTab === 'vault' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-900'
            }`}
          >
            Encrypted Vault {vaultStatus === 'unlocked' && `(${vaultItemsCount})`}
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${
              activeTab === 'audit' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-900'
            }`}
          >
            Audit
          </button>
        </div>
      </div>
    </header>
  );
};
