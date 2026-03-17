import React, { Fragment } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from 'components/header';

export const Layout = () => {
  return (
    <Fragment>
      <Header />
      <main className="main">
        <Outlet />
      </main>
    </Fragment>
  );
};
