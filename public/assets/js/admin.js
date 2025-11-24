// =============================================================================
// ADMIN PANEL - CORE FUNCTIONALITY WITH REAL BACKEND
// =============================================================================

const API_BASE_URL = 'https://fklo6233x5.execute-api.us-east-1.amazonaws.com';

class AdminPanel {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.posts = [];
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.setupNavigation();
        this.setupEventListeners();
        await this.loadDashboard();
    }

    async checkAuth() {
        try {
            const accessToken = sessionStorage.getItem('accessToken');
            const idToken = sessionStorage.getItem('idToken');
            
            if (!accessToken || !idToken) {
                console.log('No hay tokens, redirigiendo a auth');
                window.location.href = '/auth.html?redirect=admin&reason=unauthorized';
                return;
            }

            const tokenPayload = JSON.parse(atob(idToken.split('.')[1]));
            const groups = tokenPayload['cognito:groups'] || [];
            
            if (!groups.includes('Admins')) {
                console.log('Usuario sin permisos de admin');
                window.location.href = '/admin-denied.html';
                return;
            }

            this.currentUser = {
                name: tokenPayload.name || tokenPayload.email,
                role: 'Admin',
                email: tokenPayload.email,
                groups: groups
            };
            
            document.getElementById('adminUserName').textContent = this.currentUser.name;
            
        } catch (error) {
            console.error('Error de autenticación:', error);
            sessionStorage.clear();
            window.location.href = '/auth.html?redirect=admin&reason=error';
        }
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.switchSection(section);
            });
        });
    }

    setupEventListeners() {
        // Add Post Button
        document.getElementById('addPostBtn')?.addEventListener('click', () => {
            this.showPostModal();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterPosts(e.target.dataset.filter);
            });
        });

        // Search
        document.getElementById('userSearch')?.addEventListener('input', (e) => {
            this.searchUsers(e.target.value);
        });

        // Settings
        document.getElementById('saveSettings')?.addEventListener('click', () => {
            this.saveSettings();
        });
    }

    async switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(section).classList.add('active');

        this.currentSection = section;

        // Load section data
        switch(section) {
            case 'dashboard':
                await this.loadDashboard();
                break;
            case 'posts':
                await this.loadPosts();
                break;
            case 'users':
                await this.loadUsers();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    async loadDashboard() {
        try {
            const response = await fetch(`${API_BASE_URL}/posts/stats`);
            const stats = await response.json();

            document.getElementById('totalUsers').textContent = stats.totalUsers || '2';
            document.getElementById('totalPosts').textContent = stats.totalPosts || '0';
            document.getElementById('pendingPosts').textContent = stats.pendingPosts || '0';
            document.getElementById('monthlyGrowth').textContent = stats.monthlyGrowth || '+0';

            // Load recent activity
            await this.loadRecentActivity();
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    async loadRecentActivity() {
        try {
            const response = await fetch(`${API_BASE_URL}/posts?limit=5`);
            const data = await response.json();
            
            const activityList = document.getElementById('recentActivity');
            if (data.posts && data.posts.length > 0) {
                activityList.innerHTML = data.posts.map(post => `
                    <div class="activity-item">
                        <span class="activity-icon">${post.status === 'published' ? '✅' : '⏳'}</span>
                        <div class="activity-content">
                            <strong>${post.title}</strong>
                            <small>${new Date(post.createdAt).toLocaleDateString()}</small>
                        </div>
                    </div>
                `).join('');
            } else {
                activityList.innerHTML = '<p>No hay actividad reciente</p>';
            }
        } catch (error) {
            console.error('Error loading recent activity:', error);
            document.getElementById('recentActivity').innerHTML = '<p>Error cargando actividad</p>';
        }
    }

    async loadPosts(filter = 'all') {
        try {
            const url = filter === 'all' ? `${API_BASE_URL}/posts` : `${API_BASE_URL}/posts?status=${filter}`;
            const response = await fetch(url);
            const data = await response.json();
            
            this.posts = data.posts || [];
            this.renderPosts(this.posts);
        } catch (error) {
            console.error('Error loading posts:', error);
            document.getElementById('postsList').innerHTML = '<p>Error cargando posts</p>';
        }
    }

    renderPosts(posts) {
        const postsList = document.getElementById('postsList');
        
        if (posts.length === 0) {
            postsList.innerHTML = '<p>No hay posts disponibles</p>';
            return;
        }

        postsList.innerHTML = posts.map(post => `
            <div class="post-item" data-id="${post.id}">
                <div class="post-header">
                    <h3>${post.title}</h3>
                    <span class="post-status status-${post.status}">${post.status}</span>
                </div>
                <div class="post-content">
                    <p>${post.content.substring(0, 150)}...</p>
                    <div class="post-meta">
                        <span>Por: ${post.author}</span>
                        <span>${new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="post-actions">
                    <button class="btn-primary" onclick="adminPanel.editPost('${post.id}')">✏️ Editar</button>
                    ${post.status === 'pending' ? 
                        `<button class="btn-primary" onclick="adminPanel.approvePost('${post.id}')">✅ Aprobar</button>` : 
                        ''
                    }
                    <button class="btn-warning" onclick="adminPanel.deletePost('${post.id}')">🗑️ Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    filterPosts(filter) {
        this.loadPosts(filter);
    }

    showPostModal(post = null) {
        const isEdit = post !== null;
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${isEdit ? 'Editar Post' : 'Nuevo Post'}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="postForm">
                    <div class="form-group">
                        <label>Título:</label>
                        <input type="text" id="postTitle" value="${post?.title || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Contenido:</label>
                        <textarea id="postContent" rows="6" required>${post?.content || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Estado:</label>
                        <select id="postStatus">
                            <option value="pending" ${post?.status === 'pending' ? 'selected' : ''}>Pendiente</option>
                            <option value="published" ${post?.status === 'published' ? 'selected' : ''}>Publicado</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Categoría:</label>
                        <select id="postCategory">
                            <option value="general" ${post?.category === 'general' ? 'selected' : ''}>General</option>
                            <option value="aws" ${post?.category === 'aws' ? 'selected' : ''}>AWS</option>
                            <option value="security" ${post?.category === 'security' ? 'selected' : ''}>Seguridad</option>
                            <option value="development" ${post?.category === 'development' ? 'selected' : ''}>Desarrollo</option>
                        </select>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                        <button type="submit" class="btn-primary">${isEdit ? 'Actualizar' : 'Crear'}</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('.modal-close').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

        modal.querySelector('#postForm').onsubmit = async (e) => {
            e.preventDefault();
            await this.savePost(post?.id, modal);
        };
    }

    async savePost(postId, modal) {
        const formData = {
            title: document.getElementById('postTitle').value,
            content: document.getElementById('postContent').value,
            status: document.getElementById('postStatus').value,
            category: document.getElementById('postCategory').value,
            author: this.currentUser.name
        };

        try {
            const url = postId ? `${API_BASE_URL}/posts/${postId}` : `${API_BASE_URL}/posts`;
            const method = postId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                modal.remove();
                await this.loadPosts();
                await this.loadDashboard();
                this.showToast(postId ? 'Post actualizado' : 'Post creado', 'success');
            } else {
                throw new Error('Error al guardar post');
            }
        } catch (error) {
            console.error('Error saving post:', error);
            this.showToast('Error al guardar post', 'error');
        }
    }

    async editPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            this.showPostModal(post);
        }
    }

    async approvePost(postId) {
        try {
            const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'published' })
            });

            if (response.ok) {
                await this.loadPosts();
                await this.loadDashboard();
                this.showToast('Post aprobado', 'success');
            }
        } catch (error) {
            console.error('Error approving post:', error);
            this.showToast('Error al aprobar post', 'error');
        }
    }

    async deletePost(postId) {
        if (!confirm('¿Estás seguro de eliminar este post?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await this.loadPosts();
                await this.loadDashboard();
                this.showToast('Post eliminado', 'success');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            this.showToast('Error al eliminar post', 'error');
        }
    }

    loadUsers() {
        // Placeholder - implementar cuando tengamos tabla de usuarios
        document.getElementById('usersList').innerHTML = `
            <div class="user-item">
                <div class="user-info">
                    <strong>Roberto Flores</strong>
                    <span>roberto.ciberseguridad@gmail.com</span>
                    <span class="user-role">Admin</span>
                </div>
                <div class="user-actions">
                    <span class="status-active">Activo</span>
                </div>
            </div>
        `;
    }

    loadSettings() {
        // Cargar configuraciones actuales
        document.getElementById('defaultTheme').value = localStorage.getItem('theme') || 'light';
        document.getElementById('emailNotifications').checked = true;
        document.getElementById('requireApproval').checked = true;
    }

    saveSettings() {
        const theme = document.getElementById('defaultTheme').value;
        localStorage.setItem('theme', theme);
        this.showToast('Configuración guardada', 'success');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});

// Add CSS for modal and toast
const adminStyles = document.createElement('style');
adminStyles.textContent = `
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    
    .modal-content {
        background: var(--bg-card);
        border-radius: 12px;
        padding: 2rem;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--text-color);
    }
    
    .form-group {
        margin-bottom: 1rem;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        color: var(--text-color);
        font-weight: 500;
    }
    
    .form-group input, .form-group textarea, .form-group select {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-color);
        color: var(--text-color);
        font-family: inherit;
    }
    
    .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 1.5rem;
    }
    
    .post-status {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .status-published {
        background: #d4edda;
        color: #155724;
    }
    
    .status-pending {
        background: #fff3cd;
        color: #856404;
    }
    
    .post-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .post-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
    }
    
    .activity-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem 0;
        border-bottom: 1px solid var(--border-color);
    }
    
    .activity-item:last-child {
        border-bottom: none;
    }
    
    .activity-icon {
        font-size: 1.2rem;
    }
    
    .activity-content strong {
        display: block;
        color: var(--text-color);
    }
    
    .activity-content small {
        color: var(--text-color);
        opacity: 0.7;
    }
    
    .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 1001;
    }
    
    .toast.show {
        transform: translateX(0);
    }
    
    .toast-success {
        background: #28a745;
    }
    
    .toast-error {
        background: #dc3545;
    }
    
    .toast-info {
        background: #17a2b8;
    }
`;
document.head.appendChild(adminStyles);
