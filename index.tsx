
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// HACK: Expose React and ReactDOM to the window object so that UMD libraries like
// Recharts, which expect them to be global, can function correctly with the
// module-based React 19 loaded from the import map.
(window as any).React = React;
(window as any).ReactDOM = ReactDOM;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);