import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { PreferencesProvider } from './lib/preferences';
import { NetworkProvider } from './lib/network';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><BrowserRouter><PreferencesProvider><NetworkProvider><App /></NetworkProvider></PreferencesProvider></BrowserRouter></StrictMode>,
);
