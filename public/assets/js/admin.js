// =============================================================================
// ADMIN PANEL - GESTIÓN COMPLETA DE CONTENIDOS
// =============================================================================

const API_BASE_URL = 'https://fklo6233x5.execute-api.us-east-1.amazonaws.com/prod';

class AdminPanel {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.posts = [];
        this.events = [];
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
        
        document.getElementById('addEventBtn')?.addEventListener('click', () => {
            this.showContentModal('event');
        });

        document.getElementById('addGameBtn')?.addEventListener('click', () => {
            this.showContentModal('game');
        });
        
        document.getElementById('addResourceBtn')?.addEventListener('click', () => {
            this.showContentModal('resource');
        });

        document.getElementById('addWorkshopBtn')?.addEventListener('click', () => {
            this.showContentModal('workshop');
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
            case 'users':
                await this.loadUsersData();
                break;
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
                this.loadEventsData(),
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
            // Usar Lambda para obtener datos con CORS correcto
            const response = await fetch(`${API_BASE_URL}/get-content/feed.json`);
            if (response.ok) {
                const data = await response.json();
                this.posts = data.posts || data || [];
                this.posts = this.posts.map((post, index) => ({
                    ...post,
                    id: post.id || `post-${index}`,
                    type: 'post'
                }));
                return;
            }
        } catch (error) {
            console.log('Lambda no disponible, cargando desde local:', error);
        }
        
        // Fallback a archivo local
        try {
            const response = await fetch('/assets/data/feed.json');
            const data = await response.json();
            this.posts = data.posts || data || [];
            this.posts = this.posts.map((post, index) => ({
                ...post,
                id: post.id || `post-${index}`,
                type: 'post'
            }));
        } catch (error) {
            console.error('Error loading posts:', error);
            this.posts = [];
        }
    }

    async loadEventsData() {
        try {
            // Usar Lambda para obtener datos con CORS correcto
            const response = await fetch(`${API_BASE_URL}/get-content/events.json`);
            if (response.ok) {
                const data = await response.json();
                this.events = Array.isArray(data) ? data : (data.events || []);
                this.events = this.events.map((event, index) => ({
                    ...event,
                    id: event.id || `event-${index}`,
                    type: 'event'
                }));
                return;
            }
        } catch (error) {
            console.log('Lambda no disponible, cargando desde local:', error);
        }
        
        // Fallback a archivo local
        try {
            const response = await fetch('/assets/data/events.json');
            const data = await response.json();
            this.events = Array.isArray(data) ? data : (data.events || []);
            this.events = this.events.map((event, index) => ({
                ...event,
                id: event.id || `event-${index}`,
                type: 'event'
            }));
        } catch (error) {
            console.error('Error loading events:', error);
            this.events = [];
        }
    }

    async loadGamesData() {
        try {
            // Intentar cargar desde S3 primero
            const s3Response = await fetch('https://tiburon-content-bucket.s3.amazonaws.com/assets/data/logic-games.json');
            if (s3Response.ok) {
                const data = await s3Response.json();
                this.games = Array.isArray(data) ? data : (data.games || []);
                this.games = this.games.map((game, index) => ({
                    ...game,
                    id: game.id || `game-${index}`,
                    type: 'game'
                }));
                return;
            }
        } catch (error) {
            console.log('S3 no disponible, cargando desde local:', error);
        }
        
        // Fallback a archivo local
        try {
            const response = await fetch('/assets/data/logic-games.json');
            const data = await response.json();
            this.games = Array.isArray(data) ? data : (data.games || []);
            this.games = this.games.map((game, index) => ({
                ...game,
                id: game.id || `game-${index}`,
                type: 'game'
            }));
        } catch (error) {
            console.error('Error loading games:', error);
            this.games = [];
        }
    }

    async loadResourcesData() {
        try {
            // Intentar cargar desde S3 primero
            const s3Response = await fetch('https://tiburon-content-bucket.s3.amazonaws.com/assets/data/resources.json');
            if (s3Response.ok) {
                const data = await s3Response.json();
                this.resources = Array.isArray(data) ? data : (data.resources || []);
                this.resources = this.resources.map((resource, index) => ({
                    ...resource,
                    id: resource.id || `resource-${index}`,
                    type: 'resource'
                }));
                return;
            }
        } catch (error) {
            console.log('S3 no disponible, cargando desde local:', error);
        }
        
        // Fallback a archivo local
        try {
            const response = await fetch('/assets/data/resources.json');
            const data = await response.json();
            this.resources = Array.isArray(data) ? data : (data.resources || []);
            this.resources = this.resources.map((resource, index) => ({
                ...resource,
                id: resource.id || `resource-${index}`,
                type: 'resource'
            }));
        } catch (error) {
            console.error('Error loading resources:', error);
            this.resources = [];
        }
    }

