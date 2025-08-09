import 'phaser';

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
      gravity: { y: 1000 },
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
let score = 0;
let gameOver = false;
let gameStarted = false;
let pipeTimer = 0;

// Mario Bros background elements
let clouds: Phaser.GameObjects.Group;
let hills: Phaser.GameObjects.Group;

// Mario Bros coins system
let coins: Phaser.Physics.Arcade.Group;
let coinScore = 0;

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
  
  // Mario Bros Hill - Green pixelated
  graphics.clear();
  graphics.fillStyle(0x00AA00);
  // Hill shape (pixelated)
  graphics.fillRect(20, 60, 120, 20);
  graphics.fillRect(40, 40, 80, 20);
  graphics.fillRect(60, 20, 40, 20);
  graphics.fillRect(70, 10, 20, 10);
  graphics.generateTexture('hill', 160, 80);
  
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
  
  graphics.destroy();
}

function createMarioBrosBackground(this: Phaser.Scene) {
  // Create hills (back layer)
  hills = this.add.group();
  for (let i = 0; i < 6; i++) {
    const hill = this.add.image(i * 200 - 100, 480, 'hill');
    hill.setOrigin(0.5, 1);
    hill.setScale(0.8);
    hill.setAlpha(0.7);
    hills.add(hill);
  }
  
  // Create clouds (middle layer)
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
  gameOver = false;
  gameStarted = false;
  pipeTimer = 0;
  
  // Create Mario Bros background
  createMarioBrosBackground.call(this);
  
  // Create ground
  ground = this.add.tileSprite(0, 540, 800, 60, 'ground');
  ground.setOrigin(0, 0);
  
  // Create ground physics (invisible)
  const groundBody = this.physics.add.staticGroup();
  const groundCollider = groundBody.create(400, 570, null);
  groundCollider.setSize(800, 60);
  groundCollider.setVisible(false);
  
  // Create Cheep Cheep
  bird = this.physics.add.sprite(150, 300, 'cheepCheep');
  bird.setScale(1.0);
  bird.body.setSize(30, 20);
  bird.setCollideWorldBounds(false);
  
  // Add swimming animation data
  bird.setData('isFlapping', false);
  bird.setData('flapTimer', 0);
  
  // Create pipes group
  pipes = this.physics.add.group();
  
  // Create coins group
  coins = this.physics.add.group();
  
  // Create UI
  scoreText = this.add.text(400, 50, `Score: ${score} | Coins: ${coinScore}`, {
    fontSize: '28px',
    fontFamily: 'Arial',
    color: '#FFFFFF',
    stroke: '#000000',
    strokeThickness: 4
  });
  scoreText.setOrigin(0.5);
  
  // Instructions
  const instructionText = this.add.text(400, 200, 
    'CLICK or SPACE to swim up!\nHelp Cheep Cheep avoid the pipes!', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#FFFFFF',
    stroke: '#000000',
    strokeThickness: 3,
    align: 'center'
  });
  instructionText.setOrigin(0.5);
  
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
  
  // Trigger flapping animation
  bird.setData('isFlapping', true);
  bird.setData('flapTimer', 200); // Flap for 200ms
  
  // Scale animation for flapping effect
  bird.setScale(1.1, 0.9);
  
  console.log('🐟 Cheep Cheep jumps!');
}

function collectCoin(cheepCheep: any, coin: any) {
  // Remove coin with sparkle effect
  coin.setScale(1.2);
  coin.setAlpha(0.7);
  
  // Add coin score
  coinScore++;
  const totalScore = score + (coinScore * 10);
  scoreText.setText(`Score: ${score} | Coins: ${coinScore} | Total: ${totalScore}`);
  
  // Destroy coin
  coin.destroy();
  
  console.log('💰 Coin collected! +10 points');
}

function generatePipe(this: Phaser.Scene) {
  if (gameOver) return;
  
  const gapSize = 180;
  const minY = 150;
  const maxY = 400;
  const gapY = Phaser.Math.Between(minY, maxY);
  
  // Top pipe
  const topPipe = pipes.create(850, gapY - gapSize/2, 'pipe');
  topPipe.setOrigin(0.5, 1);
  topPipe.setFlipY(true);
  topPipe.body.setImmovable(true);
  topPipe.body.setVelocityX(-200);
  topPipe.body.setVelocityY(0);
  topPipe.body.setGravityY(-1000); // Cancel gravity
  topPipe.setData('scored', false);
  
  // Bottom pipe
  const bottomPipe = pipes.create(850, gapY + gapSize/2, 'pipe');
  bottomPipe.setOrigin(0.5, 0);
  bottomPipe.body.setImmovable(true);
  bottomPipe.body.setVelocityX(-200);
  bottomPipe.body.setVelocityY(0);
  bottomPipe.body.setGravityY(-1000); // Cancel gravity
  bottomPipe.setData('scored', false);
  
  // 40% chance to spawn a coin between pipes
  if (Math.random() < 0.4) {
    const coin = coins.create(850, gapY, 'coin');
    coin.setScale(0.8);
    coin.body.setVelocityX(-200);
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
  
  // Stop bird
  bird.setVelocity(0, 0);
  
  // Stop all pipes
  pipes.children.entries.forEach((pipe: any) => {
    pipe.body.setVelocity(0, 0);
  });
  
  // Show game over text
  this.add.text(400, 300, 'GAME OVER', {
    fontSize: '48px',
    fontFamily: 'Arial',
    color: '#FF0000',
    stroke: '#000000',
    strokeThickness: 4
  }).setOrigin(0.5);
  
  const totalScore = score + (coinScore * 10);
  this.add.text(400, 340, `Pipes: ${score} | Coins: ${coinScore}`, {
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
  
  // Save high score (using total score)
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
  } else {
    this.add.text(400, 420, `Best: ${highScore}`, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#CCCCCC',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
  }
}

function updateMarioBrosParallax() {
  // Move clouds slowly (parallax effect)
  clouds.children.entries.forEach((cloud: any) => {
    cloud.x -= 0.5;
    // Reset cloud position when it goes off screen
    if (cloud.x < -100) {
      cloud.x = 900;
      cloud.y = Phaser.Math.Between(50, 200);
    }
  });
  
  // Move hills very slowly (background layer)
  hills.children.entries.forEach((hill: any) => {
    hill.x -= 0.2;
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
  
  if (!gameStarted) return;
  
  // Cheep Cheep rotation and animation
  if (bird.body.velocity.y > 0) {
    // Falling - rotate down slightly (Mario style)
    bird.setRotation(Math.min(0.3, bird.body.velocity.y * 0.001));
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
  if (pipeTimer > 1800) {
    generatePipe.call(this);
    pipeTimer = 0;
  }
  
  // Update coins animation
  coins.children.entries.forEach((coin: any) => {
    if (coin.body) {
      // Ensure coins don't fall
      coin.body.setVelocityY(0);
      if (Math.abs(coin.body.velocity.x + 200) > 10) {
        coin.body.setVelocityX(-200);
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
      if (Math.abs(pipe.body.velocity.x + 200) > 10) {
        pipe.body.setVelocityX(-200);
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
        scoreText.setText(`Score: ${score}`);
        console.log('🎯 Score:', score);
      }
    }
  });
}

// Initialize the game
const game = new Phaser.Game(config);

// Global error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

export default game;