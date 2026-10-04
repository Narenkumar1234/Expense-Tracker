import { UserProfile, Transaction, PaymentCard, BudgetItem, SavingsGoal } from '../types';

const STORAGE_KEYS = {
  HAS_ONBOARDED: 'aura_has_onboarded',
  USER_PROFILE: 'aura_user_profile',
  TRANSACTIONS: 'aura_transactions',
  CARDS: 'aura_cards',
  BUDGETS: 'aura_budgets',
  SAVINGS_GOALS: 'aura_savings_goals',
};

export const DEFAULT_GUEST_USER: UserProfile = {
  name: 'Guest User',
  email: 'guest@device.local',
  tier: 'Standard',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
  monthlyBaseIncome: 0,
  salarySchedule: '1st of every month',
  sideStreams: 0,
  sideStreamLabel: 'None',
  budgetRatio: {
    needsPercent: 50,
    needsAmount: 0,
    wantsPercent: 30,
    wantsAmount: 0,
    savingsPercent: 20,
    savingsAmount: 0,
    totalTarget: 0,
  },
  billRemindersActive: true,
  highValueThreshold: 10000,
  defaultCardId: '',
};

export const storage = {
  hasOnboarded(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED) === 'true';
    } catch {
      return false;
    }
  },

  setOnboarded(value: boolean = true) {
    try {
      localStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, String(value));
    } catch {}
  },

  getUser(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (data) return JSON.parse(data);
    } catch {}
    return DEFAULT_GUEST_USER;
  },

  setUser(user: UserProfile) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
    } catch {}
  },

  getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (data) return JSON.parse(data);
    } catch {}
    return [];
  },

  setTransactions(transactions: Transaction[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch {}
  },

  getCards(): PaymentCard[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CARDS);
      if (data) return JSON.parse(data);
    } catch {}
    return [];
  },

  setCards(cards: PaymentCard[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
    } catch {}
  },

  getBudgets(): BudgetItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (data) return JSON.parse(data);
    } catch {}
    return [];
  },

  setBudgets(budgets: BudgetItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    } catch {}
  },

  getSavingsGoals(): SavingsGoal[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS);
      if (data) return JSON.parse(data);
    } catch {}
    return [];
  },

  setSavingsGoals(goals: SavingsGoal[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(goals));
    } catch {}
  },

  clearAll() {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    } catch {}
  },
};
