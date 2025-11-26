// Admin Panel - Cargar datos reales y navegación funcional
class AdminPanel {
    constructor() {
        this.currentUser = {
            name: 'Administrador',
            email: 'admin@tiburoncp.com'
        };
        this.posts = [];
        
        // API Configuration
        this.API_BASE_URL = 'https://5xjl51jprh.execute-api.us-east-1.amazonaws.com/prod';
        
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
        console.log('🔄 Cargando posts desde API...');
        try {
            // Intentar cargar desde API real
            const response = await fetch(`${this.API_BASE_URL}/posts`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.posts = (data.posts || []).map(post => ({
                    id: post.item_id,
                    title: post.title,
                    content: post.content,
                    author: post.author || { name: 'Admin', role: 'Administrator' },
                    status: post.status || 'published',
                    createdAt: post.created_at,
                    likes: post.likes || 0
                }));
                console.log(`✅ API: Cargados ${this.posts.length} posts desde DynamoDB`);
            } else {
                throw new Error(`API Error: ${response.status}`);
            }
        } catch (error) {
            console.log('⚠️ API no disponible, usando fallback local:', error.message);
            // Fallback a archivo local
            try {
                const response = await fetch('/assets/data/feed.json');
                if (response.ok) {
                    const data = await response.json();
                    this.posts = (data.posts || data || []).map(post => ({
                        id: post.id,
                        title: post.title,
                        content: post.content,
                        author: post.author || { name: 'Admin', role: 'Administrator' },
                        status: 'published',
                        createdAt: post.date,
                        likes: post.likes || 0
                    }));
                    console.log(`📁 Fallback: Cargados ${this.posts.length} posts desde JSON local`);
                }
            } catch (fallbackError) {
                console.error('❌ Error en fallback:', fallbackError);
                this.posts = [];
            }
        }
        
        this.renderPosts();
        this.updateStats();
    }

