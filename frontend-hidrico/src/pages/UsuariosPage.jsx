// src/pages/UsuariosPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/apiClient';
import styles from './UsuariosPage.module.css';

export default function UsuariosPage() {
    const { user: currentUser } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [searchInput, setSearchInput] = useState(''); // Valor del input (no se usa para filtrar hasta buscar)
    const [searchTerm, setSearchTerm] = useState(''); // Término de búsqueda real usado en el filtro
    const [filterRol, setFilterRol] = useState('todos');
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: 20, totalPages: 0 });
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' o 'edit'
    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [formData, setFormData] = useState({
        usuario: '',
        correo: '',
        contrasena: '',
        rol: 'usuario',
        sexo: '',
        nivelEducativo: ''
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });

    // Función para cargar usuarios desde el backend
    const loadUsuarios = useCallback(async () => {
        setIsLoading(true);
        try {
            const filters = {
                page: pagination.page,
                pageSize: pagination.pageSize
            };
            
            // Agregar filtro de búsqueda si existe
            if (searchTerm.trim()) {
                filters.q = searchTerm.trim();
            }
            
            // Agregar filtro de rol si no es "todos"
            // El backend espera 'admin' pero el frontend usa 'administrador'
            if (filterRol !== 'todos') {
                filters.rol = filterRol === 'administrador' ? 'admin' : filterRol;
            }
            
            const response = await api.getUsuarios(filters);
            
            // Mapear los datos del backend al formato del frontend
            const usuariosMapeados = response.data.map(usuario => ({
                id: usuario.id,
                usuario: usuario.nombre,
                correo: usuario.email,
                rol: usuario.rol === 'admin' ? 'administrador' : usuario.rol, // Mapear 'admin' a 'administrador'
                sexo: usuario.sexo || '',
                nivelEducativo: usuario.nivel_educativo || '',
                fechaRegistro: usuario.fecha_registro
            }));
            
            setUsuarios(usuariosMapeados);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || 'Error al cargar usuarios. Por favor, intenta nuevamente.' 
            });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, filterRol, pagination.page, pagination.pageSize]);

    // Resetear a página 1 cuando cambian los filtros
    useEffect(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
    }, [searchTerm, filterRol]);

    // Cargar usuarios cuando cambian los filtros (sin debounce para búsqueda)
    useEffect(() => {
        loadUsuarios();
    }, [filterRol, pagination.page, pagination.pageSize, loadUsuarios]);

    // Función para ejecutar la búsqueda
    const handleSearch = () => {
        setSearchTerm(searchInput.trim());
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Función para manejar Enter en el input de búsqueda
    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };


    // Validar formulario
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.usuario.trim()) {
            newErrors.usuario = 'El usuario es requerido';
        }
        
        if (!formData.correo.trim()) {
            newErrors.correo = 'El correo es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
            newErrors.correo = 'El correo no es válido';
        }
        
        if (modalMode === 'create' && !formData.contrasena.trim()) {
            newErrors.contrasena = 'La contraseña es requerida';
        } else if (formData.contrasena && formData.contrasena.length < 8) {
            newErrors.contrasena = 'La contraseña debe tener al menos 8 caracteres';
        }
        
        if (!formData.rol) {
            newErrors.rol = 'El rol es requerido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Abrir modal para crear usuario
    const handleCreate = () => {
        setModalMode('create');
        setSelectedUsuario(null);
        setFormData({
            usuario: '',
            correo: '',
            contrasena: '',
            rol: 'usuario',
            sexo: '',
            nivelEducativo: ''
        });
        setErrors({});
        setMessage({ type: '', text: '' });
        setShowModal(true);
    };

    // Abrir modal para editar usuario
    const handleEdit = async (usuario) => {
        try {
            setIsLoading(true);
            // Obtener datos completos del usuario desde el backend
            const usuarioCompleto = await api.getUsuario(usuario.id);
            
            setModalMode('edit');
            setSelectedUsuario(usuario);
            setFormData({
                usuario: usuarioCompleto.nombre || usuario.usuario,
                correo: usuarioCompleto.email || usuario.correo,
                contrasena: '', // No mostrar contraseña
                rol: usuarioCompleto.rol === 'admin' ? 'administrador' : usuarioCompleto.rol || usuario.rol,
                sexo: usuarioCompleto.sexo || usuario.sexo || '',
                nivelEducativo: usuarioCompleto.nivel_educativo || usuario.nivelEducativo || ''
            });
            setErrors({});
            setMessage({ type: '', text: '' });
            setShowModal(true);
        } catch (error) {
            console.error('Error al cargar usuario:', error);
            setMessage({ 
                type: 'error', 
                text: 'Error al cargar los datos del usuario. Por favor, intenta nuevamente.' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Guardar usuario (crear o editar)
    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);
            
            // Mapear campos del frontend al backend
            const userData = {
                nombre: formData.usuario,
                email: formData.correo,
                sexo: formData.sexo || null,
                nivel_educativo: formData.nivelEducativo || null,
                rol: formData.rol === 'administrador' ? 'admin' : formData.rol
            };
            
            // Solo incluir password si se proporcionó
            if (formData.contrasena && formData.contrasena.trim()) {
                userData.password = formData.contrasena;
            }
            
            if (modalMode === 'create') {
                // Validar que la contraseña esté presente al crear
                if (!formData.contrasena || !formData.contrasena.trim()) {
                    setErrors({ contrasena: 'La contraseña es requerida para crear un usuario' });
                    setIsLoading(false);
                    return;
                }
                
                await api.crearUsuario(userData);
                setMessage({ type: 'success', text: 'Usuario creado exitosamente' });
            } else {
                // Actualizar usuario existente
                await api.actualizarUsuario(selectedUsuario.id, userData);
                setMessage({ type: 'success', text: 'Usuario actualizado exitosamente' });
            }
            
            setShowModal(false);
            // Recargar la lista de usuarios
            await loadUsuarios();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || 'Error al guardar usuario. Por favor, intenta nuevamente.' 
            });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } finally {
            setIsLoading(false);
        }
    };

    // Eliminar usuario
    const handleDelete = async (usuario) => {
        if (usuario.id === currentUser?.id) {
            setMessage({ type: 'error', text: 'No puedes eliminar tu propio usuario' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            return;
        }

        if (!window.confirm(`¿Estás seguro de eliminar al usuario "${usuario.usuario}"?`)) {
            return;
        }

        try {
            setIsLoading(true);
            await api.eliminarUsuario(usuario.id);
            setMessage({ type: 'success', text: 'Usuario eliminado exitosamente' });
            // Recargar la lista de usuarios
            await loadUsuarios();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || 'Error al eliminar usuario. Por favor, intenta nuevamente.' 
            });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } finally {
            setIsLoading(false);
        }
    };

    // Los usuarios ya vienen filtrados del backend
    const filteredUsuarios = usuarios;

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <p>Cargando usuarios...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Panel de Administración</h1>
                <p className={styles.subtitle}>Gestión de Usuarios</p>
            </div>

            {message.text && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}

            <div className={styles.controls}>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Buscar por usuario o correo..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyPress={handleSearchKeyPress}
                        className={styles.searchInput}
                    />
                    <button 
                        onClick={handleSearch}
                        className={styles.searchButton}
                        title="Buscar"
                    >
                        🔍
                    </button>
                </div>
                <div className={styles.filters}>
                    <select
                        value={filterRol}
                        onChange={(e) => setFilterRol(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="todos">Todos los roles</option>
                        <option value="administrador">Administradores</option>
                        <option value="usuario">Usuarios</option>
                    </select>
                    <button onClick={handleCreate} className={styles.createButton}>
                        + Nuevo Usuario
                    </button>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Usuario</th>
                            <th>Correo</th>
                            <th>Rol</th>
                            <th>Sexo</th>
                            <th>Nivel Educativo</th>
                            <th>Fecha Registro</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsuarios.length === 0 ? (
                            <tr>
                                <td colSpan="8" className={styles.noData}>
                                    No se encontraron usuarios
                                </td>
                            </tr>
                        ) : (
                            filteredUsuarios.map(usuario => (
                                <tr key={usuario.id}>
                                    <td>{usuario.id}</td>
                                    <td>{usuario.usuario}</td>
                                    <td>{usuario.correo}</td>
                                    <td>
                                        <span className={`${styles.badge} ${styles[usuario.rol]}`}>
                                            {usuario.rol}
                                        </span>
                                    </td>
                                    <td>{usuario.sexo || '-'}</td>
                                    <td>{usuario.nivelEducativo || '-'}</td>
                                    <td>
                                        {usuario.fechaRegistro 
                                            ? new Date(usuario.fechaRegistro).toLocaleDateString('es-MX')
                                            : '-'
                                        }
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                onClick={() => handleEdit(usuario)}
                                                className={styles.editButton}
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(usuario)}
                                                className={styles.deleteButton}
                                                title="Eliminar"
                                                disabled={usuario.id === currentUser?.id}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1 || isLoading}
                        className={styles.paginationButton}
                    >
                        ← Anterior
                    </button>
                    <span className={styles.paginationInfo}>
                        Página {pagination.page} de {pagination.totalPages} 
                        ({pagination.total} usuarios totales)
                    </span>
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page >= pagination.totalPages || isLoading}
                        className={styles.paginationButton}
                    >
                        Siguiente →
                    </button>
                </div>
            )}

            {/* Modal para crear/editar usuario */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{modalMode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}</h2>
                            <button
                                className={styles.closeButton}
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label>Usuario *</label>
                                <input
                                    type="text"
                                    value={formData.usuario}
                                    onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                                    className={errors.usuario ? styles.inputError : ''}
                                />
                                {errors.usuario && <span className={styles.errorText}>{errors.usuario}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Correo Electrónico *</label>
                                <input
                                    type="email"
                                    value={formData.correo}
                                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                                    className={errors.correo ? styles.inputError : ''}
                                />
                                {errors.correo && <span className={styles.errorText}>{errors.correo}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Contraseña {modalMode === 'create' && '*'}</label>
                                <input
                                    type="password"
                                    value={formData.contrasena}
                                    onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                                    placeholder={modalMode === 'edit' ? 'Dejar vacío para no cambiar' : ''}
                                    className={errors.contrasena ? styles.inputError : ''}
                                />
                                {errors.contrasena && <span className={styles.errorText}>{errors.contrasena}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Rol *</label>
                                <select
                                    value={formData.rol}
                                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                                    className={errors.rol ? styles.inputError : ''}
                                >
                                    <option value="usuario">Usuario</option>
                                    <option value="administrador">Administrador</option>
                                </select>
                                {errors.rol && <span className={styles.errorText}>{errors.rol}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Sexo</label>
                                <select
                                    value={formData.sexo}
                                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="masculino">Masculino</option>
                                    <option value="femenino">Femenino</option>
                                    <option value="otro">Otro</option>
                                    <option value="prefiero_no_decir">Prefiero no decir</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Nivel Educativo</label>
                                <select
                                    value={formData.nivelEducativo}
                                    onChange={(e) => setFormData({ ...formData, nivelEducativo: e.target.value })}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="primaria">Primaria</option>
                                    <option value="secundaria">Secundaria</option>
                                    <option value="tecnico">Técnico</option>
                                    <option value="universitario">Universitario</option>
                                    <option value="postgrado">Postgrado</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button onClick={() => setShowModal(false)} className={styles.cancelButton}>
                                Cancelar
                            </button>
                            <button onClick={handleSave} className={styles.saveButton}>
                                {modalMode === 'create' ? 'Crear' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
