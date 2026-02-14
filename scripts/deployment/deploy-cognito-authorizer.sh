#!/bin/bash

# Deploy Cognito Authorizer Lambda
set -e

FUNCTION_NAME="cognito-authorizer"
REGION="us-east-1"
RUNTIME="nodejs20.x"
HANDLER="cognito-authorizer.handler"
ROLE_ARN="arn:aws:iam::864981725738:role/credly-lambda-execution-role"

echo "🔐 Desplegando Lambda Authorizer..."

# Crear directorio temporal
TEMP_DIR=$(mktemp -d)
cd /home/siegfried_fs/Desktop/Tiburon/backend/lambdas

# Copiar archivos
cp cognito-authorizer.js $TEMP_DIR/
cp cognito-authorizer-package.json $TEMP_DIR/package.json

# Instalar dependencias
cd $TEMP_DIR
npm install --production

# Crear ZIP
zip -r function.zip .

# Verificar si la función existe
if aws lambda get-function --function-name $FUNCTION_NAME --region $REGION --profile admin 2>/dev/null; then
    echo "📦 Actualizando función existente..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://function.zip \
        --region $REGION \
        --profile admin
else
    echo "📦 Creando nueva función..."
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime $RUNTIME \
        --role $ROLE_ARN \
        --handler $HANDLER \
        --zip-file fileb://function.zip \
        --timeout 10 \
        --memory-size 256 \
        --region $REGION \
        --profile admin \
        --description "Cognito JWT Authorizer for Admin API"
fi

# Limpiar
rm -rf $TEMP_DIR

echo "✅ Lambda Authorizer desplegada!"
echo ""
echo "📋 Próximo paso:"
echo "Agregar authorizer a API Gateway (API ID: fklo6233x5)"
