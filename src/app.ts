import 'phaser';

// Game configuration with multiple scenes
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#000000', // Black for terminal
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [MenuScene, GameScene]
};

// Mario Bros audio system
let audioContext: AudioContext;
let audioEnabled = true;

// Mario Bros configuration
const marioConfig = {
  coinSpawnRate: 0.35,
  coinValue: 10,
  cheepCheepJumpForce: -320,
  gravity: 800,
  parallaxCloudSpeed: 0.5,
  parallaxHillSpeed: 0.2
};

// Audio Functions
function initAudio() {
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioEnabled = true;
    console.log('Audio system initialized');
  } catch (error) {
    console.warn('Audio not supported:', error);
    audioEnabled = false;
  }
}

function resumeAudioContext() {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().then(() => {
      console.log('Audio context resumed');
    }).catch((error) => {
      console.warn('Failed to resume audio context:', error);
    });
  }
}

function playMarioJumpSound() {
  if (!audioEnabled || !audioContext || audioContext.state !== 'running') return;
  
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(330, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.type = 'square';
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    console.warn('Failed to play jump sound:', error);
  }
}

function playMarioCoinSound() {
  if (!audioEnabled || !audioContext || audioContext.state !== 'running') return;
  
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(988, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1319, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.type = 'square';
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.warn('Failed to play coin sound:', error);
  }
}

function playMarioHitSound() {
  if (!audioEnabled || !audioContext || audioContext.state !== 'running') return;
  
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(55, audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.type = 'sawtooth';
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.warn('Failed to play hit sound:', error);
  }
}

function playMarioScoreSound() {
  if (!audioEnabled || !audioContext || audioContext.state !== 'running') return;
  
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.type = 'square';
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.warn('Failed to play score sound:', error);
  }
}

// MENU SCENE - Terminal Simulation
class MenuScene extends Phaser.Scene {
  private terminalText!: Phaser.GameObjects.Text;
  private currentLine = 0;
  private isTyping = false;
  private currentCommand = '';
  private commandIndex = 0;
  private canStart = false;

  private terminalCommands = [
    { delay: 1000, text: 'skillparty@debian:~$ cd super-cheep-cheep', color: '#00FF00' },
    { delay: 800, text: 'skillparty@debian:~/super-cheep-cheep$ ls -la', color: '#00FF00' },
    { delay: 1200, text: 'total 42', color: '#CCCCCC' },
    { delay: 300, text: 'drwxr-xr-x 3 skillparty skillparty 4096 Dec 15 23:45 .', color: '#CCCCCC' },
    { delay: 300, text: 'drwxr-xr-x 5 skillparty skillparty 4096 Dec 15 23:40 ..', color: '#CCCCCC' },
    { delay: 300, text: '-rwxr-xr-x 1 skillparty skillparty 8192 Dec 15 23:45 cheep-cheep-game', color: '#00FF00' },
    { delay: 300, text: '-rw-r--r-- 1 skillparty skillparty 1024 Dec 15 23:42 README.md', color: '#CCCCCC' },
    { delay: 300, text: '-rw-r--r-- 1 skillparty skillparty  256 Dec 15 23:41 high-scores.dat', color: '#CCCCCC' },
    { delay: 1000, text: 'skillparty@debian:~/super-cheep-cheep$ ./cheep-cheep-game --mario-mode', color: '#00FF00' },
    { delay: 800, text: 'Loading Super Cheep Cheep - Mario Bros Edition...', color: '#FFFF00' },
    { delay: 600, text: 'Initializing Phaser 3 engine... [████████████████████] 100%', color: '#00FFFF' },
    { delay: 400, text: 'Loading Mario Bros assets... [████████████████████] 100%', color: '#00FFFF' },
    { delay: 400, text: 'Initializing audio system... [████████████████████] 100%', color: '#00FFFF' },
    { delay: 600, text: 'Game initialized successfully!', color: '#00FF00' },
    { delay: 800, text: '', color: '#00FF00' },
    { delay: 500, text: 'Press SPACE or CLICK to start the game...', color: '#FFFF00' }
  ];

  constructor() {
    super({ key: 'MenuScene' });
  }

  preload() {
    console.log('Loading terminal menu...');
    
    // Initialize audio
    initAudio();
    
    // Hide loading indicator
    const loadingElement = document.getElementById('loading-indicator');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }

