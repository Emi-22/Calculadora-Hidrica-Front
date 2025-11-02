// src/App.jsx
import { Outlet, Link } from 'react-router-dom';

// Estilos básicos para el menú (puedes moverlos a un .css)
const navStyles = {
    padding: '1rem',
    backgroundColor: 'rgba(0, 0, 50, 0.5)',
    display: 'flex',
    gap: '2rem',
    justifyContent: 'center'
};

const linkStyles = {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1.2rem'
};

function App() {
  return (
    <div className="app-container">
      {/* RF10: Menú superior con enlaces */}
      <nav style={navStyles}>
        <Link to="/registro" style={linkStyles}>
          Registro
        </Link>
        <Link to="/preguntas" style={linkStyles}>
          Preguntas
        </Link>
        <Link to="/usuarios" style={linkStyles}>
          Usuarios
        </Link>
      </nav>

      <main>
        {/* RF11: Aquí se renderizará el componente de la ruta activa */}
        <Outlet />
      </main>
    </div>
  );
}

export default App;