// Panel de Administración - Tiburón
const API_BASE_URL = 'https://fklo6233x5.execute-api.us-east-1.amazonaws.com/prod';

class AdminPanel {
    constructor() {
        this.currentUser = { name: 'Roberto Flores', role: 'admin' };
        this.posts = [];
        this.events = [];
        this.games = [];
        this.resources = [];
        this.workshops = [];
        this.users = [];
    }

    async init() {
        this.setupNavigation();
        this.setupEventListeners();
        await this.loadDashboard();
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const sections = document.querySelectorAll('.admin-section');

        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.section;
                
                navButtons.forEach(b => b.classList.remove('active'));
                sections.forEach(s => s.style.display = 'none');
                
                btn.classList.add('active');
                document.getElementById(target).style.display = 'block';
                
                this.switchSection(target);
            });
        });
    }

    async switchSection(section) {
        switch(section) {
            case 'dashboard':
                await this.loadDashboard();
                break;
            case 'posts':
                await this.loadAllContent();
                break;
            case 'users':
                await this.loadUsersData();
                break;
        }
    }

    setupEventListeners() {
        // Botones de agregar contenido
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

        // Filtros
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterContent(btn.dataset.filter);
            });
        });
    }

    async loadDashboard() {
        try {
            await this.loadAllContent();
            
            const totalPosts = this.posts.length;
            const totalGames = this.games.length;
            const totalResources = this.resources.length;
            const totalWorkshops = this.workshops.length;
            
            // Verificar que los elementos existen antes de asignar
            const postsEl = document.getElementById('totalPosts');
            const gamesEl = document.getElementById('totalGames');
            const resourcesEl = document.getElementById('totalResources');
            const workshopsEl = document.getElementById('totalWorkshops');
            
            if (postsEl) postsEl.textContent = totalPosts;
            if (gamesEl) gamesEl.textContent = totalGames;
            if (resourcesEl) resourcesEl.textContent = totalResources;
            if (workshopsEl) workshopsEl.textContent = totalWorkshops;
            
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    async loadAllContent() {
        try {
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
            const response = await fetch(`${API_BASE_URL}/get-content/logic-games.json`);
            if (response.ok) {
                const data = await response.json();
                this.games = Array.isArray(data) ? data : (data.games || []);
                this.games = this.games.map((game, index) => ({
                    ...game,
                    id: game.id || `game-${index}`,
                    type: 'game'
                }));
                return;
            }
        } catch (error) {
            console.log('Lambda no disponible, cargando desde local:', error);
        }
        
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
        console.log('🔍 Cargando recursos...');
        try {
            const response = await fetch(`${API_BASE_URL}/get-content/resources.json`);
            if (response.ok) {
                const data = await response.json();
                console.log('📊 Datos de recursos desde Lambda:', data);
                
                // Aplanar recursos de categorías
                this.resources = [];
                if (Array.isArray(data)) {
                    data.forEach((category, catIndex) => {
                        if (category.items && Array.isArray(category.items)) {
                            category.items.forEach((item, itemIndex) => {
                                this.resources.push({
                                    ...item,
                                    id: item.id || `resource-${catIndex}-${itemIndex}`,
                                    type: 'resource',
                                    category: category.category || 'General'
                                });
                            });
                        }
                    });
                } else if (data.resources) {
                    this.resources = data.resources;
                }
                
                console.log('✅ Recursos procesados:', this.resources.length);
                return;
            }
        } catch (error) {
            console.log('Lambda no disponible, cargando desde local:', error);
        }
        
        try {
            const response = await fetch('/assets/data/resources.json');
            const data = await response.json();
            console.log('📊 Datos de recursos desde local:', data);
            
            // Aplanar recursos de categorías
            this.resources = [];
            if (Array.isArray(data)) {
                data.forEach((category, catIndex) => {
                    if (category.items && Array.isArray(category.items)) {
                        category.items.forEach((item, itemIndex) => {
                            this.resources.push({
                                ...item,
                                id: item.id || `resource-${catIndex}-${itemIndex}`,
                                type: 'resource',
                                category: category.category || 'General'
                            });
                        });
                    }
                });
            } else if (data.resources) {
                this.resources = data.resources;
            }
            
            console.log('✅ Recursos procesados desde local:', this.resources.length);
        } catch (error) {
            console.error('Error loading resources:', error);
            this.resources = [];
        }
    }

    async loadWorkshopsData() {
        try {
            const response = await fetch(`${API_BASE_URL}/get-content/workshops.json`);
            if (response.ok) {
                const data = await response.json();
                this.workshops = Array.isArray(data) ? data : (data.workshops || []);
                this.workshops = this.workshops.map((workshop, index) => ({
                    ...workshop,
                    id: workshop.id || `workshop-${index}`,
                    type: 'workshop'
                }));
                return;
            }
        } catch (error) {
            console.log('Lambda no disponible, cargando desde local:', error);
        }
        
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

    filterContent(filter) {
        const allContent = [
            ...this.posts.map(item => ({...item, type: 'post'})),
            ...this.events.map(item => ({...item, type: 'event'})),
            ...this.games.map(item => ({...item, type: 'game'})),
            ...this.resources.map(item => ({...item, type: 'resource'})),
            ...this.workshops.map(item => ({...item, type: 'workshop'}))
        ];

        const filtered = filter === 'all' ? allContent : allContent.filter(item => item.type === filter);
        this.renderFilteredContent(filtered);
    }

    renderFilteredContent(content) {
        const container = document.getElementById('postsList');
        if (!container) return;

        container.innerHTML = content.map(item => `
            <div class="post-card">
                <div class="post-header">
                    <h3>${item.title}</h3>
                    <span class="post-type">${item.type}</span>
                </div>
                <div class="post-content">
                    <p>${(item.description || item.content || '').substring(0, 150)}...</p>
                    ${item.image ? `<img src="${item.image}" alt="${item.title}" class="content-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0yMCAyNkM5IDI2IDkgMTQgMjAgMTRTMzEgMjYgMjAgMjZaIiBmaWxsPSIjOWNhM2FmIi8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjMiIGZpbGw9IiM5Y2EzYWYiLz4KPC9zdmc+'; this.onerror=null;">` : ''}
                </div>
                <div class="post-actions">
                    <button class="btn-edit" onclick="adminPanel.editContent('${item.type}', '${item.id}')">Editar</button>
                    <button class="btn-delete" onclick="adminPanel.deleteContent('${item.type}', '${item.id}')">Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    showContentModal(type, itemId = null) {
        const isEdit = itemId !== null;
        const item = isEdit ? this.findItemById(itemId, type) : null;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${isEdit ? 'Editar' : 'Crear'} ${type}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <form class="modal-form">
                    <div class="form-group">
                        <label for="contentTitle">Título:</label>
                        <input type="text" id="contentTitle" required value="${item?.title || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="contentDescription">Descripción:</label>
                        <textarea id="contentDescription" rows="4" required>${item?.description || item?.content || ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="contentImage">URL de Imagen:</label>
                        <input type="url" id="contentImage" placeholder="https://..." value="${item?.image || item?.imageUrl || ''}">
                    </div>
                    
                    ${type === 'event' ? `
                        <div class="form-group">
                            <label for="eventStatus">Estado:</label>
                            <select id="eventStatus" required>
                                <option value="abierto" ${item?.status === 'abierto' ? 'selected' : ''}>🟢 Abierto</option>
                                <option value="cerrado" ${item?.status === 'cerrado' ? 'selected' : ''}>🔴 Cerrado</option>
                                <option value="cancelado" ${item?.status === 'cancelado' ? 'selected' : ''}>⚫ Cancelado</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="eventUrl">URL de Registro:</label>
                            <input type="url" id="eventUrl" placeholder="https://..." value="${item?.registrationUrl || ''}">
                        </div>
                        <div class="form-group">
                            <label for="eventDate">Fecha:</label>
                            <input type="datetime-local" id="eventDate" value="${item?.date ? new Date(item.date).toISOString().slice(0,16) : ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="eventLocation">Ubicación:</label>
                            <input type="text" id="eventLocation" placeholder="Ubicación" value="${item?.location || ''}">
                        </div>
                    ` : ''}
                    
                    ${(type === 'game' || type === 'resource') ? `
                        <div class="form-group">
                            <label for="contentUrl">URL:</label>
                            <input type="url" id="contentUrl" placeholder="https://..." value="${item?.url || ''}">
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
        
        modal.querySelector('.modal-close').onclick = () => modal.remove();
        modal.querySelector('.modal-cancel').onclick = () => modal.remove();
        modal.onclick = (e) => e.target === modal && modal.remove();
        
        modal.querySelector('.modal-form').onsubmit = async (e) => {
            e.preventDefault();
            await this.saveContent(type, itemId, modal);
        };
    }

    async saveContent(type, itemId, modal) {
        const formData = {
            id: itemId || `${type}-${Date.now()}`,
            title: document.getElementById('contentTitle').value,
            content: document.getElementById('contentDescription').value,
            description: document.getElementById('contentDescription').value,
            image: document.getElementById('contentImage').value,
            author: this.currentUser.name,
            date: new Date().toISOString()
        };

        // Campos específicos por tipo
        if (type === 'event') {
            formData.status = document.getElementById('eventStatus').value;
            formData.registrationUrl = document.getElementById('eventUrl').value;
            formData.date = document.getElementById('eventDate').value;
            formData.location = document.getElementById('eventLocation').value;
        }

        const urlField = document.getElementById('contentUrl');
        if (urlField) {
            formData.url = urlField.value;
        }

        try {
            this.updateLocalContent(type, formData);
            await this.saveToS3(type);
            
            modal.remove();
            this.renderAllContent();
            this.showToast(`✅ ${type} ${itemId ? 'actualizado' : 'creado'} y guardado en AWS S3`, 'success');
            
        } catch (error) {
            console.error('Error saving content:', error);
            this.showToast('❌ Error al guardar en S3. Cambios solo locales.', 'error');
        }
    }

    updateLocalContent(type, formData) {
        let targetArray;
        switch(type) {
            case 'post': targetArray = this.posts; break;
            case 'event': targetArray = this.events; break;
            case 'game': targetArray = this.games; break;
            case 'resource': targetArray = this.resources; break;
            case 'workshop': targetArray = this.workshops; break;
        }

        const existingIndex = targetArray.findIndex(item => item.id === formData.id);
        if (existingIndex >= 0) {
            targetArray[existingIndex] = { ...targetArray[existingIndex], ...formData };
        } else {
            targetArray.push(formData);
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

        let dataToSave;
        switch(type) {
            case 'post':
                dataToSave = { posts: this.posts };
                break;
            case 'event':
                dataToSave = this.events;
                break;
            case 'game':
                dataToSave = this.games;
                break;
            case 'resource':
                dataToSave = { resources: this.resources };
                break;
            case 'workshop':
                dataToSave = { workshops: this.workshops };
                break;
        }

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
    }

    findItemById(id, type) {
        let targetArray;
        switch(type) {
            case 'post': targetArray = this.posts; break;
            case 'event': targetArray = this.events; break;
            case 'game': targetArray = this.games; break;
            case 'resource': targetArray = this.resources; break;
            case 'workshop': targetArray = this.workshops; break;
        }
        return targetArray.find(item => item.id === id);
    }

    editContent(type, id) {
        this.showContentModal(type, id);
    }

    deleteContent(type, id) {
        if (confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
            let targetArray;
            switch(type) {
                case 'post': targetArray = this.posts; break;
                case 'event': targetArray = this.events; break;
                case 'game': targetArray = this.games; break;
                case 'resource': targetArray = this.resources; break;
                case 'workshop': targetArray = this.workshops; break;
            }
            
            const index = targetArray.findIndex(item => item.id === id);
            if (index >= 0) {
                targetArray.splice(index, 1);
                this.renderAllContent();
                this.showToast(`${type} eliminado`, 'success');
            }
        }
    }

    async loadUsersData() {
        // Usuarios reales de Cognito
        const realUsers = [
            { 
                id: 1, 
                name: 'Roberto Flores', 
                email: 'roberto.ciberseguridad@gmail.com', 
                status: 'active', 
                role: 'Admins', 
                lastLogin: '2025-11-23',
                cognitoId: 'Google_108232812694941446413'
            },
            { 
                id: 2, 
                name: 'Roberto Flores', 
                email: 'ingblack13@gmail.com', 
                status: 'active', 
                role: 'Explorador', 
                lastLogin: '2025-11-23',
                cognitoId: 'Google_107553276718009632173'
            }
        ];
        
        this.users = realUsers;
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
                filteredUsers = this.users.filter(u => u.role === 'Admins');
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
                    <span class="role-badge ${user.role.toLowerCase()}">${this.getRoleIcon(user.role)} ${user.role}</span>
                </div>
                <div class="user-actions">
                    <button class="btn-small" onclick="adminPanel.toggleUserStatus(${user.id})">
                        ${user.status === 'active' ? 'Desactivar' : 'Activar'}
                    </button>
                    <button class="btn-small btn-role" onclick="adminPanel.editUserRole(${user.id})">
                        Cambiar Rol
                    </button>
                </div>
            </div>
        `).join('');
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

    editUserRole(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Cambiar Rol de Usuario</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-form">
                    <div class="user-info-modal">
                        <h4>${user.name}</h4>
                        <p>${user.email}</p>
                    </div>
                    <div class="form-group">
                        <label for="userRole">Rol del Usuario:</label>
                        <select id="userRole" required>
                            <option value="Explorador" ${user.role === 'Explorador' ? 'selected' : ''}>🧭 Explorador</option>
                            <option value="Navegante" ${user.role === 'Navegante' ? 'selected' : ''}>⛵ Navegante</option>
                            <option value="Corsario" ${user.role === 'Corsario' ? 'selected' : ''}>⚔️ Corsario</option>
                            <option value="Capitán" ${user.role === 'Capitán' ? 'selected' : ''}>🚢 Capitán</option>
                            <option value="Admins" ${user.role === 'Admins' ? 'selected' : ''}>👑 Admin</option>
                        </select>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary modal-cancel">Cancelar</button>
                        <button type="button" class="btn-primary" onclick="adminPanel.saveUserRole(${userId})">Guardar</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.modal-close').onclick = () => modal.remove();
        modal.querySelector('.modal-cancel').onclick = () => modal.remove();
        modal.onclick = (e) => e.target === modal && modal.remove();
    }

    saveUserRole(userId) {
        const user = this.users.find(u => u.id === userId);
        const newRole = document.getElementById('userRole').value;
        
        if (user && newRole) {
            const oldRole = user.role;
            user.role = newRole;
            
            // Cerrar modal
            document.querySelector('.modal-overlay').remove();
            
            // Actualizar vista
            this.renderUsersList();
            this.showToast(`Rol cambiado de ${oldRole} a ${newRole}`, 'success');
        }
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

// Inicializar panel admin
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
    adminPanel.init();
});
