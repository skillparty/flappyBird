# Flappy Bird Minimal

Versión simplificada y estable de un clon de Flappy Bird hecha con **TypeScript**, **Phaser 3** y **Vite**. Se eliminaron escenas, managers y sistemas avanzados para dejar un único archivo `src/app.ts` fácil de leer y mantener.

## 🎮 Características

### Estado Actual
Minimal: solo lógica básica (pájaro, tuberías, monedas, puntuación y game over) dentro de una única escena definida en `app.ts`.

El resto de carpetas (components, managers, scenes, systems, etc.) fueron vaciadas (stubs) y están listas para eliminarse físicamente si se desea hacer un commit de limpieza adicional.

## 🚀 Tecnologías
TypeScript · Phaser 3 · Vite · Jest (solo 1 prueba mínima)

## 📦 Instalación y Ejecución

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd flappy-bird-clone

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# El juego estará disponible en http://localhost:6040
```

### Scripts
```bash
npm run dev       # Desarrollo
npm run build     # Build producción
npm run preview   # Servir build
npm run test      # Ejecuta prueba mínima (app.test.ts)
```

## 🎯 Controles

### Controles Básicos
- **Clic del ratón**: Hacer saltar al pájaro
- **Tecla ESPACIO**: Hacer saltar al pájaro
- **Tecla ENTER**: Hacer saltar al pájaro (alternativo)

### Controles de Navegación
- **Tecla ESC**: Pausar/reanudar juego o cerrar menús
- **Tecla TAB**: Navegar por elementos del menú
- **Teclas de flecha**: Navegación alternativa en menús

## 🏗️ Estructura Simplificada
```
src/
  app.ts        # Único archivo con toda la lógica del juego
tests/
  app.test.ts   # Prueba mínima
```

Carpetas legacy vacías (stubs) pendientes de borrado definitivo:
`components/ managers/ scenes/ systems/ effects/ config/ types/`

## 🧪 Testing
Se mantiene solo una prueba simple que valida que el juego se inicializa con el tamaño esperado. Si agregas nuevas features, añade nuevas pruebas.

## ♿ Notas
La versión actual mantiene algunos elementos de accesibilidad en `index.html` (roles ARIA e instrucciones), pero la lógica avanzada fue removida.

## 🎨 Personalización
Todo está centralizado en `app.ts`. Ajusta constantes ahí (anchos, gravedad, velocidades) sin buscar en otras capas.

## 🔧 Rendimiento
La simplicidad reduce el coste. No hay sistemas dinámicos de degradación. Si necesitas optimizar más: baja gravedad o velocidad de scroll.

## 🐛 Errores
Se usa un listener global simple `window.addEventListener('error', ...)` en `app.ts` para loguear errores.

## 📱 Compatibilidad

### Navegadores Soportados
- **Desktop**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+, Samsung Internet 13+

### Dispositivos
- **Desktop**: Resoluciones desde 1024x768
- **Tablet**: iPad y tablets Android
- **Mobile**: Teléfonos en orientación vertical y horizontal

## 🤝 Contribución
Si deseas reintroducir features, crea nuevas carpetas limpias en vez de revivir stubs.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- **Phaser.js** - Motor de juego potente y flexible
- **Tailwind CSS** - Framework CSS utilitario
- **Vite** - Build tool rápido y moderno
- **Jest** - Framework de testing confiable
- **Comunidad Open Source** - Por las herramientas y recursos

---

¡Disfruta la versión ligera de Flappy Bird! 🐦✨