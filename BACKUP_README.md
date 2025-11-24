# 🔄 BACKUP Y REVERSIÓN - Proyecto Tiburón

## 📋 RECURSOS AWS CREADOS

### 🗄️ **S3 Buckets:**
```bash
# Bucket creado para contenido
tiburon-content-bucket

# Para eliminar:
aws s3 rm s3://tiburon-content-bucket --recursive --profile admin
aws s3 rb s3://tiburon-content-bucket --profile admin
```

### ⚡ **Lambda Functions:**
```bash
# Funciones Lambda creadas:
admin-posts-lambda
save-content-lambda (si se desplegó)

# Para eliminar:
aws lambda delete-function --function-name admin-posts-lambda --profile admin
aws lambda delete-function --function-name save-content-lambda --profile admin
```

### 🌐 **API Gateway:**
```bash
# API Gateway creado:
API ID: fklo6233x5
Nombre: admin-posts-api

# Para eliminar:
aws apigatewayv2 delete-api --api-id fklo6233x5 --profile admin
```

### 🗃️ **DynamoDB Tables:**
```bash
# Tablas DynamoDB (si se crearon):
admin-posts-table

# Para eliminar:
aws dynamodb delete-table --table-name admin-posts-table --profile admin
```

### 🔐 **IAM Roles:**
```bash
# Roles IAM creados:
LambdaAdminPostsRole

# Para eliminar:
aws iam detach-role-policy --role-name LambdaAdminPostsRole --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole --profile admin
aws iam detach-role-policy --role-name LambdaAdminPostsRole --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess --profile admin
aws iam detach-role-policy --role-name LambdaAdminPostsRole --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess --profile admin
aws iam delete-role --role-name LambdaAdminPostsRole --profile admin
```

## 🔄 SCRIPT DE LIMPIEZA COMPLETA

```bash
#!/bin/bash
# cleanup-aws-resources.sh

echo "🧹 Limpiando recursos AWS del Proyecto Tiburón..."

# Eliminar S3 Bucket
echo "📦 Eliminando bucket S3..."
aws s3 rm s3://tiburon-content-bucket --recursive --profile admin 2>/dev/null
aws s3 rb s3://tiburon-content-bucket --profile admin 2>/dev/null

# Eliminar Lambda Functions
echo "⚡ Eliminando funciones Lambda..."
aws lambda delete-function --function-name admin-posts-lambda --profile admin 2>/dev/null
aws lambda delete-function --function-name save-content-lambda --profile admin 2>/dev/null

# Eliminar API Gateway
echo "🌐 Eliminando API Gateway..."
aws apigatewayv2 delete-api --api-id fklo6233x5 --profile admin 2>/dev/null

# Eliminar DynamoDB Tables
echo "🗃️ Eliminando tablas DynamoDB..."
aws dynamodb delete-table --table-name admin-posts-table --profile admin 2>/dev/null

# Eliminar IAM Role
echo "🔐 Eliminando roles IAM..."
aws iam detach-role-policy --role-name LambdaAdminPostsRole --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole --profile admin 2>/dev/null
aws iam detach-role-policy --role-name LambdaAdminPostsRole --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess --profile admin 2>/dev/null
aws iam detach-role-policy --role-name LambdaAdminPostsRole --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess --profile admin 2>/dev/null
aws iam delete-role --role-name LambdaAdminPostsRole --profile admin 2>/dev/null

echo "✅ Limpieza completada. Verifica en la consola AWS que todo se eliminó correctamente."
```

## 📝 CAMBIOS REALIZADOS EN EL CÓDIGO

### 🆕 **Archivos Nuevos Creados:**
- `save-content-lambda.js` - Lambda para guardar contenido en S3
- `admin-posts-lambda.js` - Lambda para gestión de posts
- `save-content-package.json` - Dependencias para Lambda
- `public/assets/css/auth.css` - Estilos para autenticación
- `public/favicon.svg` - Favicon del sitio
- `public/favicon.ico` - Favicon alternativo
- `public/.well-known/security.txt` - Política de seguridad
- `public/.htaccess` - Configuraciones Apache
- `public/assets/js/console-security.js` - Mensaje de consola

### 🔄 **Archivos Modificados:**
- `public/assets/js/admin.js` - Panel admin completo
- `public/assets/js/auth.js` - Autenticación mejorada
- `public/assets/css/admin.css` - Estilos del panel admin
- `public/admin.html` - HTML del panel admin
- `public/auth.html` - Página de autenticación
- `README.md` - Documentación actualizada

## 🔙 CÓMO REVERTIR CAMBIOS

### 1. **Revertir a commit anterior:**
```bash
# Ver historial de commits
git log --oneline

# Revertir a commit específico (reemplaza HASH)
git reset --hard HASH_DEL_COMMIT_ANTERIOR
```

### 2. **Eliminar archivos nuevos:**
```bash
# Eliminar archivos Lambda
rm save-content-lambda.js
rm admin-posts-lambda.js
rm save-content-package.json
rm save-content-lambda.zip
rm admin-posts-lambda-v2.zip

# Eliminar archivos de seguridad
rm public/.htaccess
rm public/.well-known/security.txt
rm public/assets/js/console-security.js

# Eliminar favicons
rm public/favicon.svg
rm public/favicon.ico

# Eliminar CSS auth
rm public/assets/css/auth.css
```

### 3. **Restaurar archivos originales:**
```bash
# Si tienes backup de archivos originales
git checkout HEAD~10 -- public/assets/js/admin.js
git checkout HEAD~10 -- public/assets/js/auth.js
git checkout HEAD~10 -- public/admin.html
git checkout HEAD~10 -- public/auth.html
```

## ⚠️ IMPORTANTE

- **Ejecuta el script de limpieza** antes de eliminar el repositorio
- **Verifica en la consola AWS** que todos los recursos se eliminaron
- **Los recursos AWS pueden generar costos** si no se eliminan correctamente
- **Guarda este README** antes de hacer cambios drásticos

## 💰 COSTOS ESTIMADOS

Si no eliminas los recursos:
- **S3:** ~$0.01/mes (casi gratis)
- **Lambda:** Gratis hasta 1M invocaciones
- **API Gateway:** Gratis hasta 1M requests
- **DynamoDB:** Gratis hasta 25GB

**Total estimado:** $0.00 - $0.05/mes (dentro de capa gratuita)

## 🆘 EN CASO DE EMERGENCIA

```bash
# Ejecutar limpieza rápida
chmod +x cleanup-aws-resources.sh
./cleanup-aws-resources.sh

# Revertir código
git reset --hard HEAD~20
git clean -fd
```