  create() {
    console.log('Creating terminal menu...');
    
    // Create terminal background
    this.add.rectangle(400, 300, 800, 600, 0x000000);
    
    // Terminal cursor
    const cursor = this.add.text(20, 50, '█', {
      fontSize: '16px',
      fontFamily: 'JetBrains Mono, monospace',
      color: '#00FF00'
    });
    
    // Blinking cursor animation
    this.tweens.add({
      targets: cursor,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Power2'
    });
    
    // Terminal text container
    this.terminalText = this.add.text(20, 80, '', {
      fontSize: '14px',
      fontFamily: 'JetBrains Mono, monospace',
      color: '#00FF00',
      lineSpacing: 4
    });
    
    // Start typing animation
    this.time.delayedCall(500, () => {
      this.startTypingAnimation();
    });
    
    // Setup input to start game
    this.input.on('pointerdown', () => {
      if (this.canStart) {
        this.startGame();
      }
    });
    
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.canStart) {
        this.startGame();
      }
    });
  }

  startTypingAnimation() {
    if (this.currentLine >= this.terminalCommands.length) {
      this.canStart = true;
      return;
    }
    
    const command = this.terminalCommands[this.currentLine];
    this.isTyping = true;
    this.currentCommand = '';
    this.commandIndex = 0;
    
    // Type character by character
    const typeNextChar = () => {
      if (this.commandIndex < command.text.length) {
        this.currentCommand += command.text[this.commandIndex];
        this.commandIndex++;
        
        // Update terminal display
        this.updateTerminalDisplay();
        
        // Continue typing
        this.time.delayedCall(50, typeNextChar);
      } else {
        // Finished typing this line
        this.isTyping = false;
        this.currentLine++;
        
        // Start next line after delay
        if (this.currentLine < this.terminalCommands.length) {
          this.time.delayedCall(command.delay, () => {
            this.startTypingAnimation();
          });
        } else {
          this.canStart = true;
        }
      }
    };
    
    typeNextChar();
  }

  updateTerminalDisplay() {
    let displayText = '';
    
    // Add completed lines
    for (let i = 0; i < this.currentLine; i++) {
      displayText += this.terminalCommands[i].text + '\n';
    }
    
    // Add current typing line
    if (this.isTyping) {
      displayText += this.currentCommand + '█';
    } else if (this.currentLine < this.terminalCommands.length) {
      displayText += this.currentCommand;
    }
    
    this.terminalText.setText(displayText);
  }

  startGame() {
    console.log('Starting game...');
    
    // Resume audio context
    resumeAudioContext();
    
    // Fade out terminal
    this.tweens.add({
      targets: [this.terminalText, this.children.list],
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        // Switch to game scene
        this.scene.start('GameScene');
      }
    });
  }
}

// GAME SCENE - Mario Bros Flappy Bird
class GameScene extends Phaser.Scene {
  // Game variables
  private bird!: Phaser.Physics.Arcade.Sprite;
  private pipes!: Phaser.Physics.Arcade.Group;
  private ground!: Phaser.GameObjects.TileSprite;
  private scoreText!: Phaser.GameObjects.Text;
  private score = 0;
  private gameOver = false;
  private gameStarted = false;
  private pipeTimer = 0;

  // Mario Bros elements
  private clouds!: Phaser.GameObjects.Group;
  private hills!: Phaser.GameObjects.Group;
  private coins!: Phaser.Physics.Arcade.Group;
  private coinScore = 0;

  // Performance monitoring
  private fpsText!: Phaser.GameObjects.Text;
  private lastTime = 0;
  private frameCount = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    console.log('Loading game assets...');
    
    // Create sprites using graphics
    const graphics = this.add.graphics();
    
    // Cheep Cheep - Mario Bros style fish
    graphics.fillStyle(0xFF4444);
    graphics.fillEllipse(17, 12, 30, 20);
    graphics.fillStyle(0xFFFFDD);
    graphics.fillEllipse(17, 14, 20, 12);
    graphics.fillStyle(0x000000);
    graphics.fillCircle(22, 10, 4);
    graphics.fillStyle(0xFFFFFF);
    graphics.fillCircle(23, 9, 2);
    graphics.fillStyle(0xCC2222);
    graphics.fillTriangle(8, 8, 2, 4, 8, 12);
    graphics.fillTriangle(8, 16, 2, 20, 8, 12);
    graphics.fillTriangle(2, 8, 2, 16, -4, 12);
    graphics.generateTexture('cheepCheep', 34, 24);
    
