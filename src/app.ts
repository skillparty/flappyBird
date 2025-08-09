import * as Phaser from 'phaser';
// Asegurar tipo OscillatorType (en navegadores modernos ya existe)
type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle';

// Simple and stable game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#5C94FC', // Mario Bros sky blue
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 1000 }, // supply x to satisfy Vector2Like
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// Game variables
let bird: Phaser.Physics.Arcade.Sprite;
let pipes: Phaser.Physics.Arcade.Group;
let ground: Phaser.GameObjects.TileSprite;
let scoreText: Phaser.GameObjects.Text;
let instructionText: Phaser.GameObjects.Text | undefined;
let score = 0;
let gameOver = false;
let gameStarted = false;
let pipeTimer = 0;

// Fondo: nubes y pinos
let clouds: Phaser.GameObjects.Group;
let hills: Phaser.GameObjects.Group; // reutilizamos el nombre para los pinos

// Mario Bros coins system
let coins: Phaser.Physics.Arcade.Group;
let coinScore = 0;              // cantidad de monedas recogidas
let coinPoints = 0;             // puntos acumulados (valor base * multiplicador)
let coinStreak = 0;             // racha actual de monedas sin morir
let bestMultiplier = 1;         // mejor multiplicador alcanzado en la partida actual
let previousLevel = 1;          // para detectar subidas de nivel
let scorePanel: Phaser.GameObjects.Rectangle; // fondo del marcador
let dayCycleTime = 0;           // acumulador para ciclo día-noche
let stars: Phaser.GameObjects.Group; // capa de estrellas
let birdGlow: Phaser.GameObjects.Sprite; // resplandor del pez
let dayCycleProgress = 0;       // 0..1 progreso del ciclo día-noche
// Audio
let mute = false;
let muteButton: Phaser.GameObjects.Text;
function playTone(
  scene: Phaser.Scene,
  freq: number,
  durationMs = 140,
  type: OscillatorType = 'square',
  volume = 0.25,
  jitter = 0.04 // variación relativa +/-4%
) {
  if (mute) return;
  const anySound: any = (scene as any).sound;
  const ctx: AudioContext | undefined = anySound?.context as AudioContext | undefined;
  if (!ctx) return; // WebAudio no disponible
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const variation = 1 + (Math.random() * 2 - 1) * jitter;
  const finalFreq = Math.max(20, freq * variation);
  osc.type = type;
  osc.frequency.value = finalFreq;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + durationMs / 1000);
}

// Dificultad progresiva
function getDifficultyFactor(): number {
  // Escala de 0 a 1 alcanzada aprox en 40 tuberías
  return Math.min(1, score / 40);
}

function getDifficultyParams() {
  const f = getDifficultyFactor();
  return {
    gapSize: Math.round(180 - f * 60),            // 180 -> 120
    pipeSpeed: -200 - f * 150,                    // -200 -> -350
    spawnInterval: 1800 - f * 900,                // 1800ms -> 900ms
    coinChance: 0.4 - f * 0.15,                   // 40% -> 25%
    level: 1 + Math.floor(f * 9)                  // 1..10
  } as const;
}

function formatScoreLine() {
  const { level } = getDifficultyParams();
  const baseValue = getBaseCoinValue(level);
  const mult = getCurrentMultiplier();
  const totalScore = score + coinPoints;
  return `Nivel: ${level} | Monedas: ${coinScore} (${coinPoints}) | Mult: ${mult.toFixed(2)}x | Tuberías: ${score} | Total: ${totalScore}`;
}

// Valor base no lineal de moneda (crecimiento exponencial suave)
function getBaseCoinValue(level: number) {
  return Math.round(10 * Math.pow(1.15, level - 1)); // lvl1=10, lvl10~31
}

// Multiplicador por racha: +5% por moneda hasta un máximo (tope configurable)
function getCurrentMultiplier() {
  const maxStreakForGrowth = 50; // después de 50 deja de crecer
  const effective = Math.min(coinStreak, maxStreakForGrowth);
  return 1 + effective * 0.05; // 1.. (1+50*0.05)=3.5x (tope actual)
}

