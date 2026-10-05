export interface Transaction {
  id: string;
  merchant: string;
  category: string;
  categoryType: 'TRANSPORT' | 'GROCERIES' | 'SOFTWARE' | 'SALARY' | 'FOOD' | 'SHOPPING' | 'BILLS' | 'ENTERTAINMENT' | 'HEALTH' | 'OTHER';
  amount: number; // positive for income, negative for expense
  date: string; // ISO or human format
  dateGroup: 'TODAY' | 'YESTERDAY' | 'OCTOBER 21' | 'EARLIER';
  time: string;
  account: string;
  status: 'completed' | 'pending';
  icon: string; // Material symbol or Lucide icon name
  notes?: string;
  isRecurring?: boolean;
  recurringDurationMonths?: number; // How many months it recurs for (e.g. 3, 6, 12)
  recurringFrequency?: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  monthlyEquivalent?: number; // Smart monthly impact calculated based on amount & frequency
  totalCommitment?: number; // Total spending across the recurring period
  remainingCycles?: number;
  cycleEndDate?: string;
}

export interface PaymentCard {
  id: string;
  bankName: string;
  variant: string;
  cardholderName: string;
  cardNumber: string; // 16 digits
  last4: string;
  expiry: string; // MM/YY
  network: 'VISA' | 'MASTERCARD' | 'RUPAY' | 'AMEX';
  type: 'credit' | 'debit';
  creditLimit?: number;
  unbilledSpend?: number;
  statementDate?: string;
  dueDate?: string;
  availableBalance?: number;
  isDefault?: boolean;
  colorTheme?: string;
}

export interface BudgetItem {
  id: string;
  name: string;
  category: string;
  allocated: number;
  spent: number;
  statusText: string;
  statusType: 'normal' | 'warning' | 'exceeded';
  icon: string;
  color: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  subtitle: string;
  currentAmount: number;
  targetAmount: number;
  targetDate: string;
  monthlyDeposit?: number;
  tier?: string;
  isMilestone?: boolean;
  autoSave?: boolean;
  monthsLeft?: number;
  color: string;
  icon: string;
}

export interface UserProfile {
  name: string;
  email: string;
  tier: string;
  avatarUrl: string;
  monthlyBaseIncome: number;
  salarySchedule: string;
  sideStreams: number;
  sideStreamLabel: string;
  budgetRatio: {
    needsPercent: number;
    needsAmount: number;
    wantsPercent: number;
    wantsAmount: number;
    savingsPercent: number;
    savingsAmount: number;
    totalTarget: number;
  };
  billRemindersActive: boolean;
  highValueThreshold: number;
  defaultCardId: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  createdAt?: string;
  toolExecutions?: {
    tool: string;
    summary: string;
    icon: string;
    success: boolean;
    transactionId?: string;
  }[];
}

