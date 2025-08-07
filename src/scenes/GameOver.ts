import 'phaser';
import { SceneData } from '../types/GameTypes';
import ScoreManager from '../managers/ScoreManager';
import AssetManager from '../managers/AssetManager';
import ErrorHandler from '../managers/ErrorHandler';

export default class GameOver extends Phaser.Scene {
  private finalScore: number = 0;
  private isNewHighScore: boolean = false;
  private scoreManager!: ScoreManager;
  private assetManager!: AssetManager;
  
  // UI Elements
  private background!: Phaser.GameObjects.Image;
  private gameOverText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;
  private newRecordText?: Phaser.GameObjects.Text;
  private restartButton!: Phaser.GameObjects.Text;
  private menuButton!: Phaser.GameObjects.Text;
  private statisticsText!: Phaser.GameObjects.Text;
  
  private isTransitioning: boolean = false;

  constructor() {
    super('GameOver');
  }

  init(data: SceneData) {
    try {
      this.finalScore = data.score || 0;
      this.isNewHighScore = data.isNewHighScore || false;
      
      console.log(`Game Over - Score: ${this.finalScore}, New Record: ${this.isNewHighScore}`);
    } catch (error) {
      ErrorHandler.handleSceneError(error as Error, 'GameOver-init');
      this.finalScore = 0;
      this.isNewHighScore = false;
    }
  }

  create() {
    try {
      console.log('GameOver scene started');
      
      // Initialize managers
      this.initializeManagers();
      
      // Create background
      this.createBackground();
      
      // Create UI elements
      this.createGameOverTitle();
      this.createScoreDisplay();
      this.createHighScoreDisplay();
      this.createNewRecordDisplay();
      this.createButtons();
      this.createStatistics();
      
      // Setup input
      this.setupInput();
      
      // Play entrance animations
      this.playEntranceAnimations();
      
    } catch (error) {
      ErrorHandler.handleSceneError(error as Error, 'GameOver');
      this.createFallbackGameOver();
    }
  }

