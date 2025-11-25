# 🦈 Configuración Manual del Sistema de Compartir en Redes Sociales

Esta guía te llevará paso a paso para configurar el sistema de vistas previas dinámicas para redes sociales.

## 📋 Prerrequisitos

- AWS CLI configurado con permisos de administrador
- Cuenta de AWS activa
- Node.js 20.x o superior (para desarrollo local)

## 🚀 Opción 1: Configuración Automática (Recomendada)

Ejecuta el script automatizado desde la raíz del proyecto:

```bash
./setup-social-sharing.sh
```

Este script configurará todo automáticamente y te dará las URLs finales.

## ⚙️ Opción 2: Configuración Manual

### Paso 1: Crear Bucket S3

1. Ve a la consola de AWS S3
2. Crea un nuevo bucket con un nombre único (ej: `tiburon-community-data-123456`)
3. Desactiva "Block all public access"
4. Crea una carpeta `data` dentro del bucket
5. Sube el archivo `public/assets/data/feed.json` a la carpeta `data`
6. Haz el archivo público: Selecciona el archivo → Actions → Make public using ACL

### Paso 2: Crear Rol IAM

1. Ve a IAM → Roles → Create role
2. Selecciona "AWS service" → "Lambda"
3. Añade estas políticas:
   - `AWSLambdaBasicExecutionRole`
   - `AmazonS3ReadOnlyAccess`
4. Nombra el rol: `LambdaSocialShareRole`

### Paso 3: Actualizar Función Lambda

1. Edita `og-renderer-lambda.js`:
   ```javascript
   const S3_BUCKET_NAME = 'tu-bucket-name-aqui';
   ```

2. Crea el paquete de despliegue:
   ```bash
   zip lambda-function.zip og-renderer-lambda.js package.json
   ```

### Paso 4: Crear Función Lambda

1. Ve a AWS Lambda → Create function
2. Configuración:
   - Name: `og-renderer-lambda`
   - Runtime: `Node.js 20.x`
   - Role: `LambdaSocialShareRole`
3. Sube el archivo `lambda-function.zip`

### Paso 5: Crear API Gateway

1. Ve a API Gateway → Create API → HTTP API
2. Configuración:
   - Name: `tiburon-social-share-api`
   - Add integration: Lambda → `og-renderer-lambda`
3. Configure routes:
   - Method: `GET`
   - Resource path: `/share`
   - Integration: Tu función Lambda
4. Deploy API

### Paso 6: Configurar Permisos

Ejecuta este comando (reemplaza los valores):
```bash
aws lambda add-permission \
    --function-name og-renderer-lambda \
    --statement-id apigateway-invoke \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:REGION:ACCOUNT:API_ID/*/*"
```

### Paso 7: Actualizar app.js

1. Reemplaza en `public/assets/js/app.js`:
   ```javascript
   // Línea ~748
   const feedUrl = 'https://tu-bucket.s3.amazonaws.com/data/feed.json';
   
   // Línea ~768
   const shareUrl = `https://tu-api-id.execute-api.region.amazonaws.com/share?postId=${post.id}`;
   ```

## 🧪 Pruebas

1. **Probar la función Lambda:**
   ```bash
   curl "https://tu-api-gateway-url/share?postId=post001"
   ```

2. **Probar en redes sociales:**
   - Ve a [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - Ingresa tu URL de compartir
   - Verifica que aparezcan título, descripción e imagen

## 📝 Actualizar Contenido

Para actualizar el feed:
```bash
aws s3 cp public/assets/data/feed.json s3://tu-bucket/data/feed.json
```

## 🔧 Solución de Problemas

### Error: "redirect_mismatch"
- Verifica que la URL de callback esté configurada en Cognito

### Error: "Access Denied" en S3
- Verifica que el archivo sea público
- Verifica los permisos del rol IAM

### Error: "Function not found"
- Verifica que la función Lambda esté en la misma región que API Gateway
- Verifica los permisos de invocación

### Las vistas previas no aparecen
- Usa el Facebook Debugger para verificar las meta tags
- Verifica que la imagen sea accesible públicamente
- Asegúrate de que la URL de la imagen sea HTTPS

## 📊 Monitoreo

- **CloudWatch Logs:** Ve a CloudWatch → Log groups → `/aws/lambda/og-renderer-lambda`
- **API Gateway Metrics:** Ve a API Gateway → tu API → Monitoring
- **S3 Access Logs:** Configura logging en tu bucket S3 si necesitas métricas detalladas

## 🎯 URLs Importantes

Después de la configuración, tendrás estas URLs:

- **S3 Feed:** `https://tu-bucket.s3.amazonaws.com/data/feed.json`
- **API Gateway:** `https://api-id.execute-api.region.amazonaws.com`
- **Compartir:** `https://api-id.execute-api.region.amazonaws.com/share?postId=POST_ID`

¡Listo! Tu sistema de compartir en redes sociales está configurado y funcionando.
