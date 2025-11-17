import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/apiClient';
import styles from './RegistroPage.module.css';

import logoInstitucional from '../assets/logo-itl.png';

export default function RegistroPage() {
    const navigate = useNavigate();
    
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

        // Estado de carga
        setIsLoading(true);
        
        try {
            // Preparar datos según lo que espera el backend
            // El backend espera: nombre, email, password, sexo, nivel_educativo
            const registroData = {
                nombre: usuario, // El backend usa "nombre" en lugar de "usuario"
                email: correo,   // El backend usa "email" en lugar de "correo"
                password: contrasena, // El backend usa "password" en lugar de "contrasena"
                sexo: sexo.toLowerCase(), // El backend normaliza a minúsculas
                nivel_educativo: nivelEducativo.toLowerCase().replace(/\s+/g, '_'), // Normalizar espacios
            };
            
            // Llamar al backend para registrar
            const response = await api.registro(registroData);
            
            // Si el registro fue exitoso
            setSubmitMessage({ 
                type: 'success', 
                text: '¡Registro exitoso! Redirigiendo al login...' 
            });
            
            // Limpiar formulario
            setCorreo('');
            setSexo('');
            setNivelEducativo('');
            setUsuario('');
            setContrasena('');
            setErrors({});
            
            // Redirigir al login después de un breve delay
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
        } catch (error) {
            console.error('Error en registro:', error);
            // El backend devuelve mensajes específicos en error.message o error.data.message
            const errorMessage = error.data?.message || error.message || 'Ocurrió un error. Por favor intenta nuevamente.';
            setSubmitMessage({ 
                type: 'error', 
                text: errorMessage 
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
                            <option value="masculino">Masculino</option>
                            <option value="femenino">Femenino</option>
                            <option value="otro">Otro</option>
                            <option value="prefiero_no_decir">Prefiero no decir</option>
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
                            <option value="primaria">Primaria</option>
                            <option value="secundaria">Secundaria</option>
                            <option value="tecnico">Técnico</option>
                            <option value="universitario">Universitario</option>
                            <option value="postgrado">Postgrado</option>
                            <option value="otro">Otro</option>
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