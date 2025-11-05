export type Transaction = {
  id: string;
  user_id: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  payment_method: 'cash' | 'account';
  description: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
};

export type UserBalance = {
  id: string;
  user_id: string;
  account_balance: number;
  cash_balance: number;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  user_id: string | null;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
  is_default: boolean;
  created_at: string;
};
