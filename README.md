# Flappy Bird - Clon Profesional

Un clon profesional del clásico juego Flappy Bird construido con TypeScript, Phaser 3, Tailwind CSS y Vite. El juego incluye características modernas como diseño responsivo, accesibilidad completa, sistema de audio opcional, efectos visuales parallax y selección de personajes.

## 🎮 Características

### Características Principales
- **Mecánicas clásicas de Flappy Bird**: Controla un pájaro que debe evitar obstáculos
- **Sistema de puntuación**: Puntuación en tiempo real con guardado de récord personal
- **Múltiples escenas**: Menú principal, juego, y pantalla de game over
- **Diseño responsivo**: Funciona perfectamente en desktop y móvil
- **Accesibilidad completa**: Soporte para lectores de pantalla y navegación por teclado

### Características Opcionales
- **Sistema de audio**: Efectos de sonido para salto, puntuación y colisiones
- **Fondo parallax**: Múltiples capas de fondo con efecto de profundidad
- **Selección de personajes**: 4 skins diferentes para el pájaro
- **Optimización de rendimiento**: Ajustes automáticos para mantener 60 FPS
- **Modo de alto contraste**: Soporte para preferencias de accesibilidad

## 🚀 Tecnologías Utilizadas

- **TypeScript**: Tipado estático para mejor desarrollo
- **Phaser 3**: Motor de juego 2D potente y flexible
- **Tailwind CSS**: Framework CSS utilitario para UI moderna
- **Vite**: Build tool rápido y moderno
- **Jest**: Framework de testing para pruebas automatizadas

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

### Scripts Disponibles
```bash
# Desarrollo
npm run dev          # Servidor de desarrollo con hot reload

# Construcción
npm run build        # Construir para producción
npm run preview      # Previsualizar build de producción

# Testing
npm run test         # Ejecutar tests una vez
npm run test:watch   # Ejecutar tests en modo watch
npm run test:coverage # Ejecutar tests con reporte de cobertura
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

## 🏗️ Arquitectura del Proyecto

### Estructura de Carpetas
```
src/
├── components/          # Componentes del juego
│   ├── Bird.ts         # Componente del pájaro
│   ├── PipeManager.ts  # Gestor de tuberías
│   ├── ParallaxBackground.ts # Sistema de fondo parallax
│   └── CharacterSelector.ts # Selector de personajes
├── managers/           # Gestores del sistema
│   ├── ScoreManager.ts # Gestión de puntuación
│   ├── StorageManager.ts # Persistencia de datos
│   ├── AssetManager.ts # Carga de recursos
│   ├── AudioManager.ts # Sistema de audio
│   ├── ErrorHandler.ts # Manejo de errores
│   └── AccessibilityManager.ts # Accesibilidad
├── scenes/             # Escenas del juego
│   ├── Boot.ts         # Escena de arranque
│   ├── Preload.ts      # Carga de recursos
│   ├── Menu.ts         # Menú principal
│   ├── Game.ts         # Juego principal
│   └── GameOver.ts     # Pantalla de game over
├── systems/            # Sistemas del juego
│   ├── CollisionSystem.ts # Detección de colisiones
│   ├── GameOverSystem.ts # Sistema de game over
│   └── PerformanceManager.ts # Optimización de rendimiento
├── types/              # Definiciones de tipos
│   └── GameTypes.ts    # Interfaces y tipos
└── config/             # Configuración
    └── GameConfig.ts   # Configuración del juego
