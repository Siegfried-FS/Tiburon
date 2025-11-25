// Admin Panel - Exactamente como el sitio principal
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
                
                this.renderPosts();
                this.updateStats();
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

        document.getElementById('stat-total-posts').textContent = totalPosts;
        document.getElementById('stat-published-posts').textContent = publishedPosts;
        document.getElementById('stat-draft-posts').textContent = draftPosts;
        document.getElementById('stat-total-likes').textContent = totalLikes;
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
            <div class="feed-item" style="max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>${title}</h3>
                    <button onclick="this.closest('div').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-color);">×</button>
                </div>
                <form id="post-form">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Título:</label>
                        <input type="text" name="title" value="${editPost?.title || ''}" required 
                               style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 5px; background: var(--card-bg); color: var(--text-color);">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Contenido:</label>
                        <textarea name="content" rows="6" required 
                                  style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 5px; background: var(--card-bg); color: var(--text-color);">${editPost?.content || ''}</textarea>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Estado:</label>
                        <select name="status" style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 5px; background: var(--card-bg); color: var(--text-color);">
                            <option value="draft" ${editPost?.status === 'draft' ? 'selected' : ''}>Borrador</option>
                            <option value="published" ${editPost?.status === 'published' ? 'selected' : ''}>Publicado</option>
                        </select>
                    </div>
                    <div style="text-align: center;">
                        <button type="submit" class="nav-btn" style="margin-right: 10px;">
                            ${isEdit ? '✏️ Actualizar' : '➕ Crear'} Post
                        </button>
                        <button type="button" onclick="this.closest('div').remove()" class="nav-btn" style="background: #666;">
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
        alert.className = 'feed-item';
        alert.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10001;
            max-width: 300px; background: var(--primary-color); color: white;
        `;
        alert.innerHTML = `<p style="margin: 0;">✅ ${message}</p>`;
        
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 3000);
    }

    setupEventListeners() {
        // Navegación
        document.querySelectorAll('.nav-btn[data-section]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                
                // Update active button
                document.querySelectorAll('.nav-btn[data-section]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Show/hide sections
                document.querySelectorAll('.content-section').forEach(s => {
                    s.style.display = s.id === `${section}-section` ? 'block' : 'none';
                });
            });
        });

        // Create post button
        const createBtn = document.getElementById('create-post-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.showCreatePostForm());
        }
    }
}

// Initialize
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});
