import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './RegistroPage.module.css';

import logoInstitucional from '../assets/logo-itl.png';

export default function RegistroPage() {
    // Estados del formulario
    const [correo, setCorreo] = useState('');
    const [sexo, setSexo] = useState('');
    const [nivelEducativo, setNivelEducativo] = useState('');
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    
    // Estados para validación y feedback
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

    // Función para validar formato de correo electrónico
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Función para validar todos los campos
    const validateForm = () => {
        const newErrors = {};

        // Validar correo electrónico
        if (!correo.trim()) {
            newErrors.correo = 'El correo electrónico es requerido';
        } else if (!validateEmail(correo)) {
            newErrors.correo = 'El correo no es válido';
        }

        // Validar contraseña
        if (!contrasena.trim()) {
            newErrors.contrasena = 'La contraseña es requerida';
        } else if (contrasena.length < 8) {
            newErrors.contrasena = 'La contraseña debe tener al menos 8 caracteres';
        }

        // Validar otros campos requeridos
        if (!sexo) {
            newErrors.sexo = 'Por favor selecciona tu sexo';
        }

        if (!nivelEducativo) {
            newErrors.nivelEducativo = 'Por favor selecciona tu nivel educativo';
        }

        if (!usuario.trim()) {
            newErrors.usuario = 'El usuario es requerido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        // Limpiar mensajes previos
        setSubmitMessage({ type: '', text: '' });
        
        // Validar formulario antes de enviar
        if (!validateForm()) {
            return;
        }

        // Simular envío con estado de carga
        setIsLoading(true);
        
        try {
            // Simular espera de 1-2 segundos
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Simular respuesta del servidor (aquí puedes cambiar la lógica según tu necesidad)
            // Por ejemplo, simular que el usuario ya existe
            const simulateSuccess = Math.random() > 0.3; // 70% de éxito
            
            if (simulateSuccess) {
                setSubmitMessage({ 
                    type: 'success', 
                    text: '¡Registro exitoso!' 
                });
                // Limpiar formulario después de éxito
                setCorreo('');
                setSexo('');
                setNivelEducativo('');
                setUsuario('');
                setContrasena('');
                setErrors({});
            } else {
                setSubmitMessage({ 
                    type: 'error', 
                    text: 'El usuario ya existe' 
                });
            }
            
            console.log('Datos listos para enviar al backend:');
            console.log({ correo, sexo, nivelEducativo, usuario, contrasena });
        } catch (error) {
            setSubmitMessage({ 
                type: 'error', 
                text: 'Ocurrió un error. Por favor intenta nuevamente.' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Función para limpiar errores cuando el usuario empieza a escribir
    const handleFieldChange = (field, value, setter) => {
        setter(value);
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
        // Limpiar mensaje de éxito/error al modificar campos
        if (submitMessage.type) {
            setSubmitMessage({ type: '', text: '' });
        }
    };

    return (
        <div className={styles.pageContainer}>
            
            {/* 2. USA TU LOGO IMPORTADO */}
            <img src={logoInstitucional} alt="Logo Institucional" className={styles.logo} />

            {/* Contenedor del formulario centrado */}
            <div className={styles.formContainer}>
                
                <h2 className={styles.title}>Regístrate</h2> 
                
                <form onSubmit={handleSubmit} className={styles.form}>
                    
                    {/* --- Campo Correo (Ocupa 2 columnas en PC) --- */}
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label htmlFor="correo" className={styles.label}>Correo Electrónico:</label>
                        <input 
                            type="email" 
                            id="correo"
                            className={`${styles.input} ${errors.correo ? styles.inputError : ''}`}
                            placeholder="tu@correo.com"
                            value={correo}
                            onChange={(e) => handleFieldChange('correo', e.target.value, setCorreo)}
                        />
                        {errors.correo && <span className={styles.errorMessage}>{errors.correo}</span>}
                    </div>

                    {/* --- Campo Sexo (Ocupa 1 columna en PC) --- */}
                    <div className={styles.formGroup}>
                        <label htmlFor="sexo" className={styles.label}>Sexo:</label>
                        <select 
                            id="sexo"
                            className={`${styles.select} ${errors.sexo ? styles.inputError : ''}`}
                            value={sexo}
                            onChange={(e) => handleFieldChange('sexo', e.target.value, setSexo)}
                        >
                            <option value="" disabled>Elige...</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                        </select>
                        {errors.sexo && <span className={styles.errorMessage}>{errors.sexo}</span>}
                    </div>

                    {/* --- Campo Nivel Educativo (Ocupa 1 columna en PC) --- */}
                    <div className={styles.formGroup}>
                        <label htmlFor="nivel" className={styles.label}>Nivel educativo:</label>
                        <select 
                            id="nivel"
                            className={`${styles.select} ${errors.nivelEducativo ? styles.inputError : ''}`}
                            value={nivelEducativo}
                            onChange={(e) => handleFieldChange('nivelEducativo', e.target.value, setNivelEducativo)}
                        >
                            <option value="" disabled>Elige...</option>
                            <option value="Basica">Basica</option>
                            <option value="Media Superior">Media Superior</option>
                            <option value="Superior">Superior</option>
                        </select>
                        {errors.nivelEducativo && <span className={styles.errorMessage}>{errors.nivelEducativo}</span>}
                    </div>

                    {/* --- Campo Usuario (Ocupa 2 columnas en PC) --- */}
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label htmlFor="usuario" className={styles.label}>Usuario:</label>
                        <input 
                            type="text" 
                            id="usuario"
                            className={`${styles.input} ${errors.usuario ? styles.inputError : ''}`}
                            placeholder="Tu nombre de usuario"
                            value={usuario}
                            onChange={(e) => handleFieldChange('usuario', e.target.value, setUsuario)}
                        />
                        {errors.usuario && <span className={styles.errorMessage}>{errors.usuario}</span>}
                    </div>

                    {/* --- Campo Contraseña (Ocupa 2 columnas en PC) --- */}
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label htmlFor="contrasena" className={styles.label}>Contraseña:</label>
                        <input 
                            type="password" 
                            id="contrasena"
                            className={`${styles.input} ${errors.contrasena ? styles.inputError : ''}`}
                            placeholder="••••••••"
                            value={contrasena}
                            onChange={(e) => handleFieldChange('contrasena', e.target.value, setContrasena)}
                        />
                        {errors.contrasena && <span className={styles.errorMessage}>{errors.contrasena}</span>}
                    </div>

                    {/* --- Mensaje de éxito/error --- */}
                    {submitMessage.type && (
                        <div className={`${styles.submitMessage} ${styles[submitMessage.type]}`}>
                            {submitMessage.text}
                        </div>
                    )}

                    {/* --- Botones (Ocupan 2 columnas en PC) --- */}
                    <button 
                        type="submit" 
                        className={`${styles.submitButton} ${styles.fullWidth}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className={styles.buttonContent}>
                                <span className={styles.spinner}></span>
                                Enviando...
                            </span>
                        ) : (
                            'Registrarse'
                        )}
                    </button>
                    <Link 
                        to="/login" 
                        className={`${styles.secondaryButton} ${styles.fullWidth} ${styles.linkButton}`}
                    >
                        Ya tengo cuenta
                    </Link> 
                </form>
            </div>
        </div>
    );
}