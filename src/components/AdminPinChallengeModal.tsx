import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldAlert, Lock, Unlock, Eye, EyeOff } from 'lucide-react';

interface AdminPinChallengeModalProps {
  onClose: () => void;
  onSuccess: () => void;
  correctPin: string;
}

export function AdminPinChallengeModal({
  onClose,
  onSuccess,
  correctPin,
}: AdminPinChallengeModalProps) {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input when modal opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyPress = (num: string) => {
    if (pin.length < correctPin.length) {
      setPin((prev) => prev + num);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const verifyPin = (submittedPin: string) => {
    if (submittedPin === correctPin) {
      onSuccess();
    } else {
      setError('ACCESS DENIED: INVALID ADMINISTRATIVE SIGNATURE');
      setIsShaking(true);
      setPin('');
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === correctPin.length) {
      verifyPin(pin);
    } else {
      setError(`Master key must be exactly ${correctPin.length} digits.`);
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if keys are typed inside other inputs
      if (document.activeElement?.tagName === 'INPUT' && document.activeElement !== inputRef.current) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        if (pin.length === correctPin.length) {
          verifyPin(pin);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pin]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with solid blur in harmony with design theme */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose} />

      {/* Modal Card container */}
      <div
        className={`relative bg-[#080808] border ${
          error ? 'border-rose-500/50 shadow-rose-900/10' : 'border-white/10 shadow-black'
        } rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl z-10 flex flex-col p-6 transition-all duration-300 ${
          isShaking ? 'animate-bounce' : ''
        }`}
      >
        {/* Top Header line */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2 text-amber-500">
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block">ENCRYPTED GATEWAY</span>
              <h3 className="text-sm font-black uppercase tracking-wider text-amber-550 font-mono">Sandbox Lockout</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Informative Label */}
        <div className="mb-6">
          <p className="text-xs text-slate-300 leading-relaxed text-center">
            Sandbox Desk contains global administrative rules to overwrite logs, verify screenshots, and fast-forward cycles. 
            <br />
            <span className="text-[10px] text-slate-500 mt-1.5 block">
              Provide the secure terminal entry key to authenticate authorization level.
            </span>
          </p>
        </div>

        {/* Hidden internal actual input field enabling virtual/actual focus */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            ref={inputRef}
            type="password"
            maxLength={correctPin.length}
            value={pin}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '');
              if (val.length <= correctPin.length) {
                setPin(val);
                setError('');
              }
            }}
            className="sr-only"
            aria-hidden="true"
          />

          {/* Dots representation mapping styled preview */}
          <div className="flex justify-center gap-3">
            {Array.from({ length: correctPin.length }).map((_, idx) => {
              const isFilled = idx < pin.length;
              const isCurrent = idx === pin.length;

              return (
                <div
                  key={idx}
                  onClick={() => inputRef.current?.focus()}
                  className={`w-9 h-11 rounded-xl flex items-center justify-center font-mono font-bold text-lg border transition-all duration-150 cursor-pointer ${
                    isCurrent
                      ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_8px_rgba(16,185,129,0.2)] text-white'
                      : isFilled
                      ? 'border-white/25 bg-white/5 text-emerald-400'
                      : 'border-white/10 bg-black/40 text-slate-600'
                  }`}
                >
                  {isFilled ? (
                    showPin ? (
                      pin[idx]
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    )
                  ) : (
                    <span className="text-[10px] text-slate-600 font-mono">-</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Indicators controller: Visibility and Clean up */}
          <div className="flex justify-between items-center px-2 text-[11px]">
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="text-slate-450 hover:text-white flex items-center gap-1.5 cursor-pointer transition text-xs font-medium"
            >
              {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showPin ? 'Hide PIN' : 'Reveal Digit Entry'}</span>
            </button>

            {pin.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="text-rose-455 hover:text-rose-400 cursor-pointer font-semibold uppercase tracking-wider text-[10px]"
              >
                Clear Input
              </button>
            )}
          </div>

          {/* Security alert feedback label */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl p-3 text-center text-xs font-black tracking-wide leading-normal uppercase">
              {error}
            </div>
          )}

          {/* Pin Numeric Touch Grid */}
          <div className="grid grid-cols-3 gap-2 bg-black/30 p-2 border border-white/5 rounded-2xl">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="h-12 bg-white/[0.02] hover:bg-white/[0.08] text-white font-mono text-base font-bold rounded-xl transition cursor-pointer flex items-center justify-center active:scale-95"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleBackspace}
              className="h-12 bg-white/[0.01] hover:bg-white/[0.06] text-slate-400 hover:text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center active:scale-95 uppercase tracking-wider"
            >
              Del
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="h-12 bg-white/[0.02] hover:bg-white/[0.08] text-white font-mono text-base font-bold rounded-xl transition cursor-pointer flex items-center justify-center active:scale-95"
            >
              0
            </button>
            <button
              type="submit"
              disabled={pin.length !== correctPin.length}
              className={`h-12 text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center ${
                pin.length === correctPin.length
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-black shadow-md shadow-emerald-500/10 cursor-pointer'
                  : 'bg-white/5 text-slate-500 cursor-not-allowed'
              }`}
            >
              Unlock
            </button>
          </div>
        </form>

        <div className="mt-4 flex items-center justify-center text-[10px] text-slate-600 font-mono gap-1">
          <Lock className="h-3 w-3" /> SECURITY GATEWAY LOG ACTIVE
        </div>
      </div>
    </div>
  );
}
