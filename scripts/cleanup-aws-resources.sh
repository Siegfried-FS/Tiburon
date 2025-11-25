#!/bin/bash
# cleanup-aws-resources.sh - Limpia todos los recursos AWS del Proyecto Tiburón

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
echo "💡 Revisa https://console.aws.amazon.com para confirmar que no quedan recursos."
