import React, { useState, useMemo } from 'react';
import { Transaction } from '../../types';

interface AnalyticsScreenProps {
  transactions: Transaction[];
  onOpenQuickAdd: () => void;
}

const CATEGORY_COLORS: Record<string, { color: string; icon: string }> = {
  FOOD: { color: '#ff7886', icon: 'restaurant' },
  GROCERIES: { color: '#4edea3', icon: 'shopping_cart' },
  BILLS: { color: '#6366f1', icon: 'bolt' },
  SHOPPING: { color: '#f59e0b', icon: 'shopping_bag' },
  TRANSPORT: { color: '#38bdf8', icon: 'directions_car' },
  ENTERTAINMENT: { color: '#ec4899', icon: 'sports_esports' },
  HEALTH: { color: '#10b981', icon: 'favorite' },
  SOFTWARE: { color: '#8b5cf6', icon: 'terminal' },
  SALARY: { color: '#10b981', icon: 'payments' },
  OTHER: { color: '#94a3b8', icon: 'receipt_long' },
};

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  transactions,
  onOpenQuickAdd,
}) => {
  const [period, setPeriod] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Month');
  const [periodOffset, setPeriodOffset] = useState<number>(0); // 0 = current, 1 = previous, etc.
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const handlePeriodChange = (tab: 'Day' | 'Week' | 'Month' | 'Year') => {
    setPeriod(tab);
    setPeriodOffset(0); // Reset to current period
  };

  const getPeriodLabel = () => {
    const now = new Date();
    if (period === 'Day') {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() - periodOffset);
      if (periodOffset === 0) {
        return 'Today, ' + targetDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      if (periodOffset === 1) {
        return 'Yesterday, ' + targetDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return targetDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }

    if (period === 'Week') {
      const currentSunday = new Date();
      currentSunday.setDate(now.getDate() - now.getDay() - (periodOffset * 7));
      const currentSaturday = new Date(currentSunday);
      currentSaturday.setDate(currentSunday.getDate() + 6);
      
      const formatDay = (d: Date) => d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      if (periodOffset === 0) return `This Week (${formatDay(currentSunday)} - ${formatDay(currentSaturday)})`;
      if (periodOffset === 1) return `Last Week (${formatDay(currentSunday)} - ${formatDay(currentSaturday)})`;
      return `${formatDay(currentSunday)} - ${formatDay(currentSaturday)}, ${currentSaturday.getFullYear()}`;
    }

    if (period === 'Month') {
      const targetMonth = new Date(now.getFullYear(), now.getMonth() - periodOffset, 1);
      return targetMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    }

    if (period === 'Year') {
      const targetYear = now.getFullYear() - periodOffset;
      return `${targetYear}`;
    }

    return '';
  };

  const getPeriodIcon = () => {
    switch (period) {
      case 'Day': return 'today';
      case 'Week': return 'date_range';
      case 'Month': return 'calendar_month';
      case 'Year': return 'calendar_today';
    }
  };

  // Filter transactions for selected period
  const periodExpenses = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => {
      if (t.amount >= 0) return false; // Only expenses
      const txDate = new Date(t.date);
      const isInvalidDate = isNaN(txDate.getTime());
      
      if (period === 'Day') {
        const targetDate = new Date();
        targetDate.setDate(now.getDate() - periodOffset);
        if (isInvalidDate) {
          return periodOffset === 0;
        }
        return (
          txDate.getDate() === targetDate.getDate() &&
          txDate.getMonth() === targetDate.getMonth() &&
          txDate.getFullYear() === targetDate.getFullYear()
        );
      }

      if (period === 'Week') {
        if (isInvalidDate) return periodOffset === 0;
        const diffTime = Math.abs(now.getTime() - txDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const weekBucket = Math.floor(diffDays / 7);
        return weekBucket === periodOffset;
      }

      if (period === 'Month') {
        const targetMonth = new Date(now.getFullYear(), now.getMonth() - periodOffset, 1);
        if (isInvalidDate) return periodOffset === 0;
        return (
          txDate.getMonth() === targetMonth.getMonth() &&
          txDate.getFullYear() === targetMonth.getFullYear()
        );
      }

      if (period === 'Year') {
        const targetYear = now.getFullYear() - periodOffset;
        if (isInvalidDate) return periodOffset === 0;
        return txDate.getFullYear() === targetYear;
      }

      return true;
    });
  }, [transactions, period, periodOffset]);

  const totalSpent = useMemo(() => {
    return periodExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [periodExpenses]);

  // Aggregate by category
  const categories = useMemo(() => {
    if (totalSpent === 0) return [];

    const map = new Map<string, { amount: number; count: number; categoryType: string }>();
    periodExpenses.forEach((t) => {
      const catKey = t.category || 'General';
      const existing = map.get(catKey) || { amount: 0, count: 0, categoryType: t.categoryType || 'OTHER' };
      existing.amount += Math.abs(t.amount);
      existing.count += 1;
      map.set(catKey, existing);
    });

    const list = Array.from(map.entries()).map(([name, data]) => {
      const percent = Math.round((data.amount / totalSpent) * 100);
      const conf = CATEGORY_COLORS[data.categoryType] || CATEGORY_COLORS.OTHER;
      return {
        name,
        amount: data.amount,
        percent,
        color: conf.color,
        icon: conf.icon,
      };
    });

    list.sort((a, b) => b.amount - a.amount);
    return list;
  }, [periodExpenses, totalSpent]);

  // Top merchants
  const topMerchants = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    periodExpenses.forEach((t) => {
      const m = t.merchant || 'Merchant';
      const cur = map.get(m) || { total: 0, count: 0 };
      cur.total += Math.abs(t.amount);
      cur.count += 1;
      map.set(m, cur);
    });

    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);
  }, [periodExpenses]);

  // Donut chart calculations
  const circumference = 2 * Math.PI * 65; // ~408.4
  let accumulatedOffset = 0;

  return (
    <div
      className="w-full max-w-md mx-auto px-4 pt-2 space-y-4 pb-36"
      style={{
        paddingBottom: 'calc(7.5rem + env(safe-area-inset-bottom, 20px))',
      }}
    >
      {/* Period Segmented Switcher (Day, Week, Month, Year) */}
      <div className="bg-[#171b26] p-1 rounded-full flex items-center justify-between border border-white/[0.04]">
        {(['Day', 'Week', 'Month', 'Year'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => handlePeriodChange(tab)}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold text-center transition-all cursor-pointer ${
              period === tab
                ? 'bg-[#10b981] text-[#002113] shadow-md font-bold'
                : 'text-[#bbcabf] hover:text-[#dfe2f1]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dynamic Period Navigator */}
      <div className="flex items-center justify-between px-2">
        <button
          onClick={() => setPeriodOffset((prev) => prev + 1)}
          className="w-8 h-8 rounded-full bg-[#1c1f2a] hover:bg-[#262a35] text-[#dfe2f1] flex items-center justify-center transition-colors cursor-pointer"
          aria-label={`Previous ${period}`}
          title={`Previous ${period}`}
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>

        <div className="flex items-center gap-1.5 text-sm font-semibold text-[#dfe2f1]">
          <span className="material-symbols-outlined text-[16px] text-[#4edea3]">{getPeriodIcon()}</span>
          <span>{getPeriodLabel()}</span>
        </div>

        <button
          onClick={() => setPeriodOffset((prev) => Math.max(0, prev - 1))}
          disabled={periodOffset <= 0}
          className={`w-8 h-8 rounded-full bg-[#1c1f2a] flex items-center justify-center transition-colors ${
            periodOffset <= 0
              ? 'opacity-25 cursor-not-allowed text-[#bbcabf]'
              : 'hover:bg-[#262a35] text-[#dfe2f1] cursor-pointer'
          }`}
          aria-label={`Next ${period}`}
          title={periodOffset <= 0 ? 'Cannot move to future' : `Next ${period}`}
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>

      {/* Total Spent Hero Card */}
      <div className="rounded-2xl bg-[#1c1f2a] border border-white/[0.06] p-4.5 shadow-lg space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#bbcabf]">
            TOTAL SPENT
          </span>
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#10b981]/15 text-[#4edea3] text-xs font-semibold">
            <span className="material-symbols-outlined text-[14px]">insights</span>
            <span>{periodExpenses.length} transactions</span>
          </span>
        </div>

        <div className="font-mono text-3xl font-bold tracking-tight text-[#dfe2f1]">
          ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>

        <div className="flex items-center justify-between text-xs text-[#bbcabf] pt-1">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
            <span>
              {periodExpenses.length > 0
                ? `Avg ₹${Math.round(totalSpent / periodExpenses.length).toLocaleString('en-IN')} per entry`
                : 'No expenses for this period'}
            </span>
          </div>
        </div>
      </div>

      {/* Zero State if No Spending in selected period */}
      {totalSpent === 0 ? (
        <div className="rounded-2xl bg-[#1c1f2a] border border-white/[0.04] p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#171b26] border border-white/5 text-[#bbcabf] mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">donut_large</span>
          </div>
          <div className="text-sm font-bold text-[#dfe2f1]">No Spending Data</div>
          <p className="text-xs text-[#bbcabf] max-w-[240px] mx-auto">
            {periodOffset === 0
              ? 'You have not recorded any expenses for this period yet.'
              : `No expenses found for ${getPeriodLabel()}.`}
          </p>
          <button
            onClick={onOpenQuickAdd}
            className="mt-2 px-4 py-2 rounded-xl bg-[#10b981] hover:bg-[#34d399] text-[#002113] text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Add Expense</span>
          </button>
        </div>
      ) : (
        /* Dynamic Spending Allocation Donut & Breakdown */
        <div className="rounded-2xl bg-[#1c1f2a] border border-white/[0.06] p-4.5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#10b981]/15 text-[#4edea3] flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">donut_large</span>
              </div>
              <span className="text-sm font-semibold text-[#dfe2f1]">Spending Allocation</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#bbcabf]">
              {categories.length} {categories.length === 1 ? 'CATEGORY' : 'CATEGORIES'}
            </span>
          </div>

          {/* Responsive Donut Chart & Category Indicators */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 max-w-full flex items-center justify-center transition-all">
              <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                {categories.map((c) => {
                  const strokeLength = (c.percent / 100) * circumference;
                  const dashOffset = -accumulatedOffset;
                  accumulatedOffset += strokeLength;

                  return (
                    <circle
                      key={c.name}
                      cx="100"
                      cy="100"
                      r="65"
                      fill="none"
                      stroke={c.color}
                      strokeWidth="20"
                      strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                      strokeDashoffset={dashOffset}
                      className="transition-all hover:stroke-[23px] cursor-pointer"
                      onMouseEnter={() => setHoveredCategory(c.name)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    />
                  );
                })}
              </svg>

              {/* Inner Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                <span className="text-[11px] text-[#bbcabf] uppercase font-bold tracking-wider">
                  {hoveredCategory ? hoveredCategory.split(' ')[0] : 'TOTAL'}
                </span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-[#dfe2f1] mt-0.5">
                  {hoveredCategory
                    ? `₹${categories.find((c) => c.name === hoveredCategory)?.amount.toLocaleString('en-IN')}`
                    : `₹${totalSpent.toLocaleString('en-IN')}`}
                </span>
                <span className="text-[10px] text-[#4edea3] font-semibold mt-0.5">
                  {hoveredCategory
                    ? `${categories.find((c) => c.name === hoveredCategory)?.percent}% of spend`
                    : `${categories.length} Categories`}
                </span>
              </div>
            </div>

            {/* Clean Interactive Horizontal Tag Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-4 px-1 w-full">
              {categories.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onMouseEnter={() => setHoveredCategory(c.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  onClick={() => setHoveredCategory(hoveredCategory === c.name ? null : c.name)}
                  className={`flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs transition-all cursor-pointer ${
                    hoveredCategory === c.name
                      ? 'bg-white/15 text-white ring-1 ring-white/30 scale-105'
                      : 'bg-[#171b26] text-[#bbcabf] hover:text-[#dfe2f1] border border-white/[0.04]'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="font-semibold">{c.name.split(' ')[0]}</span>
                  <span className="font-mono text-[10px] opacity-75">{c.percent}%</span>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Category Rows */}
          <div className="space-y-2 pt-2 border-t border-white/[0.04]">
            {categories.map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#171b26] border border-white/[0.04] hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg bg-[#262a35] flex items-center justify-center"
                    style={{ color: c.color }}
                  >
                    <span className="material-symbols-outlined text-[18px]">{c.icon}</span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#dfe2f1]">{c.name}</div>
                    <div className="text-[10px] text-[#bbcabf] font-mono">{c.percent}% of total spend</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-[#dfe2f1]">
                    ₹{c.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Merchants Card if available */}
      {topMerchants.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#4edea3]">
                storefront
              </span>
              <span className="text-sm font-bold text-[#dfe2f1]">Top Merchants</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {topMerchants.map((m, idx) => (
              <div
                key={m.name}
                className="p-3 rounded-xl bg-[#1c1f2a] border border-white/[0.04] flex items-center justify-between"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-[#10b981]/20 text-[#4edea3] text-[11px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#dfe2f1] truncate">
                      {m.name}
                    </div>
                    <div className="text-[10px] text-[#bbcabf]">{m.count} txns</div>
                  </div>
                </div>
                <div className="font-mono text-xs font-bold text-[#4edea3] shrink-0 ml-1">
                  ₹{m.total.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
