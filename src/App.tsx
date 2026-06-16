import React, { useState, useEffect, FormEvent } from 'react';
import { InvestmentPackage, UserInvestment, UserAccount, SystemNotification, WithdrawalRequest } from './types';
import { INVESTMENT_PACKAGES, USD_TO_KES_RATE, PAYMENT_PHONE_NUMBER } from './data';
import { Header } from './components/Header';
import { PackageCard } from './components/PackageCard';
import { InvestModal } from './components/InvestModal';
import { PortfolioViewer } from './components/PortfolioViewer';
import { AdminPanel } from './components/AdminPanel';
import { YieldCalculator } from './components/YieldCalculator';
import { WithdrawModal } from './components/WithdrawModal';
import { formatUSD, formatKES, formatDateTime } from './utils';
import { auth, googleAuthProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  subscribeUserProfile,
  subscribeInvestments,
  subscribeAllInvestments,
  createInvestment,
  updateInvestment,
  deleteInvestment,
  subscribeWithdrawals,
  subscribeAllWithdrawals,
  createWithdrawal,
  updateWithdrawal,
  subscribeNotifications,
  createNotification
} from './dbService';
import {
  TrendingUp,
  Coins,
  ShieldCheck,
  Smartphone,
  Info,
  ChevronDown,
  HelpCircle,
  PlusCircle,
  Clock,
  Briefcase,
  Layers,
  CheckCircle2,
  AlertCircle,
  User,
  ExternalLink,
  DollarSign,
  ArrowUpRight,
  X,
} from 'lucide-react';

