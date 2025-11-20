// Componentes de UI para Autenticación
class AuthUI {
    constructor() {
        this.isModalOpen = false;
        this.currentModal = null;
    }

    // Inicializar componentes de UI
    init() {
        this.createAuthModals();
        this.bindEvents();
        this.updateUIBasedOnAuth();
    }

    // Crear modales de login y registro
    createAuthModals() {
        const modalHTML = `
            <!-- Modal de Login -->
            <div id="loginModal" class="auth-modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Iniciar Sesión</h2>
                        <button class="close-modal" data-modal="loginModal">&times;</button>
                    </div>
                    <form id="loginForm" class="auth-form">
                        <div class="form-group">
                            <label for="loginEmail">Email:</label>
                            <input type="email" id="loginEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">Contraseña:</label>
                            <input type="password" id="loginPassword" required>
                        </div>
                        <button type="submit" class="btn-primary">Iniciar Sesión</button>
                        <div class="auth-links">
                            <a href="#" id="showRegister">¿No tienes cuenta? Regístrate</a>
                        </div>
                    </form>
                    <div id="loginError" class="error-message" style="display: none;"></div>
                </div>
            </div>

            <!-- Modal de Registro -->
            <div id="registerModal" class="auth-modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Crear Cuenta</h2>
                        <button class="close-modal" data-modal="registerModal">&times;</button>
                    </div>
                    <form id="registerForm" class="auth-form">
                        <div class="form-group">
                            <label for="registerName">Nombre:</label>
                            <input type="text" id="registerName" required>
                        </div>
                        <div class="form-group">
                            <label for="registerEmail">Email:</label>
                            <input type="email" id="registerEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="registerCity">Ciudad (opcional):</label>
                            <input type="text" id="registerCity" placeholder="Ej: Playa Vicente, Veracruz">
                        </div>
                        <div class="form-group">
                            <label for="registerPassword">Contraseña:</label>
                            <input type="password" id="registerPassword" required>
                            <small>Mínimo 8 caracteres, una mayúscula, una minúscula y un número</small>
                        </div>
                        <button type="submit" class="btn-primary">Crear Cuenta</button>
                        <div class="auth-links">
                            <a href="#" id="showLogin">¿Ya tienes cuenta? Inicia sesión</a>
                        </div>
                    </form>
                    <div id="registerError" class="error-message" style="display: none;"></div>
                    <div id="registerSuccess" class="success-message" style="display: none;"></div>
                </div>
            </div>

            <!-- Botones de autenticación en la navegación -->
            <div id="authButtons" class="auth-buttons">
                <button id="loginBtn" class="btn-secondary">Iniciar Sesión</button>
                <button id="registerBtn" class="btn-primary">Registrarse</button>
            </div>

            <!-- Menú de usuario autenticado -->
            <div id="userMenu" class="user-menu" style="display: none;">
                <span id="userName">Usuario</span>
                <div class="user-dropdown">
                    <button id="dashboardBtn">Dashboard</button>
                    <button id="logoutBtn">Cerrar Sesión</button>
                </div>
            </div>
        `;

        // Agregar al DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Vincular eventos
    bindEvents() {
        // Botones principales
        document.getElementById('loginBtn')?.addEventListener('click', () => this.showModal('loginModal'));
        document.getElementById('registerBtn')?.addEventListener('click', () => this.showModal('registerModal'));
        
        // Enlaces entre modales
        document.getElementById('showRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchModal('loginModal', 'registerModal');
        });
        
        document.getElementById('showLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchModal('registerModal', 'loginModal');
        });

