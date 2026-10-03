import React from 'react';

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
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0e18]/90 backdrop-blur-xl border-t border-white/[0.06] shadow-[0_-4px_24px_rgba(0,0,0,0.6)]">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2 relative">
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

        {/* Floating Quick Add (+) Button */}
        <div className="relative -top-4 flex items-center justify-center">
          <button
            onClick={onOpenQuickAdd}
            className="w-13 h-13 rounded-full bg-[#10b981] text-[#002113] flex items-center justify-center shadow-[0_0_24px_-2px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            aria-label="Quick Add Transaction"
          >
            <span className="material-symbols-outlined text-[28px] font-bold">
              add
            </span>
          </button>
        </div>

        {/* Budgets */}
        <button
          onClick={() => onNavigate('budgets')}
          className={`flex flex-col items-center justify-center w-14 h-12 transition-all ${
            currentScreen === 'budgets'
              ? 'text-[#4edea3] font-semibold scale-105'
              : 'text-[#bbcabf] hover:text-[#dfe2f1]'
          }`}
          aria-label="Budgets and Goals"
        >
          <span className="material-symbols-outlined text-[22px]">
            track_changes
          </span>
          <span className="text-[10px] mt-0.5 tracking-tight">Budgets</span>
        </button>

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
    </nav>
  );
};
