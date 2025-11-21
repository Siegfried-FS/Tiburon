# 🦈 Proyecto Tiburón - Sitio Web del AWS User Group Playa Vicente

Este es el repositorio oficial del sitio web para el **AWS User Group de Playa Vicente**, una comunidad de tecnología en Veracruz, México, liderada por **Roberto Flores (Siegfried FS)**.

El objetivo de este proyecto es crear una plataforma digital que no solo sirva como un centro de información, sino que también inspire y conecte a los entusiastas de la nube en la región.

**Ver el sitio en vivo:** [tiburoncp.siegfried-fs.com](https://tiburoncp.siegfried-fs.com/)

---

## ✨ Características Principales

- **👤 Sistema de Usuarios Completo:**
    - Autenticación segura a través de **AWS Cognito** con proveedores federados (Google).
    - Edición de perfiles de usuario para personalizar la experiencia.
- **🎨 Tema Claro y Oscuro:** Cambia entre modos para tu comodidad visual.
- **📱 Diseño Responsivo:** Totalmente funcional en dispositivos móviles, tablets y computadoras de escritorio.
- **⚙️ Contenido 100% Dinámico:** Todas las secciones principales (Eventos, Talleres, Recursos, Glosario) se cargan desde archivos JSON, facilitando su actualización sin tocar el código HTML.
- **🚀 Experiencia de Usuario Mejorada:**
    - **Pantallas de Carga (Skeletons):** Interfaces de carga modernas que mejoran la percepción de velocidad.
    - **Botón "Volver Arriba":** Navegación fluida en páginas con mucho contenido.
- **📚 Glosario Interactivo:** Un completo glosario de términos de AWS con búsqueda en tiempo real y filtro alfabético.
- **🗂️ Navegación y Filtrado Avanzado:**
    - **Filtro por Etiquetas:** Filtra dinámicamente los Recursos, Talleres y Juegos de Lógica por sus `tags`.
- **📅 Gestión de Eventos Inteligente:**
    - **Indicadores Visuales:** Distingue claramente eventos próximos vs realizados.
    - **Indicadores de Precio:** Identifica eventos gratuitos vs de pago.
- **⚡ Optimizado para el Rendimiento:** Carga diferida de imágenes (`loading="lazy"`) y código modular para una entrega rápida.
- **🔍 SEO Mejorado:** Optimizado para ser encontrado en búsquedas relacionadas con "Roberto Flores" y "Playa Vicente".

---

## 🚀 Tecnologías Utilizadas

- **HTML5**
- **CSS3** (con variables para temas y diseño responsivo)
- **JavaScript (Vanilla)** para la interactividad y carga de contenido dinámico.
- **AWS Cognito** para la autenticación y gestión de usuarios.
- **Particles.js** para los efectos de fondo.
- **Alojado en AWS Amplify** para un despliegue continuo y escalable.

---

## 🔧 Configuración del Entorno de Desarrollo Local

Para probar el sitio en tu máquina local, especialmente las funciones de inicio de sesión, sigue estos pasos.

### Prerrequisitos
- Tener **Python 3** instalado para ejecutar el servidor local.
- Tener acceso a la **Consola de AWS** para configurar Cognito.

### Paso 1: Configuración de AWS Cognito (¡Crítico!)

Para que el inicio de sesión funcione en tu entorno local, debes autorizar a tu servidor a comunicarse con Cognito.

1.  Ve a tu User Pool en **AWS Cognito**.
2.  Navega a la pestaña **"App integration"** (Integración de aplicaciones).
3.  Selecciona tu cliente de aplicación (`tiburon-web-client`).
4.  Busca la sección **"Hosted UI"** (o "Páginas de inicio de sesión") y haz clic en **"Edit"**.
5.  En el campo **"Allowed callback URLs"** (URL de devolución de llamada permitidas), añade la siguiente URL:
    ```
    http://localhost:8000
    ```
6.  Guarda los cambios. Sin este paso, obtendrás un error de `redirect_mismatch` al intentar iniciar sesión.

### Paso 2: Iniciar el Servidor Local

El siguiente comando unificado limpia el puerto 8000, navega a la carpeta `public` y levanta el servidor local de la manera correcta para que sea reconocido por Cognito.

Copia y pega el bloque completo en tu terminal, desde la raíz del proyecto (`Tiburon/`):

```bash
# Limpia el puerto 8000 por si está en uso
kill -9 $(lsof -t -i:8000) 2>/dev/null || true

# Navega al directorio public y levanta el servidor en localhost
cd public && python3 -m http.server 8000 --bind localhost
```

### Paso 3: Acceder a la Aplicación

Una vez que el servidor esté corriendo, abre tu navegador y escribe **manualmente** en la barra de direcciones:
`http://localhost:8000`

---

## 🔄 Cómo Actualizar el Contenido

Para facilitar la actualización, todo el contenido dinámico se gestiona desde archivos `JSON` ubicados en `public/assets/data/`. Simplemente edita el archivo correspondiente y los cambios se reflejarán en el sitio.

- **Eventos:** `events.json`
- **Glosario:** `glosario.json`
- **Recursos:** `resources.json`
- **Juegos de Lógica:** `logic-games.json`
- **Talleres:** `workshops.json`

---

## ☁️ Despliegue

Este proyecto está configurado para un despliegue continuo a través de **AWS Amplify**. El archivo `amplify.yml` contiene la configuración del build. Cualquier `git push` a la rama `main` disparará automáticamente un nuevo despliegue del sitio.