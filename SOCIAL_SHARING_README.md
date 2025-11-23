# 🦈 Sistema de Compartir en Redes Sociales - Tiburón

## 🚀 Configuración Automática (Recomendada)

Ejecuta el script desde la raíz del proyecto:

```bash
./setup-social-sharing.sh
```

Este script:
- Crea un bucket S3 para tu feed.json
- Configura roles IAM con permisos apropiados
- Despliega la función Lambda
- Crea endpoints de API Gateway
- Actualiza tu app.js con las URLs correctas
- Te proporciona todas las URLs finales

## 🧪 Pruebas

Después de la configuración, prueba el sistema:

```bash
./test-social-sharing.sh
```

Luego prueba manualmente en:
- [Facebook Debugger](https://developers.facebook.com/tools/debug/)
- [LinkedIn Inspector](https://www.linkedin.com/post-inspector/)

## 📝 Actualizar Contenido

Para actualizar el feed después de la configuración inicial:

```bash
./update-feed.sh
```

## 🔧 Scripts Disponibles

- `./setup-social-sharing.sh` - Configuración inicial completa
- `./test-social-sharing.sh` - Pruebas del sistema
- `./update-feed.sh` - Actualizar contenido del feed
- `./deploy-lambda.sh` - Redesplegar solo la función Lambda

## 📋 Configuración Manual

Si prefieres configurar manualmente, consulta `SETUP_MANUAL.md`

¡Listo para compartir con vistas previas profesionales! 🎉
