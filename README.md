# 🦈 Proyecto Tiburón - AWS User Group Playa Vicente

¡Bienvenidos a la plataforma oficial del AWS User Group de Playa Vicente! Este es un espacio abierto para aprender, compartir y construir comunidad alrededor de Amazon Web Services en español.

---

## 🚀 Cómo Probar en Local

Para que el sitio web funcione correctamente en tu computadora (especialmente la carga de eventos y recursos), necesitas ejecutarlo a través de un pequeño servidor web local.

1.  Abre una terminal en la carpeta raíz del proyecto (`/Tiburon`).
2.  Ejecuta el siguiente comando:
    ```bash
    python3 -m http.server
    ```
3.  Abre tu navegador y visita la dirección: `http://localhost:8000`

---

## ✍️ Cómo Actualizar el Contenido

Para facilitar la actualización, el contenido de **Eventos** y **Recursos** se gestiona desde archivos `JSON`, sin necesidad de tocar el HTML.

### Para Añadir un Nuevo Evento:

1.  **Sube la imagen del evento** a la carpeta `assets/images/events/`.
2.  **Abre el archivo:** `assets/data/events.json`.
3.  **Añade un nuevo objeto** al array. Asegúrate de que la fecha (`date`) tenga el formato `YYYY-MM-DD`.

    *Ejemplo:*
    ```json
    {
      "date": "2025-12-20",
      "title": "Meetup Navideño y AWS re:Invent Resumen",
      "description": "Nuestra última reunión del año para discutir las novedades de re:Invent y celebrar un año de aprendizaje.",
      "image": "assets/images/events/meetup-navidad.jpg",
      "tags": ["Meetup", "Comunidad", "re:Invent"]
    }
    ```

### Para Añadir un Nuevo Recurso:

1.  **Sube la imagen principal** a la carpeta `assets/images/resources/`.
2.  **(Opcional) Sube las imágenes de los badges** a la misma carpeta.
3.  **Abre el archivo:** `assets/data/resources.json`.
4.  **Añade un nuevo objeto** al array. La propiedad `badges` es una lista opcional.

    *Ejemplo con badges:*
    ```json
    {
      "title": "AWS Cloud Quest",
      "description": "Plataforma de aprendizaje gamificada. Ofrece badges gratis (Cloud Practitioner, Generativa AI) y otras especializadas de pago.",
      "url": "https://aws.amazon.com/training/digital/aws-cloud-quest/",
      "image": "assets/images/resources/cloud-quest-game.jpg",
      "badges": [
          "assets/images/resources/cloud-quest-badge.png",
          "assets/images/resources/cloud-quest-ai-badge.png"
      ],
      "tags": ["Juego", "AWS", "Gratis", "De Pago", "Badges"]
    }
    ```

    *Ejemplo sin badges:*
    ```json
    {
      "title": "Learn Git Branching",
      "description": "Una herramienta interactiva y visual para aprender y dominar los comandos de Git.",
      "url": "https://learngitbranching.js.org/",
      "image": "assets/images/resources/learn-git.jpg",
      "tags": ["Git", "Herramienta", "Gratis"]
    }
    ```

---

## 🎯 Estado y Próximos Pasos

### Funcionalidades Actuales

*   ✅ **Contenido Dinámico:** Eventos y Recursos se cargan desde archivos JSON.
*   ✅ **Diseño Responsivo:** Adaptable a móvil y escritorio.
*   ✅ **Tema Oscuro/Claro:** Selector de tema con memoria local.
*   ✅ **Diseño de Tarjetas Personalizado:** Componentes visuales únicos para eventos y recursos.
*   ✅ **Estructura de Proyecto Limpia:** Todos los activos están centralizados en la carpeta `assets`.

### Próximos Pasos

1.  **Galería de Fotos de Eventos:**
    *   Crear una página de detalle para cada evento.
    *   En esa página, se mostrará una galería de fotos cargada dinámicamente desde una carpeta específica para ese evento (ej: `assets/images/events/nombre-del-evento/`).

---

## 📁 Estructura del Proyecto

```
tiburon/
├── index.html
├── glosario.html
├── recursos.html
├── servicios.html
├── eventos.html
├── assets/
│   ├── css/          # Archivos de estilo
│   ├── js/           # Archivos de JavaScript
│   ├── data/         # Archivos JSON con el contenido
│   └── images/       # Todas las imágenes del sitio
│       ├── events/
│       ├── resources/
│       └── qrcodes/
├── README.md         # Este archivo
└── ... (otros archivos de configuración)
```