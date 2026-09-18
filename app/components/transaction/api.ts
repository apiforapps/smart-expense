import { Transaction, TransactionFormData } from './types';
import { addTransactionRecord } from 'services/db';

export const createTransaction = async (
  data: TransactionFormData,
  userId?: string,
): Promise<Transaction> => {
  const amount =
    data.type === 'expense'
      ? -Math.abs(parseFloat(data.amount))
      : Math.abs(parseFloat(data.amount));

  return addTransactionRecord(
    amount,
    data.description || null,
    userId,
  );
};
