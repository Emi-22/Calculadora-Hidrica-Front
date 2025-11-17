import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/apiClient';
import styles from './RecuperarPasswordPage.module.css';

import logoInstitucional from '../assets/logo-itl.png';

export default function RecuperarPasswordPage() {
    // Estados del formulario
    const [correo, setCorreo] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
    const [emailSent, setEmailSent] = useState(false);
    
    // Estados para validación
    const [errors, setErrors] = useState({});

    // Función para validar formato de correo electrónico
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Función para validar el formulario
    const validateForm = () => {
        const newErrors = {};

        if (!correo.trim()) {
            newErrors.correo = 'El correo electrónico es requerido';
        } else if (!validateEmail(correo)) {
            newErrors.correo = 'El correo no es válido';
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

        // Enviar solicitud al backend
        setIsLoading(true);
        
        try {
            await api.forgotPassword(correo);
            
            setEmailSent(true);
            setSubmitMessage({ 
                type: 'success', 
                text: 'Si el correo existe, se ha enviado un enlace de recuperación a tu correo electrónico.' 
            });
            // Limpiar formulario después de éxito
            setCorreo('');
            setErrors({});
        } catch (error) {
            console.error('Error al solicitar recuperación:', error);
            setSubmitMessage({ 
                type: 'error', 
                text: error.message || 'Ocurrió un error. Por favor intenta nuevamente.' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Función para limpiar errores cuando el usuario empieza a escribir
    const handleFieldChange = (value) => {
        setCorreo(value);
        if (errors.correo) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.correo;
                return newErrors;
            });
        }
        // Limpiar mensaje de éxito/error al modificar campos
        if (submitMessage.type) {
            setSubmitMessage({ type: '', text: '' });
        }
        if (emailSent) {
            setEmailSent(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            
            {/* Logo Institucional */}
            <img src={logoInstitucional} alt="Logo Institucional" className={styles.logo} />

            {/* Contenedor del formulario centrado */}
            <div className={styles.formContainer}>
                
                <h2 className={styles.title}>Recuperar Contraseña</h2> 
                
                {!emailSent ? (
                    <>
                        <p className={styles.description}>
                            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                        </p>
                        
                        <form onSubmit={handleSubmit} className={styles.form}>
                            
                            {/* --- Campo Correo Electrónico --- */}
                            <div className={styles.formGroup}>
                                <label htmlFor="correo" className={styles.label}>Correo Electrónico:</label>
                                <input 
                                    type="email" 
                                    id="correo"
                                    className={`${styles.input} ${errors.correo ? styles.inputError : ''}`}
                                    placeholder="tu@correo.com"
                                    value={correo}
                                    onChange={(e) => handleFieldChange(e.target.value)}
                                />
                                {errors.correo && <span className={styles.errorMessage}>{errors.correo}</span>}
                            </div>

                            {/* --- Mensaje de éxito/error --- */}
                            {submitMessage.type && (
                                <div className={`${styles.submitMessage} ${styles[submitMessage.type]}`}>
                                    {submitMessage.text}
                                </div>
                            )}

                            {/* --- Botón de Enviar --- */}
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
                                    'Enviar enlace de recuperación'
                                )}
                            </button>

                            {/* --- Enlace de regreso a Login --- */}
                            <div className={styles.backLink}>
                                <Link to="/login" className={styles.link}>
                                    ← Volver al inicio de sesión
                                </Link>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className={styles.successContainer}>
                        <div className={styles.successIcon}>✓</div>
                        <p className={styles.successMessage}>
                            {submitMessage.text}
                        </p>
                        <p className={styles.successInstructions}>
                            Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
                        </p>
                        <div className={styles.successActions}>
                            <Link to="/login" className={styles.successButton}>
                                Volver al inicio de sesión
                            </Link>
                            <button 
                                onClick={() => {
                                    setEmailSent(false);
                                    setSubmitMessage({ type: '', text: '' });
                                }}
                                className={styles.secondaryButton}
                            >
                                Enviar a otro correo
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

