// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Importa los estilos globales (Vite ya lo incluye)
import './index.css';

// Importa los componentes de las rutas
import App from './App.jsx'; // El layout principal
import RegistroPage from './pages/RegistroPage.jsx';
import PreguntasPage from './pages/PreguntasPage.jsx';
import UsuariosPage from './pages/UsuariosPage.jsx';

// RNF01: Implementación del enrutamiento
const router = createBrowserRouter([
  {
    path: '/',          // La ruta raíz
    element: <App />,   // Renderiza el layout principal (con el menú)
    children: [         // Rutas "hijas" que se renderizan dentro del <Outlet>
      {
        path: 'registro',
        element: <RegistroPage />,
      },
      {
        path: 'preguntas',
        element: <PreguntasPage />,
      },
      {
        path: 'usuarios',
        element: <UsuariosPage />,
      },
      {
        // Opcional: Una ruta "índice" que se muestre en "/"
        // Por ejemplo, redirigir a la página de registro
        index: true, 
        element: <RegistroPage />
      }
    ],
  },
]);

// Inicia la aplicación
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);