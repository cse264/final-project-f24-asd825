import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import ColorSchemeContext from './ColorSchemeContext';
import App from './App.jsx';
import { MantineProvider, ColorSchemeScript  } from '@mantine/core';
import '@mantine/carousel/styles.css';
import '@mantine/core/styles.css';

function Main() {
  
  // Toggle between light and dark themes

  return (
    <>
    <ColorSchemeScript forceColorScheme="dark" />
    <MantineProvider forceColorScheme="dark">
        <App />
      </MantineProvider>
      </>
  );
}

createRoot(document.getElementById('root')).render(

    <Main />
);