    // Pipe - Green rectangle
    graphics.clear();
    graphics.fillStyle(0x228B22);
    graphics.fillRect(0, 0, 60, 400);
    graphics.fillStyle(0x32CD32);
    graphics.fillRect(5, 0, 50, 400);
    graphics.generateTexture('pipe', 60, 400);
    
    // Ground - Mario Bros style
    graphics.clear();
    graphics.fillStyle(0x228B22);
    graphics.fillRect(0, 0, 800, 40);
    graphics.fillStyle(0x8B4513);
    graphics.fillRect(0, 40, 800, 20);
    graphics.generateTexture('ground', 800, 60);
    
    // Mario Bros Cloud
    graphics.clear();
    graphics.fillStyle(0xFFFFFF);
    graphics.fillRect(8, 12, 48, 16);
    graphics.fillRect(4, 16, 56, 8);
    graphics.fillRect(0, 20, 64, 8);
    graphics.fillRect(16, 8, 16, 4);
    graphics.fillRect(32, 4, 16, 8);
    graphics.generateTexture('cloud', 64, 32);
    
    // Mario Bros Hill with Trees
    graphics.clear();
    graphics.fillStyle(0x00AA00);
    graphics.fillRect(20, 60, 120, 20);
    graphics.fillRect(40, 40, 80, 20);
    graphics.fillRect(60, 20, 40, 20);
    graphics.fillRect(70, 10, 20, 10);
    graphics.fillStyle(0x8B4513);
    graphics.fillRect(45, 35, 8, 25);
    graphics.fillRect(75, 25, 8, 35);
    graphics.fillRect(105, 30, 8, 30);
    graphics.fillStyle(0x228B22);
    graphics.fillRect(40, 25, 18, 15);
    graphics.fillRect(70, 15, 18, 15);
    graphics.fillRect(100, 20, 18, 15);
    graphics.generateTexture('hill', 160, 80);
    
    // Mario Bros Coin
    graphics.clear();
    graphics.fillStyle(0xFFD700);
    graphics.fillRect(4, 2, 16, 20);
    graphics.fillRect(2, 4, 20, 16);
    graphics.fillRect(6, 0, 12, 24);
    graphics.fillStyle(0xFFFF99);
    graphics.fillRect(8, 4, 8, 16);
    graphics.fillRect(6, 6, 12, 12);
    graphics.fillStyle(0xCC9900);
    graphics.fillRect(16, 4, 4, 16);
    graphics.fillRect(14, 2, 6, 20);
    graphics.generateTexture('coin', 24, 24);
    
