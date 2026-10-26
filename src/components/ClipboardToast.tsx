import React, { useEffect, useState } from 'react';
import { Check, Shield, Trash2, X } from 'lucide-react';
import { copyToClipboard } from '../utils/crypto';

interface ClipboardToastProps {
  isVisible: boolean;
  onClose: () => void;
  copiedText: string;
}

export const ClipboardToast: React.FC<ClipboardToastProps> = ({
  isVisible,
  onClose,
  copiedText,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const [autoClearActive, setAutoClearActive] = useState<boolean>(true);

  useEffect(() => {
    if (!isVisible) {
      setSecondsRemaining(30);
      return;
    }

    setSecondsRemaining(30);

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (autoClearActive) {
            // Overwrite clipboard with blank string for safety
            copyToClipboard('');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, autoClearActive]);

  if (!isVisible) return null;

  const handleManualClear = () => {
    copyToClipboard('');
    onClose();
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white">Copied to Clipboard</h4>
            <p className="text-[11px] text-slate-400">
              Ready to paste. For security, auto-clear will wipe the clipboard buffer.
            </p>

            <div className="flex items-center gap-2 pt-1 text-[11px]">
              <span className="flex items-center gap-1 text-indigo-400 font-mono tabular-nums">
                <Shield className="w-3 h-3" />
                <span>Auto-clear in {secondsRemaining}s</span>
              </span>

              <button
                onClick={handleManualClear}
                className="text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                title="Wipe clipboard now"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear Now</span>
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 p-1 rounded"
          title="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
