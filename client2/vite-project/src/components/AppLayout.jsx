import React from 'react';
import { Outlet } from 'react-router-dom';
import HeaderSimple from './Header/HeaderSimple';
import { AppShell, Title } from '@mantine/core';

const AppLayout = () => {
console.log(12)
  return (
    <>
    
            <HeaderSimple/>
      {/* Render the current route's content */}
      <Outlet />
    </>
  );
};

export default AppLayout;

