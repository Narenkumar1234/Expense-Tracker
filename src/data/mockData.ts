import { Transaction, PaymentCard, BudgetItem, SavingsGoal, UserProfile } from '../types';

export const INITIAL_USER: UserProfile = {
  name: '',
  email: '',
  tier: 'Personal',
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

export const INITIAL_CARDS: PaymentCard[] = [];

export const INITIAL_BUDGETS: BudgetItem[] = [];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const AURA_LOGO_URL = '/aura-glow-logo.svg';

export const AURA_ASSISTANT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';

