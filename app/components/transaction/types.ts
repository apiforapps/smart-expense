export type TransactionType = 'income' | 'expense';

export interface TransactionFormData {
  amount: string;
  description: string;
  type: TransactionType;
}

export interface Transaction {
  id: number;
  userId: string;
  amount: number;
  description: string | null;
  createdAt: string;
}
