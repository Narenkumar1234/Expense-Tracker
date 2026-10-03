/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
import { TransactionDetailModal } from './components/modals/TransactionDetailModal';
import { CreateBudgetModal } from './components/modals/CreateBudgetModal';
import { NotificationsModal } from './components/modals/NotificationsModal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<
    'dashboard' | 'analytics' | 'budgets' | 'transactions' | 'profile' | 'addCard'
  >('dashboard');

  // App data state
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [cards, setCards] = useState<PaymentCard[]>(INITIAL_CARDS);
  const [budgets, setBudgets] = useState<BudgetItem[]>(INITIAL_BUDGETS);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(INITIAL_SAVINGS_GOALS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  // Modals state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'expense' | 'income'>('expense');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isCreateBudgetOpen, setIsCreateBudgetOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deviceFrameMode, setDeviceFrameMode] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Handlers
  const handleOpenQuickAdd = (type: 'expense' | 'income' = 'expense') => {
    setQuickAddType(type);
    setIsQuickAddOpen(true);
  };

  const handleSaveTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: 'tx-' + Date.now(),
    };
    setTransactions([newTx, ...transactions]);

    // Update budget if expense
    if (newTx.amount < 0) {
      const abs = Math.abs(newTx.amount);
      setBudgets((prev) =>
        prev.map((b) => {
          if (b.category.toLowerCase() === newTx.categoryType.toLowerCase()) {
            return { ...b, spent: b.spent + abs };
          }
          return b;
        })
      );
    }

    showToast(
      `${newTx.amount < 0 ? 'Expense' : 'Income'} of ₹${Math.abs(newTx.amount).toLocaleString('en-IN')} added!`
    );
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Transaction removed from ledger');
  };

  const handleSaveCard = (newCard: PaymentCard) => {
    setCards([newCard, ...cards]);
    showToast(`Card ${newCard.bankName} ${newCard.variant} secured & linked!`);
    setCurrentScreen('profile');
  };

  const handleSaveBudget = (newBudget: BudgetItem) => {
    setBudgets([...budgets, newBudget]);
    showToast(`Budget for ${newBudget.name} created!`);
  };

  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    setUser({ ...user, ...updated });
    showToast('Preferences updated in Aura Vault');
  };

  return (
    <div className="min-h-screen bg-[#0a0e18] text-[#dfe2f1] flex flex-col justify-between selection:bg-[#10b981]/30 selection:text-[#4edea3] relative">
      {/* Optional Top Desktop Mode Bar */}
      <div className="hidden lg:flex items-center justify-between px-6 py-2 bg-[#0f131d] border-b border-white/[0.04] text-xs text-[#bbcabf]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span className="font-semibold text-[#dfe2f1]">Aura Mobile Experience</span>
          <span>• Obsidian Emerald Luxury Design System</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDeviceFrameMode(!deviceFrameMode)}
            className="px-2.5 py-1 rounded bg-[#171b26] hover:bg-[#262a35] text-[#dfe2f1] border border-white/10 flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">devices</span>
            <span>{deviceFrameMode ? 'Full-Width View' : 'iPhone Mockup Frame'}</span>
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
            onNavigate={(screen) => setCurrentScreen(screen)}
            user={user}
            unreadCount={2}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
          />

          {/* Active Screen */}
          <main className="flex-1 overflow-x-hidden">
            {currentScreen === 'dashboard' && (
              <DashboardScreen
                user={user}
                transactions={transactions}
                onOpenQuickAdd={handleOpenQuickAdd}
                onNavigate={(screen) => setCurrentScreen(screen)}
                onSelectTransaction={(tx) => setSelectedTx(tx)}
                onOpenForecastModal={() => setIsNotificationsOpen(true)}
              />
            )}

            {currentScreen === 'analytics' && (
              <AnalyticsScreen onOpenQuickAdd={() => handleOpenQuickAdd()} />
            )}

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
              <ProfileScreen
                user={user}
                cards={cards}
                onOpenAddCard={() => setCurrentScreen('addCard')}
                onUpdateUser={handleUpdateUser}
                onBack={() => setCurrentScreen('dashboard')}
              />
            )}

            {currentScreen === 'addCard' && (
              <AddCardModal
                user={user}
                onClose={() => setCurrentScreen('profile')}
                onSaveCard={handleSaveCard}
              />
            )}
          </main>

          {/* Bottom Navigation */}
          {currentScreen !== 'addCard' && (
            <BottomNav
              currentScreen={currentScreen}
              onNavigate={(screen) => setCurrentScreen(screen)}
              onOpenQuickAdd={() => handleOpenQuickAdd()}
            />
          )}
        </div>
      </div>

      {/* Quick Add Modal */}
      {isQuickAddOpen && (
        <QuickAddModal
          initialType={quickAddType}
          cards={cards}
          user={user}
          onClose={() => setIsQuickAddOpen(false)}
          onSaveTransaction={handleSaveTransaction}
        />
      )}

      {/* Transaction Details Modal */}
      {selectedTx && (
        <TransactionDetailModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onDelete={handleDeleteTransaction}
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
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[#10b981] text-[#002113] font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
