#!/bin/bash

# Script to fix CORS configuration for existing S3 bucket
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Configurando CORS para el bucket S3...${NC}"

# Get bucket name from Lambda function
BUCKET_NAME=$(grep -o "S3_BUCKET_NAME = '[^']*'" og-renderer-lambda.js | cut -d"'" -f2)

if [ -z "$BUCKET_NAME" ] || [ "$BUCKET_NAME" = "TU_BUCKET_DE_S3_AQUI" ]; then
    echo -e "${YELLOW}⚠️ No se encontró el nombre del bucket. Usando el bucket actual...${NC}"
    BUCKET_NAME="tiburon-community-data-1763931777"
fi

echo -e "${YELLOW}📦 Bucket: $BUCKET_NAME${NC}"

# Create CORS configuration
cat > cors-config.json << EOF
{
    "CORSRules": [
        {
            "AllowedHeaders": [
                "*"
            ],
            "AllowedMethods": [
                "GET"
            ],
            "AllowedOrigins": [
                "http://localhost:8000",
                "http://localhost:8080",
                "https://tiburoncp.siegfried-fs.com"
            ],
            "ExposeHeaders": []
        }
    ]
}
EOF

# Apply CORS configuration
echo -e "${YELLOW}🌐 Aplicando configuración CORS...${NC}"
aws s3api put-bucket-cors --bucket $BUCKET_NAME --cors-configuration file://cors-config.json

# Verify CORS configuration
echo -e "${YELLOW}✅ Verificando configuración CORS...${NC}"
aws s3api get-bucket-cors --bucket $BUCKET_NAME

# Clean up
rm cors-config.json

echo -e "${GREEN}🎉 ¡CORS configurado correctamente!${NC}"
echo ""
echo -e "${YELLOW}📋 Ahora puedes:${NC}"
echo "1. Refrescar tu página http://localhost:8000/feed.html"
echo "2. Hacer un hard refresh con Ctrl+Shift+R (o Cmd+Shift+R en Mac)"
echo "3. El feed debería cargar sin problemas de CORS"
