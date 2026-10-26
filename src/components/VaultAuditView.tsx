import React from 'react';
import { VaultItem } from '../types';
import { analyzePassword } from '../utils/crypto';
import { auditPlatformCompliance } from '../utils/platformPolicies';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Repeat,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface VaultAuditViewProps {
  vaultItems: VaultItem[];
  onGenerateReplacement: (item: VaultItem) => void;
  onOpenVault: () => void;
}

export const VaultAuditView: React.FC<VaultAuditViewProps> = ({
  vaultItems,
  onGenerateReplacement,
  onOpenVault,
}) => {
  if (vaultItems.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-white">No Stored Credentials to Audit</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Save credentials to your Encrypted Vault to receive an automated audit for weak passwords, duplicate credentials, and platform non-compliance.
          </p>
        </div>
        <button
          onClick={onOpenVault}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm"
        >
          Open Encrypted Vault
        </button>
      </div>
    );
  }

  // Calculate audit statistics
  const analyses = vaultItems.map((item) => ({
    item,
    analysis: analyzePassword(item.password),
    compliance: item.platform ? auditPlatformCompliance(item.password, item.platform) : null,
  }));

  // Identify password reuse
  const passwordUsageCount: Record<string, number> = {};
  vaultItems.forEach((item) => {
    passwordUsageCount[item.password] = (passwordUsageCount[item.password] || 0) + 1;
  });

  const weakItems = analyses.filter((a) => a.analysis.score < 60);
  const reusedItems = analyses.filter((a) => passwordUsageCount[a.item.password] > 1);
  const nonCompliantItems = analyses.filter((a) => a.compliance && !a.compliance.isCompliant);
  const strongItems = analyses.filter((a) => a.analysis.score >= 80 && passwordUsageCount[a.item.password] === 1);

  // Overall security health score
  const total = vaultItems.length;
  const healthScore = Math.max(
    0,
    Math.round(
      100 -
        (weakItems.length / total) * 45 -
        (reusedItems.length / total) * 35 -
        (nonCompliantItems.length / total) * 20
    )
  );

  let healthColor = '#10b981';
  let healthLabel = 'Excellent Security Posture';
  if (healthScore < 50) {
    healthColor = '#ef4444';
    healthLabel = 'Critical Risk: Action Required';
  } else if (healthScore < 80) {
    healthColor = '#f59e0b';
    healthLabel = 'Moderate Security: Improvements Recommended';
  }

  return (
    <div className="space-y-6">
      {/* Executive Security Health Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl backdrop-blur-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Vault Security & Breach Exposure Audit</span>
            </h2>
            <p className="text-xs text-slate-400">
              Evaluates cryptographic entropy, detects dangerous password reuse, and checks platform compliance.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800 shrink-0">
            <div className="text-right">
              <div className="text-[11px] text-slate-400">Security Score</div>
              <div className="text-lg font-bold font-mono tabular-nums" style={{ color: healthColor }}>
                {healthScore} / 100
              </div>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs"
              style={{
                backgroundColor: `${healthColor}20`,
                color: healthColor,
                border: `2px solid ${healthColor}`,
              }}
            >
              {healthScore}%
            </div>
          </div>
        </div>

        {/* 4 KPI tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-lg space-y-1">
            <span className="text-xs text-slate-400 block">Total Credentials</span>
            <span className="font-mono text-lg font-bold text-white tabular-nums">{total}</span>
          </div>

          <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-lg space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 block">Weak / Sub-standard</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <span className="font-mono text-lg font-bold text-rose-400 tabular-nums">
              {weakItems.length}
            </span>
          </div>

          <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-lg space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 block">Reused Passwords</span>
              <Repeat className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="font-mono text-lg font-bold text-amber-400 tabular-nums">
              {reusedItems.length}
            </span>
          </div>

          <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-lg space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 block">High Strength</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="font-mono text-lg font-bold text-emerald-400 tabular-nums">
              {strongItems.length}
            </span>
          </div>
        </div>
      </div>

      {/* Critical Action Items List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Security Recommendations & Non-Compliant Items</span>
        </h3>

        {weakItems.length === 0 && reusedItems.length === 0 && nonCompliantItems.length === 0 ? (
          <div className="p-6 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-sm font-semibold text-emerald-300">All Credentials Secure & Compliant</div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              None of your stored logins use repeated passwords or weak character combinations. Every credential meets platform policies.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {analyses
              .filter(
                (a) =>
                  a.analysis.score < 65 ||
                  passwordUsageCount[a.item.password] > 1 ||
                  (a.compliance && !a.compliance.isCompliant)
              )
              .map(({ item, analysis, compliance }) => {
                const isReused = passwordUsageCount[item.password] > 1;

                return (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{item.title}</span>
                        {item.platform && (
                          <span className="text-[11px] text-slate-400 capitalize">
                            ({item.platform})
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {analysis.score < 60 && (
                          <span className="text-rose-400 font-medium">
                            • Weak Entropy ({analysis.score}/100)
                          </span>
                        )}
                        {isReused && (
                          <span className="text-amber-400 font-medium">
                            • Reused on {passwordUsageCount[item.password]} accounts
                          </span>
                        )}
                        {compliance && !compliance.isCompliant && (
                          <span className="text-orange-400 font-medium">
                            • Fails {compliance.platformName} requirements
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400">
                        Login: <span className="font-mono text-slate-300">{item.username || 'No username'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onGenerateReplacement(item)}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Compliant Replacement</span>
                    </button>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};
