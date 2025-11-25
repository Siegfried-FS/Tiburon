#!/bin/bash

# Idempotent Lambda deployment script for admin-manage-users-lambda
set -e

FUNCTION_NAME="admin-manage-users-lambda"
JS_FILE="admin-manage-users-lambda.js"
RUNTIME="nodejs24.x"
HANDLER="$JS_FILE.handler"
ROLE_ARN="arn:aws:iam::864981725738:role/LambdaAdminPostsRole"
REGION="us-east-1"
PROFILE="admin"
USER_POOL_ID="us-east-1_Cg5yUjR6L"

echo "📦 Empaquetando función Lambda: $JS_FILE..."
zip -r lambda-deployment.zip "$JS_FILE" node_modules

# Check if function exists
FUNCTION_EXISTS=$(aws lambda get-function --function-name $FUNCTION_NAME --profile $PROFILE --region $REGION 2>&1 || true)

if [[ $FUNCTION_EXISTS == *"ResourceNotFoundException"* ]]; then
    echo "🚀 Función Lambda '$FUNCTION_NAME' no encontrada. Creándola..."
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime $RUNTIME \
        --role $ROLE_ARN \
        --handler $HANDLER \
        --zip-file fileb://lambda-deployment.zip \
        --environment "Variables={USER_POOL_ID=$USER_POOL_ID}" \
        --region $REGION \
        --profile $PROFILE
    echo "✅ Función Lambda '$FUNCTION_NAME' creada exitosamente."
else
    echo "🚀 Función Lambda '$FUNCTION_NAME' encontrada. Actualizando código y configuración..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://lambda-deployment.zip \
        --region $REGION \
        --profile $PROFILE
    
    aws lambda update-function-configuration \
        --function-name $FUNCTION_NAME \
        --environment "Variables={USER_POOL_ID=$USER_POOL_ID}" \
        --profile $PROFILE \
        --region $REGION
    echo "✅ Función Lambda '$FUNCTION_NAME' actualizada exitosamente con USER_POOL_ID."
fi

# Clean up
rm lambda-deployment.zip

echo "🎉 ¡Despliegue de $FUNCTION_NAME completado!"
