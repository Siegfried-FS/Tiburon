// Lambda function to render Open Graph meta tags for sharing feed posts.
// This function is designed to be triggered by an API Gateway.

const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

// --- CONFIGURATION ---
// Replace with your S3 bucket name and the key (path) to your feed.json file.
const S3_BUCKET_NAME = 'tiburon-community-data-1763934850'; // Por ejemplo: 'tiburon-community-data'
const S3_FEED_KEY = 'data/feed.json';        // Por ejemplo: 'production/feed.json'

// Información genérica de respaldo
const FALLBACK_TITLE = 'Comunidad AWS User Group Playa Vicente';
const FALLBACK_DESCRIPTION = 'Únete a nuestra comunidad para aprender sobre AWS, certificaciones y tecnología en la nube en español.';
const FALLBACK_IMAGE = 'https://placehold.co/1200x630/00d4ff/0a0a0a?text=Comunidad+AWS'; // Imagen de respaldo mejorada
const SITE_URL = 'https://tiburoncp.siegfried-fs.com'; // URL de tu sitio

const s3Client = new S3Client({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
    console.log('Event received:', JSON.stringify(event));

    // Get postId from the query string
    const postId = event.queryStringParameters?.postId;

    if (!postId) {
        console.log('No postId provided, returning fallback HTML.');
        return generateHtmlResponse(null);
    }

    try {
        // 1. Fetch feed.json from S3
        const command = new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: S3_FEED_KEY,
        });
        const response = await s3Client.send(command);
        const feedDataString = await response.Body.transformToString('utf-8');
        const posts = JSON.parse(feedDataString);

        // 2. Find the specific post
        const post = posts.find(p => p.id === postId);

        if (post) {
            console.log(`Post found for id: ${postId}`);
            return generateHtmlResponse(post);
        } else {
            console.warn(`Post not found for id: ${postId}. Returning fallback.`);
            return generateHtmlResponse(null);
        }

    } catch (error) {
        console.error('Error fetching or processing feed.json from S3:', error);
        // Return fallback page on any error
        return generateHtmlResponse(null);
    }
};

/**
 * Generates the full HTML response with the appropriate meta tags.
 * If post is null, it uses the fallback values.
 * @param {object | null} post - The feed post object.
 * @returns {object} The API Gateway response object.
 */
function generateHtmlResponse(post) {
    const title = post ? post.title : FALLBACK_TITLE;
    const description = post ? post.content.substring(0, 155) + '...' : FALLBACK_DESCRIPTION;
    
    // Convert relative image URLs to absolute URLs
    let imageUrl = post ? post.imageUrl : FALLBACK_IMAGE;
    if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `${SITE_URL}/${imageUrl}`;
    }
    
    // CORRECCIÓN: Apuntar a feed.html para evitar que el servidor devuelva index.html
    const redirectUrl = `${SITE_URL}/feed.html#post-${post ? post.id : ''}`;
    
    // URL canónica para Open Graph (sin el hash para mejor presentación)
    const canonicalUrl = `${SITE_URL}/feed.html`;

    const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            
            <!-- Canonical URL to override API Gateway URL -->
            <link rel="canonical" href="${redirectUrl}" />
            <meta name="url" content="${redirectUrl}" />
            <meta name="identifier-URL" content="${redirectUrl}" />

            <!-- Open Graph (Facebook, LinkedIn) -->
            <meta property="og:title" content="${title}" />
            <meta property="og:description" content="${description}" />
            <meta property="og:image" content="${imageUrl}" />
            <meta property="og:url" content="${redirectUrl}" />
            <meta property="og:type" content="article" />
            <meta property="og:site_name" content="AWS User Group Playa Vicente" />
            
            <!-- Twitter Cards -->
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="${title}">
            <meta name="twitter:description" content="${description}">
            <meta name="twitter:image" content="${imageUrl}">

            <!-- Manual redirect link for users -->
            <script type="text/javascript">
                // Only redirect if it's not a bot and after a delay
                if (!/bot|crawler|spider|crawling|facebook|twitter|linkedin/i.test(navigator.userAgent)) {
                    setTimeout(function() {
                        window.location.href = "${redirectUrl}";
                    }, 2000);
                }
            </script>
        </head>
        <body>
            <div style="text-align: center; padding: 20px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; margin-bottom: 20px;">
                    <h1 style="margin: 0 0 10px 0; font-size: 24px;">${title}</h1>
                    <p style="margin: 0; opacity: 0.9;">Redirigiendo al post...</p>
                </div>
                
                <!-- Monetization Content -->
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #28a745;">
                    <h3 style="color: #28a745; margin-top: 0;">🚀 ¿Quieres aprender AWS?</h3>
                    <p style="margin: 10px 0; color: #666;">Únete a nuestra comunidad y obtén acceso a:</p>
                    <ul style="text-align: left; color: #666; margin: 10px 0;">
                        <li>📚 Recursos gratuitos de AWS</li>
                        <li>🎯 Talleres prácticos</li>
                        <li>💬 Comunidad activa en Telegram</li>
                        <li>🏆 Certificaciones y reconocimientos</li>
                    </ul>
                    <a href="https://tiburoncp.siegfried-fs.com" style="display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">¡Únete Gratis!</a>
                </div>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border: 1px solid #ffeaa7;">
                    <p style="margin: 0; color: #856404;">
                        <strong>💡 Tip:</strong> Si no eres redirigido automáticamente, 
                        <a href="${redirectUrl}" style="color: #0066cc; text-decoration: none; font-weight: bold;">haz clic aquí</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
        },
        body: html,
    };
}
