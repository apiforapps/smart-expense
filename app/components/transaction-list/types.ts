import { Transaction } from 'components/transaction/types';

export type { Transaction };

export interface TransactionGroup {
  label: string;
  transactions: Transaction[];
}
