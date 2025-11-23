#!/bin/bash

# Script to update the feed.json in S3 (improved version)
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get bucket name from Lambda function
BUCKET_NAME=$(grep -o "S3_BUCKET_NAME = '[^']*'" og-renderer-lambda.js | cut -d"'" -f2)

if [ -z "$BUCKET_NAME" ] || [ "$BUCKET_NAME" = "TU_BUCKET_DE_S3_AQUI" ]; then
    echo -e "${RED}❌ No se encontró el nombre del bucket en og-renderer-lambda.js${NC}"
    echo "Asegúrate de haber ejecutado el setup primero."
    exit 1
fi

echo -e "${YELLOW}📤 Actualizando feed.json en S3...${NC}"
echo -e "${YELLOW}📦 Bucket: $BUCKET_NAME${NC}"

# Check if local feed.json exists
if [ ! -f "public/assets/data/feed.json" ]; then
    echo -e "${RED}❌ No se encontró public/assets/data/feed.json${NC}"
    exit 1
fi

# Upload to S3
aws s3 cp public/assets/data/feed.json s3://$BUCKET_NAME/data/feed.json

echo -e "${GREEN}✅ Feed actualizado exitosamente${NC}"

# Show the public URL
S3_URL="https://$BUCKET_NAME.s3.amazonaws.com/data/feed.json"
echo -e "${GREEN}🌐 URL pública: $S3_URL${NC}"

# Test the update
echo -e "${YELLOW}🧪 Probando la actualización...${NC}"
RESPONSE=$(curl -s "$S3_URL" | head -5)
if [ -n "$RESPONSE" ]; then
    echo -e "${GREEN}✅ Feed accesible y actualizado${NC}"
else
    echo -e "${RED}❌ Error accediendo al feed actualizado${NC}"
fi

echo -e "${GREEN}🎉 ¡Actualización completada!${NC}"
echo ""
echo -e "${YELLOW}📋 Próximos pasos:${NC}"
echo "1. Ve al Facebook Debugger: https://developers.facebook.com/tools/debug/"
echo "2. Pega una URL de compartir (ej: https://8x3c0bghcb.execute-api.us-east-1.amazonaws.com/share?postId=post001)"
echo "3. Haz clic en 'Scrape Again' para actualizar la vista previa"
