// Panel de Administración Tiburón - Versión Mejorada
const API_BASE_URL = 'https://fklo6233x5.execute-api.us-east-1.amazonaws.com/prod';

class TiburonAdmin {
    constructor() {
        this.currentUser = { name: 'Roberto Flores', role: 'Admins' };
        this.data = {
            posts: [],
            events: [],
            games: [],
            resources: [],
            workshops: [],
            users: []
        };
        this.currentSection = 'dashboard';
        this.currentFilter = 'all';
    }

    async init() {
        this.showLoading();
        await this.loadAllData();
        this.setupNavigation();
        this.setupEventListeners();
        this.showSection('dashboard');
        this.hideLoading();
    }

    showLoading() {
        document.body.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Cargando panel de administración...</p>
            </div>
        `;
    }

    hideLoading() {
        // El contenido ya está cargado por setupNavigation
    }

    async loadAllData() {
        try {
            await Promise.all([
                this.loadPosts(),
                this.loadEvents(),
                this.loadGames(),
                this.loadResources(),
                this.loadWorkshops(),
                this.loadUsers()
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async loadPosts() {
        try {
            const response = await fetch(`${API_BASE_URL}/get-content/feed.json`);
            if (response.ok) {
                const data = await response.json();
                this.data.posts = data.posts || data || [];
            }
        } catch (error) {
            console.log('Loading posts from local fallback');
            try {
                const response = await fetch('/assets/data/feed.json');
                const data = await response.json();
                this.data.posts = data.posts || data || [];
            } catch (e) {
                // Si no hay posts, crear algunos de ejemplo
                this.data.posts = [
                    {
                        id: 'post-1',
                        title: '🚀 Bienvenidos al AWS User Group Playa Vicente',
                        content: 'Estamos emocionados de lanzar nuestra comunidad de tecnología en la nube. Únete a nosotros para aprender, compartir y crecer juntos en el mundo de AWS.',
                        date: new Date().toISOString(),
                        author: {
                            name: 'Roberto Flores',
                            avatar: '/assets/images/avatar-default.png'
                        },
                        imageUrl: '/assets/images/aws-community.jpg'
                    },
                    {
                        id: 'post-2',
                        title: '📚 Recursos de Aprendizaje AWS',
                        content: 'Hemos compilado una lista de recursos esenciales para comenzar tu viaje en AWS. Desde certificaciones hasta laboratorios prácticos.',
                        date: new Date(Date.now() - 86400000).toISOString(), // Ayer
                        author: {
                            name: 'Roberto Flores',
                            avatar: '/assets/images/avatar-default.png'
                        }
                    }
                ];
            }
        }
        
        // Asegurar que todos los posts tengan los campos necesarios
        this.data.posts = this.data.posts.map(post => ({
            ...post,
            id: post.id || `post-${Date.now()}-${Math.random()}`,
            author: post.author || {
                name: 'AWS User Group',
                avatar: '/assets/images/avatar-default.png'
            },
            date: post.date || new Date().toISOString()
        }));
    }

    async loadEvents() {
        try {
            const response = await fetch(`${API_BASE_URL}/get-content/events.json`);
            if (response.ok) {
                const data = await response.json();
                this.data.events = Array.isArray(data) ? data : [];
            }
        } catch (error) {
            try {
                const response = await fetch('/assets/data/events.json');
                const data = await response.json();
                this.data.events = Array.isArray(data) ? data : [];
            } catch (e) {
                this.data.events = [];
            }
        }
    }

    async loadGames() {
        try {
            const response = await fetch(`${API_BASE_URL}/get-content/logic-games.json`);
            if (response.ok) {
                const data = await response.json();
                this.data.games = Array.isArray(data) ? data : [];
            }
        } catch (error) {
            try {
                const response = await fetch('/assets/data/logic-games.json');
                const data = await response.json();
                this.data.games = Array.isArray(data) ? data : [];
            } catch (e) {
                this.data.games = [];
            }
        }
    }

    async loadResources() {
        try {
            const response = await fetch(`${API_BASE_URL}/get-content/resources.json`);
            if (response.ok) {
                const data = await response.json();
                this.data.resources = [];
                if (Array.isArray(data)) {
                    data.forEach(category => {
                        if (category.items) {
                            this.data.resources.push(...category.items);
                        }
                    });
                }
            }
        } catch (error) {
            this.data.resources = [];
        }
    }

    async loadWorkshops() {
        try {
            const response = await fetch(`${API_BASE_URL}/get-content/workshops.json`);
            if (response.ok) {
                const data = await response.json();
                this.data.workshops = data.workshops || [];
            }
        } catch (error) {
            this.data.workshops = [];
        }
    }

    async loadUsers() {
        this.data.users = [
            { 
                id: 1, 
                name: 'Roberto Flores', 
                email: 'roberto.ciberseguridad@gmail.com', 
                status: 'active', 
                role: 'Admins', 
                lastLogin: '2025-11-24'
            },
            { 
                id: 2, 
                name: 'Roberto Flores', 
                email: 'ingblack13@gmail.com', 
                status: 'active', 
                role: 'Explorador', 
                lastLogin: '2025-11-23'
            }
        ];
    }

    setupNavigation() {
        document.body.innerHTML = `
            <div class="admin-container">
                <aside class="admin-sidebar">
                    <div class="admin-logo">
                        <h1>🦈 Tiburón Admin</h1>
                    </div>
                    <nav class="admin-nav">
                        <button class="nav-btn active" data-section="dashboard">
                            <span class="nav-icon">📊</span>
                            Dashboard
                        </button>
                        <button class="nav-btn" data-section="content">
                            <span class="nav-icon">📝</span>
                            Contenido
                        </button>
                        <button class="nav-btn" data-section="users">
                            <span class="nav-icon">👥</span>
                            Usuarios
                        </button>
                        <button class="nav-btn" data-section="settings">
                            <span class="nav-icon">⚙️</span>
                            Configuración
                        </button>
                    </nav>
                </aside>
                <main class="admin-main">
                    <div id="admin-content"></div>
                </main>
            </div>
        `;

        // Setup navigation listeners
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.dataset.section;
                this.showSection(section);
                
                // Update active nav
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    setupEventListeners() {
        // Los event listeners se configuran dinámicamente en cada sección
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
                this.setupContentListeners();
                break;
            case 'users':
                content.innerHTML = this.renderUsers();
                this.setupUsersListeners();
                break;
            case 'settings':
                content.innerHTML = this.renderSettings();
                break;
        }
    }

    renderDashboard() {
        const totalPosts = this.data.posts.length;
        const totalEvents = this.data.events.length;
        const totalGames = this.data.games.length;
        const totalResources = this.data.resources.length;
        const totalUsers = this.data.users.length;
        const activeUsers = this.data.users.filter(u => u.status === 'active').length;

        return `
            <div class="admin-header">
                <h1>Dashboard</h1>
                <p>Bienvenido al panel de administración de Tiburón</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>${totalPosts}</h3>
                    <p>📝 Posts Publicados</p>
                </div>
                <div class="stat-card">
                    <h3>${totalEvents}</h3>
                    <p>📅 Eventos Creados</p>
                </div>
                <div class="stat-card">
                    <h3>${totalGames}</h3>
                    <p>🎮 Juegos Disponibles</p>
                </div>
                <div class="stat-card">
                    <h3>${totalResources}</h3>
                    <p>📚 Recursos Educativos</p>
                </div>
                <div class="stat-card">
                    <h3>${activeUsers}</h3>
                    <p>👥 Usuarios Activos</p>
                </div>
                <div class="stat-card">
                    <h3>${totalUsers}</h3>
                    <p>🌊 Total Miembros</p>
                </div>
            </div>
            
            <div class="content-card">
                <h3>🚀 Acciones Rápidas</h3>
                <div class="action-buttons">
                    <button class="btn-primary" onclick="tiburonAdmin.showSection('content')">
                        📝 Gestionar Contenido
                    </button>
                    <button class="btn-primary" onclick="tiburonAdmin.showSection('users')">
                        👥 Gestionar Usuarios
                    </button>
                    <button class="btn-secondary" onclick="tiburonAdmin.createContent('post')">
                        ➕ Nuevo Post
                    </button>
                    <button class="btn-secondary" onclick="tiburonAdmin.createContent('event')">
                        📅 Nuevo Evento
                    </button>
                </div>
            </div>
        `;
    }

    renderContent() {
        const allContent = [
            ...this.data.posts.map(item => ({...item, type: 'post'})),
            ...this.data.events.map(item => ({...item, type: 'event'})),
            ...this.data.games.map(item => ({...item, type: 'game'})),
            ...this.data.resources.map(item => ({...item, type: 'resource'})),
            ...this.data.workshops.map(item => ({...item, type: 'workshop'}))
        ];

        return `
            <div class="admin-header">
                <h1>Gestión de Contenido</h1>
                <p>Administra posts, eventos, juegos y recursos</p>
            </div>
            
            <div class="filters-container">
                <div class="filter-buttons">
                    <button class="filter-btn active" data-filter="all">Todos (${allContent.length})</button>
                    <button class="filter-btn" data-filter="post">📝 Posts (${this.data.posts.length})</button>
                    <button class="filter-btn" data-filter="event">📅 Eventos (${this.data.events.length})</button>
                    <button class="filter-btn" data-filter="game">🎮 Juegos (${this.data.games.length})</button>
                    <button class="filter-btn" data-filter="resource">📚 Recursos (${this.data.resources.length})</button>
                    <button class="filter-btn" data-filter="workshop">🛠️ Talleres (${this.data.workshops.length})</button>
                </div>
            </div>
            
            <div class="action-buttons" style="margin-bottom: 2rem;">
                <button class="btn-primary" onclick="tiburonAdmin.createContent('post')">📝 Nuevo Post</button>
                <button class="btn-primary" onclick="tiburonAdmin.createContent('event')">📅 Nuevo Evento</button>
                <button class="btn-secondary" onclick="tiburonAdmin.createContent('game')">🎮 Nuevo Juego</button>
                <button class="btn-secondary" onclick="tiburonAdmin.createContent('resource')">📚 Nuevo Recurso</button>
            </div>
            
            <div id="content-list" class="content-grid">
                ${this.renderContentList(allContent)}
            </div>
        `;
    }

    renderContentList(content) {
        if (content.length === 0) {
            return `
                <div class="empty-state">
                    <h3>No hay contenido</h3>
                    <p>Crea tu primer elemento de contenido</p>
                    <button class="btn-primary" onclick="tiburonAdmin.createContent('post')">Crear Post</button>
                </div>
            `;
        }

        return content.map(item => `
            <div class="content-card">
                <div class="content-header">
                    <h3 class="content-title">${item.title || 'Sin título'}</h3>
                    <span class="content-type">${item.type}</span>
                </div>
                <p class="content-description">${(item.description || item.content || '').substring(0, 150)}...</p>
                <div class="content-meta">
                    ${item.date ? `<span class="content-date">📅 ${new Date(item.date).toLocaleDateString('es-ES')}</span>` : ''}
                    ${item.status ? `<span class="content-status ${item.status}">🔘 ${item.status}</span>` : ''}
                    ${item.location ? `<span class="content-location">📍 ${item.location}</span>` : ''}
                </div>
                <div class="content-actions">
                    <button class="btn-edit" onclick="tiburonAdmin.editContent('${item.type}', '${item.id || item.title}')">Editar</button>
                    <button class="btn-delete" onclick="tiburonAdmin.deleteContent('${item.type}', '${item.id || item.title}')">Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    renderUsers() {
        const roleStats = {
            'Admins': this.data.users.filter(u => u.role === 'Admins').length,
            'Capitán': this.data.users.filter(u => u.role === 'Capitán').length,
            'Corsario': this.data.users.filter(u => u.role === 'Corsario').length,
            'Navegante': this.data.users.filter(u => u.role === 'Navegante').length,
            'Explorador': this.data.users.filter(u => u.role === 'Explorador').length
        };

        return `
            <div class="admin-header">
                <h1>Gestión de Usuarios</h1>
                <p>Administra usuarios y roles de la comunidad</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>${this.data.users.length}</h3>
                    <p>👥 Total Usuarios</p>
                </div>
                <div class="stat-card">
                    <h3>${this.data.users.filter(u => u.status === 'active').length}</h3>
                    <p>🟢 Usuarios Activos</p>
                </div>
                <div class="stat-card">
                    <h3>${roleStats.Admins}</h3>
                    <p>👑 Administradores</p>
                </div>
                <div class="stat-card">
                    <h3>${roleStats.Capitán}</h3>
                    <p>🚢 Capitanes</p>
                </div>
                <div class="stat-card">
                    <h3>${roleStats.Explorador}</h3>
                    <p>🧭 Exploradores</p>
                </div>
            </div>
            
            <div class="filters-container">
                <div class="filter-buttons">
                    <button class="filter-btn active" data-filter="all">Todos</button>
                    <button class="filter-btn" data-filter="active">Activos</button>
                    <button class="filter-btn" data-filter="inactive">Inactivos</button>
                    <button class="filter-btn" data-filter="Admins">👑 Admins</button>
                    <button class="filter-btn" data-filter="Explorador">🧭 Exploradores</button>
                </div>
            </div>
            
            <div id="users-list" class="content-grid">
                ${this.renderUsersList(this.data.users)}
            </div>
        `;
    }

    renderUsersList(users) {
        return users.map(user => `
            <div class="content-card">
                <div class="content-header">
                    <h3 class="content-title">${user.name}</h3>
                    <span class="content-type">${this.getRoleIcon(user.role)} ${user.role}</span>
                </div>
                <p class="content-description">${user.email}</p>
                <div class="content-meta">
                    <span class="content-status ${user.status}">${user.status === 'active' ? '🟢 Activo' : '🔴 Inactivo'}</span>
                    <span class="content-date">📅 ${user.lastLogin}</span>
                </div>
                <div class="content-actions">
                    <button class="btn-edit" onclick="tiburonAdmin.editUser(${user.id})">Editar Rol</button>
                    <button class="btn-${user.status === 'active' ? 'delete' : 'success'}" onclick="tiburonAdmin.toggleUserStatus(${user.id})">
                        ${user.status === 'active' ? 'Desactivar' : 'Activar'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderSettings() {
        return `
            <div class="admin-header">
                <h1>Configuración</h1>
                <p>Ajustes del sistema y preferencias</p>
            </div>
            
            <div class="content-card">
                <h3>🔧 Configuración del Sistema</h3>
                <p>Funcionalidades de configuración próximamente...</p>
            </div>
        `;
    }

    setupContentListeners() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterContent(btn.dataset.filter);
            });
        });
    }

    setupUsersListeners() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterUsers(btn.dataset.filter);
            });
        });
    }

    filterContent(filter) {
        const allContent = [
            ...this.data.posts.map(item => ({...item, type: 'post'})),
            ...this.data.events.map(item => ({...item, type: 'event'})),
            ...this.data.games.map(item => ({...item, type: 'game'})),
            ...this.data.resources.map(item => ({...item, type: 'resource'})),
            ...this.data.workshops.map(item => ({...item, type: 'workshop'}))
        ];

        const filtered = filter === 'all' ? allContent : allContent.filter(item => item.type === filter);
        document.getElementById('content-list').innerHTML = this.renderContentList(filtered);
    }

    filterUsers(filter) {
        let filtered = this.data.users;
        if (filter !== 'all') {
            if (filter === 'active' || filter === 'inactive') {
                filtered = this.data.users.filter(u => u.status === filter);
            } else {
                filtered = this.data.users.filter(u => u.role === filter);
            }
        }
        document.getElementById('users-list').innerHTML = this.renderUsersList(filtered);
    }

    createContent(type) {
        this.showModal(`Crear ${type}`, this.getContentForm(type), (formData) => {
            this.saveContent(type, null, formData);
        });
    }

    editContent(type, id) {
        const item = this.findContent(type, id);
        this.showModal(`Editar ${type}`, this.getContentForm(type, item), (formData) => {
            this.saveContent(type, id, formData);
        });
    }

    editUser(userId) {
        const user = this.data.users.find(u => u.id === userId);
        this.showModal('Editar Usuario', this.getUserForm(user), (formData) => {
            this.saveUser(userId, formData);
        });
    }

    showModal(title, content, onSave) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <form class="modal-form">
                    ${content}
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary modal-cancel">Cancelar</button>
                        <button type="submit" class="btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.modal-close').onclick = () => modal.remove();
        modal.querySelector('.modal-cancel').onclick = () => modal.remove();
        modal.onclick = (e) => e.target === modal && modal.remove();

        modal.querySelector('.modal-form').onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            onSave(data);
            modal.remove();
        };
    }

    getContentForm(type, item = null) {
        const baseForm = `
            <div class="form-group">
                <label for="title">Título:</label>
                <input type="text" name="title" id="title" required value="${item?.title || ''}">
            </div>
            <div class="form-group">
                <label for="description">Descripción:</label>
                <textarea name="description" id="description" required>${item?.description || item?.content || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="image">URL de Imagen:</label>
                <input type="url" name="image" id="image" value="${item?.image || ''}">
            </div>
        `;

        if (type === 'event') {
            return baseForm + `
                <div class="form-group">
                    <label for="status">Estado:</label>
                    <select name="status" id="status" required>
                        <option value="abierto" ${item?.status === 'abierto' ? 'selected' : ''}>🟢 Abierto</option>
                        <option value="cerrado" ${item?.status === 'cerrado' ? 'selected' : ''}>🔴 Cerrado</option>
                        <option value="cancelado" ${item?.status === 'cancelado' ? 'selected' : ''}>⚫ Cancelado</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="date">Fecha:</label>
                    <input type="datetime-local" name="date" id="date" value="${item?.date ? new Date(item.date).toISOString().slice(0,16) : ''}">
                </div>
                <div class="form-group">
                    <label for="location">Ubicación:</label>
                    <input type="text" name="location" id="location" value="${item?.location || ''}">
                </div>
                <div class="form-group">
                    <label for="registrationUrl">URL de Registro:</label>
                    <input type="url" name="registrationUrl" id="registrationUrl" value="${item?.registrationUrl || ''}">
                </div>
            `;
        }

        return baseForm;
    }

    getUserForm(user) {
        return `
            <div class="form-group">
                <label>Usuario:</label>
                <p><strong>${user.name}</strong> (${user.email})</p>
            </div>
            <div class="form-group">
                <label for="role">Rol:</label>
                <select name="role" id="role" required>
                    <option value="Explorador" ${user.role === 'Explorador' ? 'selected' : ''}>🧭 Explorador</option>
                    <option value="Navegante" ${user.role === 'Navegante' ? 'selected' : ''}>⛵ Navegante</option>
                    <option value="Corsario" ${user.role === 'Corsario' ? 'selected' : ''}>⚔️ Corsario</option>
                    <option value="Capitán" ${user.role === 'Capitán' ? 'selected' : ''}>🚢 Capitán</option>
                    <option value="Admins" ${user.role === 'Admins' ? 'selected' : ''}>👑 Admin</option>
                </select>
            </div>
        `;
    }

    findContent(type, id) {
        const data = this.data[type + 's'] || this.data[type];
        return data?.find(item => item.id === id || item.title === id);
    }

    saveContent(type, id, formData) {
        console.log('💾 Guardando contenido:', type, id, formData);
        
        // Actualizar datos locales
        if (type === 'event') {
            const eventIndex = this.data.events.findIndex(e => e.id === id || e.title === id);
            if (eventIndex >= 0) {
                this.data.events[eventIndex] = {
                    ...this.data.events[eventIndex],
                    ...formData,
                    id: id || this.data.events[eventIndex].id
                };
            } else {
                this.data.events.push({
                    ...formData,
                    id: id || `event-${Date.now()}`
                });
            }
            this.saveEventsToS3();
        } else if (type === 'post') {
            const postIndex = this.data.posts.findIndex(p => p.id === id || p.title === id);
            const postData = {
                ...formData,
                id: id || `post-${Date.now()}`,
                date: new Date().toISOString(),
                author: {
                    name: this.currentUser.name,
                    avatar: '/assets/images/avatar-default.png'
                }
            };
            
            if (postIndex >= 0) {
                this.data.posts[postIndex] = { ...this.data.posts[postIndex], ...postData };
            } else {
                this.data.posts.unshift(postData); // Agregar al inicio
            }
            this.savePostsToS3();
        }
        
        this.showToast('Contenido guardado exitosamente', 'success');
        this.showSection('content');
    }

    async savePostsToS3() {
        try {
            const response = await fetch(`${API_BASE_URL}/save-content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fileName: 'feed.json',
                    content: { posts: this.data.posts }
                })
            });
            
