import React from 'react';

import { Greeting } from 'components/greeting';
import { AddTransaction } from 'components/transaction';
import { Balance } from 'components/balance';
import { TransactionList } from 'components/transaction-list';

export const Home = () => {
  return (
    <article className={'article column'}>
      <section className={'section'}>
        <Greeting />
      </section>
      <section className={'section'}>
        <Balance />
      </section>
      <section className={'section'}>
        <TransactionList />
      </section>
      <AddTransaction />
    </article>
  );
};
