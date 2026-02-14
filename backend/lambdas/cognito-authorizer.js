/**
 * Lambda Authorizer para API Gateway
 * Verifica tokens JWT de Cognito y permisos de Admin
 */

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const COGNITO_REGION = 'us-east-1';
const USER_POOL_ID = 'us-east-1_Cg5yUjR6L';
const COGNITO_ISSUER = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${USER_POOL_ID}`;

// Cliente JWKS para verificar firma del token
const client = jwksClient({
    jwksUri: `${COGNITO_ISSUER}/.well-known/jwks.json`
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            callback(err);
        } else {
            const signingKey = key.publicKey || key.rsaPublicKey;
            callback(null, signingKey);
        }
    });
}

exports.handler = async (event) => {
    console.log('🔐 Verificando autorización...');
    
    const token = event.headers?.authorization?.replace('Bearer ', '') || 
                  event.headers?.Authorization?.replace('Bearer ', '');
    
    if (!token) {
        console.error('❌ No se proporcionó token');
        return generatePolicy('user', 'Deny', event.methodArn);
    }

    try {
        // Verificar y decodificar token
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, getKey, {
                issuer: COGNITO_ISSUER,
                algorithms: ['RS256']
            }, (err, decoded) => {
                if (err) reject(err);
                else resolve(decoded);
            });
        });

        console.log('✅ Token válido para:', decoded['cognito:username']);

        // Verificar que sea Admin
        const groups = decoded['cognito:groups'] || [];
        if (!groups.includes('Admins')) {
            console.error('⛔ Usuario no es Admin');
            return generatePolicy(decoded.sub, 'Deny', event.methodArn);
        }

        console.log('✅ Usuario autorizado como Admin');
        return generatePolicy(decoded.sub, 'Allow', event.methodArn, {
            username: decoded['cognito:username'],
            email: decoded.email,
            groups: groups.join(',')
        });

    } catch (error) {
        console.error('❌ Error verificando token:', error.message);
        return generatePolicy('user', 'Deny', event.methodArn);
    }
};

function generatePolicy(principalId, effect, resource, context = {}) {
    return {
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [{
                Action: 'execute-api:Invoke',
                Effect: effect,
                Resource: resource
            }]
        },
        context
    };
}
