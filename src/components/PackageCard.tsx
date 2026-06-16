import React from 'react';
import { InvestmentPackage } from '../types';
import { formatUSD, formatKES } from '../utils';
import { Clock, TrendingUp, CheckCircle, Smartphone } from 'lucide-react';

interface PackageCardProps {
  key?: React.Key;
  pkg: InvestmentPackage;
  onSelect: (pkg: InvestmentPackage) => void;
  isSelected?: boolean;
}

export function PackageCard({ pkg, onSelect, isSelected = false }: PackageCardProps) {
  const profit = pkg.returnAmount - pkg.investAmount;
  const roiPercentage = Math.round((profit / pkg.investAmount) * 100);

  // Category specific styles with Sophisticated Dark accent mappings
  const categoryStyles = {
    Standard: {
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      accent: 'text-emerald-400',
    },
    Premium: {
      badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      accent: 'text-blue-400',
    },
    Vip: {
      badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      accent: 'text-purple-400',
    },
    Flash: {
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse',
      accent: 'text-amber-400',
    },
  }[pkg.category];

  return (
    <div
      onClick={() => onSelect(pkg)}
      className={`group relative flex flex-col justify-between rounded-2xl p-5 border text-slate-100 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-2xl ${
        isSelected
          ? 'bg-emerald-950/10 border-emerald-500 ring-1 ring-emerald-500/50 ring-offset-2 ring-offset-black'
          : 'bg-white/[0.03] border-white/10 hover:border-emerald-500/50'
      }`}
    >
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          {/* Header Area */}
          <div className="flex justify-between items-start mb-4">
            <span className={`text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-md font-bold border ${categoryStyles.badge}`}>
              {pkg.category} Pool
            </span>
            {pkg.tag && (
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                {pkg.tag}
              </span>
            )}
          </div>

          {/* Pricing Info */}
          <div className="mb-4">
            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Investment Pledge</div>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-light text-white italic font-serif">
                {formatUSD(pkg.investAmount)}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ~ {formatKES(pkg.investAmount)} KES
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
              Deposit to pool to start trading loop.
            </p>
          </div>

          {/* Returns & Benefits */}
          <div className="space-y-3 border-t border-white/5 pt-4 mb-5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Expected Return:</span>
              <div className="text-right">
                <span className="text-sm font-bold text-white font-mono">{formatUSD(pkg.returnAmount)}</span>
                <span className="text-[10px] text-slate-500 block font-mono">~ {formatKES(pkg.returnAmount)} KES</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2.5">
              <span className="text-slate-500">Profit Share:</span>
              <span className={`text-xs font-bold font-mono ${categoryStyles.accent}`}>
                +{formatUSD(profit)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Net Multiplier (ROI):</span>
              <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400`}>
                {roiPercentage}% Yield
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Lockup Cycle:</span>
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> {pkg.durationDays} {pkg.durationDays === 1 ? 'Day' : 'Days'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(pkg);
          }}
          className={`w-full py-2.5 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-300 mt-2 flex items-center justify-center space-x-1.5 ${
            isSelected
              ? 'bg-emerald-500 text-black font-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              : 'bg-white/5 border border-white/10 hover:bg-emerald-500 hover:text-black group-hover:bg-emerald-500 group-hover:text-black text-slate-200'
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          <span>{isSelected ? 'Active Selection' : 'Select Pool'}</span>
        </button>
      </div>
    </div>
  );
}
