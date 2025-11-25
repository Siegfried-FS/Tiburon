#!/bin/bash

# Simple Lambda deployment script
set -e

FUNCTION_NAME="og-renderer-lambda"
REGION="us-east-1"

echo "📦 Empaquetando función Lambda..."

# Create deployment package
zip -r lambda-deployment.zip og-renderer-lambda.js package.json

echo "🚀 Actualizando función Lambda..."

# Update function code
aws lambda update-function-code \
    --function-name $FUNCTION_NAME \
    --zip-file fileb://lambda-deployment.zip \
    --region $REGION

echo "✅ Función Lambda actualizada exitosamente"

# Clean up
rm lambda-deployment.zip

echo "🎉 ¡Despliegue completado!"
