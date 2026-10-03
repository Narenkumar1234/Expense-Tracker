import React, { useState } from 'react';
import { UserProfile, PaymentCard } from '../../types';
import { ThemeSwitcher } from '../ThemeSwitcher';

interface ProfileScreenProps {
  user: UserProfile;
  cards: PaymentCard[];
  onOpenAddCard: () => void;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onBack: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  cards,
  onOpenAddCard,
  onUpdateUser,
  onBack,
}) => {
  const [billReminders, setBillReminders] = useState(user.billRemindersActive);
  const [monthlyIncome, setMonthlyIncome] = useState(user.monthlyBaseIncome);
  const [editingIncome, setEditingIncome] = useState(false);
  const [tempIncome, setTempIncome] = useState(user.monthlyBaseIncome.toString());
  const [defaultCardId, setDefaultCardId] = useState(user.defaultCardId);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveIncome = () => {
    const val = parseInt(tempIncome.replace(/\D/g, '')) || 185000;
    setMonthlyIncome(val);
    onUpdateUser({ monthlyBaseIncome: val });
    setEditingIncome(false);
  };

  const handleSavePreferences = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      onUpdateUser({
        billRemindersActive: billReminders,
        monthlyBaseIncome: monthlyIncome,
        defaultCardId,
      });

      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    }, 800);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-28 pt-2 space-y-4">
      {/* Top Title Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-[#dfe2f1] hover:text-[#4edea3] transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <span className="material-symbols-outlined text-[#4edea3] text-[22px]">
            manage_accounts
          </span>
          <h1 className="text-base font-bold text-[#dfe2f1]">
            Profile & Financial Info
          </h1>
        </div>

        <button
          onClick={handleSavePreferences}
          className="w-9 h-9 rounded-full bg-[#262a35] hover:bg-[#313540] text-[#dfe2f1] flex items-center justify-center transition-all shadow-sm"
          title="Account Settings"
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
        </button>
      </div>

      {/* User Profile Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-[#171b26] border border-white/[0.06] p-4.5 shadow-xl">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[#10b981]/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3.5">
          <div className="relative shrink-0">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover shadow-[0_0_16px_rgba(16,185,129,0.3)] ring-2 ring-[#4edea3]/40"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-0 right-0 w-4.5 h-4.5 rounded-full bg-[#10b981] flex items-center justify-center border-2 border-[#0f131d]">
              <span className="material-symbols-outlined text-[10px] text-[#002113] font-bold">
                verified
              </span>
            </div>
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold text-[#dfe2f1] truncate">
                {user.name}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#3131c0]/20 border border-[#c0c1ff]/30 text-[#c0c1ff] text-[10px] font-bold">
                {user.tier}
              </span>
            </div>
            <span className="text-xs text-[#bbcabf] truncate mt-0.5 font-mono">
              {user.email}
            </span>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-[11px] text-[#4edea3] font-semibold">
                Synced with {cards.length} Financial Accounts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Income & Allocation */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#4edea3]">
              account_balance
            </span>
            <h2 className="text-sm font-bold text-[#dfe2f1]">Income & Allocation</h2>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#bbcabf]">
            BASE SETUP
          </span>
        </div>

        <div className="rounded-2xl bg-[#1c1f2a] border border-white/[0.06] p-4.5 shadow-md space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-[#bbcabf] block">Monthly Base Income</span>
              <div className="text-3xl font-mono font-bold text-[#4edea3] mt-0.5">
                ₹{monthlyIncome.toLocaleString('en-IN')}
                <span className="text-xs text-[#bbcabf] font-normal"> / mo</span>
              </div>
            </div>

            <button
              onClick={() => setEditingIncome(!editingIncome)}
              className="px-3 py-1.5 rounded-full bg-[#262a35] hover:bg-[#313540] text-xs font-semibold text-[#4edea3] flex items-center gap-1 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[14px]">edit</span>
              <span>Edit / Adjust</span>
            </button>
          </div>

          {editingIncome && (
            <div className="p-3 rounded-xl bg-[#171b26] border border-[#10b981]/30 flex items-center gap-2">
              <span className="text-xs text-[#4edea3] font-bold">₹</span>
              <input
                type="text"
                value={tempIncome}
                onChange={(e) => setTempIncome(e.target.value)}
                className="flex-1 bg-transparent text-xs font-mono font-bold text-[#dfe2f1] focus:outline-none"
                placeholder="1,85,000"
              />
              <button
                onClick={handleSaveIncome}
                className="px-3 py-1 rounded-lg bg-[#10b981] text-[#002113] text-xs font-bold"
              >
                Save
              </button>
            </div>
          )}

          {/* Meta indicators */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#171b26] border border-white/[0.04] flex flex-col">
              <span className="text-[10px] text-[#bbcabf] flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-[#4edea3]">event_available</span>
                Salary Schedule
              </span>
              <span className="text-xs font-semibold text-[#dfe2f1] mt-1">
                {user.salarySchedule}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#171b26] border border-white/[0.04] flex flex-col">
              <span className="text-[10px] text-[#bbcabf] flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-[#c0c1ff]">trending_up</span>
                Side Streams
              </span>
              <span className="text-xs font-semibold text-[#c0c1ff] mt-1 font-mono">
                {user.sideStreamLabel}
              </span>
            </div>
          </div>

          {/* 50 / 30 / 20 Budget Target Ratio Indicator */}
          <div className="p-3 rounded-xl bg-[#171b26] border border-white/[0.04] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#dfe2f1]">50 / 30 / 20 Budget Target</span>
              <span className="text-[#4edea3] text-[11px] font-mono">Target: ₹2,10,000 Total</span>
            </div>

            {/* Visual multi-segment bar */}
            <div className="w-full h-2.5 rounded-full bg-[#0f131d] overflow-hidden flex gap-0.5">
              <div className="h-full bg-[#4edea3] rounded-l-full" style={{ width: '50%' }} />
              <div className="h-full bg-[#6366f1]" style={{ width: '30%' }} />
              <div className="h-full bg-[#ff7886] rounded-r-full" style={{ width: '20%' }} />
            </div>

            {/* Breakdown Legend */}
            <div className="grid grid-cols-3 gap-1 pt-1 text-center">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-[#4edea3] flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
                  Needs 50%
                </span>
                <span className="text-xs font-bold font-mono text-[#dfe2f1] mt-0.5">
                  ₹1,05,000
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[10px] text-[#c0c1ff] flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
                  Wants 30%
                </span>
                <span className="text-xs font-bold font-mono text-[#dfe2f1] mt-0.5">
                  ₹63,000
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[10px] text-[#ff7886] flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff7886]" />
                  Savings 20%
                </span>
                <span className="text-xs font-bold font-mono text-[#dfe2f1] mt-0.5">
                  ₹42,000
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Payment Methods & Cards (3) */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#4edea3]">
              credit_card
            </span>
            <h2 className="text-sm font-bold text-[#dfe2f1]">
              Payment Methods & Cards ({cards.length})
            </h2>
          </div>

          <button
            onClick={onOpenAddCard}
            className="px-3 py-1.5 rounded-full bg-[#10b981] hover:brightness-110 active:scale-95 text-[#002113] text-xs font-bold flex items-center gap-1 transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)]"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Add Card</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {cards.map((card) => {
            const isCredit = card.type === 'credit';
            return (
              <div
                key={card.id}
                className="rounded-2xl bg-[#1c1f2a] border border-white/[0.06] p-4 shadow-md space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#262a35] flex items-center justify-center text-[#4edea3]">
                      <span className="material-symbols-outlined text-[20px]">
                        {isCredit ? 'credit_score' : 'account_balance_wallet'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#dfe2f1]">
                          {card.bankName} {card.variant}
                        </span>
                        <span className="text-[10px] text-[#bbcabf] font-mono">
                          •••• {card.last4}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#bbcabf]">
                        {card.isDefault ? 'Default for Auto-pay' : isCredit ? 'Credit Card' : 'Primary Salary Account'}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-[#313540] text-[#4edea3] text-[10px] font-bold uppercase">
                    {card.type}
                  </span>
                </div>

                {isCredit ? (
                  <>
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div>
                        <span className="text-[10px] text-[#bbcabf] block">Unbilled Spend</span>
                        <span className="font-mono font-bold text-[#dfe2f1]">
                          ₹{(card.unbilledSpend || 0).toLocaleString('en-IN')}
                          <span className="text-[10px] text-[#bbcabf] font-normal">
                            {' '}
                            / ₹{(card.creditLimit || 250000).toLocaleString('en-IN')}
                          </span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#bbcabf] block">Statement Due</span>
                        <span className="font-semibold text-[#ff7886] text-xs">
                          {card.dueDate || '7th Nov (In 14 days)'}
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-[#0f131d] overflow-hidden">
                      <div
                        className="h-full bg-[#4edea3] rounded-full"
                        style={{
                          width: `${Math.min(
                            ((card.unbilledSpend || 0) / (card.creditLimit || 250000)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#bbcabf]">
                      <span>Bill Generated: 18th Oct</span>
                      <span className="text-[#4edea3] flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        Cycle Active
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-[#bbcabf] block">Available Balance</span>
                      <span className="font-mono font-bold text-base text-[#4edea3]">
                        ₹{(card.availableBalance || 142850).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#bbcabf] block">Auto-Sweep</span>
                      <span className="text-[#4edea3] font-semibold text-xs flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">lock_clock</span>
                        Enabled
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Spending & Alert Preferences */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center gap-1.5 px-1">
          <span className="material-symbols-outlined text-[18px] text-[#4edea3]">
            notifications_active
          </span>
          <h2 className="text-sm font-bold text-[#dfe2f1]">
            Spending & Alert Preferences
          </h2>
        </div>

        <div className="rounded-2xl bg-[#1c1f2a] border border-white/[0.06] p-4.5 shadow-md space-y-4">
          {/* Bill due reminder */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#262a35] text-[#4edea3] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">mark_chat_unread</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-[#dfe2f1] block">
                  Bill Due Reminders
                </span>
                <span className="text-[10px] text-[#bbcabf]">
                  WhatsApp & Instant Push Alerts
                </span>
              </div>
            </div>

            <button
              onClick={() => setBillReminders(!billReminders)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                billReminders ? 'bg-[#10b981]' : 'bg-[#313540]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  billReminders ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* High-Value Alert Threshold */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#262a35] text-[#c0c1ff] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">shield_with_heart</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-[#dfe2f1] block">
                  High-Value Alert Threshold
                </span>
                <span className="text-[10px] text-[#bbcabf]">
                  Instant verify on spends &gt; ₹10,000
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-lg bg-[#171b26] border border-white/[0.04] text-xs font-mono font-bold text-[#dfe2f1]">
              ₹10,000
            </span>
          </div>

          {/* Default card selector */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] text-[#bbcabf]">
              Default Card for Quick Expense Entry
            </label>
            <div className="relative">
              <select
                value={defaultCardId}
                onChange={(e) => setDefaultCardId(e.target.value)}
                className="w-full bg-[#171b26] border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#dfe2f1] appearance-none focus:outline-none focus:border-[#4edea3]"
              >
                {cards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.bankName} {c.variant} (•••• {c.last4})
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-2.5 text-[#bbcabf] pointer-events-none text-[18px]">
                unfold_more
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Appearance & Theme Switcher */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center gap-1.5 px-1">
          <span className="material-symbols-outlined text-[18px] text-[#4edea3]">
            palette
          </span>
          <h2 className="text-sm font-bold text-[#dfe2f1]">
            Appearance & System Theme
          </h2>
        </div>

        <div className="rounded-2xl bg-[#1c1f2a] border border-white/[0.06] p-4.5 shadow-md space-y-3">
          <ThemeSwitcher variant="segmented" />
        </div>
      </div>

      {/* Save CTA */}
      <div className="pt-2">
        <button
          onClick={handleSavePreferences}
          disabled={isSaving}
          className={`w-full py-4 rounded-full font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
            saveSuccess
              ? 'bg-[#4edea3] text-[#002113]'
              : 'bg-[#10b981] text-[#002113] shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:brightness-105'
          }`}
        >
          {isSaving ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
              <span>Updating Vault...</span>
            </>
          ) : saveSuccess ? (
            <>
              <span className="material-symbols-outlined text-[20px]">check</span>
              <span>Preferences Saved!</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">done_all</span>
              <span>Save & Update Preferences</span>
            </>
          )}
        </button>
        <p className="text-center text-[10px] text-[#bbcabf] mt-2">
          Last synced with open banking 12 minutes ago
        </p>
      </div>
    </div>
  );
};
