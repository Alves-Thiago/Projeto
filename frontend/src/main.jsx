// Importa React e o método de montagem da aplicação no HTML.
import React from 'react';
import { createRoot } from 'react-dom/client';
// Importa o componente principal e os estilos globais.
import App from './App.jsx';
import './styles.css';

// Renderiza a SPA dentro do elemento root definido no index.html.
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
