# Requirements Document

## Introduction

Este proyecto consiste en crear un clon profesional del juego Flappy Bird para la web, utilizando TypeScript, Phaser 3, Tailwind CSS y Vite. El juego debe ser completamente funcional con mecánicas clásicas de Flappy Bird, incluyendo sistema de puntuación, pantallas de menú, y características adicionales como guardado de puntaje alto y elementos opcionales como sonidos y efectos visuales.

## Requirements

### Requirement 1

**User Story:** Como jugador, quiero ver una pantalla de inicio atractiva con un botón "Jugar", para poder comenzar el juego de manera intuitiva.

#### Acceptance Criteria

1. WHEN el juego se carga THEN el sistema SHALL mostrar una pantalla de menú principal
2. WHEN la pantalla de menú se muestra THEN el sistema SHALL incluir un botón "Jugar" claramente visible
3. WHEN el usuario hace clic en "Jugar" THEN el sistema SHALL iniciar la escena del juego
4. WHEN la pantalla de menú se muestra THEN el sistema SHALL tener un diseño atractivo y moderno usando Tailwind CSS
5. WHEN la pantalla se carga THEN el sistema SHALL ser completamente responsiva en diferentes tamaños de pantalla

### Requirement 2

**User Story:** Como jugador, quiero controlar un pájaro que salta al hacer clic o presionar espacio, para poder navegar a través de los obstáculos.

#### Acceptance Criteria

1. WHEN el usuario hace clic en la pantalla THEN el pájaro SHALL saltar hacia arriba
2. WHEN el usuario presiona la tecla espacio THEN el pájaro SHALL saltar hacia arriba
3. WHEN no hay input del usuario THEN el pájaro SHALL caer por gravedad
4. WHEN el juego está activo THEN el pájaro SHALL tener animación de vuelo suave
5. WHEN el pájaro salta THEN el sistema SHALL aplicar física realista de salto

### Requirement 3

**User Story:** Como jugador, quiero enfrentar obstáculos (tubos) que se mueven de derecha a izquierda, para tener un desafío progresivo en el juego.

#### Acceptance Criteria

1. WHEN el juego inicia THEN el sistema SHALL generar tubos que se mueven de derecha a izquierda
2. WHEN los tubos se mueven THEN el sistema SHALL mantener una velocidad constante
3. WHEN un tubo sale de la pantalla THEN el sistema SHALL generar un nuevo tubo
4. WHEN se generan tubos THEN el sistema SHALL mantener espacios aleatorios pero navegables entre tubos superiores e inferiores
5. WHEN el juego progresa THEN el sistema SHALL mantener un flujo continuo de obstáculos

### Requirement 4

**User Story:** Como jugador, quiero que el juego termine cuando choque con obstáculos o caiga al suelo, para tener consecuencias claras por mis errores.

#### Acceptance Criteria

1. WHEN el pájaro colisiona con un tubo THEN el sistema SHALL terminar el juego
2. WHEN el pájaro toca el suelo THEN el sistema SHALL terminar el juego
3. WHEN el pájaro toca el techo THEN el sistema SHALL terminar el juego
4. WHEN ocurre una colisión THEN el sistema SHALL mostrar la pantalla de Game Over
5. WHEN el juego termina THEN el sistema SHALL detener toda la lógica de juego

### Requirement 5

**User Story:** Como jugador, quiero ver mi puntuación aumentar cada vez que paso un tubo, para tener una medida de mi progreso y habilidad.

#### Acceptance Criteria

1. WHEN el pájaro pasa completamente un tubo THEN el sistema SHALL incrementar la puntuación en 1
2. WHEN la puntuación cambia THEN el sistema SHALL mostrar la puntuación actual en pantalla
3. WHEN el juego inicia THEN el sistema SHALL comenzar la puntuación en 0
4. WHEN el juego termina THEN el sistema SHALL preservar la puntuación final
5. WHEN se muestra la puntuación THEN el sistema SHALL usar un diseño claro y legible

### Requirement 6

**User Story:** Como jugador, quiero ver una pantalla de Game Over con mi puntaje y opción de reiniciar, para poder revisar mi rendimiento y jugar nuevamente.

#### Acceptance Criteria