function preload(this: Phaser.Scene) {
  console.log('🎮 Loading game assets...');
  
  // Hide loading indicator
  const loadingElement = document.getElementById('loading-indicator');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }

  // Create simple sprites using graphics
  const graphics = this.add.graphics();
  
  // Cheep Cheep - Mario Bros style fish
  // Body (red-orange)
  graphics.fillStyle(0xFF4444);
  graphics.fillEllipse(17, 12, 30, 20);
  
  // Belly (white/cream)
  graphics.fillStyle(0xFFFFDD);
  graphics.fillEllipse(17, 14, 20, 12);
  
  // Eye (black)
  graphics.fillStyle(0x000000);
  graphics.fillCircle(22, 10, 4);
  
  // Eye highlight (white)
  graphics.fillStyle(0xFFFFFF);
  graphics.fillCircle(23, 9, 2);
  
  // Fins (darker red)
  graphics.fillStyle(0xCC2222);
  // Top fin
  graphics.fillTriangle(8, 8, 2, 4, 8, 12);
  // Bottom fin
  graphics.fillTriangle(8, 16, 2, 20, 8, 12);
  // Tail fin
  graphics.fillTriangle(2, 8, 2, 16, -4, 12);
  
  graphics.generateTexture('cheepCheep', 34, 24);
  
  // Pipe - Green rectangle
  graphics.clear();
  graphics.fillStyle(0x228B22);
  graphics.fillRect(0, 0, 60, 400);
  graphics.fillStyle(0x32CD32);
  graphics.fillRect(5, 0, 50, 400);
  graphics.generateTexture('pipe', 60, 400);
  
  // Ground - Mario Bros style (green with brown base)
  graphics.clear();
  graphics.fillStyle(0x228B22); // Green top
  graphics.fillRect(0, 0, 800, 40);
  graphics.fillStyle(0x8B4513); // Brown base
  graphics.fillRect(0, 40, 800, 20);
  graphics.generateTexture('ground', 800, 60);
  
  // Mario Bros Cloud - White pixelated
  graphics.clear();
  graphics.fillStyle(0xFFFFFF);
  // Cloud body (pixelated style)
  graphics.fillRect(8, 12, 48, 16);
  graphics.fillRect(4, 16, 56, 8);
  graphics.fillRect(0, 20, 64, 8);
  // Cloud bumps
  graphics.fillRect(16, 8, 16, 4);
  graphics.fillRect(32, 4, 16, 8);
  graphics.generateTexture('cloud', 64, 32);
  
  // Pino (árbol) pixelado
  graphics.clear();
  // Tronco
  graphics.fillStyle(0x5B3716); // marrón
  graphics.fillRect(18, 52, 8, 12);
  // Capas de hojas (triángulos apilados)

    // Botón de mute
    muteButton = this.add.text(788, 8, '🔊', {
      fontSize: '24px', fontFamily: 'Arial', color: '#FFFFFF', stroke: '#000000', strokeThickness: 3
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    muteButton.on('pointerdown', () => {
      mute = !mute;
      muteButton.setText(mute ? '🔇' : '🔊');
    });
  graphics.fillStyle(0x0E7A24);
  graphics.fillTriangle(10, 55, 34, 55, 22, 30); // superior
  graphics.fillTriangle(8, 62, 36, 62, 22, 36);  // media
  graphics.fillTriangle(6, 70, 38, 70, 22, 44);  // inferior
  // Nieve / luz (detalle)
  graphics.fillStyle(0x6FEF9B, 0.6);
  graphics.fillTriangle(14, 46, 22, 34, 30, 46);
  graphics.generateTexture('pine', 44, 70);
  
  // Mario Bros Coin - Golden pixelated
  graphics.clear();
  graphics.fillStyle(0xFFD700); // Gold
  // Coin body (circular pixelated)
  graphics.fillRect(4, 2, 16, 20);
  graphics.fillRect(2, 4, 20, 16);
  graphics.fillRect(6, 0, 12, 24);
  
  // Coin highlight
  graphics.fillStyle(0xFFFF99);
  graphics.fillRect(8, 4, 8, 16);
  graphics.fillRect(6, 6, 12, 12);
  
  // Coin shadow/depth
  graphics.fillStyle(0xCC9900);
  graphics.fillRect(16, 4, 4, 16);
  graphics.fillRect(14, 2, 6, 20);
  
  graphics.generateTexture('coin', 24, 24);
  
    playTone(this, 660, 140, 'square');
  graphics.destroy();
}

function createMarioBrosBackground(this: Phaser.Scene) {
  // Pinos (capa trasera)
  hills = this.add.group();
  for (let i = 0; i < 9; i++) {
    const x = i * 120 - 60 + Phaser.Math.Between(-20, 20);
    const tree = this.add.image(x, 540, 'pine');
    const scale = Phaser.Math.FloatBetween(0.7, 1.2);
    tree.setScale(scale);
    tree.setOrigin(0.5, 1);
    tree.setAlpha(Phaser.Math.FloatBetween(0.6, 0.9));
    hills.add(tree);
  }

  // Nubes (capa media)
  clouds = this.add.group();
  for (let i = 0; i < 8; i++) {
    const cloud = this.add.image(
      Phaser.Math.Between(0, 1000),
      Phaser.Math.Between(50, 200),
      'cloud'
    );
    cloud.setScale(Phaser.Math.FloatBetween(0.5, 1.0));
    cloud.setAlpha(0.8);
    clouds.add(cloud);
  }
}

function create(this: Phaser.Scene) {
  console.log('🌍 Creating game world...');
  
  // Reset game state
  score = 0;
  coinScore = 0;
  coinPoints = 0;
  coinStreak = 0;
  bestMultiplier = 1;
  gameOver = false;
  gameStarted = false;
  pipeTimer = 0;
  
  // Create Mario Bros background
  createMarioBrosBackground.call(this);
  // Estrellas (inicialmente invisibles hasta noche)
  stars = this.add.group();
  for (let i = 0; i < 70; i++) {
    const s = this.add.rectangle(Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 400), 2, 2, 0xFFFFFF, Phaser.Math.FloatBetween(0.4, 1));
    s.setAlpha(0); // se hará fade in de noche
    stars.add(s);
  }
  
  // Create ground
  ground = this.add.tileSprite(0, 540, 800, 60, 'ground');
  ground.setOrigin(0, 0);
  
  // Create ground physics (invisible)
  const groundBody = this.physics.add.staticGroup();
  // Use a defined texture key instead of null to satisfy typings
  const groundCollider = groundBody.create(400, 570, 'ground');
  groundCollider.setSize(800, 60);
  groundCollider.setVisible(false);
  
  // Create Cheep Cheep
  bird = this.physics.add.sprite(150, 300, 'cheepCheep');
  // Glow del pez (sprite reutiliza misma textura con tint y blend)
  birdGlow = this.add.sprite(bird.x, bird.y, 'cheepCheep').setTint(0xFFFFAA).setAlpha(0).setScale(1.2);
  birdGlow.setBlendMode(Phaser.BlendModes.ADD);
  bird.setScale(1.0);
  (bird.body as Phaser.Physics.Arcade.Body).setSize(30, 20);
  bird.setCollideWorldBounds(false);
  
  // Add swimming animation data
  bird.setData('isFlapping', false);
  bird.setData('flapTimer', 0);
  
  // Create pipes group
  pipes = this.physics.add.group();
  
  // Create coins group
  coins = this.physics.add.group();
  
  // UI: marcador (alineado a la izquierda para que no se corte)
  // Panel translúcido detrás del marcador
  scorePanel = this.add.rectangle(8, 8, 784, 40, 0x000000, 0.35).setOrigin(0, 0);
  scorePanel.setStrokeStyle(2, 0xffffff, 0.5);
  scoreText = this.add.text(12, 12, formatScoreLine(), {
    fontSize: '22px',
    fontFamily: 'Arial',
    color: '#FFFFFF',
    stroke: '#000000',
    strokeThickness: 4
  });
  scoreText.setOrigin(0, 0);
  scoreText.setDepth(10);
  scorePanel.setDepth(5);
  
  // Instrucciones (se eliminará tras pasar el primer tubo)
  instructionText = this.add.text(400, 200,
    'CLIC o ESPACIO para nadar\n¡Evita las tuberías!', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center'
    });
  instructionText.setOrigin(0.5);
  // Botón mute
  muteButton = this.add.text(788, 8, '🔊', {
    fontSize: '24px', fontFamily: 'Arial', color: '#FFFFFF', stroke: '#000000', strokeThickness: 3
  }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
  muteButton.on('pointerdown', () => {
    mute = !mute;
    muteButton.setText(mute ? '🔇' : '🔊');
  });
  
  // Setup collisions
  this.physics.add.overlap(bird, groundBody, handleGameOver, undefined, this);
  this.physics.add.overlap(bird, pipes, handleGameOver, undefined, this);
  
  // Setup coin collection
  this.physics.add.overlap(bird, coins, collectCoin, undefined, this);
  
  // Setup input
  this.input.on('pointerdown', handleInput, this);
  this.input.keyboard?.on('keydown-SPACE', handleInput, this);
  
  console.log('✅ Game world ready!');
}

