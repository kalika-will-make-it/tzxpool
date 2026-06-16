import { useState } from 'react';
import { INVESTMENT_PACKAGES } from '../data';
import { formatUSD, formatKES } from '../utils';
import { Calculator, ArrowRight, Coins, Percent } from 'lucide-react';

interface YieldCalculatorProps {
  onSelectPackage: (packageId: string) => void;
}

export function YieldCalculator({ onSelectPackage }: YieldCalculatorProps) {
  const [calcAmount, setCalcAmount] = useState<number>(100);

  // Find corresponding or closest package
  const matchingPackage = [...INVESTMENT_PACKAGES]
    .sort((a, b) => Math.abs(a.investAmount - calcAmount) - Math.abs(b.investAmount - calcAmount))[0];

  const days = matchingPackage?.durationDays || 3;
  const returnVal = matchingPackage?.returnAmount || 0;
  const profit = returnVal - (matchingPackage?.investAmount || 0);
  const roiPercentage = matchingPackage ? Math.round((profit / matchingPackage.investAmount) * 100) : 0;

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/3 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/2 blur-3xl rounded-full" />

      <div className="relative">
        {/* Header Title */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-lg border border-emerald-500/10">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white tracking-tight font-display">Target Yield Calculator</h3>
            <p className="text-xs text-slate-400">Estimate returns and find matched high-yield pools instantly.</p>
          </div>
        </div>

        {/* Input slider & buttons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Select Investment Size</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{formatUSD(calcAmount)}</span>
              </div>
              
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value))}
                className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer accent-emerald-500 transition focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />

              <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-2">
                <span>Min: $20</span>
                <span>$250</span>
                <span>Max: $500</span>
              </div>
            </div>

            {/* Quick selectors for exact package levels */}
            <div>
              <span className="text-xs font-bold text-slate-505 block mb-2 tracking-wider uppercase">Standard Pool Levels</span>
              <div className="flex flex-wrap gap-2">
                {INVESTMENT_PACKAGES.map((pkg) => (
                  <button
                    key={pkg.id + '-quick'}
                    onClick={() => setCalcAmount(pkg.investAmount)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono border transition-all duration-200 ${
                      calcAmount === pkg.investAmount
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-black text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    ${pkg.investAmount}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calculator Output / Matching Offer Card */}
          <div className="bg-black/45 border border-white/10 rounded-xl p-5 relative">
            <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
              <Percent className="w-3 h-3 text-emerald-400" /> RECOMMENDED PLAN
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Matched Plan</span>
                <span className="text-sm font-semibold text-white mt-0.5 block">
                  Invest ${matchingPackage?.investAmount} & Let It Trade
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase block">Total Payout</span>
                  <span className="text-lg font-bold text-white font-mono">{formatUSD(returnVal)}</span>
                  <span className="text-[10px] text-slate-500 block font-mono">~ {formatKES(returnVal)} KES</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase block">Trade Duration</span>
                  <span className="text-lg font-bold text-white font-mono">
                    {days} {days === 1 ? 'Day' : 'Days'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Express maturation</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <div>
                  <span className="text-slate-500 font-bold tracking-widest uppercase block text-[9px]">Profit Margin</span>
                  <div className="text-emerald-400 font-bold font-mono text-[13px] mt-0.5">+{formatUSD(profit)} ({roiPercentage}% ROI)</div>
                </div>
                <button
                  onClick={() => onSelectPackage(matchingPackage.id)}
                  className="inline-flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-600 active:translate-y-0.5 text-black text-xs font-black uppercase tracking-wider px-3 py-2 rounded-lg transition duration-200"
                >
                  <span>Acquire</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
