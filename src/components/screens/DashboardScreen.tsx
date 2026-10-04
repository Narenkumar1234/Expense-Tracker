import React, { useState, useRef, useEffect } from 'react';
import { Transaction, UserProfile } from '../../types';

interface DashboardScreenProps {
  user: UserProfile;
  transactions: Transaction[];
  onOpenQuickAdd: (type?: 'expense' | 'income') => void;
  onNavigate: (screen: 'dashboard' | 'analytics' | 'budgets' | 'transactions') => void;
  onSelectTransaction: (tx: Transaction) => void;
}

type HomeWidgetId = 'balance' | 'monthlySpend' | 'weeklyCadence' | 'activity';

const DEFAULT_WIDGET_ORDER: HomeWidgetId[] = ['balance', 'monthlySpend', 'weeklyCadence', 'activity'];

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

  // Widget order with local persistence
  const [widgetOrder, setWidgetOrder] = useState<HomeWidgetId[]>(() => {
    try {
      const saved = localStorage.getItem('aura_home_widget_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 4) return parsed;
      }
    } catch (e) {}
    return DEFAULT_WIDGET_ORDER;
  });

  // Long press & drag state for Home Cards
  const [longPressWidget, setLongPressWidget] = useState<HomeWidgetId | null>(null);
  const [draggedWidget, setDraggedWidget] = useState<HomeWidgetId | null>(null);
  const [dragOverWidget, setDragOverWidget] = useState<HomeWidgetId | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  // Transaction items reordering state
  const [activityItems, setActivityItems] = useState<Transaction[]>(transactions.slice(0, 4));
  const [longPressTxId, setLongPressTxId] = useState<string | null>(null);
  const [draggedTxId, setDraggedTxId] = useState<string | null>(null);
  const [dragOverTxId, setDragOverTxId] = useState<string | null>(null);
  const txTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setActivityItems(transactions.slice(0, 4));
  }, [transactions]);

  // Real dynamic calculations from user transactions & profile
  const totalInflow = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflow = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const monthlyIncome = user.monthlyBaseIncome || (totalInflow > 0 ? totalInflow : 0);
  const spentSoFar = totalOutflow;
  const incomeSpentPercent =
    monthlyIncome > 0
      ? Math.min(100, Math.round((spentSoFar / monthlyIncome) * 100 * 10) / 10)
      : 0;
  const unspentIncome = Math.max(0, monthlyIncome - spentSoFar);
  const netBalance = Math.max(0, (totalInflow > 0 ? totalInflow : monthlyIncome) - spentSoFar);

  // Dynamic Weekly spend distribution
  const weekDays = [
    { label: 'M', amount: 0, height: '12%' },
    { label: 'T', amount: 0, height: '12%' },
    { label: 'W', amount: 0, height: '12%' },
    { label: 'T', amount: 0, height: '12%', isToday: true },
    { label: 'F', amount: 0, height: '12%' },
    { label: 'S', amount: 0, height: '12%' },
    { label: 'S', amount: 0, height: '12%' },
  ];

  if (transactions.length > 0) {
    transactions
      .filter((t) => t.amount < 0)
      .slice(0, 14)
      .forEach((t, i) => {
        const idx = i % 7;
        weekDays[idx].amount += Math.abs(t.amount);
      });
    const maxVal = Math.max(...weekDays.map((w) => w.amount), 1);
    weekDays.forEach((w) => {
      w.height = w.amount > 0 ? `${Math.min(100, Math.max(20, Math.round((w.amount / maxVal) * 100)))}%` : '12%';
    });
  }

  // Long press handlers for widgets
  const startWidgetLongPress = (id: HomeWidgetId, e: React.PointerEvent) => {
    touchStartPos.current = { x: e.clientX, y: e.clientY };
    longPressTimerRef.current = setTimeout(() => {
      setLongPressWidget(id);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
    }, 380);
  };

  const cancelWidgetLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    touchStartPos.current = null;
  };

  const handlePointerMoveWidget = (e: React.PointerEvent) => {
    if (touchStartPos.current && !longPressWidget) {
      const dx = Math.abs(e.clientX - touchStartPos.current.x);
      const dy = Math.abs(e.clientY - touchStartPos.current.y);
      if (dx > 8 || dy > 8) {
        cancelWidgetLongPress();
      }
    }
  };

  // Reorder widgets
  const moveWidget = (id: HomeWidgetId, direction: 'up' | 'down') => {
    const idx = widgetOrder.indexOf(id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= widgetOrder.length) return;

    const newOrder = [...widgetOrder];
    const [removed] = newOrder.splice(idx, 1);
    newOrder.splice(targetIdx, 0, removed);
    setWidgetOrder(newOrder);
    try {
      localStorage.setItem('aura_home_widget_order', JSON.stringify(newOrder));
    } catch (err) {}
  };

  const handleWidgetDrop = (targetId: HomeWidgetId) => {
    if (!draggedWidget || draggedWidget === targetId) {
      setDraggedWidget(null);
      setDragOverWidget(null);
      return;
    }
    const fromIdx = widgetOrder.indexOf(draggedWidget);
    const toIdx = widgetOrder.indexOf(targetId);
    if (fromIdx !== -1 && toIdx !== -1) {
      const newOrder = [...widgetOrder];
      const [removed] = newOrder.splice(fromIdx, 1);
      newOrder.splice(toIdx, 0, removed);
      setWidgetOrder(newOrder);
      try {
        localStorage.setItem('aura_home_widget_order', JSON.stringify(newOrder));
      } catch (err) {}
    }
    setDraggedWidget(null);
    setDragOverWidget(null);
    setLongPressWidget(null);
  };

  // Long press handlers for Activity Transaction items
  const startTxLongPress = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    touchStartPos.current = { x: e.clientX, y: e.clientY };
    txTimerRef.current = setTimeout(() => {
      setLongPressTxId(id);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(35);
      }
    }, 380);
  };

  const cancelTxLongPress = () => {
    if (txTimerRef.current) {
      clearTimeout(txTimerRef.current);
      txTimerRef.current = null;
    }
  };

  const handleTxDrop = (targetId: string) => {
    if (!draggedTxId || draggedTxId === targetId) {
      setDraggedTxId(null);
      setDragOverTxId(null);
      return;
    }
    const fromIdx = activityItems.findIndex((t) => t.id === draggedTxId);
    const toIdx = activityItems.findIndex((t) => t.id === targetId);
    if (fromIdx !== -1 && toIdx !== -1) {
      const newItems = [...activityItems];
      const [removed] = newItems.splice(fromIdx, 1);
      newItems.splice(toIdx, 0, removed);
      setActivityItems(newItems);
    }
    setDraggedTxId(null);
    setDragOverTxId(null);
    setLongPressTxId(null);
  };

  // Render individual modular sections
  const renderBalanceCard = () => (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#1c1f2a] to-[#171b26] border border-white/[0.08] p-5 shadow-xl select-none">
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
        {isBalanceHidden
          ? '₹ • •,• •,• • •'
          : `₹${netBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
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
            +₹{(totalInflow > 0 ? totalInflow : monthlyIncome).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#bbcabf] mt-0.5">
            {totalInflow > 0 ? 'Logged income' : 'Base monthly allocation'}
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
            -₹{spentSoFar.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#bbcabf] mt-0.5">
            {spentSoFar === 0 ? 'No expenses yet' : `${incomeSpentPercent}% of monthly income`}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMonthlySpendCard = () => (
    <div className="rounded-2xl bg-[#1c1f2a] border border-white/[0.06] p-4.5 shadow-lg space-y-3 select-none">
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
          <span className="text-[#dfe2f1]">Spent ₹{spentSoFar.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
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
  );

  const renderWeeklyCadenceCard = () => (
    <div className="rounded-2xl bg-[#1c1f2a] border border-white/[0.06] p-4.5 shadow-lg space-y-3 select-none">
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
              className="flex-1 flex flex-col items-center gap-1.5 group focus:outline-none cursor-pointer"
            >
              <div className="w-full flex items-end justify-center h-20 relative">
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
  );

  const renderActivityCard = () => (
    <div className="space-y-2.5 select-none">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#dfe2f1]">Activity</span>
          <span className="px-2 py-0.5 rounded-full bg-[#171b26] text-[#bbcabf] text-[11px]">
            {activityItems.length} recent
          </span>
        </div>
        <button
          onClick={() => onNavigate('transactions')}
          className="text-xs font-semibold text-[#4edea3] hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>See All</span>
          <span className="material-symbols-outlined text-[15px]">chevron_right</span>
        </button>
      </div>

      {activityItems.length === 0 ? (
        <div className="p-6 rounded-2xl bg-[#1c1f2a] border border-white/[0.04] text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-white/5 text-[#bbcabf] mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          </div>
          <div className="text-xs font-bold text-[#dfe2f1]">No Recent Transactions</div>
          <p className="text-[11px] text-[#bbcabf] max-w-[240px] mx-auto">
            Transactions you record will appear here. Tap below to log your first transaction.
          </p>
          <button
            onClick={() => onOpenQuickAdd('expense')}
            className="mt-1 px-3 py-1.5 rounded-lg bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#4edea3] text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px]">add</span>
            <span>Add Transaction</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {activityItems.map((tx, idx) => {
          const isTxLongPressed = longPressTxId === tx.id;
          const isTxDragging = draggedTxId === tx.id;
          const isTxDragOver = dragOverTxId === tx.id;

          return (
            <div
              key={tx.id}
              draggable={isTxLongPressed}
              onPointerDown={(e) => startTxLongPress(tx.id, e)}
              onPointerUp={cancelTxLongPress}
              onPointerLeave={cancelTxLongPress}
              onDragStart={(e) => {
                setDraggedTxId(tx.id);
                e.dataTransfer.setData('text/plain', tx.id);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverTxId(tx.id);
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleTxDrop(tx.id);
              }}
              onDragEnd={() => {
                setDraggedTxId(null);
                setDragOverTxId(null);
                setLongPressTxId(null);
              }}
              onClick={() => {
                if (!isTxLongPressed) {
                  onSelectTransaction(tx);
                }
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between relative ${
                isTxLongPressed
                  ? 'bg-[#262a35] border-[#4edea3] shadow-[0_4px_20px_rgba(16,185,129,0.3)] scale-[1.01] ring-1 ring-[#4edea3]'
                  : isTxDragOver
                  ? 'bg-[#1c1f2a] border-[#4edea3] border-dashed scale-[0.99]'
                  : 'bg-[#1c1f2a] border-white/[0.04] hover:bg-[#262a35] active:scale-[0.99]'
              } ${isTxDragging ? 'opacity-40' : 'opacity-100'}`}
            >
              {/* Drag reorder handle when long pressed */}
              {isTxLongPressed && (
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#10b981] text-[#002113] flex items-center justify-center shadow-lg z-20 animate-pulse">
                  <span className="material-symbols-outlined text-[15px] font-bold">drag_indicator</span>
                </div>
              )}

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

              <div className="flex items-center gap-2">
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

                {isTxLongPressed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLongPressTxId(null);
                    }}
                    className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-[#bbcabf]"
                    title="Done"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );

  return (
    <div
      className="w-full max-w-md mx-auto px-4 pt-3 space-y-4 pb-36"
      style={{
        paddingBottom: 'calc(7.5rem + env(safe-area-inset-bottom, 20px))',
      }}
    >
      {/* Greeting Header */}
      <div className="flex items-center justify-between pt-1">
        <h1 className="text-2xl font-bold tracking-tight text-[#dfe2f1]">
          Good afternoon, {user.name.split(' ')[0]}
        </h1>
        {longPressWidget && (
          <button
            onClick={() => setLongPressWidget(null)}
            className="px-2.5 py-1 rounded-full bg-[#10b981]/20 border border-[#10b981]/40 text-[#4edea3] text-[11px] font-bold flex items-center gap-1 animate-pulse"
          >
            <span className="material-symbols-outlined text-[14px]">check</span>
            <span>Done</span>
          </button>
        )}
      </div>

      {/* Long Press Reorder Instruction Badge */}
      {longPressWidget && (
        <div className="px-3 py-2 rounded-xl bg-[#10b981]/15 border border-[#10b981]/30 text-xs text-[#4edea3] font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">drag_pan</span>
            <span>Drag items or use arrows to reorder Home</span>
          </div>
          <button
            onClick={() => setLongPressWidget(null)}
            className="text-[11px] uppercase font-bold text-[#dfe2f1] hover:underline"
          >
            Finish
          </button>
        </div>
      )}

      {/* Draggable Home Widgets */}
      <div className="space-y-4">
        {widgetOrder.map((widgetId, index) => {
          const isWidgetLongPressed = longPressWidget === widgetId;
          const isWidgetDragging = draggedWidget === widgetId;
          const isWidgetDragOver = dragOverWidget === widgetId;

          return (
            <div
              key={widgetId}
              draggable={isWidgetLongPressed}
              onPointerDown={(e) => startWidgetLongPress(widgetId, e)}
              onPointerUp={cancelWidgetLongPress}
              onPointerMove={handlePointerMoveWidget}
              onPointerLeave={cancelWidgetLongPress}
              onDragStart={(e) => {
                setDraggedWidget(widgetId);
                e.dataTransfer.setData('text/plain', widgetId);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverWidget(widgetId);
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleWidgetDrop(widgetId);
              }}
              onDragEnd={() => {
                setDraggedWidget(null);
                setDragOverWidget(null);
                setLongPressWidget(null);
              }}
              className={`transition-all duration-200 relative ${
                isWidgetLongPressed
                  ? 'ring-2 ring-[#4edea3] shadow-[0_12px_36px_rgba(0,0,0,0.6)] rounded-2xl scale-[1.01] z-30'
                  : isWidgetDragOver
                  ? 'border-2 border-dashed border-[#4edea3] rounded-2xl scale-[0.98]'
                  : ''
              } ${isWidgetDragging ? 'opacity-40' : 'opacity-100'}`}
            >
              {/* Draggable Controls Header on Long Press */}
              {isWidgetLongPressed && (
                <div className="mb-2 p-2 rounded-xl bg-[#171b26] border border-[#10b981]/40 flex items-center justify-between text-xs text-[#4edea3] font-bold shadow-md animate-in fade-in">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
                    <span>Drag or Nudge Position</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveWidget(widgetId, 'up');
                      }}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-[#dfe2f1]"
                      title="Move Up"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                    </button>
                    <button
                      type="button"
                      disabled={index === widgetOrder.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveWidget(widgetId, 'down');
                      }}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-[#dfe2f1]"
                      title="Move Down"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Render Section Component */}
              {widgetId === 'balance' && renderBalanceCard()}
              {widgetId === 'monthlySpend' && renderMonthlySpendCard()}
              {widgetId === 'weeklyCadence' && renderWeeklyCadenceCard()}
              {widgetId === 'activity' && renderActivityCard()}
            </div>
          );
        })}
      </div>
    </div>
  );
};
