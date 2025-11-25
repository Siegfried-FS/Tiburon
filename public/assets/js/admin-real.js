// Admin Panel - Real Backend Integration
class AdminPanel {
    constructor() {
        this.apiBase = 'https://fklo6233x5.execute-api.us-east-1.amazonaws.com/prod';
        this.currentUser = null;
        this.posts = [];
        this.init();
    }

    async init() {
        await this.loadCurrentUser();
        await this.loadPosts();
        this.setupEventListeners();
        this.showSection('dashboard');
    }

    async loadCurrentUser() {
        // Get user from Cognito token (already verified by admin-panel-security.js)
        const token = localStorage.getItem('cognitoToken');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                this.currentUser = {
                    name: payload.name || payload.email,
                    email: payload.email,
                    avatar: payload.picture || '/assets/images/avatar-default.png'
                };
            } catch (error) {
                console.error('Error parsing token:', error);
            }
        }
    }

    async loadPosts() {
        try {
            const token = localStorage.getItem('cognitoToken');
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // Agregar token si existe (para futuras validaciones)
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${this.apiBase}/admin/posts`, { headers });
            if (response.ok) {
                const data = await response.json();
                this.posts = data.posts || [];
                this.renderPosts();
                this.updateStats();
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error loading posts:', error);
            this.showAlert('Error cargando posts: ' + error.message, 'danger');
        }
    }

    async createPost(postData) {
        try {
            const token = localStorage.getItem('cognitoToken');
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${this.apiBase}/admin/posts`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    ...postData,
                    author: this.currentUser
                })
            });

            if (response.ok) {
                const newPost = await response.json();
                this.posts.unshift(newPost);
                this.renderPosts();
                this.updateStats();
                this.showAlert('Post creado exitosamente', 'success');
                return newPost;
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error creating post');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            this.showAlert('Error creando post: ' + error.message, 'danger');
        }
    }

    async updatePost(postId, postData) {
        try {
            const token = localStorage.getItem('cognitoToken');
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${this.apiBase}/admin/posts/${postId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(postData)
            });

            if (response.ok) {
                const updatedPost = await response.json();
                const index = this.posts.findIndex(p => p.id === postId);
                if (index !== -1) {
                    this.posts[index] = updatedPost;
                    this.renderPosts();
                    this.showAlert('Post actualizado exitosamente', 'success');
                }
                return updatedPost;
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error updating post');
            }
        } catch (error) {
            console.error('Error updating post:', error);
            this.showAlert('Error actualizando post: ' + error.message, 'danger');
        }
    }

    async deletePost(postId) {
        if (!confirm('¿Estás seguro de eliminar este post?')) return;

        try {
            const token = localStorage.getItem('cognitoToken');
            const headers = {};
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${this.apiBase}/admin/posts/${postId}`, {
                method: 'DELETE',
                headers
            });

            if (response.ok) {
                this.posts = this.posts.filter(p => p.id !== postId);
                this.renderPosts();
                this.updateStats();
                this.showAlert('Post eliminado exitosamente', 'success');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error deleting post');
            }
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

        // Update stat cards
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
            <div class="modal-content" style="background: white; padding: 30px; border-radius: 8px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0;">${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
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
        // Tab navigation
        document.querySelectorAll('.admin-tab button').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.showSection(section);
            });
        });

        // Create post button
        const createBtn = document.getElementById('create-post-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.showCreatePostForm());
        }
    }

    showSection(sectionName) {
        // Update active tab
        document.querySelectorAll('.admin-tab button').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.section === sectionName);
        });

        // Show/hide sections
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