    async loadWorkshopsData() {
        try {
            // Intentar cargar desde S3 primero
            const s3Response = await fetch('https://tiburon-content-bucket.s3.amazonaws.com/assets/data/workshops.json');
            if (s3Response.ok) {
                const data = await s3Response.json();
                this.workshops = Array.isArray(data) ? data : (data.workshops || []);
                this.workshops = this.workshops.map((workshop, index) => ({
                    ...workshop,
                    id: workshop.id || `workshop-${index}`,
                    type: 'workshop'
                }));
                return;
            }
        } catch (error) {
            console.log('S3 no disponible, cargando desde local:', error);
        }
        
        // Fallback a archivo local
        try {
            const response = await fetch('/assets/data/workshops.json');
            const data = await response.json();
            this.workshops = Array.isArray(data) ? data : (data.workshops || []);
            this.workshops = this.workshops.map((workshop, index) => ({
                ...workshop,
                id: workshop.id || `workshop-${index}`,
                type: 'workshop'
            }));
        } catch (error) {
            console.error('Error loading workshops:', error);
            this.workshops = [];
        }
    }

    filterContent(filter) {
        const allContent = [
            ...this.posts.map(item => ({...item, type: 'post'})),
            ...this.games.map(item => ({...item, type: 'game'})),
            ...this.resources.map(item => ({...item, type: 'resource'})),
            ...this.workshops.map(item => ({...item, type: 'workshop'}))
        ];

        let filteredContent = allContent;
        
        if (filter !== 'all') {
            filteredContent = allContent.filter(item => item.type === filter);
        }

        this.renderFilteredContent(filteredContent);
    }

