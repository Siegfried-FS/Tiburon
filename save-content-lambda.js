const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({ region: 'us-east-1' });
const BUCKET_NAME = 'tiburon-content-bucket';

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
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

        if (event.requestContext.http.method !== 'POST') {
            return {
                statusCode: 405,
                headers,
                body: JSON.stringify({ error: 'Method not allowed' })
            };
        }

        const body = JSON.parse(event.body);
        const { fileName, content } = body;

        if (!fileName || !content) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'fileName and content are required' })
            };
        }

        // Guardar en S3
        await s3.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `assets/data/${fileName}`,
            Body: JSON.stringify(content, null, 2),
            ContentType: 'application/json'
        }));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                message: 'Content saved successfully',
                fileName: fileName
            })
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
