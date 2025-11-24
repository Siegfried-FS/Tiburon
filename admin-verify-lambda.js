const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Configuración de Cognito
const COGNITO_REGION = 'us-east-1';
const USER_POOL_ID = 'us-east-1_Cg5yUjR6L';
const JWKS_URI = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`;

// Cliente JWKS para verificar tokens
const client = jwksClient({
    jwksUri: JWKS_URI,
    requestHeaders: {},
    timeout: 30000
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
}

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': 'https://tiburoncp.siegfried-fs.com',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // Extraer token del header Authorization
        const authHeader = event.headers.Authorization || event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Token no proporcionado' })
            };
        }

        const token = authHeader.substring(7);

        // Verificar y decodificar el token JWT
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, getKey, {
                issuer: `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${USER_POOL_ID}`,
                algorithms: ['RS256']
            }, (err, decoded) => {
                if (err) reject(err);
                else resolve(decoded);
            });
        });

        // Verificar que el token sea de tipo access
        if (decoded.token_use !== 'access') {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Tipo de token inválido' })
            };
        }

        // Verificar que el usuario tenga grupo Admins
        const groups = decoded['cognito:groups'] || [];
        if (!groups.includes('Admins')) {
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({ error: 'Permisos insuficientes' })
            };
        }

        // Log de acceso para auditoría
        console.log(`Admin access granted to user: ${decoded.username} at ${new Date().toISOString()}`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                valid: true,
                user: {
                    username: decoded.username,
                    groups: groups,
                    exp: decoded.exp
                }
            })
        };

    } catch (error) {
        console.error('Token verification failed:', error);
        
        return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ 
                error: 'Token inválido',
                details: error.message 
            })
        };
    }
};
