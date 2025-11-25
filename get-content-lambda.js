const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');

const s3 = new S3Client({ region: 'us-east-1' });
const BUCKET_NAME = 'tiburon-content-bucket';

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Content-Type': 'application/json'
};

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        // Handle CORS preflight
        if (event.requestContext.http.method === 'OPTIONS') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: 'CORS preflight' })
            };
        }

        if (event.requestContext.http.method !== 'GET') {
            return {
                statusCode: 405,
                headers,
                body: JSON.stringify({ error: 'Method not allowed' })
            };
        }

        // Extraer filename del path
        const filename = event.pathParameters?.filename;

        if (!filename || !filename.endsWith('.json')) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid filename' })
            };
        }
        
        // Sanitize filename to prevent path traversal
        const baseName = path.basename(filename);

        // All input is sanitized. Path traversal attempts are logged.
        if (baseName !== filename) {
            console.warn(`Potential path traversal attempt blocked: ${filename}`);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    message: "🕵️ ¡Atención, explorador!",
                    details: "Tu intento de path traversal ha sido bloqueado y registrado. Nos tomamos la seguridad muy en serio.",
                    invitation: "Si te apasiona la seguridad, ¿por qué no te unes a nuestra comunidad para colaborar de forma ética?",
                    community_url: "https://t.me/+NWYivRxl7fQ4MzNh"
                })
            };
        }

        // Obtener archivo de S3
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `assets/data/${baseName}`
        });

        const response = await s3.send(command);
        const content = await response.Body.transformToString();

        return {
            statusCode: 200,
            headers,
            body: content
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error',
                details: error.message
            })
        };
    }
};
