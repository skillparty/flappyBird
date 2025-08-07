import 'phaser';
import Bird from '../components/Bird';
import PipeManager from '../components/PipeManager';
import ParallaxBackground from '../components/ParallaxBackground';
import ScoreManager from '../managers/ScoreManager';
import AssetManager from '../managers/AssetManager';
import ErrorHandler from '../managers/ErrorHandler';
import CollisionSystem, { CollisionResult } from '../systems/CollisionSystem';
import GameOverSystem from '../systems/GameOverSystem';
import PerformanceManager from '../systems/PerformanceManager';
import ParticleEffects from '../effects/ParticleEffects';
import { GAME_CONFIG, GAME_CONSTANTS } from '../config/GameConfig';
import { BirdConfig } from '../types/GameTypes';

export default class Game extends Phaser.Scene {
  // Core game components
  private bird!: Bird;
  private pipeManager!: PipeManager;
  private scoreManager!: ScoreManager;
  private assetManager!: AssetManager;
  private collisionSystem!: CollisionSystem;
  private gameOverSystem!: GameOverSystem;
  private performanceManager!: PerformanceManager;
  
  // Visual elements
  private parallaxBackground!: ParallaxBackground;
  private ground!: Phaser.GameObjects.TileSprite;
  private particleEffects!: ParticleEffects;
  
  // Game state
  private isGameActive: boolean = false;
  private isGameOver: boolean = false;
  private gameStarted: boolean = false;
  
  // UI elements
  private startPrompt!: Phaser.GameObjects.Text;
  private pauseButton!: Phaser.GameObjects.Text;
  private isPaused: boolean = false;

  constructor() {
    super('Game');
  }

  create() {
    try {
      console.log('Game scene started');
      
      // Initialize managers and systems
      this.initializeManagers();
      this.initializeSystems();
      
      // Create visual elements
      this.createBackground();
      this.createGround();
      
      // Create particle effects
      this.particleEffects = new ParticleEffects(this);
      
      // Create game objects
      this.createBird();
      this.createPipeManager();
      
      // Setup UI
      this.setupUI();
      
      // Setup input handling
      this.setupInput();
      
      // Setup physics
      this.setupPhysics();
      
      // Reset game state
      this.resetGameState();
      
      // Show start prompt
      this.showStartPrompt();
      
      console.log('Game scene initialized successfully');
      
    } catch (error) {
      ErrorHandler.handleSceneError(error as Error, 'Game');
      this.createFallbackGame();
    }
  }

