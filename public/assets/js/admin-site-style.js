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
        await this.loadExistingPosts();
        this.setupEventListeners();
        this.showSection('dashboard'); // Mostrar dashboard por defecto
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
            const response = await fetch('/assets/data/feed.json');
            if (response.ok) {
                const feedData = await response.json();
                this.posts = (feedData.posts || []).map(post => ({
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    author: post.author || this.currentUser,
                    status: 'published',
                    createdAt: post.date,
                    likes: post.likes || 0
                }));
                
                console.log(`Cargados ${this.posts.length} posts`);
                this.renderPosts();
                this.updateStats();
            } else {
                console.error('Error cargando feed:', response.status);
            }
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

    updateStats() {
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
                    <button onclick="this.closest('div').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-color);">×</button>
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
                        <button type="button" onclick="this.closest('div').remove()" style="background: #666; color: white; padding: 12px 24px; border: none; border-radius: 25px; cursor: pointer; font-weight: 500;">
                            ❌ Cancelar
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('post-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const postData = {
                title: formData.get('title'),
                content: formData.get('content'),
                status: formData.get('status')
            };
            
            if (isEdit) {
                const index = this.posts.findIndex(p => p.id === editPost.id);
                if (index !== -1) {
                    this.posts[index] = { ...this.posts[index], ...postData };
                    this.renderPosts();
                    this.updateStats();
                    this.showAlert('Post actualizado');
                }
            } else {
                await this.createPost(postData);
            }
            
            modal.remove();
        });
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
    }
}

// Initialize
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando panel admin...');
    adminPanel = new AdminPanel();
});
