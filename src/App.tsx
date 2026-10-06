/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  INITIAL_USER,
  INITIAL_CARDS,
  INITIAL_BUDGETS,
  INITIAL_SAVINGS_GOALS,
  INITIAL_TRANSACTIONS,
} from './data/mockData';
import { Transaction, PaymentCard, BudgetItem, SavingsGoal, UserProfile } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { AnalyticsScreen } from './components/screens/AnalyticsScreen';
import { BudgetsScreen } from './components/screens/BudgetsScreen';
import { TransactionsScreen } from './components/screens/TransactionsScreen';
import { QuickAddModal } from './components/screens/QuickAddModal';
import { AddCardModal } from './components/screens/AddCardModal';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { TransactionDetailModal } from './components/modals/TransactionDetailModal';
import { CreateBudgetModal } from './components/modals/CreateBudgetModal';
import { NotificationsModal } from './components/modals/NotificationsModal';
import { AuraChatbot } from './components/AuraChatbot';
import { AuraLogo } from './components/AuraLogo';
import { User as FirebaseUser } from 'firebase/auth';
import {
  loginWithGoogle,
  logoutUser,
  subscribeToAuth,
  subscribeToTransactions,
  addTransaction,
  deleteTransaction,
  subscribeToCards,
  addCard,
  deleteCard,
  subscribeToBudgets,
  addBudget,
  saveUserProfile,
  fetchUserProfile,
  migrateGuestDataToFirestore,
} from './firebase/service';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<
    'dashboard' | 'analytics' | 'assistant' | 'budgets' | 'transactions' | 'profile' | 'addCard'
  >('dashboard');
  const [previousScreen, setPreviousScreen] = useState<
    'dashboard' | 'analytics' | 'assistant' | 'budgets' | 'transactions'
  >('dashboard');

  const handleNavigate = (
    newScreen: 'dashboard' | 'analytics' | 'assistant' | 'budgets' | 'transactions' | 'profile' | 'addCard'
  ) => {
    if (newScreen === 'profile' || newScreen === 'addCard') {
      if (currentScreen !== 'profile' && currentScreen !== 'addCard') {
        setPreviousScreen(currentScreen as any);
      }
    }
    setCurrentScreen(newScreen);
  };

  const handleBackFromProfile = () => {
    setCurrentScreen(previousScreen || 'dashboard');
  };

  // Firebase auth & Initial PWA App Launch Splash State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isSplashMinTimerDone, setIsSplashMinTimerDone] = useState(false);

  useEffect(() => {
    // Graceful minimum splash duration (600ms) to ensure smooth native PWA pulse animation
    const timer = setTimeout(() => {
      setIsSplashMinTimerDone(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Onboarding state
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    try {
      return localStorage.getItem('aura_onboarding_completed') === 'true';
    } catch {
      return false;
    }
  });

  // App data state (hydrated from localStorage for guest / instant-load cache)
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('aura_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_USER;
  });

  const [cards, setCards] = useState<PaymentCard[]>(() => {
    try {
      const saved = localStorage.getItem('aura_cards');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_CARDS;
  });

  const [budgets, setBudgets] = useState<BudgetItem[]>(() => {
    try {
      const saved = localStorage.getItem('aura_budgets');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_BUDGETS;
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem('aura_savings_goals');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_SAVINGS_GOALS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('aura_transactions');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_TRANSACTIONS;
  });

  // Modals state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'expense' | 'income'>('expense');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [editingCard, setEditingCard] = useState<PaymentCard | null>(null);
  const [isCreateBudgetOpen, setIsCreateBudgetOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'saved' | 'deleted' | 'updated' } | null>(null);
  const [deviceFrameMode, setDeviceFrameMode] = useState(false);

  // Listen to Firebase Auth state
  useEffect(() => {
    // Safety fallback: ensure splash screen unlocks even if Firebase is slow/offline
    const safetyTimer = setTimeout(() => {
      setAuthInitialized(true);
    }, 2500);

    const unsubscribeAuth = subscribeToAuth(async (fUser) => {
      clearTimeout(safetyTimer);
      setFirebaseUser(fUser);
      setAuthInitialized(true);

      if (fUser) {
        try {
          // Check Firestore user profile
          const remoteProfile = await fetchUserProfile(fUser.uid);

          if (remoteProfile) {
            setUser((prev) => ({
              ...prev,
              ...remoteProfile,
              name: remoteProfile.name || fUser.displayName || prev.name,
              email: fUser.email || prev.email,
              avatarUrl: fUser.photoURL || remoteProfile.avatarUrl || prev.avatarUrl,
            }));

            if (remoteProfile.hasCompletedOnboarding || (remoteProfile.monthlyBaseIncome && remoteProfile.monthlyBaseIncome > 0)) {
              setHasCompletedOnboarding(true);
              localStorage.setItem('aura_onboarding_completed', 'true');
            }
          } else {
            // First time this Google account signs in: migrate existing guest data if present
            const localSavedOnboarding = localStorage.getItem('aura_onboarding_completed') === 'true';
            if (localSavedOnboarding) {
              await migrateGuestDataToFirestore(fUser.uid, {
                user: {
                  ...user,
                  name: fUser.displayName || user.name,
                  email: fUser.email || user.email,
                  avatarUrl: fUser.photoURL || user.avatarUrl,
                },
                transactions,
                cards,
                budgets,
              });
              setHasCompletedOnboarding(true);
            }
          }
        } catch (err) {
          console.error('Error fetching/migrating user profile:', err);
        }
      } else {
        // Guest mode: fallback to local storage
        try {
          const isComplete = localStorage.getItem('aura_onboarding_completed') === 'true';
          setHasCompletedOnboarding(isComplete);
        } catch {}
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Listen to Firestore real-time collections when user is signed in
  useEffect(() => {
    if (!firebaseUser) return;

    const unsubscribeTx = subscribeToTransactions(firebaseUser.uid, (syncedTx) => {
      if (syncedTx && syncedTx.length > 0) {
        setTransactions(syncedTx);
        try {
          localStorage.setItem('aura_transactions', JSON.stringify(syncedTx));
        } catch {}

        // Also check if any local transaction is missing from Firestore and sync it up
        try {
          const localCached = localStorage.getItem('aura_transactions');
          if (localCached) {
            const parsed: Transaction[] = JSON.parse(localCached);
            const remoteIds = new Set(syncedTx.map((t) => t.id));
            const unsynced = parsed.filter((t) => !remoteIds.has(t.id));
            if (unsynced.length > 0) {
              unsynced.forEach((tx) => {
                addTransaction(firebaseUser.uid, tx).catch(() => {});
              });
            }
          }
        } catch {}
      } else {
        // If Firestore returned empty, check if we have local transactions to sync up
        try {
          const cached = localStorage.getItem('aura_transactions');
          if (cached) {
            const parsed: Transaction[] = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              parsed.forEach((tx) => {
                addTransaction(firebaseUser.uid, tx).catch(() => {});
              });
            }
          }
        } catch {}
      }
    });

    const unsubscribeCards = subscribeToCards(firebaseUser.uid, (syncedCards) => {
      if (syncedCards && syncedCards.length > 0) {
        setCards(syncedCards);
        try {
          localStorage.setItem('aura_cards', JSON.stringify(syncedCards));
        } catch {}
      }
    });

    const unsubscribeBudgets = subscribeToBudgets(firebaseUser.uid, (syncedBudgets) => {
      if (syncedBudgets && syncedBudgets.length > 0) {
        setBudgets(syncedBudgets);
        try {
          localStorage.setItem('aura_budgets', JSON.stringify(syncedBudgets));
        } catch {}
      }
    });

    return () => {
      unsubscribeTx();
      unsubscribeCards();
      unsubscribeBudgets();
    };
  }, [firebaseUser]);

  // Detect PWA Standalone Mode and apply is-pwa class to root
  useEffect(() => {
    const updatePwaState = () => {
      try {
        const isStandalone =
          window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as any).standalone === true ||
          document.referrer.includes('android-app://');
        if (isStandalone) {
          document.documentElement.classList.add('is-pwa');
        } else {
          document.documentElement.classList.remove('is-pwa');
        }
      } catch {}
    };
    updatePwaState();
    const mq = window.matchMedia?.('(display-mode: standalone)');
    mq?.addEventListener?.('change', updatePwaState);
    return () => mq?.removeEventListener?.('change', updatePwaState);
  }, []);

  const showToast = (message: string, type: 'saved' | 'deleted' | 'updated' = 'saved') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 2400);
  };

  // Google Sign-In & Sign-Out Handlers
  const handleGoogleSignIn = async (): Promise<FirebaseUser | null> => {
    try {
      const signedInUser = await loginWithGoogle();
      if (!signedInUser) {
        return null;
      }

      // Migrate existing local storage data
      try {
        await migrateGuestDataToFirestore(signedInUser.uid, {
          user: {
            ...user,
            name: signedInUser.displayName || user.name,
            email: signedInUser.email || user.email,
            avatarUrl: signedInUser.photoURL || user.avatarUrl,
          },
          transactions,
          cards,
          budgets,
        });
      } catch (migErr) {
        console.warn('Migration warning:', migErr);
      }

      setUser((prev) => ({
        ...prev,
        name: signedInUser.displayName || prev.name,
        email: signedInUser.email || prev.email,
        avatarUrl: signedInUser.photoURL || prev.avatarUrl,
      }));

      showToast(`Welcome, ${signedInUser.displayName?.split(' ')[0] || 'User'}!`, 'saved');
      return signedInUser;
    } catch (err: any) {
      const msg = err?.message || 'Sign-in cancelled';
      showToast(msg, 'deleted');
      return null;
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      // Switch back to local guest storage
      try {
        const savedUser = localStorage.getItem('aura_user_profile');
        if (savedUser) setUser(JSON.parse(savedUser));
        else setUser(INITIAL_USER);
      } catch {
        setUser(INITIAL_USER);
      }
      setCurrentScreen('dashboard');
      showToast('Signed out', 'updated');
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  // Onboarding Complete Handler
  const handleOnboardingComplete = async (data: {
    user: UserProfile;
    card?: PaymentCard;
    budgets: BudgetItem[];
    isGuest: boolean;
  }) => {
    const updatedUser = { ...data.user };
    const updatedCards = data.card ? [data.card] : [];
    const updatedBudgets = data.budgets;

    setUser(updatedUser);
    setCards(updatedCards);
    setBudgets(updatedBudgets);
    setTransactions([]);
    setCurrentScreen('dashboard');
    setHasCompletedOnboarding(true);
    setCurrentScreen('dashboard');

    // Save to Local Storage (Always serves as offline backup & guest storage)
    try {
      localStorage.setItem('aura_onboarding_completed', 'true');
      localStorage.setItem('aura_user_profile', JSON.stringify(updatedUser));
      localStorage.setItem('aura_cards', JSON.stringify(updatedCards));
      localStorage.setItem('aura_budgets', JSON.stringify(updatedBudgets));
      localStorage.setItem('aura_transactions', JSON.stringify([]));
    } catch (e) {
      console.error('Local storage write error:', e);
    }

    // Persist to Cloud Firestore if signed in
    if (firebaseUser) {
      try {
        await saveUserProfile(firebaseUser.uid, {
          ...updatedUser,
          hasCompletedOnboarding: true,
        });

        if (data.card) {
          await addCard(firebaseUser.uid, data.card);
        }

        for (const b of updatedBudgets) {
          await addBudget(firebaseUser.uid, b);
        }

        showToast('Welcome to Aura!', 'saved');
      } catch (err) {
        console.error('Firestore onboarding sync error:', err);
        showToast('Welcome to Aura!', 'saved');
      }
    } else {
      showToast('Welcome to Aura!', 'saved');
    }
  };

  // Transaction Handlers
  const handleOpenQuickAdd = (type: 'expense' | 'income' = 'expense') => {
    setQuickAddType(type);
    setIsQuickAddOpen(true);
  };

  const handleSaveTransactions = (newTxDataList: (Omit<Transaction, 'id'> | Transaction)[]) => {
    if (!newTxDataList || newTxDataList.length === 0) return;

    const baseTimestamp = Date.now();
    const newTransactions: Transaction[] = newTxDataList.map((data, index) => ({
      ...data,
      id: (data as any).id || `tx-${baseTimestamp}-${index}-${Math.random().toString(36).substring(2, 7)}`,
    }));

    // Local-First Persistence: Atomically prepend all new transactions to state and update localStorage
    setTransactions((prevTx) => {
      const updatedTx = [...newTransactions, ...prevTx];
      try {
        localStorage.setItem('aura_transactions', JSON.stringify(updatedTx));
      } catch (e) {}
      return updatedTx;
    });

    // Persist all to Firestore if signed in
    if (firebaseUser) {
      newTransactions.forEach((tx) => {
        addTransaction(firebaseUser.uid, tx).catch((err) => {
          console.warn('Notice: Firestore transaction sync notice:', err);
        });
      });
    }

    // Update budgets for all expense transactions
    setBudgets((prevBudgets) => {
      let updatedBudgets = [...prevBudgets];
      for (const tx of newTransactions) {
        if (tx.amount < 0) {
          const abs = Math.abs(tx.amount);
          updatedBudgets = updatedBudgets.map((b) => {
            if (b.category.toLowerCase() === tx.categoryType.toLowerCase()) {
              return { ...b, spent: b.spent + abs };
            }
            return b;
          });
        }
      }
      try {
        localStorage.setItem('aura_budgets', JSON.stringify(updatedBudgets));
      } catch {}
      return updatedBudgets;
    });

    showToast(
      newTransactions.length > 1
        ? `${newTransactions.length} transactions saved`
        : 'Saved',
      'saved'
    );
  };

  const handleSaveTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    handleSaveTransactions([newTxData]);
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    const previousTx = transactions.find((t) => t.id === updatedTx.id);

    setTransactions((prev) => {
      const updated = prev.map((t) => (t.id === updatedTx.id ? updatedTx : t));
      try {
        localStorage.setItem('aura_transactions', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (firebaseUser) {
      addTransaction(firebaseUser.uid, updatedTx).catch((err) => {
        console.warn('Notice: Firestore transaction update notice:', err);
      });
    }

    // Rebalance budgets if applicable
    if (previousTx && (previousTx.amount < 0 || updatedTx.amount < 0)) {
      setBudgets((prevBudgets) => {
        let updatedBudgets = [...prevBudgets];
        if (previousTx.amount < 0) {
          const oldAbs = Math.abs(previousTx.amount);
          updatedBudgets = updatedBudgets.map((b) =>
            b.category.toLowerCase() === previousTx.categoryType.toLowerCase()
              ? { ...b, spent: Math.max(0, b.spent - oldAbs) }
              : b
          );
        }
        if (updatedTx.amount < 0) {
          const newAbs = Math.abs(updatedTx.amount);
          updatedBudgets = updatedBudgets.map((b) =>
            b.category.toLowerCase() === updatedTx.categoryType.toLowerCase()
              ? { ...b, spent: b.spent + newAbs }
              : b
          );
        }
        try {
          localStorage.setItem('aura_budgets', JSON.stringify(updatedBudgets));
        } catch {}
        return updatedBudgets;
      });
    }

    showToast('Transaction updated', 'updated');
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      try {
        localStorage.setItem('aura_transactions', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (firebaseUser) {
      deleteTransaction(firebaseUser.uid, id).catch((err) => {
        console.warn('Notice: Firestore transaction delete notice:', err);
      });
    }
    showToast('Deleted', 'deleted');
  };

  const handleSaveCard = (newCard: PaymentCard) => {
    const updatedCards = [newCard, ...cards];
    setCards(updatedCards);

    try {
      localStorage.setItem('aura_cards', JSON.stringify(updatedCards));
    } catch {}

    if (firebaseUser) {
      addCard(firebaseUser.uid, newCard).catch((err) => {
        console.warn('Notice: Firestore card sync notice:', err);
      });
    }
    showToast('Card linked', 'saved');

    setCurrentScreen('profile');
  };

  const handleUpdateCard = (updatedCard: PaymentCard) => {
    const updatedCards = cards.map((c) => (c.id === updatedCard.id ? updatedCard : c));
    setCards(updatedCards);

    try {
      localStorage.setItem('aura_cards', JSON.stringify(updatedCards));
    } catch {}

    if (firebaseUser) {
      addCard(firebaseUser.uid, updatedCard).catch((err) => {
        console.warn('Notice: Firestore card update notice:', err);
      });
    }
    showToast('Card updated', 'saved');
    setEditingCard(null);
    setCurrentScreen('profile');
  };

  const handleDeleteCard = (cardId: string) => {
    const updatedCards = cards.filter((c) => c.id !== cardId);
    setCards(updatedCards);

    try {
      localStorage.setItem('aura_cards', JSON.stringify(updatedCards));
    } catch {}

    if (firebaseUser) {
      deleteCard(firebaseUser.uid, cardId).catch((err) => {
        console.warn('Notice: Firestore card delete notice:', err);
      });
    }
    showToast('Card removed', 'deleted');
  };

  const handleSaveBudget = (newBudget: BudgetItem) => {
    const updatedBudgets = [...budgets, newBudget];
    setBudgets(updatedBudgets);

    try {
      localStorage.setItem('aura_budgets', JSON.stringify(updatedBudgets));
    } catch {}

    if (firebaseUser) {
      addBudget(firebaseUser.uid, newBudget).catch((err) => {
        console.warn('Notice: Firestore budget sync notice:', err);
      });
    }
    showToast('Budget created', 'saved');
  };

  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    const updatedUser = { ...user, ...updated };
    setUser(updatedUser);

    try {
      localStorage.setItem('aura_user_profile', JSON.stringify(updatedUser));
    } catch {}

    if (firebaseUser) {
      saveUserProfile(firebaseUser.uid, updated).catch((err) => {
        console.warn('Notice: Firestore user profile sync notice:', err);
      });
    }
    showToast('Profile updated', 'updated');
  };

  // Initial loading splash screen: strictly just logo and app name with animate-pulse
  if (!authInitialized || !isSplashMinTimerDone) {
    return (
      <div className="fixed inset-0 bg-[#0f131d] flex flex-col items-center justify-center z-50 select-none">
        <div className="flex flex-col items-center justify-center gap-3.5 animate-pulse">
          <AuraLogo size={56} iconSize={26} />
          <span className="text-2xl font-bold tracking-tight text-[#dfe2f1]">
            Aura
          </span>
        </div>
      </div>
    );
  }

  // If onboarding is not completed, render Onboarding Screen
  if (!hasCompletedOnboarding) {
    return (
      <OnboardingScreen
        onComplete={handleOnboardingComplete}
        onGoogleSignIn={handleGoogleSignIn}
        firebaseUser={firebaseUser}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e18] text-[#dfe2f1] flex flex-col justify-between selection:bg-[#10b981]/30 selection:text-[#4edea3] relative font-sans">
      {/* Optional Top Desktop Mode Bar */}
      <div className="hidden lg:flex items-center justify-between px-6 py-2 bg-[#0f131d] border-b border-white/[0.04] text-xs text-[#bbcabf]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span className="font-semibold text-[#dfe2f1]">Aura Operating System</span>
          <span>• Personal Wealth Ledger</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDeviceFrameMode(!deviceFrameMode)}
            className="px-2.5 py-1 rounded bg-[#171b26] hover:bg-[#262a35] text-[#dfe2f1] border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">devices</span>
            <span>{deviceFrameMode ? 'Full-Width View' : 'Mobile Frame'}</span>
          </button>
        </div>
      </div>

      {/* Main Container: Mobile or Framed Center */}
      <div className={`w-full flex-1 flex flex-col justify-between ${deviceFrameMode ? 'py-6 flex items-center justify-center' : ''}`}>
        <div
          className={`w-full bg-[#0f131d] flex flex-col min-h-screen relative shadow-2xl ${
            deviceFrameMode
              ? 'max-w-[420px] rounded-[44px] border-[8px] border-[#262a35] overflow-hidden my-auto shadow-[0_20px_60px_rgba(0,0,0,0.8)]'
              : ''
          }`}
        >
          {/* Header */}
          <Header
            currentScreen={currentScreen}
            onNavigate={handleNavigate}
            user={user}
            unreadCount={0}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            firebaseUser={firebaseUser}
          />

          {/* Active Screen */}
          <main className={`flex-1 overflow-x-hidden ${currentScreen === 'assistant' ? 'overflow-y-hidden' : ''}`}>
            {currentScreen === 'dashboard' && (
              <DashboardScreen
                user={user}
                transactions={transactions}
                onOpenQuickAdd={handleOpenQuickAdd}
                onNavigate={handleNavigate}
                onSelectTransaction={(tx) => setSelectedTx(tx)}
              />
            )}

            {currentScreen === 'analytics' && (
              <AnalyticsScreen
                transactions={transactions}
                onOpenQuickAdd={() => handleOpenQuickAdd()}
              />
            )}

            <div
              className={
                currentScreen === 'assistant'
                  ? 'w-full flex-1 flex flex-col overflow-hidden relative'
                  : 'hidden'
              }
              style={{
                height: 'calc(100dvh - 4rem - 3.75rem - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
                maxHeight: 'calc(100dvh - 4rem - 3.75rem - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
              }}
            >
              {firebaseUser ? (
                <AuraChatbot
                  user={user}
                  firebaseUser={firebaseUser}
                  transactions={transactions}
                  cards={cards}
                  budgets={budgets}
                  currentScreen={currentScreen}
                  onSaveTransaction={handleSaveTransaction}
                  onSaveTransactions={handleSaveTransactions}
                  onDeleteTransaction={handleDeleteTransaction}
                  onSaveCard={handleSaveCard}
                  onSaveBudget={handleSaveBudget}
                  onUpdateUser={handleUpdateUser}
                  onNavigate={handleNavigate}
                  onSelectTransaction={(tx) => setSelectedTx(tx)}
                />
              ) : (
                <div className="w-full max-w-md mx-auto min-h-[65vh] flex flex-col items-center justify-center px-6 py-12 text-center animate-in fade-in duration-200">
                  {/* Rainbow Theme Border Showcase Box */}
                  <div className="relative p-[2.5px] rounded-2xl bg-gradient-to-tr from-[#ff3b30] via-[#ff9500] via-[#ffcc00] via-[#34c759] via-[#007aff] to-[#af52de] mb-4">
                    <div className="w-16 h-16 rounded-[13.5px] bg-white dark:bg-[#171b26] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[32px] bg-gradient-to-tr from-[#ff3b30] via-[#af52de] to-[#007aff] bg-clip-text text-transparent">
                        chat
                      </span>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Aura</h2>
                  <p className="text-xs text-slate-600 dark:text-[#bbcabf] max-w-xs leading-relaxed mb-6">
                    Available only for signed-in members. Sign in with your Google account to enable conversational financial management.
                  </p>
                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full max-w-xs h-12 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-98 cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Sign in with Google</span>
                  </button>
                </div>
              )}
            </div>

            {currentScreen === 'budgets' && (
              <BudgetsScreen
                budgets={budgets}
                savingsGoals={savingsGoals}
                onOpenCreateBudget={() => setIsCreateBudgetOpen(true)}
              />
            )}

            {currentScreen === 'transactions' && (
              <TransactionsScreen
                transactions={transactions}
                onSelectTransaction={(tx) => setSelectedTx(tx)}
                onOpenQuickAdd={() => handleOpenQuickAdd()}
              />
            )}

            {currentScreen === 'profile' && (
              <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm backdrop-fade-in">
                <div className="absolute inset-0 -z-10" onClick={handleBackFromProfile} />
                <div className="w-full max-w-md h-full bg-white dark:bg-[#0f131d] text-slate-800 dark:text-[#dfe2f1] overflow-y-auto no-scrollbar border-l border-slate-200 dark:border-white/10 shadow-2xl drawer-slide-right">
                  <ProfileScreen
                    user={user}
                    cards={cards}
                    onOpenAddCard={() => {
                      setEditingCard(null);
                      handleNavigate('addCard');
                    }}
                    onEditCard={(card) => {
                      setEditingCard(card);
                      handleNavigate('addCard');
                    }}
                    onDeleteCard={handleDeleteCard}
                    onUpdateUser={handleUpdateUser}
                    onBack={handleBackFromProfile}
                    firebaseUser={firebaseUser}
                    onGoogleLogin={handleGoogleSignIn}
                    onLogout={handleLogout}
                  />
                </div>
              </div>
            )}

            {currentScreen === 'addCard' && (
              <AddCardModal
                user={user}
                editCard={editingCard}
                onClose={() => {
                  setEditingCard(null);
                  setCurrentScreen('profile');
                }}
                onSaveCard={handleSaveCard}
                onUpdateCard={handleUpdateCard}
              />
            )}
          </main>

          {/* Bottom Navigation */}
          {currentScreen !== 'addCard' && (
            <BottomNav
              currentScreen={currentScreen}
              onNavigate={handleNavigate}
              onOpenQuickAdd={() => handleOpenQuickAdd()}
            />
          )}
        </div>
      </div>

      {/* Quick Add / Edit Transaction Modal */}
      {isQuickAddOpen && (
        <QuickAddModal
          initialType={editingTx ? (editingTx.amount > 0 ? 'income' : 'expense') : quickAddType}
          editTransaction={editingTx}
          cards={cards}
          user={user}
          onClose={() => {
            setIsQuickAddOpen(false);
            setEditingTx(null);
          }}
          onSaveTransaction={handleSaveTransaction}
          onUpdateTransaction={(updated) => {
            handleUpdateTransaction(updated);
            setIsQuickAddOpen(false);
            setEditingTx(null);
          }}
        />
      )}

      {/* Transaction Details Modal */}
      {selectedTx && (
        <TransactionDetailModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onDelete={(id) => {
            handleDeleteTransaction(id);
            setSelectedTx(null);
          }}
          onEdit={(tx) => {
            setSelectedTx(null);
            setEditingTx(tx);
            setIsQuickAddOpen(true);
          }}
        />
      )}

      {/* Create Budget Modal */}
      {isCreateBudgetOpen && (
        <CreateBudgetModal
          onClose={() => setIsCreateBudgetOpen(false)}
          onSaveBudget={handleSaveBudget}
        />
      )}

      {/* Notifications Modal */}
      {isNotificationsOpen && (
        <NotificationsModal
          onClose={() => setIsNotificationsOpen(false)}
          onOpenQuickAdd={() => {
            setIsNotificationsOpen(false);
            handleOpenQuickAdd();
          }}
        />
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full font-bold text-xs shadow-2xl flex items-center gap-1.5 transition-all animate-in fade-in slide-in-from-top-4 ${
            toast.type === 'deleted'
              ? 'bg-[#ff5469] text-white shadow-[0_4px_20px_rgba(255,84,105,0.45)]'
              : toast.type === 'updated'
              ? 'bg-[#3b82f6] text-white shadow-[0_4px_20px_rgba(59,130,246,0.45)]'
              : 'bg-[#10b981] text-[#002113] shadow-[0_4px_20px_rgba(16,185,129,0.45)]'
          }`}
        >
          <span className="material-symbols-outlined text-[17px] font-bold">
            {toast.type === 'deleted' ? 'delete' : toast.type === 'updated' ? 'sync' : 'check'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
