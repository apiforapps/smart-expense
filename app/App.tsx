import React from 'react';
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';

// Update the path below to the actual location of MainLayout, for example:
import { Layout } from 'components/ui/Layout';
import { Home } from 'pages/Home';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path={'/'} element={<Layout />}>
      <Route index element={<Home />} />
    </Route>,
  ),
);

export const App = () => {
  return <RouterProvider router={router} />;
};