export default function App() {
  // Firebase Auth and Profile States
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserAccount | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);

  // Core App States (synchronized in real-time)
  const [investments, setInvestments] = useState<UserInvestment[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  // UI state controllers
  const [activeTab, setActiveTab] = useState<'pools' | 'portfolio' | 'calculator' | 'faqs'>('pools');
  const [selectedPackage, setSelectedPackage] = useState<InvestmentPackage | null>(null);
  const [showWithdraw, setShowWithdraw] = useState<boolean>(false);
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [faqOpenIdx, setFaqOpenIdx] = useState<number | null>(0);

  // Registration modal state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regError, setRegError] = useState('');

  // 1. Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setFirebaseUser(authUser);
      if (authUser) {
        setProfileLoading(true);
        if (authUser.displayName) {
          setRegName(authUser.displayName);
        }
      } else {
        setUser(null);
        setInvestments([]);
        setWithdrawals([]);
        setNotifications([]);
        setProfileLoading(false);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time subscriptions for logged in user data
  useEffect(() => {
    if (!firebaseUser) return;

    // Subscribe to profile doc
    const unsubProfile = subscribeUserProfile(firebaseUser.uid, (profile) => {
      setUser(profile);
      setProfileLoading(false);
    });

    return () => {
      unsubProfile();
    };
  }, [firebaseUser]);

  // Subscribe to investments
  useEffect(() => {
    if (!firebaseUser) return;

    let unsub: () => void;
    if (showAdmin) {
      unsub = subscribeAllInvestments(setInvestments);
    } else {
      unsub = subscribeInvestments(firebaseUser.uid, setInvestments);
    }

    return () => {
      if (unsub) unsub();
    };
  }, [firebaseUser, showAdmin]);

  // Subscribe to withdrawals
  useEffect(() => {
    if (!firebaseUser) return;

    let unsub: () => void;
    if (showAdmin) {
      unsub = subscribeAllWithdrawals(setWithdrawals);
    } else {
      unsub = subscribeWithdrawals(firebaseUser.uid, setWithdrawals);
    }

    return () => {
      if (unsub) unsub();
    };
  }, [firebaseUser, showAdmin]);

  // Subscribe to notifications
  useEffect(() => {
    if (!firebaseUser) return;

    const unsub = subscribeNotifications(firebaseUser.uid, setNotifications);
    return () => {
      unsub();
    };
  }, [firebaseUser]);

  // Google Sign In Submit Action
  const handleGoogleSignIn = async () => {
    try {
      setAuthLoading(true);
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error) {
      console.error('Google Sign In failed:', error);
      setRegError('Google Auth failed. Please retry.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Auth Submit Action for Phone/Profile registration
  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    if (!regName.trim() || !regPhone.trim()) {
      setRegError('Please provide both your name and mobile number.');
      return;
    }
    try {
      setRegError('');
      await createUserProfile(firebaseUser.uid, firebaseUser.email || '', regName.trim(), regPhone.trim());
      
      // Trigger welcoming log
      await addNotification(
        'Account Session Verified',
        `Welcome, ${regName.trim()}. Your secure Firestore profile has been created. Select a pool to start trading!`,
        'success'
      );
    } catch (err) {
      console.error('Failed to create account profile:', err);
      setRegError('Failed to save profile. Please try again.');
    }
  };

  // Helper: Append system event notification in Firestore
  const addNotification = async (title: string, message: string, type: 'info' | 'success' | 'warning') => {
    if (!firebaseUser) return;
    const newNotif: SystemNotification = {
      id: 'notif-' + Date.now() + Math.random().toString(36).slice(2, 5),
      title,
      message,
      type,
      timestamp: Date.now(),
      read: false,
    };
    await createNotification({ ...newNotif, userId: firebaseUser.uid });
  };

  const handleSelectPackage = (pkg: InvestmentPackage) => {
    setSelectedPackage(pkg);
  };

  const handleSelectPackageById = (id: string) => {
    const matched = INVESTMENT_PACKAGES.find((p) => p.id === id);
    if (matched) {
      setSelectedPackage(matched);
    }
  };

  // Invest Form submit triggers Verification queue in Firestore
  const handleInvestSubmit = async (formData: {
    transactionId: string;
    senderPhone: string;
    senderName: string;
    screenshotUrl: string;
    notes?: string;
  }) => {
    if (!selectedPackage || !firebaseUser) return;

    const newInvestment: UserInvestment = {
      id: 'inv-' + Math.random().toString(36).substring(2, 9),
      packageId: selectedPackage.id,
      investAmount: selectedPackage.investAmount,
      returnAmount: selectedPackage.returnAmount,
      durationDays: selectedPackage.durationDays,
      timestamp: Date.now(),
      status: 'pending',
      transactionId: formData.transactionId,
      senderPhone: formData.senderPhone,
      senderName: formData.senderName,
      screenshotUrl: formData.screenshotUrl,
      notes: formData.notes || '',
    };

    await createInvestment({ ...newInvestment, userId: firebaseUser.uid });
    setSelectedPackage(null); // close wizard

    await addNotification(
      'Audit Verification Pending',
      `Your transaction reference [${formData.transactionId}] has been submitted. Platform administrators are reviewing the cash screenshot.`,
      'warning'
    );

    // Prompt user to check portfolio tab
    setActiveTab('portfolio');
  };

  // Admin Sandbox Handlers
  const handleApprove = async (id: string) => {
    const item = investments.find((i) => i.id === id);
    if (!item) return;

    await updateInvestment(id, {
      status: 'active',
      approvedAt: Date.now(),
    });

    const newNotif: SystemNotification = {
      id: 'notif-' + Date.now() + Math.random().toString(36).slice(2, 5),
      title: 'Deposit Verified Successfully',
      message: `Approved deposit of $${item.investAmount} (Code: ${item.transactionId}). Your pool is locked and active!`,
      type: 'success',
      timestamp: Date.now(),
      read: false,
    };
    await createNotification({ ...newNotif, userId: item.userId });
  };

  const handleReject = async (id: string) => {
    const item = investments.find((i) => i.id === id);
    if (!item) return;

    await updateInvestment(id, { status: 'rejected' });

    const newNotif: SystemNotification = {
      id: 'notif-' + Date.now() + Math.random().toString(36).slice(2, 5),
      title: 'Deposit Blocked / Rejected',
      message: `Platform verification failed for transaction ID ${item.transactionId}. Correct proof of payment details or re-upload.`,
      type: 'warning',
      timestamp: Date.now(),
      read: false,
    };
    await createNotification({ ...newNotif, userId: item.userId });
  };

  const handleAdvanceTime = async (id: string) => {
    const item = investments.find((i) => i.id === id);
    if (!item) return;

    await updateInvestment(id, {
      approvedAt: Date.now() - item.durationDays * 24 * 60 * 60 * 1000 - 1000,
    });

    const newNotif: SystemNotification = {
      id: 'notif-' + Date.now() + Math.random().toString(36).slice(2, 5),
      title: 'Simulated Contract Maturity',
      message: `Plan #${item.id.slice(0, 8)} matured in Sandbox. Withdraw your earnings now!`,
      type: 'success',
      timestamp: Date.now(),
      read: false,
    };
    await createNotification({ ...newNotif, userId: item.userId });
  };

  const handleDeleteRequest = async (id: string) => {
    await deleteInvestment(id);
  };

  // Withdraw & Claim earnings to Wallet Balance
  const handleClaimMatured = async (id: string) => {
    const item = investments.find((i) => i.id === id);
    if (!item || !user || !firebaseUser) return;

    // Credit user's wallet balance
    const updatedBalance = user.balanceUSD + item.returnAmount;
    await updateUserProfile(firebaseUser.uid, {
      balanceUSD: updatedBalance,
    });

    // Mark as matured
    await updateInvestment(id, { status: 'matured' });

    await addNotification(
      'Earnings Credited to Wallet',
      `Successfully claimed ${formatUSD(item.returnAmount)} into your digital wallet from pool ID #${item.id.slice(0, 8)}.`,
      'success'
    );
  };

  const handleWithdrawSubmit = async (amountUSD: number, phone: string, network: string) => {
    if (!user || !firebaseUser) return;

    // Create withdrawal request
    const newRequest: WithdrawalRequest = {
      id: 'wth-' + Math.random().toString(36).substring(2, 9),
      amountUSD,
      phone,
      network,
      timestamp: Date.now(),
      status: 'pending',
    };

    // Deduct from balance, increase totalWithdrawn
    const newBalance = Math.max(0, user.balanceUSD - amountUSD);
    const newTotalWithdrawn = user.totalWithdrawn + amountUSD;
    await updateUserProfile(firebaseUser.uid, {
      balanceUSD: newBalance,
      totalWithdrawn: newTotalWithdrawn,
    });

    await createWithdrawal({ ...newRequest, userId: firebaseUser.uid });
    setShowWithdraw(false); // Close modal

    await addNotification(
      'Withdrawal Process Initiated',
      `Transfer request for ${formatUSD(amountUSD)} (${network}) is being processed. Funds are queued for automatic mobile money transfer to ${phone}.`,
      'warning'
    );
  };

  const handleApproveWithdraw = async (id: string) => {
    const item = withdrawals.find((w) => w.id === id);
    if (!item) return;

    await updateWithdrawal(id, {
      status: 'completed',
      completedAt: Date.now(),
    });

    const newNotif: SystemNotification = {
      id: 'notif-' + Date.now() + Math.random().toString(36).slice(2, 5),
      title: 'Mobile Money Payout Sent',
      message: `Transfer of ${formatUSD(item.amountUSD)} to mobile account ${item.phone} (${item.network}) was successfully approved and deposited.`,
      type: 'success',
      timestamp: Date.now(),
      read: false,
    };
    await createNotification({ ...newNotif, userId: item.userId });
  };

  const handleRejectWithdraw = async (id: string) => {
    const item = withdrawals.find((w) => w.id === id);
    if (!item) return;

    // Refund user balance
    const targetProfile = await getUserProfile(item.userId);
    if (targetProfile) {
      const updatedBalance = targetProfile.balanceUSD + item.amountUSD;
      const updatedTotalWithdrawn = Math.max(0, targetProfile.totalWithdrawn - item.amountUSD);
      await updateUserProfile(item.userId, {
        balanceUSD: updatedBalance,
        totalWithdrawn: updatedTotalWithdrawn,
      });
    }

    await updateWithdrawal(id, { status: 'failed' });

    const newNotif: SystemNotification = {
      id: 'notif-' + Date.now() + Math.random().toString(36).slice(2, 5),
      title: 'Withdrawal Request Failed / Refunded',
      message: `Payout request for ${formatUSD(item.amountUSD)} was rejected. The funds have been returned to your wallet balance.`,
      type: 'warning',
      timestamp: Date.now(),
      read: false,
    };
    await createNotification({ ...newNotif, userId: item.userId });
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out or switch account details? This will clear current session cache.')) {
      await signOut(auth);
    }
  };

  const handleResetSandbox = async () => {
    if (confirm('Clear sandbox memory and start fresh? All investments and custom user records will be re-seeded.')) {
      if (firebaseUser) {
        await updateUserProfile(firebaseUser.uid, {
          balanceUSD: 0,
          totalWithdrawn: 0,
        });

        for (const inv of investments) {
          await deleteInvestment(inv.id);
        }

        for (const w of withdrawals) {
          await deleteDoc(doc(db, 'withdrawals', w.id));
        }

        for (const n of notifications) {
          await deleteDoc(doc(db, 'notifications', n.id));
        }

        await addNotification(
          'Sandbox database cleared',
          'All sandbox records and transaction locks have been removed successfully. Begin simulated trades fresh.',
          'info'
        );
      }
      setShowAdmin(false);
    }
  };

  // Summarize dynamic overall stats
  const activePoolsCount = investments.filter((i) => i.status === 'active').length;
  const pendingAuditsCount = investments.filter((i) => i.status === 'pending').length;

  const totalInvestedUSD = investments
    .filter((i) => i.status === 'active' || i.status === 'matured')
    .reduce((sum, current) => sum + current.investAmount, 0);

  const totalExpectedPayoutUSD = investments
    .filter((i) => i.status === 'active')
    .reduce((sum, current) => sum + current.returnAmount, 0);

  const totalEarnedUSD = investments
    .filter((i) => i.status === 'matured')
    .reduce((sum, current) => sum + current.returnAmount, 0);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* 1. Header Bar component */}
      <Header
        user={user}
        notifications={notifications}
        onOpenNotifications={() => setShowNotifications(!showNotifications)}
        onOpenAdmin={() => setShowAdmin(!showAdmin)}
        onLogout={handleLogout}
        isAdminMode={showAdmin}
        hasPendingInvestments={pendingAuditsCount > 0}
      />

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
        {/* Sandbox Indicator Overlay Trigger */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/[0.03] border border-white/10 rounded-2xl p-4 gap-4 transition-all hover:border-emerald-500/20">
          <div className="flex gap-3 text-xs leading-normal">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl font-bold flex items-center justify-center border border-amber-500/20 shrink-0 h-10 w-10">
              ⚡
            </div>
            <div>
              <h3 className="font-bold text-white flex items-center gap-1.5 text-sm">
                Smart Yield Pool Simulator Mode
              </h3>
              <p className="text-slate-400">
                Instantly deposit, copy merchant cash phone <code className="text-white font-mono bg-white/5 border border-white/10 px-1 py-0.5 rounded">{PAYMENT_PHONE_NUMBER}</code>, and use the <strong>Sandbox Desk</strong> to self-approve receipts.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAdmin(true)}
            className="w-full sm:w-auto px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white rounded-xl text-xs font-semibold tracking-wide border border-white/10 transition"
          >
            Launch Sandbox Panel &rarr;
          </button>
        </div>

        {/* 2. Welcome Registration Interceptor if not logged in */}
        {authLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              <p className="text-xs text-slate-400 mt-2 font-mono">Initializing secure ledger database...</p>
            </div>
          </div>
        )}

        {!authLoading && !firebaseUser && (
          <div className="fixed inset-0 z-45 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div className="bg-[#0c0c0c] border border-white/10 p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
              
              <div className="text-center mb-6 relative z-10">
                <div className="mx-auto w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <Coins className="h-6 w-6 animate-pulse" />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-white font-display">POOL<span className="text-emerald-500 underline underline-offset-4 decoration-1">TRADE</span> PIN</h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Claim high returns from verified, algorithmic liquidity pools. To access the platform catalog, authenticate your secure trading session.
                </p>
              </div>

              <div className="space-y-4 relative z-10">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-black font-semibold text-xs tracking-wider rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2 outline-none cursor-pointer"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  Connect via Google Account
                </button>

                {regError && (
                  <p className="text-xs text-rose-550 bg-rose-550/10 border border-rose-500/10 p-2.5 rounded-xl font-medium text-center">
                    {regError}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {!authLoading && firebaseUser && !user && (
          <div className="fixed inset-0 z-45 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div className="bg-[#0c0c0c] border border-white/10 p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
              
              <div className="text-center mb-6 relative z-10">
                <div className="mx-auto w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <Coins className="h-6 w-6 animate-pulse" />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-white font-display">COMPLETE PROFILE</h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Your secure session is connected to Google. Finish setting up your trading profile to secure yields.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4 relative z-10">
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Kamau"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Mobile Money Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0797166504"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Used to process and reconcile payout trades.
                  </span>
                </div>

                {regError && (
                  <p className="text-xs text-rose-550 bg-rose-550/10 border border-rose-500/10 p-2.5 rounded-xl font-medium">
                    {regError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/10 active:translate-y-0.5 cursor-pointer"
                >
                  Verify Profile Session &rarr;
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 3. Global Stats Rows */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 shadow-sm transition hover:border-emerald-500/20 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-slate-550 font-bold uppercase tracking-widest block">Wallet Payout Balance</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-light text-white font-mono leading-none">
                  {user ? formatUSD(user.balanceUSD) : '$0'}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  ~ {user ? formatKES(user.balanceUSD) : '0 KES'}
                </span>
              </div>
              <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Available for withdrawal
              </p>
            </div>
            {user && user.balanceUSD > 0 ? (
              <button
                onClick={() => setShowWithdraw(true)}
                className="mt-3 w-full py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 font-black uppercase text-[10px] tracking-wider text-black rounded-lg transition duration-200 active:translate-y-0.5 cursor-pointer text-center"
              >
                Cash Out Now &rarr;
              </button>
            ) : (
              <button
                disabled
                className="mt-3 w-full py-1.5 px-3 bg-white/5 font-bold uppercase text-[10px] tracking-wider text-slate-500 rounded-lg cursor-not-allowed text-center"
              >
                Wallet Empty
              </button>
            )}
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 shadow-sm transition hover:border-emerald-500/20">
            <span className="text-[10px] text-slate-555 font-bold uppercase tracking-widest block">Active Locked Capital</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-light text-white font-mono leading-none">
                {formatUSD(totalInvestedUSD)}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                ~ {formatKES(totalInvestedUSD)} KES
              </span>
            </div>
            <p className="text-[10px] text-blue-400 mt-1">
              {activePoolsCount} Active pools trading
            </p>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 shadow-sm transition hover:border-emerald-500/20">
            <span className="text-[10px] text-slate-550 font-bold uppercase tracking-widest block">Pending Expected Payouts</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-light text-amber-400 font-mono leading-none">
                {formatUSD(totalExpectedPayoutUSD)}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                ~ {formatKES(totalExpectedPayoutUSD)} KES
              </span>
            </div>
            <p className="text-[10px] text-slate-550 mt-1">
              Claims released after cycles auto-close
            </p>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 shadow-sm transition hover:border-emerald-500/20">
            <span className="text-[10px] text-slate-550 font-bold uppercase tracking-widest block">Total Historical Earnings</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-light text-emerald-400 font-mono leading-none">
                {formatUSD(totalEarnedUSD)}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                ~ {formatKES(totalEarnedUSD)} KES
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Guaranteed pool returns paid
            </p>
          </div>
        </div>

        {/* 4. Tab Navigation Bar */}
        <div className="border-b border-white/10 flex space-x-6 text-sm font-semibold tracking-wide overflow-x-auto whitespace-nowrap scrollbar-none pb-2">
          <button
            onClick={() => setActiveTab('pools')}
            className={`pb-2.5 transition relative ${
              activeTab === 'pools' ? 'text-white border-b-2 border-emerald-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <Briefcase className="h-4 w-4" />
              <span>Investment Pools</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`pb-2.5 transition relative ${
              activeTab === 'portfolio' ? 'text-white border-b-2 border-emerald-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <Clock className="h-4 w-4" />
              <span>My Portfolio & History</span>
              {investments.length > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ml-1" />
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`pb-2.5 transition relative ${
              activeTab === 'calculator' ? 'text-white border-b-2 border-emerald-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <TrendingUp className="h-4 w-4" />
              <span>Calculator</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`pb-2.5 transition relative ${
              activeTab === 'faqs' ? 'text-white border-b-2 border-emerald-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <HelpCircle className="h-4 w-4" />
              <span>How It Works & FAQs</span>
            </div>
          </button>
        </div>

        {/* 5. TAB VIEW CONTENTS */}
        {activeTab === 'pools' && (
          <div className="space-y-6">
            <div className="flex justify-between items-baseline">
              <div>
                <h3 className="text-xl font-bold font-display text-white">Select Your Trading Pool</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Join specialized institutional cryptocurrency and forex pool loops. High performance algorithms guarantee precise target returns.
                </p>
              </div>
            </div>

            {/* Grid of packages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {INVESTMENT_PACKAGES.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  onSelect={handleSelectPackage}
                />
              ))}
            </div>

            {/* Injected mini calculator to assist packages */}
            <div className="pt-4">
              <YieldCalculator onSelectPackage={handleSelectPackageById} />
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <PortfolioViewer
            investments={investments}
            onClaimMatured={handleClaimMatured}
            onRequestRefund={handleDeleteRequest}
            withdrawals={withdrawals}
          />
        )}

        {activeTab === 'calculator' && (
          <YieldCalculator onSelectPackage={handleSelectPackageById} />
        )}

        {activeTab === 'faqs' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold font-display text-white">Frequently Asked Questions</h3>
              <p className="text-xs text-slate-400 mt-1">Get instant details about deposits, proof approval, and payouts.</p>
            </div>

            {[
              {
                q: 'What is Pool Trading and how does it generate yields?',
                a: 'Pool trading pools asset capitals from individual retail investors. These large capital packages allow advanced algorithmic high-frequency bot trading in currency and crypto pairs, which typically require high thresholds and margins to output standardized returns.',
              },
              {
                q: 'How do I submit my payment screenshot proof?',
                a: 'Once you select an investment package, the portal will direct you to transfer funds to the designated number 0797166504. Execute the transfer, take a screenshot of the cash invoice or M-Pesa transaction confirmation, fill in your details, and drag the image into the screenshot uploader.',
              },
              {
                q: 'How long does the verification of my screenshot take?',
                a: 'Verification is audited against incoming bank ledgers and is completed within 10-15 minutes. Once confirmed, your investment moves from "In Audit" to "Trading Loop" immediately.',
              },
              {
                q: 'How do I withdraw once my package matures?',
                a: "Once the lockup duration concludes, click the 'Withdraw Return' button in your Portfolio tab. This instantly credits the digital coin return amount to your wallet payouts. You can then request physical reconciliation to your verified account phone number.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-emerald-500/30"
              >
                <button
                  onClick={() => setFaqOpenIdx(faqOpenIdx === idx ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between font-bold text-sm text-white focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4.5 w-4.5 text-slate-400 transition-transform duration-200 ${faqOpenIdx === idx ? 'rotate-180' : ''}`}
                  />
                </button>
                {faqOpenIdx === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-400 leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 6. MODAL OUTLETS */}

      {/* Screenshot Alert & Notification panel Overlay popup */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowNotifications(false)} />
          <div className="relative bg-[#0c0c0c] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl z-10 flex flex-col max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">System Activities</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1.5 hover:bg-white/5 rounded text-slate-450 hover:text-white"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="divide-y divide-white/5 py-2">
              {notifications.map((notif) => (
                <div key={notif.id} className="py-3 flex gap-3 text-xs leading-normal">
                  <div className="shrink-0 mt-0.5">
                    {notif.type === 'success' ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                    ) : notif.type === 'warning' ? (
                      <AlertCircle className="h-4.5 w-4.5 text-amber-500" />
                    ) : (
                      <Info className="h-4.5 w-4.5 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-200">{notif.title}</h5>
                    <p className="text-slate-400 text-[11px] mt-0.5">{notif.message}</p>
                    <span className="text-[9px] text-slate-500 font-mono mt-1 block">
                      {formatDateTime(notif.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Invest process Modal trigger */}
      {selectedPackage && (
        <InvestModal
          pkg={selectedPackage}
          userPhone={user?.phone || ''}
          userName={user?.name || ''}
          onClose={() => setSelectedPackage(null)}
          onSubmit={handleInvestSubmit}
        />
      )}

      {/* Withdraw Modal overlay */}
      {showWithdraw && user && (
        <WithdrawModal
          user={user}
          onClose={() => setShowWithdraw(false)}
          onSubmit={handleWithdrawSubmit}
        />
      )}

      {/* Sandbox admin drawer trigger */}
      {showAdmin && (
        <AdminPanel
          investments={investments}
          onApprove={handleApprove}
          onReject={handleReject}
          onAdvanceTime={handleAdvanceTime}
          onClose={() => setShowAdmin(false)}
          onResetAll={handleResetSandbox}
          withdrawals={withdrawals}
          onApproveWithdraw={handleApproveWithdraw}
          onRejectWithdraw={handleRejectWithdraw}
        />
      )}

      {/* Footer bar standard element */}
      <footer className="border-t border-white/10 bg-[#050505] text-slate-500 py-10 mt-16 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-650 tracking-wider gap-4 border-b border-white/5 pb-6 uppercase font-mono">
            <div className="flex gap-6">
              <span>Status: <span className="text-emerald-500">Operational</span></span>
              <span>Nodes Active: 14/14</span>
              <span>Avg Payout Time: 12m</span>
            </div>
            <div className="flex gap-6">
              <span>Terms of Service</span>
              <span>Privacy Protocol</span>
              <span>&copy; {new Date().getFullYear()} POOLTRADE ARCHITECTURE</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            PoolTrading Protocol &bull; Secure, algorithmic pooling desk. Authorized payment index number: <strong className="text-white font-mono">{PAYMENT_PHONE_NUMBER}</strong>
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[9px] text-slate-600 leading-relaxed">
            <span>Risk Warning: Algorithmic trading pools contain market elements. Deposits are locked for duration terms which conclude automatically. All simulation operations active in Sandbox state.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
