import React, { useState } from 'react';
import { Transaction, UserProfile } from '../../types';

interface DashboardScreenProps {
  user: UserProfile;
  transactions: Transaction[];
  onOpenQuickAdd: (type?: 'expense' | 'income') => void;
  onNavigate: (screen: 'dashboard' | 'analytics' | 'budgets' | 'transactions') => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  transactions,
  onOpenQuickAdd,
  onNavigate,
  onSelectTransaction,
}) => {
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(3); // Thursday active
  const [activeRecurringOverlay, setActiveRecurringOverlay] = useState<string | null>(null);

  // Weekly spend data (M, T, W, T, F, S, S)
  const weekDays = [
    { label: 'M', amount: 2800, height: '40%' },
    { label: 'T', amount: 4100, height: '58%' },
    { label: 'W', amount: 2100, height: '32%' },
    { label: 'T', amount: 1670, height: '85%', isToday: true }, // Today
    { label: 'F', amount: 3900, height: '52%' },
    { label: 'S', amount: 5600, height: '70%' },
    { label: 'S', amount: 1200, height: '22%' },
  ];

  // Helper to format currency
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const recentTransactions = transactions.slice(0, 4);

  // Income vs Spend calculation
  const monthlyIncome = user.monthlyBaseIncome || 185000;
  const spentSoFar = 31800.50;
  const incomeSpentPercent = Math.min(100, Math.round((spentSoFar / monthlyIncome) * 100 * 10) / 10);
  const unspentIncome = monthlyIncome - spentSoFar;

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-28 pt-3 space-y-4">
      {/* Greeting */}
      <div className="flex items-center justify-between pt-1">
        <h1 className="text-2xl font-bold tracking-tight text-[#dfe2f1]">
          Good afternoon, {user.name.split(' ')[0]}
        </h1>
      </div>

      {/* Main Net Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#1c1f2a] to-[#171b26] border border-white/[0.08] p-5 shadow-xl">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#10b981]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-[#6366f1]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#bbcabf] uppercase">
            <span>TOTAL NET BALANCE</span>
            <button
              onClick={() => setIsBalanceHidden(!isBalanceHidden)}
              className="text-[#bbcabf] hover:text-white transition-colors"
              aria-label="Toggle balance visibility"
            >
              <span className="material-symbols-outlined text-[17px]">
                {isBalanceHidden ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#4edea3] text-xs font-semibold">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span>+4.2% mo</span>
          </div>
        </div>

        {/* Big Balance */}
        <div className="relative z-10 mt-2 mb-4 font-mono font-bold tracking-tight text-3xl sm:text-4xl text-[#dfe2f1]">
          {isBalanceHidden ? '₹ • •,• •,• • •' : '₹2,48,500.00'}
        </div>

        {/* Income & Expenses Sub-grid */}
        <div className="relative z-10 grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.06]">
          {/* Income */}
          <div className="bg-[#0f131d]/60 rounded-xl p-3 border border-white/[0.04]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#bbcabf]">
                <span className="material-symbols-outlined text-[#4edea3] text-[16px]">
                  arrow_downward
                </span>
                <span>Income</span>
              </div>
              {/* Mini Green Sparkline */}
              <svg className="w-10 h-4" viewBox="0 0 40 16" fill="none">
                <path
                  d="M1 12L10 9L18 11L28 4L39 7"
                  stroke="#4edea3"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-[17px] font-bold font-mono text-[#4edea3] mt-1">
              +₹64,200.00
            </div>
            <div className="text-[10px] text-[#bbcabf] mt-0.5">
              +₹8,400 vs last mo
            </div>
          </div>

          {/* Expenses */}
          <div className="bg-[#0f131d]/60 rounded-xl p-3 border border-white/[0.04]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#bbcabf]">
                <span className="material-symbols-outlined text-[#ff7886] text-[16px]">
                  north_east
                </span>
                <span>Expenses</span>
              </div>
              {/* Mini Coral Sparkline */}
              <svg className="w-10 h-4" viewBox="0 0 40 16" fill="none">
                <path
                  d="M1 5L10 8L20 4L30 11L39 9"
                  stroke="#ff7886"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-[17px] font-bold font-mono text-[#ff7886] mt-1">
              -₹31,800.50
            </div>
            <div className="text-[10px] text-[#bbcabf] mt-0.5">
              Under by ₹3,200
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Spend Card */}
      <div className="rounded-2xl bg-[#1c1f2a] border border-white/[0.06] p-4.5 shadow-lg space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#10b981]/15 text-[#4edea3] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">
                pie_chart
              </span>
            </div>
            <div className="min-w-0 truncate">
              <div className="text-sm font-semibold text-[#dfe2f1] truncate">
                Monthly Spend
              </div>
            </div>
          </div>
          <span className="shrink-0 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-[#10b981]/20 text-[#4edea3] text-xs font-bold font-mono">
            {incomeSpentPercent}% spent
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-2.5 rounded-full bg-[#0f131d] overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-[#4edea3] via-[#10b981] to-[#34d399] rounded-full transition-all duration-500"
              style={{ width: `${incomeSpentPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#dfe2f1]">Spent ₹31,800.50</span>
            <span className="text-[#bbcabf]">Income ₹{monthlyIncome.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Retained unspent remainder */}
        <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[#bbcabf]">
            <span className="material-symbols-outlined text-[16px] text-[#4edea3]">
              savings
            </span>
            <span>Retained Income Balance</span>
          </div>
          <span className="text-sm font-mono font-bold text-[#4edea3]">
            ₹{unspentIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Weekly Cadence (7-day bar chart) */}
      <div className="rounded-2xl bg-[#1c1f2a] border border-white/[0.06] p-4.5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-[#dfe2f1]">
              Weekly Cadence
            </div>
            <div className="text-[11px] text-[#bbcabf]">
              Daily average: ₹3,750.00
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#4edea3] text-xs font-semibold font-mono">
            Today: ₹1,670.00
          </span>
        </div>

        {/* Bar chart */}
        <div className="h-28 flex items-end justify-between gap-2 pt-3 px-1">
          {weekDays.map((day, idx) => {
            const isSelected = selectedDayIndex === idx;
            return (
              <button
                key={day.label + idx}
                onClick={() => setSelectedDayIndex(idx)}
                className="flex-1 flex flex-col items-center gap-1.5 group focus:outline-none"
              >
                <div className="w-full flex items-end justify-center h-20 relative">
                  {/* Tooltip on active */}
                  {isSelected && (
                    <div className="absolute -top-7 px-1.5 py-0.5 rounded bg-[#0a0e18] border border-white/20 text-[10px] font-mono text-[#4edea3] whitespace-nowrap shadow-lg z-20">
                      ₹{day.amount}
                    </div>
                  )}
                  <div
                    className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                      day.isToday || isSelected
                        ? 'bg-[#10b981] shadow-[0_0_14px_rgba(16,185,129,0.5)]'
                        : 'bg-[#262a35] hover:bg-[#313540]'
                    }`}
                    style={{ height: day.height }}
                  />
                </div>
                <span
                  className={`text-[11px] font-semibold transition-colors ${
                    day.isToday || isSelected
                      ? 'text-[#4edea3]'
                      : 'text-[#bbcabf]'
                  }`}
                >
                  {day.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#dfe2f1]">Activity</span>
            <span className="px-2 py-0.5 rounded-full bg-[#171b26] text-[#bbcabf] text-[11px]">
              4 pending
            </span>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs font-semibold text-[#4edea3] hover:underline flex items-center gap-0.5"
          >
            <span>See All</span>
            <span className="material-symbols-outlined text-[15px]">chevron_right</span>
          </button>
        </div>

        <div className="space-y-2">
          {recentTransactions.map((tx) => (
            <div
              key={tx.id}
              onClick={() => onSelectTransaction(tx)}
              className="p-3 rounded-xl bg-[#1c1f2a] border border-white/[0.04] hover:bg-[#262a35] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#171b26] border border-white/5 flex items-center justify-center text-[#dfe2f1]">
                  <span className="material-symbols-outlined text-[20px]">
                    {tx.icon}
                  </span>
                </div>
                <div>
                  <div className="flex items-center min-w-0">
                    <span className="text-sm font-semibold text-[#dfe2f1] truncate">
                      {tx.merchant}
                    </span>
                    {tx.isRecurring && (
                      <span className="relative inline-flex items-center ml-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveRecurringOverlay(activeRecurringOverlay === tx.id ? null : tx.id);
                          }}
                          className="text-sm leading-none text-[#c0c1ff] hover:text-[#4edea3] transition-colors focus:outline-none"
                          title="Recurring transaction"
                          aria-label="Recurring details"
                        >
                          <span className="material-symbols-outlined text-[15px] align-middle select-none">
                            sync
                          </span>
                        </button>

                        {/* On-click overlay popover */}
                        {activeRecurringOverlay === tx.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveRecurringOverlay(null);
                              }}
                            />
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute left-0 bottom-full mb-2 z-50 p-2.5 rounded-xl bg-[#171b26] border border-white/10 shadow-2xl text-xs whitespace-nowrap animate-in fade-in zoom-in-95 duration-150"
                            >
                              <div className="flex items-center gap-1.5 font-bold text-[#4edea3] mb-0.5">
                                <span className="material-symbols-outlined text-[14px]">sync</span>
                                <span>{tx.recurringDurationMonths ? `${tx.recurringDurationMonths}-Month Plan` : 'Recurring Auto-debit'}</span>
                              </div>
                              <div className="text-[11px] text-[#bbcabf] font-mono">
                                {tx.monthlyEquivalent ? `₹${tx.monthlyEquivalent.toLocaleString('en-IN')}/mo` : `₹${Math.abs(tx.amount).toLocaleString('en-IN')} auto-debit`}
                              </div>
                            </div>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#bbcabf] mt-0.5">
                    <span className="px-1.5 py-0.2 rounded bg-white/5 text-[9px] font-bold tracking-wider text-slate-300 uppercase">
                      {tx.category}
                    </span>
                    <span>•</span>
                    <span>{tx.time}</span>
                  </div>
                </div>
              </div>

              <div className="text-right font-mono">
                <div
                  className={`text-sm font-bold ${
                    tx.amount > 0 ? 'text-[#4edea3]' : 'text-[#dfe2f1]'
                  }`}
                >
                  {tx.amount > 0 ? `+ ₹${tx.amount.toLocaleString('en-IN')}` : `- ₹${Math.abs(tx.amount).toLocaleString('en-IN')}`}
                </div>
                <div className="text-[11px] text-[#bbcabf] font-sans">
                  {tx.account}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