  /**
   * Initialize required managers
   */
  private initializeManagers(): void {
    try {
      this.scoreManager = ScoreManager.getInstance();
      this.assetManager = AssetManager.getInstance(this);
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'gameover-managers-init');
    }
  }

  /**
   * Create animated background
   */
  private createBackground(): void {
    try {
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;
      
      // Main background with darker overlay
      this.background = this.add.image(centerX, centerY, 
        this.assetManager.getAssetKey('background')
      );
      
      // Scale to fit screen
      const scaleX = this.cameras.main.width / this.background.width;
      const scaleY = this.cameras.main.height / this.background.height;
      const scale = Math.max(scaleX, scaleY);
      this.background.setScale(scale);
      
      // Add dark overlay for better text readability
      const overlay = this.add.rectangle(
        centerX, centerY,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000000,
        0.5
      );
      overlay.setDepth(1);
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'gameover-background');
      // Fallback background
      this.add.rectangle(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        this.cameras.main.width,
        this.cameras.main.height,
        0x2C3E50
      );
    }
  }

  /**
   * Create game over title
   */
  private createGameOverTitle(): void {
    try {
      const centerX = this.cameras.main.width / 2;
      
      this.gameOverText = this.add.text(centerX, 120, 'GAME OVER', {
        fontSize: '56px',
        fontFamily: 'Arial',
        color: '#FF6B6B',
        stroke: '#000000',
        strokeThickness: 6,
        shadow: {
          offsetX: 3,
          offsetY: 3,
          color: '#000000',
          blur: 5,
          fill: true
        }
      }).setOrigin(0.5);
      
      this.gameOverText.setDepth(10);
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'gameover-title');
    }
  }

  /**
   * Create score display
   */
  private createScoreDisplay(): void {
    try {
      const centerX = this.cameras.main.width / 2;
      
      this.scoreText = this.add.text(centerX, 200, `Puntuación Final: ${this.finalScore}`, {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 4,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: '#000000',
          blur: 3,
          fill: true
        }
      }).setOrigin(0.5);
      
      this.scoreText.setDepth(10);
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'gameover-score');
    }
  }

  /**
   * Create high score display
   */
  private createHighScoreDisplay(): void {
    try {
      const centerX = this.cameras.main.width / 2;
      const highScore = this.scoreManager.getHighScore();
      
      this.highScoreText = this.add.text(centerX, 250, `Mejor Puntuación: ${highScore}`, {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 3,
        shadow: {
          offsetX: 1,
          offsetY: 1,
          color: '#000000',
          blur: 2,
          fill: true
        }
      }).setOrigin(0.5);
      
      this.highScoreText.setDepth(10);
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'gameover-high-score');
    }
  }

  /**
   * Create new record display if applicable
   */
  private createNewRecordDisplay(): void {
    if (!this.isNewHighScore) return;
    
    try {
      const centerX = this.cameras.main.width / 2;
      
      this.newRecordText = this.add.text(centerX, 290, '¡NUEVO RÉCORD!', {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#00FF00',
        stroke: '#000000',
        strokeThickness: 4,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: '#000000',
          blur: 4,
          fill: true
        }
      }).setOrigin(0.5);
      
      this.newRecordText.setDepth(10);
      
      // Add celebration animation
      this.tweens.add({
        targets: this.newRecordText,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 800,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'gameover-new-record');
    }
  }

  /**
   * Create action buttons
   */
  private createButtons(): void {
    try {
      const centerX = this.cameras.main.width / 2;
      const buttonY = this.isNewHighScore ? 380 : 340;
      
      // Restart button
      this.restartButton = this.add.text(centerX - 100, buttonY, 'JUGAR DE NUEVO', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        backgroundColor: '#2E8B57',
        padding: { x: 20, y: 12 },
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: '#000000',
          blur: 3,
          fill: true
        }
      }).setOrigin(0.5);
      
      this.restartButton.setDepth(10);
      this.restartButton.setInteractive({ useHandCursor: true });
      
      // Menu button
      this.menuButton = this.add.text(centerX + 100, buttonY, 'MENÚ', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        backgroundColor: '#34495E',
        padding: { x: 20, y: 12 },
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: '#000000',
          blur: 3,
          fill: true
        }
      }).setOrigin(0.5);
      
      this.menuButton.setDepth(10);
      this.menuButton.setInteractive({ useHandCursor: true });
      
      // Setup button interactions
      this.setupButtonInteractions();
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'gameover-buttons');
    }
  }

  /**
   * Setup button hover and click interactions
   */
  private setupButtonInteractions(): void {
    try {
      // Restart button interactions
      this.restartButton.on('pointerover', () => {
        if (!this.isTransitioning) {
          this.restartButton.setStyle({ backgroundColor: '#228B22' });
          this.tweens.add({
            targets: this.restartButton,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 200,
            ease: 'Power2.easeOut'
          });
        }
      });
      
      this.restartButton.on('pointerout', () => {
        if (!this.isTransitioning) {
          this.restartButton.setStyle({ backgroundColor: '#2E8B57' });
          this.tweens.add({
            targets: this.restartButton,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Power2.easeOut'
          });
        }
      });
      
      this.restartButton.on('pointerdown', () => {
        this.handleRestartButton();
      });
      
      // Menu button interactions
      this.menuButton.on('pointerover', () => {
        if (!this.isTransitioning) {
          this.menuButton.setStyle({ backgroundColor: '#5D6D7E' });
          this.tweens.add({
            targets: this.menuButton,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 200,
            ease: 'Power2.easeOut'
          });
        }
      });
      
      this.menuButton.on('pointerout', () => {
        if (!this.isTransitioning) {
          this.menuButton.setStyle({ backgroundColor: '#34495E' });
          this.tweens.add({
            targets: this.menuButton,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Power2.easeOut'
          });
        }
      });
      
      this.menuButton.on('pointerdown', () => {
        this.handleMenuButton();
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'gameover-button-interactions');
    }
  }

  /**
   * Create statistics display
   */
  private createStatistics(): void {
    try {
      const centerX = this.cameras.main.width / 2;
      const stats = this.scoreManager.getStatistics();
      
      let statsText = `Partidas jugadas: ${stats.gamesPlayed}`;
      if (stats.gamesPlayed > 1) {
        statsText += `\nPuntuación promedio: ${stats.averageScore}`;
      }
      
      this.statisticsText = this.add.text(centerX, 480, statsText, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#CCCCCC',
        stroke: '#000000',
        strokeThickness: 1,
        align: 'center',
        lineSpacing: 3
      }).setOrigin(0.5);
      
      this.statisticsText.setDepth(10);
      this.statisticsText.setAlpha(0.8);
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'gameover-statistics');
    }
  }

  /**
   * Setup keyboard input
   */
  private setupInput(): void {
    try {
      // Space or Enter to restart
      this.input.keyboard?.on('keydown-SPACE', () => {
        if (!this.isTransitioning) {
          this.handleRestartButton();
        }
      });
      
      this.input.keyboard?.on('keydown-ENTER', () => {
        if (!this.isTransitioning) {
          this.handleRestartButton();
        }
      });
      
      // Escape to menu
      this.input.keyboard?.on('keydown-ESC', () => {
        if (!this.isTransitioning) {
          this.handleMenuButton();
        }
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'gameover-input-setup');
    }
  }

  /**
   * Handle restart button click
   */
  private handleRestartButton(): void {
    if (this.isTransitioning) return;
    
    try {
      this.isTransitioning = true;
      
      // Button press animation
      this.tweens.add({
        targets: this.restartButton,
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 100,
        ease: 'Power2.easeOut',
        yoyo: true,
        onComplete: () => {
          this.startGameTransition();
        }
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'gameover-restart-handler');
      this.scene.start('Game'); // Fallback
    }
  }

  /**
   * Handle menu button click
   */
  private handleMenuButton(): void {
    if (this.isTransitioning) return;
    
    try {
      this.isTransitioning = true;
      
      // Button press animation
      this.tweens.add({
        targets: this.menuButton,
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 100,
        ease: 'Power2.easeOut',
        yoyo: true,
        onComplete: () => {
          this.startMenuTransition();
        }
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'gameover-menu-handler');
      this.scene.start('Menu'); // Fallback
    }
  }

  /**
   * Start transition to game scene
   */
  private startGameTransition(): void {
    try {
      // Fade out all UI elements
      const uiElements = [
        this.gameOverText,
        this.scoreText,
        this.highScoreText,
        this.restartButton,
        this.menuButton,
        this.statisticsText
      ];
      
      if (this.newRecordText) {
        uiElements.push(this.newRecordText);
      }
      
      this.tweens.add({
        targets: uiElements,
        alpha: 0,
        duration: 500,
        ease: 'Power2.easeOut'
      });
      
      // Camera fade out
      this.cameras.main.fadeOut(800, 0, 0, 0);
      
      this.cameras.main.once('camerafadeoutcomplete', () => {
        console.log('Restarting Game scene');
        this.scene.start('Game');
      });
      
    } catch (error) {
      ErrorHandler.handleSceneError(error as Error, 'GameOver-game-transition');
      this.scene.start('Game'); // Fallback
    }
  }

  /**
   * Start transition to menu scene
   */
  private startMenuTransition(): void {
    try {
      // Fade out all UI elements
      const uiElements = [
        this.gameOverText,
        this.scoreText,
        this.highScoreText,
        this.restartButton,
        this.menuButton,
        this.statisticsText
      ];
      
      if (this.newRecordText) {
        uiElements.push(this.newRecordText);
      }
      
      this.tweens.add({
        targets: uiElements,
        alpha: 0,
        duration: 500,
        ease: 'Power2.easeOut'
      });
      
      // Camera fade out
      this.cameras.main.fadeOut(800, 0, 0, 0);
      
      this.cameras.main.once('camerafadeoutcomplete', () => {
        console.log('Returning to Menu scene');
        this.scene.start('Menu');
      });
      
    } catch (error) {
      ErrorHandler.handleSceneError(error as Error, 'GameOver-menu-transition');
      this.scene.start('Menu'); // Fallback
    }
  }

  /**
   * Play entrance animations
   */
  private playEntranceAnimations(): void {
    try {
      // Set initial states
      const elements = [
        this.gameOverText,
        this.scoreText,
        this.highScoreText,
        this.restartButton,
        this.menuButton,
        this.statisticsText
      ];
      
      if (this.newRecordText) {
        elements.push(this.newRecordText);
      }
      
      elements.forEach(element => {
        if (element) {
          element.setAlpha(0);
          element.setScale(0.8);
        }
      });
      
      // Animate elements in sequence
      elements.forEach((element, index) => {
        if (element) {
          this.tweens.add({
            targets: element,
            alpha: element === this.statisticsText ? 0.8 : 1,
            scaleX: 1,
            scaleY: 1,
            duration: 600,
            delay: index * 200,
            ease: 'Back.easeOut'
          });
        }
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'gameover-entrance-animations');
    }
  }

  /**
   * Create fallback game over screen
   */
  private createFallbackGameOver(): void {
    try {
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;
      
      // Simple background
      this.add.rectangle(centerX, centerY, 800, 600, 0x2C3E50);
      
      // Simple game over text
      this.add.text(centerX, centerY - 100, 'GAME OVER', {
        fontSize: '48px',
        color: '#FFFFFF'
      }).setOrigin(0.5);
      
      // Simple score
      this.add.text(centerX, centerY - 50, `Score: ${this.finalScore}`, {
        fontSize: '32px',
        color: '#FFFFFF'
      }).setOrigin(0.5);
      
      // Simple restart button
      const restartBtn = this.add.text(centerX, centerY + 50, 'JUGAR DE NUEVO', {
        fontSize: '24px',
        color: '#FFFFFF',
        backgroundColor: '#2E8B57',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setInteractive();
      
      restartBtn.on('pointerdown', () => {
        this.scene.start('Game');
      });
      
    } catch (error) {
      ErrorHandler.handleSceneError(error as Error, 'GameOver-fallback');
    }
  }

  /**
   * Update method for any continuous updates
   */
  update(): void {
    // GameOver doesn't need continuous updates, but method is here for completeness
  }
}
