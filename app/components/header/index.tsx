import React, { useEffect } from 'react';
import { SignInButton, UserButton, useAuth, useUser } from '@clerk/react';
import { LogIn, Wallet } from 'lucide-react';
import { syncUser } from './api';
import './Header.scss';

export const Header = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    syncUser(user);
  }, [user]);

  return (
    <header className={'header'}>
      <div className={'logo'}>
        <div className={'logoIcon'}>
          <Wallet size={20} />
        </div>
        Smart Expense
      </div>

      {isSignedIn ? (
        <UserButton />
      ) : (
        <SignInButton mode={'modal'}>
          <button className={'authButton'}>
            <LogIn size={16} />
            Login
          </button>
        </SignInButton>
      )}
    </header>
  );
};