function flashLevelUp(scene: Phaser.Scene, level: number) {
  const txt = scene.add.text(400, 120, `Nivel ${level}!`, {
    fontSize: '48px', fontFamily: 'Arial', color: '#FFE066', stroke: '#000', strokeThickness: 6
  }).setOrigin(0.5).setScale(0.2);
  scene.tweens.add({ targets: txt, scale: 1, duration: 300, ease: 'Back.Out' });
  scene.tweens.add({ targets: txt, alpha: 0, delay: 900, duration: 600, onComplete: () => txt.destroy() });
  // Breve flash de borde en el panel
  scorePanel.setFillStyle(0xFFFFFF, 0.6);
  scene.time.delayedCall(120, () => scorePanel.setFillStyle(0x000000, 0.35));
}

function handleInput(this: Phaser.Scene) {
  if (gameOver) {
    // Restart game
    this.scene.restart();
    return;
  }
  
  if (!gameStarted) {
    gameStarted = true;
    console.log('🚀 Game started!');
  }
  
  // Make Cheep Cheep jump with flapping animation
  bird.setVelocityY(-350);
  playTone(this, 660, 140, 'square');
  
  // Trigger flapping animation
  bird.setData('isFlapping', true);
  bird.setData('flapTimer', 200); // Flap for 200ms
  
  // Scale animation for flapping effect
  bird.setScale(1.1, 0.9);
  
  console.log('🐟 Cheep Cheep jumps!');
}

