import 'phaser';
import Bird from '../components/Bird';
import PipeManager from '../components/PipeManager';
import DifficultyManager from '../managers/DifficultyManager';
import SkinManager from '../managers/SkinManager';
import { BirdState } from '../types/GameTypes';

export default class Game extends Phaser.Scene {
  // Core game objects
  private bird!: Bird;
  private pipeManager!: PipeManager;
  private ground!: Phaser.GameObjects.TileSprite;
  private background!: Phaser.GameObjects.Image;
  private clouds!: Phaser.Physics.Arcade.Group;
  
  // UI elements
  private scoreText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;
  
  // Game state
  private score: number = 0;
  private gameStarted: boolean = false;
  private gameOver: boolean = false;
  private lastPipeSpawnScoreCheck: number = 0;
  private highContrastOutline: boolean = false;

  constructor() {
    super('Game');
  }

  create() {
    console.log('🎮 Game scene: Initializing stable game world...');
    
    // Reset game state
    this.resetGameState();
    
    // Create stable game world
    this.createBackground();
    this.createClouds();
    this.createGround();
    this.createBird();
  this.createPipeManager();
    
    // Setup UI
    this.createUI();
    
    // Setup physics and collisions
  this.setupPhysics();
    
    // Setup input
    this.setupInput();
    
    console.log('✅ Game world created successfully');
  }

  private resetGameState(): void {
    this.score = 0;
    this.gameStarted = false;
    this.gameOver = false;
  }

  private createBackground(): void {
    // Static sky background
    this.background = this.add.image(400, 300, 'background');
    this.background.setDisplaySize(800, 600);
    this.background.setDepth(-10);
  }

  private createClouds(): void {
    // Create cloud group for parallax effect
    this.clouds = this.physics.add.group();
    
    // Add some initial clouds
    for (let i = 0; i < 3; i++) {
      const cloud = this.clouds.create(
        200 + i * 300, 
        100 + Math.random() * 200, 
        'cloud'
      );
      cloud.setVelocityX(-20 - Math.random() * 10);
      cloud.setAlpha(0.7);
      cloud.setDepth(-5);
    }
  }

  private createGround(): void {
    // Scrolling ground visual
    this.ground = this.add.tileSprite(0, 540, 800, 60, 'ground');
    this.ground.setOrigin(0, 0);
    this.ground.setDepth(10);
    
    // Ground physics body (invisible collision) - completely static
    const groundBody = this.physics.add.staticGroup();
  const groundCollider = groundBody.create(400, 570, undefined);
    groundCollider.setSize(800, 60);
    groundCollider.setVisible(false);
    groundCollider.refreshBody(); // Ensure static body is properly set
    
    // Store reference for collision detection
    this.physics.world.on('worldbounds', () => {
      // Handle world bounds collision
    });
  }

  private createBird(): void {
    // Use Bird component with state machine & skins
    const skin = SkinManager.getInstance().getSelectedSkin();
    this.bird = new Bird(this, { x: 150, y: 300, texture: skin.birdTexture, jumpForce: -400, maxRotation: 30 });
    this.bird.applySkin(skin);
    // Physics adjustments
    if (this.bird.body) {
      const body = this.bird.body as Phaser.Physics.Arcade.Body;
      body.setAllowGravity(true);
      body.setMaxVelocity(300, 600);
    }
    console.log('🐦 Bird (component) created');
  }

  private createPipeManager(): void {
    this.pipeManager = new PipeManager(this, {});
    this.pipeManager.setDifficultyFunction(DifficultyManager.getSettings);
  }

