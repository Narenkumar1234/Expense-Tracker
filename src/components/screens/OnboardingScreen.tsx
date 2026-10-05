import React, { useState, useEffect } from 'react';
import { UserProfile, PaymentCard, BudgetItem } from '../../types';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { User as FirebaseUser } from 'firebase/auth';
import { AuraLogo } from '../AuraLogo';

interface OnboardingScreenProps {
  onComplete: (data: {
    user: UserProfile;
    card?: PaymentCard;
    budgets: BudgetItem[];
    isGuest: boolean;
  }) => void;
  onGoogleSignIn: () => Promise<FirebaseUser | null>;
  firebaseUser?: FirebaseUser | null;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
  onGoogleSignIn,
  firebaseUser,
}) => {
  // 5 Steps: 1 Auth Hero Showcase -> 2 Name/Avatar -> 3 Income/Schedule -> 4 Card -> 5 Launch
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(!firebaseUser);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Step 2: Identity
  const [name, setName] = useState(firebaseUser?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(
    firebaseUser?.photoURL || AVATAR_OPTIONS[3]
  );

  // Step 3: Income
  const [incomeString, setIncomeString] = useState('100000');
  const [salarySchedule, setSalarySchedule] = useState('1st of every month');
  const [sideIncome, setSideIncome] = useState('0');

  // Step 4: Card (Optional)
  const [hasCard, setHasCard] = useState(true);
  const [bankName, setBankName] = useState('HDFC Bank');
  const [cardVariant, setCardVariant] = useState('Salary Debit Card');
  const [last4, setLast4] = useState('4829');
  const [cardType, setCardType] = useState<'credit' | 'debit'>('debit');
  const [initialBalance, setInitialBalance] = useState('50000');

  // Sync state if firebaseUser changes
  useEffect(() => {
    if (firebaseUser) {
      setIsGuestMode(false);
      if (firebaseUser.displayName && !name) {
        setName(firebaseUser.displayName);
      }
      if (firebaseUser.photoURL) {
        setSelectedAvatar(firebaseUser.photoURL);
      }
    }
  }, [firebaseUser]);

  const numericIncome = parseInt(incomeString.replace(/\D/g, ''), 10) || 0;
  const numericSideIncome = parseInt(sideIncome.replace(/\D/g, ''), 10) || 0;
  const totalMonthlyIncome = numericIncome + numericSideIncome;

  const handleNext = () => {
    setSlideDirection('forward');
    setStep((s) => (s + 1) as any);
  };

  const handleBack = () => {
    setSlideDirection('backward');
    setStep((s) => (s - 1) as any);
  };

  const handleGoogleAuth = async () => {
    setIsSigningIn(true);
    try {
      const user = await onGoogleSignIn();
      if (user) {
        setIsGuestMode(false);
        if (user.displayName) setName(user.displayName);
        if (user.photoURL) setSelectedAvatar(user.photoURL);
        setSlideDirection('forward');
        setStep(2);
      }
    } catch (err) {
      console.error('Sign-in error', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleContinueAsGuest = () => {
    setIsGuestMode(true);
    if (!name) setName('Guest');
    setSlideDirection('forward');
    setStep(2);
  };

  const handleSkipToLaunch = () => {
    setIsGuestMode(true);
    if (!name) setName('Guest');
    setSlideDirection('forward');
    setStep(5);
  };

  const handleFinish = () => {
    const finalName = name.trim() || (isGuestMode ? 'Guest User' : 'Aura Member');
    const needsAmount = Math.round((totalMonthlyIncome * 50) / 100);
    const wantsAmount = Math.round((totalMonthlyIncome * 30) / 100);
    const savingsAmount = Math.round((totalMonthlyIncome * 20) / 100);

    const userProfile: UserProfile = {
      name: finalName,
      email: firebaseUser?.email || 'guest@device.local',
      tier: 'Personal',
      avatarUrl: selectedAvatar,
      monthlyBaseIncome: totalMonthlyIncome,
      salarySchedule,
      sideStreams: numericSideIncome,
      sideStreamLabel: numericSideIncome > 0 ? `+₹${numericSideIncome.toLocaleString('en-IN')}` : 'None',
      budgetRatio: {
        needsPercent: 50,
        needsAmount,
        wantsPercent: 30,
        wantsAmount,
        savingsPercent: 20,
        savingsAmount,
        totalTarget: totalMonthlyIncome,
      },
      billRemindersActive: true,
      highValueThreshold: 10000,
      defaultCardId: hasCard ? 'card-primary' : '',
    };

    let primaryCard: PaymentCard | undefined;
    if (hasCard) {
      primaryCard = {
        id: 'card-' + Date.now(),
        bankName,
        variant: cardVariant,
        cardholderName: finalName.toUpperCase(),
        cardNumber: `•••• •••• •••• ${last4.padStart(4, '0')}`,
        last4: last4.padStart(4, '0'),
        expiry: '12/29',
        network: 'VISA',
        type: cardType,
        availableBalance: parseInt(initialBalance.replace(/\D/g, ''), 10) || 0,
        isDefault: true,
      };
    }

    const starterBudgets: BudgetItem[] = [
      {
        id: 'b-groceries',
        name: 'Groceries & Essentials',
        category: 'GROCERIES',
        allocated: Math.round(needsAmount * 0.45) || 15000,
        spent: 0,
        statusText: 'Fresh budget',
        statusType: 'normal',
        icon: 'shopping_cart',
        color: '#10b981',
      },
      {
        id: 'b-food',
        name: 'Food & Dining',
        category: 'FOOD',
        allocated: Math.round(wantsAmount * 0.45) || 12000,
        spent: 0,
        statusText: 'Fresh budget',
        statusType: 'normal',
        icon: 'restaurant',
        color: '#ff7886',
      },
      {
        id: 'b-bills',
        name: 'Utilities & Bills',
        category: 'BILLS',
        allocated: Math.round(needsAmount * 0.35) || 10000,
        spent: 0,
        statusText: 'Fresh budget',
        statusType: 'normal',
        icon: 'bolt',
        color: '#6366f1',
      },
      {
        id: 'b-shopping',
        name: 'Shopping & Lifestyle',
        category: 'SHOPPING',
        allocated: Math.round(wantsAmount * 0.35) || 8000,
        spent: 0,
        statusText: 'Fresh budget',
        statusType: 'normal',
        icon: 'shopping_bag',
        color: '#f59e0b',
      },
    ];

    onComplete({
      user: userProfile,
      card: primaryCard,
      budgets: starterBudgets,
      isGuest: isGuestMode,
    });
  };

  return (
    <div
      className="pwa-onboarding-container min-h-screen bg-[#f8fafc] dark:bg-[#0a0e18] text-slate-800 dark:text-[#dfe2f1] flex flex-col justify-between max-w-md mx-auto px-5 select-none relative overflow-hidden font-sans transition-all duration-200"
      style={{
        paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 1.25rem), 1.25rem)',
        paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 1.25rem), 1.25rem)',
      }}
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 dark:bg-[#10b981]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/10 dark:bg-[#6366f1]/15 rounded-full blur-3xl pointer-events-none" />

      {/* TOP BAR */}
      {step === 1 ? (
        /* Step 1 Top Bar: Logo + AURA on left, Help / Skip / Profile-Theme on right */
        <div className="relative z-10 flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <AuraLogo size={28} iconSize={13} />
            <span className="font-extrabold tracking-wider text-base text-slate-900 dark:text-white">
              AURA
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="text-xs font-semibold text-slate-600 dark:text-[#bbcabf] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Help
            </button>
            <button
              type="button"
              onClick={handleSkipToLaunch}
              className="text-xs font-semibold text-slate-600 dark:text-[#bbcabf] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Skip
            </button>
            <div className="flex items-center">
              <ThemeSwitcher variant="compact" />
            </div>
          </div>
        </div>
      ) : (
        /* Steps 2-5 Header: Progress Tracker */
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AuraLogo size={28} iconSize={13} />
              <div>
                <span className="font-bold tracking-tight text-sm text-slate-900 dark:text-white">Aura</span>
                <span className="text-[10px] text-slate-500 dark:text-[#bbcabf] ml-1.5 font-mono">Ledger Setup</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-[#bbcabf]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#10b981] animate-pulse" />
                <span>Step {step} of 5</span>
              </div>
              <ThemeSwitcher variant="compact" />
            </div>
          </div>

          {/* 5-Step Segmented Progress Bar */}
          <div className="grid grid-cols-5 gap-1.5 h-1.5 w-full">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`rounded-full transition-all duration-300 ${
                  s <= step
                    ? 'bg-emerald-500 dark:bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                    : 'bg-slate-200 dark:bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ANIMATED STEP CONTENT CONTAINER */}
      <div
        key={step}
        className={`relative z-10 flex-1 flex flex-col justify-center py-4 animate-in fade-in duration-300 ease-out ${
          slideDirection === 'forward'
            ? 'slide-in-from-right-10'
            : 'slide-in-from-left-10'
        }`}
      >
        {/* ======================================================== */}
        {/* STEP 1: AUTH HERO SHOWCASE (Matches image.png in Dark & White) */}
        {/* ======================================================== */}
        {step === 1 && (
          <div className="space-y-4">
            {/* HERO CARD CONTAINER WITH GRID PATTERN */}
            <div className="relative rounded-3xl bg-white dark:bg-[#0d121e] border border-slate-200 dark:border-white/10 p-4 sm:p-5 shadow-xl overflow-hidden transition-colors">
              {/* Grid Background Pattern */}
              <div
                className="absolute inset-0 opacity-40 dark:opacity-25 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, rgba(16, 185, 129, 0.25) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

              {/* Top-Right Badge: Smart Cycle Active */}
              <div className="flex justify-end relative z-10">
                <div className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1a2133] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#c0c1ff] text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                  <span className="material-symbols-outlined text-[13px]">credit_card</span>
                  <span>Smart Cycle Active</span>
                </div>
              </div>

              {/* FLOATING CARD: AURA VAULT */}
              <div className="relative z-10 my-3 rounded-2xl bg-[#0f1422] dark:bg-[#161c2b] text-white p-4 sm:p-4.5 border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
                {/* Header: Dot + AURA VAULT | Contactless Waves */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                    <span className="font-bold text-xs uppercase tracking-wider text-white">
                      AURA VAULT
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[20px] text-[#4edea3]">
                    contactless
                  </span>
                </div>

                {/* Card Center: Net Monthly Delta + Circular 84% Donut */}
                <div className="flex items-center justify-between pt-3 pb-1">
                  <div>
                    <span className="text-[11px] font-semibold text-[#bbcabf] block">
                      Net Monthly Delta
                    </span>
                    <div className="font-mono text-2xl font-extrabold text-[#4edea3] flex items-center gap-1 mt-0.5">
                      <span>+₹32,500</span>
                      <span className="material-symbols-outlined text-[18px]">trending_up</span>
                    </div>
                  </div>

                  {/* Circular 84% Ring */}
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <path
                        className="text-white/10"
                        stroke="currentColor"
                        strokeWidth="3.2"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#10b981]"
                        stroke="currentColor"
                        strokeWidth="3.2"
                        strokeDasharray="84, 100"
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-bold text-white">84%</span>
                  </div>
                </div>

                {/* Glowing Emerald Spline Wave */}
                <div className="pt-2 relative">
                  <svg viewBox="0 0 260 30" className="w-full h-7 overflow-visible">
                    <path
                      d="M 5,22 Q 60,20 120,14 T 240,6"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="filter drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]"
                    />
                    <circle cx="240" cy="6" r="4.5" fill="#10b981" className="filter drop-shadow-[0_0_8px_rgba(16,185,129,1)]" />
                    <circle cx="240" cy="6" r="2" fill="#ffffff" />
                  </svg>
                </div>
              </div>

              {/* Bottom Badge: Pacing • 84% Under Cap */}
              <div className="relative z-10 flex items-center">
                <div className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-[#10241f] border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-[#4edea3] text-[10px] font-bold inline-flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#10b981]" />
                  <span>Pacing • 84% Under Cap</span>
                </div>
              </div>
            </div>

            {/* PAGING INDICATOR DOTS */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <span className="w-6 h-1.5 rounded-full bg-emerald-500 dark:bg-[#10b981]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/20" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/20" />
            </div>

            {/* HEADLINE */}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center text-slate-900 dark:text-white leading-tight">
              Master Your Money with Precision
            </h1>

            {/* FEATURE VALUE PILLS */}
            <div className="flex flex-col items-center gap-2 pt-1">
              {/* Primary centered tag */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-[#122822] border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-[#4edea3] text-xs font-semibold shadow-xs">
                <span className="material-symbols-outlined text-[15px]">credit_card</span>
                <span>₹ INR Multi-card tracking</span>
              </div>

              {/* Row with two feature tags */}
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#181d2a] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#dfe2f1] text-[11px] font-semibold shadow-xs">
                  <span className="material-symbols-outlined text-[14px] text-slate-500 dark:text-[#bbcabf]">calendar_month</span>
                  <span>Auto-cycle bill alerts</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#181d2a] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#dfe2f1] text-[11px] font-semibold shadow-xs">
                  <span className="material-symbols-outlined text-[14px] text-emerald-600 dark:text-[#4edea3]">lock</span>
                  <span>Bank-grade encrypted</span>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS (Matching image.png) */}
            <div className="space-y-2.5 pt-2 max-w-sm mx-auto w-full">
              {/* Continue with Google Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isSigningIn}
                className="w-full h-13 rounded-2xl bg-white dark:bg-[#202534] hover:bg-slate-50 dark:hover:bg-[#2a3042] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                {isSigningIn ? (
                  <span className="material-symbols-outlined text-[18px] animate-spin text-emerald-600">
                    progress_activity
                  </span>
                ) : (
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                <span>Continue with Google</span>
              </button>

              {/* Explore as Guest • Quick setup Button */}
              <button
                type="button"
                onClick={handleContinueAsGuest}
                className="w-full h-13 rounded-2xl bg-slate-100 dark:bg-[#151926] hover:bg-slate-200 dark:hover:bg-[#1e2334] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-[#dfe2f1] font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px] text-slate-600 dark:text-[#bbcabf]">
                  person
                </span>
                <span>Explore as Guest • Quick setup</span>
              </button>

              {/* Footer Terms */}
              <p className="text-[10px] text-center text-slate-500 dark:text-[#bbcabf]/70 leading-relaxed px-2 pt-1">
                By continuing, you agree to our Terms of Service & Privacy Policy. 256-bit encrypted.
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: WHAT DO WE CALL YOU? */}
        {/* ======================================================== */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-[#10b981]/20 border border-emerald-200 dark:border-[#10b981]/40 text-emerald-600 dark:text-[#4edea3] flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[28px]">badge</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                What do we call you?
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#bbcabf] leading-relaxed">
                Choose a display name for your dashboard greetings, reports, and payment ledger.
              </p>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-[#dfe2f1] block">
                Your Name or Moniker
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-[20px] text-slate-400 dark:text-[#bbcabf]">
                  person
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name (e.g., Alex, Naren)"
                  className="w-full h-13 bg-white dark:bg-[#171b26] border border-slate-300 dark:border-white/10 rounded-2xl pl-12 pr-4 text-base font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#bbcabf]/40 focus:outline-none focus:border-emerald-500 dark:focus:border-[#4edea3] focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-sm"
                  autoFocus
                />
              </div>
            </div>

            {/* Avatar Selector */}
            <div className="space-y-2.5 pt-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-[#dfe2f1] block">
                Choose Profile Avatar
              </label>
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                {firebaseUser?.photoURL && (
                  <button
                    type="button"
                    onClick={() => setSelectedAvatar(firebaseUser.photoURL!)}
                    className={`relative rounded-full transition-all shrink-0 p-0.5 cursor-pointer ${
                      selectedAvatar === firebaseUser.photoURL
                        ? 'ring-2 ring-emerald-500 dark:ring-[#4edea3] scale-105'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={firebaseUser.photoURL}
                      alt="Google Avatar"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white dark:border-[#0a0e18]" />
                  </button>
                )}

                {AVATAR_OPTIONS.map((avUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(avUrl)}
                    className={`rounded-full transition-all shrink-0 p-0.5 cursor-pointer ${
                      selectedAvatar === avUrl
                        ? 'ring-2 ring-emerald-500 dark:ring-[#4edea3] scale-105 shadow-md'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={avUrl}
                      alt={`Avatar option ${idx + 1}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: MONTHLY INCOME & PAY SCHEDULE */}
        {/* ======================================================== */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-[#10b981]/20 text-emerald-600 dark:text-[#4edea3] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">payments</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Monthly Income & Schedule
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#bbcabf]">
                Aura uses this to compute your daily safe spending cadence and automated budget limits.
              </p>
            </div>

            {/* Income Amount Box */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-[#dfe2f1] block">
                Primary Monthly Take-Home Income
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-xl font-mono font-bold text-emerald-600 dark:text-[#4edea3]">
                  ₹
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={numericIncome ? numericIncome.toLocaleString('en-IN') : ''}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '');
                    setIncomeString(clean);
                  }}
                  placeholder="0"
                  className="w-full h-14 bg-white dark:bg-[#171b26] border border-slate-300 dark:border-white/10 rounded-2xl pl-11 pr-4 font-mono font-bold text-2xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-[#4edea3] focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-sm"
                  autoFocus
                />
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {[50000, 75000, 100000, 150000, 250000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setIncomeString(preset.toString())}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      numericIncome === preset
                        ? 'bg-emerald-500 dark:bg-[#10b981] text-white dark:text-[#002113] shadow-md font-bold'
                        : 'bg-white dark:bg-[#1c1f2a] text-slate-700 dark:text-[#bbcabf] hover:text-slate-900 dark:hover:text-[#dfe2f1] border border-slate-200 dark:border-white/5'
                    }`}
                  >
                    ₹{(preset / 1000)}k
                  </button>
                ))}
              </div>
            </div>

            {/* Salary Schedule */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-[#dfe2f1] block">
                Salary Deposit Schedule
              </label>
              <select
                value={salarySchedule}
                onChange={(e) => setSalarySchedule(e.target.value)}
                className="w-full h-11 bg-white dark:bg-[#171b26] border border-slate-300 dark:border-white/10 rounded-xl px-3 text-xs font-semibold text-slate-800 dark:text-[#dfe2f1] focus:outline-none focus:border-emerald-500 dark:focus:border-[#4edea3] shadow-sm cursor-pointer"
              >
                <option value="1st of every month">1st of every month</option>
                <option value="5th of every month">5th of every month</option>
                <option value="15th of every month">15th of every month</option>
                <option value="Last working day">Last working day</option>
                <option value="Bi-weekly (Alternate Fridays)">Bi-weekly (Alternate Fridays)</option>
              </select>
            </div>

            {/* Secondary Income (Optional) */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-[#dfe2f1] flex items-center justify-between">
                <span>Secondary / Side Streams (Optional)</span>
                <span className="text-[10px] text-slate-500 dark:text-[#bbcabf]">Freelance / Rental / ROI</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-mono font-bold text-slate-400 dark:text-[#bbcabf]">
                  +₹
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={numericSideIncome ? numericSideIncome.toLocaleString('en-IN') : ''}
                  onChange={(e) => setSideIncome(e.target.value.replace(/\D/g, ''))}
                  placeholder="0"
                  className="w-full h-10 bg-white dark:bg-[#171b26] border border-slate-300 dark:border-white/10 rounded-xl pl-9 pr-3 text-xs font-mono font-semibold text-slate-800 dark:text-[#dfe2f1] focus:outline-none focus:border-emerald-500 dark:focus:border-[#4edea3] shadow-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 4: SPENDING ACCOUNT / PRIMARY CARD */}
        {/* ======================================================== */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-[#10b981]/20 text-emerald-600 dark:text-[#4edea3] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">credit_card</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Primary Spending Account
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#bbcabf]">
                Link your everyday checking account or card to track liquidity in real-time.
              </p>
            </div>

            {/* Toggle Card */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-white/5 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-[#dfe2f1] block">
                  Add payment card now?
                </span>
                <span className="text-[10px] text-slate-500 dark:text-[#bbcabf]">
                  You can also add multiple cards later in Profile.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHasCard(!hasCard)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  hasCard ? 'bg-emerald-500 dark:bg-[#10b981]' : 'bg-slate-300 dark:bg-[#313540]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    hasCard ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {hasCard && (
              <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-[#1c1f2a] border border-slate-200 dark:border-white/10 shadow-sm">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-[#bbcabf]">Bank / Institution</label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full h-10 bg-slate-50 dark:bg-[#171b26] border border-slate-300 dark:border-white/10 rounded-xl px-3 text-xs font-semibold text-slate-800 dark:text-[#dfe2f1] focus:outline-none"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    <option value="Standard Chartered">Standard Chartered</option>
                    <option value="Other Bank">Other Bank</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-[#bbcabf]">Type</label>
                    <select
                      value={cardType}
                      onChange={(e) => setCardType(e.target.value as 'credit' | 'debit')}
                      className="w-full h-10 bg-slate-50 dark:bg-[#171b26] border border-slate-300 dark:border-white/10 rounded-xl px-2.5 text-xs font-semibold text-slate-800 dark:text-[#dfe2f1] focus:outline-none"
                    >
                      <option value="debit">Debit Card</option>
                      <option value="credit">Credit Card</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-[#bbcabf]">Last 4 Digits</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={last4}
                      onChange={(e) => setLast4(e.target.value.replace(/\D/g, ''))}
                      placeholder="4829"
                      className="w-full h-10 bg-slate-50 dark:bg-[#171b26] border border-slate-300 dark:border-white/10 rounded-xl px-3 text-xs font-mono font-semibold text-slate-800 dark:text-[#dfe2f1] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-[#bbcabf]">Card Label / Nickname</label>
                  <input
                    type="text"
                    value={cardVariant}
                    onChange={(e) => setCardVariant(e.target.value)}
                    placeholder="e.g., Salary Account, Millennia, Everyday"
                    className="w-full h-10 bg-slate-50 dark:bg-[#171b26] border border-slate-300 dark:border-white/10 rounded-xl px-3 text-xs font-semibold text-slate-800 dark:text-[#dfe2f1] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-[#bbcabf]">Current Available Balance</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-emerald-600 dark:text-[#4edea3]">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={parseInt(initialBalance.replace(/\D/g, ''), 10) ? parseInt(initialBalance.replace(/\D/g, ''), 10).toLocaleString('en-IN') : ''}
                      onChange={(e) => setInitialBalance(e.target.value.replace(/\D/g, ''))}
                      placeholder="50,000"
                      className="w-full h-10 bg-slate-50 dark:bg-[#171b26] border border-slate-300 dark:border-white/10 rounded-xl pl-8 pr-3 text-xs font-mono font-bold text-slate-800 dark:text-[#dfe2f1] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 5: READY TO LAUNCH */}
        {/* ======================================================== */}
        {step === 5 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-[#10b981]/20 border border-emerald-200 dark:border-[#10b981]/40 text-emerald-600 dark:text-[#4edea3] flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[28px]">rocket_launch</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                You're Ready to Launch!
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#bbcabf]">
                Your personal Aura ledger is configured from scratch and ready to use.
              </p>
            </div>

            {/* Overview Card */}
            <div className="p-4.5 rounded-2xl bg-white dark:bg-[#1c1f2a] border border-slate-200 dark:border-white/10 space-y-3.5 text-xs shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/5">
                <span className="text-slate-500 dark:text-[#bbcabf]">Account Holder</span>
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <img src={selectedAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                  <span>{name || 'Aura Member'}</span>
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/5">
                <span className="text-slate-500 dark:text-[#bbcabf]">Monthly Inflow</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  ₹{totalMonthlyIncome.toLocaleString('en-IN')}/mo
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/5">
                <span className="text-slate-500 dark:text-[#bbcabf]">Salary Schedule</span>
                <span className="font-semibold text-slate-800 dark:text-[#dfe2f1]">
                  {salarySchedule}
                </span>
              </div>

              {hasCard && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-[#bbcabf]">Primary Card</span>
                  <span className="font-semibold text-slate-800 dark:text-[#dfe2f1]">
                    {bankName} (•• {last4})
                  </span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-center text-slate-500 dark:text-[#bbcabf] leading-relaxed">
              Every expense you log will immediately update your balance, daily cadence, and ledger analytics.
            </p>
          </div>
        )}
      </div>

      {/* BOTTOM NAVIGATION BUTTONS FOR STEPS 2 TO 5 */}
      {step >= 2 && (
        <div className="relative z-10 pt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="h-12 px-4 rounded-xl bg-white dark:bg-[#171b26] hover:bg-slate-100 dark:hover:bg-[#262a35] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-[#dfe2f1] flex items-center justify-center transition-all cursor-pointer shadow-sm"
          >
            Back
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-95 text-[#002113] font-bold text-sm flex items-center justify-center gap-2 shadow-md dark:shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-[0.99] transition-all cursor-pointer"
            >
              <span>Continue</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-95 text-[#002113] font-bold text-sm flex items-center justify-center gap-2 shadow-md dark:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-[0.99] transition-all cursor-pointer"
            >
              <span>Launch Aura Dashboard</span>
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </button>
          )}
        </div>
      )}

      {/* QUICK HELP MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#171b26] border border-slate-200 dark:border-white/10 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-[#4edea3] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">help_outline</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Aura Quick Guide</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-[#bbcabf] flex items-center justify-center hover:bg-slate-200"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-[#bbcabf] leading-relaxed">
              <p>
                <strong className="text-slate-900 dark:text-white">Google Sign-In:</strong> Persists your ledger securely to Firebase Cloud so you can access your transactions on any computer or phone.
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">Explore as Guest:</strong> All entries are kept 100% locally on your browser. Zero cloud transmission.
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">Setup Steps:</strong> Configure your monthly income and optional payment cards to get automated daily burn rate tracking.
              </p>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
