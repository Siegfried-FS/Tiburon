#!/bin/bash

# Script para desplegar admin-posts-manager con AWS SDK v3
echo "🚀 Desplegando admin-posts-manager..."

# Cambiar al directorio de lambdas
cd "$(dirname "$0")/../../backend/lambdas"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Crear archivo ZIP
echo "📁 Creando archivo ZIP..."
zip -r admin-posts-manager.zip admin-posts-manager.js package.json node_modules/

# Desplegar función Lambda
echo "☁️ Desplegando a AWS Lambda..."
aws lambda update-function-code \
    --function-name admin-posts-manager \
    --zip-file fileb://admin-posts-manager.zip \
    --profile admin \
    --region us-east-1

# Limpiar archivos temporales
echo "🧹 Limpiando archivos temporales..."
rm admin-posts-manager.zip
rm -rf node_modules/
rm package-lock.json

echo "✅ Despliegue completado!"
