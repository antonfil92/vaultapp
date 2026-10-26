import React from 'react';
import { PasswordGeneratorOptions, GeneratorMode } from '../types';
import { Sliders, Shield, Sparkles, Hash, BookOpen } from 'lucide-react';

interface GeneratorControlsProps {
  options: PasswordGeneratorOptions;
  setOptions: React.Dispatch<React.SetStateAction<PasswordGeneratorOptions>>;
  onApplyPreset: (preset: 'google' | 'instagram' | 'facebook' | 'apple' | 'github') => void;
}

export const GeneratorControls: React.FC<GeneratorControlsProps> = ({
  options,
  setOptions,
  onApplyPreset,
}) => {
  const updateOption = <K extends keyof PasswordGeneratorOptions>(
    key: K,
    value: PasswordGeneratorOptions[K]
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const handleModeChange = (mode: GeneratorMode) => {
    setOptions((prev) => ({
      ...prev,
      mode,
      length: mode === 'passphrase' ? 4 : mode === 'pin' ? 6 : Math.max(12, prev.length),
    }));
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl backdrop-blur-sm space-y-6">
      {/* Header and Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <h2 className="text-base font-semibold text-white">Generation Preferences</h2>
        </div>

        {/* Mode selector segmented controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
          <button
            onClick={() => handleModeChange('random')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              options.mode === 'random'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Random Alphanumeric</span>
          </button>

          <button
            onClick={() => handleModeChange('passphrase')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              options.mode === 'passphrase'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Memorable Passphrase</span>
          </button>

          <button
            onClick={() => handleModeChange('pin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              options.mode === 'pin'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Numeric PIN</span>
          </button>
        </div>
      </div>

      {/* Quick Platform Presets Bar */}
      <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>Quick Compliant Presets:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onApplyPreset('google')}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:border-blue-500 hover:bg-blue-950/30 transition-colors"
          >
            Google (16 chars)
          </button>
          <button
            onClick={() => onApplyPreset('instagram')}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:border-pink-500 hover:bg-pink-950/30 transition-colors"
          >
            Instagram (16 chars)
          </button>
          <button
            onClick={() => onApplyPreset('facebook')}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:border-indigo-500 hover:bg-indigo-950/30 transition-colors"
          >
            Facebook (18 chars)
          </button>
          <button
            onClick={() => onApplyPreset('apple')}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-500 hover:bg-slate-800 transition-colors"
          >
            Apple ID
          </button>
          <button
            onClick={() => onApplyPreset('github')}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:border-purple-500 hover:bg-purple-950/30 transition-colors"
          >
            GitHub (20 chars)
          </button>
        </div>
      </div>

      {/* Mode 1: Random Alphanumeric Mode Controls */}
      {options.mode === 'random' && (
        <div className="space-y-6">
          {/* Length Slider + Direct Input */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="password-length" className="text-slate-300 font-medium">
                Password Length
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  {[12, 16, 20, 24, 32].map((len) => (
                    <button
                      key={len}
                      onClick={() => updateOption('length', len)}
                      className={`px-2 py-0.5 rounded text-xs font-mono tabular-nums transition-colors ${
                        options.length === len
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="6"
                  max="128"
                  value={options.length}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) updateOption('length', Math.max(6, Math.min(128, val)));
                  }}
                  className="w-16 px-2 py-1 text-center font-mono tabular-nums text-sm bg-slate-950 border border-slate-800 rounded-md text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-mono">6</span>
              <input
                id="password-length"
                type="range"
                min="6"
                max="64"
                value={options.length}
                onChange={(e) => updateOption('length', parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
              />
              <span className="text-xs text-slate-500 font-mono">64</span>
            </div>
          </div>

          {/* Character Sets Toggles (Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Uppercase */}
            <label className="flex items-center justify-between p-3.5 bg-slate-950/70 border border-slate-800/90 rounded-lg cursor-pointer hover:border-slate-700 transition-colors">
              <div className="space-y-0.5">
                <div className="text-sm font-medium text-slate-200">Uppercase Letters</div>
                <div className="text-xs font-mono text-sky-400">A B C D E F ... Z</div>
              </div>
              <input
                type="checkbox"
                checked={options.useUppercase}
                onChange={(e) => updateOption('useUppercase', e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-700 rounded focus:ring-indigo-500 focus:ring-offset-slate-900"
              />
            </label>

            {/* Lowercase */}
            <label className="flex items-center justify-between p-3.5 bg-slate-950/70 border border-slate-800/90 rounded-lg cursor-pointer hover:border-slate-700 transition-colors">
              <div className="space-y-0.5">
                <div className="text-sm font-medium text-slate-200">Lowercase Letters</div>
                <div className="text-xs font-mono text-slate-400">a b c d e f ... z</div>
              </div>
              <input
                type="checkbox"
                checked={options.useLowercase}
                onChange={(e) => updateOption('useLowercase', e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-700 rounded focus:ring-indigo-500 focus:ring-offset-slate-900"
              />
            </label>

            {/* Numbers */}
            <label className="flex items-center justify-between p-3.5 bg-slate-950/70 border border-slate-800/90 rounded-lg cursor-pointer hover:border-slate-700 transition-colors">
              <div className="space-y-0.5">
                <div className="text-sm font-medium text-slate-200">Digits & Numbers</div>
                <div className="text-xs font-mono text-emerald-400">0 1 2 3 4 5 6 7 8 9</div>
              </div>
              <input
                type="checkbox"
                checked={options.useNumbers}
                onChange={(e) => updateOption('useNumbers', e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-700 rounded focus:ring-indigo-500 focus:ring-offset-slate-900"
              />
            </label>

            {/* Symbols */}
            <label className="flex items-center justify-between p-3.5 bg-slate-950/70 border border-slate-800/90 rounded-lg cursor-pointer hover:border-slate-700 transition-colors">
              <div className="space-y-0.5">
                <div className="text-sm font-medium text-slate-200">Special Symbols</div>
                <div className="text-xs font-mono text-amber-400">! @ # $ % ^ & * ( ) _ +</div>
              </div>
              <input
                type="checkbox"
                checked={options.useSymbols}
                onChange={(e) => updateOption('useSymbols', e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-700 rounded focus:ring-indigo-500 focus:ring-offset-slate-900"
              />
            </label>
          </div>

          {/* Custom Symbols Configuration */}
          {options.useSymbols && (
            <div className="space-y-1.5 p-3.5 bg-slate-950/50 border border-slate-800/70 rounded-lg">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">Custom Symbols Allowed</label>
                <button
                  type="button"
                  onClick={() => updateOption('customSymbols', '!@#$%^&*()_+-=[]{}|;:,.<>?')}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300"
                >
                  Reset to Standard
                </button>
              </div>
              <input
                type="text"
                value={options.customSymbols}
                onChange={(e) => updateOption('customSymbols', e.target.value)}
                placeholder="!@#$%^&*()_+-=[]{}|;:,.<>?"
                className="w-full px-3 py-1.5 font-mono text-xs text-amber-300 bg-slate-900 border border-slate-800 rounded focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-500">
                You can delete characters from this field if certain websites reject specific symbols like commas or quotes.
              </p>
            </div>
          )}

          {/* Advanced Cryptographic Rules */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="text-xs font-medium text-slate-400">Advanced Complexity Guarantees</div>

            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.avoidAmbiguous}
                  onChange={(e) => updateOption('avoidAmbiguous', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-700 rounded focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-300">
                  <strong className="text-slate-200">Avoid ambiguous characters</strong> (omits{' '}
                  <code className="text-amber-400 font-mono">0, O, o, 1, l, I, |</code> for easier transcription)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.minEachType}
                  onChange={(e) => updateOption('minEachType', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-700 rounded focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-300">
                  <strong className="text-slate-200">Guarantee complete variety</strong> (ensures at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol are guaranteed present)
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Passphrase Controls */}
      {options.mode === 'passphrase' && (
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300 font-medium">Word Count</span>
              <span className="font-mono tabular-nums text-indigo-400 font-semibold">
                {options.wordCount} words (~{options.wordCount * 13} bits entropy)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-mono">3</span>
              <input
                type="range"
                min="3"
                max="8"
                value={options.wordCount}
                onChange={(e) => updateOption('wordCount', parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-xs text-slate-500 font-mono">8</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Word Separator</label>
              <select
                value={options.separator}
                onChange={(e) => updateOption('separator', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="-">Hyphen (-)</option>
                <option value=".">Period (.)</option>
                <option value="_">Underscore (_)</option>
                <option value=" ">Space ( )</option>
                <option value="/">Slash (/)</option>
                <option value="#">Hash (#)</option>
              </select>
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={options.capitalizeWords}
                  onChange={(e) => updateOption('capitalizeWords', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-700 rounded"
                />
                <span>Capitalize each word (TitleCase)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={options.includeNumberInPassphrase}
                  onChange={(e) => updateOption('includeNumberInPassphrase', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-700 rounded"
                />
                <span>Append 2-digit number (e.g. -42)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={options.includeSymbolInPassphrase}
                  onChange={(e) => updateOption('includeSymbolInPassphrase', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-700 rounded"
                />
                <span>Append symbol (e.g. !)</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: PIN Controls */}
      {options.mode === 'pin' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300 font-medium">PIN Digits</span>
              <span className="font-mono tabular-nums text-emerald-400 font-semibold">{options.length} digits</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-mono">4</span>
              <input
                type="range"
                min="4"
                max="16"
                value={options.length}
                onChange={(e) => updateOption('length', parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-xs text-slate-500 font-mono">16</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[4, 6, 8, 10].map((digits) => (
              <button
                key={digits}
                onClick={() => updateOption('length', digits)}
                className={`px-3 py-1 text-xs font-mono rounded ${
                  options.length === digits
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {digits} digits {digits === 4 ? '(ATM/Bank)' : digits === 6 ? '(iOS/Android)' : ''}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
