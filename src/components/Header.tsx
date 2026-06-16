import { UserAccount, SystemNotification } from '../types';
import { Coins, Bell, ShieldAlert, LogOut, User } from 'lucide-react';
import { formatUSD } from '../utils';

interface HeaderProps {
  user: UserAccount | null;
  notifications: SystemNotification[];
  onOpenNotifications: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
  isAdminMode: boolean;
  hasPendingInvestments: boolean;
}

export function Header({
  user,
  notifications,
  onOpenNotifications,
  onOpenAdmin,
  onLogout,
  isAdminMode,
  hasPendingInvestments,
}: HeaderProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="border-b border-white/10 bg-[#050505]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Platform Name */}
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-black">
            <Coins className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white font-display flex items-center gap-1">
              POOL<span className="text-emerald-500 underline underline-offset-4 decoration-1 font-bold">TRADE</span>
              <span className="text-[9px] bg-white/5 border border-white/10 text-emerald-400 font-mono px-1.5 py-0.5 rounded ml-1 font-medium tracking-wide">SECURE</span>
            </h1>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center space-x-4">
          {/* Live Wallet indicator for registered users in header matching Design template */}
          {user && (
            <div className="hidden sm:inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-emerald-400">
              LIVE WALLET: {formatUSD(user.balanceUSD)}
            </div>
          )}

          {/* Sandbox Admin Portal Panel Trigger */}
          <button
            onClick={onOpenAdmin}
            className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition-all duration-200 ${
              isAdminMode
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 shadow-sm shadow-amber-900/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10 hover:text-white'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Sandbox Desk</span>
            {hasPendingInvestments && (
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-500 border border-black animate-ping" />
            )}
          </button>

          {/* User Status Profile */}
          {user ? (
            <div className="flex items-center space-x-3 text-slate-300">
              <div className="hidden md:flex flex-col items-end text-right">
                <span className="text-xs font-semibold text-slate-200">{user.name}</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 hover:bg-emerald-550/30 transition">
                <User className="h-4 w-4" />
              </div>

              {/* Log out / Switch User */}
              <button
                onClick={onLogout}
                title="Change Account / Log out"
                className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-rose-400 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="text-xs font-medium text-slate-400 flex items-center space-x-1 text-slate-200">
              <span className="inline-block w-2 h-2 rounded-full bg-slate-505 animate-pulse mr-1"></span>
              <span>Invited Guest</span>
            </div>
          )}

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition"
            title="System Updates"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center text-[7px] text-black font-black p-1">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
