import { useState } from 'react';
import styles from './RegistroPage.module.css';


import logoInstitucional from '../assets/logo-itl.png';


// const LOGO_PLACEHOLDER = 'https://placehold.co/150x70/004a99/FFF?text=Logo+ITL';

export default function RegistroPage() {
    
   
    const [correo, setCorreo] = useState('');
    const [sexo, setSexo] = useState('');
    const [nivelEducativo, setNivelEducativo] = useState('');
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault(); 
        console.log('Datos listos para enviar al backend:');
        console.log({ correo, sexo, nivelEducativo, usuario, contrasena });
    };

    return (
        <div className={styles.pageContainer}>
            
            {/* 2. USA TU LOGO IMPORTADO */}
            <img src={logoInstitucional} alt="Logo Institucional" className={styles.logo} />

            {/* Contenedor del formulario centrado */}
            <div className={styles.formContainer}>
                
                <h2 className={styles.title}>Regístrate</h2> 
                
{/* ... (el resto del archivo jsx no cambia) ... */}
                <img 
                    src="https://placedog.net/120/120" 
                    alt="Avatar" 
                    className={styles.avatar} 
                />
                
                <form onSubmit={handleSubmit} className={styles.form}>
                    
                    {/* --- Campo Correo (Ocupa 2 columnas en PC) --- */}
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label htmlFor="correo" className={styles.label}>Correo Electrónico:</label>
                        <input 
                            type="email" 
                            id="correo"
                            className={styles.input}
                            placeholder="tu@correo.com"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required 
                        />
                    </div>

                    {/* --- Campo Sexo (Ocupa 1 columna en PC) --- */}
                    <div className={styles.formGroup}>
                        <label htmlFor="sexo" className={styles.label}>Sexo:</label>
                        <select 
                            id="sexo"
                            className={styles.select}
                            value={sexo}
                            onChange={(e) => setSexo(e.target.value)}
                            required
                        >
                            <option value="" disabled>Elige...</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                        </select>
                    </div>

                    {/* --- Campo Nivel Educativo (Ocupa 1 columna en PC) --- */}
                    <div className={styles.formGroup}>
                        <label htmlFor="nivel" className={styles.label}>Nivel educativo:</label>
                        <select 
                            id="nivel"
                            className={styles.select}
                            value={nivelEducativo}
                            onChange={(e) => setNivelEducativo(e.target.value)}
                            required
                        >
                            <option value="" disabled>Elige...</option>
                            <option value="Basica">Basica</option>
                            <option value="Media Superior">Media Superior</option>
                            <option value="Superior">Superior</option>
                        </select>
                    </div>

                    {/* --- Campo Usuario (Ocupa 2 columnas en PC) --- */}
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label htmlFor="usuario" className={styles.label}>Usuario:</label>
                        <input 
                            type="text" 
                            id="usuario"
                            className={styles.input}
                            placeholder="Tu nombre de usuario"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            required
                        />
                    </div>

                    {/* --- Campo Contraseña (Ocupa 2 columnas en PC) --- */}
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label htmlFor="contrasena" className={styles.label}>Contraseña:</label>
                        <input 
                            type="password" 
                            id="contrasena"
                            className={styles.input}
                            placeholder="••••••••"
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            required
                        />
                    </div>

                    {/* --- Botones (Ocupan 2 columnas en PC) --- */}
                    <button type="submit" className={`${styles.submitButton} ${styles.fullWidth}`}>
                        Registrarse
                    </button>
                    <button type="button" className={`${styles.secondaryButton} ${styles.fullWidth}`}>
                        Ya tengo cuenta
                    </button> 
                </form>
            </div>
        </div>
    );
}