    renderFilteredContent(content) {
        const contentList = document.getElementById('postsList');
        if (!contentList) return;

        if (content.length === 0) {
            contentList.innerHTML = '<p>No hay contenido disponible</p>';
            return;
        }

        contentList.innerHTML = content.map(item => `
            <div class="content-item" data-id="${item.id}" data-type="${item.type}">
                <div class="content-header">
                    <h3>${item.title}</h3>
                    <div class="content-badges">
                        <span class="content-type type-${item.type}">${item.type}</span>
                        ${item.category ? `<span class="content-category">${item.category}</span>` : ''}
                    </div>
                </div>
                <div class="content-body">
                    ${item.image ? `<img src="${item.image}" alt="${item.title}" class="content-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0yMCAyNkM5IDI2IDkgMTQgMjAgMTRTMzEgMjYgMjAgMjZaIiBmaWxsPSIjOWNhM2FmIi8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjMiIGZpbGw9IiM5Y2EzYWYiLz4KPC9zdmc+'; this.onerror=null;">` : ''}
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

    renderAllContent() {
        const allContent = [
            ...this.posts.map(item => ({...item, type: 'post'})),
            ...this.events.map(item => ({...item, type: 'event'})),
            ...this.games.map(item => ({...item, type: 'game'})),
            ...this.resources.map(item => ({...item, type: 'resource'})),
            ...this.workshops.map(item => ({...item, type: 'workshop'}))
        ];

        this.renderFilteredContent(allContent);
    }

    showContentModal(type, item = null) {
        // Cerrar modal existente si hay uno
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }

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
                    ${type === 'game' || type === 'resource' ? `
                        <div class="form-group">
                            <label>URL:</label>
                            <input type="url" id="contentUrl" value="${item?.url || ''}" placeholder="https://ejemplo.com">
                        </div>
                    ` : ''}
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary modal-cancel">Cancelar</button>
                        <button type="submit" class="btn-primary">${isEdit ? 'Actualizar' : 'Crear'}</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('.modal-close').onclick = () => modal.remove();
        modal.querySelector('.modal-cancel').onclick = () => modal.remove();
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

        // Agregar URL si existe el campo
        const urlField = document.getElementById('contentUrl');
        if (urlField) {
            formData.url = urlField.value;
        }

        try {
            // Actualizar localmente primero
            this.updateLocalContent(type, formData);
            
            // Guardar en S3 a través de Lambda
            await this.saveToS3(type);
            
            modal.remove();
            this.renderAllContent();
            this.showToast(`✅ ${type} ${itemId ? 'actualizado' : 'creado'} y guardado en AWS S3`, 'success');
            
        } catch (error) {
            console.error('Error saving content:', error);
            this.showToast('❌ Error al guardar en S3. Cambios solo locales.', 'error');
        }
    }

    async saveToS3(type) {
        const fileMap = {
            'post': 'feed.json',
            'event': 'events.json',
            'game': 'logic-games.json',
            'resource': 'resources.json',
            'workshop': 'workshops.json'
        };

        const fileName = fileMap[type];
        if (!fileName) return;

        // Preparar datos para guardar
        let dataToSave;
        switch(type) {
            case 'post':
                dataToSave = { posts: this.posts };
                break;
            case 'game':
                dataToSave = this.games; // Array directo
                break;
            case 'resource':
                dataToSave = { resources: this.resources };
                break;
            case 'workshop':
                dataToSave = { workshops: this.workshops };
                break;
        }

        // Llamar a Lambda para guardar en S3
        const response = await fetch(`${API_BASE_URL}/save-content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({
                fileName: fileName,
                content: dataToSave
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Error guardando en S3: ${error}`);
        }

        const result = await response.json();
        console.log('Guardado en S3:', result);
    }

    updateLocalContent(type, formData) {
        let targetArray;
        switch(type) {
            case 'post':
                targetArray = this.posts;
                break;
            case 'game':
                targetArray = this.games;
                break;
            case 'resource':
                targetArray = this.resources;
                break;
            case 'workshop':
                targetArray = this.workshops;
                break;
        }

        if (targetArray) {
            const existingIndex = targetArray.findIndex(item => item.id === formData.id);
            if (existingIndex >= 0) {
                // Actualizar existente
                targetArray[existingIndex] = { ...targetArray[existingIndex], ...formData };
            } else {
                // Agregar nuevo
                targetArray.push(formData);
            }
        }
    }

    async saveToS3(type, formData) {
        const fileMap = {
            'post': 'feed.json',
            'game': 'logic-games.json',
            'resource': 'resources.json',
            'workshop': 'workshops.json'
        };

        const fileName = fileMap[type];
        if (!fileName) return;

        // Preparar datos para guardar
        let dataToSave;
        switch(type) {
            case 'post':
                dataToSave = { posts: this.posts };
                break;
            case 'game':
                dataToSave = this.games; // Array directo
                break;
            case 'resource':
                dataToSave = { resources: this.resources };
                break;
            case 'workshop':
                dataToSave = { workshops: this.workshops };
                break;
        }

        // Llamar a Lambda para guardar en S3
        const response = await fetch(`${API_BASE_URL}/save-content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({
                fileName: fileName,
                content: dataToSave
            })
        });

        if (!response.ok) {
            throw new Error('Error guardando en S3');
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

    async loadUsersData() {
        // Datos simulados de usuarios para demostración
        const mockUsers = [
            { id: 1, name: 'Roberto Flores', email: 'roberto.flores@siegfried-fs.com', status: 'active', role: 'admin', lastLogin: '2025-11-24' },
            { id: 2, name: 'Ana García', email: 'ana.garcia@example.com', status: 'active', role: 'user', lastLogin: '2025-11-23' },
            { id: 3, name: 'Carlos López', email: 'carlos.lopez@example.com', status: 'inactive', role: 'user', lastLogin: '2025-11-20' },
            { id: 4, name: 'María Rodríguez', email: 'maria.rodriguez@example.com', status: 'active', role: 'user', lastLogin: '2025-11-24' },
            { id: 5, name: 'Juan Pérez', email: 'juan.perez@example.com', status: 'inactive', role: 'user', lastLogin: '2025-11-15' }
        ];
        
        this.users = mockUsers;
        this.renderUsersStats();
        this.renderUsersList();
        this.setupUsersFilters();
    }

    renderUsersStats() {
        const total = this.users.length;
        const active = this.users.filter(u => u.status === 'active').length;
        const inactive = this.users.filter(u => u.status === 'inactive').length;
        
        document.getElementById('totalUsers').textContent = total;
        document.getElementById('activeUsers').textContent = active;
        document.getElementById('inactiveUsers').textContent = inactive;
    }

    renderUsersList(filter = 'all') {
        let filteredUsers = this.users;
        
        if (filter !== 'all') {
            if (filter === 'admin') {
                filteredUsers = this.users.filter(u => u.role === 'admin');
            } else {
                filteredUsers = this.users.filter(u => u.status === filter);
            }
        }
        
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = filteredUsers.map(user => `
            <div class="user-card">
                <div class="user-info">
                    <div class="user-avatar">${user.name.charAt(0)}</div>
                    <div class="user-details">
                        <h4>${user.name}</h4>
                        <p>${user.email}</p>
                        <small>Último acceso: ${user.lastLogin}</small>
                    </div>
                </div>
                <div class="user-status">
                    <span class="status-badge ${user.status}">${user.status === 'active' ? '🟢 Activo' : '🔴 Inactivo'}</span>
                    <span class="role-badge ${user.role}">${user.role === 'admin' ? '👑 Admin' : '👤 Usuario'}</span>
                </div>
                <div class="user-actions">
                    <button class="btn-small" onclick="adminPanel.toggleUserStatus(${user.id})">
                        ${user.status === 'active' ? 'Desactivar' : 'Activar'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    setupUsersFilters() {
        const filterButtons = document.querySelectorAll('.users-filters .filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderUsersList(btn.dataset.filter);
            });
        });
    }

    toggleUserStatus(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            user.status = user.status === 'active' ? 'inactive' : 'active';
            this.renderUsersStats();
            this.renderUsersList();
            this.showToast(`Usuario ${user.status === 'active' ? 'activado' : 'desactivado'}`, 'success');
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
