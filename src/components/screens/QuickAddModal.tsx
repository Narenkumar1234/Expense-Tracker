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
  const [txType, setTxType] = useState<'expense' | 'income' | 'transfer'>(initialType);
  const [currency, setCurrency] = useState<'INR (₹)' | 'USD ($)' | 'EUR (€)'>('INR (₹)');
  const [amountString, setAmountString] = useState('845.00');
  const [selectedCategory, setSelectedCategory] = useState('Food');
  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.id || 'card-1');
  const [dateTime, setDateTime] = useState('Today, 4:20 PM');
  const [merchantNote, setMerchantNote] = useState('Dinner with Sarah at Osteria');
  const [isRecurring, setIsRecurring] = useState(true);
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

  // Keypad actions
  const handleKeypadPress = (val: string) => {
    if (val === 'backspace') {
      if (amountString.length <= 1) {
        setAmountString('0');
      } else {
        setAmountString(amountString.slice(0, -1));
      }
    } else if (val === '.') {
      if (!amountString.includes('.')) {
        setAmountString(amountString + '.');
      }
    } else {
      if (amountString === '0' || amountString === '845.00') {
        setAmountString(val);
      } else {
        // limit to 2 decimal places
        const parts = amountString.split('.');
        if (parts[1] && parts[1].length >= 2) return;
        setAmountString(amountString + val);
      }
    }
  };

  const categories = [
    { id: 'Food', label: 'Food', icon: 'restaurant' },
    { id: 'Groceries', label: 'Groceries', icon: 'shopping_bag' },
    { id: 'Transport', label: 'Transport', icon: 'directions_subway' },
    { id: 'Shopping', label: 'Shopping', icon: 'shopping_basket' },
    { id: 'Bills', label: 'Bills', icon: 'receipt' },
    { id: 'Fun', label: 'Fun', icon: 'movie' },
    { id: 'Health', label: 'Health', icon: 'favorite' },
    { id: 'Other', label: 'Other', icon: 'more_horiz' },
  ];

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
    };

    setTimeout(() => {
      onSaveTransaction({
        merchant: merchantNote.trim() || 'New Entry',
        category: selectedCategory.toUpperCase(),
        categoryType: categoryTypeMap[selectedCategory] || 'OTHER',
        amount: finalAmount,
        date: new Date().toISOString().split('T')[0],
        dateGroup: 'TODAY',
        time: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        account: selectedCard ? `${selectedCard.bankName.split(' ')[0]} ${selectedCard.variant}` : 'Aura Vault',
        status: 'completed',
        icon: categories.find((c) => c.id === selectedCategory)?.icon || 'receipt',
        notes: merchantNote,
        isRecurring,
        recurringDurationMonths: isRecurring ? recurringMonths : undefined,
        recurringFrequency: isRecurring ? recurringFrequency : undefined,
        monthlyEquivalent: isRecurring ? monthlyEquivalent : undefined,
        totalCommitment: isRecurring ? totalCommitment : undefined,
        remainingCycles: isRecurring ? recurringMonths : undefined,
        cycleEndDate: isRecurring ? cycleEndDate : undefined,
      });
      setIsSaving(false);
      onClose();
    }, 600);
  };

  const getCurrencySymbol = () => {
    if (currency.includes('USD')) return '$';
    if (currency.includes('EUR')) return '€';
    return '₹';
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0f131d] overflow-y-auto no-scrollbar flex flex-col justify-between">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-[#0f131d]/90 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="h-16 px-4 max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#dfe2f1] hover:text-[#4edea3] transition-colors"
              aria-label="Back"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <div className="w-7 h-7 rounded-lg bg-[#171b26] border border-emerald-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#4edea3] text-[18px]">
                token
              </span>
            </div>
            <h1 className="text-base font-bold text-[#dfe2f1]">
              Quick Add Transaction
            </h1>
          </div>

          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Main Form Body */}
      <div className="max-w-md mx-auto w-full px-4 pt-3 pb-8 space-y-4 flex-1">
        {/* Type Switcher (Expense / Income / Transfer) */}
        <div className="bg-[#171b26] p-1 rounded-full flex items-center justify-between border border-white/[0.04]">
          <button
            onClick={() => setTxType('expense')}
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
            onClick={() => setTxType('income')}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              txType === 'income'
                ? 'bg-[#10b981] text-[#002113] shadow-md'
                : 'text-[#bbcabf] hover:text-[#dfe2f1]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">arrow_upward</span>
            <span>Income</span>
          </button>

          <button
            onClick={() => setTxType('transfer')}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              txType === 'transfer'
                ? 'bg-[#6366f1] text-white shadow-md'
                : 'text-[#bbcabf] hover:text-[#dfe2f1]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">sync_alt</span>
            <span>Transfer</span>
          </button>
        </div>

        {/* Big Amount Card with Cursor */}
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

          {/* Amount Display */}
          <div className="flex items-center justify-center font-mono font-bold text-4xl sm:text-5xl text-[#dfe2f1] tracking-tight py-1">
            <span
              className={`mr-2 ${
                txType === 'expense' ? 'text-[#ff7886]' : 'text-[#4edea3]'
              }`}
            >
              {getCurrencySymbol()}
            </span>
            <span>{amountString}</span>
            {/* Blinking Cursor */}
            <span className="inline-block w-1 h-9 bg-[#ff7886] ml-1 animate-pulse" />
          </div>

          {/* Smart Categorization Tag */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#bbcabf]">
            <span className="material-symbols-outlined text-[15px] text-[#4edea3]">auto_awesome</span>
            <span>Quick-categorized as <strong className="text-[#dfe2f1]">{selectedCategory}</strong></span>
          </div>
        </div>

        {/* Select Category Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#bbcabf]">
              Select Category
            </span>
            <span className="text-[10px] text-[#bbcabf] font-mono">
              8 AVAILABLE
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-[#ff7886]/15 border-[#ff7886] text-[#ff7886] shadow-[0_0_12px_rgba(255,120,134,0.2)]'
                      : 'bg-[#1c1f2a] border-white/[0.04] text-[#bbcabf] hover:bg-[#262a35] hover:text-[#dfe2f1]'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-[#ff7886]/20' : 'bg-[#171b26]'
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

        {/* Paid With Card Selector */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#bbcabf] px-1 block">
            PAID WITH
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

        {/* Date & Time Selector */}
        <div className="p-3 rounded-xl bg-[#1c1f2a] border border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#171b26] flex items-center justify-center text-[#bbcabf]">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            </div>
            <div>
              <div className="text-[10px] text-[#bbcabf] uppercase font-bold">Date & Time</div>
              <div className="text-xs font-semibold text-[#dfe2f1]">{dateTime}</div>
            </div>
          </div>
          <button className="text-[#bbcabf] hover:text-[#4edea3] p-1">
            <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
          </button>
        </div>

        {/* Merchant / Note Input */}
        <div className="p-3 rounded-xl bg-[#1c1f2a] border border-white/[0.04] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#171b26] flex items-center justify-center text-[#bbcabf]">
            <span className="material-symbols-outlined text-[18px]">storefront</span>
          </div>
          <input
            type="text"
            value={merchantNote}
            onChange={(e) => setMerchantNote(e.target.value)}
            placeholder="Merchant name or note..."
            className="flex-1 bg-transparent text-xs text-[#dfe2f1] font-semibold focus:outline-none"
          />
        </div>

        {/* Recurring Transaction Section */}
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
                  ✓ Auto-schedule active
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
            <div className="space-y-3 pt-2.5 border-t border-white/[0.04]">
              {/* Recurring Entry Mode */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#bbcabf] uppercase text-[10px] font-bold">Calculation Mode</span>
                  <span className="text-[#4edea3] font-mono text-[10px]">Smart Amortization</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#171b26] rounded-xl border border-white/[0.04]">
                  <button
                    type="button"
                    onClick={() => setRecurringEntryMode('per_cycle')}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      recurringEntryMode === 'per_cycle'
                        ? 'bg-[#262a35] text-[#4edea3] shadow-sm font-bold'
                        : 'text-[#bbcabf] hover:text-[#dfe2f1]'
                    }`}
                  >
                    Per-Cycle Spend
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecurringEntryMode('total_contract')}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      recurringEntryMode === 'total_contract'
                        ? 'bg-[#262a35] text-[#4edea3] shadow-sm font-bold'
                        : 'text-[#bbcabf] hover:text-[#dfe2f1]'
                    }`}
                  >
                    Total Plan (Split Monthly)
                  </button>
                </div>
              </div>

              {/* Frequency */}
              {recurringEntryMode === 'per_cycle' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#bbcabf] uppercase text-[10px] font-bold">Billing Frequency</span>
                    <span className="text-[#4edea3] text-[10px] font-semibold">{recurringFrequency} cycle</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {(['Daily', 'Weekly', 'Monthly', 'Yearly'] as const).map((freq) => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setRecurringFrequency(freq)}
                        className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          recurringFrequency === freq
                            ? 'bg-[#10b981]/20 border border-[#10b981] text-[#4edea3]'
                            : 'bg-[#171b26] text-[#bbcabf] border border-white/[0.04]'
                        }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Duration: Ask for how many months it is recurring */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#4edea3] text-[16px]">schedule</span>
                    <span className="text-xs font-bold text-[#dfe2f1]">
                      Recurring Duration (Months)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#3131c0]/20 text-[#c0c1ff] text-[10px] font-bold font-mono">
                    {recurringMonths} Months Plan
                  </span>
                </div>

                {/* Duration Presets */}
                <div className="grid grid-cols-4 gap-2">
                  {[3, 6, 12, 24].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setRecurringMonths(m)}
                      className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        recurringMonths === m
                          ? 'bg-[#10b981]/20 border border-[#10b981] text-[#4edea3]'
                          : 'bg-[#171b26] text-[#bbcabf] border border-white/[0.04] hover:bg-[#262a35]'
                      }`}
                    >
                      {m} Mo {m === 12 ? '(1 Yr)' : ''}
                    </button>
                  ))}
                </div>

                {/* Stepper & Exact Month Input */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#171b26] border border-white/[0.04]">
                  <span className="text-xs text-[#bbcabf]">Repeat for how many months?</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRecurringMonths(Math.max(1, recurringMonths - 1))}
                      className="w-7 h-7 rounded-lg bg-[#262a35] hover:bg-[#313540] text-[#dfe2f1] flex items-center justify-center font-bold text-sm"
                    >
                      -
                    </button>
                    <div className="flex items-center gap-1 font-mono font-bold text-sm text-[#4edea3] px-1">
                      <span>{recurringMonths}</span>
                      <span className="text-[11px] text-[#bbcabf] font-sans font-normal">mo</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRecurringMonths(Math.min(60, recurringMonths + 1))}
                      className="w-7 h-7 rounded-lg bg-[#262a35] hover:bg-[#313540] text-[#dfe2f1] flex items-center justify-center font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Smart Monthly Calculation Telemetry Box */}
              <div className="p-3 rounded-xl bg-gradient-to-tr from-[#0a0e18] to-[#171b26] border border-[#10b981]/25 space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#4edea3] text-[16px]">calculate</span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#4edea3]">
                      Smart Monthly Breakdown
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
                    <span>Horizon: Active through <strong className="text-[#dfe2f1]">{cycleEndDate}</strong></span>
                  </div>
                </div>

                {/* Safe-to-spend impact bar */}
                <div className="space-y-1 pt-0.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#bbcabf]">Consumes from safe-to-spend remainder</span>
                    <span className="font-mono font-bold text-[#4edea3]">{remainderPercentage}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#0f131d] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        remainderPercentage > 50 ? 'bg-[#ff7886]' : 'bg-[#4edea3]'
                      }`}
                      style={{ width: `${remainderPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Schedule Pill */}
              <div className="p-2 rounded-lg bg-[#0f131d]/60 flex items-center justify-between text-[11px] text-[#bbcabf]">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#4edea3]">event_repeat</span>
                  <span>Repeats on: <strong className="text-[#dfe2f1]">1st of every month</strong></span>
                </div>
                <span>{recurringMonths} months • Auto-debit</span>
              </div>
            </div>
          )}
        </div>

        {/* Tactile Numeric Keypad */}
        <div className="pt-2">
          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'].map((key) => (
              <button
                key={key}
                onClick={() => handleKeypadPress(key)}
                className="h-12 rounded-xl bg-[#1c1f2a] border border-white/[0.04] hover:bg-[#262a35] active:scale-95 text-[#dfe2f1] font-mono text-lg font-bold flex items-center justify-center transition-all shadow-sm"
              >
                {key === 'backspace' ? (
                  <span className="material-symbols-outlined text-[20px]">backspace</span>
                ) : (
                  key
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Big Action Save Button */}
        <div className="pt-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full py-4 rounded-full font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
              txType === 'expense'
                ? 'bg-[#ff7886] text-[#67001b] shadow-[0_0_20px_rgba(255,120,134,0.35)] hover:brightness-105'
                : 'bg-[#10b981] text-[#002113] shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:brightness-105'
            }`}
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
                <span>Saving to Ledger...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span>
                  {isRecurring
                    ? `Save ${recurringMonths}-Mo Recurring ${txType === 'expense' ? 'Expense' : 'Income'} (${getCurrencySymbol()}${monthlyEquivalent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/mo)`
                    : `Save ${txType === 'expense' ? 'Expense' : 'Income'} (${getCurrencySymbol()}${amountString})`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