    renderPosts() {
        console.log('🎨 Ejecutando renderPosts()...');
        console.log('📊 Posts disponibles:', this.posts.length);
        
        const container = document.getElementById('posts-list');
        console.log('📦 Contenedor posts-list:', container ? 'ENCONTRADO' : 'NO ENCONTRADO');
        
        if (!container) {
            console.error('❌ No se encontró el contenedor posts-list');
            return;
        }

        if (this.posts.length === 0) {
            console.log('📝 No hay posts, mostrando mensaje vacío');
            container.innerHTML = `
                <div class="feed-item">
                    <h3>📝 No hay posts</h3>
                    <p>¡Crea tu primer post!</p>
                </div>
            `;
            return;
        }

        console.log('📝 Renderizando', this.posts.length, 'posts');
        console.log('🔍 Primer post:', this.posts[0]);

        // Test visual directo
        container.innerHTML = `
            <div style="background: red; color: white; padding: 20px; margin: 10px; border-radius: 10px; position: relative; z-index: 9999; display: block !important; visibility: visible !important;">
                🧪 TEST: Si ves esto, el contenedor funciona correctamente
            </div>
        `;
        
        console.log('🔍 Contenedor HTML después del test:', container.innerHTML);
        console.log('🔍 Contenedor estilos:', window.getComputedStyle(container));
        
        // Esperar un momento y luego renderizar posts reales
        setTimeout(() => {
            const postsHTML = this.posts.map(post => `
                <div style="
                    background: #ffffff !important; 
                    border: 3px solid #ff0000 !important; 
                    padding: 20px !important; 
                    margin: 20px 0 !important; 
                    border-radius: 10px !important;
                    display: block !important;
                    visibility: visible !important;
                    position: relative !important;
                    z-index: 9999 !important;
                    min-height: 200px !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                ">
                    <h3 style="color: #000000 !important; font-size: 24px !important; margin: 0 0 10px 0 !important; display: block !important;">
                        🚀 ${post.title}
                    </h3>
                    <div style="color: #666666 !important; font-size: 16px !important; margin-bottom: 15px !important; display: block !important;">
                        📅 ${new Date(post.createdAt).toLocaleDateString()} | 
                        👤 ${post.author?.name || 'Autor'} | 
                        ❤️ ${post.likes}
                    </div>
                    <p style="color: #333333 !important; line-height: 1.5 !important; font-size: 16px !important; display: block !important;">
                        ${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}
                    </p>
                    <div style="display: flex !important; gap: 10px !important; margin-top: 15px !important;">
                        <button onclick="alert('Edit: ${post.id}')" style="
                            background: #007bff !important; 
                            color: white !important; 
                            border: none !important; 
                            padding: 12px 20px !important; 
                            border-radius: 5px !important; 
                            cursor: pointer !important;
                            font-size: 16px !important;
                            display: inline-block !important;
                        ">
                            ✏️ Editar
                        </button>
                        <button onclick="alert('Delete: ${post.id}')" style="
                            background: #dc3545 !important; 
                            color: white !important; 
                            border: none !important; 
                            padding: 12px 20px !important; 
                            border-radius: 5px !important; 
                            cursor: pointer !important;
                            font-size: 16px !important;
                            display: inline-block !important;
                        ">
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            `).join('');
            
            container.innerHTML = postsHTML;
            console.log('✅ Posts renderizados con estilos FORZADOS');
            console.log('🔍 HTML final:', container.innerHTML.substring(0, 200) + '...');
        }, 1000);
        
        console.log('✅ Posts renderizados exitosamente');
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

    updateStats() {
        const totalPosts = this.posts.length;
        const publishedPosts = this.posts.filter(p => p.status === 'published').length;
        const draftPosts = this.posts.filter(p => p.status === 'draft').length;
        const totalLikes = this.posts.reduce((sum, p) => sum + (p.likes || 0), 0);

        console.log('Actualizando stats:', { totalPosts, publishedPosts, draftPosts, totalLikes });

        // Actualizar solo elementos que existen
        const statElements = {
            'stat-total-posts': totalPosts,
            'stat-published-posts': publishedPosts,
            'stat-draft-posts': draftPosts,
            'stat-total-likes': totalLikes
        };

        Object.entries(statElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            } else {
                console.log(`⚠️ Elemento ${id} no encontrado`);
            }
        });
    }

    showSection(sectionName) {
        console.log('🔄 Cambiando a sección:', sectionName);
        
        // Ocultar todas las secciones
        const allSections = document.querySelectorAll('.content-section');
        console.log(`📋 Ocultando ${allSections.length} secciones`);
        allSections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Mostrar la sección seleccionada
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
            console.log('✅ Sección mostrada:', sectionName);
            
            // Renderizar contenido específico de la sección
            this.renderSectionContent(sectionName);
        } else {
            console.error('❌ Sección no encontrada:', `${sectionName}-section`);
        }
        
        // Actualizar botones activos
        document.querySelectorAll('.nav-btn[data-section]').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            console.log('🎯 Botón activado:', sectionName);
        } else {
            console.error('❌ Botón no encontrado:', sectionName);
        }
    }

    renderSectionContent(sectionName) {
        console.log('🎨 Renderizando contenido para:', sectionName);
        
        switch (sectionName) {
            case 'posts':
                this.renderPosts();
                break;
            case 'eventos':
                this.renderEvents();
                break;
            case 'juegos':
                this.renderGames();
                break;
            case 'recursos':
                this.renderResources();
                break;
            case 'glosario':
                this.renderGlosario();
                break;
            default:
                console.log('📋 Sección sin renderizado específico:', sectionName);
        }
    }

    async createPost(postData) {
        console.log('🔄 Creando post en API...');
        try {
            // Crear en API real
            const response = await fetch(`${this.API_BASE_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: postData.title,
                    content: postData.content,
                    status: postData.status || 'published',
                    likes: 0
                })
            });
            
            if (response.ok) {
                const newPost = await response.json();
                console.log('✅ Post creado en DynamoDB:', newPost.item_id);
                
                // Actualizar lista local
                const formattedPost = {
                    id: newPost.item_id,
                    title: newPost.title,
                    content: newPost.content,
                    author: newPost.author,
                    status: newPost.status,
                    createdAt: newPost.created_at,
                    likes: newPost.likes
                };
                
                this.posts.unshift(formattedPost);
                this.renderPosts();
                this.updateStats();
                this.showAlert('✅ Post creado exitosamente en DynamoDB');
                return formattedPost;
            } else {
                throw new Error(`API Error: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Error creando post:', error);
            this.showAlert('❌ Error al crear post. Inténtalo de nuevo.');
            return null;
        }
    }

    async updatePost(postId, postData) {
        console.log('✏️ Actualizando post en API...');
        try {
            // Actualizar en API real
            const response = await fetch(`${this.API_BASE_URL}/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: postData.title,
                    content: postData.content,
                    status: postData.status,
                    likes: postData.likes || 0
                })
            });
            
            if (response.ok) {
                const updatedPost = await response.json();
                console.log('✅ Post actualizado en DynamoDB:', postId);
                
                // Actualizar lista local
                const index = this.posts.findIndex(p => p.id === postId);
                if (index !== -1) {
                    this.posts[index] = {
                        id: updatedPost.item_id,
                        title: updatedPost.title,
                        content: updatedPost.content,
                        author: updatedPost.author,
                        status: updatedPost.status,
                        createdAt: updatedPost.created_at,
                        likes: updatedPost.likes
                    };
                }
                
                this.renderPosts();
                this.updateStats();
                this.showAlert('✅ Post actualizado exitosamente');
                return updatedPost;
            } else {
                throw new Error(`API Error: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Error actualizando post:', error);
            this.showAlert('❌ Error al actualizar post. Inténtalo de nuevo.');
            return null;
        }
    }

    renderEvents() {
        const container = document.getElementById('events-list');
        if (!container) {
            console.log('⚠️ Contenedor events-list no encontrado');
            return;
        }

        if (this.events.length === 0) {
            container.innerHTML = `
                <div class="feed-item">
                    <h3>📅 No hay eventos</h3>
                    <p>¡Crea tu primer evento!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.events.map(event => `
            <div class="feed-item">
                <h3>${event.title}</h3>
                <p>${event.description}</p>
                <div class="post-actions">
                    <button class="btn-sm btn-primary">✏️ Editar</button>
                    <button class="btn-sm btn-danger">🗑️ Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    renderGames() {
        const container = document.getElementById('games-list');
        if (!container) {
            console.log('⚠️ Contenedor games-list no encontrado');
            return;
        }

        container.innerHTML = `
            <div class="feed-item">
                <h3>🎮 Gestión de Juegos</h3>
                <p>Funcionalidad en desarrollo...</p>
            </div>
        `;
    }

    renderResources() {
        const container = document.getElementById('resources-list');
        if (!container) {
            console.log('⚠️ Contenedor resources-list no encontrado');
            return;
        }

        container.innerHTML = `
            <div class="feed-item">
                <h3>📚 Gestión de Recursos</h3>
                <p>Funcionalidad en desarrollo...</p>
            </div>
        `;
    }

    renderGlosario() {
        const container = document.getElementById('glosario-list');
        if (!container) {
            console.log('⚠️ Contenedor glosario-list no encontrado');
            return;
        }

        container.innerHTML = `
            <div class="feed-item">
                <h3>📖 Gestión de Glosario</h3>
                <p>Funcionalidad en desarrollo...</p>
            </div>
        `;
    }

    async deletePost(postId) {
        if (!confirm('¿Estás seguro de eliminar este post?')) return;
        
        console.log('🗑️ Eliminando post de API...');
        try {
            // Eliminar de API real
            const response = await fetch(`${this.API_BASE_URL}/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                console.log('✅ Post eliminado de DynamoDB:', postId);
                
                // Actualizar lista local
                this.posts = this.posts.filter(p => p.id !== postId);
                this.renderPosts();
                this.updateStats();
                this.showAlert('✅ Post eliminado exitosamente');
            } else {
                throw new Error(`API Error: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Error eliminando post:', error);
            this.showAlert('❌ Error al eliminar post. Inténtalo de nuevo.');
        }
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
                await this.updatePost(editPost.id, postData);
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
        
        // Limpiar event listeners existentes
        document.querySelectorAll('.nav-btn[data-section]').forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });
        
        // Navegación entre secciones
        document.querySelectorAll('.nav-btn[data-section]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const section = e.target.dataset.section;
                console.log('🎯 Click en navegación:', section);
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
