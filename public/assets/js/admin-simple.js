// Admin Panel Simple - Usando estilos del sitio
class AdminPanel {
    constructor() {
        this.currentUser = {
            name: 'Administrador',
            email: 'admin@tiburoncp.com',
            avatar: '/assets/images/avatar-default.png'
        };
        this.posts = [];
        this.init();
    }

    async init() {
        await this.loadCurrentUser();
        await this.loadExistingPosts();
        this.setupEventListeners();
    }

    async loadCurrentUser() {
        const token = localStorage.getItem('cognitoToken');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                this.currentUser = {
                    name: payload.name || payload.email || 'Administrador',
                    email: payload.email || 'admin@tiburoncp.com',
                    avatar: payload.picture || '/assets/images/avatar-default.png'
                };
                
                const nameElement = document.getElementById('userName');
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
            this.posts = [];
            this.renderPosts();
            this.updateStats();
        }
    }

    async createPost(postData) {
        try {
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
            this.showAlert('Post creado exitosamente', 'success');
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
                this.showAlert('Post actualizado exitosamente', 'success');
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
            this.showAlert('Post eliminado exitosamente', 'success');
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
                <div class="alert alert-info">
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
                    <span>👤 ${post.author?.name || 'Autor desconocido'}</span>
                    <span>❤️ ${post.likes}</span>
                </div>
                <div class="post-content">
                    <p>${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
                </div>
                <div class="post-actions">
                    <button class="btn btn-sm btn-primary" onclick="adminPanel.editPost('${post.id}')">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminPanel.deletePost('${post.id}')">
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
            <form id="create-post-form">
                <div class="form-group">
                    <label>Título *</label>
                    <input type="text" name="title" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Contenido *</label>
                    <textarea name="content" class="form-control" rows="6" required></textarea>
                </div>
                <div class="form-group">
                    <label>URL de Imagen (opcional)</label>
                    <input type="url" name="imageUrl" class="form-control">
                </div>
                <div class="form-group">
                    <label>Tags (separados por comas)</label>
                    <input type="text" name="tags" class="form-control" placeholder="aws, comunidad, tecnología">
                </div>
                <div class="form-group">
                    <label>Estado</label>
                    <select name="status" class="form-control">
                        <option value="draft">Borrador</option>
                        <option value="published">Publicado</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Crear Post</button>
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
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
                featured: false
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
            <form id="edit-post-form">
                <div class="form-group">
                    <label>Título *</label>
                    <input type="text" name="title" class="form-control" value="${post.title}" required>
                </div>
                <div class="form-group">
                    <label>Contenido *</label>
                    <textarea name="content" class="form-control" rows="6" required>${post.content}</textarea>
                </div>
                <div class="form-group">
                    <label>URL de Imagen</label>
                    <input type="url" name="imageUrl" class="form-control" value="${post.imageUrl || ''}">
                </div>
                <div class="form-group">
                    <label>Tags</label>
                    <input type="text" name="tags" class="form-control" value="${(post.tags || []).join(', ')}">
                </div>
                <div class="form-group">
                    <label>Estado</label>
                    <select name="status" class="form-control">
                        <option value="draft" ${post.status === 'draft' ? 'selected' : ''}>Borrador</option>
                        <option value="published" ${post.status === 'published' ? 'selected' : ''}>Publicado</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Actualizar Post</button>
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
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
                featured: false
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
            <div class="card" style="max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0;">${title}</h3>
                    <button onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
                </div>
                <div class="card-content">
                    ${content}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    showAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `<span>${type === 'success' ? '✅' : type === 'danger' ? '❌' : 'ℹ️'}</span> ${message}`;
        alert.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10001;
            padding: 15px 20px; border-radius: 6px; max-width: 400px;
        `;
        
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 5000);
    }

    setupEventListeners() {
        const createBtn = document.getElementById('create-post-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.showCreatePostForm());
        }
    }
}

// Initialize admin panel
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});
