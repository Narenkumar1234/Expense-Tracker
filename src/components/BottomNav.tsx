import React, { useState } from 'react';

interface BottomNavProps {
  currentScreen: 'dashboard' | 'analytics' | 'budgets' | 'transactions' | 'profile' | 'addCard';
  onNavigate: (screen: 'dashboard' | 'analytics' | 'budgets' | 'transactions') => void;
  onOpenQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  onOpenQuickAdd,
}) => {
  const [showBudgetPopover, setShowBudgetPopover] = useState(false);
  return (
    <nav
      className="nav-pwa-safe fixed bottom-0 left-0 right-0 z-40 bg-transparent pointer-events-none transition-[padding] duration-150"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="max-w-md mx-auto relative h-16 pointer-events-auto">
        {/* Seamless background layer with smooth concave U notch */}
        <div className="absolute inset-0 flex items-stretch pointer-events-none drop-shadow-[0_-3px_12px_rgba(0,0,0,0.18)]">
          {/* Left continuous bar */}
          <div className="flex-1 nav-bar-bg bg-[#0a0e18] border-t border-white/[0.08]" />

          {/* Center Scoop Notch (88px wide, depth 34px) */}
          <div className="w-[88px] h-16 shrink-0 relative">
            <svg
              viewBox="0 0 88 64"
              className="w-full h-full block"
              preserveAspectRatio="none"
            >
              {/* Solid fill matching the nav bar surface */}
              <path
                d="M 0,0 L 12,0 C 18,0 22,4 25,11 C 29,24 36,34 44,34 C 52,34 59,24 63,11 C 66,4 70,0 76,0 L 88,0 L 88,64 L 0,64 Z"
                className="nav-scoop-fill fill-[#0a0e18]"
              />
              {/* Continuous top rim stroke */}
              <path
                d="M 0,0 L 12,0 C 18,0 22,4 25,11 C 29,24 36,34 44,34 C 52,34 59,24 63,11 C 66,4 70,0 76,0 L 88,0"
                fill="none"
                className="nav-scoop-stroke stroke-white/[0.08]"
                strokeWidth="1"
              />
            </svg>
          </div>

          {/* Right continuous bar */}
          <div className="flex-1 nav-bar-bg bg-[#0a0e18] border-t border-white/[0.08]" />
        </div>

        {/* Interactive Buttons Layer */}
        <div className="relative z-10 flex items-center justify-around h-16 px-2">
          {/* Home */}
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex flex-col items-center justify-center w-14 h-12 transition-all ${
              currentScreen === 'dashboard'
                ? 'text-[#4edea3] font-semibold scale-105'
                : 'text-[#bbcabf] hover:text-[#dfe2f1]'
            }`}
            aria-label="Home Dashboard"
          >
            <span className="material-symbols-outlined text-[22px]">
              account_balance_wallet
            </span>
            <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
          </button>

          {/* Insights / Analytics */}
          <button
            onClick={() => onNavigate('analytics')}
            className={`flex flex-col items-center justify-center w-14 h-12 transition-all ${
              currentScreen === 'analytics'
                ? 'text-[#4edea3] font-semibold scale-105'
                : 'text-[#bbcabf] hover:text-[#dfe2f1]'
            }`}
            aria-label="Analytics Insights"
          >
            <span className="material-symbols-outlined text-[22px]">
              pie_chart
            </span>
            <span className="text-[10px] mt-0.5 tracking-tight">Insights</span>
          </button>

          {/* Floating Center (+) Button nestled in the scooped notch */}
          <div className="w-[88px] flex items-center justify-center relative -top-3.5 shrink-0">
            <button
              onClick={onOpenQuickAdd}
              className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#059669] via-[#10b981] to-[#4edea3] text-[#002113] flex items-center justify-center shadow-[0_4px_16px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold"
              aria-label="Quick Add Transaction"
            >
              <span className="material-symbols-outlined text-[26px] font-bold">
                add
              </span>
            </button>
          </div>

          {/* Budgets (Coming Soon Popover) */}
          <div className="relative">
            {showBudgetPopover && (
              <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-[#171b26] border border-[#10b981]/50 text-[#4edea3] text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-2xl flex items-center gap-1.5 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 z-50">
                <span className="material-symbols-outlined text-[14px]">rocket_launch</span>
                <span>Coming Soon</span>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#171b26] border-b border-r border-[#10b981]/50 rotate-45" />
              </div>
            )}
            <button
              onClick={() => {
                setShowBudgetPopover(true);
                setTimeout(() => setShowBudgetPopover(false), 2400);
              }}
              className="flex flex-col items-center justify-center w-14 h-12 transition-all text-[#bbcabf] hover:text-[#dfe2f1] cursor-pointer"
              aria-label="Budgets (Coming Soon)"
            >
              <span className="material-symbols-outlined text-[22px]">
                track_changes
              </span>
              <span className="text-[10px] mt-0.5 tracking-tight">Budgets</span>
            </button>
          </div>

          {/* History / Transactions */}
          <button
            onClick={() => onNavigate('transactions')}
            className={`flex flex-col items-center justify-center w-14 h-12 transition-all ${
              currentScreen === 'transactions'
                ? 'text-[#4edea3] font-semibold scale-105'
                : 'text-[#bbcabf] hover:text-[#dfe2f1]'
            }`}
            aria-label="Transaction History"
          >
            <span className="material-symbols-outlined text-[22px]">
              receipt_long
            </span>
            <span className="text-[10px] mt-0.5 tracking-tight">History</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
