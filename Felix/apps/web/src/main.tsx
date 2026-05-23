import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App.js';
import { initMarketTheme } from './lib/market-theme.js';
import './styles/global.css';

initMarketTheme();

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Elemento #root nao encontrado em index.html');
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
