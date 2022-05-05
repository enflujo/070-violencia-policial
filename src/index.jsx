import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store';
import App from './components/App.jsx';

const raiz = createRoot(document.getElementById('explore-app'));
raiz.render(
  <Provider store={store}>
    <App />
  </Provider>
);
