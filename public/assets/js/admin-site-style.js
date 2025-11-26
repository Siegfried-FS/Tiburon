// Admin Panel - Cargar datos reales y navegación funcional
class AdminPanel {
    constructor() {
        this.currentUser = {
            name: 'Administrador',
            email: 'admin@tiburoncp.com'
        };
        this.posts = [];
        this.init();
    }

    async init() {
        await this.loadCurrentUser();
        await this.loadAllContent();
        this.setupEventListeners();
        this.showSection('dashboard');
    }

    async loadAllContent() {
        console.log('Cargando todo el contenido...');
        await this.loadExistingPosts();
        await this.loadEvents();
        await this.loadGames();
        await this.loadResources();
        await this.loadGlosario();
        this.updateAllStats();
    }

    async loadCurrentUser() {
        const token = localStorage.getItem('cognitoToken');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                this.currentUser = {
                    name: payload.name || payload.email || 'Administrador',
                    email: payload.email || 'admin@tiburoncp.com'
                };
            } catch (error) {
                console.error('Error parsing token:', error);
            }
        }
    }

    async loadExistingPosts() {
        try {
            console.log('Cargando posts del feed...');
            
            // Probar múltiples rutas
            const possiblePaths = [
                '/assets/data/feed.json',
                'assets/data/feed.json',
                './assets/data/feed.json'
            ];
            
            let feedData = null;
            
            for (const path of possiblePaths) {
                try {
                    console.log(`Probando ruta: ${path}`);
                    const response = await fetch(path);
                    if (response.ok) {
                        feedData = await response.json();
                        console.log(`✅ Feed cargado desde: ${path}`);
                        break;
                    }
                } catch (error) {
                    console.log(`❌ Error en ${path}:`, error.message);
                }
            }
            
            if (feedData) {
                this.posts = (feedData.posts || feedData || []).map(post => ({
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    author: post.author || this.currentUser,
                    status: 'published',
                    createdAt: post.date,
                    likes: post.likes || 0
                }));
                
                console.log(`Cargados ${this.posts.length} posts`);
                console.log('Primer post:', this.posts[0]);
            } else {
                console.error('No se pudo cargar el feed desde ninguna ruta');
                this.posts = [];
            }
            
            this.renderPosts();
            this.updateStats();
        } catch (error) {
            console.error('Error loading posts:', error);
            this.posts = [];
            this.renderPosts();
            this.updateStats();
        }
    }

    renderPosts() {
        const container = document.getElementById('posts-list');
        if (!container) return;

        if (this.posts.length === 0) {
            container.innerHTML = `
                <div class="feed-item">
                    <h3>📝 No hay posts</h3>
                    <p>¡Crea tu primer post!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.posts.map(post => `
            <div class="feed-item post-item">
                <div class="post-header">
                    <h3 class="post-title">${post.title}</h3>
                    <span class="status-badge status-${post.status}">${post.status}</span>
                </div>
                <div class="post-meta">
                    📅 ${new Date(post.createdAt).toLocaleDateString()} | 
                    👤 ${post.author?.name || 'Autor'} | 
                    ❤️ ${post.likes}
                </div>
                <p>${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
                <div class="post-actions">
                    <button class="btn-sm btn-primary" onclick="adminPanel.editPost('${post.id}')">
                        ✏️ Editar
                    </button>
                    <button class="btn-sm btn-danger" onclick="adminPanel.deletePost('${post.id}')">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }

    async loadEvents() {
        try {
            const response = await fetch('/assets/data/events.json');
            if (response.ok) {
                const data = await response.json();
                this.events = data.events || [];
                this.renderEvents();
                console.log(`Cargados ${this.events.length} eventos`);
            }
        } catch (error) {
            console.log('Error cargando eventos:', error);
            this.events = [];
        }
    }

    async loadGames() {
        try {
            const response = await fetch('/assets/data/logic-games.json');
            if (response.ok) {
                const data = await response.json();
                this.games = data.games || [];
                this.renderGames();
                console.log(`Cargados ${this.games.length} juegos`);
            }
        } catch (error) {
            console.log('Error cargando juegos:', error);
            this.games = [];
        }
    }

    async loadResources() {
        try {
            const response = await fetch('/assets/data/resources.json');
            if (response.ok) {
                const data = await response.json();
                this.resources = data.resources || [];
                this.renderResources();
                console.log(`Cargados ${this.resources.length} recursos`);
            }
        } catch (error) {
            console.log('Error cargando recursos:', error);
            this.resources = [];
        }
    }

    async loadGlosario() {
        try {
            const response = await fetch('/assets/data/glosario.json');
            if (response.ok) {
                const data = await response.json();
                this.glosario = data.terminos || [];
                this.renderGlosario();
                console.log(`Cargados ${this.glosario.length} términos del glosario`);
            }
        } catch (error) {
            console.log('Error cargando glosario:', error);
            this.glosario = [];
        }
    }

    renderEvents() {
        const container = document.getElementById('eventos-list');
        if (!container || !this.events) return;

        if (this.events.length === 0) {
            container.innerHTML = '<div class="loading">No hay eventos disponibles.</div>';
            return;
        }

        container.innerHTML = this.events.map(evento => `
            <div class="post-item">
                <div class="post-header">
                    <h3 class="post-title">${evento.title}</h3>
                    <span class="status-badge status-published">Evento</span>
                </div>
                <div class="post-meta">📅 ${evento.date} | 📍 ${evento.location}</div>
                <p>${evento.description.substring(0, 150)}...</p>
                <div class="post-actions">
                    <button class="btn-sm btn-primary">✏️ Editar</button>
                    <button class="btn-sm btn-danger">🗑️ Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    renderGames() {
        const container = document.getElementById('juegos-list');
        if (!container || !this.games) return;

        if (this.games.length === 0) {
            container.innerHTML = '<div class="loading">No hay juegos disponibles.</div>';
            return;
        }

        container.innerHTML = this.games.map(juego => `
            <div class="post-item">
                <div class="post-header">
                    <h3 class="post-title">${juego.title}</h3>
                    <span class="status-badge status-published">Juego</span>
                </div>
                <div class="post-meta">🎮 ${juego.category} | ⭐ ${juego.difficulty}</div>
                <p>${juego.description.substring(0, 150)}...</p>
                <div class="post-actions">
                    <button class="btn-sm btn-primary">✏️ Editar</button>
                    <button class="btn-sm btn-danger">🗑️ Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    renderResources() {
        const container = document.getElementById('recursos-list');
        if (!container || !this.resources) return;

        if (this.resources.length === 0) {
            container.innerHTML = '<div class="loading">No hay recursos disponibles.</div>';
            return;
        }

        container.innerHTML = this.resources.map(recurso => `
            <div class="post-item">
                <div class="post-header">
                    <h3 class="post-title">${recurso.title}</h3>
                    <span class="status-badge status-published">${recurso.category}</span>
                </div>
                <div class="post-meta">📚 ${recurso.type} | 🏷️ ${recurso.tags?.join(', ') || 'Sin tags'}</div>
                <p>${recurso.description.substring(0, 150)}...</p>
                <div class="post-actions">
                    <button class="btn-sm btn-primary">✏️ Editar</button>
                    <button class="btn-sm btn-danger">🗑️ Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    renderGlosario() {
        const container = document.getElementById('glosario-list');
        if (!container || !this.glosario) return;

        if (this.glosario.length === 0) {
            container.innerHTML = '<div class="loading">No hay términos disponibles.</div>';
            return;
        }

        container.innerHTML = this.glosario.map(termino => `
            <div class="post-item">
                <div class="post-header">
                    <h3 class="post-title">${termino.termino}</h3>
                    <span class="status-badge status-published">Término</span>
                </div>
                <div class="post-meta">📖 ${termino.categoria}</div>
                <p>${termino.definicion.substring(0, 150)}...</p>
                <div class="post-actions">
                    <button class="btn-sm btn-primary">✏️ Editar</button>
                    <button class="btn-sm btn-danger">🗑️ Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    updateAllStats() {
        const stats = {
            totalPosts: this.posts?.length || 0,
            totalEvents: this.events?.length || 0,
            totalGames: this.games?.length || 0,
            totalResources: this.resources?.length || 0,
            totalGlosario: this.glosario?.length || 0,
            totalLikes: this.posts?.reduce((sum, p) => sum + (p.likes || 0), 0) || 0
        };

        console.log('Actualizando stats completas:', stats);

        // Actualizar elementos del DOM
        document.getElementById('stat-total-posts').textContent = stats.totalPosts;
        document.getElementById('stat-total-events').textContent = stats.totalEvents;
        document.getElementById('stat-total-games').textContent = stats.totalGames;
        document.getElementById('stat-total-resources').textContent = stats.totalResources;
        document.getElementById('stat-total-glosario').textContent = stats.totalGlosario;
        document.getElementById('stat-total-likes').textContent = stats.totalLikes;
    }

        const totalPosts = this.posts.length;
        const publishedPosts = this.posts.filter(p => p.status === 'published').length;
        const draftPosts = this.posts.filter(p => p.status === 'draft').length;
        const totalLikes = this.posts.reduce((sum, p) => sum + (p.likes || 0), 0);

        console.log('Actualizando stats:', { totalPosts, publishedPosts, draftPosts, totalLikes });

        document.getElementById('stat-total-posts').textContent = totalPosts;
        document.getElementById('stat-published-posts').textContent = publishedPosts;
        document.getElementById('stat-draft-posts').textContent = draftPosts;
        document.getElementById('stat-total-likes').textContent = totalLikes;
    }

    showSection(sectionName) {
        console.log('Mostrando sección:', sectionName);
        
        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Mostrar la sección seleccionada
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
        
        // Actualizar botones activos
        document.querySelectorAll('.nav-btn[data-section]').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    async createPost(postData) {
        const newPost = {
            id: 'post' + Date.now(),
            title: postData.title,
            content: postData.content,
            author: this.currentUser,
            status: postData.status || 'draft',
            createdAt: new Date().toISOString(),
            likes: 0
        };
        
        this.posts.unshift(newPost);
        this.renderPosts();
        this.updateStats();
        this.showAlert('Post creado exitosamente');
        return newPost;
    }

    async deletePost(postId) {
        if (!confirm('¿Estás seguro de eliminar este post?')) return;
        
        this.posts = this.posts.filter(p => p.id !== postId);
        this.renderPosts();
        this.updateStats();
        this.showAlert('Post eliminado');
    }

    editPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        
        this.showCreatePostForm(post);
    }

    showCreatePostForm(editPost = null) {
        const isEdit = !!editPost;
        const title = isEdit ? 'Editar Post' : 'Crear Nuevo Post';
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); display: flex; align-items: center;
            justify-content: center; z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="background: var(--card-bg); padding: 30px; border-radius: 15px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; border: 1px solid var(--border-color);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="color: var(--text-color); margin: 0;">${title}</h3>
                    <button id="close-modal-btn" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-color);">×</button>
                </div>
                <form id="post-form">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Título:</label>
                        <input type="text" name="title" value="${editPost?.title || ''}" required 
                               style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 5px; background: var(--card-bg); color: var(--text-color);">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Contenido:</label>
                        <textarea name="content" rows="6" required 
                                  style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 5px; background: var(--card-bg); color: var(--text-color);">${editPost?.content || ''}</textarea>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Likes:</label>
                        <input type="number" name="likes" value="${editPost?.likes || 0}" min="0"
                               style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 5px; background: var(--card-bg); color: var(--text-color);">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Estado:</label>
                        <select name="status" style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 5px; background: var(--card-bg); color: var(--text-color);">
                            <option value="draft" ${editPost?.status === 'draft' ? 'selected' : ''}>Borrador</option>
                            <option value="published" ${editPost?.status === 'published' ? 'selected' : ''}>Publicado</option>
                        </select>
                    </div>
                    <div style="text-align: center;">
                        <button type="submit" style="background: var(--primary-color); color: white; padding: 12px 24px; border: none; border-radius: 25px; cursor: pointer; margin-right: 10px; font-weight: 500;">
                            ${isEdit ? '✏️ Actualizar' : '➕ Crear'} Post
                        </button>
                        <button type="button" id="cancel-modal-btn" style="background: #666; color: white; padding: 12px 24px; border: none; border-radius: 25px; cursor: pointer; font-weight: 500;">
                            ❌ Cancelar
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners para cerrar modal
        document.getElementById('close-modal-btn').addEventListener('click', () => modal.remove());
        document.getElementById('cancel-modal-btn').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        document.getElementById('post-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const postData = {
                title: formData.get('title'),
                content: formData.get('content'),
                likes: parseInt(formData.get('likes')) || 0,
                status: formData.get('status')
            };
            
            if (isEdit) {
                const index = this.posts.findIndex(p => p.id === editPost.id);
                if (index !== -1) {
                    this.posts[index] = { ...this.posts[index], ...postData };
                    await this.saveToAPI(this.posts[index]); // Guardar en API
                    this.renderPosts();
                    this.updateStats();
                    this.showAlert('Post actualizado y guardado');
                }
            } else {
                await this.createPost(postData);
            }
            
            modal.remove();
        });
    }

    async saveToAPI(post) {
        try {
            // Debug: Verificar datos de usuario (usando las claves correctas)
            const token = sessionStorage.getItem('accessToken'); // CORREGIDO: sessionStorage y 'accessToken'
            const userGroups = localStorage.getItem('userGroups'); // CORREGIDO: 'userGroups'
            
            console.log('🔍 Debug - Datos de usuario:');
            console.log('Token:', token ? 'Presente' : 'Ausente');
            console.log('Token length:', token ? token.length : 0);
            console.log('Groups:', userGroups);
            
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            // TEMPORAL: Simular guardado exitoso hasta que se arregle CORS
            console.log('💾 Simulando guardado exitoso (CORS en progreso)');
            console.log('Post a guardar:', post);
            
            // Actualizar en memoria local
            const index = this.posts.findIndex(p => p.id === post.id);
            if (index !== -1) {
                this.posts[index] = { ...this.posts[index], ...post };
                this.renderPosts();
                this.updateStats();
            }
            
            this.showAlert('✅ Cambios guardados localmente. Persistencia real en desarrollo.');
            return { success: true };

            /* CÓDIGO REAL - Activar cuando CORS funcione
            const response = await fetch('https://js62x5k3y8.execute-api.us-east-1.amazonaws.com/prod/content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    filename: 'feed.json',
                    content: JSON.stringify({
                        posts: this.posts
                    }, null, 2)
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.log('❌ Respuesta de error:', errorText);
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            console.log('✅ Post guardado en API');
            return await response.json();
            */
        } catch (error) {
            console.log('❌ Error guardando en API:', error);
            this.showAlert('⚠️ Cambios guardados localmente. API no disponible.');
        }
    }

    showAlert(message) {
        const alert = document.createElement('div');
        alert.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10001;
            background: var(--primary-color); color: white; padding: 15px 20px;
            border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 300px;
        `;
        alert.innerHTML = `<p style="margin: 0;">✅ ${message}</p>`;
        
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 3000);
    }

    setupEventListeners() {
        console.log('Configurando event listeners...');
        
        // Navegación entre secciones
        document.querySelectorAll('.nav-btn[data-section]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                console.log('Navegando a:', section);
                this.showSection(section);
            });
        });

        // Botón crear post
        const createBtn = document.getElementById('create-post-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                console.log('Abriendo formulario de crear post');
                this.showCreatePostForm();
            });
        }
        
        // Botones crear para otras secciones
        const sections = ['eventos', 'talleres', 'juegos', 'recursos', 'glosario'];
        sections.forEach(section => {
            const createBtn = document.getElementById(`create-${section === 'glosario' ? 'termino' : section.slice(0, -1)}-btn`);
            if (createBtn) {
                createBtn.addEventListener('click', () => {
                    this.showAlert(`✨ Funcionalidad de ${section} próximamente. Demo enfocada en Posts.`);
                });
            }
        });
    }
}

// Initialize
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando panel admin...');
    adminPanel = new AdminPanel();
});
