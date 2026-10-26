import React from 'react';
import { PasswordStrength } from '../types';
import { ShieldAlert, ShieldCheck, Cpu, Globe, Server, CheckCircle2, AlertTriangle } from 'lucide-react';

interface StrengthMeterProps {
  strength: PasswordStrength;
  passwordLength: number;
}

export const StrengthMeter: React.FC<StrengthMeterProps> = ({ strength, passwordLength }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl backdrop-blur-sm space-y-6">
      {/* Header and Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {strength.score >= 70 ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          )}
          <h2 className="text-base font-semibold text-white">Strength & Cryptographic Analysis</h2>
        </div>

        <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
          <span className="text-xl font-bold" style={{ color: strength.color }}>
            {strength.score}
          </span>
          <span className="text-xs text-slate-500">/ 100</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.max(5, strength.score)}%`,
              backgroundColor: strength.color,
            }}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold" style={{ color: strength.color }}>
            {strength.label}
          </span>
          <span className="text-slate-400 font-mono tabular-nums">
            {strength.entropyBits} bits theoretical entropy
          </span>
        </div>
      </div>

      {/* 3 Threat Model Crack Time Estimates */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Brute-Force Crack Time Matrix
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Online Rate-Limited */}
          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>Online Web Attack</span>
            </div>
            <div className="text-xs text-slate-500">100 guesses / hr</div>
            <div className="font-mono text-sm font-semibold text-slate-100 tabular-nums">
              {strength.crackTime.onlineThrottled}
            </div>
          </div>

          {/* 2. Offline GPU Cluster */}
          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Offline GPU Farm</span>
            </div>
            <div className="text-xs text-slate-500">100 Billion hashes / sec</div>
            <div className="font-mono text-sm font-semibold text-emerald-400 tabular-nums">
              {strength.crackTime.offlineGpu}
            </div>
          </div>

          {/* 3. Supercomputer */}
          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Server className="w-3.5 h-3.5 text-purple-400" />
              <span>Supercomputer</span>
            </div>
            <div className="text-xs text-slate-500">100 Trillion guesses / sec</div>
            <div className="font-mono text-sm font-semibold text-purple-300 tabular-nums">
              {strength.crackTime.supercomputer}
            </div>
          </div>
        </div>
      </div>

      {/* Character Breakdown Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
        <div className="p-2.5 bg-slate-950/50 rounded border border-slate-800/50">
          <span className="text-slate-400 block">Uppercase (A-Z)</span>
          <span className="font-mono font-bold text-sky-300 text-sm tabular-nums">
            {strength.charCounts.uppercase}
          </span>
        </div>
        <div className="p-2.5 bg-slate-950/50 rounded border border-slate-800/50">
          <span className="text-slate-400 block">Lowercase (a-z)</span>
          <span className="font-mono font-bold text-slate-200 text-sm tabular-nums">
            {strength.charCounts.lowercase}
          </span>
        </div>
        <div className="p-2.5 bg-slate-950/50 rounded border border-slate-800/50">
          <span className="text-slate-400 block">Digits (0-9)</span>
          <span className="font-mono font-bold text-emerald-400 text-sm tabular-nums">
            {strength.charCounts.numbers}
          </span>
        </div>
        <div className="p-2.5 bg-slate-950/50 rounded border border-slate-800/50">
          <span className="text-slate-400 block">Symbols (!@#)</span>
          <span className="font-mono font-bold text-amber-400 text-sm tabular-nums">
            {strength.charCounts.symbols}
          </span>
        </div>
      </div>

      {/* Warnings & Suggestions */}
      {(strength.warnings.length > 0 || strength.suggestions.length > 0) && (
        <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
          {strength.warnings.map((warning, idx) => (
            <div key={idx} className="flex items-start gap-2 text-rose-400 bg-rose-950/20 p-2.5 rounded border border-rose-900/30">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{warning}</span>
            </div>
          ))}

          {strength.suggestions.map((sug, idx) => (
            <div key={idx} className="flex items-start gap-2 text-slate-300 bg-slate-950/40 p-2 rounded">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <span>{sug}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
