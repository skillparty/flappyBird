import 'phaser';
import Bird from '../components/Bird';
import PipeManager from '../components/PipeManager';
import DifficultyManager from '../managers/DifficultyManager';
import SkinManager from '../managers/SkinManager';
import { BirdState } from '../types/GameTypes';
import AudioManager from '../managers/AudioManager';
import StorageManager from '../managers/StorageManager';

export default class Game extends Phaser.Scene {
  // Core game objects
  private bird!: Bird;
  private pipeManager!: PipeManager;
  private ground!: Phaser.GameObjects.TileSprite;
  private background!: Phaser.GameObjects.Image;
  private treesFar!: Phaser.GameObjects.TileSprite;
  private treesNear!: Phaser.GameObjects.TileSprite;
  private clouds!: Phaser.Physics.Arcade.Group;
  
  // UI elements
  private scoreText!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;
  private pauseOverlay?: Phaser.GameObjects.Rectangle;
  private pauseText?: Phaser.GameObjects.Text;
  private isPaused: boolean = false;
  private audioIndicator?: Phaser.GameObjects.Text;
  private musicToggleHint?: Phaser.GameObjects.Text;
  private performanceText?: Phaser.GameObjects.Text;
  private lastCollisionTime: number = 0;
  private slowMoActive: boolean = false;
  
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
  this.createAudioIndicator();
    
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

  // Parallax tree layers (drawn lower on screen). Use TileSprite for horizontal looping
  // Far trees (darker, slower)
  this.treesFar = this.add.tileSprite(400, 500, 800, 200, 'trees_far');
  this.treesFar.setOrigin(0.5, 1);
  this.treesFar.setDepth(-8);
  this.treesFar.alpha = 0.85;

  // Near trees (brighter, a bit faster)
  this.treesNear = this.add.tileSprite(400, 520, 800, 200, 'trees_near');
  this.treesNear.setOrigin(0.5, 1);
  this.treesNear.setDepth(-7);
  this.treesNear.alpha = 0.95;
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

