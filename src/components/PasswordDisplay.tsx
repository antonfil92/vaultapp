import React, { useState } from 'react';
import { Copy, Check, Eye, EyeOff, RefreshCw, BookmarkPlus, Layers, Volume2, VolumeX } from 'lucide-react';
import { PasswordStrength } from '../types';

interface PasswordDisplayProps {
  password: string;
  strength: PasswordStrength;
  onRegenerate: () => void;
  onCopy: () => void;
  onSaveToVault: () => void;
  onOpenBatch: () => void;
  copied: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const PasswordDisplay: React.FC<PasswordDisplayProps> = ({
  password,
  strength,
  onRegenerate,
  onCopy,
  onSaveToVault,
  onOpenBatch,
  copied,
  soundEnabled,
  onToggleSound,
}) => {
  const [isMasked, setIsMasked] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const handleRegenerate = () => {
    setIsRotating(true);
    onRegenerate();
    setTimeout(() => setIsRotating(false), 300);
  };

  // Render syntax-highlighted characters
  const renderStyledPassword = () => {
    if (!password) {
      return <span className="text-slate-500 italic">Click Generate to create password...</span>;
    }

    if (isMasked) {
      return (
        <span className="tracking-widest font-mono text-slate-400 select-none">
          {'•'.repeat(Math.min(password.length, 36))}
          {password.length > 36 && ` (${password.length} chars)`}
        </span>
      );
    }

    return (
      <span className="font-mono tracking-wide break-all leading-relaxed select-all">
        {password.split('').map((char, index) => {
          let colorClass = 'text-slate-100';
          if (/[A-Z]/.test(char)) {
            colorClass = 'text-sky-300 font-semibold';
          } else if (/[a-z]/.test(char)) {
            colorClass = 'text-slate-200';
          } else if (/[0-9]/.test(char)) {
            colorClass = 'text-emerald-400 font-semibold';
          } else {
            colorClass = 'text-amber-400 font-bold';
          }

          return (
            <span key={index} className={colorClass}>
              {char}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl backdrop-blur-sm">
      {/* Top row: Character Legend & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-medium text-slate-300">Generated Credential</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="font-mono tabular-nums text-indigo-400 font-medium">
            {password.length} characters
          </span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="font-mono tabular-nums text-slate-300">
            {strength.entropyBits} bits entropy
          </span>
        </div>

        {/* Character type syntax legend */}
        <div className="hidden sm:flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-sky-300 inline-block"></span> Uppercase
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-slate-300 inline-block"></span> Lowercase
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-emerald-400 inline-block"></span> Numbers
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-amber-400 inline-block"></span> Symbols
          </span>
        </div>
      </div>

      {/* Main password box */}
      <div className="relative group bg-slate-950/90 border border-slate-800/90 rounded-lg p-4 sm:p-5 flex items-center justify-between gap-4 min-h-[72px] transition-all hover:border-slate-700">
        <div className="flex-1 overflow-x-auto text-base sm:text-lg select-all">
          {renderStyledPassword()}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsMasked(!isMasked)}
            title={isMasked ? 'Reveal password' : 'Hide password (shoulder surf protection)'}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label={isMasked ? 'Reveal password' : 'Hide password'}
          >
            {isMasked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute click audio' : 'Enable click audio'}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle audio feedback"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={handleRegenerate}
            title="Generate new password (Space / Click)"
            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Generate new password"
          >
            <RefreshCw className={`w-4 h-4 transition-transform duration-300 ${isRotating ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={onCopy}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shadow-sm ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action bar under password: Save to Vault, Bulk Mode, Quick summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-800/80">
        <div className="flex items-center gap-2">
          <button
            onClick={onSaveToVault}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Save to Encrypted Vault</span>
          </button>

          <button
            onClick={onOpenBatch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/70 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Bulk Batch (10x)</span>
          </button>
        </div>

        {/* Security badge text */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Security rating:</span>
          <span
            className="font-semibold px-2 py-0.5 rounded text-xs"
            style={{
              backgroundColor: `${strength.color}15`,
              color: strength.color,
              border: `1px solid ${strength.color}40`,
            }}
          >
            {strength.label}
          </span>
          <span className="text-slate-500 hidden sm:inline">·</span>
          <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
            Crack: {strength.crackTimeHeadline}
          </span>
        </div>
      </div>
    </div>
  );
};
