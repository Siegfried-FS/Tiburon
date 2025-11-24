// =============================================================================
// ADMIN PANEL - CORE FUNCTIONALITY
// =============================================================================

class AdminPanel {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.switching = false;
        this.init();
    }

    async init() {
        // Check authentication
        await this.checkAuth();
        
        // Initialize UI
        this.initializeUI();
        
        // Load initial data
        await this.loadDashboardData();
        
        // Setup periodic token verification (every 5 minutes)
        this.setupTokenVerification();
        
        // Hide loading screen
        this.hideLoadingScreen();
    }

    setupTokenVerification() {
        // Verificar token cada 5 minutos
        setInterval(async () => {
            try {
                const session = await Auth.currentSession();
                if (!session.isValid()) {
                    console.log('Sesión expirada, redirigiendo a login');
                    window.location.href = '/auth.html?redirect=admin&reason=expired';
                }
            } catch (error) {
                console.log('Error verificando sesión, redirigiendo a login');
                window.location.href = '/auth.html?redirect=admin&reason=error';
            }
        }, 5 * 60 * 1000); // 5 minutos
    }

    async checkAuth() {
        try {
            // Verificar token JWT válido de Cognito
            const session = await Auth.currentSession();
            if (!session.isValid()) {
                throw new Error('Sesión inválida');
            }

            // Obtener usuario actual con grupos
            const user = await Auth.currentAuthenticatedUser();
            const groups = user.signInUserSession.accessToken.payload['cognito:groups'] || [];
            
            // Verificar que el usuario tenga grupo Admin
            if (!groups.includes('Admin')) {
                console.log('Usuario sin permisos de admin');
                window.location.href = '/admin-denied.html';
                return;
            }

            // Verificar token con el servidor (doble verificación)
            const tokenValid = await this.verifyTokenWithServer(session.getAccessToken().getJwtToken());
            if (!tokenValid) {
                throw new Error('Token no válido en servidor');
            }

            // Usuario autenticado y autorizado
            this.currentUser = {
                name: user.attributes.name || user.attributes.email,
                role: 'Admin',
                email: user.attributes.email,
                groups: groups
            };
            
            document.getElementById('adminUserName').textContent = this.currentUser.name;
            
        } catch (error) {
            console.error('Error de autenticación:', error);
            // Redirigir a login con parámetro de admin
            window.location.href = '/auth.html?redirect=admin&reason=unauthorized';
        }
    }

    async verifyTokenWithServer(token) {
        try {
            const response = await fetch('https://vu7i71hm28.execute-api.us-east-1.amazonaws.com/verify-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ action: 'verify' })
            });
            
            return response.ok;
        } catch (error) {
            console.error('Error verificando token con servidor:', error);
            return false;
        }
    }

    initializeUI() {
        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.switchSection(section);
            });
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Dashboard refresh
        document.getElementById('refreshPostsBtn')?.addEventListener('click', () => {
            this.loadPosts();
        });

        document.getElementById('refreshUsersBtn')?.addEventListener('click', () => {
            this.loadUsers();
        });

        // Settings
        document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('clearCacheBtn')?.addEventListener('click', () => {
            this.clearCache();
        });
    }

    switchSection(sectionName) {
        // Evitar cambios muy rápidos
        if (this.switching) return;
        this.switching = true;

        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Fade out current section
        const currentSection = document.querySelector('.admin-section.active');
        if (currentSection) {
            currentSection.style.opacity = '0';
            currentSection.style.transform = 'translateY(-20px)';
        }

        // Wait for fade out, then switch
        setTimeout(() => {
            // Hide all sections
            document.querySelectorAll('.admin-section').forEach(section => {
                section.classList.remove('active');
                section.style.opacity = '0';
                section.style.transform = 'translateY(20px)';
            });

            // Show new section
            const newSection = document.getElementById(sectionName);
            newSection.classList.add('active');
            
            // Trigger animation
            setTimeout(() => {
                newSection.style.opacity = '1';
                newSection.style.transform = 'translateY(0)';
                this.switching = false;
            }, 50);

            this.currentSection = sectionName;
            this.loadSectionData(sectionName);
        }, 200);
    }

    async loadSectionData(section) {
        switch(section) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'posts':
                await this.loadPosts();
                break;
            case 'users':
                await this.loadUsers();
                break;
            case 'settings':
                await this.loadSettings();
                break;
        }
    }

    async loadDashboardData() {
        try {
            // TODO: Replace with real API calls
            // Simulate loading data
            await this.delay(1000);

            // Update stats
            document.getElementById('totalUsers').textContent = '234';
            document.getElementById('totalPosts').textContent = '45';
            document.getElementById('pendingPosts').textContent = '3';
            document.getElementById('totalLikes').textContent = '1,247';

            // Update recent activity
            const activities = [
                '👤 Nuevo usuario registrado: Juan Pérez',
                '📝 Post aprobado: "Introducción a Lambda"',
                '❤️ Post con 50+ likes: "AWS CloudFormation Tips"',
                '🎯 Usuario promovido a Navegante: María García'
            ];

            const activityContainer = document.getElementById('recentActivity');
            activityContainer.innerHTML = activities.map(activity => 
                `<div class="activity-item">${activity}</div>`
            ).join('');

        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showError('Error cargando dashboard');
        }
    }

    async loadPosts() {
        try {
            const container = document.getElementById('postsContainer');
            container.innerHTML = '<div class="post-skeleton"></div>'.repeat(3);

            // TODO: Load real posts from API
            await this.delay(800);

            const posts = [
                { id: 1, title: 'Introducción a AWS Lambda', status: 'pending', author: 'Juan Pérez' },
                { id: 2, title: 'Tips de CloudFormation', status: 'approved', author: 'María García' },
                { id: 3, title: 'Guía de S3 Buckets', status: 'pending', author: 'Carlos López' }
            ];

            container.innerHTML = posts.map(post => `
                <div class="post-item">
                    <div class="post-info">
                        <h4>${post.title}</h4>
                        <p>Por: ${post.author}</p>
                        <span class="status ${post.status}">${post.status === 'pending' ? 'Pendiente' : 'Aprobado'}</span>
                    </div>
                    <div class="post-actions">
                        ${post.status === 'pending' ? 
                            `<button class="btn-primary" onclick="adminPanel.approvePost(${post.id})">✅ Aprobar</button>
                             <button class="btn-warning" onclick="adminPanel.rejectPost(${post.id})">❌ Rechazar</button>` :
                            `<button class="btn-secondary" onclick="adminPanel.editPost(${post.id})">✏️ Editar</button>`
                        }
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error loading posts:', error);
        }
    }

    async loadUsers() {
        try {
            const container = document.getElementById('usersContainer');
            container.innerHTML = '<div class="user-skeleton"></div>'.repeat(5);

            // TODO: Load real users from API
            await this.delay(800);

            const users = [
                { id: 1, name: 'Juan Pérez', email: 'juan@email.com', role: 'Explorador', status: 'active' },
                { id: 2, name: 'María García', email: 'maria@email.com', role: 'Navegante', status: 'active' },
                { id: 3, name: 'Carlos López', email: 'carlos@email.com', role: 'Corsario', status: 'active' },
                { id: 4, name: 'Ana Martínez', email: 'ana@email.com', role: 'Explorador', status: 'inactive' }
            ];

            container.innerHTML = users.map(user => `
                <div class="user-item">
                    <div class="user-info">
                        <h4>${user.name}</h4>
                        <p>${user.email}</p>
                        <span class="role ${user.role.toLowerCase()}">${user.role}</span>
                    </div>
                    <div class="user-actions">
                        <select onchange="adminPanel.changeUserRole(${user.id}, this.value)">
                            <option value="Explorador" ${user.role === 'Explorador' ? 'selected' : ''}>Explorador</option>
                            <option value="Navegante" ${user.role === 'Navegante' ? 'selected' : ''}>Navegante</option>
                            <option value="Corsario" ${user.role === 'Corsario' ? 'selected' : ''}>Corsario</option>
                            <option value="Capitán" ${user.role === 'Capitán' ? 'selected' : ''}>Capitán</option>
                        </select>
                        <button class="btn-warning" onclick="adminPanel.toggleUserStatus(${user.id})">
                            ${user.status === 'active' ? '🚫 Suspender' : '✅ Activar'}
                        </button>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    async loadSettings() {
        // TODO: Load settings from API
        document.getElementById('defaultTheme').value = 'light';
        document.getElementById('welcomeMessage').value = '¡Bienvenido a la comunidad AWS User Group Playa Vicente!';
    }

    // Action methods with token verification
    async approvePost(postId) {
        if (!await this.verifyCurrentToken()) return;
        
        try {
            // TODO: API call to approve post
            console.log('Aprobando post:', postId);
            this.showSuccess('Post aprobado exitosamente');
            this.loadPosts();
        } catch (error) {
            this.showError('Error aprobando post');
        }
    }

    async rejectPost(postId) {
        if (!await this.verifyCurrentToken()) return;
        
        try {
            // TODO: API call to reject post
            console.log('Rechazando post:', postId);
            this.showSuccess('Post rechazado');
            this.loadPosts();
        } catch (error) {
            this.showError('Error rechazando post');
        }
    }

    async changeUserRole(userId, newRole) {
        if (!await this.verifyCurrentToken()) return;
        
        try {
            // TODO: API call to change user role
            console.log('Cambiando rol de usuario:', userId, newRole);
            this.showSuccess(`Rol actualizado a ${newRole}`);
        } catch (error) {
            this.showError('Error actualizando rol');
        }
    }

    async verifyCurrentToken() {
        try {
            const session = await Auth.currentSession();
            if (!session.isValid()) {
                throw new Error('Sesión inválida');
            }
            
            const tokenValid = await this.verifyTokenWithServer(session.getAccessToken().getJwtToken());
            if (!tokenValid) {
                throw new Error('Token no válido');
            }
            
            return true;
        } catch (error) {
            console.error('Token verification failed:', error);
            alert('❌ Sesión expirada. Redirigiendo al login...');
            window.location.href = '/auth.html?redirect=admin&reason=expired';
            return false;
        }
    }

    async saveSettings() {
        try {
            const settings = {
                defaultTheme: document.getElementById('defaultTheme').value,
                welcomeMessage: document.getElementById('welcomeMessage').value
            };
            
            // TODO: API call to save settings
            console.log('Saving settings:', settings);
            this.showSuccess('Configuración guardada');
        } catch (error) {
            this.showError('Error guardando configuración');
        }
    }

    clearCache() {
        if (confirm('¿Estás seguro de limpiar el cache?')) {
            // Clear service worker cache
            if ('caches' in window) {
                caches.keys().then(names => {
                    names.forEach(name => caches.delete(name));
                });
            }
            this.showSuccess('Cache limpiado');
        }
    }

    logout() {
        if (confirm('¿Estás seguro de cerrar sesión?')) {
            // TODO: Implement proper logout
            window.location.href = '/';
        }
    }

    // Utility methods
    hideLoadingScreen() {
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showSuccess(message) {
        // TODO: Implement toast notifications
        alert('✅ ' + message);
    }

    showError(message) {
        // TODO: Implement toast notifications
        alert('❌ ' + message);
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});

// Add CSS for post and user items
const adminStyles = document.createElement('style');
adminStyles.textContent = `
    .post-item, .user-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        background: var(--bg-color);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        margin-bottom: 10px;
    }
    
    .post-info h4, .user-info h4 {
        margin: 0 0 5px 0;
        color: var(--text-color);
    }
    
    .post-info p, .user-info p {
        margin: 0;
        color: var(--text-color);
        opacity: 0.7;
        font-size: 14px;
    }
    
    .status, .role {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        margin-top: 5px;
    }
    
    .status.pending {
        background: #fff3cd;
        color: #856404;
    }
    
    .status.approved {
        background: #d4edda;
        color: #155724;
    }
    
    .post-actions, .user-actions {
        display: flex;
        gap: 10px;
        align-items: center;
    }
    
    @media (max-width: 768px) {
        .post-item, .user-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
        }
        
        .post-actions, .user-actions {
            width: 100%;
            justify-content: flex-end;
        }
    }
`;
document.head.appendChild(adminStyles);
