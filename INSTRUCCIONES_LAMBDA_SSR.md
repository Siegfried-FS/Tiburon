# Guía Completa: Renderizado de Vistas Previas para Redes Sociales con Lambda y API Gateway

## 1. Contexto y Problema a Solucionar

**El Problema:** Cuando compartes un enlace de una página moderna (como la nuestra) en redes sociales (Facebook, LinkedIn, etc.), el bot de la red social (crawler) intenta leer la URL para generar una vista previa (título, descripción e imagen). Sin embargo, estos bots generalmente no ejecutan el JavaScript de la página. Como nuestro contenido del feed se carga dinámicamente con JS, el bot solo ve una página HTML casi vacía, resultando en una "publicación en blanco".

**La Solución:** Vamos a interceptar las peticiones destinadas a ser compartidas y usar una función de AWS Lambda para generar sobre la marcha una página HTML simple que solo contenga las metaetiquetas Open Graph (OG) que los bots necesitan. Un usuario real que haga clic en el enlace será redirigido instantáneamente a la publicación correcta en el feed.

---

## 2. Arquitectura de la Solución

El flujo será el siguiente:

1.  **Usuario hace clic en 'Compartir'**: El enlace de compartir apuntará a una URL de nuestro API Gateway (Ej: `https://<id>.amazonaws.com/share?postId=post001`).
2.  **API Gateway**: Recibe la petición y activa nuestra función AWS Lambda, pasándole el `postId`.
3.  **AWS Lambda**:
    *   Lee el `postId`.
    *   Obtiene el archivo `feed.json` desde un bucket de S3.
    *   Busca la información del post específico.
    *   Genera un código HTML simple con las etiquetas `og:title`, `og:description`, `og:image` etc., correspondientes a ese post.
    *   Devuelve este HTML.
4.  **Bot de Red Social**: Recibe el HTML generado por Lambda, lo lee y crea la vista previa correctamente.
5.  **Usuario Real**: Si un humano abre el enlace, el HTML contiene una redirección que lo lleva a la página del feed (`feed.html`).

---

## 3. Código de la Función Lambda (`og-renderer-lambda.js`)

Este es el código completo para la función Lambda. Utiliza Node.js 20.x.

```javascript
// Lambda function to render Open Graph meta tags for sharing feed posts.
// This function is designed to be triggered by an API Gateway.

const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

// --- CONFIGURATION ---
// Deberás reemplazar estos valores por los tuyos.
const S3_BUCKET_NAME = 'TU_BUCKET_DE_S3_AQUI'; // Por ejemplo: 'tiburon-community-data'
const S3_FEED_KEY = 'data/feed.json';        // La ruta a tu archivo dentro del bucket.

// Información genérica de respaldo
const FALLBACK_TITLE = 'Comunidad AWS User Group Playa Vicente';
const FALLBACK_DESCRIPTION = 'Únete a nuestra comunidad para aprender sobre AWS, certificaciones y tecnología en la nube en español.';
const FALLBACK_IMAGE = 'https://tiburoncp.siegfried-fs.com/og-tiburon.jpg'; // URL a tu imagen principal
const SITE_URL = 'https://tiburoncp.siegfried-fs.com'; // URL de tu sitio

const s3Client = new S3Client({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
    console.log('Event received:', JSON.stringify(event));

    const postId = event.queryStringParameters?.postId;

    if (!postId) {
        console.log('No postId provided, returning fallback HTML.');
        return generateHtmlResponse(null);
    }

    try {
        const command = new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: S3_FEED_KEY,
        });
        const response = await s3Client.send(command);
        const feedDataString = await response.Body.transformToString('utf-8');
        const posts = JSON.parse(feedDataString);

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
        return generateHtmlResponse(null);
    }
};

function generateHtmlResponse(post) {
    const title = post ? post.title : FALLBACK_TITLE;
    const description = post ? post.content.substring(0, 155) + '...' : FALLBACK_DESCRIPTION;
    const imageUrl = post ? post.imageUrl : FALLBACK_IMAGE;
    
    const redirectUrl = `${SITE_URL}/feed.html#post-${post ? post.id : ''}`;

    const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <meta property="og:title" content="${title}" />
            <meta property="og:description" content="${description}" />
            <meta property="og:image" content="${imageUrl}" />
            <meta property="og:url" content="${redirectUrl}" />
            <meta property="og:type" content="article" />
            <meta name="twitter:card" content="summary_large_image">
            <meta http-equiv="refresh" content="0; url=${redirectUrl}">
        </head>
        <body>
            <p>Redirigiendo a la publicación... <a href="${redirectUrl}">haz clic aquí si no eres redirigido</a>.</p>
        </body>
        </html>
    `;

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
        body: html,
    };
}
```

---

## 4. Pasos de Configuración en AWS

### A. Bucket S3 para `feed.json`

1.  **Ir a S3:** En la consola de AWS, busca y abre el servicio **S3**.
2.  **Crear Bucket:**
    *   **Nombre:** Elige un nombre único global (ej: `tiburon-community-data`). **Anótalo**.
    *   **Región:** La que prefieras (ej: `us-east-1`).
    *   **Acceso Público:** Desmarca la casilla `Block all public access`. Confirma la advertencia. Esto es necesario para que el sitio web (`app.js`) pueda leer el `feed.json`, y la Lambda pueda modificarlo.
    *   Deja el resto por defecto y haz clic en **Crear**.
