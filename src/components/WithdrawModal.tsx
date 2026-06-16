import React, { useState } from 'react';
import { UserAccount, WithdrawalRequest } from '../types';
import { formatUSD, formatKES } from '../utils';
import { X, ArrowRight, ShieldCheck, Smartphone, Landmark, HelpCircle, Coins, Check } from 'lucide-react';

interface WithdrawModalProps {
  user: UserAccount;
  onClose: () => void;
  onSubmit: (amountUSD: number, phone: string, network: string) => void;
}

export function WithdrawModal({ user, onClose, onSubmit }: WithdrawModalProps) {
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [phone, setPhone] = useState<string>(user.phone);
  const [network, setNetwork] = useState<string>('Safaricom M-Pesa');
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Constants
  const MIN_WITHDRAWAL_USD = 5;

  const handleAmountChange = (val: string) => {
    setWithdrawAmount(val);
    setError('');
  };

  const currentBalance = user.balanceUSD;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);

    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid positive withdrawal amount.');
      return;
    }

    if (amount < MIN_WITHDRAWAL_USD) {
      setError(`Minimum withdrawal amount is ${formatUSD(MIN_WITHDRAWAL_USD)}.`);
      return;
    }

    if (amount > currentBalance) {
      setError(`Insufficient funds. Your current available balance is ${formatUSD(currentBalance)}.`);
      return;
    }

    if (!phone.trim()) {
      setError('Please provide a mobile money phone number for transfer.');
      return;
    }

    setSubmitting(true);
    // Simulate slight API processing
    setTimeout(() => {
      onSubmit(amount, phone.trim(), network);
      setSubmitting(false);
    }, 800);
  };

  const calculatedKES = withdrawAmount ? parseFloat(withdrawAmount) * 135 : 0; // 135.00 KES rate

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={onClose} />

      {/* Modal surface */}
      <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl z-10 flex flex-col">
        {/* Header bar */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#0a0a0a] z-10">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest">PAYOUT MODULE</span>
            <h3 className="text-xl font-semibold tracking-tight text-white font-display mt-0.5">Withdraw Earnings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Quick Balance Preview */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Available Wallet Balance</span>
              <div className="text-xl font-bold text-white font-mono mt-1">{formatUSD(currentBalance)}</div>
              <span className="text-[10px] text-slate-400 font-mono block">~ {formatKES(currentBalance)} KES</span>
            </div>
            <div className="h-10 w-10 bg-emerald-500/10 text-emerald-450 border border-emerald-500/10 rounded-xl flex items-center justify-center">
              <Coins className="h-5 w-5" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Amount */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-bold uppercase tracking-widest">
                Amount to Withdraw (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm leading-none">$</span>
                <input
                  type="number"
                  required
                  min={MIN_WITHDRAWAL_USD}
                  step="0.01"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  disabled={submitting}
                  className="w-full bg-black border border-white/10 rounded-xl pl-8 pr-20 py-3 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handleAmountChange(currentBalance.toFixed(2))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-white/5 hover:bg-emerald-500 hover:text-black px-2 py-1 rounded text-slate-300 font-bold transition-all cursor-pointer"
                >
                  MAX
                </button>
              </div>

              {withdrawAmount && !isNaN(parseFloat(withdrawAmount)) && (
                <div className="flex justify-between text-[11px] text-slate-400 tracking-wide font-mono mt-1 px-1">
                  <span>Transfer Rate: 1 USD = 135 KES</span>
                  <span className="text-emerald-400 font-bold">Payout Val: ~ {formatKES(parseFloat(withdrawAmount))} KES</span>
                </div>
              )}
            </div>

            {/* Mobile Network Selection */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-bold uppercase tracking-widest">
                Payout Channel Network
              </label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Safaricom M-Pesa">Safaricom M-Pesa (Direct)</option>
                <option value="Airtel Money">Airtel Money</option>
                <option value="Telkom T-Kash">Telkom T-Kash</option>
              </select>
            </div>

            {/* Mobile Phone Number */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-bold uppercase tracking-widest">
                Recipient Money Phone Number
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="07XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={submitting}
                  className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <span className="text-[9px] text-slate-500 block mt-1">
                Enter your exact mobile money wallet number to secure payouts.
              </span>
            </div>

            {/* Platform Security Reassurance */}
            <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3 flex gap-2.5 text-[11px] leading-relaxed text-slate-400">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-300">Automated Escrow Trading Gateway</p>
                <span>Payouts undergo automated ledger verification and clear directly to mobile wallets within 5–15 minutes.</span>
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-400 bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-xl text-center font-medium">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || currentBalance === 0}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-black font-black uppercase text-xs tracking-widest rounded-xl transition duration-200 flex items-center justify-center space-x-1.5 active:translate-y-0.5"
              >
                {submitting ? (
                  <span>Initiating Escrow Transfer...</span>
                ) : (
                  <>
                    <span>Request Payout Transfer &rarr;</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
