// Admin Panel - Usar posts existentes del feed
class AdminPanel {
    constructor() {
        this.apiBase = 'https://fklo6233x5.execute-api.us-east-1.amazonaws.com/prod';
        this.currentUser = null;
        this.posts = [];
        this.init();
    }

    async init() {
        await this.loadCurrentUser();
        await this.loadExistingPosts();
        this.setupEventListeners();
        this.showSection('dashboard');
    }

    async loadCurrentUser() {
        const token = localStorage.getItem('cognitoToken');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                this.currentUser = {
                    name: payload.name || payload.email,
                    email: payload.email,
                    avatar: payload.picture || '/assets/images/avatar-default.png'
                };
                
                // Actualizar nombre en UI
                const nameElement = document.getElementById('admin-user-name');
                if (nameElement) {
                    nameElement.textContent = this.currentUser.name;
                }
            } catch (error) {
                console.error('Error parsing token:', error);
            }
        }
    }

    async loadExistingPosts() {
        try {
            // Cargar posts existentes del feed
            const response = await fetch('/assets/data/feed.json');
            if (response.ok) {
                const feedData = await response.json();
                // Convertir posts del feed al formato admin
                this.posts = (feedData.posts || []).map(post => ({
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    author: post.author,
                    status: 'published', // Los posts del feed están publicados
                    createdAt: post.date,
                    updatedAt: post.date,
                    imageUrl: post.imageUrl || null,
                    tags: post.tags || [],
                    likes: post.likes || 0,
                    featured: false
                }));
                
                this.renderPosts();
                this.updateStats();
            }
        } catch (error) {
            console.error('Error loading existing posts:', error);
            // Si no puede cargar del feed, mostrar mensaje informativo
            this.showAlert('Cargando posts existentes del sitio...', 'info');
            this.posts = [];
            this.renderPosts();
            this.updateStats();
        }
    }

    async createPost(postData) {
        try {
            // Crear post localmente por ahora (hasta que las APIs funcionen)
            const newPost = {
                id: 'post' + Date.now(),
                title: postData.title,
                content: postData.content,
                author: this.currentUser,
                status: postData.status || 'draft',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                imageUrl: postData.imageUrl || null,
                tags: postData.tags || [],
                likes: 0,
                featured: postData.featured || false
            };
            
            this.posts.unshift(newPost);
            this.renderPosts();
            this.updateStats();
            this.showAlert('Post creado exitosamente (modo local)', 'success');
            return newPost;
        } catch (error) {
            console.error('Error creating post:', error);
            this.showAlert('Error creando post: ' + error.message, 'danger');
        }
    }

    async updatePost(postId, postData) {
        try {
            const index = this.posts.findIndex(p => p.id === postId);
            if (index !== -1) {
                this.posts[index] = {
                    ...this.posts[index],
                    ...postData,
                    id: postId,
                    updatedAt: new Date().toISOString()
                };
                this.renderPosts();
                this.showAlert('Post actualizado exitosamente (modo local)', 'success');
                return this.posts[index];
            }
        } catch (error) {
            console.error('Error updating post:', error);
            this.showAlert('Error actualizando post: ' + error.message, 'danger');
        }
    }

    async deletePost(postId) {
        if (!confirm('¿Estás seguro de eliminar este post?')) return;

        try {
            this.posts = this.posts.filter(p => p.id !== postId);
            this.renderPosts();
            this.updateStats();
            this.showAlert('Post eliminado exitosamente (modo local)', 'success');
        } catch (error) {
            console.error('Error deleting post:', error);
            this.showAlert('Error eliminando post: ' + error.message, 'danger');
        }
    }

    renderPosts() {
        const container = document.getElementById('posts-list');
        if (!container) return;

        if (this.posts.length === 0) {
            container.innerHTML = `
                <div class="admin-alert admin-alert-info">
                    <span>📝</span>
                    No hay posts creados aún. ¡Crea tu primer post!
                </div>
            `;
            return;
        }

        container.innerHTML = this.posts.map(post => `
            <div class="post-item" data-post-id="${post.id}">
                <div class="post-header">
                    <h4>${post.title}</h4>
                    <div class="post-status">
                        <span class="status-badge status-${post.status}">${post.status}</span>
                    </div>
                </div>
                <div class="post-meta">
                    <span>📅 ${new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>👤 ${post.author.name}</span>
                    <span>❤️ ${post.likes}</span>
                </div>
                <div class="post-content">
                    <p>${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
                </div>
                <div class="post-actions">
                    <button class="btn-admin btn-admin-sm btn-admin-primary" onclick="adminPanel.editPost('${post.id}')">
                        ✏️ Editar
                    </button>
                    <button class="btn-admin btn-admin-sm btn-admin-danger" onclick="adminPanel.deletePost('${post.id}')">
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

        const statElements = {
            'stat-total-posts': totalPosts,
            'stat-published-posts': publishedPosts,
            'stat-draft-posts': draftPosts,
            'stat-total-likes': totalLikes
        };

        Object.entries(statElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    showCreatePostForm() {
        const modal = this.createModal('Crear Nuevo Post', `
            <form id="create-post-form" class="admin-form">
                <div class="form-group">
                    <label class="form-label">Título *</label>
                    <input type="text" name="title" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Contenido *</label>
                    <textarea name="content" class="form-input form-textarea" required></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">URL de Imagen (opcional)</label>
                    <input type="url" name="imageUrl" class="form-input">
                </div>
                <div class="form-group">
                    <label class="form-label">Tags (separados por comas)</label>
                    <input type="text" name="tags" class="form-input" placeholder="aws, comunidad, tecnología">
                </div>
                <div class="form-group">
                    <label class="form-label">Estado</label>
                    <select name="status" class="form-input">
                        <option value="draft">Borrador</option>
                        <option value="published">Publicado</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" name="featured"> Post destacado
                    </label>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-admin btn-admin-primary">Crear Post</button>
                    <button type="button" class="btn-admin btn-admin-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                </div>
            </form>
        `);

        document.getElementById('create-post-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const postData = {
                title: formData.get('title'),
                content: formData.get('content'),
                imageUrl: formData.get('imageUrl') || null,
                tags: formData.get('tags').split(',').map(t => t.trim()).filter(t => t),
                status: formData.get('status'),
                featured: formData.has('featured')
            };

            const result = await this.createPost(postData);
            if (result) {
                modal.remove();
            }
        });
    }

    editPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const modal = this.createModal('Editar Post', `
            <form id="edit-post-form" class="admin-form">
                <div class="form-group">
                    <label class="form-label">Título *</label>
                    <input type="text" name="title" class="form-input" value="${post.title}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Contenido *</label>
                    <textarea name="content" class="form-input form-textarea" required>${post.content}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">URL de Imagen</label>
                    <input type="url" name="imageUrl" class="form-input" value="${post.imageUrl || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Tags</label>
                    <input type="text" name="tags" class="form-input" value="${(post.tags || []).join(', ')}">
                </div>
                <div class="form-group">
                    <label class="form-label">Estado</label>
                    <select name="status" class="form-input">
                        <option value="draft" ${post.status === 'draft' ? 'selected' : ''}>Borrador</option>
                        <option value="published" ${post.status === 'published' ? 'selected' : ''}>Publicado</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" name="featured" ${post.featured ? 'checked' : ''}> Post destacado
                    </label>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-admin btn-admin-primary">Actualizar Post</button>
                    <button type="button" class="btn-admin btn-admin-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                </div>
            </form>
        `);

        document.getElementById('edit-post-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const postData = {
                title: formData.get('title'),
                content: formData.get('content'),
                imageUrl: formData.get('imageUrl') || null,
                tags: formData.get('tags').split(',').map(t => t.trim()).filter(t => t),
                status: formData.get('status'),
                featured: formData.has('featured')
            };

            const result = await this.updatePost(postId, postData);
            if (result) {
                modal.remove();
            }
        });
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); display: flex; align-items: center;
            justify-content: center; z-index: 10000;
        `;
        modal.innerHTML = `
            <div class="modal-content" style="background: var(--bg-color, white); padding: 30px; border-radius: 8px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; color: var(--text-color, #333);">${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-color, #333);">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    showAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `admin-alert admin-alert-${type}`;
        alert.innerHTML = `<span>${type === 'success' ? '✅' : type === 'danger' ? '❌' : 'ℹ️'}</span> ${message}`;
        alert.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10001;
            padding: 15px 20px; border-radius: 6px; max-width: 400px;
            background: ${type === 'success' ? 'rgba(39, 174, 96, 0.1)' : type === 'danger' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(52, 152, 219, 0.1)'};
            color: ${type === 'success' ? '#27ae60' : type === 'danger' ? '#e74c3c' : '#3498db'};
            border-left: 4px solid ${type === 'success' ? '#27ae60' : type === 'danger' ? '#e74c3c' : '#3498db'};
        `;
        
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 5000);
    }

    setupEventListeners() {
        document.querySelectorAll('.admin-tab button').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.showSection(section);
            });
        });

        const createBtn = document.getElementById('create-post-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.showCreatePostForm());
        }
    }

    showSection(sectionName) {
        document.querySelectorAll('.admin-tab button').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.section === sectionName);
        });

        document.querySelectorAll('.admin-section').forEach(section => {
            section.style.display = section.id === `${sectionName}-section` ? 'block' : 'none';
        });
    }
}

// Initialize admin panel
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});
