// Admin Panel - Integrado con el tema original
const API_BASE = 'https://fklo6233x5.execute-api.us-east-1.amazonaws.com/prod';

class Admin {
    constructor() {
        this.data = { posts: [], events: [], games: [], resources: [], users: [] };
        this.currentSection = 'dashboard';
        this.verifyAccess();
    }

    verifyAccess() {
        // Verificación adicional usando el AuthManager existente
        if (window.authManager && !window.authManager.isAdministrator()) {
            window.location.replace('/admin-denied.html');
            return false;
        }
        
        // Activar clase de autorización para mostrar contenido
        document.body.classList.add('admin-authorized');
        return true;
    }

    async init() {
        // Verificación periódica cada 30 segundos
        setInterval(() => this.verifyAccess(), 30000);
        
        await this.loadData();
        this.setupNavigation();
        this.showSection('dashboard');
    }

    setupNavigation() {
        document.querySelectorAll('#admin-nav-tabs .tab-header').forEach(tab => {
            tab.onclick = () => {
                document.querySelectorAll('#admin-nav-tabs .tab-header').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.showSection(tab.dataset.section);
            };
        });
    }

    async loadData() {
        const token = sessionStorage.getItem('accessToken');
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        try {
            // Cargar usuarios reales
            try {
                const usersRes = await fetch(`${API_BASE}/users`, { headers });
                if (usersRes.ok) {
                    this.data.users = await usersRes.json();
                } else {
                    console.error('Failed to load users');
                    this.data.users = [];
                }
            } catch (e) {
                console.error('Error fetching users:', e);
                this.data.users = [];
            }
            
            // Note: The rest of the data loading is for content, which uses a different API.
            // This part can be refactored later if needed.
            // Cargar posts
            try {
                const feedRes = await fetch(`https://js62x5k3y8.execute-api.us-east-1.amazonaws.com/content/feed.json`);
                if (feedRes.ok) {
                    const feedData = await feedRes.json();
                    this.data.posts = feedData.posts || feedData || [];
                }
            } catch (e) {
                 this.data.posts = [];
            }

            // Cargar eventos
            try {
                const eventsRes = await fetch(`https://js62x5k3y8.execute-api.us-east-1.amazonaws.com/content/events.json`);
                if (eventsRes.ok) {
                    const eventsData = await eventsRes.json();
                    this.data.events = Array.isArray(eventsData) ? eventsData : [];
                }
            } catch (e) {
                this.data.events = [];
            }

            // Cargar juegos
            try {
                const gamesRes = await fetch(`https://js62x5k3y8.execute-api.us-east-1.amazonaws.com/content/logic-games.json`);
                if (gamesRes.ok) {
                    const gamesData = await gamesRes.json();
                    this.data.games = Array.isArray(gamesData) ? gamesData : [];
                }
            } catch (e) {
                this.data.games = [];
            }

            // Cargar recursos
            try {
                const resourcesRes = await fetch(`https://js62x5k3y8.execute-api.us-east-1.amazonaws.com/content/resources.json`);
                if (resourcesRes.ok) {
                    const resourcesData = await resourcesRes.json();
                    this.data.resources = [];
                    if (Array.isArray(resourcesData)) {
                        resourcesData.forEach(category => {
                            if (category.items) {
                                this.data.resources.push(...category.items);
                            }
                        });
                    }
                }
            } catch (e) {
                this.data.resources = [];
            }

        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    showSection(section) {
        this.currentSection = section;
        const content = document.getElementById('admin-content');
        
        switch(section) {
            case 'dashboard':
                content.innerHTML = this.renderDashboard();
                break;
            case 'content':
                content.innerHTML = this.renderContent();
                this.setupContentFilters();
                break;
            case 'users':
                content.innerHTML = this.renderUsers();
                break;
        }
    }

    renderDashboard() {
        return `
            <div class="admin-stats">
                <div class="admin-stat-card">
                    <span class="admin-stat-number">${this.data.posts.length}</span>
                    <div class="admin-stat-label">📝 Posts</div>
                </div>
                <div class="admin-stat-card">
                    <span class="admin-stat-number">${this.data.events.length}</span>
                    <div class="admin-stat-label">📅 Eventos</div>
                </div>
                <div class="admin-stat-card">
                    <span class="admin-stat-number">${this.data.games.length}</span>
                    <div class="admin-stat-label">🎮 Juegos</div>
                </div>
                <div class="admin-stat-card">
                    <span class="admin-stat-number">${this.data.resources.length}</span>
                    <div class="admin-stat-label">📚 Recursos</div>
                </div>
                <div class="admin-stat-card">
                    <span class="admin-stat-number">${this.data.users.length}</span>
                    <div class="admin-stat-label">👥 Usuarios</div>
                </div>
            </div>
            
            <div style="display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;">
                <button class="admin-action-btn" onclick="admin.createContent('post')">📝 Nuevo Post</button>
                <button class="admin-action-btn" onclick="admin.createContent('event')">📅 Nuevo Evento</button>
            </div>
            
            <div class="admin-card" style="background: var(--bg-card); padding: 1.5rem;">
                <h3 style="color: var(--text-primary);">🦈 Panel de Administración Tiburón</h3>
                <p>Gestiona todo el contenido del AWS User Group Playa Vicente desde este panel integrado.</p>
            </div>
        `;
    }

    renderContent() {
        const allContent = [
            ...this.data.posts.map(p => ({...p, type: 'post'})),
            ...this.data.events.map(e => ({...e, type: 'event'})),
            ...this.data.games.map(g => ({...g, type: 'game'})),
            ...this.data.resources.map(r => ({...r, type: 'resource'}))
        ];

        return `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
                <h2>Gestión de Contenido</h2>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="admin-action-btn" onclick="admin.createContent('post')">📝 Nuevo Post</button>
                    <button class="admin-action-btn" onclick="admin.createContent('event')">📅 Nuevo Evento</button>
                </div>
            </div>
            
            <div class="admin-filters" style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; margin: 1.5rem 0;">
                <input type="search" id="admin-search-bar" placeholder="🔍 Buscar por título..." class="admin-form-input" style="max-width: 300px; flex-grow: 1;">
                <div class="admin-filter-buttons" style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    <button class="tab-header active" data-filter="all">Todos</button>
                    <button class="tab-header" data-filter="post">📝 Posts</button>
                    <button class="tab-header" data-filter="event">📅 Eventos</button>
                    <button class="tab-header" data-filter="game">🎮 Juegos</button>
                    <button class="tab-header" data-filter="resource">📚 Recursos</button>
                </div>
            </div>
            
            <div id="content-list" class="labs-grid" style="margin-top: 2rem;">
                ${this.renderContentList(allContent)}
            </div>
        `;
    }

    renderContentList(items) {
        if (items.length === 0) {
            return `
                <div class="admin-empty" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                    <h3>No se encontró contenido</h3>
                    <p>Intenta con otro filtro o término de búsqueda.</p>
                </div>
            `;
        }

        return items.map(item => `
            <div class="lab-module">
                <div class="lab-card-content">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                        <h3 style="font-size: 1.1rem; color: var(--text-primary); margin: 0;">${this.getIconForType(item.type)} ${item.title || 'Sin título'}</h3>
                        <span class="tag">${item.type}</span>
                    </div>
                    <p style="font-size: 0.9rem; flex-grow: 1; color: var(--text-secondary); margin-bottom: 1rem;">
                        ${(item.content || item.description || '').substring(0, 100)}...
                    </p>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1.5rem;">
                        ${item.date ? `<span>📅 ${new Date(item.date).toLocaleDateString()}</span>` : ''}
                        ${item.status ? `<span style="margin-left: 10px;">🔘 ${item.status}</span>` : ''}
                    </div>
                    <div class="admin-card-actions">
                        <button class="admin-action-btn" onclick="admin.editContent('${item.type}', '${item.id || item.title}')">Editar</button>
                        <button class="admin-action-btn danger" onclick="admin.deleteContent('${item.type}', '${item.id || item.title}')">Eliminar</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getIconForType(type) {
        switch(type) {
            case 'post': return '📝';
            case 'event': return '📅';
            case 'game': return '🎮';
            case 'resource': return '📚';
            default: return '📄';
        }
    }

    setupContentFilters() {
        document.querySelectorAll('.admin-filter-buttons .tab-header').forEach(filter => {
            filter.onclick = () => {
                document.querySelectorAll('.admin-filter-buttons .tab-header').forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                this.filterContent();
            };
        });
        document.getElementById('admin-search-bar').oninput = () => this.filterContent();
    }

    filterContent() {
        const type = document.querySelector('.admin-filter-buttons .tab-header.active').dataset.filter;
        const searchTerm = document.getElementById('admin-search-bar').value.toLowerCase();

        const allContent = [
            ...this.data.posts.map(p => ({...p, type: 'post'})),
            ...this.data.events.map(e => ({...e, type: 'event'})),
            ...this.data.games.map(g => ({...g, type: 'game'})),
            ...this.data.resources.map(r => ({...r, type: 'resource'}))
        ];
        
        let filteredByType = type === 'all' ? allContent : allContent.filter(item => item.type === type);

        let finalFiltered = filteredByType;
        if (searchTerm) {
            finalFiltered = filteredByType.filter(item => (item.title || '').toLowerCase().includes(searchTerm));
        }

        document.getElementById('content-list').innerHTML = this.renderContentList(finalFiltered);
    }

    renderUsers() {
        return `
            <h2>Gestión de Usuarios</h2>
            <div class="admin-grid">
                ${this.data.users.map(user => `
                    <div class="admin-card">
                        <div class="admin-card-header">
                            <h3 class="admin-card-title">${user.name}</h3>
                            <span class="admin-card-type">${user.role}</span>
                        </div>
                        <div class="admin-card-content">${user.email}</div>
                        <div class="admin-card-meta">
                            <span>${user.status === 'active' ? '🟢 Activo' : '🔴 Inactivo'}</span>
                        </div>
                        <div class="admin-card-actions">
                            <button class="admin-action-btn" onclick="admin.editUser(${user.id})">Editar Rol</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    createContent(type) {
        this.showModal(`Crear ${type}`, this.getForm(type), (data) => {
            this.saveContent(type, null, data);
        });
    }

    editContent(type, id) {
        const item = this.findItem(type, id);
        this.showModal(`Editar ${type}`, this.getForm(type, item), (data) => {
            this.saveContent(type, id, data);
        });
    }

    editUser(id) {
        const user = this.data.users.find(u => u.id === id);
        this.showModal('Editar Usuario', `
            <div class="admin-form-group">
                <label class="admin-form-label">Usuario: ${user.name}</label>
            </div>
            <div class="admin-form-group">
                <label class="admin-form-label">Rol:</label>
                <select name="role" class="admin-form-input">
                    <option value="Explorador" ${user.role === 'Explorador' ? 'selected' : ''}>🧭 Explorador</option>
                    <option value="Navegante" ${user.role === 'Navegante' ? 'selected' : ''}>⛵ Navegante</option>
                    <option value="Corsario" ${user.role === 'Corsario' ? 'selected' : ''}>⚔️ Corsario</option>
                    <option value="Capitán" ${user.role === 'Capitán' ? 'selected' : ''}>🚢 Capitán</option>
                    <option value="Admin" ${user.role === 'Admin' ? 'selected' : ''}>👑 Admin</option>
                </select>
            </div>
        `, (data) => {
            user.role = data.role;
            this.showToast('Usuario actualizado correctamente', 'success');
            this.showSection('users');
        });
    }

    getForm(type, item = null) {
        let form = `
            <div class="admin-form-group">
                <label class="admin-form-label">Título:</label>
                <input name="title" class="admin-form-input" value="${item?.title || ''}" required>
            </div>
            <div class="admin-form-group">
                <label class="admin-form-label">Descripción:</label>
                <textarea name="description" class="admin-form-input admin-form-textarea" required>${item?.description || item?.content || ''}</textarea>
            </div>
        `;

        if (type === 'event') {
            form += `
                <div class="admin-form-group">
                    <label class="admin-form-label">Estado:</label>
                    <select name="status" class="admin-form-input">
                        <option value="abierto" ${item?.status === 'abierto' ? 'selected' : ''}>🟢 Abierto</option>
                        <option value="cerrado" ${item?.status === 'cerrado' ? 'selected' : ''}>🔴 Cerrado</option>
                        <option value="cancelado" ${item?.status === 'cancelado' ? 'selected' : ''}>⚫ Cancelado</option>
                    </select>
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Fecha:</label>
                    <input name="date" type="datetime-local" class="admin-form-input" value="${item?.date ? new Date(item.date).toISOString().slice(0,16) : ''}">
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Ubicación:</label>
                    <input name="location" class="admin-form-input" value="${item?.location || ''}">
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">URL de Registro:</label>
                    <input name="registrationUrl" type="url" class="admin-form-input" value="${item?.registrationUrl || ''}">
                </div>
            `;
        } else if (type === 'game' || type === 'resource') {
            form += `
                <div class="admin-form-group">
                    <label class="admin-form-label">URL:</label>
                    <input name="url" type="url" class="admin-form-input" value="${item?.url || ''}" required>
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Imagen:</label>
                    <input name="image" type="url" class="admin-form-input" value="${item?.image || ''}">
                </div>
            `;
        }

        return form;
    }

    showModal(title, content, onSave) {
        const modal = document.createElement('div');
        modal.className = 'admin-modal';
        modal.innerHTML = `
            <div class="admin-modal-content">
                <div class="admin-modal-header">
                    <h3 class="admin-modal-title">${title}</h3>
                    <button class="admin-modal-close">&times;</button>
                </div>
                <form class="admin-modal-body">
                    ${content}
                </form>
                <div class="admin-modal-actions">
                    <button type="button" class="admin-btn admin-btn-secondary modal-cancel">Cancelar</button>
                    <button type="button" class="admin-btn modal-save">Guardar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.admin-modal-close').onclick = () => modal.remove();
        modal.querySelector('.modal-cancel').onclick = () => modal.remove();
        modal.onclick = (e) => e.target === modal && modal.remove();

        modal.querySelector('.modal-save').onclick = () => {
            const form = modal.querySelector('form');
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            onSave(data);
            modal.remove();
        };
    }

    async saveContent(type, id, data) {
        console.log('💾 Guardando:', type, data);
        
        if (type === 'post') {
            const postData = {
                ...data,
                id: id || `post-${Date.now()}`,
                date: new Date().toISOString(),
                author: { name: 'Roberto Flores', avatar: '' }
            };
            
            if (id) {
                const index = this.data.posts.findIndex(p => p.id === id);
                if (index >= 0) this.data.posts[index] = postData;
            } else {
                this.data.posts.unshift(postData);
            }
            
            await this.saveToS3('feed.json', { posts: this.data.posts });
        } else if (type === 'event') {
            const eventData = { ...data, id: id || `event-${Date.now()}` };
            
            if (id) {
                const index = this.data.events.findIndex(e => e.id === id);
                if (index >= 0) this.data.events[index] = eventData;
            } else {
                this.data.events.push(eventData);
            }
            
            await this.saveToS3('events.json', this.data.events);
        }
        
        this.showToast('Contenido guardado exitosamente', 'success');
        this.showSection('content');
    }

    async saveToS3(fileName, content) {
        try {
            const response = await fetch(`${API_BASE}/save-content`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName, content })
            });
            
            if (response.ok) {
                console.log('✅ Guardado en S3');
            } else {
                console.error('❌ Error en S3');
            }
        } catch (error) {
            console.error('❌ Error de red:', error);
        }
    }

    findItem(type, id) {
        const data = type === 'post' ? this.data.posts : 
                     type === 'event' ? this.data.events :
                     type === 'game' ? this.data.games : this.data.resources;
        return data.find(item => item.id === id);
    }

    deleteContent(type, id) {
        if (confirm('¿Estás seguro de eliminar este elemento?')) {
            if (type === 'post') {
                this.data.posts = this.data.posts.filter(p => p.id !== id);
            } else if (type === 'event') {
                this.data.events = this.data.events.filter(e => e.id !== id);
            }
            this.showToast('Elemento eliminado', 'success');
            this.showSection('content');
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `admin-toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => toast.remove(), 3000);
    }
}

// Inicializar cuando el DOM esté listo
let admin;
document.addEventListener('DOMContentLoaded', () => {
    admin = new Admin();
    admin.init();
});