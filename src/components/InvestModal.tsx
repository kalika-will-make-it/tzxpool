import React, { useState, useRef, useEffect, ChangeEvent, DragEvent, FormEvent } from 'react';
import { InvestmentPackage } from '../types';
import { PAYMENT_PHONE_NUMBER, PAYMENT_RECIPIENT_NAME, USD_TO_KES_RATE } from '../data';
import { formatUSD, formatKES } from '../utils';
import {
  X,
  Copy,
  Check,
  Upload,
  Camera,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface InvestModalProps {
  pkg: InvestmentPackage;
  onClose: () => void;
  onSubmit: (data: {
    transactionId: string;
    senderPhone: string;
    senderName: string;
    screenshotUrl: string;
    notes?: string;
  }) => void;
  userPhone?: string;
  userName?: string;
}

export function InvestModal({ pkg, onClose, onSubmit, userPhone = '', userName = '' }: InvestModalProps) {
  const [step, setStep] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  // Form states
  const [transactionId, setTransactionId] = useState<string>('');
  const [senderPhone, setSenderPhone] = useState<string>(userPhone);
  const [senderName, setSenderName] = useState<string>(userName);
  const [notes, setNotes] = useState<string>('');
  const [screenshot, setScreenshot] = useState<string>(''); // base64 code
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profit calculation
  const profit = pkg.returnAmount - pkg.investAmount;
  const kessAmount = pkg.investAmount * USD_TO_KES_RATE;

  const handleCopy = () => {
    navigator.clipboard.writeText(PAYMENT_PHONE_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, JPEG).');
      return;
    }
    setError('');
    setScreenshotName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshot(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop handlers
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Fill in demo dummy receipt screenshot to ease testing
  const handleUseMockReceipt = () => {
    setScreenshotName('m_pesa_receipt_9845_secure.png');
    // Simple placeholder green-tick SVG represented as base64 to satisfy requirement
    setScreenshot(
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect fill="%230f172a" width="100%" height="100%"/><circle cx="150" cy="100" r="40" fill="%2310b981" opacity="0.2"/><path d="M135 100l10 10 20-20" stroke="%2310b981" stroke-width="4" stroke-linecap="round" fill="none"/></svg>'
    );
    if (!transactionId) {
      // Auto-generate realistic transaction ID sequence
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const randomId =
        alphabet[Math.floor(Math.random() * 26)] +
        alphabet[Math.floor(Math.random() * 26)] +
        Math.floor(Math.random() * 9) +
        alphabet[Math.floor(Math.random() * 26)] +
        Math.floor(100000 + Math.random() * 900000);
      setTransactionId(randomId);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    }
  };

  const handlePrev = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!transactionId.trim()) {
      setError('Transaction reference ID is required.');
      return;
    }
    if (!senderPhone.trim()) {
      setError('Sender Mobile Number is required.');
      return;
    }
    if (!senderName.trim()) {
      setError('Sender Name is required.');
      return;
    }
    if (!screenshot) {
      setError('Please upload a proof of payment screenshot.');
      return;
    }

    setError('');
    onSubmit({
      transactionId: transactionId.trim().toUpperCase(),
      senderPhone: senderPhone.trim(),
      senderName: senderName.trim(),
      screenshotUrl: screenshot,
      notes: notes.trim(),
    });
  };

  // Stop background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />

      {/* Main modal surface */}
      <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl z-10 flex flex-col">
        {/* Header bar */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#0a0a0a] z-10">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest">SECURE PORTAL</span>
            <h3 className="text-xl font-semibold tracking-tight text-white font-display mt-0.5">Pool Investment Portal</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Wizard Steps indicator */}
        <div className="bg-black/60 border-b border-white/10 py-3 px-6 flex items-center justify-between text-xs font-medium text-slate-450 font-mono">
          <div className="flex items-center space-x-2">
            <span className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-bold ${step === 1 ? 'bg-emerald-500 text-black' : 'bg-white/5 text-slate-300'}`}>1</span>
            <span className={step === 1 ? 'text-white' : ''}>Pledge Contract</span>
          </div>
          <div className="h-px bg-white/5 flex-1 mx-4" />
          <div className="flex items-center space-x-2">
            <span className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-bold ${step === 2 ? 'bg-emerald-500 text-black' : 'bg-white/5 text-slate-300'}`}>2</span>
            <span className={step === 2 ? 'text-white' : ''}>Payment & Screenshot</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6">
          {step === 1 ? (
            /* STEP 1: REVIEW PACKAGE DETAILS */
            <div className="space-y-6">
              <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Your Selection</span>
                <div className="flex justify-between items-baseline mt-1.5 pb-3.5 border-b border-white/5">
                  <span className="text-xl font-light text-white italic font-serif">
                    {formatUSD(pkg.investAmount)} Pool
                  </span>
                  <div className="text-right">
                    <span className="text-emerald-400 text-[10px] tracking-wider uppercase font-extrabold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25">
                      7 Days Standard
                    </span>
                  </div>
                </div>

                {/* Return values breakdown */}
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-bold tracking-widest uppercase">EXPECTED PAYOUT</span>
                    <span className="text-lg font-bold text-white font-mono">{formatUSD(pkg.returnAmount)}</span>
                    <span className="text-[10px] text-slate-500 block font-mono">~ {formatKES(pkg.returnAmount)} KES</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-bold tracking-widest uppercase">GUARANTEED PROFIT</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">+{formatUSD(profit)}</span>
                    <span className="text-[10px] text-emerald-500/80 block">Payout on maturation date</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 text-xs">
                  <div>
                    <span className="text-slate-550 block">Duration Locked</span>
                    <span className="text-slate-200 font-bold font-mono">
                      {pkg.durationDays} {pkg.durationDays === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-550 block">Exchange Rate Index</span>
                    <span className="text-slate-200 font-mono">1 USD = {USD_TO_KES_RATE} KES</span>
                  </div>
                </div>
              </div>

              {/* Security terms & warning notes */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-slate-300">
                <ShieldCheck className="h-5 w-5 text-emerald-450 shrink-0" />
                <div>
                  <h4 className="font-bold text-white mb-0.5">Pool Protection Protocol</h4>
                  <p className="text-slate-400 leading-relaxed">
                    Deposits are safely pooled into algorithmic market-neutral currency trades managed by expert strategies. Funds will be unlocked plus earnings automatically within the locked window.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleNext}
                  className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 font-black text-xs uppercase tracking-widest text-black rounded-xl transition duration-250 flex items-center justify-center space-x-1.5 select-none active:translate-y-0.5"
                >
                  <span>Agree & Proceed to Payment</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: PAYMENT & SCREENSHOT SUBMISSION */
            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Payment Instructions Board */}
              <div className="bg-black/60 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center space-x-1 mb-2.5">
                  <Smartphone className="h-4 w-4 text-emerald-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Direct Mobile Money Instructions
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
                  Send the exact investment amount via Mobile Money (M-Pesa, etc.) using the phone number below. Keep the transaction SMS and screenshot.
                </p>

                {/* Amount converting display */}
                <div className="grid grid-cols-2 gap-3 mt-4 mb-4 border-y border-white/5 py-3.5">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">AMOUNT TO PAY (USD)</span>
                    <div className="text-xl font-black text-white font-mono">{formatUSD(pkg.investAmount)}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">REQUIRED KES VALUE (approx.)</span>
                    <div className="text-xl font-black text-emerald-400 font-mono">{formatKES(pkg.investAmount)} KES</div>
                  </div>
                </div>

                {/* Payment telephone detail */}
                <div className="bg-[#050505] border border-white/10 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">RECIPIENT MERCHANT NUMBER</span>
                    <div className="text-lg font-black text-white font-mono tracking-wider">{PAYMENT_PHONE_NUMBER}</div>
                    <span className="text-[10px] text-emerald-400 font-semibold">{PAYMENT_RECIPIENT_NAME}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex h-11 w-11 hover:bg-white/5 flex-col items-center justify-center rounded-xl border border-white/10 text-slate-350 hover:text-white transition group"
                  >
                    {copied ? (
                      <Check className="h-4 ring-2 ring-emerald-500/20 text-emerald-400 bg-emerald-500/10 p-1.5 rounded-lg w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="text-[8px] font-bold text-slate-500 mt-1 uppercase">Copy</span>
                  </button>
                </div>
              </div>

              {/* Form Input fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Transaction ref input */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-bold uppercase tracking-widest">
                    Transaction Code ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. QE45FG67HJ"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono uppercase focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-[9px] text-slate-500 block mt-0.5">Required for Mpm-Receipt index.</span>
                </div>

                {/* Sender phone input */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-bold uppercase tracking-widest">
                    Payee Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 07XXXXXXXX"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-[9px] text-slate-500 block mt-0.5">The mobile money number you paid from.</span>
                </div>

                {/* Sender Name input */}
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 block mb-1 font-bold uppercase tracking-widest">
                    Payee Account Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Receipt screenshot section */}
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-bold uppercase tracking-widest">
                  Upload Payment Snapshot / Screenshot
                </label>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[140px] ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-500/5'
                      : screenshot
                      ? 'border-emerald-600/50 bg-black'
                      : 'border-white/10 hover:border-emerald-500/30 bg-white/[0.01]'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {screenshot ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-emerald-400 justify-center">
                        <Camera className="h-5 w-5" />
                        <span className="text-xs font-bold font-mono text-white truncate max-w-sm">
                          {screenshotName}
                        </span>
                      </div>
                      <div className="relative mx-auto border border-white/10 rounded-lg overflow-hidden h-24 w-40">
                        <img
                          src={screenshot}
                          alt="Receipt Preview"
                          referrerPolicy="no-referrer"
                          className="object-cover h-full w-full"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">Click or drag another image to replace.</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="p-3 bg-white/5 border border-white/10 text-slate-400 rounded-xl inline-flex group-hover:scale-105 transition-transform duration-200">
                        <Upload className="h-5 w-5 text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-300 font-bold">
                        Drag and drop receipt image or <span className="text-emerald-400">browse</span>
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">Supports JPEG, png, jpg up to 5MB.</p>
                    </div>
                  )}
                </div>

                {/* Quick test convenience helper */}
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] text-slate-500 font-medium block">
                    No physical receipt?
                  </span>
                  <button
                    type="button"
                    onClick={handleUseMockReceipt}
                    className="text-[10px] bg-white/5 border border-white/10 hover:bg-emerald-500 hover:text-black px-2 py-1 rounded text-slate-350 font-bold transition-all"
                  >
                    ⚡ Use Demo Sample Receipt
                  </button>
                </div>
              </div>

              {/* Form Validation Errors */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center space-x-2 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-1/3 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-slate-300 rounded-xl transition flex items-center justify-center space-x-1 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  className="w-2/3 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs uppercase tracking-widest text-black rounded-xl transition duration-250 flex items-center justify-center space-x-1.5 active:translate-y-0.5"
                >
                  <span>Submit Trading Bid &rarr;</span>
                  <TrendingUp className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
