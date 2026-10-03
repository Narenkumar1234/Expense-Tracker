import React from 'react';
import { AURA_LOGO_URL } from '../data/mockData';
import { UserProfile } from '../types';

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
  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'dashboard':
        return 'Home';
      case 'analytics':
        return 'Analytics';
      case 'budgets':
        return 'Budgets';
      case 'transactions':
        return 'Transactions';
      case 'profile':
        return 'Profile';
      case 'addCard':
        return 'Card Vault';
      default:
        return 'Home';
    }
  };

  return (
    <header className="sticky top-0 w-full z-40 bg-[#0f131d]/90 backdrop-blur-xl border-b border-white/[0.04] shadow-[0_1px_12px_rgba(0,0,0,0.4)]">
      <div className="h-16 px-4 sm:px-5 flex items-center justify-between max-w-md mx-auto w-full">
        {/* Left: Brand Logo & Current Section Name Vertically Centered */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center hover:opacity-90 transition-opacity focus:outline-none shrink-0"
            aria-label="Aura Home"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-[#171b26] border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
              <img
                src={AURA_LOGO_URL}
                alt="Aura Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </button>

          <span className="text-[17px] font-bold text-[#dfe2f1] tracking-tight leading-none select-none">
            {getScreenTitle()}
          </span>
        </div>

        {/* Right: Notifications & Profile Avatar */}
        <div className="flex items-center gap-2">
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
