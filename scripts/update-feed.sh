#!/bin/bash

# Script to update the feed.json in S3
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

# Validate JSON
if ! jq . public/assets/data/feed.json > /dev/null 2>&1; then
    echo -e "${RED}❌ El archivo feed.json no es JSON válido${NC}"
    exit 1
fi

# Upload to S3
aws s3 cp public/assets/data/feed.json s3://$BUCKET_NAME/data/feed.json

# Make it public
aws s3api put-object-acl --bucket $BUCKET_NAME --key data/feed.json --acl public-read

echo -e "${GREEN}✅ Feed actualizado exitosamente${NC}"

# Show the public URL
S3_URL="https://$BUCKET_NAME.s3.amazonaws.com/data/feed.json"
echo -e "${GREEN}🌐 URL pública: $S3_URL${NC}"

# Test the update
echo -e "${YELLOW}🧪 Probando la actualización...${NC}"
RESPONSE=$(curl -s "$S3_URL")
if echo "$RESPONSE" | jq . > /dev/null 2>&1; then
    POST_COUNT=$(echo "$RESPONSE" | jq length)
    echo -e "${GREEN}✅ Feed accesible con $POST_COUNT posts${NC}"
else
    echo -e "${RED}❌ Error accediendo al feed actualizado${NC}"
fi

echo -e "${GREEN}🎉 ¡Actualización completada!${NC}"