3.  **Subir Archivo:**
    *   Entra al bucket, crea una carpeta `data`.
    *   Dentro de `data`, sube el archivo `feed.json` que está en tu proyecto (`public/assets/data/feed.json`).
4.  **Hacer Archivo Público:** Selecciona el `feed.json` subido, ve a `Actions` -> `Make public using ACL` y confirma.

### B. Rol de IAM para la Lambda

1.  **Ir a IAM:** En la consola, busca y abre el servicio **IAM**.
2.  **Crear Rol:**
    *   Ve a `Roles` -> `Create role`.
    *   **Tipo de Entidad:** `AWS service`.
    *   **Caso de Uso:** `Lambda`. Clic en `Next`.
    *   **Añadir Permisos:** Busca y añade estas dos políticas:
        1.  `AWSLambdaBasicExecutionRole` (para logs)
        2.  `AmazonS3FullAccess` (para leer y escribir en el bucket S3). *Para mayor seguridad, podrías crear una política personalizada que solo dé acceso a tu bucket específico, pero para empezar esto es más sencillo.*
    *   **Nombrar y Crear:** Dale un nombre (ej: `LambdaSocialShareRole`) y crea el rol.

### C. Función Lambda

1.  **Ir a Lambda:** Busca y abre el servicio **AWS Lambda**.
2.  **Crear Función:**
    *   `Author from scratch` (Crear desde cero).
    *   **Nombre:** `og-renderer-lambda`.
    *   **Runtime:** `Node.js 20.x`.
    *   **Permisos:** Expande `Change default execution role`, selecciona `Use an existing role` y elige el rol `LambdaSocialShareRole` que creaste.
    *   Haz clic en **Crear**.
3.  **Configurar Código:**
    *   En la pestaña `Code`, borra el código de ejemplo y **pega el contenido completo** del bloque de código de la sección 3 de este documento.
    *   **MUY IMPORTANTE:** Edita las líneas 7 y 8 del código para poner el nombre de tu bucket S3 y la ruta del archivo.
        ```javascript
        const S3_BUCKET_NAME = 'tiburon-community-data'; // <-- TU NOMBRE DE BUCKET
        const S3_FEED_KEY = 'data/feed.json';          // <-- RUTA EN EL BUCKET
        ```
    *   Haz clic en el botón `Deploy` para guardar.

### D. API Gateway

1.  **Ir a API Gateway:** Busca y abre el servicio.
2.  **Crear API:**
    *   Busca el cuadro de **HTTP API** y haz clic en `Build`.
    *   **Integrations:** Clic en `Add integration`. Selecciona `Lambda`, tu región y tu función `og-renderer-lambda`. Dale un nombre a la integración (ej: `ShareLinkIntegration`).
    *   **Rutas:** Clic en `Next`. Configura una ruta:
        *   **Método:** `GET`
        *   **Ruta:** `/share`
        *   **Integración:** Elige la `ShareLinkIntegration` que acabas de crear.
    *   **Etapas:** Clic en `Next`. Puedes dejar el nombre `$default`.
    *   **Revisar y Crear:** Clic en `Next` y `Create`.
3.  **Obtener URL:** En la página de tu API, verás la **Invoke URL**. Cópiala. Será algo como `https://abcdef123.execute-api.us-east-1.amazonaws.com`.

---

## 5. Conexión Final en el Código del Proyecto

Ahora que tienes la URL de tu API Gateway, el último paso es decirle a tu botón 'Compartir' que la use.

1.  **Abre el archivo `public/assets/js/app.js` en tu proyecto.**
2.  **Busca la función `loadFeed`.**
3.  **Modifica los enlaces de compartir** para que usen tu nueva URL.

    **Busca estas líneas:**
    ```javascript
    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}#feed" target="_blank" class="action-btn">Facebook</a>
    <a href="https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(post.title)}&summary=${encodeURIComponent(post.content.substring(0, 100))}" target="_blank" class="action-btn">LinkedIn</a>
    ```

    **Y reemplázalas con estas, pegando tu URL de API Gateway:**
    ```javascript
    const shareUrl = `https://<TU_API_GATEWAY_URL_AQUI>/share?postId=${post.id}`;

    // ... dentro del HTML que se genera:
    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}" target="_blank" class="action-btn">Facebook</a>
    <a href="https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}&summary=${encodeURIComponent(post.content.substring(0, 100))}" target="_blank" class="action-btn">LinkedIn</a>
    ```

4.  **Actualiza la lectura del feed:** La página ahora debe leer `feed.json` desde S3, no desde la ruta local.
    *   En `app.js`, busca de nuevo la función `loadFeed`.
    *   Cambia la línea `const response = await fetch('assets/data/feed.json');` por la URL pública de tu archivo en S3.
        ```javascript
        // Reemplaza esta URL por la URL pública de tu feed.json en S3
        const feedUrl = 'https://<TU_BUCKET_DE_S3_AQUI>.s3.amazonaws.com/data/feed.json';
        const response = await fetch(feedUrl);
        ```

¡Y eso es todo! Con esta configuración, tus publicaciones del feed tendrán vistas previas dinámicas y específicas para cada red social.
