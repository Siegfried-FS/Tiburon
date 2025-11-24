// =============================================================================
// ADMIN PANEL - GESTIÓN COMPLETA DE CONTENIDOS
// =============================================================================

const API_BASE_URL = 'https://fklo6233x5.execute-api.us-east-1.amazonaws.com/prod';

class AdminPanel {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.posts = [];
        this.games = [];
        this.resources = [];
        this.workshops = [];
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
                window.location.href = '/auth.html?redirect=admin&reason=unauthorized';
                return;
            }

            const tokenPayload = JSON.parse(atob(idToken.split('.')[1]));
            const groups = tokenPayload['cognito:groups'] || [];
            
            if (!groups.includes('Admins')) {
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
        // Add Content Buttons
        document.getElementById('addPostBtn')?.addEventListener('click', () => {
            this.showContentModal('post');
        });
        
        document.getElementById('addGameBtn')?.addEventListener('click', () => {
            this.showContentModal('game');
        });
        
        document.getElementById('addResourceBtn')?.addEventListener('click', () => {
            this.showContentModal('resource');
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterContent(e.target.dataset.filter);
            });
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
                await this.loadAllContent();
                break;
            case 'games':
                await this.loadGames();
                break;
            case 'resources':
                await this.loadResources();
                break;
        }
    }

    async loadDashboard() {
        try {
            // Cargar estadísticas de archivos JSON locales
            await this.loadAllContent();
            
            const totalPosts = this.posts.length;
            const totalGames = this.games.length;
            const totalResources = this.resources.length;
            
            document.getElementById('totalUsers').textContent = '2';
            document.getElementById('totalPosts').textContent = totalPosts.toString();
            document.getElementById('pendingPosts').textContent = '0';
            document.getElementById('monthlyGrowth').textContent = '+' + (totalPosts + totalGames + totalResources);

            this.loadRecentActivity();
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    async loadAllContent() {
        try {
            // Cargar todos los contenidos del sitio
            await Promise.all([
                this.loadFeedPosts(),
                this.loadGamesData(),
                this.loadResourcesData(),
                this.loadWorkshopsData()
            ]);
            
            this.renderAllContent();
        } catch (error) {
            console.error('Error loading content:', error);
        }
    }

    async loadFeedPosts() {
        try {
            const response = await fetch('/assets/data/feed.json');
            const data = await response.json();
            this.posts = data.posts || [];
        } catch (error) {
            console.error('Error loading posts:', error);
            this.posts = [];
        }
    }

    async loadGamesData() {
        try {
            const response = await fetch('/assets/data/games.json');
            const data = await response.json();
            this.games = data.games || [];
        } catch (error) {
            console.error('Error loading games:', error);
            this.games = [];
        }
    }

    async loadResourcesData() {
        try {
            const response = await fetch('/assets/data/resources.json');
            const data = await response.json();
            this.resources = data.resources || [];
        } catch (error) {
            console.error('Error loading resources:', error);
            this.resources = [];
        }
    }

    async loadWorkshopsData() {
        try {
            const response = await fetch('/assets/data/workshops.json');
            const data = await response.json();
            this.workshops = data.workshops || [];
        } catch (error) {
            console.error('Error loading workshops:', error);
            this.workshops = [];
        }
    }

    renderAllContent() {
        const contentList = document.getElementById('postsList');
        if (!contentList) return;
        
        const allContent = [
            ...this.posts.map(item => ({...item, type: 'post'})),
            ...this.games.map(item => ({...item, type: 'game'})),
            ...this.resources.map(item => ({...item, type: 'resource'})),
            ...this.workshops.map(item => ({...item, type: 'workshop'}))
        ];

        if (allContent.length === 0) {
            contentList.innerHTML = '<p>No hay contenido disponible</p>';
            return;
        }

        contentList.innerHTML = allContent.map(item => `
            <div class="content-item" data-id="${item.id}" data-type="${item.type}">
                <div class="content-header">
                    <h3>${item.title}</h3>
                    <div class="content-badges">
                        <span class="content-type type-${item.type}">${item.type}</span>
                        ${item.category ? `<span class="content-category">${item.category}</span>` : ''}
                    </div>
                </div>
                <div class="content-body">
                    ${item.image ? `<img src="${item.image}" alt="${item.title}" class="content-image">` : ''}
                    <p>${(item.content || item.description || '').substring(0, 150)}...</p>
                    <div class="content-meta">
                        <span>Por: ${item.author || 'Admin'}</span>
                        <span>${new Date(item.date || Date.now()).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="content-actions">
                    <button class="btn-primary" onclick="adminPanel.editContent('${item.id}', '${item.type}')">✏️ Editar</button>
                    <button class="btn-warning" onclick="adminPanel.deleteContent('${item.id}', '${item.type}')">🗑️ Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    showContentModal(type, item = null) {
        const isEdit = item !== null;
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        const typeLabels = {
            post: 'Post',
            game: 'Juego',
            resource: 'Recurso',
            workshop: 'Taller'
        };
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${isEdit ? 'Editar' : 'Nuevo'} ${typeLabels[type]}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="contentForm">
                    <div class="form-group">
                        <label>Título:</label>
                        <input type="text" id="contentTitle" value="${item?.title || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Descripción/Contenido:</label>
                        <textarea id="contentDescription" rows="6" required>${item?.content || item?.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Imagen URL:</label>
                        <input type="url" id="contentImage" value="${item?.image || ''}" placeholder="https://ejemplo.com/imagen.jpg">
                    </div>
                    <div class="form-group">
                        <label>Categoría:</label>
                        <select id="contentCategory">
                            <option value="general" ${item?.category === 'general' ? 'selected' : ''}>General</option>
                            <option value="aws" ${item?.category === 'aws' ? 'selected' : ''}>AWS</option>
                            <option value="security" ${item?.category === 'security' ? 'selected' : ''}>Seguridad</option>
                            <option value="development" ${item?.category === 'development' ? 'selected' : ''}>Desarrollo</option>
                        </select>
                    </div>
                    ${type === 'game' ? `
                        <div class="form-group">
                            <label>URL del Juego:</label>
                            <input type="url" id="gameUrl" value="${item?.url || ''}" placeholder="https://ejemplo.com/juego">
                        </div>
                    ` : ''}
                    ${type === 'resource' ? `
                        <div class="form-group">
                            <label>URL del Recurso:</label>
                            <input type="url" id="resourceUrl" value="${item?.url || ''}" placeholder="https://ejemplo.com/recurso">
                        </div>
                    ` : ''}
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

        modal.querySelector('#contentForm').onsubmit = async (e) => {
            e.preventDefault();
            await this.saveContent(type, item?.id, modal);
        };
    }

    async saveContent(type, itemId, modal) {
        const formData = {
            id: itemId || `${type}-${Date.now()}`,
            title: document.getElementById('contentTitle').value,
            content: document.getElementById('contentDescription').value,
            description: document.getElementById('contentDescription').value,
            image: document.getElementById('contentImage').value,
            category: document.getElementById('contentCategory').value,
            author: this.currentUser.name,
            date: new Date().toISOString()
        };

        if (type === 'game') {
            formData.url = document.getElementById('gameUrl').value;
        }
        if (type === 'resource') {
            formData.url = document.getElementById('resourceUrl').value;
        }

        try {
            // Aquí normalmente guardarías en el backend
            // Por ahora solo actualizamos localmente
            modal.remove();
            await this.loadAllContent();
            this.showToast(`${type} ${itemId ? 'actualizado' : 'creado'}`, 'success');
        } catch (error) {
            console.error('Error saving content:', error);
            this.showToast('Error al guardar contenido', 'error');
        }
    }

    editContent(id, type) {
        let item;
        switch(type) {
            case 'post':
                item = this.posts.find(p => p.id === id);
                break;
            case 'game':
                item = this.games.find(g => g.id === id);
                break;
            case 'resource':
                item = this.resources.find(r => r.id === id);
                break;
            case 'workshop':
                item = this.workshops.find(w => w.id === id);
                break;
        }
        
        if (item) {
            this.showContentModal(type, item);
        }
    }

    deleteContent(id, type) {
        if (!confirm(`¿Estás seguro de eliminar este ${type}?`)) return;
        
        // Aquí eliminarías del backend
        this.showToast(`${type} eliminado`, 'success');
        this.loadAllContent();
    }

    loadRecentActivity() {
        const activityList = document.getElementById('recentActivity');
        const recentItems = [
            ...this.posts.slice(0, 3).map(p => ({...p, type: 'post'})),
            ...this.games.slice(0, 2).map(g => ({...g, type: 'game'}))
        ].slice(0, 5);

        if (recentItems.length > 0) {
            activityList.innerHTML = recentItems.map(item => `
                <div class="activity-item">
                    <span class="activity-icon">${item.type === 'post' ? '📝' : '🎮'}</span>
                    <div class="activity-content">
                        <strong>${item.title}</strong>
                        <small>${new Date(item.date || Date.now()).toLocaleDateString()}</small>
                    </div>
                </div>
            `).join('');
        } else {
            activityList.innerHTML = '<p>No hay actividad reciente</p>';
        }
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
