#!/bin/bash

echo "🚀 Desplegando admin-posts-manager Lambda..."

# Crear directorio temporal
TEMP_DIR="/tmp/admin-posts-manager"
mkdir -p $TEMP_DIR

# Copiar código
cp backend/lambdas/admin-posts-manager.js $TEMP_DIR/

# Crear package.json
cat > $TEMP_DIR/package.json << 'EOF'
{
  "name": "admin-posts-manager",
  "version": "1.0.0",
  "main": "admin-posts-manager.js",
  "dependencies": {
    "aws-sdk": "^2.1691.0"
  }
}
EOF

# Crear ZIP
cd $TEMP_DIR
zip -r admin-posts-manager.zip .

# Verificar si la función existe
FUNCTION_EXISTS=$(aws lambda get-function --function-name admin-posts-manager --profile admin --region us-east-1 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "📝 Actualizando función existente..."
    aws lambda update-function-code \
        --function-name admin-posts-manager \
        --zip-file fileb://admin-posts-manager.zip \
        --profile admin \
        --region us-east-1
else
    echo "🆕 Creando nueva función..."
    aws lambda create-function \
        --function-name admin-posts-manager \
        --runtime nodejs24.x \
        --role arn:aws:iam::864981725738:role/LambdaAdminPostsRole \
        --handler admin-posts-manager.handler \
        --zip-file fileb://admin-posts-manager.zip \
        --timeout 30 \
        --memory-size 256 \
        --profile admin \
        --region us-east-1
fi

# Limpiar
rm -rf $TEMP_DIR

echo "✅ admin-posts-manager desplegada correctamente"
