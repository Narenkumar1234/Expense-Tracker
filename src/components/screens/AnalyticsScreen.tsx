import React, { useState } from 'react';

interface AnalyticsScreenProps {
  onOpenQuickAdd: () => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ onOpenQuickAdd }) => {
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

  const getPeriodSummary = () => {
    switch (period) {
      case 'Day':
        return {
          total: periodOffset === 0 ? '₹1,240' : '₹980',
          trend: '15% less than yesterday',
          average: 'Across 3 transactions',
          trendIcon: 'trending_down',
        };
      case 'Week':
        return {
          total: periodOffset === 0 ? '₹7,450' : '₹8,920',
          trend: '8% less than last week',
          average: 'Daily average: ₹1,064',
          trendIcon: 'trending_down',
        };
      case 'Month':
        return {
          total: periodOffset === 0 ? '₹31,800' : '₹29,400',
          trend: '12% less than last month',
          average: 'Daily average: ₹1,060',
          trendIcon: 'trending_down',
        };
      case 'Year':
        return {
          total: periodOffset === 0 ? '₹3,42,000' : '₹3,15,000',
          trend: '6% less than last year',
          average: 'Monthly average: ₹28,500',
          trendIcon: 'trending_down',
        };
    }
  };

  const summary = getPeriodSummary();

  const categories = [
    {
      name: 'Food & Dining',
      percent: 32,
      amount: 10176,
      color: '#4edea3',
      icon: 'restaurant',
      badgeClass: 'bg-[#4edea3]/20 text-[#4edea3]',
    },
    {
      name: 'Housing & Utilities',
      percent: 26,
      amount: 8268,
      color: '#6366f1',
      icon: 'home',
      badgeClass: 'bg-[#6366f1]/20 text-[#c0c1ff]',
    },
    {
      name: 'Shopping & Lifestyle',
      percent: 17,
      amount: 5406,
      color: '#dfe2f1',
      icon: 'shopping_bag',
      badgeClass: 'bg-white/10 text-white',
    },
    {
      name: 'Transportation',
      percent: 13,
      amount: 4134,
      color: '#f59e0b',
      icon: 'directions_car',
      badgeClass: 'bg-amber-500/20 text-amber-400',
    },
    {
      name: 'Entertainment',
      percent: 12,
      amount: 3900,
      color: '#ff7886',
      icon: 'sports_esports',
      badgeClass: 'bg-[#ff7886]/20 text-[#ff7886]',
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-28 pt-2 space-y-4">
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

      {/* Dynamic Period Navigator (Day, Week, Month, Year - Cannot move to future) */}
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
            <span className="material-symbols-outlined text-[14px]">{summary.trendIcon}</span>
            <span>{summary.trend}</span>
          </span>
        </div>

        <div className="font-mono text-3xl font-bold tracking-tight text-[#dfe2f1]">
          {summary.total}
        </div>

        <div className="flex items-center justify-between text-xs text-[#bbcabf] pt-1">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
            <span>{summary.average}</span>
          </div>
        </div>
      </div>

      {/* Spending Allocation Donut & Breakdown */}
      <div className="rounded-2xl bg-[#1c1f2a] border border-white/[0.06] p-4.5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#10b981]/15 text-[#4edea3] flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">donut_large</span>
            </div>
            <span className="text-sm font-semibold text-[#dfe2f1]">Spending Allocation</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#bbcabf]">
            5 CATEGORIES
          </span>
        </div>

        {/* Responsive Donut Chart & Category Indicators */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 max-w-full flex items-center justify-center transition-all">
            <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
              {/* Category 1: Food (32%) */}
              <circle
                cx="100"
                cy="100"
                r="65"
                fill="none"
                stroke="#4edea3"
                strokeWidth="20"
                strokeDasharray="130.7 277.7"
                strokeDashoffset="0"
                className="transition-all hover:stroke-[23px] cursor-pointer"
                onMouseEnter={() => setHoveredCategory('Food & Dining')}
                onMouseLeave={() => setHoveredCategory(null)}
              />

              {/* Category 2: Housing (26%) */}
              <circle
                cx="100"
                cy="100"
                r="65"
                fill="none"
                stroke="#6366f1"
                strokeWidth="20"
                strokeDasharray="106.2 302.2"
                strokeDashoffset="-130.7"
                className="transition-all hover:stroke-[23px] cursor-pointer"
                onMouseEnter={() => setHoveredCategory('Housing & Utilities')}
                onMouseLeave={() => setHoveredCategory(null)}
              />

              {/* Category 3: Shopping (17%) */}
              <circle
                cx="100"
                cy="100"
                r="65"
                fill="none"
                stroke="#dfe2f1"
                strokeWidth="20"
                strokeDasharray="69.4 339.0"
                strokeDashoffset="-236.9"
                className="transition-all hover:stroke-[23px] cursor-pointer"
                onMouseEnter={() => setHoveredCategory('Shopping & Lifestyle')}
                onMouseLeave={() => setHoveredCategory(null)}
              />

              {/* Category 4: Transport (13%) */}
              <circle
                cx="100"
                cy="100"
                r="65"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="20"
                strokeDasharray="53.1 355.3"
                strokeDashoffset="-306.3"
                className="transition-all hover:stroke-[23px] cursor-pointer"
                onMouseEnter={() => setHoveredCategory('Transportation')}
                onMouseLeave={() => setHoveredCategory(null)}
              />

              {/* Category 5: Entertainment (12%) */}
              <circle
                cx="100"
                cy="100"
                r="65"
                fill="none"
                stroke="#ff7886"
                strokeWidth="20"
                strokeDasharray="49.0 359.4"
                strokeDashoffset="-359.4"
                className="transition-all hover:stroke-[23px] cursor-pointer"
                onMouseEnter={() => setHoveredCategory('Entertainment')}
                onMouseLeave={() => setHoveredCategory(null)}
              />
            </svg>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
              <span className="text-[11px] text-[#bbcabf] uppercase font-bold tracking-wider">
                {hoveredCategory ? hoveredCategory.split(' ')[0] : 'TOTAL'}
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-bold text-[#dfe2f1] mt-0.5">
                {hoveredCategory
                  ? `₹${categories.find((c) => c.name === hoveredCategory)?.amount.toLocaleString('en-IN')}`
                  : summary.total}
              </span>
              <span className="text-[10px] text-[#4edea3] font-semibold mt-0.5">
                {hoveredCategory
                  ? `${categories.find((c) => c.name === hoveredCategory)?.percent}% of spend`
                  : '5 Categories'}
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
              className="flex items-center justify-between p-2 rounded-xl bg-[#171b26] border border-white/[0.04] hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#262a35] flex items-center justify-center" style={{ color: c.color }}>
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
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${c.badgeClass}`}>
                  Budgeted
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Spending Rhythm (Velocity Line Graph) */}
      <div className="rounded-2xl bg-[#1c1f2a] border border-white/[0.06] p-4.5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#10b981]/15 text-[#4edea3] flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">show_chart</span>
            </div>
            <span className="text-sm font-semibold text-[#dfe2f1]">Daily Spending Velocity</span>
          </div>
          <span className="text-xs text-[#4edea3] font-mono font-semibold">Avg ₹1,060/day</span>
        </div>

        <div className="pt-2">
          <svg viewBox="0 0 320 100" className="w-full h-24 overflow-visible">
            <defs>
              <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4edea3" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#4edea3" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Baseline Guide Grid Lines */}
            <line x1="0" y1="20" x2="320" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
            <line x1="0" y1="50" x2="320" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
            <line x1="0" y1="80" x2="320" y2="80" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

            {/* Gradient Fill under Curve */}
            <path
              d="M 10,80 Q 40,75 70,50 T 130,40 T 190,65 T 250,30 T 310,45 L 310,95 L 10,95 Z"
              fill="url(#velocityGradient)"
            />

            {/* Velocity Trend Curve */}
            <path
              d="M 10,80 Q 40,75 70,50 T 130,40 T 190,65 T 250,30 T 310,45"
              fill="none"
              stroke="#4edea3"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Today Glowing Node */}
            <circle cx="250" cy="30" r="5" fill="#10b981" className="filter drop-shadow-[0_0_8px_rgba(78,222,163,0.8)]" />
            <circle cx="250" cy="30" r="2" fill="#ffffff" />
          </svg>

          {/* X Axis Labels */}
          <div className="flex items-center justify-between text-[10px] text-[#bbcabf] font-mono pt-1">
            <span>Start</span>
            <span>Mid</span>
            <span className="text-[#4edea3] font-bold">Peak</span>
            <span>Current</span>
          </div>
        </div>
      </div>

      {/* Top Merchants (View All removed per instructions) */}
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
          {/* Merchant 1 */}
          <div className="p-3 rounded-xl bg-[#1c1f2a] border border-white/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#10b981]/20 text-[#4edea3] text-[11px] font-bold flex items-center justify-center">
                1
              </div>
              <div>
                <div className="text-xs font-semibold text-[#dfe2f1] truncate max-w-[85px]">
                  Whole Foods
                </div>
                <div className="text-[10px] text-[#bbcabf]">6 transactions</div>
              </div>
            </div>
            <div className="font-mono text-xs font-bold text-[#4edea3]">
              ₹4,800
            </div>
          </div>

          {/* Merchant 2 */}
          <div className="p-3 rounded-xl bg-[#1c1f2a] border border-white/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#6366f1]/20 text-[#c0c1ff] text-[11px] font-bold flex items-center justify-center">
                2
              </div>
              <div>
                <div className="text-xs font-semibold text-[#dfe2f1] truncate max-w-[85px]">
                  Amazon
                </div>
                <div className="text-[10px] text-[#bbcabf]">4 orders</div>
              </div>
            </div>
            <div className="font-mono text-xs font-bold text-[#dfe2f1]">
              ₹3,100
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
