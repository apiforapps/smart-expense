import React from 'react';
import { useUser } from '@clerk/react';
import { LayersPlus } from 'lucide-react';

import { Guest } from 'components/guest';
import { Greeting } from 'components/greeting';
import { AddTransaction } from 'components/transaction';

export const Home = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return null;
  }

  if (!user) {
    return <Guest />;
  }

  return (
    <article className={'article column'}>
      <section className={'section'}>
        <Greeting />
      </section>
      <AddTransaction />
    </article>
  );
};
