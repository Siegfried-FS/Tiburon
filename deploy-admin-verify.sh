#!/bin/bash

echo "📦 Empaquetando Lambda de verificación admin..."

# Crear directorio temporal
mkdir -p temp-admin-verify
cp admin-verify-lambda.js temp-admin-verify/
cp admin-verify-package.json temp-admin-verify/package.json

# Instalar dependencias
cd temp-admin-verify
npm install --production

# Crear ZIP
zip -r ../admin-verify-lambda.zip .

# Limpiar
cd ..
rm -rf temp-admin-verify

echo "🚀 Desplegando Lambda de verificación admin..."

# Crear o actualizar función Lambda
aws lambda create-function \
    --function-name admin-verify-lambda \
    --runtime nodejs20.x \
    --role arn:aws:iam::864981725738:role/LambdaAdminVerifyRole \
    --handler admin-verify-lambda.handler \
    --zip-file fileb://admin-verify-lambda.zip \
    --timeout 10 \
    --memory-size 128 \
    --profile admin 2>/dev/null || \
aws lambda update-function-code \
    --function-name admin-verify-lambda \
    --zip-file fileb://admin-verify-lambda.zip \
    --profile admin

echo "🔗 Configurando API Gateway..."

# Crear API Gateway para la función
aws apigatewayv2 create-api \
    --name admin-verify-api \
    --protocol-type HTTP \
    --cors-configuration AllowOrigins="https://tiburoncp.siegfried-fs.com",AllowMethods="POST,OPTIONS",AllowHeaders="Content-Type,Authorization" \
    --profile admin 2>/dev/null || echo "API ya existe"

echo "✅ Despliegue completado"
echo "🎯 Endpoint: https://api.tiburoncp.siegfried-fs.com/verify-admin"

# Limpiar archivo ZIP
rm admin-verify-lambda.zip