            if (response.ok) {
                console.log('✅ Posts guardados en S3');
            } else {
                console.error('❌ Error guardando posts en S3:', await response.text());
            }
        } catch (error) {
            console.error('❌ Error de red guardando posts:', error);
        }
    }

    async saveEventsToS3() {
        try {
            const response = await fetch(`${API_BASE_URL}/save-content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fileName: 'events.json',
                    content: this.data.events
                })
            });
            
            if (response.ok) {
                console.log('✅ Eventos guardados en S3');
            } else {
                console.error('❌ Error guardando en S3:', await response.text());
            }
        } catch (error) {
            console.error('❌ Error de red:', error);
        }
    }

    saveUser(userId, formData) {
        const user = this.data.users.find(u => u.id === userId);
        if (user) {
            user.role = formData.role;
            this.showToast('Usuario actualizado exitosamente', 'success');
            this.showSection('users');
        }
    }

    toggleUserStatus(userId) {
        const user = this.data.users.find(u => u.id === userId);
        if (user) {
            user.status = user.status === 'active' ? 'inactive' : 'active';
            this.showToast(`Usuario ${user.status === 'active' ? 'activado' : 'desactivado'}`, 'success');
            this.showSection('users');
        }
    }

    deleteContent(type, id) {
        if (confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
            this.showToast('Elemento eliminado', 'success');
            this.showSection('content');
        }
    }

    getRoleIcon(role) {
        const icons = {
            'Explorador': '🧭',
            'Navegante': '⛵',
            'Corsario': '⚔️',
            'Capitán': '🚢',
            'Admins': '👑'
        };
        return icons[role] || '👤';
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => toast.remove(), 3000);
    }
}

// Inicializar
let tiburonAdmin;
document.addEventListener('DOMContentLoaded', () => {
    tiburonAdmin = new TiburonAdmin();
    tiburonAdmin.init();
});
