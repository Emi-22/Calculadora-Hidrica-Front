import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/apiClient';
import styles from './ResetPasswordPage.module.css';

import logoInstitucional from '../assets/logo-itl.png';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    
    // Estados del formulario
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
    const [passwordReset, setPasswordReset] = useState(false);
    
    // Estados para validación
    const [errors, setErrors] = useState({});

    // Verificar que haya token en la URL al cargar
    useEffect(() => {
        if (!token) {
            setSubmitMessage({ 
                type: 'error', 
                text: 'Token de recuperación no válido. Por favor, solicita un nuevo enlace.' 
            });
        }
    }, [token]);

    // Redirigir al login después de restablecer contraseña exitosamente
    useEffect(() => {
        if (passwordReset) {
            const redirectTimer = setTimeout(() => {
                navigate('/login');
            }, 3000);
            
            return () => clearTimeout(redirectTimer);
        }
    }, [passwordReset, navigate]);

    // Función para validar el formulario
    const validateForm = () => {
        const newErrors = {};

        if (!password.trim()) {
            newErrors.password = 'La contraseña es requerida';
        } else if (password.length < 8) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
        }

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = 'Confirma tu contraseña';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        // Limpiar mensajes previos
        setSubmitMessage({ type: '', text: '' });
        
        // Validar que haya token
        if (!token) {
            setSubmitMessage({ 
                type: 'error', 
                text: 'Token de recuperación no válido. Por favor, solicita un nuevo enlace.' 
            });
            return;
        }
        
        // Validar formulario antes de enviar
        if (!validateForm()) {
            return;
        }

        // Enviar solicitud al backend
        setIsLoading(true);
        
        try {
            await api.resetPassword(token, password);
            
            setPasswordReset(true);
            setSubmitMessage({ 
                type: 'success', 
                text: 'Tu contraseña ha sido restablecida exitosamente.' 
            });
            // Limpiar formulario después de éxito
            setPassword('');
            setConfirmPassword('');
            setErrors({});
        } catch (error) {
            console.error('Error al restablecer contraseña:', error);
            setSubmitMessage({ 
                type: 'error', 
                text: error.message || 'Error al restablecer la contraseña. El token puede haber expirado. Por favor, solicita un nuevo enlace.' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Función para limpiar errores cuando el usuario empieza a escribir
    const handlePasswordChange = (value) => {
        setPassword(value);
        if (errors.password) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.password;
                return newErrors;
            });
        }
        if (errors.confirmPassword && confirmPassword === value) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.confirmPassword;
                return newErrors;
            });
        }
        if (submitMessage.type) {
            setSubmitMessage({ type: '', text: '' });
        }
    };

    const handleConfirmPasswordChange = (value) => {
        setConfirmPassword(value);
        if (errors.confirmPassword) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.confirmPassword;
                return newErrors;
            });
        }
        if (submitMessage.type) {
            setSubmitMessage({ type: '', text: '' });
        }
    };

    return (
        <div className={styles.pageContainer}>
            
            {/* Logo Institucional */}
            <img src={logoInstitucional} alt="Logo Institucional" className={styles.logo} />

            {/* Contenedor del formulario centrado */}
            <div className={styles.formContainer}>
                
                <h2 className={styles.title}>Restablecer Contraseña</h2> 
                
                {!passwordReset ? (
                    <>
                        {!token ? (
                            <div className={styles.errorContainer}>
                                <p className={styles.errorMessage}>
                                    {submitMessage.text || 'Token de recuperación no válido.'}
                                </p>
                                <Link to="/recuperar" className={styles.linkButton}>
                                    Solicitar nuevo enlace
                                </Link>
                            </div>
                        ) : (
                            <>
                                <p className={styles.description}>
                                    Ingresa tu nueva contraseña. Asegúrate de que tenga al menos 8 caracteres.
                                </p>
                                
                                <form onSubmit={handleSubmit} className={styles.form}>
                                    
                                    {/* --- Campo Nueva Contraseña --- */}
                                    <div className={styles.formGroup}>
                                        <label htmlFor="password" className={styles.label}>Nueva Contraseña:</label>
                                        <input 
                                            type="password" 
                                            id="password"
                                            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                                            placeholder="Mínimo 8 caracteres"
                                            value={password}
                                            onChange={(e) => handlePasswordChange(e.target.value)}
                                        />
                                        {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
                                    </div>

                                    {/* --- Campo Confirmar Contraseña --- */}
                                    <div className={styles.formGroup}>
                                        <label htmlFor="confirmPassword" className={styles.label}>Confirmar Contraseña:</label>
                                        <input 
                                            type="password" 
                                            id="confirmPassword"
                                            className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                                            placeholder="Repite tu contraseña"
                                            value={confirmPassword}
                                            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                                        />
                                        {errors.confirmPassword && <span className={styles.errorMessage}>{errors.confirmPassword}</span>}
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
                                        disabled={isLoading || !token}
                                    >
                                        {isLoading ? (
                                            <span className={styles.buttonContent}>
                                                <span className={styles.spinner}></span>
                                                Restableciendo...
                                            </span>
                                        ) : (
                                            'Restablecer Contraseña'
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
                        )}
                    </>
                ) : (
                    <div className={styles.successContainer}>
                        <div className={styles.successIcon}>✓</div>
                        <p className={styles.successMessage}>
                            {submitMessage.text}
                        </p>
                        <p className={styles.successInstructions}>
                            Serás redirigido al inicio de sesión en unos segundos...
                        </p>
                        <div className={styles.successActions}>
                            <Link to="/login" className={styles.successButton}>
                                Ir al inicio de sesión ahora
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