    // High score display (top-left)
    const storedHigh = parseInt(localStorage.getItem('flappyHighScore') || '0');
    this.highScoreText = this.add.text(20, 20, `HI: ${storedHigh}`, {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#FFFF66',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.highScoreText.setDepth(20);

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

  private createAudioIndicator(): void {
    const audio = AudioManager.getInstance(this);
    this.audioIndicator = this.add.text(780, 20, this.formatAudioText(audio.getVolume(), audio.isAudioEnabled()), {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'right'
    }).setOrigin(1, 0).setDepth(30);

    // Background music start (only once per scene entry)
    audio.playBackgroundMusic();

    // Music toggle hint (B key)
    this.musicToggleHint = this.add.text(780, 40, '[B] music  [M] mute  [+/-] vol', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'right'
    }).setOrigin(1, 0).setDepth(30);

    // Bind keys inside game as well
    this.input.keyboard?.on('keydown-M', () => {
      audio.setEnabled(!audio.isAudioEnabled());
      this.refreshAudioIndicator();
    });
    this.input.keyboard?.on('keydown-B', () => {
      // Toggle background music only (leave SFX state as is)
      const bgStatus = audio.getStatus();
      const bgSound = (audio as any).sounds?.get?.('background');
      if (bgSound && bgSound.isPlaying) {
        audio.stopBackgroundMusic();
      } else {
        audio.playBackgroundMusic();
      }
    });
    this.input.keyboard?.on('keydown-PLUS', () => { this.bumpVolume(0.05); });
    this.input.keyboard?.on('keydown-ADD', () => { this.bumpVolume(0.05); });
    this.input.keyboard?.on('keydown-EQUALS', () => { this.bumpVolume(0.05); });
    this.input.keyboard?.on('keydown-MINUS', () => { this.bumpVolume(-0.05); });

    // Performance toggle (F key): toggles particle heavy features through an event
    this.input.keyboard?.on('keydown-F', () => {
      this.events.emit('toggle-performance');
    });
  }

  private bumpVolume(delta: number): void {
    const audio = AudioManager.getInstance(this);
    audio.setVolume(Math.min(1, Math.max(0, audio.getVolume() + delta)));
    this.refreshAudioIndicator();
  }

  private refreshAudioIndicator(): void {
    if (!this.audioIndicator) return;
    const audio = AudioManager.getInstance(this);
    this.audioIndicator.setText(this.formatAudioText(audio.getVolume(), audio.isAudioEnabled()));
  }

  private formatAudioText(vol: number, enabled: boolean): string {
    return `${enabled ? '🔊' : '🔇'} ${(vol * 100) | 0}%  (M mute  +/- vol)`;
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

    // P to pause/resume
    this.input.keyboard?.on('keydown-P', () => {
      if (this.gameOver || !this.gameStarted) return;
      this.togglePause();
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
      // Play hit sound & apply slow-mo only once per collision event
      const now = this.time.now;
      if (now - this.lastCollisionTime > 300) {
        this.lastCollisionTime = now;
        AudioManager.getInstance(this).playHit();
        this.triggerSlowMo();
      }
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
    // Pulse animation & slight upward float
    
    // Visual feedback
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });

  // Play score sound
  AudioManager.getInstance(this).playScore();

    // Update high score live
    const high = parseInt(localStorage.getItem('flappyHighScore') || '0');
    if (this.score > high) {
      localStorage.setItem('flappyHighScore', this.score.toString());
      this.highScoreText.setText(`HI: ${this.score}`);
      this.tweens.add({
        targets: this.highScoreText,
        angle: { from: -5, to: 5 },
        duration: 80,
        yoyo: true,
        repeat: 3
      });
    }
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
    // Add to totals / leaderboard
    StorageManager.addScoreToLeaderboard(this.score);
    const prevHigh = StorageManager.getHighScore();
    if (this.score > prevHigh) {
      StorageManager.setHighScore(this.score);
    }
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

    this.tweens.add({
      targets: gameOverText,
      scale: { from: 0.6, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 400,
      ease: 'Back.Out'
    });
    
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
    
    // Leaderboard display
    const leaderboard = StorageManager.getLeaderboard();
    const medals = ['🥇','🥈','🥉','4️⃣','5️⃣'];
    let lbText = 'Top Scores:\n';
    if (leaderboard.length === 0) lbText += '  (none)';
    leaderboard.forEach((s, i) => {
      const marker = this.score === s ? ' <' : '';
      lbText += `  ${medals[i] || (i+1+'.')} ${s}${marker}\n`;
    });
    const lbObj = this.add.text(650, 255, lbText, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'left'
    }).setOrigin(0.5).setDepth(25);

    // Highlight panel background
    this.add.rectangle(650, 258, 180, 160, 0x000000, 0.35).setOrigin(0.5).setDepth(24);

    if (leaderboard.length && this.score >= leaderboard[0]) {
      const newRecordText = this.add.text(400, 440, 'NEW HIGH SCORE!', {
        fontSize: '20px',
        fontFamily: 'monospace',
        color: '#00FF00',
        stroke: '#000000',
        strokeThickness: 3
      });
      newRecordText.setOrigin(0.5);
      newRecordText.setDepth(25);
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

    // Add clickable restart & menu buttons (for mouse / touch UX)
    const btnRestart = this.add.rectangle(400, 500, 180, 50, 0x1E1E1E, 0.8).setStrokeStyle(2, 0x00ff66).setDepth(26)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => btnRestart.setFillStyle(0x2A2A2A, 0.9))
      .on('pointerout', () => btnRestart.setFillStyle(0x1E1E1E, 0.8))
      .on('pointerdown', () => this.scene.restart());
    this.add.text(400, 500, 'RESTART', { fontSize: '18px', fontFamily: 'monospace', color: '#00FF88' })
      .setOrigin(0.5).setDepth(27);

    const btnMenu = this.add.rectangle(400, 560, 180, 50, 0x1E1E1E, 0.8).setStrokeStyle(2, 0xff6600).setDepth(26)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => btnMenu.setFillStyle(0x2A2A2A, 0.9))
      .on('pointerout', () => btnMenu.setFillStyle(0x1E1E1E, 0.8))
      .on('pointerdown', () => this.scene.start('Menu'));
    this.add.text(400, 560, 'MENU', { fontSize: '18px', fontFamily: 'monospace', color: '#FFAA55' })
      .setOrigin(0.5).setDepth(27);
  }

  update(time: number, delta: number): void {
    if (this.gameOver) return;
  if (this.isPaused) return;

    // Slow-mo timer: restore normal time scale after brief effect
    if (this.slowMoActive) {
      if (this.time.now - this.lastCollisionTime > 450) {
        this.time.timeScale = 1;
        this.physics.world.timeScale = 1;
        this.slowMoActive = false;
      }
    }
    
    // Update ground scrolling
    this.ground.tilePositionX += 2;

  // Parallax scroll: subtle; slower than ground
  if (this.treesFar) this.treesFar.tilePositionX += 0.3;
  if (this.treesNear) this.treesNear.tilePositionX += 0.6;
    
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

  private togglePause(): void {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      // Dark overlay
      this.pauseOverlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.5).setDepth(30);
      this.pauseText = this.add.text(400, 300, 'PAUSED\nPress P to resume', {
        fontSize: '40px',
        fontFamily: 'monospace',
        color: '#FFFFFF',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5).setDepth(31);
      this.tweens.add({
        targets: this.pauseText,
        scale: { from: 0.9, to: 1.05 },
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut'
      });
      this.physics.world.pause();
    } else {
      this.pauseOverlay?.destroy();
      this.pauseText?.destroy();
      this.physics.world.resume();
    }
  }

  private triggerSlowMo(): void {
    this.slowMoActive = true;
    this.time.timeScale = 0.35;
    this.physics.world.timeScale = 0.35;
  }
}