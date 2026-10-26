import React, { useState } from 'react';
import { PLATFORM_POLICIES, auditPlatformCompliance } from '../utils/platformPolicies';
import { PlatformPolicy, PasswordGeneratorOptions } from '../types';
import {
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  ExternalLink,
  Sliders,
  Sparkles,
  Info,
  Key,
} from 'lucide-react';

interface PlatformPoliciesViewProps {
  currentPassword: string;
  onSetPassword: (password: string) => void;
  onApplyPreset: (platformId: 'google' | 'instagram' | 'facebook' | 'apple' | 'github') => void;
  generatorOptions: PasswordGeneratorOptions;
}

export const PlatformPoliciesView: React.FC<PlatformPoliciesViewProps> = ({
  currentPassword,
  onSetPassword,
  onApplyPreset,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'google' | 'instagram' | 'facebook'>('all');
  const [testPasswordInput, setTestPasswordInput] = useState(currentPassword);

  const displayedPolicies = PLATFORM_POLICIES.filter((p) => {
    if (selectedFilter === 'all') return true;
    return p.id === selectedFilter;
  });

  const handleTestPasswordChange = (val: string) => {
    setTestPasswordInput(val);
    onSetPassword(val);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-400" />
              <span>Platform Password Compliance & Policy Sync</span>
            </h2>
            <p className="text-xs text-slate-400">
              Major services enforce distinct length limits, character restrictions, and bcrypt truncation boundaries.
              Test compliance in real time and sync generation parameters with 1-click.
            </p>
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg shrink-0">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Platforms
            </button>
            <button
              onClick={() => setSelectedFilter('google')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedFilter === 'google'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Google
            </button>
            <button
              onClick={() => setSelectedFilter('instagram')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedFilter === 'instagram'
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Instagram
            </button>
            <button
              onClick={() => setSelectedFilter('facebook')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedFilter === 'facebook'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Facebook
            </button>
          </div>
        </div>

        {/* Live password test input */}
        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="test-pwd" className="text-slate-300 font-medium">
              Audit Password (Live Evaluation)
            </label>
            <span className="text-slate-500 font-mono tabular-nums">
              {testPasswordInput.length} chars
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="test-pwd"
              type="text"
              value={testPasswordInput}
              onChange={(e) => handleTestPasswordChange(e.target.value)}
              placeholder="Type or paste a password to verify policy compliance..."
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg font-mono text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            {currentPassword !== testPasswordInput && (
              <button
                onClick={() => setTestPasswordInput(currentPassword)}
                className="px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
              >
                Use Generated
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Platform Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {displayedPolicies.map((policy) => {
          const audit = auditPlatformCompliance(testPasswordInput, policy.id);

          return (
            <PlatformCard
              key={policy.id}
              policy={policy}
              audit={audit}
              onApplyPreset={() => onApplyPreset(policy.id as any)}
            />
          );
        })}
      </div>
    </div>
  );
};

interface PlatformCardProps {
  policy: PlatformPolicy;
  audit: ReturnType<typeof auditPlatformCompliance>;
  onApplyPreset: () => void;
}

const PlatformCard: React.FC<PlatformCardProps> = ({ policy, audit, onApplyPreset }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between space-y-5">
      <div className="space-y-4">
        {/* Card Header: Platform Name + Compliance Status */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-sm"
              style={{ backgroundColor: policy.brandColor }}
            >
              {policy.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{policy.name}</span>
              </h3>
              <div className="text-xs text-slate-400 mt-0.5">
                Length: {policy.minLength} – {policy.maxLength} chars · Recommended: {policy.recommendedLength}+
              </div>
            </div>
          </div>

          {/* Compliance Status */}
          <div className="shrink-0">
            {audit.isCompliant ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Compliant</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/60 border border-rose-800/80 text-rose-400 text-xs font-semibold">
                <ShieldAlert className="w-4 h-4" />
                <span>Non-Compliant</span>
              </div>
            )}
          </div>
        </div>

        {/* Policy Description */}
        <p className="text-xs text-slate-300 leading-relaxed">{policy.description}</p>

        {/* Live Rules Checklist */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Policy Checklist</span>
            <span className="font-mono text-slate-400 font-normal">
              {audit.ruleResults.filter((r) => r.passed).length}/{audit.ruleResults.length} passed
            </span>
          </div>

          <div className="space-y-1.5">
            {audit.ruleResults.map((rule) => (
              <div
                key={rule.ruleId}
                className={`flex items-start gap-2.5 p-2 rounded text-xs transition-colors ${
                  rule.passed
                    ? 'bg-emerald-950/20 text-emerald-300 border border-emerald-900/20'
                    : 'bg-rose-950/20 text-rose-300 border border-rose-900/30'
                }`}
              >
                {rule.passed ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5 flex-1">
                  <div className="font-medium text-slate-200">{rule.label}</div>
                  <div className="text-[11px] text-slate-400 leading-normal">{rule.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Allowed Symbols & Disallowed Patterns Info */}
        <div className="p-3 bg-slate-950/60 border border-slate-800/70 rounded-lg text-xs space-y-1 text-slate-300">
          <div>
            <strong className="text-slate-200">Permitted Symbols: </strong>
            <span className="text-slate-400">{policy.allowedSymbolsDescription}</span>
          </div>
          {policy.disallowedPatterns.length > 0 && (
            <div>
              <strong className="text-slate-200">Restrictions: </strong>
              <span className="text-rose-300/80">{policy.disallowedPatterns.join(', ')}</span>
            </div>
          )}
        </div>

        {/* MFA / 2FA Security Tips for this platform */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>Recommended Multi-Factor Setup:</span>
          </div>
          <ul className="text-xs text-slate-400 space-y-1 pl-4 list-disc marker:text-indigo-400">
            {policy.mfaTips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Card Footer Actions: Apply Policy Preset & Official Docs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
        <button
          onClick={onApplyPreset}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-600/20 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sync & Apply {policy.name} Policy</span>
        </button>

        <a
          href={policy.officialSecurityUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <span>Official Security Guide</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
