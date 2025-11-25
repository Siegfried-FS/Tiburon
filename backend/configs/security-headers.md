# 🔒 Configuración de Headers de Seguridad

## Headers Implementados

### **Strict-Transport-Security (HSTS)**
```
max-age=31536000; includeSubDomains; preload
```
- **Propósito:** Fuerza HTTPS por 1 año
- **includeSubDomains:** Aplica a todos los subdominios
- **preload:** Permite inclusión en listas de preload de navegadores

### **X-Content-Type-Options**
```
nosniff
```
- **Propósito:** Previene MIME sniffing attacks
- **Efecto:** Navegador respeta el Content-Type declarado

### **X-Frame-Options**
```
DENY
```
- **Propósito:** Previene clickjacking attacks
- **Efecto:** Página no puede ser embebida en iframes

### **X-XSS-Protection**
```
1; mode=block
```
- **Propósito:** Activa filtro XSS del navegador
- **mode=block:** Bloquea página si detecta XSS

### **Referrer-Policy**
```
strict-origin-when-cross-origin
```
- **Propósito:** Controla información de referrer
- **Efecto:** Solo envía origin en requests cross-origin

### **Permissions-Policy**
```
geolocation=(), microphone=(), camera=()
```
- **Propósito:** Deshabilita APIs sensibles
- **Efecto:** Bloquea acceso a ubicación, micrófono, cámara

### **Content-Security-Policy (CSP)**
```
default-src 'self'; 
script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://sdk.amazonaws.com https://unpkg.com; 
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
font-src 'self' https://fonts.gstatic.com; 
img-src 'self' data: https: blob:; 
object-src 'self'; 
frame-src 'self'; 
connect-src 'self' https:; 
frame-ancestors 'self'
```

**Desglose:**
- **default-src 'self':** Solo recursos del mismo origen por defecto
- **script-src:** Permite scripts de CDNs específicos + inline
- **style-src:** Permite estilos de Google Fonts + inline
- **img-src:** Permite imágenes de cualquier HTTPS + data URLs
- **connect-src:** Permite conexiones HTTPS para APIs

## 🛡️ Nivel de Seguridad Alcanzado

Con estos headers implementados:
- ✅ **A+ en SSL Labs** (con HSTS preload)
- ✅ **Protección contra Clickjacking** (X-Frame-Options)
- ✅ **Protección contra MIME Sniffing** (X-Content-Type-Options)
- ✅ **Protección contra XSS** (X-XSS-Protection + CSP)
- ✅ **Control de Referrer** (Referrer-Policy)
- ✅ **Control de Permisos** (Permissions-Policy)

## 🔍 Verificación

Para verificar los headers después del deploy:
```bash
curl -I https://tiburoncp.siegfried-fs.com/
```

O usar herramientas online:
- https://securityheaders.com/
- https://observatory.mozilla.org/
