import { useEffect, useState } from 'react';
import { UserInvestment, WithdrawalRequest } from '../types';
import { formatUSD, formatDateTime, formatKES, getDaysHoursMinsRemaining } from '../utils';
import {
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  HelpCircle,
  ChevronRight,
  Sparkles,
  ArrowRightLeft,
  Banknote,
} from 'lucide-react';

interface PortfolioViewerProps {
  investments: UserInvestment[];
  onClaimMatured: (investmentId: string) => void;
  onRequestRefund: (investmentId: string) => void;
  withdrawals?: WithdrawalRequest[];
}

export function PortfolioViewer({
  investments,
  onClaimMatured,
  onRequestRefund,
  withdrawals = [],
}: PortfolioViewerProps) {
  // Safe ticker triggers recalculation every second
  const [, setTick] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (investments.length === 0) {
    return (
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 text-center max-w-lg mx-auto">
        <div className="mx-auto w-12 h-12 bg-white/5 text-slate-450 border border-white/10 rounded-xl flex items-center justify-center mb-4 pb-0.5">
          <TrendingUp className="h-5 w-5 text-emerald-350" />
        </div>
        <h3 className="text-base font-medium text-white font-display">No Active Pools Yet</h3>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          Select an investment package from the list above, make payment to the designated cash number, and secure your trading slot. Your investments will display here.
        </p>
      </div>
    );
  }

  // Segment allocations
  const activeAndMatured = investments.filter((i) => i.status === 'active' || i.status === 'matured');
  const pendingAudits = investments.filter((i) => i.status === 'pending' || i.status === 'rejected');

  return (
    <div className="space-y-6">
      {/* SECTION 1: ACTIVE & COMPLETED POOLS */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold tracking-widest uppercase text-slate-500 font-display flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-emerald-500" /> Live Portfolios & Yields
        </h3>

        {activeAndMatured.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl text-center text-xs text-slate-450">
            No active or matured investment pools. Submit a payment verification to start.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAndMatured.map((item) => {
              // Calculate duration timing
              const durationMs = item.durationDays * 24 * 60 * 60 * 1000;
              const approveDate = item.approvedAt || item.timestamp;
              const maturityDate = approveDate + durationMs;
              const timeDetails = getDaysHoursMinsRemaining(maturityDate);

              // Calculate elapsed percentage
              const totalDuration = maturityDate - approveDate;
              const elapsed = Date.now() - approveDate;
              const progressPercentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

              const isFullyMatured = timeDetails.isOver || item.status === 'matured';

              return (
                <div
                  key={item.id}
                  className={`bg-[#0a0a0a] border rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-white/15 ${
                    isFullyMatured
                      ? 'border-emerald-500/30 shadow-sm shadow-emerald-990/10'
                      : 'border-white/10'
                  }`}
                >
                  <div>
                    {/* Header line detail */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold font-mono block tracking-wider">
                          POOL REF: #{item.id.slice(0, 8).toUpperCase()}
                        </span>
                        <h4 className="text-sm font-semibold text-white mt-1">
                          Invested {formatUSD(item.investAmount)} → Returns {formatUSD(item.returnAmount)}
                        </h4>
                      </div>

                      {isFullyMatured ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          MATURED
                        </span>
                      ) : (
                        <div className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-emerald-500/5 text-emerald-450 border border-emerald-500/10 text-[10px] font-bold uppercase animate-pulse">
                          <Clock className="w-3 h-3" />
                          <span>TRADING LOOP</span>
                        </div>
                      )}
                    </div>

                    {/* Timeline visualization */}
                    {!isFullyMatured ? (
                      <div className="space-y-2 my-4">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-400">Countdown:</span>
                          <span className="text-white font-mono">
                            {timeDetails.days > 0 ? `${timeDetails.days}d ` : ''}
                            {timeDetails.hours}h {timeDetails.minutes}m {timeDetails.seconds}s
                          </span>
                        </div>
                        {/* Progress Bar Container */}
                        <div className="w-full bg-black h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-550 font-mono">
                          <span>Started: {formatDateTime(approveDate)}</span>
                          <span>Complete: {formatDateTime(maturityDate)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-emerald-550/5 rounded-xl border border-emerald-500/15 p-3.5 my-4">
                        <div className="flex items-start gap-2 text-xs leading-relaxed text-slate-300">
                          <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-white block">Trading Term Concluded!</span>
                            Your pool completed trades successfully yielding a full payout of <strong className="text-emerald-450">{formatUSD(item.returnAmount)}</strong>.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Area */}
                  <div className="border-t border-white/5 pt-3.5 mt-2 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase tracking-wider">VERIFIED DEPOSIT</span>
                      <span className="text-slate-200 font-mono text-[11px] uppercase tracking-wide">
                        {item.transactionId}
                      </span>
                    </div>

                    {item.status === 'active' && isFullyMatured ? (
                      <button
                        onClick={() => onClaimMatured(item.id)}
                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs uppercase tracking-wider text-black rounded-lg transition duration-200 flex items-center space-x-1.5 active:translate-y-0.5"
                      >
                        <Banknote className="h-3.5 w-3.5" />
                        <span>Withdraw Return</span>
                      </button>
                    ) : item.status === 'matured' ? (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center space-x-1 p-1 px-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Claimed & Paid to Wallet</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-500 italic">
                        Yield generates automatically
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: AUDITS & REJECTIONS */}
      {pendingAudits.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold tracking-widest uppercase text-slate-500 font-display">
            Pending Deposits & Audit Queue
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingAudits.map((item) => (
              <div
                key={item.id}
                className={`bg-[#0a0a0a] border rounded-2xl p-4 flex flex-col justify-between ${
                  item.status === 'pending' ? 'border-amber-500/25 bg-amber-500/[0.02]' : 'border-rose-500/25 bg-rose-500/[0.02]'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[9px] text-slate-550 font-bold block font-mono">
                        VERIFICATION QUEUE: #{item.id.slice(0, 8)}
                      </span>
                      <h4 className="text-xs font-semibold text-white mt-1">
                        Deposit {formatUSD(item.investAmount)} for {formatUSD(item.returnAmount)} Loop
                      </h4>
                    </div>

                    {item.status === 'pending' ? (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        In Audit
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Audit Failed
                      </span>
                    )}
                  </div>

                  {item.status === 'pending' ? (
                    <div className="bg-black/40 border border-white/5 p-2.5 rounded-xl text-[11px] text-slate-300 leading-relaxed mb-3">
                      <div className="flex items-start gap-1.5 text-slate-350">
                        <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5 animate-spin" style={{ animationDuration: '6s' }} />
                        <div>
                          <strong>Verification Pending:</strong> Ledger validator checking code <code className="text-white font-mono bg-black px-1.5 py-0.5 rounded text-[10px] border border-white/5">{item.transactionId}</code> against incoming payments ledger.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-xl text-xs text-rose-450 mb-3">
                      <div className="flex items-start gap-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-450 shrink-0 mt-0.5" />
                        <div>
                          <strong>Verification Rejected:</strong> The Transaction Code did not match our system entries. Re-submit or adapt request using administrative toolbox.
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-white/5 pt-2 bg-transparent">
                  <div>
                    <span className="block font-bold text-[9px] text-slate-550">SENDER ACCT</span>
                    <span className="text-slate-300 font-mono mt-0.5 block">{item.senderName} ({item.senderPhone})</span>
                  </div>

                  {item.status === 'rejected' && (
                    <button
                      onClick={() => onRequestRefund(item.id)}
                      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded-md font-bold transition border border-white/10"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: MOBILE MONEY WITHDRAWALS */}
      {withdrawals.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h3 className="text-xs font-bold tracking-widest uppercase text-slate-500 font-display flex items-center gap-1.5">
            <ArrowRightLeft className="h-4 w-4 text-emerald-500" /> Mobile Money Withdrawals
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {withdrawals.map((item) => (
              <div
                key={item.id}
                className={`bg-[#0a0a0a] border rounded-2xl p-4 flex flex-col justify-between ${
                  item.status === 'pending'
                    ? 'border-amber-500/20 bg-amber-500/[0.01]'
                    : item.status === 'completed'
                    ? 'border-emerald-500/20 bg-emerald-500/[0.01]'
                    : 'border-rose-500/25 bg-rose-500/[0.01]'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[9px] text-slate-550 font-bold block font-mono">
                        PAYOUT REF: #{item.id.slice(0, 8).toUpperCase()}
                      </span>
                      <h4 className="text-sm font-semibold text-white mt-1">
                        Cash out: {formatUSD(item.amountUSD)}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Value: ~ {formatKES(item.amountUSD)} KES
                      </span>
                    </div>

                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      item.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : item.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-450 border border-rose-500/20'
                    }`}>
                      {item.status === 'pending' ? 'Pending Payout' : item.status === 'completed' ? 'Completed' : 'Failed'}
                    </span>
                  </div>

                  {item.status === 'pending' ? (
                    <p className="text-[11px] text-slate-400 leading-normal mb-2 bg-[#050505] border border-white/5 p-2 rounded-xl">
                      Queue state: Reconciling ledger values. Transfer will execute automatically via Mobile Money API Gateway.
                    </p>
                  ) : item.status === 'completed' ? (
                    <p className="text-[11px] text-slate-400 leading-normal mb-2 bg-emerald-500/5 border border-emerald-500/10 p-2 rounded-xl">
                      Success state: Paid to account via mobile money gateway successfully! {item.completedAt && `at ${formatDateTime(item.completedAt)}`}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 leading-normal mb-2 bg-rose-500/5 border border-rose-500/10 p-2 rounded-xl">
                      Audit failed: Payout could not be authorized. Balance was refunded.
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-white/5 pt-2 mt-2 bg-transparent">
                  <div>
                    <span className="block font-bold text-[9px] text-slate-550">RECIPIENT NUMBER</span>
                    <span className="text-slate-350 font-semibold">{item.phone} ({item.network})</span>
                  </div>
                  <span className="text-slate-500 font-mono">{formatDateTime(item.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
