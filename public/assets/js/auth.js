// Configuración de AWS Cognito
const cognitoConfig = {
    region: 'us-east-1',
    userPoolId: 'us-east-1_Cg5yUjR6L',
    userPoolWebClientId: '1gsjecdf86pgdgvvis7l30hha1',
    oauth: {
        domain: 'auth.tiburoncp.siegfried-fs.com',
        scope: ['email', 'openid', 'profile'],
        redirectSignIn: window.location.origin,
        redirectSignOut: window.location.origin,
        responseType: 'code'
    }
};

class AuthManager {
    constructor() {
        console.log('AuthManager: Constructor iniciado. Creando instancia de AuthManager.');
        this.currentUser = null;
        this.init();
    }

    init() {
        console.log('AuthManager: init() llamado.');
        // Verificar si hay un usuario autenticado al cargar la página
        this.checkAuthState();
    }

    setupEventListeners() {
        console.log('AuthManager: setupEventListeners -- INICIO DE MÉTODO --');
        // Botón de login
        const loginBtn = document.getElementById('loginBtn');
        console.log('AuthManager: loginBtn existe?', loginBtn);
        if (loginBtn) {
            console.log('AuthManager: loginBtn encontrado. Añadiendo listener.');
            loginBtn.addEventListener('click', () => this.signInWithGoogle());
        }

        // Botón de logout
        const logoutBtn = document.getElementById('logoutBtn');
        console.log('AuthManager: logoutBtn existe?', logoutBtn);
        if (logoutBtn) {
            console.log('AuthManager: logoutBtn encontrado. Añadiendo listener.');
            logoutBtn.addEventListener('click', () => this.signOut());
        }
    }

    async checkAuthState() {
        try {
            // Verificar si hay un código de autorización en la URL
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            
            if (code) {
                await this.handleAuthCallback(code);
                // Limpiar la URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                // Verificar si hay tokens en localStorage
                const accessToken = sessionStorage.getItem('accessToken');
                if (accessToken) {
                    await this.validateToken(accessToken);
                }
            }
        } catch (error) {
            console.error('Error checking auth state:', error);
            this.updateUI(false);
        }
    }

    async handleAuthCallback(code) {
        try {
            // Intercambiar código por tokens
            const tokens = await this.exchangeCodeForTokens(code);
            
            // Guardar tokens
            sessionStorage.setItem('accessToken', tokens.access_token);
            sessionStorage.setItem('idToken', tokens.id_token);
            sessionStorage.setItem('refreshToken', tokens.refresh_token);
            
            // Obtener información del usuario
            await this.getUserInfo(tokens.access_token);
            
        } catch (error) {
            console.error('Error handling auth callback:', error);
            this.updateUI(false);
        }
    }

    async exchangeCodeForTokens(code) {
        const response = await fetch(`https://${cognitoConfig.oauth.domain}/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: cognitoConfig.userPoolWebClientId,
                code: code,
                redirect_uri: cognitoConfig.oauth.redirectSignIn
            })
        });

        if (!response.ok) {
            throw new Error('Failed to exchange code for tokens');
        }

        return await response.json();
    }

    async validateToken(accessToken) {
        try {
            await this.getUserInfo(accessToken);
        } catch (error) {
            // Token inválido, limpiar localStorage
            this.signOut();
        }
    }

    async getUserInfo(accessToken) {
        const response = await fetch(`https://${cognitoConfig.oauth.domain}/oauth2/userInfo`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to get user info');
        }

        const userInfo = await response.json();
        this.currentUser = userInfo;
        this.updateUI(true);
    }

    signInWithGoogle() {
        const authUrl = `https://${cognitoConfig.oauth.domain}/oauth2/authorize?` +
            `response_type=code&` +
            `client_id=${cognitoConfig.userPoolWebClientId}&` +
            `redirect_uri=${encodeURIComponent(cognitoConfig.oauth.redirectSignIn)}&` +
            `scope=${cognitoConfig.oauth.scope.join('%20')}&` +
            `identity_provider=Google&` +
            `prompt=select_account`;
        
        window.location.href = authUrl;
    }

