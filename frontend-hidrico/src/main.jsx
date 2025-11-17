// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Importa los estilos globales (Vite ya lo incluye)
import './index.css';

// Importa el contexto de autenticación
import { AuthProvider } from './context/AuthContext';

// Importa los componentes de las rutas
import App from './App.jsx'; // El layout principal
import RegistroPage from './pages/RegistroPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RecuperarPasswordPage from './pages/RecuperarPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import PreguntasPage from './pages/PreguntasPage.jsx';
import EstadisticasPage from './pages/EstadisticasPage.jsx';
import UsuariosPage from './pages/UsuariosPage.jsx';
import ProtectedRoute from './components/ProtectedRoute';

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
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'recuperar',
        element: <RecuperarPasswordPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
      {
        path: 'preguntas',
        element: <PreguntasPage />,
      },
      {
        path: 'estadisticas',
        element: (
          <ProtectedRoute requireAdmin={true}>
            <EstadisticasPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'usuarios',
        element: (
          <ProtectedRoute requireAdmin={true}>
            <UsuariosPage />
          </ProtectedRoute>
        ),
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
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);