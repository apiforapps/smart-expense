import React from 'react';
import { Wallet } from 'lucide-react';
import { ThemeToggle } from 'components/theme-toggle';
import './Header.scss';

export const Header = () => {
  return (
    <header className={'header'}>
      <div className={'logo'}>
        <div className={'logoIcon'}>
          <Wallet size={20} />
        </div>
        Smart Expense
      </div>

      <div className={'headerActions'}>
        <ThemeToggle />
      </div>
    </header>
  );
};
