import React, { useState } from 'react';
import { Transaction, PaymentCard, UserProfile } from '../../types';

interface QuickAddModalProps {
  initialType?: 'expense' | 'income';
  cards: PaymentCard[];
  user: UserProfile;
  onClose: () => void;
  onSaveTransaction: (tx: Omit<Transaction, 'id'>) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  initialType = 'expense',
  cards,
  user,
  onClose,
  onSaveTransaction,
}) => {
  const [txType, setTxType] = useState<'expense' | 'income'>(initialType);
  const [currency, setCurrency] = useState<'INR (₹)' | 'USD ($)' | 'EUR (€)'>('INR (₹)');
  const [amountString, setAmountString] = useState('845.00');
  const [selectedCategory, setSelectedCategory] = useState('Food');
  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.id || 'card-1');

  // Dynamic live current date and time
  const getCurrentFormattedDateTime = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    const dateStr = now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    return `Today, ${timeStr} • ${dateStr}`;
  };

  const [dateTime] = useState(getCurrentFormattedDateTime());
  const [merchantNote, setMerchantNote] = useState('Dinner with Sarah at Osteria');

  // Recurring disabled initially (false)
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Monthly');
  const [recurringMonths, setRecurringMonths] = useState<number>(6);
  const [recurringEntryMode, setRecurringEntryMode] = useState<'per_cycle' | 'total_contract'>('per_cycle');
  const [isSaving, setIsSaving] = useState(false);

  // Compute smart monthly calculation and commitment
  const numAmount = parseFloat(amountString) || 0;
  let monthlyEquivalent = 0;
  let totalCommitment = 0;

  if (recurringEntryMode === 'total_contract') {
    totalCommitment = numAmount;
    monthlyEquivalent = recurringMonths > 0 ? numAmount / recurringMonths : numAmount;
  } else {
    if (recurringFrequency === 'Monthly') {
      monthlyEquivalent = numAmount;
    } else if (recurringFrequency === 'Yearly') {
      monthlyEquivalent = numAmount / 12;
    } else if (recurringFrequency === 'Weekly') {
      monthlyEquivalent = (numAmount * 52) / 12;
    } else if (recurringFrequency === 'Daily') {
      monthlyEquivalent = numAmount * 30;
    }
    totalCommitment = monthlyEquivalent * recurringMonths;
  }

  // Calculate projected end date
  const computeEndDate = (months: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  const cycleEndDate = computeEndDate(recurringMonths);

  // Percentage of safe-to-spend remainder (₹13,199.50)
  const remainderPercentage = Math.min(100, Math.round((monthlyEquivalent / 13199.5) * 100));

  // Category definitions: 8 for expenses, 4 for income
  const EXPENSE_CATEGORIES = [
    { id: 'Food', label: 'Food', icon: 'restaurant' },
    { id: 'Groceries', label: 'Groceries', icon: 'shopping_bag' },
    { id: 'Transport', label: 'Transport', icon: 'directions_subway' },
    { id: 'Shopping', label: 'Shopping', icon: 'shopping_basket' },
    { id: 'Bills', label: 'Bills', icon: 'receipt' },
    { id: 'Fun', label: 'Fun', icon: 'movie' },
    { id: 'Health', label: 'Health', icon: 'favorite' },
    { id: 'Other', label: 'Other', icon: 'more_horiz' },
  ];

  const INCOME_CATEGORIES = [
    { id: 'Salary', label: 'Salary', icon: 'payments' },
    { id: 'Stocks', label: 'Stocks', icon: 'trending_up' },
    { id: 'Freelance', label: 'Freelance', icon: 'laptop_mac' },
    { id: 'Other', label: 'Other', icon: 'savings' },
  ];

  const currentCategories = txType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (type: 'expense' | 'income') => {
    setTxType(type);
    if (type === 'income') {
      setSelectedCategory('Salary');
      setIsRecurring(false);
    } else {
      setSelectedCategory('Food');
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    const numAmount = parseFloat(amountString) || 0;
    const finalAmount = txType === 'expense' ? -Math.abs(numAmount) : Math.abs(numAmount);
    const selectedCard = cards.find((c) => c.id === selectedCardId);

    const categoryTypeMap: { [key: string]: any } = {
      Food: 'FOOD',
      Groceries: 'GROCERIES',
      Transport: 'TRANSPORT',
      Shopping: 'SHOPPING',
      Bills: 'BILLS',
      Fun: 'ENTERTAINMENT',
      Health: 'HEALTH',
      Other: 'OTHER',
      Salary: 'SALARY',
      Stocks: 'INVESTMENT',
      Freelance: 'INCOME',
    };

    setTimeout(() => {
      onSaveTransaction({
        merchant: merchantNote.trim() || (txType === 'income' ? 'Income Deposit' : 'New Entry'),
        category: selectedCategory.toUpperCase(),
        categoryType: categoryTypeMap[selectedCategory] || 'OTHER',
        amount: finalAmount,
        date: new Date().toISOString().split('T')[0],
        dateGroup: 'TODAY',
        time: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        account: selectedCard ? `${selectedCard.bankName.split(' ')[0]} ${selectedCard.variant}` : 'Aura Vault',
        status: 'completed',
        icon: currentCategories.find((c) => c.id === selectedCategory)?.icon || 'receipt',
        notes: merchantNote,
        isRecurring: txType === 'expense' ? isRecurring : false,
        recurringDurationMonths: txType === 'expense' && isRecurring ? recurringMonths : undefined,
        recurringFrequency: txType === 'expense' && isRecurring ? recurringFrequency : undefined,
        monthlyEquivalent: txType === 'expense' && isRecurring ? monthlyEquivalent : undefined,
        totalCommitment: txType === 'expense' && isRecurring ? totalCommitment : undefined,
        remainingCycles: txType === 'expense' && isRecurring ? recurringMonths : undefined,
        cycleEndDate: txType === 'expense' && isRecurring ? cycleEndDate : undefined,
      });
      setIsSaving(false);
      onClose();
    }, 500);
  };

  const getCurrencySymbol = () => {
    if (currency.includes('USD')) return '$';
    if (currency.includes('EUR')) return '€';
    return '₹';
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm backdrop-fade-in">
      {/* Dimmed backdrop - click outside to dismiss */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Bottom Sheet that slides up from bottom to top */}
      <div className="w-full max-w-md mx-auto h-[92vh] max-h-[92vh] bg-[#0f131d] rounded-t-3xl border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.6)] flex flex-col justify-between overflow-hidden sheet-slide-up relative">
        {/* Grab Handle */}
        <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mt-2.5 mb-0.5 shrink-0" />

        {/* Top Header */}
        <header className="modal-header shrink-0 bg-[#0f131d]/95 border-b border-white/[0.04]">
          <div className="h-13 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                onClick={onClose}
                className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-[#dfe2f1] hover:text-[#4edea3] transition-colors"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
              <div className="w-7 h-7 rounded-lg bg-[#171b26] border border-emerald-500/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#4edea3] text-[18px]">
                  receipt_long
                </span>
              </div>
              <h1 className="text-base font-bold text-[#dfe2f1]">
                Add Transaction
              </h1>
            </div>

            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Main Form Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-8 space-y-4">
          {/* Type Switcher (Expense / Income) */}
          <div className="bg-[#171b26] p-1 rounded-full flex items-center justify-between border border-white/[0.04]">
            <button
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                txType === 'expense'
                  ? 'bg-[#ff7886] text-[#67001b] shadow-md'
                  : 'text-[#bbcabf] hover:text-[#dfe2f1]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">arrow_downward</span>
              <span>Expense</span>
            </button>

            <button
              onClick={() => handleTypeChange('income')}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                txType === 'income'
                  ? 'bg-[#10b981] text-[#002113] shadow-md'
                  : 'text-[#bbcabf] hover:text-[#dfe2f1]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">arrow_upward</span>
              <span>Income</span>
            </button>
          </div>

          {/* Big Amount Card with Direct Input */}
          <div className="rounded-2xl bg-gradient-to-b from-[#1c1f2a] to-[#171b26] border border-white/[0.06] p-5 shadow-xl text-center space-y-2">
            {/* Currency Pill */}
            <div className="inline-block">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="bg-[#0f131d] border border-white/[0.08] text-xs font-semibold text-[#dfe2f1] px-3 py-1 rounded-full appearance-none pr-6 relative focus:outline-none cursor-pointer"
              >
                <option value="INR (₹)">INR (₹)</option>
                <option value="USD ($)">USD ($)</option>
                <option value="EUR (€)">EUR (€)</option>
              </select>
            </div>

            {/* Direct Amount Input */}
            <div className="flex items-center justify-center font-mono font-bold text-4xl sm:text-5xl tracking-tight py-2">
              <span
                className={`mr-2 select-none ${
                  txType === 'expense' ? 'text-[#ff7886]' : 'text-[#4edea3]'
                }`}
              >
                {getCurrencySymbol()}
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={amountString}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  const parts = val.split('.');
                  if (parts.length > 2) return;
                  if (parts[1] && parts[1].length > 2) return;
                  setAmountString(val);
                }}
                placeholder="0.00"
                autoFocus
                className="bg-transparent text-center font-mono font-bold text-4xl sm:text-5xl text-[#dfe2f1] w-48 sm:w-56 focus:outline-none border-b-2 border-transparent focus:border-[#4edea3] transition-colors"
              />
            </div>

            {/* Categorization Tag */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#bbcabf]">
              <span className="material-symbols-outlined text-[15px] text-[#4edea3]">auto_awesome</span>
              <span>Categorized as <strong className="text-[#dfe2f1]">{selectedCategory}</strong></span>
            </div>
          </div>

          {/* Select Category Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#bbcabf]">
                Select Category
              </span>
              <span className="text-[10px] text-[#bbcabf] font-mono">
                {currentCategories.length} AVAILABLE
              </span>
            </div>

            <div className={`grid gap-2 ${txType === 'income' ? 'grid-cols-4' : 'grid-cols-4'}`}>
              {currentCategories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? txType === 'expense'
                          ? 'bg-[#ff7886]/15 border-[#ff7886] text-[#ff7886] shadow-[0_0_12px_rgba(255,120,134,0.2)]'
                          : 'bg-[#10b981]/15 border-[#10b981] text-[#4edea3] shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                        : 'bg-[#1c1f2a] border-white/[0.04] text-[#bbcabf] hover:bg-[#262a35] hover:text-[#dfe2f1]'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        isSelected
                          ? txType === 'expense'
                            ? 'bg-[#ff7886]/20'
                            : 'bg-[#10b981]/20'
                          : 'bg-[#171b26]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {cat.icon}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description Text Box (Directly below Category) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#bbcabf]">
                Description
              </span>
              <span className="text-[10px] text-[#bbcabf]">Optional</span>
            </div>
            <div className="p-3 rounded-xl bg-[#1c1f2a] border border-white/[0.06] focus-within:border-[#4edea3]/50 focus-within:ring-1 focus-within:ring-[#4edea3]/25 transition-all">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#171b26] flex items-center justify-center text-[#4edea3] mt-0.5 shrink-0">
                  <span className="material-symbols-outlined text-[16px]">notes</span>
                </div>
                <textarea
                  rows={2}
                  value={merchantNote}
                  onChange={(e) => setMerchantNote(e.target.value)}
                  placeholder={
                    txType === 'expense'
                      ? 'Enter description or note (e.g., Dinner with Sarah at Osteria, weekly groceries, cab ride)...'
                      : 'Enter description or note (e.g., Monthly salary credit, dividend payout, freelance gig)...'
                  }
                  className="flex-1 bg-transparent text-xs text-[#dfe2f1] font-medium placeholder:text-[#bbcabf]/50 resize-none focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Paid With Card Selector */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#bbcabf] px-1 block">
              {txType === 'income' ? 'DEPOSIT TO' : 'PAID WITH'}
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {cards.map((card) => {
                const isSelected = selectedCardId === card.id;
                return (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-[#10b981]/15 border-[#10b981] text-[#4edea3]'
                        : 'bg-[#1c1f2a] border-white/[0.06] text-[#bbcabf] hover:bg-[#262a35]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      credit_card
                    </span>
                    <span>{card.bankName.split(' ')[0]} {card.variant} (••{card.last4})</span>
                    <span className="px-1.5 py-0.2 rounded bg-white/10 text-[9px] uppercase font-bold text-slate-300">
                      {card.type}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time: Always shows current date and time */}
          <div className="p-3 rounded-xl bg-[#1c1f2a] border border-white/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#171b26] flex items-center justify-center text-[#4edea3]">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              </div>
              <div>
                <div className="text-[10px] text-[#bbcabf] uppercase font-bold">Date & Time</div>
                <div className="text-xs font-semibold text-[#dfe2f1] font-mono">{dateTime}</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-[#4edea3] text-[10px] font-bold">
              Current
            </span>
          </div>

          {/* Recurring Transaction Section: Shown only for expense & initially disabled */}
          {txType === 'expense' && (
            <div className="p-4 rounded-xl bg-[#1c1f2a] border border-white/[0.04] space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#10b981]/15 text-[#4edea3] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">sync</span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#dfe2f1]">
                      Recurring Transaction
                    </div>
                    <div className="text-[10px] text-[#bbcabf]">
                      Repeat automatically on schedule
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isRecurring && (
                    <span className="px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#4edea3] text-[10px] font-bold">
                      ✓ Active
                    </span>
                  )}
                  <button
                    onClick={() => setIsRecurring(!isRecurring)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      isRecurring ? 'bg-[#10b981]' : 'bg-[#313540]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        isRecurring ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {isRecurring && (
                <div className="space-y-3 pt-2 border-t border-white/[0.04]">
                  {/* Mode switcher: per cycle or total contract */}
                  <div className="flex items-center gap-1.5 p-1 bg-[#171b26] rounded-lg">
                    <button
                      onClick={() => setRecurringEntryMode('per_cycle')}
                      className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        recurringEntryMode === 'per_cycle'
                          ? 'bg-[#262a35] text-[#dfe2f1] shadow'
                          : 'text-[#bbcabf]'
                      }`}
                    >
                      Cost Per Cycle
                    </button>
                    <button
                      onClick={() => setRecurringEntryMode('total_contract')}
                      className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        recurringEntryMode === 'total_contract'
                          ? 'bg-[#262a35] text-[#dfe2f1] shadow'
                          : 'text-[#bbcabf]'
                      }`}
                    >
                      Total Contract
                    </button>
                  </div>

                  {/* Frequency & Term in single clean row */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#bbcabf] uppercase font-bold">
                        Billing Frequency
                      </label>
                      <select
                        value={recurringFrequency}
                        onChange={(e) => setRecurringFrequency(e.target.value as any)}
                        className="w-full bg-[#171b26] border border-white/[0.06] rounded-xl px-2.5 py-2 text-xs font-semibold text-[#dfe2f1] appearance-none focus:outline-none"
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Daily">Daily</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-[#bbcabf] uppercase font-bold">
                        Commitment Duration
                      </label>
                      <select
                        value={recurringMonths}
                        onChange={(e) => setRecurringMonths(parseInt(e.target.value))}
                        className="w-full bg-[#171b26] border border-white/[0.06] rounded-xl px-2.5 py-2 text-xs font-semibold text-[#dfe2f1] appearance-none focus:outline-none"
                      >
                        <option value={1}>1 Month (Monthly Rolling)</option>
                        <option value={3}>3 Months (Quarterly)</option>
                        <option value={6}>6 Months (Half-Year)</option>
                        <option value={12}>12 Months (Annual Plan)</option>
                        <option value={24}>24 Months (2-Year Lock-in)</option>
                      </select>
                    </div>
                  </div>

                  {/* Smart Monthly Calculation Breakdown Box */}
                  <div className="p-3 rounded-xl bg-gradient-to-tr from-[#0a0e18] to-[#171b26] border border-[#10b981]/25 space-y-2.5 shadow-inner">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#4edea3] text-[16px]">calculate</span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#4edea3]">
                          Monthly Breakdown
                        </span>
                      </div>
                      <span className="text-[10px] text-[#bbcabf]">
                        {recurringMonths} Cycles
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <div className="p-2 rounded-lg bg-[#0f131d]/70 border border-white/[0.04]">
                        <span className="text-[10px] text-[#bbcabf] block">Monthly Impact</span>
                        <div className="text-base font-bold font-mono text-[#4edea3] mt-0.5">
                          {getCurrencySymbol()}{monthlyEquivalent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          <span className="text-[10px] text-[#bbcabf] font-normal">/mo</span>
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-[#0f131d]/70 border border-white/[0.04]">
                        <span className="text-[10px] text-[#bbcabf] block">Total Commitment</span>
                        <div className="text-base font-bold font-mono text-[#dfe2f1] mt-0.5">
                          {getCurrencySymbol()}{totalCommitment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    {/* Horizon & Pacing */}
                    <div className="flex items-center justify-between text-[11px] text-[#bbcabf] pt-1 border-t border-white/[0.04]">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-[#c0c1ff]">event_available</span>
                        <span>Horizon: Through <strong className="text-[#dfe2f1]">{cycleEndDate}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Save Action */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                txType === 'expense'
                  ? 'bg-[#ff7886] text-[#67001b] shadow-[0_0_20px_rgba(255,120,134,0.35)] hover:brightness-105'
                  : 'bg-[#10b981] text-[#002113] shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:brightness-105'
              }`}
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Save {txType === 'expense' ? 'Expense' : 'Income'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