1. WHEN el juego termina THEN el sistema SHALL mostrar una pantalla de Game Over
2. WHEN la pantalla de Game Over se muestra THEN el sistema SHALL mostrar la puntuación final
3. WHEN la pantalla de Game Over se muestra THEN el sistema SHALL incluir un botón "Reiniciar" o "Jugar de nuevo"
4. WHEN el usuario hace clic en reiniciar THEN el sistema SHALL volver a iniciar el juego
5. WHEN la pantalla de Game Over se muestra THEN el sistema SHALL tener un diseño atractivo usando Tailwind CSS

### Requirement 7

**User Story:** Como jugador, quiero que mi puntaje más alto se guarde automáticamente, para poder ver mi mejor rendimiento a lo largo del tiempo.

#### Acceptance Criteria

1. WHEN el juego termina THEN el sistema SHALL comparar la puntuación actual con el puntaje más alto guardado
2. IF la puntuación actual es mayor que el puntaje más alto THEN el sistema SHALL actualizar el puntaje más alto en localStorage
3. WHEN se muestra la pantalla de Game Over THEN el sistema SHALL mostrar el puntaje más alto
4. WHEN el juego se carga por primera vez THEN el sistema SHALL inicializar el puntaje más alto en 0
5. WHEN se accede al puntaje más alto THEN el sistema SHALL recuperarlo de localStorage

### Requirement 8

**User Story:** Como jugador, quiero que el juego tenga un diseño visual moderno y limpio, para disfrutar de una experiencia visual atractiva.

#### Acceptance Criteria

1. WHEN cualquier pantalla se muestra THEN el sistema SHALL usar Tailwind CSS para el estilizado
2. WHEN el juego se ejecuta THEN el sistema SHALL tener un diseño responsivo que funcione en diferentes dispositivos
3. WHEN se muestran elementos UI THEN el sistema SHALL usar colores y tipografía consistentes
4. WHEN el juego se renderiza THEN el sistema SHALL mantener un rendimiento fluido de 60 FPS
5. WHEN se muestran sprites THEN el sistema SHALL usar assets de alta calidad

### Requirement 9

**User Story:** Como desarrollador, quiero que el código esté modularizado en escenas específicas, para mantener una arquitectura limpia y mantenible.

#### Acceptance Criteria

1. WHEN el proyecto se estructura THEN el sistema SHALL tener escenas separadas: Boot, Preload, Menu, Game, GameOver
2. WHEN se implementan escenas THEN cada escena SHALL tener responsabilidades específicas y bien definidas
3. WHEN se organiza el código THEN el sistema SHALL seguir principios de separación de responsabilidades
4. WHEN se desarrolla THEN el sistema SHALL usar TypeScript para tipado estático
5. WHEN se construye el proyecto THEN el sistema SHALL usar Vite como build tool

### Requirement 10 (Opcional)

**User Story:** Como jugador, quiero escuchar efectos de sonido durante el juego, para tener una experiencia más inmersiva.

#### Acceptance Criteria

1. WHEN el pájaro salta THEN el sistema SHALL reproducir un sonido de salto
2. WHEN ocurre una colisión THEN el sistema SHALL reproducir un sonido de colisión
3. WHEN se incrementa la puntuación THEN el sistema SHALL reproducir un sonido de puntaje
4. WHEN se reproducen sonidos THEN el sistema SHALL permitir controlar el volumen
5. IF los sonidos no están disponibles THEN el sistema SHALL funcionar normalmente sin audio

### Requirement 11 (Opcional)

**User Story:** Como jugador, quiero ver un fondo animado o con efecto parallax, para tener una experiencia visual más dinámica.

#### Acceptance Criteria

1. WHEN el juego se ejecuta THEN el sistema SHALL mostrar un fondo animado
2. WHEN el fondo se anima THEN el sistema SHALL usar efecto parallax para profundidad
3. WHEN se muestra el fondo THEN el sistema SHALL mantener el rendimiento del juego
4. WHEN el fondo se renderiza THEN el sistema SHALL complementar la estética general del juego
5. IF el efecto parallax afecta el rendimiento THEN el sistema SHALL priorizar la jugabilidad

### Requirement 12

**User Story:** Como jugador, quiero ver un Cheep Cheep (pez volador de Mario) en lugar del pájaro tradicional, para tener una experiencia visual nostálgica de Mario Bros.

#### Acceptance Criteria

