// Admin Panel - Integrado con el tema original
const API_BASE = 'https://fklo6233x5.execute-api.us-east-1.amazonaws.com/prod';

class Admin {
    constructor() {
        this.data = { posts: [], events: [], games: [], resources: [], users: [] };
        this.currentSection = 'dashboard';
    }

    async init() {
        await this.loadData();
        this.setupNavigation();
        this.showSection('dashboard');
    }

    setupNavigation() {
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.onclick = () => {
                document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.showSection(tab.dataset.section);
            };
        });
    }

    async loadData() {
        try {
            // Cargar posts
            try {
                const feedRes = await fetch(`${API_BASE}/get-content/feed.json`);
                if (feedRes.ok) {
                    const feedData = await feedRes.json();
                    this.data.posts = feedData.posts || feedData || [];
                }
            } catch (e) {
                this.data.posts = [
                    {
                        id: 'post-1',
                        title: 'Bienvenidos al AWS User Group',
                        content: 'Comunidad de tecnología en la nube',
                        date: new Date().toISOString(),
                        author: { name: 'Roberto Flores', avatar: '' }
                    }
                ];
            }

            // Cargar eventos
            try {
                const eventsRes = await fetch(`${API_BASE}/get-content/events.json`);
                if (eventsRes.ok) {
                    const eventsData = await eventsRes.json();
                    this.data.events = Array.isArray(eventsData) ? eventsData : [];
                }
            } catch (e) {
                this.data.events = [];
            }

            // Cargar juegos
            try {
                const gamesRes = await fetch(`${API_BASE}/get-content/logic-games.json`);
                if (gamesRes.ok) {
                    const gamesData = await gamesRes.json();
                    this.data.games = Array.isArray(gamesData) ? gamesData : [];
                }
            } catch (e) {
                this.data.games = [];
            }

            // Cargar recursos
            try {
                const resourcesRes = await fetch(`${API_BASE}/get-content/resources.json`);
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

            // Usuarios mock
            this.data.users = [
                { id: 1, name: 'Roberto Flores', email: 'roberto.ciberseguridad@gmail.com', role: 'Admin', status: 'active' },
                { id: 2, name: 'Roberto Flores', email: 'ingblack13@gmail.com', role: 'Explorador', status: 'active' }
            ];

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
                <button class="admin-btn" onclick="admin.createContent('post')">📝 Nuevo Post</button>
                <button class="admin-btn" onclick="admin.createContent('event')">📅 Nuevo Evento</button>
                <button class="admin-btn admin-btn-secondary" onclick="admin.createContent('game')">🎮 Nuevo Juego</button>
                <button class="admin-btn admin-btn-secondary" onclick="admin.createContent('resource')">📚 Nuevo Recurso</button>
            </div>
            
            <div class="admin-card">
                <h3>🦈 Panel de Administración Tiburón</h3>
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
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2>Gestión de Contenido</h2>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="admin-btn admin-btn-sm" onclick="admin.createContent('post')">+ Post</button>
                    <button class="admin-btn admin-btn-sm" onclick="admin.createContent('event')">+ Evento</button>
                    <button class="admin-btn admin-btn-sm" onclick="admin.createContent('game')">+ Juego</button>
                    <button class="admin-btn admin-btn-sm" onclick="admin.createContent('resource')">+ Recurso</button>
                </div>
            </div>
            
            <div class="admin-filters">
                <button class="admin-filter active" data-filter="all">Todos (${allContent.length})</button>
                <button class="admin-filter" data-filter="post">📝 Posts (${this.data.posts.length})</button>
                <button class="admin-filter" data-filter="event">📅 Eventos (${this.data.events.length})</button>
                <button class="admin-filter" data-filter="game">🎮 Juegos (${this.data.games.length})</button>
                <button class="admin-filter" data-filter="resource">📚 Recursos (${this.data.resources.length})</button>
            </div>
            
            <div id="content-list" class="admin-grid">
                ${this.renderContentList(allContent)}
            </div>
        `;
    }

    renderContentList(items) {
        if (items.length === 0) {
            return `
                <div class="admin-empty">
                    <div class="admin-empty-title">No hay contenido</div>
                    <p>Crea tu primer elemento de contenido</p>
                    <button class="admin-btn" onclick="admin.createContent('post')">📝 Crear Post</button>
                </div>
            `;
        }

        return items.map(item => `
            <div class="admin-card">
                <div class="admin-card-header">
                    <h3 class="admin-card-title">${item.title || 'Sin título'}</h3>
                    <span class="admin-card-type">${item.type}</span>
                </div>
                <div class="admin-card-content">
                    ${(item.content || item.description || '').substring(0, 120)}...
                </div>
                <div class="admin-card-meta">
                    ${item.date ? `<span>📅 ${new Date(item.date).toLocaleDateString()}</span>` : ''}
                    ${item.status ? `<span>🔘 ${item.status}</span>` : ''}
                    ${item.location ? `<span>📍 ${item.location}</span>` : ''}
                </div>
                <div class="admin-card-actions">
                    <button class="admin-btn admin-btn-sm admin-btn-secondary" onclick="admin.editContent('${item.type}', '${item.id}')">Editar</button>
                    <button class="admin-btn admin-btn-sm admin-btn-danger" onclick="admin.deleteContent('${item.type}', '${item.id}')">Eliminar</button>
                </div>
            </div>
        `).join('');
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
                            <button class="admin-btn admin-btn-sm admin-btn-secondary" onclick="admin.editUser(${user.id})">Editar Rol</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    setupContentFilters() {
        document.querySelectorAll('.admin-filter').forEach(filter => {
            filter.onclick = () => {
                document.querySelectorAll('.admin-filter').forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                this.filterContent(filter.dataset.filter);
            };
        });
    }

    filterContent(type) {
        const allContent = [
            ...this.data.posts.map(p => ({...p, type: 'post'})),
            ...this.data.events.map(e => ({...e, type: 'event'})),
            ...this.data.games.map(g => ({...g, type: 'game'})),
            ...this.data.resources.map(r => ({...r, type: 'resource'}))
        ];
        
        const filtered = type === 'all' ? allContent : allContent.filter(item => item.type === type);
        document.getElementById('content-list').innerHTML = this.renderContentList(filtered);
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
