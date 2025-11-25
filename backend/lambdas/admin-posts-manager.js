const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const BUCKET_NAME = 'tiburon-content-bucket';
const POSTS_KEY = 'data/admin-posts.json';
const FEED_KEY = 'data/feed.json';

const ALLOWED_ORIGINS = [
    'https://tiburoncp.siegfried-fs.com',
    'https://asauchi.d1w1ma3qitwxej.amplifyapp.com',
    'http://localhost:8000'
];

const getCorsHeaders = (origin) => {
    const isAllowed = ALLOWED_ORIGINS.includes(origin);
    return {
        'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
    };
};

// Función básica para verificar token (sin JWT library por ahora)
function basicTokenCheck(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return false;
    }
    
    const token = authHeader.substring(7);
    // Verificación básica: el token debe tener al menos 100 caracteres (JWT típico)
    return token.length > 100;
}

// Función para obtener datos de S3
async function getS3Data(key) {
    try {
        const params = { Bucket: BUCKET_NAME, Key: key };
        const data = await s3.getObject(params).promise();
        return JSON.parse(data.Body.toString());
    } catch (error) {
        if (error.code === 'NoSuchKey') {
            return key === POSTS_KEY ? { posts: [], metadata: { totalPosts: 0, lastUpdated: new Date().toISOString(), version: "1.0" } } : { posts: [] };
        }
        throw error;
    }
}

// Función para guardar datos en S3
async function putS3Data(key, data) {
    const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: JSON.stringify(data, null, 2),
        ContentType: 'application/json'
    };
    await s3.putObject(params).promise();
}

// Generar ID único para posts
function generatePostId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `post${timestamp}${random}`;
}

// Sincronizar con feed público
async function syncToFeed(adminPosts) {
    const publicPosts = adminPosts.posts
        .filter(post => post.status === 'published')
        .map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            author: post.author,
            date: post.createdAt,
            imageUrl: post.imageUrl,
            likes: post.likes || 0
        }));
    
    await putS3Data(FEED_KEY, { posts: publicPosts });
}

exports.handler = async (event) => {
    const origin = event.headers?.origin || event.headers?.Origin;
    const corsHeaders = getCorsHeaders(origin);
    
    console.log('Event received:', JSON.stringify(event, null, 2));
    
    // Handle preflight
    if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
        return { statusCode: 200, headers: corsHeaders, body: '' };
    }
    
    try {
        const method = event.httpMethod || event.requestContext?.http?.method;
        const path = event.path || event.rawPath;
        
        console.log('Method:', method, 'Path:', path);
        
        // Para operaciones que no sean GET, verificar token básico
        if (method !== 'GET') {
            const authHeader = event.headers?.Authorization || event.headers?.authorization;
            if (!basicTokenCheck(authHeader)) {
                return {
                    statusCode: 401,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Token de autorización requerido' })
                };
            }
        }
        
        // GET /admin/posts - Listar posts
        if (method === 'GET' && path === '/admin/posts') {
            const data = await getS3Data(POSTS_KEY);
            return {
                statusCode: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            };
        }
        
        // POST /admin/posts - Crear post
        if (method === 'POST' && path === '/admin/posts') {
            const body = JSON.parse(event.body);
            const data = await getS3Data(POSTS_KEY);
            
            const newPost = {
                id: generatePostId(),
                title: body.title,
                content: body.content,
                author: body.author,
                status: body.status || 'draft',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                imageUrl: body.imageUrl || null,
                tags: body.tags || [],
                likes: 0,
                featured: body.featured || false
            };
            
            data.posts.unshift(newPost);
            data.metadata.totalPosts = data.posts.length;
            data.metadata.lastUpdated = new Date().toISOString();
            
            await putS3Data(POSTS_KEY, data);
            
            // Sincronizar con feed si está publicado
            if (newPost.status === 'published') {
                await syncToFeed(data);
            }
            
            return {
                statusCode: 201,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify(newPost)
            };
        }
        
        // PUT /admin/posts/{id} - Actualizar post
        if (method === 'PUT' && path.startsWith('/admin/posts/')) {
            const postId = path.split('/').pop();
            const body = JSON.parse(event.body);
            const data = await getS3Data(POSTS_KEY);
            
            const postIndex = data.posts.findIndex(p => p.id === postId);
            if (postIndex === -1) {
                return {
                    statusCode: 404,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Post not found' })
                };
            }
            
            // Actualizar post
            data.posts[postIndex] = {
                ...data.posts[postIndex],
                ...body,
                id: postId, // Mantener ID original
                updatedAt: new Date().toISOString()
            };
            
            data.metadata.lastUpdated = new Date().toISOString();
            await putS3Data(POSTS_KEY, data);
            await syncToFeed(data);
            
            return {
                statusCode: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify(data.posts[postIndex])
            };
        }
        
        // DELETE /admin/posts/{id} - Eliminar post
        if (method === 'DELETE' && path.startsWith('/admin/posts/')) {
            const postId = path.split('/').pop();
            const data = await getS3Data(POSTS_KEY);
            
            const postIndex = data.posts.findIndex(p => p.id === postId);
            if (postIndex === -1) {
                return {
                    statusCode: 404,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Post not found' })
                };
            }
            
            data.posts.splice(postIndex, 1);
            data.metadata.totalPosts = data.posts.length;
            data.metadata.lastUpdated = new Date().toISOString();
            
            await putS3Data(POSTS_KEY, data);
            await syncToFeed(data);
            
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ message: 'Post deleted successfully' })
            };
        }
        
        return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Endpoint not found' })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Internal server error', details: error.message })
        };
    }
};
