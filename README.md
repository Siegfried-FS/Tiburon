# 🦈 Proyecto Tiburón - Sitio Web de la Comunidad AWS Playa Vicente

¡Bienvenidos a la plataforma oficial del AWS User Group de Playa Vicente! Este es un espacio abierto para aprender, compartir y construir comunidad alrededor de Amazon Web Services en español, liderado por **Roberto Flores (Siegfried FS)**.

El sitio está diseñado para ser un centro de recursos dinámico, fácil de mantener y optimizado para el rendimiento y la experiencia de usuario.

## ✨ Características Principales

- **🎨 Tema Claro y Oscuro:** Cambia entre modos para tu comodidad visual.
- **📱 Diseño Responsivo:** Totalmente funcional en dispositivos móviles, tablets y computadoras de escritorio.
- **⚙️ Contenido 100% Dinámico:** Todas las secciones principales (Eventos, Talleres, Recursos, Glosario) se cargan desde archivos JSON, facilitando su actualización sin tocar el código HTML.
- **🚀 Experiencia de Usuario Mejorada:**
    - **Pantallas de Carga (Skeletons):** Interfaces de carga modernas que mejoran la percepción de velocidad.
    - **Botón "Volver Arriba":** Navegación fluida en páginas con mucho contenido.
- **📚 Glosario Interactivo:** Un completo glosario de términos de AWS con búsqueda en tiempo real y filtro alfabético.
- **🗂️ Navegación y Filtrado Avanzado:**
    - **Pestañas en Recursos:** Organización de la "Caja de Herramientas" por categorías.
    - **Filtro por Etiquetas:** Filtra dinámicamente los Recursos, Talleres y Juegos de Lógica por sus `tags` para encontrar contenido específico rápidamente.
- **⚡ Optimizado para el Rendimiento:** Carga diferida de imágenes (`loading="lazy"`) y código modular para una entrega rápida y eficiente.
- **🔍 SEO Mejorado:** Optimizado para ser encontrado en búsquedas relacionadas con "Roberto Flores" y "Playa Vicente".

## 🚀 Tecnologías Utilizadas

- **HTML5**
- **CSS3** (con variables para temas y diseño responsivo)
- **JavaScript (Vanilla)** para la interactividad y carga de contenido dinámico.
- **Particles.js** para los efectos de fondo.
- **Alojado en AWS Amplify** para un despliegue continuo y escalable.

---

## 🏗️ Estructura del Proyecto

Todos los archivos públicos (HTML, assets, etc.) están centralizados en el directorio `public`. El contenido editable se encuentra en la carpeta `public/assets/data/`.

```
tiburon/
├── public/
│   ├── index.html
│   ├── guia.html
│   ├── glosario.html
│   ├── recursos.html
│   ├── talleres.html
│   ├── eventos.html
│   ├── logic-games.html
│   └── assets/
│       ├── css/          # Estilos consolidados en styles.css
│       ├── js/           # Lógica principal modular en app.js
│       ├── data/         # ¡AQUÍ SE EDITA EL CONTENIDO! (Archivos JSON)
│       └── images/       # Imágenes del sitio
├── amplify.yml       # Configuración de despliegue para AWS Amplify
├── README.md         # Este archivo
└── ... (otros archivos de configuración)
```

---

## 🔧 Cómo Probar en Local

Para que el sitio funcione correctamente (especialmente la carga de contenido desde los archivos JSON), necesitas ejecutarlo a través de un servidor web local.

1.  Abre una terminal y **navega a la carpeta `public`**:
    ```bash
    cd public
    ```
2.  Ejecuta un servidor web simple con Python:
    ```bash
    python3 -m http.server
    ```
3.  Abre tu navegador y visita la dirección: `http://localhost:8000`

---

## 🔄 Cómo Actualizar el Contenido

Para facilitar la actualización, todo el contenido dinámico se gestiona desde archivos `JSON` ubicados en `public/assets/data/`. Simplemente edita el archivo correspondiente y los cambios se reflejarán en el sitio.

*(Ejemplos de cómo añadir contenido a cada archivo JSON se omiten por brevedad, pero la estructura es autoexplicativa dentro de cada archivo.)*

---
## ☁️ Despliegue

Este proyecto está configurado para un despliegue continuo a través de **AWS Amplify**. El archivo `amplify.yml` contiene la configuración del build. Cualquier `git push` a la rama configurada (ej. `main`) disparará automáticamente un nuevo despliegue del sitio.

---
## 💡 Mejoras Futuras

- **Sistema de Cuentas de Usuario:** Implementar un sistema de autenticación para que los usuarios puedan tener perfiles y guardar su progreso (por ejemplo, en la Guía de Estudio). Esto permitiría una experiencia personalizada y persistente a través de diferentes dispositivos y navegadores.
- **Sección de Proyectos de la Comunidad:** Un espacio para que los miembros del User Group puedan mostrar sus propios proyectos.
- **Blog de Artículos Técnicos:** Una sección para tutoriales o artículos más detallados sobre temas de AWS.