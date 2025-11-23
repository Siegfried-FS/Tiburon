#!/bin/bash

# Test script for social media sharing system
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🧪 Probando el sistema de compartir en redes sociales...${NC}"

# Get API Gateway URL from app.js
API_URL=$(grep -o 'https://[^/]*\.execute-api\.[^/]*\.amazonaws\.com' public/assets/js/app.js | head -1)

if [ -z "$API_URL" ]; then
    echo -e "${RED}❌ No se encontró la URL del API Gateway en app.js${NC}"
    echo "Asegúrate de haber ejecutado el setup primero."
    exit 1
fi

echo -e "${YELLOW}📡 URL del API Gateway: $API_URL${NC}"

# Test 1: Test with valid post ID
echo -e "${YELLOW}🔍 Prueba 1: Post válido (post001)${NC}"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$API_URL/share?postId=post001")
HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
BODY=$(echo $RESPONSE | sed -e 's/HTTPSTATUS:.*//g')

if [ $HTTP_STATUS -eq 200 ]; then
    echo -e "${GREEN}✅ Respuesta HTTP 200 OK${NC}"
    
    # Check for Open Graph tags
    if echo "$BODY" | grep -q "og:title"; then
        echo -e "${GREEN}✅ Meta tag og:title encontrada${NC}"
    else
        echo -e "${RED}❌ Meta tag og:title NO encontrada${NC}"
    fi
    
    if echo "$BODY" | grep -q "og:description"; then
        echo -e "${GREEN}✅ Meta tag og:description encontrada${NC}"
    else
        echo -e "${RED}❌ Meta tag og:description NO encontrada${NC}"
    fi
    
    if echo "$BODY" | grep -q "og:image"; then
        echo -e "${GREEN}✅ Meta tag og:image encontrada${NC}"
    else
        echo -e "${RED}❌ Meta tag og:image NO encontrada${NC}"
    fi
else
    echo -e "${RED}❌ Error HTTP $HTTP_STATUS${NC}"
    echo "Respuesta: $BODY"
fi

echo ""

# Test 2: Test with invalid post ID
echo -e "${YELLOW}🔍 Prueba 2: Post inválido (post999)${NC}"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$API_URL/share?postId=post999")
HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ $HTTP_STATUS -eq 200 ]; then
    echo -e "${GREEN}✅ Respuesta HTTP 200 OK (fallback)${NC}"
    
    # Should contain fallback title
    if echo "$RESPONSE" | grep -q "AWS User Group Playa Vicente"; then
        echo -e "${GREEN}✅ Título de fallback encontrado${NC}"
    else
        echo -e "${RED}❌ Título de fallback NO encontrado${NC}"
    fi
else
    echo -e "${RED}❌ Error HTTP $HTTP_STATUS${NC}"
fi

echo ""

# Test 3: Test without post ID
echo -e "${YELLOW}🔍 Prueba 3: Sin postId${NC}"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$API_URL/share")
HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ $HTTP_STATUS -eq 200 ]; then
    echo -e "${GREEN}✅ Respuesta HTTP 200 OK (fallback)${NC}"
else
    echo -e "${RED}❌ Error HTTP $HTTP_STATUS${NC}"
fi

echo ""

# Test 4: Check S3 feed accessibility
echo -e "${YELLOW}🔍 Prueba 4: Accesibilidad del feed en S3${NC}"
S3_URL=$(grep -o 'https://[^"]*\.s3\.amazonaws\.com/data/feed\.json' public/assets/js/app.js | head -1)

if [ -n "$S3_URL" ]; then
    echo -e "${YELLOW}📡 URL del feed S3: $S3_URL${NC}"
    
    RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$S3_URL")
    HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    
    if [ $HTTP_STATUS -eq 200 ]; then
        echo -e "${GREEN}✅ Feed S3 accesible${NC}"
        
        # Check if it's valid JSON
        if echo "$RESPONSE" | jq . > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Feed es JSON válido${NC}"
            
            # Count posts
            POST_COUNT=$(echo "$RESPONSE" | jq length 2>/dev/null || echo "0")
            echo -e "${GREEN}✅ Posts encontrados: $POST_COUNT${NC}"
        else
            echo -e "${RED}❌ Feed NO es JSON válido${NC}"
        fi
    else
        echo -e "${RED}❌ Error accediendo al feed S3: HTTP $HTTP_STATUS${NC}"
    fi
else
    echo -e "${RED}❌ URL del feed S3 no encontrada en app.js${NC}"
fi

echo ""
echo -e "${YELLOW}🎯 Pruebas de redes sociales:${NC}"
echo "1. Facebook Debugger: https://developers.facebook.com/tools/debug/"
echo "2. LinkedIn Inspector: https://www.linkedin.com/post-inspector/"
echo "3. URL de prueba: $API_URL/share?postId=post001"

echo ""
echo -e "${GREEN}🎉 Pruebas completadas${NC}"
