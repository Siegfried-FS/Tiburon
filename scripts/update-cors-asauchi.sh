#!/bin/bash

# Script para actualizar CORS en las funciones Lambda para incluir asauchi

echo "🔧 Actualizando CORS para incluir dominio asauchi..."

# Función para actualizar el código de una Lambda con CORS mejorado
update_lambda_cors() {
    local function_name=$1
    echo "📝 Actualizando $function_name..."
    
    # Crear archivo temporal con código actualizado
    cat > /tmp/${function_name}.js << 'EOF'
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const path = require('path');

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

exports.handler = async (event) => {
    const origin = event.headers?.origin || event.headers?.Origin;
    const corsHeaders = getCorsHeaders(origin);
    
    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }
    
    try {
        // Existing function logic here...
        const filename = event.pathParameters?.filename;
        if (!filename) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Filename is required' })
            };
        }
        
        // Security: Prevent path traversal
        const safeName = path.basename(filename);
        if (safeName !== filename || filename.includes('..')) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: '¡Oye, pirata! Todos los intentos son monitoreados. ¡Procede con cuidado!' })
            };
        }
        
        const params = {
            Bucket: 'tiburon-content-bucket',
            Key: `data/${safeName}`
        };
        
        const data = await s3.getObject(params).promise();
        const content = JSON.parse(data.Body.toString());
        
        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(content)
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
EOF

    # Crear ZIP y actualizar función
    cd /tmp
    zip ${function_name}.zip ${function_name}.js
    aws lambda update-function-code \
        --function-name $function_name \
        --zip-file fileb://${function_name}.zip \
        --profile admin \
        --region us-east-1
    
    rm ${function_name}.js ${function_name}.zip
    echo "✅ $function_name actualizada"
}

# Actualizar funciones principales
update_lambda_cors "get-content-lambda"

echo "🎯 CORS actualizado para asauchi.d1w1ma3qitwxej.amplifyapp.com"