  /**
   * Initialize required managers
   */
  private initializeManagers(): void {
    try {
      this.scoreManager = ScoreManager.getInstance();
      this.assetManager = AssetManager.getInstance(this);
      
      // Initialize audio manager
      const AudioManager = require('../managers/AudioManager').default;
      AudioManager.getInstance(this);
      
      // Initialize accessibility manager
      const AccessibilityManager = require('../managers/AccessibilityManager').default;
      AccessibilityManager.getInstance();
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'game-managers-init');
    }
  }

  /**
   * Initialize game systems
   */
  private initializeSystems(): void {
    try {
      // Initialize systems (will be fully setup after game objects are created)
      this.gameOverSystem = new GameOverSystem(this);
      this.performanceManager = PerformanceManager.getInstance(this);
      
      // Setup game over callback
      this.gameOverSystem.setOnGameOver((data) => {
        this.handleGameOver(data);
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'game-systems-init');
    }
  }

  /**
   * Create animated parallax background
   */
  private createBackground(): void {
    try {
      // Create parallax background system
      this.parallaxBackground = new ParallaxBackground(this);
      
      console.log('Parallax background created');
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'game-background');
      
      // Fallback: create simple background
      this.createFallbackBackground();
    }
  }

  /**
   * Create fallback background if parallax fails
   */
  private createFallbackBackground(): void {
    try {
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;
      
      const background = this.add.image(centerX, centerY, 
        this.assetManager.getAssetKey('background')
      );
      
      // Scale to fit screen
      const scaleX = this.cameras.main.width / background.width;
      const scaleY = this.cameras.main.height / background.height;
      const scale = Math.max(scaleX, scaleY);
      background.setScale(scale);
      
      background.setDepth(-10);
      
      console.log('Fallback background created');
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'game-fallback-background');
    }
  }

  /**
   * Create scrolling ground
   */
  private createGround(): void {
    try {
      const groundY = GAME_CONFIG.visual.canvasHeight - GAME_CONSTANTS.GROUND_HEIGHT / 2;
      
      this.ground = this.add.tileSprite(
        0, groundY,
        GAME_CONFIG.visual.canvasWidth,
        GAME_CONSTANTS.GROUND_HEIGHT,
        this.assetManager.getAssetKey('ground')
      );
      
      this.ground.setOrigin(0, 0.5);
      this.ground.setDepth(5);
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'game-ground');
    }
  }

  /**
   * Create bird with configuration
   */
  private createBird(): void {
    try {
      // Get selected character texture
      const CharacterSelector = require('../components/CharacterSelector').default;
      const characterSelector = new CharacterSelector(this);
      const selectedTexture = characterSelector.getSelectedTexture();
      
      const birdConfig: BirdConfig = {
        x: GAME_CONSTANTS.BIRD_START_X,
        y: GAME_CONSTANTS.BIRD_START_Y,
        texture: selectedTexture,
        jumpForce: GAME_CONFIG.physics.birdJumpForce,
        maxRotation: 30
      };
      
      this.bird = new Bird(this, birdConfig);
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'game-bird-creation');
    }
  }

  /**
   * Create pipe manager
   */
  private createPipeManager(): void {
    try {
      this.pipeManager = new PipeManager(this, {
        speed: GAME_CONFIG.physics.pipeSpeed,
        gap: GAME_CONFIG.gameplay.pipeGap,
        spawnInterval: GAME_CONFIG.gameplay.pipeSpawnInterval,
        minHeight: 100,
        maxHeight: 400
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'game-pipe-manager-creation');
    }
  }

  /**
   * Setup UI elements
   */
  private setupUI(): void {
    try {
      // Initialize score display
      this.scoreManager.initialize(this, GAME_CONFIG.visual.canvasWidth / 2, 50);
      
      // Create pause button
      this.pauseButton = this.add.text(GAME_CONFIG.visual.canvasWidth - 50, 50, '⏸️', {
        fontSize: '32px'
      }).setOrigin(0.5);
      
      this.pauseButton.setDepth(100);
      this.pauseButton.setInteractive({ useHandCursor: true });
      this.pauseButton.on('pointerdown', () => this.togglePause());
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'game-ui-setup');
    }
  }

  /**
   * Setup input handling
   */
  private setupInput(): void {
    try {
      // Mouse/touch input
      this.input.on('pointerdown', () => {
        this.handleJumpInput();
      });
      
      // Keyboard input
      this.input.keyboard?.on('keydown-SPACE', () => {
        this.handleJumpInput();
      });
      
      // Pause key
      this.input.keyboard?.on('keydown-ESC', () => {
        this.togglePause();
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'game-input-setup');
    }
  }

  /**
   * Setup physics systems
   */
  private setupPhysics(): void {
    try {
      // Initialize collision system after all game objects are created
      this.collisionSystem = new CollisionSystem(this, this.bird, this.pipeManager);
      
      // Setup collision callback
      this.collisionSystem.setOnCollision((result: CollisionResult) => {
        this.handleCollision(result);
      });
      
    } catch (error) {
      ErrorHandler.handlePhysicsError(error as Error, 'game-physics-setup');
    }
  }

  /**
   * Handle jump input
   */
  private handleJumpInput(): void {
    try {
      if (this.isPaused) return;
      
      if (!this.gameStarted) {
        this.startGame();
        return;
      }
      
      if (this.isGameActive && !this.isGameOver) {
        this.bird.jump();
      }
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'game-jump-input');
    }
  }

  /**
   * Start the game
   */
  private startGame(): void {
    try {
      this.gameStarted = true;
      this.isGameActive = true;
      this.isGameOver = false;
      
      // Hide start prompt
      if (this.startPrompt) {
        this.startPrompt.setVisible(false);
      }
      
      // Initialize systems
      this.gameOverSystem.initialize();
      this.collisionSystem.activate();
      
      // Announce game start
      try {
        const AccessibilityManager = require('../managers/AccessibilityManager').default;
        const accessibilityManager = AccessibilityManager.getInstance();
        accessibilityManager.announceGameState('started');
        accessibilityManager.updatePageTitle('Jugando', 0);
      } catch (accessError) {
        // Accessibility is optional
      }
      
      console.log('Game started');
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'game-start');
    }
  }

  /**
   * Show start prompt
   */
  private showStartPrompt(): void {
    try {
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;
      
      this.startPrompt = this.add.text(centerX, centerY, 
        'Haz clic o presiona ESPACIO\npara comenzar', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center',
        lineSpacing: 5
      }).setOrigin(0.5);
      
      this.startPrompt.setDepth(50);
      
      // Add blinking animation
      this.tweens.add({
        targets: this.startPrompt,
        alpha: 0.5,
        duration: 1000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'game-start-prompt');
    }
  }

  /**
   * Handle collision event
   */
  private handleCollision(result: CollisionResult): void {
    try {
      if (this.isGameOver) return;
      
      console.log('Collision detected:', result.collisionType);
      
      // Stop game
      this.isGameActive = false;
      this.isGameOver = true;
      
      // Handle collision in collision system
      this.collisionSystem.handleCollision(result);
      
      // Trigger game over sequence
      this.gameOverSystem.triggerGameOver(result);
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'game-collision-handling');
    }
  }

  /**
   * Handle game over
   */
  private handleGameOver(data: any): void {
    try {
      console.log('Game over with data:', data);
      
      // Update page title for accessibility
      try {
        const AccessibilityManager = require('../managers/AccessibilityManager').default;
        const accessibilityManager = AccessibilityManager.getInstance();
        accessibilityManager.announceGameState('over', `Puntuación final: ${data.finalScore}`);
        accessibilityManager.updatePageTitle('Game Over', data.finalScore);
      } catch (accessError) {
        // Accessibility is optional
      }
      
      // Smooth transition to game over scene
      this.cameras.main.fadeOut(500, 0, 0, 0);
      
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameOver', {
          score: data.finalScore,
          isNewHighScore: data.isNewHighScore
        });
      });
      
    } catch (error) {
      ErrorHandler.handleSceneError(error as Error, 'Game-game-over');
      // Fallback: direct transition
      this.scene.start('GameOver', {
        score: data.finalScore || 0,
        isNewHighScore: data.isNewHighScore || false
      });
    }
  }

  /**
   * Toggle pause state
   */
  private togglePause(): void {
    try {
      if (!this.gameStarted || this.isGameOver) return;
      
      this.isPaused = !this.isPaused;
      
      if (this.isPaused) {
        this.physics.pause();
        this.pauseButton.setText('▶️');
        
        // Pause parallax background
        if (this.parallaxBackground) {
          this.parallaxBackground.pause();
        }
        
        // Show pause overlay
        this.showPauseOverlay();
      } else {
        this.physics.resume();
        this.pauseButton.setText('⏸️');
        
        // Resume parallax background
        if (this.parallaxBackground) {
          this.parallaxBackground.resume();
        }
        
        // Hide pause overlay
        this.hidePauseOverlay();
      }
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'game-pause-toggle');
    }
  }

  /**
   * Show pause overlay
   */
  private showPauseOverlay(): void {
    try {
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;
      
      const pauseOverlay = this.add.rectangle(
        centerX, centerY,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000000,
        0.5
      );
      pauseOverlay.setDepth(75);
      pauseOverlay.setData('pauseElement', true);
      
      const pauseText = this.add.text(centerX, centerY, 'PAUSA', {
        fontSize: '48px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5);
      pauseText.setDepth(76);
      pauseText.setData('pauseElement', true);
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'game-pause-overlay');
    }
  }

  /**
   * Hide pause overlay
   */
  private hidePauseOverlay(): void {
    try {
      // Remove all pause elements
      this.children.list.forEach(child => {
        if (child.getData('pauseElement')) {
          child.destroy();
        }
      });
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'game-pause-overlay-hide');
    }
  }

  /**
   * Reset game state
   */
  private resetGameState(): void {
    try {
      this.isGameActive = false;
      this.isGameOver = false;
      this.gameStarted = false;
      this.isPaused = false;
      
      // Reset score
      this.scoreManager.reset();
      
      // Reset bird
      if (this.bird) {
        this.bird.reset();
      }
      
      // Reset pipe manager
      if (this.pipeManager) {
        this.pipeManager.reset();
      }
      
      // Reset parallax background
      if (this.parallaxBackground) {
        this.parallaxBackground.reset();
      }
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'game-state-reset');
    }
  }

  /**
   * Main game update loop
   */
  update(time: number, delta: number): void {
    try {
      // Monitor performance
      ErrorHandler.monitorPerformance(this);
      this.performanceManager.monitorAndOptimize();
      
      if (this.isPaused || !this.gameStarted) return;
      
      // Update parallax background
      if (this.parallaxBackground && this.isGameActive) {
        this.parallaxBackground.update();
      }
      
      // Update ground scrolling
      if (this.ground && this.isGameActive) {
        this.ground.tilePositionX += 3;
      }
      
      // Update bird
      if (this.bird && this.isGameActive) {
        this.bird.update();
      }
      
      // Update pipe manager
      if (this.pipeManager && this.isGameActive) {
        this.pipeManager.updatePipes();
        
        // Check for scoring
        if (this.pipeManager.checkScoring(this.bird)) {
          this.scoreManager.increment();
          
          // Create score effect
          if (this.particleEffects) {
            this.particleEffects.createScoreEffect(this.bird.x + 50, this.bird.y);
          }
        }
      }
      
      // Check collisions
      if (this.collisionSystem && this.isGameActive && !this.isGameOver) {
        const collisionResult = this.collisionSystem.checkCollisions();
        if (collisionResult.hasCollision) {
          this.handleCollision(collisionResult);
        }
      }
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'game-update-loop');
    }
  }

  /**
   * Create fallback game if main creation fails
   */
  private createFallbackGame(): void {
    try {
      console.warn('Creating fallback game due to initialization error');
      
      // Simple background
      this.add.rectangle(400, 300, 800, 600, 0x87CEEB);
      
      // Simple error message
      this.add.text(400, 300, 'Error al cargar el juego\nPresiona ESPACIO para continuar', {
        fontSize: '24px',
        color: '#FFFFFF',
        align: 'center'
      }).setOrigin(0.5);
      
      // Simple input to return to menu
      this.input.keyboard?.on('keydown-SPACE', () => {
        this.scene.start('Menu');
      });
      
    } catch (error) {
      ErrorHandler.handleSceneError(error as Error, 'Game-fallback');
    }
  }

  /**
   * Cleanup when scene is destroyed
   */
  destroy(): void {
    try {
      // Cleanup systems
      if (this.collisionSystem) {
        this.collisionSystem.destroy();
      }
      
      if (this.gameOverSystem) {
        this.gameOverSystem.destroy();
      }
      
      if (this.pipeManager) {
        this.pipeManager.destroy();
      }
      
      // Cleanup score manager
      this.scoreManager.cleanup();
      
      super.destroy();
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'game-destroy');
    }
  }
}
