import { Transaction } from './types';
import {
  getTransactionsByUserId,
  deleteTransactionRecord,
} from 'services/db';

export const fetchTransactions = async (
  userId?: string,
): Promise<Transaction[]> => {
  return getTransactionsByUserId(userId);
};

export const deleteTransaction = async (
  id: number,
  userId?: string,
): Promise<void> => {
  return deleteTransactionRecord(id, userId);
};
