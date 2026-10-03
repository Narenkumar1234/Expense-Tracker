import React, { useState } from 'react';
import { AURA_LOGO_URL } from '../data/mockData';
import { UserProfile } from '../types';
import { ThemeSwitcher } from './ThemeSwitcher';

interface HeaderProps {
  currentScreen: 'dashboard' | 'analytics' | 'budgets' | 'transactions' | 'profile' | 'addCard';
  onNavigate: (screen: 'dashboard' | 'analytics' | 'budgets' | 'transactions' | 'profile' | 'addCard') => void;
  user: UserProfile;
  unreadCount?: number;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  user,
  unreadCount = 2,
  onOpenNotifications,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'dashboard':
        return 'Dashboard';
      case 'analytics':
        return 'Analytics';
      case 'budgets':
        return 'Budgets';
      case 'transactions':
        return 'Transactions';
      case 'profile':
        return 'Profile';
      case 'addCard':
        return 'Vault Cards';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="sticky top-0 w-full z-40 bg-[#0f131d]/90 backdrop-blur-xl border-b border-white/[0.04] shadow-[0_1px_12px_rgba(0,0,0,0.4)]">
      <div className="h-16 px-4 sm:px-5 flex items-center justify-between max-w-md mx-auto w-full">
        {/* Left: Brand Logo & Screen Dropdown */}
        <div className="flex items-center gap-2.5 relative">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity focus:outline-none"
            aria-label="Aura Dashboard"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-[#171b26] border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
              <img
                src={AURA_LOGO_URL}
                alt="Aura Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback green hexagon svg if image load fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex flex-col items-start focus:outline-none group text-left"
              aria-label="Switch Views"
            >
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#4edea3] leading-none mb-0.5">
                AURA
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[17px] font-semibold text-[#dfe2f1] tracking-tight group-hover:text-white transition-colors">
                  {getScreenTitle()}
                </span>
                <span className={`material-symbols-outlined text-[18px] text-[#bbcabf] transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </div>
            </button>

            {/* Quick Switcher Dropdown */}
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-48 bg-[#171b26] border border-white/10 rounded-xl shadow-2xl p-1.5 z-40 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch View
                  </div>
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: 'account_balance_wallet' },
                    { id: 'analytics', label: 'Analytics / Insights', icon: 'pie_chart' },
                    { id: 'budgets', label: 'Budgets & Goals', icon: 'track_changes' },
                    { id: 'transactions', label: 'Transactions', icon: 'receipt_long' },
                    { id: 'addCard', label: 'Card Vault', icon: 'credit_card' },
                    { id: 'profile', label: 'Profile & Settings', icon: 'person' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id as any);
                        setMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium rounded-lg text-left transition-colors ${
                        currentScreen === item.id
                          ? 'bg-[#10b981]/20 text-[#4edea3] font-semibold'
                          : 'text-[#dfe2f1] hover:bg-white/5'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[17px]">
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Notifications & Profile Avatar */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenNotifications}
            aria-label="Notifications"
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#bbcabf] hover:text-[#dfe2f1] hover:bg-white/5 transition-colors relative"
          >
            <span className="material-symbols-outlined text-[22px]">
              notifications
            </span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ff7886] shadow-[0_0_8px_rgba(255,120,134,0.8)] animate-pulse" />
            )}
          </button>

          <ThemeSwitcher variant="compact" />

          <button
            onClick={() => onNavigate('profile')}
            aria-label="Open User Profile"
            className="w-10 h-10 flex items-center justify-center rounded-full p-0.5 relative group hover:ring-2 hover:ring-[#4edea3]/50 transition-all"
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover shadow-sm ring-1 ring-white/10"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10b981] border-2 border-[#0f131d]" />
          </button>
        </div>
      </div>
    </header>
  );
};
