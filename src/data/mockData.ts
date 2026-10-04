import { Transaction, PaymentCard, BudgetItem, SavingsGoal, UserProfile } from '../types';

export const INITIAL_USER: UserProfile = {
  name: 'Guest User',
  email: 'guest@device.local',
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

export const AURA_LOGO_URL = 'https://lh3.googleusercontent.com/aida/AEtjO1XxFa10o-zeBBIu1iYnKzjQSXJIrL1WrFJkvlZlhlVA8e3lzaQAsGiXEpzcFA_vGgzo1NYKsxQW--SkirwXwKTD3VVy-m3mKhxGuTZmySeYsFS8dey59W_M4Gx75UGEtUMS9CST1AmYPMOj5HYIem36XLq3c48tSPfxUZS6E-aoYXeRdM-X2LJx0TxcW2jl2_g6sjHS9ssKhxdudgUQn5rRgBqfBeJvv36tSjp8OUAwe_g7PvVQHjXBPzQ';