1. WHEN el juego se carga THEN el sistema SHALL mostrar un Cheep Cheep como personaje principal
2. WHEN el Cheep Cheep salta THEN el sistema SHALL mostrar animación de aletas batiendo
3. WHEN el Cheep Cheep cae THEN el sistema SHALL rotar ligeramente hacia abajo como en Mario Bros
4. WHEN el Cheep Cheep se mueve THEN el sistema SHALL mantener el estilo visual pixelado de Mario
5. WHEN se renderiza el personaje THEN el sistema SHALL usar colores rojos y blancos característicos del Cheep Cheep

### Requirement 13

**User Story:** Como jugador, quiero recolectar monedas durante el vuelo, para obtener puntos extra y sentir la experiencia clásica de Mario Bros.

#### Acceptance Criteria

1. WHEN se generan obstáculos THEN el sistema SHALL colocar monedas doradas entre algunos tubos
2. WHEN el Cheep Cheep toca una moneda THEN el sistema SHALL incrementar la puntuación en 10 puntos
3. WHEN se recolecta una moneda THEN el sistema SHALL reproducir el sonido clásico de moneda de Mario
4. WHEN se recolecta una moneda THEN el sistema SHALL mostrar una animación de brillo y desaparición
5. WHEN se muestran las monedas THEN el sistema SHALL usar el sprite dorado giratorio clásico de Mario

### Requirement 14

**User Story:** Como jugador, quiero ver un fondo estilo Mario Bros con nubes y colinas, para sumergirme en el mundo de Mario mientras juego.

#### Acceptance Criteria

1. WHEN el juego se ejecuta THEN el sistema SHALL mostrar un fondo azul cielo estilo Mario Bros
2. WHEN se renderiza el fondo THEN el sistema SHALL incluir nubes blancas pixeladas flotando
3. WHEN se muestra el paisaje THEN el sistema SHALL incluir colinas verdes en el fondo
4. WHEN las nubes se mueven THEN el sistema SHALL usar efecto parallax a diferentes velocidades
5. WHEN se renderiza el escenario THEN el sistema SHALL mantener la paleta de colores clásica de Mario Bros

### Requirement 15

**User Story:** Como jugador, quiero escuchar sonidos auténticos de Mario Bros, para tener una experiencia sonora nostálgica y familiar.

#### Acceptance Criteria

1. WHEN el Cheep Cheep salta THEN el sistema SHALL reproducir un sonido de salto estilo Mario
2. WHEN se recolecta una moneda THEN el sistema SHALL reproducir el sonido clásico "ding" de moneda
3. WHEN ocurre una colisión THEN el sistema SHALL reproducir el sonido de muerte/daño de Mario
4. WHEN se incrementa la puntuación por pasar tubos THEN el sistema SHALL reproducir un sonido de puntuación
5. IF el audio está deshabilitado THEN el sistema SHALL funcionar normalmente sin sonidos

### Requirement 16 (Futuro)

**User Story:** Como jugador, quiero poder recolectar una estrella de poder que me haga invencible temporalmente, para tener momentos de emoción y ventaja estratégica.

#### Acceptance Criteria

1. WHEN aparece una estrella THEN el sistema SHALL mostrarla girando con brillo dorado
2. WHEN el Cheep Cheep toca la estrella THEN el sistema SHALL activar modo invencible por 10 segundos
3. WHEN está en modo invencible THEN el Cheep Cheep SHALL parpadear con colores arcoíris
4. WHEN está invencible THEN el sistema SHALL permitir pasar a través de tubos sin colisionar
5. WHEN se activa la estrella THEN el sistema SHALL reproducir la música de invencibilidad de Mario

### Requirement 17 (Opcional - Personajes)

**User Story:** Como jugador, quiero poder seleccionar entre diferentes personajes de Mario Bros, para personalizar mi experiencia de juego.

#### Acceptance Criteria

1. WHEN accedo al menú THEN el sistema SHALL mostrar opciones: Cheep Cheep, Lakitu, Blooper
2. WHEN selecciono un personaje THEN el sistema SHALL aplicar el sprite y animaciones correspondientes
3. WHEN cambio de personaje THEN el sistema SHALL guardar mi selección en localStorage
4. WHEN el juego se carga THEN el sistema SHALL recordar mi último personaje seleccionado
5. WHEN se muestran las opciones THEN cada personaje SHALL tener características visuales únicas de Mario Bros
