// Admin Panel Minimalista - Tiburón
const API_BASE = 'https://fklo6233x5.execute-api.us-east-1.amazonaws.com/prod';

class Admin {
    constructor() {
        this.data = { posts: [], events: [], games: [], resources: [], users: [] };
        this.currentSection = 'dashboard';
    }

    async init() {
        this.render();
        await this.loadData();
        this.showSection('dashboard');
    }

    render() {
        document.body.innerHTML = `
            <header class="admin-header">
                <nav class="admin-nav">
                    <div class="admin-title">🦈 Tiburón Admin</div>
                    <div class="nav-tabs">
                        <button class="nav-tab active" data-section="dashboard">Dashboard</button>
                        <button class="nav-tab" data-section="content">Contenido</button>
                        <button class="nav-tab" data-section="users">Usuarios</button>
                    </div>
                </nav>
            </header>
            <main class="admin-main">
                <div id="content"></div>
            </main>
        `;

        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.onclick = () => {
                document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
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
        const content = document.getElementById('content');
        
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
            <div class="stats">
                <div class="stat">
                    <span class="stat-number">${this.data.posts.length}</span>
                    <div class="stat-label">Posts</div>
                </div>
                <div class="stat">
                    <span class="stat-number">${this.data.events.length}</span>
                    <div class="stat-label">Eventos</div>
                </div>
                <div class="stat">
                    <span class="stat-number">${this.data.games.length}</span>
                    <div class="stat-label">Juegos</div>
                </div>
                <div class="stat">
                    <span class="stat-number">${this.data.resources.length}</span>
                    <div class="stat-label">Recursos</div>
                </div>
                <div class="stat">
                    <span class="stat-number">${this.data.users.length}</span>
                    <div class="stat-label">Usuarios</div>
                </div>
            </div>
            
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                <button class="btn" onclick="admin.createContent('post')">+ Post</button>
                <button class="btn" onclick="admin.createContent('event')">+ Evento</button>
                <button class="btn" onclick="admin.createContent('game')">+ Juego</button>
                <button class="btn" onclick="admin.createContent('resource')">+ Recurso</button>
            </div>
            
            <div class="card">
                <h3>Panel de Administración</h3>
                <p>Gestiona todo el contenido del AWS User Group Tiburón desde aquí.</p>
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
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h2>Contenido</h2>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-sm" onclick="admin.createContent('post')">+ Post</button>
                    <button class="btn btn-sm" onclick="admin.createContent('event')">+ Evento</button>
                    <button class="btn btn-sm" onclick="admin.createContent('game')">+ Juego</button>
                    <button class="btn btn-sm" onclick="admin.createContent('resource')">+ Recurso</button>
                </div>
            </div>
            
            <div class="filters">
                <button class="filter active" data-filter="all">Todos (${allContent.length})</button>
                <button class="filter" data-filter="post">Posts (${this.data.posts.length})</button>
                <button class="filter" data-filter="event">Eventos (${this.data.events.length})</button>
                <button class="filter" data-filter="game">Juegos (${this.data.games.length})</button>
                <button class="filter" data-filter="resource">Recursos (${this.data.resources.length})</button>
            </div>
            
            <div id="content-list" class="content-grid">
                ${this.renderContentList(allContent)}
            </div>
        `;
    }

    renderContentList(items) {
        if (items.length === 0) {
            return `
                <div class="empty">
                    <div class="empty-title">No hay contenido</div>
                    <p>Crea tu primer elemento</p>
                    <button class="btn" onclick="admin.createContent('post')">Crear Post</button>
                </div>
            `;
        }

        return items.map(item => `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${item.title || 'Sin título'}</h3>
                    <span class="card-type">${item.type}</span>
                </div>
                <div class="card-content">
                    ${(item.content || item.description || '').substring(0, 120)}...
                </div>
                <div class="card-meta">
                    ${item.date ? `<span>📅 ${new Date(item.date).toLocaleDateString()}</span>` : ''}
                    ${item.status ? `<span>🔘 ${item.status}</span>` : ''}
                </div>
                <div class="card-actions">
                    <button class="btn btn-sm btn-secondary" onclick="admin.editContent('${item.type}', '${item.id}')">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="admin.deleteContent('${item.type}', '${item.id}')">Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    renderUsers() {
        return `
            <h2>Usuarios</h2>
            <div class="content-grid">
                ${this.data.users.map(user => `
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">${user.name}</h3>
                            <span class="card-type">${user.role}</span>
                        </div>
                        <div class="card-content">${user.email}</div>
                        <div class="card-meta">
                            <span>${user.status === 'active' ? '🟢 Activo' : '🔴 Inactivo'}</span>
                        </div>
                        <div class="card-actions">
                            <button class="btn btn-sm btn-secondary" onclick="admin.editUser(${user.id})">Editar</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    setupContentFilters() {
        document.querySelectorAll('.filter').forEach(filter => {
            filter.onclick = () => {
                document.querySelectorAll('.filter').forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                this.filterContent(filter.dataset.filter);
            };
        });
    }

    filterContent(type) {
        const allContent = [
            ...this.data.posts.map(p => ({...p, type: 'post'})),
            ...this.data.events.map(e => ({...e, type: 'event'}))
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
            <div class="form-group">
                <label class="form-label">Usuario: ${user.name}</label>
            </div>
            <div class="form-group">
                <label class="form-label">Rol:</label>
                <select name="role" class="form-input">
                    <option value="Explorador" ${user.role === 'Explorador' ? 'selected' : ''}>Explorador</option>
                    <option value="Navegante" ${user.role === 'Navegante' ? 'selected' : ''}>Navegante</option>
                    <option value="Corsario" ${user.role === 'Corsario' ? 'selected' : ''}>Corsario</option>
                    <option value="Capitán" ${user.role === 'Capitán' ? 'selected' : ''}>Capitán</option>
                    <option value="Admin" ${user.role === 'Admin' ? 'selected' : ''}>Admin</option>
                </select>
            </div>
        `, (data) => {
            user.role = data.role;
            this.showToast('Usuario actualizado', 'success');
            this.showSection('users');
        });
    }

    getForm(type, item = null) {
        let form = `
            <div class="form-group">
                <label class="form-label">Título:</label>
                <input name="title" class="form-input" value="${item?.title || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Contenido:</label>
                <textarea name="content" class="form-input form-textarea" required>${item?.content || item?.description || ''}</textarea>
            </div>
        `;

        if (type === 'event') {
            form += `
                <div class="form-group">
                    <label class="form-label">Estado:</label>
                    <select name="status" class="form-input">
                        <option value="abierto" ${item?.status === 'abierto' ? 'selected' : ''}>Abierto</option>
                        <option value="cerrado" ${item?.status === 'cerrado' ? 'selected' : ''}>Cerrado</option>
                        <option value="cancelado" ${item?.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Fecha:</label>
                    <input name="date" type="datetime-local" class="form-input" value="${item?.date ? new Date(item.date).toISOString().slice(0,16) : ''}">
                </div>
            `;
        }

        return form;
    }

    showModal(title, content, onSave) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <form class="modal-body">
                    ${content}
                </form>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary modal-cancel">Cancelar</button>
                    <button type="button" class="btn modal-save">Guardar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.modal-close').onclick = () => modal.remove();
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
        console.log('Guardando:', type, data);
        
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
        
        this.showToast('Guardado exitosamente', 'success');
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
        const data = type === 'post' ? this.data.posts : this.data.events;
        return data.find(item => item.id === id);
    }

    deleteContent(type, id) {
        if (confirm('¿Eliminar este elemento?')) {
            if (type === 'post') {
                this.data.posts = this.data.posts.filter(p => p.id !== id);
            } else if (type === 'event') {
                this.data.events = this.data.events.filter(e => e.id !== id);
            }
            this.showToast('Eliminado', 'success');
            this.showSection('content');
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => toast.remove(), 3000);
    }
}

// Inicializar
let admin;
document.addEventListener('DOMContentLoaded', () => {
    admin = new Admin();
    admin.init();
});
