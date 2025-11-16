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
- **📚 Glosario Interactivo:** Un completo glosario de términos de AWS con búsqueda en tiempo real y filtro alfabético, ideal para estudiar para la certificación Cloud Practitioner.
- **🗂️ Navegación por Pestañas:** La sección "Caja de Herramientas" utiliza pestañas para organizar los recursos por categoría de forma limpia e interactiva.
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

### Para Añadir un Término al Glosario:

1.  Abre `public/assets/data/glosario.json`.
2.  Añade un nuevo objeto al array.

    *Ejemplo:*
    ```json
    {
        "term": "Nombre del Término o Servicio",
        "definition": "Una explicación clara y concisa del término.",
        "category": "Categoría (ej. Cómputo, Seguridad, Facturación)"
    }
    ```

### Para Añadir un Taller al Historial:

1.  Abre `public/assets/data/workshops.json`.
2.  Añade un nuevo objeto al array. La fecha (`date`) debe tener el formato `YYYY-MM-DD`.

    *Ejemplo:*
    ```json
    {
        "title": "Mi Nuevo Taller",
        "date": "2025-12-31",
        "description": "Una descripción de lo que se vio en el taller.",
        "image": "https://... (URL a una imagen representativa)",
        "tags": ["AWS", "Tema Principal"],
        "materials_link": "https://... (Opcional: enlace a slides o repo)"
    }
    ```

### Para Añadir un Nuevo Recurso a la "Caja de Herramientas":

1.  Abre `public/assets/data/resources.json`.
2.  Busca la categoría correcta (`"category"`) y añade un nuevo objeto al array `items`.

    *Ejemplo:*
    ```json
    {
      "title": "Nueva Herramienta Increíble",
      "description": "Descripción de para qué sirve esta herramienta.",
      "url": "https://... (enlace a la herramienta)",
      "image": "https://... (URL a una imagen o logo)",
      "tags": ["Productividad", "Gratis"]
    }
    ```

### Para Añadir un Nuevo Juego de Lógica:

1.  Abre `public/assets/data/logic-games.json`.
2.  Añade un nuevo objeto al array.

    *Ejemplo:*
    ```json
    {
        "title": "Nombre del Juego",
        "description": "Descripción breve del juego de lógica.",
        "url": "https://... (Enlace para jugar)",
        "image": "https://... (URL a una imagen)",
        "tags": ["Lógica", "Resolución de Problemas"]
    }
    ```

### Para Añadir un Nuevo Evento:

1.  Abre `public/assets/data/events.json`.
2.  Añade un nuevo objeto al array.

    *Ejemplo:*
    ```json
    {
      "date": "2026-01-15",
      "title": "Próximo Meetup de Inicio de Año",
      "description": "Nuestra primera reunión del año para planificar actividades.",
      "format": "Presencial",
      "tags": ["Meetup", "Comunidad"]
    }
    ```

---
## ☁️ Despliegue

Este proyecto está configurado para un despliegue continuo a través de **AWS Amplify**. El archivo `amplify.yml` contiene la configuración del build. Cualquier `git push` a la rama configurada (ej. `main`) disparará automáticamente un nuevo despliegue del sitio.