  private createUI(): void {
    // Score display
    this.scoreText = this.add.text(400, 50, `Score: ${this.score}`, {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.scoreText.setOrigin(0.5);
    this.scoreText.setDepth(20);

    // Instructions
    this.instructionText = this.add.text(400, 200, 
      'SPACE or CLICK to jump\nAvoid the pipes!', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center'
    });
    this.instructionText.setOrigin(0.5);
    this.instructionText.setDepth(20);
  }

  private setupPhysics(): void {
    // Bird vs Ground collision
  // Use world bounds check manually; collisions with ground handled via Y position in update.

  // Pipe collisions checked manually via manager each frame
  }

  private setupInput(): void {
    // Mouse/touch input
  this.input.on('pointerdown', () => { this.handleJump(); });

    // Keyboard input
    this.input.keyboard?.on('keydown-SPACE', () => { this.handleJump(); });

    // Toggle outline (O)
    this.input.keyboard?.on('keydown-O', () => {
      this.highContrastOutline = !this.highContrastOutline;
      this.bird.setOutlineVisible(this.highContrastOutline);
    });

    // ESC to return to menu
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('Menu');
    });
  }

  private handleJump(): void {
    if (this.gameOver) {
      // Restart game
      this.scene.restart();
      return;
    }

    if (!this.gameStarted) {
      this.startGame();
    }

    // Make bird jump
  this.bird.jump();
  }

  private startGame(): void {
    this.gameStarted = true;
    this.instructionText.setVisible(false);
    
    console.log('🚀 Game started!');
  }

  // Pipe generation handled by manager

  private updatePipes(): void {
    // Delegated to pipe manager
    this.pipeManager.updatePipes(this.score);
    // Scoring
    if (this.pipeManager.checkScoring(this.bird)) {
      this.incrementScore();
    }
    // Collision
    if (this.pipeManager.checkCollisions(this.bird)) {
      this.handleGameOver();
    }
  }

  private updateClouds(): void {
    // Reset clouds that go off-screen
    this.clouds.children.entries.forEach((cloud: any) => {
      if (cloud.x < -100) {
        cloud.x = 900;
        cloud.y = 100 + Math.random() * 200;
      }
    });
  }

  private incrementScore(): void {
    this.score++;
    this.scoreText.setText(`Score: ${this.score}`);
    
    // Visual feedback
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });
  }

  private handleGameOver(): void {
    if (this.gameOver) return;
    
    this.gameOver = true;
    console.log('💀 Game Over! Score:', this.score);
    
    // Stop bird movement completely
    if (this.bird.body && 'setVelocity' in this.bird.body) {
      (this.bird.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
      (this.bird.body as Phaser.Physics.Arcade.Body).setAcceleration(0, 0);
    }
    
  // Stop pipe manager
  this.pipeManager.stop();
    
    // Show game over UI
    this.showGameOverUI();
  }

  private showGameOverUI(): void {
    // Game over text
    const gameOverText = this.add.text(400, 250, 'GAME OVER', {
      fontSize: '48px',
      fontFamily: 'monospace',
      color: '#FF0000',
      stroke: '#000000',
      strokeThickness: 4
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setDepth(25);
    
    // Final score
    const finalScoreText = this.add.text(400, 320, `Final Score: ${this.score}`, {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3
    });
    finalScoreText.setOrigin(0.5);
    finalScoreText.setDepth(25);
    
    // Restart instruction
    const restartText = this.add.text(400, 380, 'SPACE or CLICK to restart\nESC for menu', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#FFFF00',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center'
    });
    restartText.setOrigin(0.5);
    restartText.setDepth(25);
    
    // Save high score
    const highScore = parseInt(localStorage.getItem('flappyHighScore') || '0');
    if (this.score > highScore) {
      localStorage.setItem('flappyHighScore', this.score.toString());
      
      const newRecordText = this.add.text(400, 440, 'NEW HIGH SCORE!', {
        fontSize: '20px',
        fontFamily: 'monospace',
        color: '#00FF00',
        stroke: '#000000',
        strokeThickness: 3
      });
      newRecordText.setOrigin(0.5);
      newRecordText.setDepth(25);
      
      // Celebration effect
      this.tweens.add({
        targets: newRecordText,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  update(time: number, delta: number): void {
    if (this.gameOver) return;
    
    // Update ground scrolling
    this.ground.tilePositionX += 2;
    
    // Update clouds
    this.updateClouds();
    
    if (!this.gameStarted) return;
    
  // Bird update (rotation handled internally)
  this.bird.update();
    
    // Check if bird is out of bounds
    if (this.bird.y > 600 || this.bird.y < -50) {
      this.handleGameOver();
      return;
    }
    
  // Update pipes and collisions
  this.updatePipes();
  }
}