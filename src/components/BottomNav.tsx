import React from 'react';

interface BottomNavProps {
  currentScreen: 'dashboard' | 'analytics' | 'assistant' | 'budgets' | 'transactions' | 'profile' | 'addCard';
  onNavigate: (screen: 'dashboard' | 'analytics' | 'assistant' | 'transactions') => void;
  onOpenQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  onOpenQuickAdd,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none select-none">
      <div className="w-full flex flex-col items-center">
        {/* Centered navigation bar constrained to max-w-md on larger screens, full width on phones */}
        <div className="w-full max-w-md relative pointer-events-auto">
          {/* Main 56px Tab Bar with scooped notch */}
          <div className="relative h-14 w-full">
            {/* Seamless background layer with smooth concave U notch */}
            <div className="absolute inset-0 flex items-stretch pointer-events-none drop-shadow-[0_-2px_8px_rgba(0,0,0,0.06)] dark:drop-shadow-[0_-4px_16px_rgba(0,0,0,0.35)]">
              {/* Left continuous bar */}
              <div className="flex-1 nav-bar-bg bg-[#0a0e18] border-t border-slate-200/90 dark:border-white/[0.08]" />

              {/* Center Scoop Notch (84px wide, depth 26px) */}
              <div className="w-[84px] h-14 shrink-0 relative">
                <svg
                  viewBox="0 0 84 56"
                  className="w-full h-full block"
                  preserveAspectRatio="none"
                >
                  {/* Solid fill matching the nav bar surface */}
                  <path
                    d="M 0,0 L 12,0 C 18,0 22,4 25,10 C 29,20 35,26 42,26 C 49,26 55,20 59,10 C 62,4 66,0 72,0 L 84,0 L 84,56 L 0,56 Z"
                    className="nav-scoop-fill fill-[#0a0e18]"
                  />
                  {/* Continuous top rim stroke */}
                  <path
                    d="M 0,0 L 12,0 C 18,0 22,4 25,10 C 29,20 35,26 42,26 C 49,26 55,20 59,10 C 62,4 66,0 72,0 L 84,0"
                    fill="none"
                    className="nav-scoop-stroke stroke-slate-200/90 dark:stroke-white/[0.08]"
                    strokeWidth="1"
                  />
                </svg>
              </div>

              {/* Right continuous bar */}
              <div className="flex-1 nav-bar-bg bg-[#0a0e18] border-t border-slate-200/90 dark:border-white/[0.08]" />
            </div>

            {/* Interactive Buttons Layer */}
            <div className="relative z-10 flex items-center justify-between h-14 px-1">
              {/* Home */}
              <button
                onClick={() => onNavigate('dashboard')}
                className={`flex-1 flex flex-col items-center justify-center h-full active:scale-95 transition-all cursor-pointer ${
                  currentScreen === 'dashboard'
                    ? 'text-[#059669] dark:text-[#4edea3] font-semibold'
                    : 'text-slate-500 dark:text-[#bbcabf] hover:text-slate-900 dark:hover:text-[#dfe2f1]'
                }`}
                aria-label="Home Dashboard"
              >
                <span className="material-symbols-outlined text-[22px]">
                  account_balance_wallet
                </span>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">Home</span>
              </button>

              {/* Insights / Analytics */}
              <button
                onClick={() => onNavigate('analytics')}
                className={`flex-1 flex flex-col items-center justify-center h-full active:scale-95 transition-all cursor-pointer ${
                  currentScreen === 'analytics'
                    ? 'text-[#059669] dark:text-[#4edea3] font-semibold'
                    : 'text-slate-500 dark:text-[#bbcabf] hover:text-slate-900 dark:hover:text-[#dfe2f1]'
                }`}
                aria-label="Analytics Insights"
              >
                <span className="material-symbols-outlined text-[22px]">
                  pie_chart
                </span>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">Insights</span>
              </button>

              {/* Floating Center (+) Button nestled in the scooped notch */}
              <div className="w-[84px] flex items-center justify-center relative -top-2 shrink-0">
                <button
                  onClick={onOpenQuickAdd}
                  className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#059669] via-[#10b981] to-[#4edea3] text-[#002113] flex items-center justify-center shadow-[0_3px_12px_rgba(16,185,129,0.45)] hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold"
                  aria-label="Quick Add Transaction"
                >
                  <span className="material-symbols-outlined text-[26px] font-bold">
                    add
                  </span>
                </button>
              </div>

              {/* Aura */}
              <button
                onClick={() => onNavigate('assistant')}
                className={`flex-1 flex flex-col items-center justify-center h-full active:scale-95 transition-all cursor-pointer ${
                  currentScreen === 'assistant'
                    ? 'text-[#059669] dark:text-[#4edea3] font-semibold'
                    : 'text-slate-500 dark:text-[#bbcabf] hover:text-slate-900 dark:hover:text-[#dfe2f1]'
                }`}
                aria-label="Aura"
              >
                <span className="material-symbols-outlined text-[22px]">
                  chat
                </span>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">Aura</span>
              </button>

              {/* History / Transactions */}
              <button
                onClick={() => onNavigate('transactions')}
                className={`flex-1 flex flex-col items-center justify-center h-full active:scale-95 transition-all cursor-pointer ${
                  currentScreen === 'transactions'
                    ? 'text-[#059669] dark:text-[#4edea3] font-semibold'
                    : 'text-slate-500 dark:text-[#bbcabf] hover:text-slate-900 dark:hover:text-[#dfe2f1]'
                }`}
                aria-label="Transaction History"
              >
                <span className="material-symbols-outlined text-[22px]">
                  receipt_long
                </span>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">History</span>
              </button>
            </div>
          </div>

          {/* Solid Safe-Area Chin: Seamlessly fills iPhone home-indicator safe-area while keeping bar docked low */}
          <div
            className="nav-bar-bg bg-[#0a0e18] w-full"
            style={{
              height: 'max(calc(env(safe-area-inset-bottom, 0px) - 14px), 0px)',
              minHeight: 'max(calc(env(safe-area-inset-bottom, 0px) - 14px), 0px)',
            }}
          />
        </div>
      </div>
    </nav>
  );
};