    signOut() {
        // Limpiar localStorage
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('idToken');
        sessionStorage.removeItem('refreshToken');
        
        this.currentUser = null;
        this.updateUI(false);
        
        // Redirigir a logout de Cognito para invalidar la sesión también en el proveedor de identidad
        window.location.href = `https://${cognitoConfig.oauth.domain}/logout?client_id=${cognitoConfig.userPoolWebClientId}&logout_uri=${encodeURIComponent(cognitoConfig.oauth.redirectSignOut)}`;
    }

    updateUI(isAuthenticated) {
        const authButtons = document.getElementById('authButtons');
        const userInfoDisplay = document.getElementById('userInfo');
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');

        if (isAuthenticated && this.currentUser) {
            // Usuario autenticado
            if (authButtons) authButtons.style.display = 'none';
            if (userInfoDisplay) userInfoDisplay.style.display = 'flex'; // Usar 'flex' para mostrar correctamente el layout
            
            if (userAvatar) userAvatar.src = this.currentUser.picture || '/assets/images/profile-photo.jpg';
            if (userName) userName.textContent = this.currentUser.name || this.currentUser.email;
            
            this.setupUserMenuListeners(); // Configurar listeners para los elementos del menú de usuario

        } else {
            // Usuario no autenticado
            if (authButtons) authButtons.style.display = 'flex'; // Usar 'flex' para mostrar correctamente el layout
            if (userInfoDisplay) userInfoDisplay.style.display = 'none';
            
            if (userAvatar) userAvatar.src = '/assets/images/profile-photo.jpg'; // Resetear a la imagen por defecto
            if (userName) userName.textContent = ''; // Limpiar nombre de usuario
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    setupUserMenuListeners() {
        const userInfoContainer = document.getElementById('userInfo'); // Nuevo elemento para el listener
        const userDropdownContent = document.querySelector('.user-dropdown-content');
        const editProfileBtn = document.getElementById('editProfileBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (userInfoContainer) {
            userInfoContainer.addEventListener('click', (event) => {
                event.stopPropagation(); // Previene que el clic cierre el menú inmediatamente
                if (userDropdownContent) {
                    userDropdownContent.classList.toggle('show');
                }
            });
        }

        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => this.editUserProfile());
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.signOut());
        }

        // Cierra el menú desplegable si se hace clic fuera
        window.addEventListener('click', (event) => {
            if (userDropdownContent && userInfoContainer && !userInfoContainer.contains(event.target) && userDropdownContent.classList.contains('show')) {
                userDropdownContent.classList.remove('show');
            }
        });
    }

    editUserProfile() {
        console.log('--- Editar Perfil de Usuario ---');
        console.log('Para implementar esta funcionalidad, necesitarías:');
        console.log('1. Crear una UI (página o modal) para editar los atributos de usuario.');
        console.log('2. Si quieres atributos personalizados (e.g., "Student/Professional", "Cloud Experience", "City"), primero debes definirlos en tu User Pool de Cognito en la consola AWS.');
        console.log('3. Usar el AWS SDK para JavaScript para llamar a la API de Cognito para actualizar los atributos (e.g., `CognitoUser.updateAttributes`).');
        console.log('4. Para la foto de perfil, esto generalmente implica subir la imagen a un bucket S3 y luego guardar la URL de S3 como un atributo de Cognito.');
        alert('Funcionalidad "Editar Perfil" en desarrollo. Consulta la consola para más detalles.');
    }

    deleteAccount() {
        console.log('--- Eliminar Cuenta ---');
        console.log('Esta es una operación sensible y debe ser manejada con cuidado.');
        console.log('Para implementar esto, necesitarías:');
        console.log('1. Confirmar la acción con el usuario (ej. pedir contraseña o una doble confirmación).');
        console.log('2. Utilizar el AWS SDK para llamar a la API de Cognito para eliminar el usuario (AdminDeleteUser API si es desde un backend, o deleteUser si es desde el cliente y se requiere la contraseña).');
        console.log('3. Considerar la eliminación de datos asociados al usuario en otros servicios (S3, DynamoDB, etc.) a través de un backend.');
        if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.')) {
            alert('Funcionalidad "Eliminar Cuenta" en desarrollo. Se requiere implementación de backend/Cognito. Consulta la consola para más detalles.');
        }
    }
}

// Crear e inicializar el gestor de autenticación
window.authManager = new AuthManager();
