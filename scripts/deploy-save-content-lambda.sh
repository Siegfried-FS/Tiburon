#!/bin/bash

# Simple Lambda deployment script for save-content-lambda
set -e

FUNCTION_NAME="save-content-lambda"
JS_FILE="save-content-lambda.js"
REGION="us-east-1"
PROFILE="admin"

echo "📦 Empaquetando función Lambda: $JS_FILE..."

# Create deployment package
zip -r lambda-deployment.zip "$JS_FILE" node_modules

echo "🚀 Actualizando función Lambda: $FUNCTION_NAME..."

# Update function code
aws lambda update-function-code \
    --function-name $FUNCTION_NAME \
    --zip-file fileb://lambda-deployment.zip \
    --region $REGION \
    --runtime nodejs24.x \
    --profile $PROFILE

echo "✅ Función Lambda $FUNCTION_NAME actualizada exitosamente"

# Clean up
rm lambda-deployment.zip

echo "🎉 ¡Despliegue de $FUNCTION_NAME completado!"
