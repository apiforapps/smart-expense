import React, { useState, Fragment } from 'react';
import { LayersPlus, X } from 'lucide-react';
import { useUser } from '@clerk/react';

import { TransactionFormData } from './types';
import { createTransaction } from './api';
import './Transaction.scss';

export const AddTransaction = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Fragment>
      <button
        className={'open-transaction-modal-button'}
        onClick={() => setIsModalOpen(true)}
        aria-label={'Add transaction'}
      >
        <LayersPlus size={40} />
      </button>

      {isModalOpen && (
        <TransactionModal onClose={() => setIsModalOpen(false)} />
      )}
    </Fragment>
  );
};

interface TransactionModalProps {
  onClose: () => void;
}

const INITIAL_FORM: TransactionFormData = {
  amount: '',
  description: '',
  type: 'expense',
};

const TransactionModal = ({ onClose }: TransactionModalProps) => {
  const { user } = useUser();
  const [form, setForm] = useState<TransactionFormData>(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(form.amount);
    if (!form.amount || isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createTransaction(user.id, form);
      setForm(INITIAL_FORM);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={'transaction-modal-overlay'}
      onClick={handleOverlayClick}
      role={'dialog'}
      aria-modal={'true'}
      aria-labelledby={'modal-title'}
    >
      <div className={'transaction-modal'}>
        <div className={'transaction-modal-header'}>
          <h3 id={'modal-title'}>Add transaction</h3>
          <button
            className={'close-transaction-modal-button'}
            onClick={onClose}
            aria-label={'Close modal'}
          >
            <X size={20} />
          </button>
        </div>

        <form className={'transaction-modal-form'} onSubmit={handleSubmit} noValidate>
          {/* Type toggle */}
          <div className={'transaction-type-toggle'}>
            <button
              type={'button'}
              className={`transaction-type-btn${form.type === 'expense' ? ' active expense' : ''}`}
              onClick={() => setForm((prev) => ({ ...prev, type: 'expense' }))}
            >
              Expense
            </button>
            <button
              type={'button'}
              className={`transaction-type-btn${form.type === 'income' ? ' active income' : ''}`}
              onClick={() => setForm((prev) => ({ ...prev, type: 'income' }))}
            >
              Income
            </button>
          </div>

          {/* Amount */}
          <div className={'transaction-form-group'}>
            <label className={'transaction-form-label'} htmlFor={'amount'}>
              Amount
            </label>
            <div className={'transaction-amount-wrapper'}>
              <span className={'transaction-currency'}>{form.type === 'expense' ? '−' : '+'}</span>
              <input
                id={'amount'}
                type={'number'}
                name={'amount'}
                className={'transaction-form-input'}
                placeholder={'0.00'}
                min={'0.01'}
                step={'0.01'}
                value={form.amount}
                onChange={handleChange}
                autoFocus
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className={'transaction-form-group'}>
            <label className={'transaction-form-label'} htmlFor={'description'}>
              Description <span className={'optional'}>(optional)</span>
            </label>
            <textarea
              id={'description'}
              name={'description'}
              className={'transaction-form-textarea'}
              placeholder={'What was this for?'}
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {error && (
            <p className={'transaction-error'} role={'alert'}>
              {error}
            </p>
          )}

          <button
            type={'submit'}
            className={'transaction-submit-button'}
            disabled={isLoading}
          >
            {isLoading ? 'Saving…' : 'Save transaction'}
          </button>
        </form>
      </div>
    </div>
  );
};
