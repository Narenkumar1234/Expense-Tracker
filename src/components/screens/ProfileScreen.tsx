import React, { useState } from 'react';
import { UserProfile, PaymentCard } from '../../types';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { User as FirebaseUser } from 'firebase/auth';

interface ProfileScreenProps {
  user: UserProfile;
  cards: PaymentCard[];
  onOpenAddCard: () => void;
  onEditCard?: (card: PaymentCard) => void;
  onDeleteCard?: (cardId: string) => void;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onBack: () => void;
  firebaseUser?: FirebaseUser | null;
  onGoogleLogin?: () => void;
  onLogout?: () => void;
  onReopenOnboarding?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  cards,
  onOpenAddCard,
  onEditCard,
  onDeleteCard,
  onUpdateUser,
  onBack,
  firebaseUser,
  onGoogleLogin,
  onLogout,
  onReopenOnboarding,
}) => {
  const [billReminders, setBillReminders] = useState(user.billRemindersActive);
  const [monthlyIncome, setMonthlyIncome] = useState(user.monthlyBaseIncome);
  const [editingIncome, setEditingIncome] = useState(false);
  const [tempIncome, setTempIncome] = useState(user.monthlyBaseIncome.toString());
  const [defaultCardId, setDefaultCardId] = useState(user.defaultCardId);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleClick = async () => {
    if (isSigningIn || !onGoogleLogin) return;
    setIsSigningIn(true);
    try {
      await onGoogleLogin();
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSaveIncome = () => {
    const val = parseInt(tempIncome.replace(/\D/g, '')) || 185000;
    setMonthlyIncome(val);
    onUpdateUser({ monthlyBaseIncome: val });
    setEditingIncome(false);
  };

  const handleSavePreferences = () => {
    setIsSaving(true);
    onUpdateUser({
      billRemindersActive: billReminders,
      monthlyBaseIncome: monthlyIncome,
      defaultCardId,
    });
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => {
        onBack();
      }, 350);
    }, 300);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-full pb-16">
      {/* Sticky Top Bar: Profile & Financial Info with Tick Mark on Right */}
      <header
        className="modal-header sticky top-0 z-30 bg-[#0f131d]/90 backdrop-blur-xl border-b border-white/[0.04] transition-[padding] duration-150"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-[#dfe2f1] hover:text-[#4edea3] transition-colors"
              aria-label="Back"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
            <div className="w-7 h-7 rounded-lg bg-[#171b26] border border-emerald-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#4edea3] text-[18px]">
                manage_accounts
              </span>
            </div>
            <h1 className="text-base font-bold text-[#dfe2f1]">
              Profile & Financial Info
            </h1>
          </div>

          <button
            onClick={handleSavePreferences}
            disabled={isSaving}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#059669] via-[#10b981] to-[#4edea3] text-[#002113] flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.45)] hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold"
            title="Save & Close"
            aria-label="Save and close"
          >
            <span className={`material-symbols-outlined text-[18px] font-bold ${isSaving ? 'animate-spin' : ''}`}>
              {isSaving ? 'progress_activity' : 'check'}
            </span>
          </button>
        </div>
      </header>

      <div className="px-4 pt-3 space-y-4">
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

      {/* Sign in with Google / Sign Out Action */}
      {!firebaseUser && onGoogleLogin && (
        <button
          onClick={handleGoogleClick}
          disabled={isSigningIn}
          className="w-full h-12 rounded-2xl bg-white dark:bg-[#1c1f2a] hover:bg-slate-50 dark:hover:bg-[#262a35] border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-60"
        >
          {isSigningIn ? (
            <span className="material-symbols-outlined text-[18px] animate-spin text-emerald-600 dark:text-[#4edea3]">
              progress_activity
            </span>
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
        </button>
      )}

      {/* SECTION 1: Income & Allocation */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#4edea3]">
              account_balance
            </span>
            <h2 className="text-sm font-bold text-[#dfe2f1]">Income & Allocation</h2>
          </div>
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
              className="w-8 h-8 rounded-full bg-[#262a35] hover:bg-[#313540] text-[#4edea3] flex items-center justify-center active:scale-95 transition-all shadow-sm"
              title="Edit Income"
              aria-label="Edit Income"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
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

      {/* SECTION 2: Cards */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#4edea3]">
              credit_card
            </span>
            <h2 className="text-sm font-bold text-[#dfe2f1]">
              Cards ({cards.length})
            </h2>
          </div>

          <button
            onClick={onOpenAddCard}
            className="w-8 h-8 rounded-full bg-[#10b981] hover:brightness-110 active:scale-95 text-[#002113] flex items-center justify-center transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            aria-label="Add Card"
            title="Add Card"
          >
            <span className="material-symbols-outlined text-[18px] font-bold">add</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {cards.map((card) => {
            const isCredit = card.type === 'credit';
            const name = card.bankName.toLowerCase();
            let cardBg = 'bg-gradient-to-tr from-[#111318] via-[#1e2330] to-[#262c3d] border-emerald-500/20';
            let badgeStyle = 'bg-[#10b981]/20 text-[#4edea3]';
            let iconBg = 'bg-[#262a35] text-[#4edea3]';

            if (name.includes('hdfc')) {
              cardBg = 'bg-gradient-to-tr from-[#001e3d] via-[#083b77] to-[#0a192f] border-blue-500/40';
              badgeStyle = 'bg-blue-500/20 text-blue-300 border border-blue-400/30';
              iconBg = 'bg-blue-600/30 text-blue-200';
            } else if (name.includes('icici')) {
              cardBg = 'bg-gradient-to-tr from-[#3b0808] via-[#6f1212] to-[#250303] border-orange-500/40';
              badgeStyle = 'bg-orange-500/20 text-orange-300 border border-orange-400/30';
              iconBg = 'bg-orange-600/30 text-orange-200';
            } else if (name.includes('sbi') || name.includes('state bank')) {
              cardBg = 'bg-gradient-to-tr from-[#07203b] via-[#103b6b] to-[#041224] border-cyan-500/40';
              badgeStyle = 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30';
              iconBg = 'bg-cyan-600/30 text-cyan-200';
            } else if (name.includes('axis')) {
              cardBg = 'bg-gradient-to-tr from-[#33071e] via-[#520c32] to-[#1a020f] border-pink-500/40';
              badgeStyle = 'bg-pink-500/20 text-pink-300 border border-pink-400/30';
              iconBg = 'bg-pink-600/30 text-pink-200';
            } else if (name.includes('kotak')) {
              cardBg = 'bg-gradient-to-tr from-[#3b0303] via-[#5c0606] to-[#1c0101] border-red-500/40';
              badgeStyle = 'bg-red-500/20 text-red-300 border border-red-400/30';
              iconBg = 'bg-red-600/30 text-red-200';
            } else if (name.includes('amex') || name.includes('american')) {
              cardBg = 'bg-gradient-to-tr from-[#1e293b] via-[#334155] to-[#0f172a] border-slate-400/40';
              badgeStyle = 'bg-slate-700 text-slate-200 border border-slate-500/30';
              iconBg = 'bg-slate-700 text-emerald-300';
            }

            return (
              <div
                key={card.id}
                className={`rounded-2xl ${cardBg} border p-4 shadow-md space-y-3 relative overflow-hidden`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-[20px]">
                        {isCredit ? 'credit_score' : 'account_balance_wallet'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">
                          {card.bankName} {card.variant}
                        </span>
                        <span className="text-[10px] text-white/70 font-mono">
                          •••• {card.last4}
                        </span>
                      </div>
                      <span className="text-[10px] text-white/70">
                        {card.isDefault ? 'Default for Auto-pay' : isCredit ? 'Credit Card' : 'Primary Salary Account'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full ${badgeStyle} text-[10px] font-bold uppercase`}>
                      {card.type}
                    </span>
                    {onEditCard && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCard(card);
                        }}
                        className="w-7 h-7 rounded-lg bg-black/30 hover:bg-black/50 text-white/80 hover:text-emerald-300 flex items-center justify-center transition-colors cursor-pointer"
                        title="Edit Card"
                        aria-label="Edit Card"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                      </button>
                    )}
                    {onDeleteCard && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCard(card.id);
                        }}
                        className="w-7 h-7 rounded-lg bg-black/30 hover:bg-black/50 text-white/80 hover:text-rose-300 flex items-center justify-center transition-colors cursor-pointer"
                        title="Delete Card"
                        aria-label="Delete Card"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete_outline</span>
                      </button>
                    )}
                  </div>
                </div>

                {isCredit ? (
                  <>
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div>
                        <span className="text-[10px] text-white/75 block">Unbilled Spend</span>
                        <span className="font-mono font-bold text-white">
                          ₹{(card.unbilledSpend || 0).toLocaleString('en-IN')}
                          <span className="text-[10px] text-white/70 font-normal">
                            {' '}
                            / ₹{(card.creditLimit || 250000).toLocaleString('en-IN')}
                          </span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-white/75 block">Statement Due</span>
                        <span className="font-semibold text-rose-300 text-xs">
                          {card.dueDate || '7th Nov (In 14 days)'}
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full"
                        style={{
                          width: `${Math.min(
                            ((card.unbilledSpend || 0) / (card.creditLimit || 250000)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-white/75">
                      <span>Bill Generated: 18th Oct</span>
                      <span className="text-emerald-300 flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        Cycle Active
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-white/75 block">Available Balance</span>
                      <span className="font-mono font-bold text-base text-emerald-300">
                        ₹{(card.availableBalance || 142850).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-white/75 block">Auto-Sweep</span>
                      <span className="text-emerald-300 font-semibold text-xs flex items-center gap-1">
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

      {/* SECTION 3: Default Payment Card */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center gap-1.5 px-1">
          <span className="material-symbols-outlined text-[18px] text-[#4edea3]">
            credit_score
          </span>
          <h2 className="text-sm font-bold text-[#dfe2f1]">
            Default Card Preference
          </h2>
        </div>

        <div className="rounded-2xl bg-[#1c1f2a] border border-white/[0.06] p-4.5 shadow-md">
          {/* Default card selector */}
          <div className="space-y-1.5">
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

      {/* SECTION 5: Account Sign Out */}
      {firebaseUser && onLogout && (
        <div className="pt-2">
          <button
            onClick={onLogout}
            className="w-full h-12 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 text-xs font-semibold border border-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Sign Out ({firebaseUser.displayName || firebaseUser.email})</span>
          </button>
        </div>
      )}

      </div>
    </div>
  );
};
