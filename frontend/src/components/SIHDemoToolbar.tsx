import React, { useState } from 'react';
import {
  Sparkles,
  Users,
  TestTube2,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Check,
  Zap,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { api } from '../services/api.ts';

interface SIHDemoToolbarProps {
  onLoadSampleLeaf?: (sampleKey: string) => void;
  onRefreshData?: () => void;
}

export const SIHDemoToolbar: React.FC<SIHDemoToolbarProps> = ({ onLoadSampleLeaf, onRefreshData }) => {
  const { user, quickSwitchPersona } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const handleReset = async () => {
    if (confirm('Reset AgriVision AI database to pristine Smart India Hackathon demonstration state?')) {
      try {
        await api.resetDemoData();
        setResetMessage('Database successfully reset to seed state!');
        setTimeout(() => setResetMessage(''), 3000);
        if (onRefreshData) onRefreshData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-40">
      {/* Collapsed Pill */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-stone-900/90 hover:bg-stone-900 text-white text-xs font-semibold shadow-lg backdrop-blur-md border border-stone-700 transition-all hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Evaluator Quick-Bar</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
        </button>
      ) : (
        /* Expanded Control Panel */
        <div className="bg-stone-900 text-white rounded-2xl shadow-2xl border border-stone-700 p-4 w-80 sm:w-96 backdrop-blur-lg animate-in fade-in slide-in-from-bottom-3">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-xs tracking-wider uppercase text-stone-200">
                Evaluator Testing Panel
              </h4>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-stone-400 hover:text-white p-1 rounded-md"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Persona Switch */}
          <div className="mt-3">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
              Switch Persona & Region
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                onClick={() => quickSwitchPersona('kolar_farmer')}
                className={`text-left p-2 rounded-lg border transition-all ${user?.email.includes('ramesh')
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-semibold'
                  : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-800'
                  }`}
              >
                <div className="font-medium truncate">Ramesh Gowda</div>
                <div className="text-[10px] text-stone-400">Tomato • Kolar (KN)</div>
              </button>

              <button
                onClick={() => quickSwitchPersona('punjab_farmer')}
                className={`text-left p-2 rounded-lg border transition-all ${user?.email.includes('harpreet')
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-semibold'
                  : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-800'
                  }`}
              >
                <div className="font-medium truncate">Harpreet Singh</div>
                <div className="text-[10px] text-stone-400">Wheat • Punjab (HI)</div>
              </button>

              <button
                onClick={() => quickSwitchPersona('ap_farmer')}
                className={`text-left p-2 rounded-lg border transition-all ${user?.email.includes('venkat')
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-semibold'
                  : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-800'
                  }`}
              >
                <div className="font-medium truncate">K. Venkat Reddy</div>
                <div className="text-[10px] text-stone-400">Chilli • Guntur (TE)</div>
              </button>

              <button
                onClick={() => quickSwitchPersona('kolar_officer')}
                className={`text-left p-2 rounded-lg border transition-all ${user?.role === 'OFFICER'
                  ? 'bg-blue-950/80 border-blue-500 text-blue-300 font-semibold'
                  : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-800'
                  }`}
              >
                <div className="font-medium truncate">Dr. ravi kishnan</div>
                <div className="text-[10px] text-stone-400">Govt Agri Officer</div>
              </button>
            </div>
          </div>

          {/* Instant Disease Leaf Test Samples */}
          {onLoadSampleLeaf && (
            <div className="mt-3 pt-3 border-t border-stone-800">
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
                1-Click Leaf CV Test Samples
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  onClick={() => onLoadSampleLeaf('tomato_early_blight')}
                  className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md border border-stone-700 text-left truncate"
                >
                  🍂 Tomato Early Blight
                </button>
                <button
                  onClick={() => onLoadSampleLeaf('potato_late_blight')}
                  className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md border border-stone-700 text-left truncate"
                >
                  🥔 Potato Late Blight
                </button>
                <button
                  onClick={() => onLoadSampleLeaf('rice_blast')}
                  className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md border border-stone-700 text-left truncate"
                >
                  🌾 Rice Blast Fungus
                </button>
                <button
                  onClick={() => onLoadSampleLeaf('healthy_leaf')}
                  className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md border border-stone-700 text-left truncate text-emerald-400"
                >
                  🌿 Healthy Leaf
                </button>
              </div>
            </div>
          )}

          {/* Database Reset */}
          <div className="mt-3 pt-3 border-t border-stone-800 flex items-center justify-between">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-rose-400 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo DB</span>
            </button>
            <span className="text-[10px] text-stone-500">Production Build</span>
          </div>

          {resetMessage && (
            <p className="mt-2 text-xs text-emerald-400 bg-emerald-950/60 p-1.5 rounded border border-emerald-800">
              {resetMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
