import { GoogleGenAI, Type, FunctionDeclaration, Tool } from '@google/genai';

// Tools that Gemini can call to execute actions in the UI
const functionDeclarations: FunctionDeclaration[] = [
  {
    name: 'addTransaction',
    description: 'Record an expense, bill, or income into the ledger. Expense or bill amounts MUST be negative (e.g. -500). Income amounts MUST be positive (e.g. 50000).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        merchant: {
          type: Type.STRING,
          description: 'The payee, merchant, or income description (e.g. Starbucks, Electricity Bill, Salary Deposit, Netflix).',
        },
        amount: {
          type: Type.NUMBER,
          description: 'Amount in INR. NEGATIVE for expenses or bills (e.g. -1200), POSITIVE for earnings or income (e.g. 15000).',
        },
        category: {
          type: Type.STRING,
          description: 'Friendly category (e.g. Food & Dining, Utilities, Groceries, Shopping, Travel, Salary, Entertainment).',
        },
        categoryType: {
          type: Type.STRING,
          description: 'One of: FOOD, GROCERIES, BILLS, SHOPPING, ENTERTAINMENT, TRANSPORT, HEALTH, INVESTMENT, SALARY, FREELANCE, OTHER',
        },
        isRecurring: {
          type: Type.BOOLEAN,
          description: 'True if this is a recurring bill or subscription.',
        },
        recurringFrequency: {
          type: Type.STRING,
          description: 'Frequency such as Monthly, Weekly, Yearly, or Bi-weekly.',
        },
        notes: {
          type: Type.STRING,
          description: 'Optional note, memo, or bill reminder context.',
        },
      },
      required: ['merchant', 'amount'],
    },
  },
  {
    name: 'deleteTransaction',
    description: 'Delete or remove a transaction or bill entry from the ledger.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        merchant: {
          type: Type.STRING,
          description: 'Name or description of the merchant/bill to delete (e.g. Starbucks, Electricity Bill).',
        },
        transactionId: {
          type: Type.STRING,
          description: 'Optional specific transaction ID if known.',
        },
      },
      required: ['merchant'],
    },
  },
  {
    name: 'addPaymentCard',
    description: 'Add a new bank debit or credit card to the Card Vault.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        bankName: {
          type: Type.STRING,
          description: 'Bank name (e.g. HDFC Bank, ICICI Bank, State Bank of India, Axis Bank, Kotak Mahindra Bank).',
        },
        variant: {
          type: Type.STRING,
          description: 'Card name or label (e.g. Millennia, Coral Credit, Salary Account, Infinite Debit).',
        },
        last4: {
          type: Type.STRING,
          description: 'Last 4 digits of the card (e.g. 3042).',
        },
        type: {
          type: Type.STRING,
          description: 'Type: "credit" or "debit".',
        },
        availableBalance: {
          type: Type.NUMBER,
          description: 'Current available balance or limit in INR.',
        },
      },
      required: ['bankName', 'last4', 'type'],
    },
  },
  {
    name: 'addOrUpdateBudget',
    description: 'Create or update a monthly budget envelope limit.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: 'Name of the budget envelope (e.g. Groceries & Essentials, Food & Dining, Travel, Shopping).',
        },
        category: {
          type: Type.STRING,
          description: 'Category key: GROCERIES, FOOD, BILLS, SHOPPING, ENTERTAINMENT, TRANSPORT, OTHER',
        },
        allocatedAmount: {
          type: Type.NUMBER,
          description: 'Monthly allocated limit in INR (e.g. 15000).',
        },
      },
      required: ['name', 'allocatedAmount'],
    },
  },
  {
    name: 'updateUserProfile',
    description: 'Update the user settings, monthly base salary, pay schedule, or bill reminders.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: 'User moniker or display name.',
        },
        monthlyBaseIncome: {
          type: Type.NUMBER,
          description: 'Monthly take-home income in INR.',
        },
        salarySchedule: {
          type: Type.STRING,
          description: 'Salary deposit schedule (e.g. 1st of every month, 5th of every month, Last working day).',
        },
        billRemindersActive: {
          type: Type.BOOLEAN,
          description: 'Enable or disable bill reminder alerts.',
        },
      },
    },
  },
  {
    name: 'navigateScreen',
    description: 'Navigate the application to a specific section.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        screen: {
          type: Type.STRING,
          description: 'Screen to navigate to: dashboard, analytics, budgets, transactions, profile, addCard',
        },
      },
      required: ['screen'],
    },
  },
];

const tools: Tool[] = [{ functionDeclarations }];

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is missing. In Vercel Project Settings > Environment Variables, add GEMINI_API_KEY and redeploy.',
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { messages, context } = body;
    const selectedModel = 'gemini-3.1-flash-lite';

    const contents = (messages || []).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text || '' }],
    }));

    const systemInstruction = `You are Aura Assistant, a professional personal financial assistant.
You can execute ANY action requested by the user directly via tools:
- addTransaction: Add expenses (use NEGATIVE amounts, e.g. -450), bills (isRecurring: true, negative amounts), or income (POSITIVE amounts, e.g. 20000).
- deleteTransaction: Remove a transaction or bill entry.
- addPaymentCard: Add credit/debit cards to Card Vault.
- addOrUpdateBudget: Set or tweak envelope limits.
- updateUserProfile: Change salary, pay cycle, or preferences.
- navigateScreen: Switch views (dashboard, analytics, assistant, transactions, profile, addCard).

LIVE USER DATA:
- Name: ${context?.user?.name || 'Aura Member'}
- Monthly Take-Home: ₹${context?.user?.monthlyBaseIncome?.toLocaleString('en-IN') || '1,00,000'}/mo
- Cards: ${context?.cards?.map((c: any) => `${c.bankName} (${c.type}, ••${c.last4}, ₹${c.availableBalance?.toLocaleString('en-IN')})`).join(', ') || 'None'}
- Budgets: ${context?.budgets?.map((b: any) => `${b.name}: ₹${b.spent}/${b.allocated}`).join(', ') || 'Standard'}
- Recent transactions: ${context?.transactions?.slice(0, 5)?.map((t: any) => `${t.merchant} (₹${t.amount})`).join(', ') || 'None'}
- Current View: ${context?.currentScreen || 'dashboard'}

Style:
- Professional, concise, executive tone.
- When calling tools, explain what was done clearly and confirm amounts in ₹ INR.`;

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction,
        tools,
      },
    });

    const text = response.text || '';
    const functionCalls = response.functionCalls || [];

    return res.status(200).json({
      text,
      functionCalls,
    });
  } catch (error: any) {
    console.error('Gemini API Error in Vercel function:', error);
    return res.status(500).json({
      error: error?.message || 'Chat generation failed',
    });
  }
}