```

### Patrones de Diseño Utilizados
- **Singleton**: Para managers globales (ScoreManager, AudioManager)
- **Observer**: Para callbacks de eventos del juego
- **Object Pool**: Para reutilización eficiente de sprites de tuberías
- **Strategy**: Para diferentes estrategias de renderizado según rendimiento

## 🧪 Testing

El proyecto incluye un sistema completo de testing automatizado:

### Tipos de Tests
- **Tests Unitarios**: Componentes individuales (Bird, ScoreManager, etc.)
- **Tests de Integración**: Flujo completo del juego
- **Tests de Rendimiento**: Monitoreo de FPS y memoria
- **Tests de Accesibilidad**: Verificación de características accesibles

### Ejecutar Tests
```bash
# Tests básicos
npm run test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch (desarrollo)
npm run test:watch
```

## ♿ Accesibilidad

El juego está diseñado para ser completamente accesible:

### Características de Accesibilidad
- **Navegación por teclado**: Todos los elementos son navegables con teclado
- **Lectores de pantalla**: Anuncios automáticos de estado del juego
- **Alto contraste**: Soporte automático para modo de alto contraste
- **Movimiento reducido**: Respeta las preferencias de animación del usuario
- **Etiquetas ARIA**: Elementos correctamente etiquetados para tecnologías asistivas

### Controles de Accesibilidad
- **TAB**: Navegar entre elementos
- **ENTER/ESPACIO**: Activar elementos o saltar
- **ESC**: Regresar o pausar
- **Foco visible**: Indicadores claros de foco

## 🎨 Personalización

### Añadir Nuevos Personajes
1. Añadir sprite a `public/assets/images/`
2. Actualizar `ASSET_CONFIG` en `GameConfig.ts`
3. Añadir personaje al array en `CharacterSelector.ts`

### Modificar Configuración del Juego
Editar `src/config/GameConfig.ts`:
```typescript
export const GAME_CONFIG = {
  physics: {
    gravity: 1500,        // Gravedad del juego
    birdJumpForce: -400,  // Fuerza de salto
    pipeSpeed: -200       // Velocidad de tuberías
  },
  gameplay: {
    pipeGap: 200,         // Espacio entre tuberías
    pipeSpawnInterval: 1500 // Intervalo de generación
  }
  // ... más configuraciones
};
```

## 🔧 Optimización de Rendimiento

El juego incluye optimizaciones automáticas:

### Características de Optimización
- **Object Pooling**: Reutilización de sprites para mejor rendimiento
- **Degradación elegante**: Desactivación automática de efectos si el FPS baja
- **Monitoreo de memoria**: Detección y manejo de presión de memoria
- **Ajustes dinámicos**: Reducción automática de calidad visual si es necesario

### Configuración de Rendimiento
El sistema ajusta automáticamente:
1. **Efectos de partículas** (se desactivan primero)
2. **Fondo parallax** (se simplifica)
3. **Animaciones** (se reducen)
4. **Número de tuberías** (se limita)

## 🐛 Manejo de Errores

Sistema robusto de manejo de errores:

### Tipos de Errores Manejados
- **Errores de carga de assets**: Fallbacks automáticos
- **Errores de audio**: Juego continúa sin sonido
- **Errores de almacenamiento**: Funciona sin persistencia
- **Errores de física**: Reinicio automático del sistema

### Degradación Elegante
- Assets faltantes → Sprites de colores sólidos
- Audio no disponible → Juego silencioso
- LocalStorage bloqueado → Puntuaciones en memoria
- Errores críticos → Pantalla de error amigable

## 📱 Compatibilidad

### Navegadores Soportados
- **Desktop**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+, Samsung Internet 13+

### Dispositivos
- **Desktop**: Resoluciones desde 1024x768
- **Tablet**: iPad y tablets Android
- **Mobile**: Teléfonos en orientación vertical y horizontal

## 🤝 Contribución

### Cómo Contribuir
1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

### Estándares de Código
- Usar TypeScript para tipado estático
- Seguir las convenciones de ESLint
- Escribir tests para nuevas características
- Documentar funciones públicas
- Mantener accesibilidad en nuevas características

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- **Phaser.js** - Motor de juego potente y flexible
- **Tailwind CSS** - Framework CSS utilitario
- **Vite** - Build tool rápido y moderno
- **Jest** - Framework de testing confiable
- **Comunidad Open Source** - Por las herramientas y recursos

---

¡Disfruta jugando Flappy Bird! 🐦✨