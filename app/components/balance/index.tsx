import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

import { BalanceData } from './types';
import { fetchBalance } from './api';
import './Balance.scss';

const formatAmount = (value: number): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const Balance = () => {
  const [data, setData] = useState<BalanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBalance = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const balance = await fetchBalance();
      setData(balance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load balance');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  useEffect(() => {
    const handleCreated = () => loadBalance();
    window.addEventListener('transaction-created', handleCreated);
    window.addEventListener('transaction-deleted', handleCreated);
    return () => {
      window.removeEventListener('transaction-created', handleCreated);
      window.removeEventListener('transaction-deleted', handleCreated);
    };
  }, [loadBalance]);

  if (isLoading) {
    return (
      <div className={'balance-card'}>
        <div className={'balance-skeleton'}>
          <div className={'skeleton-line skeleton-title'} />
          <div className={'skeleton-line skeleton-amount'} />
          <div className={'balance-breakdown'}>
            <div className={'skeleton-line skeleton-item'} />
            <div className={'skeleton-line skeleton-item'} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={'balance-card'}>
        <p className={'balance-error'}>{error}</p>
        <button className={'balance-retry-button'} onClick={loadBalance}>
          Try again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const isPositive = data.balance >= 0;

  return (
    <div className={'balance-card'}>
      <span className={'balance-label'}>Total balance</span>
      <h2 className={`balance-amount${isPositive ? '' : ' negative'}`}>
        ${formatAmount(data.balance)}
      </h2>

      <div className={'balance-breakdown'}>
        <div className={'balance-item income'}>
          <div className={'balance-item-icon income'}>
            <TrendingUp size={16} />
          </div>
          <div className={'balance-item-info'}>
            <span className={'balance-item-label'}>Income</span>
            <span className={'balance-item-value income'}>
              +${formatAmount(data.income)}
            </span>
          </div>
        </div>

        <div className={'balance-divider'} />

        <div className={'balance-item expense'}>
          <div className={'balance-item-icon expense'}>
            <TrendingDown size={16} />
          </div>
          <div className={'balance-item-info'}>
            <span className={'balance-item-label'}>Expenses</span>
            <span className={'balance-item-value expense'}>
              -${formatAmount(data.expenses)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