        // Cerrar modales
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeModal(e.target.dataset.modal);
            });
        });

        // Cerrar modal al hacer clic fuera
        document.querySelectorAll('.auth-modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Formularios
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleRegister(e));
        
        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.handleLogout());
    }

    // Mostrar modal
    showModal(modalId) {
        this.closeAllModals();
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            this.currentModal = modalId;
            this.isModalOpen = true;
        }
    }

    // Cambiar entre modales
    switchModal(fromModal, toModal) {
        this.closeModal(fromModal);
        setTimeout(() => this.showModal(toModal), 100);
    }

    // Cerrar modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            this.isModalOpen = false;
            this.currentModal = null;
            this.clearErrors();
        }
    }

    // Cerrar todos los modales
    closeAllModals() {
        document.querySelectorAll('.auth-modal').forEach(modal => {
            modal.style.display = 'none';
        });
        this.isModalOpen = false;
        this.currentModal = null;
    }

    // Manejar login
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        this.showLoading('loginForm');
        this.clearErrors();

        try {
            await window.AuthManager.login(email, password);
            this.closeModal('loginModal');
            this.updateUIBasedOnAuth();
            this.showSuccess('¡Bienvenido de vuelta!');
        } catch (error) {
            this.showError('loginError', this.getErrorMessage(error));
        } finally {
            this.hideLoading('loginForm');
        }
    }

    // Manejar registro
    async handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const city = document.getElementById('registerCity').value.trim();
        const password = document.getElementById('registerPassword').value;
        
        this.showLoading('registerForm');
        this.clearErrors();

        try {
            const result = await window.AuthManager.register(email, password, name, city);
            
            if (result.userConfirmed) {
                this.showSuccess('¡Cuenta creada exitosamente! Ya puedes iniciar sesión.');
                setTimeout(() => this.switchModal('registerModal', 'loginModal'), 2000);
            } else {
                this.showSuccess('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.');
            }
        } catch (error) {
            this.showError('registerError', this.getErrorMessage(error));
        } finally {
            this.hideLoading('registerForm');
        }
    }

    // Manejar logout
    async handleLogout() {
        try {
            await window.AuthManager.logout();
            this.updateUIBasedOnAuth();
            this.showSuccess('Sesión cerrada correctamente');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }

    // Actualizar UI basada en estado de autenticación
    async updateUIBasedOnAuth() {
        const isAuthenticated = window.AuthManager.isAuthenticated();
        
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        
        if (isAuthenticated) {
            authButtons.style.display = 'none';
            userMenu.style.display = 'block';
            
            // Actualizar nombre de usuario
            try {
                const userInfo = await window.AuthManager.getCurrentUserInfo();
                const userName = document.getElementById('userName');
                if (userName && userInfo.name) {
                    userName.textContent = userInfo.name;
                }
            } catch (error) {
                console.error('Error getting user info:', error);
            }
        } else {
            authButtons.style.display = 'block';
            userMenu.style.display = 'none';
        }
    }

    // Mostrar loading
    showLoading(formId) {
        const form = document.getElementById(formId);
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Cargando...';
        }
    }

    // Ocultar loading
    hideLoading(formId) {
        const form = document.getElementById(formId);
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = formId === 'loginForm' ? 'Iniciar Sesión' : 'Crear Cuenta';
        }
    }

    // Mostrar error
    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    // Mostrar éxito
    showSuccess(message) {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Limpiar errores
    clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
            el.textContent = '';
        });
    }

    // Obtener mensaje de error amigable
    getErrorMessage(error) {
        const errorMessages = {
            'UserNotFoundException': 'Usuario no encontrado',
            'NotAuthorizedException': 'Email o contraseña incorrectos',
            'UserNotConfirmedException': 'Debes confirmar tu email antes de iniciar sesión',
            'UsernameExistsException': 'Ya existe una cuenta con este email',
            'InvalidPasswordException': 'La contraseña no cumple con los requisitos',
            'InvalidParameterException': 'Parámetros inválidos'
        };
        
        return errorMessages[error.code] || error.message || 'Ha ocurrido un error';
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Inicializar AuthManager
        await window.AuthManager.initialize();
        
        // Inicializar UI
        const authUI = new AuthUI();
        authUI.init();
        
        // Hacer disponible globalmente
        window.AuthUI = authUI;
    } catch (error) {
        console.error('Error initializing auth system:', error);
    }
});
