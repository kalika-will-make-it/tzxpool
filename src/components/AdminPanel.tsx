import { UserInvestment, WithdrawalRequest } from '../types';
import { formatUSD, formatDateTime, formatKES } from '../utils';
import {
  X,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Camera,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

interface AdminPanelProps {
  investments: UserInvestment[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onAdvanceTime: (id: string) => void; // speed-up lock maturation
  onClose: () => void;
  onResetAll: () => void;
  withdrawals: WithdrawalRequest[];
  onApproveWithdraw: (id: string) => void;
  onRejectWithdraw: (id: string) => void;
}

export function AdminPanel({
  investments,
  onApprove,
  onReject,
  onAdvanceTime,
  onClose,
  onResetAll,
  withdrawals,
  onApproveWithdraw,
  onRejectWithdraw,
}: AdminPanelProps) {
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  const pending = investments.filter((i) => i.status === 'pending');
  const active = investments.filter((i) => i.status === 'active');
  const past = investments.filter((i) => i.status === 'matured' || i.status === 'rejected');

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-[#0c0c0c] border-l border-white/10 shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-300">
      {/* Header bar */}
      <div className="p-6 border-b border-white/10 bg-[#0c0c0c] flex items-center justify-between sticky top-0 z-15">
        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-9 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight font-display">Platform Sandbox Desk</h3>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mt-0.5">Manage audit claims & speed-up locks</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onResetAll}
            className="text-[10px] px-2.5 py-1 bg-white/5 hover:bg-rose-500 hover:text-white text-rose-450 border border-white/10 rounded transition uppercase font-black tracking-widest cursor-pointer"
            title="Reset sandbox state"
          >
            Reset All
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Panel Content Scroll view */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Sandbox Instruction Info message */}
        <div className="bg-amber-500/5 border border-amber-500/15 p-4 rounded-xl text-xs text-amber-450 leading-relaxed">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white mb-0.5">Welcome to Sandbox Simulator Controls</p>
              In production, client screenshot uploads trigger cloud alerts or webhooks for platform staff. In this sandbox panel, you can approve submissions instantly to active-state trading, and simulate timeline completion in 1 click!
            </div>
          </div>
        </div>

        {/* 1. AUDIT QUEUE SECTION */}
        <div className="space-y-3.5">
          <h4 className="text-[10px] font-bold tracking-widest uppercase text-slate-500 font-mono flex items-center justify-between">
            <span>Screenshot Approvals Needed ({pending.length})</span>
            {pending.length > 0 && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />}
          </h4>

          {pending.length === 0 ? (
            <div className="bg-black/30 border border-white/5 p-6 rounded-xl text-center text-xs text-slate-500">
              No deposit submissions waiting for verification. Try select a pool & upload a receipt!
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((item) => (
                <div key={item.id + '-admin'} className="bg-black/40 rounded-xl p-4 border border-white/10">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                    <div>
                      <div className="text-[9px] text-slate-500 font-mono font-bold leading-none uppercase tracking-wider">
                        PLAN REF: #{item.id.slice(0, 8)}
                      </div>
                      <div className="text-sm font-semibold text-white mt-1">
                        Pledge Amount: {formatUSD(item.investAmount)} (~ {formatKES(item.investAmount)} KES)
                      </div>
                      <div className="text-xs text-emerald-450 font-bold font-mono">
                        Target Payout Return: {formatUSD(item.returnAmount)} within {item.durationDays}d
                      </div>
                    </div>

                    <div className="text-[11px] text-right text-slate-500 font-mono">
                      {formatDateTime(item.timestamp)}
                    </div>
                  </div>

                  {/* Payee Audit metadata specs */}
                  <div className="bg-black border border-white/10 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] mb-3 leading-none">
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[9px] mb-1.5 tracking-wider">M-Pesa / Money CODE</span>
                      <span className="text-white font-mono font-bold tracking-wider bg-white/5 px-2 py-1 rounded border border-white/5 inline-block">
                        {item.transactionId}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[9px] mb-1.5 tracking-wider">Payer details</span>
                      <span className="text-slate-300 truncate block mt-1 font-semibold">
                        {item.senderName} ({item.senderPhone})
                      </span>
                    </div>
                  </div>

                  {/* Screenshot Thumbnail action trigger */}
                  <div className="flex items-center space-x-3 mb-4 bg-black/60 p-2.5 rounded-lg border border-white/5">
                    <button
                      type="button"
                      onClick={() => setSelectedScreenshot(item.screenshotUrl)}
                      className="h-14 w-20 rounded border border-white/10 bg-black overflow-hidden shrink-0 hover:ring-2 hover:ring-emerald-500 transition relative group flex items-center justify-center cursor-pointer"
                    >
                      <img
                        src={item.screenshotUrl}
                        alt="Receipt preview thumbnail"
                        referrerPolicy="no-referrer"
                        className="object-cover h-full w-full opacity-65 group-hover:opacity-100 transition"
                      />
                      <Camera className="h-4 w-4 text-white absolute bg-black/50 p-0.5 rounded" />
                    </button>

                    <div className="text-[11px] text-slate-400 leading-normal">
                      <span className="font-bold text-slate-300 block">Screenshot Proof Received</span>
                      Click picture to inspect full image size. Ensure receipt transaction code validates.
                    </div>
                  </div>

                  {/* Admin decision triggers */}
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => onApprove(item.id)}
                      className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-black uppercase tracking-wider rounded-lg transition-all duration-200 active:translate-y-0.5 flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Approve Deposit</span>
                    </button>

                    <button
                      onClick={() => onReject(item.id)}
                      className="py-2 px-3 bg-white/5 hover:bg-white/10 text-rose-450 hover:text-rose-400 text-xs font-black uppercase tracking-wider rounded-lg border border-white/10 transition cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. LIVE ACTIVE POOLS TRACKER SECTION */}
        <div className="space-y-3.5 pt-4 border-t border-white/10">
          <h4 className="text-[10px] font-bold tracking-widest uppercase text-slate-500 font-mono">
            Active Trading Contracts / Pools ({active.length})
          </h4>

          {active.length === 0 ? (
            <div className="bg-black/30 border border-white/5 p-6 rounded-xl text-center text-xs text-slate-500">
              No active trading contracts available to manage.
            </div>
          ) : (
            <div className="space-y-3">
              {active.map((item) => {
                const durationMs = item.durationDays * 24 * 60 * 60 * 1000;
                const approveMark = item.approvedAt || item.timestamp;
                const releaseMark = approveMark + durationMs;
                const hrsRemaining = Math.max(0, Math.ceil((releaseMark - Date.now()) / (1000 * 60 * 60)));

                return (
                  <div key={item.id + '-active'} className="bg-black/40 rounded-xl p-4 border border-white/10 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[9px] text-slate-400 font-mono block uppercase tracking-wider">REF: {item.id.toUpperCase().slice(0, 8)}</span>
                        <h5 className="text-xs font-bold text-slate-200 mt-0.5">
                          {formatUSD(item.investAmount)} plan ({item.durationDays}d Lock)
                        </h5>
                      </div>

                      <span className="text-[9px] bg-emerald-500/10 text-emerald-450 border border-emerald-500/15 px-2 py-0.5 rounded font-bold font-mono uppercase">
                        ~{hrsRemaining || '0'}h Left
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs border-t border-white/5 pt-3 mt-1.5 bg-transparent">
                      <div>
                        <div className="text-[9px] text-slate-550 uppercase font-bold tracking-wide">Trading Yield Pool</div>
                        <div className="text-emerald-400 font-bold font-mono">{formatUSD(item.returnAmount)} Expected</div>
                      </div>

                      <button
                        onClick={() => onAdvanceTime(item.id)}
                        className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black text-[10px] font-black uppercase tracking-wider rounded flex items-center gap-1 hover:brightness-110 active:scale-95 transition cursor-pointer"
                        title="Immediately matures the lock timer"
                      >
                        <Zap className="h-3 w-3 text-black fill-black" />
                        <span>Instant Maturity</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* WITHDRAWAL PAYOUTS AUDIT QUEUE */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h4 className="text-[10px] font-bold tracking-widest uppercase text-slate-500 font-mono flex items-center justify-between">
            <span>Pending Withdrawal Payouts ({withdrawals.filter(w => w.status === 'pending').length})</span>
            {withdrawals.filter(w => w.status === 'pending').length > 0 && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />}
          </h4>

          {withdrawals.filter(w => w.status === 'pending').length === 0 ? (
            <div className="bg-[#050505] border border-white/5 p-5 rounded-xl text-center text-xs text-slate-505">
              No pending mobile money payouts requested.
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawals.filter(w => w.status === 'pending').map((item) => (
                <div key={item.id + '-admin'} className="bg-black/45 rounded-xl p-4 border border-white/10">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                    <div>
                      <div className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider">
                        PAYOUT REF: #{item.id.toUpperCase().slice(0, 8)}
                      </div>
                      <div className="text-sm font-semibold text-white mt-1">
                        Cash value: {formatUSD(item.amountUSD)} (~ {formatKES(item.amountUSD)} KES)
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">{formatDateTime(item.timestamp)}</span>
                  </div>

                  {/* Recipient meta */}
                  <div className="bg-black rounded-lg p-3 text-xs text-slate-350 border border-white/15 space-y-2 mb-3 leading-none">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payout Network:</span>
                      <span className="text-white font-bold">{item.network}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Target Mobile No:</span>
                      <span className="text-emerald-400 font-mono font-bold bg-white/5 px-2 py-1 rounded border border-white/5">{item.phone}</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      onClick={() => onApproveWithdraw(item.id)}
                      className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-black uppercase tracking-wider rounded-lg transition-all duration-200 active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Approve & Send Payout</span>
                    </button>
                    <button
                      onClick={() => onRejectWithdraw(item.id)}
                      className="py-2 px-3 bg-white/5 hover:bg-white/10 text-rose-450 hover:text-rose-400 text-xs font-black uppercase tracking-wider rounded-lg border border-white/10 transition cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. PLATFORM ARCHIVE LOGS */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h4 className="text-[10px] font-bold tracking-widest uppercase text-slate-500 font-mono">
            Platform Historical Register ({past.length})
          </h4>

          {past.length === 0 ? (
            <div className="bg-[#050505] border border-white/5 p-4 text-center rounded-lg text-xs text-slate-500 italic">
              No historical entries in system yet.
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {past.map((item) => (
                <div key={item.id + '-log'} className="bg-black/30 rounded-lg p-2.5 border border-white/5 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-mono text-[9px] text-slate-505 block uppercase tracking-wider">
                      #{item.id.slice(0, 6).toUpperCase()}
                    </span>
                    <span className="text-slate-350 block font-medium mt-0.5">
                      {item.senderName} paid ${item.investAmount}
                    </span>
                  </div>

                  <span className={`text-[8px] font-bold uppercase font-mono px-2 py-0.5 rounded ${
                    item.status === 'matured' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {item.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Screenshot Detailed viewer Modal overlay */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={() => setSelectedScreenshot(null)} />
          <div className="relative bg-[#0c0c0c] border border-white/10 p-3 rounded-2xl max-w-lg w-full z-[110] flex flex-col shadow-2xl">
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute -top-3 -right-3 h-8 w-8 bg-black hover:bg-white/5 border border-white/10 rounded-full flex items-center justify-center shadow-lg text-slate-200 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="max-h-[80vh] overflow-y-auto rounded-lg">
              <img
                src={selectedScreenshot}
                alt="Audit proof document inspection"
                referrerPolicy="no-referrer"
                className="w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
