// --- index.tsx ---
// This is the main entry point for the React application.

// Import polyfills first to ensure they're loaded before any other code
import './polyfills';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Import the main App component

// Find the root DOM element where the React app will be mounted.
// This element is defined in index.html.
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Create a React root for the concurrent mode API.
const root = ReactDOM.createRoot(rootElement);

// Render the main App component into the root element.
// React.StrictMode is a wrapper that helps with highlighting potential problems in an application.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