function collectCoin(this: Phaser.Scene, cheepCheep: any, coin: any) {
  // Remove coin with sparkle effect
  coin.setScale(1.2);
  coin.setAlpha(0.7);
  
  // Add coin score (count + scaled points)
  coinScore++;
  coinStreak++;
  const { level } = getDifficultyParams();
  const baseValue = getBaseCoinValue(level);
  const mult = getCurrentMultiplier();
  bestMultiplier = Math.max(bestMultiplier, mult);
  const gained = Math.round(baseValue * mult);
  coinPoints += gained;
  // Texto flotante de ganancia
  const floatText = this.add.text(coin.x, coin.y - 20, `+${gained}`, { fontSize: '16px', fontFamily: 'Arial', color: '#FFFF55', stroke: '#000', strokeThickness: 3 });
  floatText.setDepth(1000).setOrigin(0.5);
  this.tweens.add({ targets: floatText, y: floatText.y - 30, alpha: 0, duration: 700, ease: 'Cubic.easeOut', onComplete: () => floatText.destroy() });
  scoreText.setText(formatScoreLine());
  playTone(this, 1180, 160, 'triangle');
  
  // Destroy coin
  coin.destroy();
  
  console.log('💰 Coin collected! +10 points');
}

function generatePipe(this: Phaser.Scene) {
  if (gameOver) return;
  
  const { gapSize, pipeSpeed, coinChance } = getDifficultyParams();
  const minY = 150;
  const maxY = 400;
  const gapY = Phaser.Math.Between(minY, maxY);
  
  // Top pipe
  const topPipe = pipes.create(850, gapY - gapSize/2, 'pipe');
  topPipe.setOrigin(0.5, 1);
  topPipe.setFlipY(true);
  topPipe.body.setImmovable(true);
  topPipe.body.setVelocityX(pipeSpeed);
  topPipe.body.setVelocityY(0);
  topPipe.body.setGravityY(-1000); // Cancel gravity
  topPipe.setData('scored', false);
  
  // Bottom pipe
  const bottomPipe = pipes.create(850, gapY + gapSize/2, 'pipe');
  bottomPipe.setOrigin(0.5, 0);
  bottomPipe.body.setImmovable(true);
  bottomPipe.body.setVelocityX(pipeSpeed);
  bottomPipe.body.setVelocityY(0);
  bottomPipe.body.setGravityY(-1000); // Cancel gravity
  bottomPipe.setData('scored', false);
  
  // 40% chance to spawn a coin between pipes
  if (Math.random() < coinChance) {
    const coin = coins.create(850, gapY, 'coin');
    coin.setScale(0.8);
  coin.body.setVelocityX(pipeSpeed);
    coin.body.setVelocityY(0);
    coin.body.setGravityY(-1000); // Cancel gravity
    coin.setData('rotationSpeed', 0.1);
    console.log('💰 Coin spawned!');
  }
  
  console.log('🏗️ Generated pipe pair');
}

