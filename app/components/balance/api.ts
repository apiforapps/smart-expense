import { BalanceData } from './types';
import { getBalanceByUserId } from 'services/db';

export const fetchBalance = async (
  userId?: string,
): Promise<BalanceData> => {
  return getBalanceByUserId(userId);
};