    graphics.destroy();
  }

  create() {
    console.log('Creating game world...');
    
    // Change background to Mario Bros sky
    this.cameras.main.setBackgroundColor('#5C94FC');
    
    // Reset game state
    this.score = 0;
    this.coinScore = 0;
    this.gameOver = false;
    this.gameStarted = false;
    this.pipeTimer = 0;
    
    // Create Mario Bros background
    this.createMarioBrosBackground();
    
    // Create ground
    this.ground = this.add.tileSprite(0, 540, 800, 60, 'ground');
    this.ground.setOrigin(0, 0);
    
    // Create ground physics
    const groundBody = this.physics.add.staticGroup();
    const groundCollider = groundBody.create(400, 570, null);
    groundCollider.setSize(800, 60);
    groundCollider.setVisible(false);
    
    // Create Cheep Cheep
    this.bird = this.physics.add.sprite(150, 300, 'cheepCheep');
    this.bird.setScale(1.0);
    this.bird.body.setSize(30, 20);
    this.bird.setCollideWorldBounds(false);
    this.bird.setData('isFlapping', false);
    this.bird.setData('flapTimer', 0);
    
    // Create pipes and coins groups
    this.pipes = this.physics.add.group();
    this.coins = this.physics.add.group();
    
    // Create UI
    this.scoreText = this.add.text(400, 50, `Score: ${this.score} | Coins: ${this.coinScore}`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.scoreText.setOrigin(0.5);
    
    // Instructions
    const instructionText = this.add.text(400, 200, 
      'CLICK or SPACE to swim up!\nCollect coins and avoid pipes!', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center'
    });
    instructionText.setOrigin(0.5);
    
    // Audio indicator
    const audioIndicator = this.add.text(750, 50, audioEnabled ? 'AUDIO: ON' : 'AUDIO: OFF', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: audioEnabled ? '#00FF00' : '#FF0000',
      stroke: '#000000',
      strokeThickness: 2
    });
    audioIndicator.setOrigin(1, 0);
    
    this.add.text(750, 70, 'Press M to toggle', {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#CCCCCC',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(1, 0);
    
    // FPS counter
    this.fpsText = this.add.text(10, 10, 'FPS: --', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 1
    });
    
    // Setup collisions
    this.physics.add.overlap(this.bird, groundBody, this.handleGameOver, undefined, this);
    this.physics.add.overlap(this.bird, this.pipes, this.handleGameOver, undefined, this);
    this.physics.add.overlap(this.bird, this.coins, this.collectCoin, undefined, this);
    
    // Setup input
    this.input.on('pointerdown', this.handleInput, this);
    this.input.keyboard?.on('keydown-SPACE', this.handleInput, this);
    this.input.keyboard?.on('keydown-M', this.toggleAudio, this);
    
    console.log('Game world ready!');
  }

  createMarioBrosBackground() {
    // Create hills (back layer)
    this.hills = this.add.group();
    for (let i = 0; i < 6; i++) {
      const hill = this.add.image(i * 200 - 100, 480, 'hill');
      hill.setOrigin(0.5, 1);
      hill.setScale(0.8);
      hill.setAlpha(0.7);
      this.hills.add(hill);
    }
    
    // Create clouds (middle layer)
    this.clouds = this.add.group();
    for (let i = 0; i < 8; i++) {
      const cloud = this.add.image(
        Phaser.Math.Between(0, 1000), 
        Phaser.Math.Between(50, 200), 
        'cloud'
      );
      cloud.setScale(Phaser.Math.FloatBetween(0.5, 1.0));
      cloud.setAlpha(0.8);
      this.clouds.add(cloud);
    }
  }

  toggleAudio() {
    audioEnabled = !audioEnabled;
    console.log('Audio toggled:', audioEnabled ? 'ON' : 'OFF');
  }

  handleInput() {
    resumeAudioContext();
    
    if (this.gameOver) {
      this.scene.restart();
      return;
    }
    
    if (!this.gameStarted) {
      this.gameStarted = true;
      console.log('Game started!');
    }
    
    this.bird.setVelocityY(-320);
    playMarioJumpSound();
    
    this.bird.setData('isFlapping', true);
    this.bird.setData('flapTimer', 200);
    
    this.tweens.add({
      targets: this.bird,
      scaleX: 1.1,
      scaleY: 0.9,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });
  }

  collectCoin(cheepCheep: any, coin: any) {
    playMarioCoinSound();
    
    // Particle effect
    for (let i = 0; i < 5; i++) {
      const particle = this.add.circle(coin.x, coin.y, 2, 0xFFD700);
      this.tweens.add({
        targets: particle,
        x: coin.x + Phaser.Math.Between(-30, 30),
        y: coin.y + Phaser.Math.Between(-30, 30),
        alpha: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
    
    this.tweens.add({
      targets: coin,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        coin.destroy();
      }
    });
    
    this.coinScore++;
    const totalScore = this.score + (this.coinScore * marioConfig.coinValue);
    this.scoreText.setText(`Score: ${this.score} | Coins: ${this.coinScore} | Total: ${totalScore}`);
  }

  generatePipe() {
    if (this.gameOver) return;
    
    const gapSize = 180;
    const minY = 150;
    const maxY = 400;
    const gapY = Phaser.Math.Between(minY, maxY);
    
    const topPipe = this.pipes.create(850, gapY - gapSize/2, 'pipe');
    topPipe.setOrigin(0.5, 1);
    topPipe.setFlipY(true);
    topPipe.body.setImmovable(true);
    topPipe.body.setVelocityX(-200);
    topPipe.body.setVelocityY(0);
    topPipe.body.setGravityY(-800);
    topPipe.setData('scored', false);
    
    const bottomPipe = this.pipes.create(850, gapY + gapSize/2, 'pipe');
    bottomPipe.setOrigin(0.5, 0);
    bottomPipe.body.setImmovable(true);
    bottomPipe.body.setVelocityX(-200);
    bottomPipe.body.setVelocityY(0);
    bottomPipe.body.setGravityY(-800);
    bottomPipe.setData('scored', false);
    
    if (Math.random() < marioConfig.coinSpawnRate) {
      const coin = this.coins.create(850, gapY, 'coin');
      coin.setScale(0.8);
      coin.body.setVelocityX(-200);
      coin.body.setVelocityY(0);
      coin.body.setGravityY(-800);
      coin.setData('rotationSpeed', 0.1);
    }
  }

  handleGameOver() {
    if (this.gameOver) return;
    
    this.gameOver = true;
    playMarioHitSound();
    
    this.bird.setVelocity(0, 0);
    
    this.pipes.children.entries.forEach((pipe: any) => {
      pipe.body.setVelocity(0, 0);
    });
    
    this.add.text(400, 300, 'GAME OVER', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#FF0000',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    const totalScore = this.score + (this.coinScore * marioConfig.coinValue);
    this.add.text(400, 340, `Pipes: ${this.score} | Coins: ${this.coinScore}`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    this.add.text(400, 365, `Total Score: ${totalScore}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    this.add.text(400, 400, 'CLICK or SPACE to restart', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#FFFF00',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    const highScore = parseInt(localStorage.getItem('flappyHighScore') || '0');
    if (totalScore > highScore) {
      localStorage.setItem('flappyHighScore', totalScore.toString());
      this.add.text(400, 420, 'NEW HIGH SCORE!', {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#00FF00',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);
    }
  }

  updateMarioBrosParallax() {
    this.clouds.children.entries.forEach((cloud: any) => {
      cloud.x -= marioConfig.parallaxCloudSpeed;
      if (cloud.x < -100) {
        cloud.x = 900;
        cloud.y = Phaser.Math.Between(50, 200);
      }
    });
    
    this.hills.children.entries.forEach((hill: any) => {
      hill.x -= marioConfig.parallaxHillSpeed;
      if (hill.x < -200) {
        hill.x = 1000;
      }
    });
  }

  update(time: number, delta: number) {
    if (this.gameOver) return;
    
    // FPS monitoring
    this.frameCount++;
    if (time - this.lastTime >= 1000) {
      const fps = Math.round(this.frameCount * 1000 / (time - this.lastTime));
      this.fpsText.setText(`FPS: ${fps}`);
      this.fpsText.setColor(fps >= 55 ? '#00FF00' : fps >= 30 ? '#FFFF00' : '#FF0000');
      this.frameCount = 0;
      this.lastTime = time;
    }
    
    // Scroll ground
    this.ground.tilePositionX += 2;
    this.updateMarioBrosParallax();
    
    if (!this.gameStarted) return;
    
    // Bird rotation
    if (this.bird.body.velocity.y > 0) {
      this.bird.setRotation(Math.min(0.3, this.bird.body.velocity.y * 0.001));
    } else {
      this.bird.setRotation(-0.2);
    }
    
    // Flapping animation
    const flapTimer = this.bird.getData('flapTimer');
    if (flapTimer > 0) {
      this.bird.setData('flapTimer', flapTimer - delta);
      const flapPhase = Math.sin((200 - flapTimer) * 0.05);
      this.bird.setScale(1.0 + flapPhase * 0.1, 1.0 - flapPhase * 0.05);
    } else {
      this.bird.setScale(1.0, 1.0);
    }
    
    // Check bounds
    if (this.bird.y > 600 || this.bird.y < -50) {
      this.handleGameOver();
      return;
    }
    
    // Generate pipes
    this.pipeTimer += delta;
    if (this.pipeTimer > 1800) {
      this.generatePipe();
      this.pipeTimer = 0;
    }
    
    // Update coins
    this.coins.children.entries.forEach((coin: any) => {
      if (coin.body) {
        coin.body.setVelocityY(0);
        if (Math.abs(coin.body.velocity.x + 200) > 10) {
          coin.body.setVelocityX(-200);
        }
        
        const rotSpeed = coin.getData('rotationSpeed') || 0.1;
        coin.rotation += rotSpeed;
        coin.y += Math.sin(time * 0.005) * 0.5;
      }
      
      if (coin.x < -50) {
        coin.destroy();
      }
    });
    
    // Update pipes and scoring
    this.pipes.children.entries.forEach((pipe: any) => {
      if (pipe.body) {
        pipe.body.setVelocityY(0);
        if (Math.abs(pipe.body.velocity.x + 200) > 10) {
          pipe.body.setVelocityX(-200);
        }
      }
      
      if (pipe.x < -100) {
        pipe.destroy();
        return;
      }
      
      if (!pipe.getData('scored') && pipe.x < this.bird.x) {
        pipe.setData('scored', true);
        if (pipe.flipY) {
          this.score++;
          const totalScore = this.score + (this.coinScore * marioConfig.coinValue);
          this.scoreText.setText(`Score: ${this.score} | Coins: ${this.coinScore} | Total: ${totalScore}`);
          
          playMarioScoreSound();
        }
      }
    });
  }
}

// Initialize the game
const game = new Phaser.Game(config);

// Global error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

export default game;