function handleGameOver(this: Phaser.Scene) {
  if (gameOver) return;
  
  gameOver = true;
  console.log('💀 Game Over! Final Score:', score);
  // Sonido game over
  playTone(this, 440, 250, 'square', 0.3);
  this.time.delayedCall(180, () => playTone(this, 330, 300, 'square', 0.25));
  
  // Stop bird
  bird.setVelocity(0, 0);
  
  // Stop all pipes
  pipes.children.entries.forEach((pipe: any) => {
    pipe.body.setVelocity(0, 0);
  });
  
  // Texto de fin de juego
  this.add.text(400, 300, 'FIN DEL JUEGO', {
    fontSize: '48px',
    fontFamily: 'Arial',
    color: '#FF0000',
    stroke: '#000000',
    strokeThickness: 4
  }).setOrigin(0.5);
  
  const { level } = getDifficultyParams();
  const totalScore = score + coinPoints;
  this.add.text(400, 340, `Tuberías: ${score} | Monedas: ${coinScore} (${coinPoints})`, {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#FFFFFF',
    stroke: '#000000',
    strokeThickness: 2
  }).setOrigin(0.5);
  
  this.add.text(400, 365, `Total: ${totalScore}`, {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#FFD700',
    stroke: '#000000',
    strokeThickness: 3
  }).setOrigin(0.5);
  
  this.add.text(400, 400, 'CLIC o ESPACIO para reiniciar', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#FFFF00',
    stroke: '#000000',
    strokeThickness: 2
  }).setOrigin(0.5);
  
  // Save high score (using total score)
  const highScore = parseInt(localStorage.getItem('flappyHighScore') || '0');
  const bestMultStored = parseFloat(localStorage.getItem('flappyBestMultiplier') || '1');
  if (bestMultiplier > bestMultStored) {
    localStorage.setItem('flappyBestMultiplier', bestMultiplier.toFixed(2));
  }
  if (totalScore > highScore) {
    localStorage.setItem('flappyHighScore', totalScore.toString());
  this.add.text(400, 420, '¡NUEVO RÉCORD!', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#00FF00',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
  } else {
  this.add.text(400, 420, `Mejor: ${highScore}`, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#CCCCCC',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
  }
  const bestMult = parseFloat(localStorage.getItem('flappyBestMultiplier') || bestMultiplier.toFixed(2));
  this.add.text(400, 445, `Mejor Mult: ${bestMult.toFixed(2)}x`, {
    fontSize: '18px',
    fontFamily: 'Arial',
    color: '#FFA500',
    stroke: '#000000',
    strokeThickness: 3
  }).setOrigin(0.5);
}

function updateMarioBrosParallax() {
  // Nubes (parallax)
  clouds.children.entries.forEach((cloud: any) => {
    cloud.x -= 0.5;
    // Reset cloud position when it goes off screen
    if (cloud.x < -100) {
      cloud.x = 900;
      cloud.y = Phaser.Math.Between(50, 200);
    }
  });
  
  // Pinos más lentos (capa trasera)
  hills.children.entries.forEach((hill: any) => {
    hill.x -= 0.25 * (1 / (hill.scale || 1));
    // Reset hill position when it goes off screen
    if (hill.x < -200) {
      hill.x = 1000;
    }
  });
}

function update(this: Phaser.Scene, time: number, delta: number) {
  if (gameOver) return;
  
  // Scroll ground
  ground.tilePositionX += 2;
  
  // Mario Bros parallax scrolling
  updateMarioBrosParallax();

  // Ciclo día-noche (90s ciclo completo)
  dayCycleTime += delta;
  const cycle = (dayCycleTime / 90000) % 1; // 0..1
  dayCycleProgress = cycle;
  // Interpolamos entre mañana (azul claro) -> tarde (naranja) -> noche (azul oscuro) -> amanecer
  function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
  let r: number, g: number, bC: number;
  if (cycle < 0.33) { // mañana -> tarde
    const t = cycle / 0.33;
    r = lerp(0x5C, 0xFF, t);
    g = lerp(0x94, 0x99, t);
    bC = lerp(0xFC, 0x55, t);
  } else if (cycle < 0.66) { // tarde -> noche
    const t = (cycle - 0.33) / 0.33;
    r = lerp(0xFF, 0x08, t);
    g = lerp(0x99, 0x10, t);
    bC = lerp(0x55, 0x40, t);
  } else { // noche -> mañana
    const t = (cycle - 0.66) / 0.34;
    r = lerp(0x08, 0x5C, t);
    g = lerp(0x10, 0x94, t);
    bC = lerp(0x40, 0xFC, t);
  }
  const bgColor = ((r & 0xFF) << 16) + ((g & 0xFF) << 8) + (bC & 0xFF);
  this.cameras.main.setBackgroundColor(bgColor);
  // Tint leve al pez según momento del día (más cálido al atardecer)
  bird.setTint(bgColor + 0x202020);
  birdGlow.x = bird.x;
  birdGlow.y = bird.y;
  // Intensidad del glow basada en multiplicador (>2x empieza)
  const mult = getCurrentMultiplier();
  const targetGlow = mult > 2 ? Math.min(1, (mult - 2) / 1.5) : 0;
  birdGlow.setAlpha(Phaser.Math.Linear(birdGlow.alpha, targetGlow, 0.1));

  // Estrellas: visibles sólo en la parte nocturna (cycle >= 0.5)
  const nightFactor = cycle < 0.5 ? 0 : (cycle - 0.5) / 0.5; // 0 a 1
  stars.children.entries.forEach((s: any, idx: number) => {
    const baseAlpha = s.data?.get('baseAlpha') || s.alpha || 1;
    if (!s.data) s.setDataEnabled();
    if (!s.data.has('baseAlpha')) s.data.set('baseAlpha', baseAlpha);
    s.alpha = baseAlpha * nightFactor * (0.6 + Math.sin(time * 0.001 + idx) * 0.4);
  });
  
  if (!gameStarted) return;
  
  // Cheep Cheep rotation and animation
  const birdBody = bird.body as Phaser.Physics.Arcade.Body | null;
  if (birdBody && birdBody.velocity.y > 0) {
    // Falling - rotate down slightly (Mario style)
    bird.setRotation(Math.min(0.3, birdBody.velocity.y * 0.001));
  } else {
    // Rising - slight upward angle
    bird.setRotation(-0.2);
  }
  
  // Handle flapping animation
  const flapTimer = bird.getData('flapTimer');
  if (flapTimer > 0) {
    bird.setData('flapTimer', flapTimer - delta);
    // Oscillate scale for flapping effect
    const flapPhase = Math.sin((200 - flapTimer) * 0.05);
    bird.setScale(1.0 + flapPhase * 0.1, 1.0 - flapPhase * 0.05);
  } else {
    // Return to normal scale
    bird.setScale(1.0, 1.0);
    bird.setData('isFlapping', false);
  }
  
  // Check bounds
  if (bird.y > 600 || bird.y < -50) {
    handleGameOver.call(this);
    return;
  }
  
  // Generate pipes
  pipeTimer += delta;
  const { spawnInterval, pipeSpeed } = getDifficultyParams();
  if (pipeTimer > spawnInterval) {
    generatePipe.call(this);
    pipeTimer = 0;
  }

  // Detectar subida de nivel
  const { level } = getDifficultyParams();
  if (level !== previousLevel) {
    flashLevelUp(this, level);
    previousLevel = level;
  }
  
  // Update coins animation
  coins.children.entries.forEach((coin: any) => {
    if (coin.body) {
      // Ensure coins don't fall
      coin.body.setVelocityY(0);
      const { pipeSpeed } = getDifficultyParams();
      if (Math.abs(coin.body.velocity.x - pipeSpeed) > 10) {
        coin.body.setVelocityX(pipeSpeed);
      }
      
      // Rotate coin for classic Mario effect
      const rotSpeed = coin.getData('rotationSpeed') || 0.1;
      coin.rotation += rotSpeed;
      
      // Slight floating animation
      coin.y += Math.sin(time * 0.005) * 0.5;
    }
    
    // Remove off-screen coins
    if (coin.x < -50) {
      coin.destroy();
    }
  });
  
  // Update pipes and scoring
  pipes.children.entries.forEach((pipe: any) => {
    // Ensure pipes don't fall
    if (pipe.body) {
      pipe.body.setVelocityY(0);
      const { pipeSpeed } = getDifficultyParams();
      if (Math.abs(pipe.body.velocity.x - pipeSpeed) > 10) {
        pipe.body.setVelocityX(pipeSpeed);
      }
    }
    
    // Remove off-screen pipes
    if (pipe.x < -100) {
      pipe.destroy();
      return;
    }
    
    // Score when bird passes pipe
    if (!pipe.getData('scored') && pipe.x < bird.x) {
      pipe.setData('scored', true);
      if (pipe.flipY) { // Only count top pipe
  score++;
  scoreText.setText(formatScoreLine());
        if (score === 1 && instructionText) {
          instructionText.destroy();
          instructionText = undefined;
        }
  playTone(this as any, 880, 150, 'sawtooth');
        console.log('🎯 Score:', score);
      }
    }
  });
}

// Initialize the game
const game = new Phaser.Game(config);

// Expose simple API for UI header controls
(window as any).flappyAPI = {
  restart() {
    try {
      const scene = game.scene.getScene('default');
      scene.scene.restart();
    } catch (e) {
      console.warn('No se pudo reiniciar la escena:', e);
    }
  },
  toggleMute() {
    mute = !mute;
    return mute;
  },
  getHighScore() {
    return parseInt(localStorage.getItem('flappyHighScore') || '0');
  },
  getBestMultiplier() {
    return parseFloat(localStorage.getItem('flappyBestMultiplier') || '1');
  },
  getCycle() {
    return dayCycleProgress;
  },
  getCurrentScore() {
    return score + coinPoints;
  },
  getCurrentMultiplier() {
    return getCurrentMultiplier();
  }
};

// Global error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

export default game;