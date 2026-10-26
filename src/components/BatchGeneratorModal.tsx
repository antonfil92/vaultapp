import React, { useState, useEffect } from 'react';
import { PasswordGeneratorOptions } from '../types';
import { generatePassword, analyzePassword, copyToClipboard } from '../utils/crypto';
import { Copy, Check, RefreshCw, X, Layers } from 'lucide-react';

interface BatchGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: PasswordGeneratorOptions;
  onSelectPassword: (pwd: string) => void;
}

export const BatchGeneratorModal: React.FC<BatchGeneratorModalProps> = ({
  isOpen,
  onClose,
  options,
  onSelectPassword,
}) => {
  const [count, setCount] = useState<number>(10);
  const [generatedList, setGeneratedList] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const generateBatch = () => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      list.push(generatePassword(options));
    }
    setGeneratedList(list);
    setCopiedIndex(null);
    setCopiedAll(false);
  };

  useEffect(() => {
    if (isOpen) {
      generateBatch();
    }
  }, [isOpen, count]);

  if (!isOpen) return null;

  const handleCopySingle = async (pwd: string, index: number) => {
    await copyToClipboard(pwd);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = async () => {
    await copyToClipboard(generatedList.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Bulk Password Batch Generator</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Batch configuration toolbar */}
        <div className="flex items-center justify-between gap-3 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 text-slate-300">
            <span>Generate Quantity:</span>
            {[5, 10, 20].map((num) => (
              <button
                key={num}
                onClick={() => setCount(num)}
                className={`px-2.5 py-1 rounded font-mono font-medium transition-colors ${
                  count === num
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={generateBatch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate All</span>
            </button>
            <button
              onClick={handleCopyAll}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-semibold transition-colors ${
                copiedAll ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'All Copied' : 'Copy All'}</span>
            </button>
          </div>
        </div>

        {/* List of passwords */}
        <div className="overflow-y-auto space-y-2 flex-1 pr-1">
          {generatedList.map((pwd, idx) => {
            const analysis = analyzePassword(pwd);
            const isCopied = copiedIndex === idx;

            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg hover:border-slate-700 transition-colors gap-3"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="text-xs font-mono text-slate-500 w-5 text-right">{idx + 1}.</span>
                  <span className="font-mono text-sm text-slate-200 truncate select-all">{pwd}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="text-[11px] font-mono px-2 py-0.5 rounded"
                    style={{
                      color: analysis.color,
                      backgroundColor: `${analysis.color}15`,
                    }}
                  >
                    {analysis.score} pts
                  </span>

                  <button
                    onClick={() => {
                      onSelectPassword(pwd);
                      onClose();
                    }}
                    className="px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                  >
                    Use in Main
                  </button>

                  <button
                    onClick={() => handleCopySingle(pwd, idx)}
                    className={`p-1.5 rounded transition-colors ${
                      isCopied ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                    title="Copy to clipboard"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
