import 'phaser';
import ScoreManager from '../managers/ScoreManager';
import StorageManager from '../managers/StorageManager';
import AssetManager from '../managers/AssetManager';
import ErrorHandler from '../managers/ErrorHandler';
import CharacterSelector from '../components/CharacterSelector';
import { GAME_CONFIG } from '../config/GameConfig';

export default class Menu extends Phaser.Scene {
  private scoreManager!: ScoreManager;
  private assetManager!: AssetManager;
  private characterSelector!: CharacterSelector;
  private background!: Phaser.GameObjects.Image;
  private titleText!: Phaser.GameObjects.Text;
  private playButton!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;
  private instructionsText!: Phaser.GameObjects.Text;
  private statisticsText!: Phaser.GameObjects.Text;
  private settingsButton!: Phaser.GameObjects.Text;
  private characterButton!: Phaser.GameObjects.Text;
  private isTransitioning: boolean = false;

  constructor() {
    super('Menu');
  }

  create() {
    try {
      console.log('Menu scene started');
      
      // Initialize managers
      this.initializeManagers();
      
      // Create background
      this.createBackground();
      
      // Create UI elements
      this.createTitle();
      this.createPlayButton();
      this.createHighScoreDisplay();
      this.createInstructions();
      this.createStatistics();
      this.createSettingsButton();
      this.createCharacterButton();
      
      // Setup input handling
      this.setupInput();
      
      // Add entrance animations
      this.playEntranceAnimations();
      
    } catch (error) {
      ErrorHandler.handleSceneError(error as Error, 'Menu');
      this.createFallbackMenu();
    }
  }

  /**
   * Initialize required managers
   */
  private initializeManagers(): void {
    try {
      this.scoreManager = ScoreManager.getInstance();
      this.assetManager = AssetManager.getInstance(this);
      this.characterSelector = new CharacterSelector(this);
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'menu-managers-init');
    }
  }

  /**
   * Create animated background
   */
  private createBackground(): void {
    try {
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;
      
      // Main background
      this.background = this.add.image(centerX, centerY, 
        this.assetManager.getAssetKey('background')
      );
      
      // Scale to fit screen
      const scaleX = this.cameras.main.width / this.background.width;
      const scaleY = this.cameras.main.height / this.background.height;
      const scale = Math.max(scaleX, scaleY);
      this.background.setScale(scale);
      
      // Add subtle floating animation
      this.tweens.add({
        targets: this.background,
        y: centerY + 10,
        duration: 3000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'menu-background');
      // Fallback: create colored background
      this.add.rectangle(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        this.cameras.main.width,
        this.cameras.main.height,
        0x87CEEB
      );
    }
  }

  /**
   * Create animated title
   */
  private createTitle(): void {
    try {
      const centerX = this.cameras.main.width / 2;
      
      this.titleText = this.add.text(centerX, 120, 'Flappy Bird', {
        fontSize: '56px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
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
      
      this.titleText.setDepth(10);
      
      // Add pulsing animation
      this.tweens.add({
        targets: this.titleText,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 2000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'menu-title');
    }
  }

  /**
   * Create interactive play button
   */
  private createPlayButton(): void {
    try {
      const centerX = this.cameras.main.width / 2;
      
      this.playButton = this.add.text(centerX, 250, 'JUGAR', {
        fontSize: '36px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        backgroundColor: '#2E8B57',
        padding: { x: 30, y: 15 },
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: '#000000',
          blur: 3,
          fill: true
        }
      }).setOrigin(0.5);
      
      this.playButton.setDepth(10);
      this.playButton.setInteractive({ useHandCursor: true });
      
      // Hover effects
      this.playButton.on('pointerover', () => {
        if (!this.isTransitioning) {
          this.playButton.setStyle({ backgroundColor: '#228B22' });
          this.tweens.add({
            targets: this.playButton,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 200,
            ease: 'Power2.easeOut'
          });
        }
      });
      
      this.playButton.on('pointerout', () => {
        if (!this.isTransitioning) {
          this.playButton.setStyle({ backgroundColor: '#2E8B57' });
          this.tweens.add({
            targets: this.playButton,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Power2.easeOut'
          });
        }
      });
      
      this.playButton.on('pointerdown', () => {
        this.handlePlayButton();
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'menu-play-button');
    }
  }

  /**
   * Create high score display
   */
  private createHighScoreDisplay(): void {
    try {
      const centerX = this.cameras.main.width / 2;
      const highScore = this.scoreManager.getHighScore();
      
      this.highScoreText = this.add.text(centerX, 320, `Mejor Puntuación: ${highScore}`, {
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
      
      // Add subtle glow effect for high score
      if (highScore > 0) {
        this.tweens.add({
          targets: this.highScoreText,
          alpha: 0.8,
          duration: 1500,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1
        });
      }
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'menu-high-score');
    }
  }

  /**
   * Create game instructions
   */
  private createInstructions(): void {
    try {
      const centerX = this.cameras.main.width / 2;
      
      this.instructionsText = this.add.text(centerX, 380, 
        'Haz clic o presiona ESPACIO para saltar\nEvita los tubos y el suelo', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center',
        lineSpacing: 5
      }).setOrigin(0.5);
      
      this.instructionsText.setDepth(10);
      this.instructionsText.setAlpha(0.9);
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'menu-instructions');
    }
  }

  /**
   * Create game statistics display
   */
  private createStatistics(): void {
    try {
      const centerX = this.cameras.main.width / 2;
      const stats = this.scoreManager.getStatistics();
      
      let statsText = `Partidas jugadas: ${stats.gamesPlayed}`;
      if (stats.gamesPlayed > 0) {
        statsText += `\nPuntuación promedio: ${stats.averageScore}`;
      }
      
      this.statisticsText = this.add.text(centerX, 460, statsText, {
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
      ErrorHandler.handleGameplayError(error as Error, 'menu-statistics');
    }
  }

  /**
   * Create settings button
   */
  private createSettingsButton(): void {
    try {
      const rightX = this.cameras.main.width - 50;
      
      this.settingsButton = this.add.text(rightX, 50, '⚙️', {
        fontSize: '32px'
      }).setOrigin(0.5);
      
      this.settingsButton.setDepth(10);
      this.settingsButton.setInteractive({ useHandCursor: true });
      
      this.settingsButton.on('pointerover', () => {
        this.tweens.add({
          targets: this.settingsButton,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 200,
          ease: 'Power2.easeOut'
        });
      });
      
      this.settingsButton.on('pointerout', () => {
        this.tweens.add({
          targets: this.settingsButton,
          scaleX: 1,
          scaleY: 1,
          duration: 200,
          ease: 'Power2.easeOut'
        });
      });
      
      this.settingsButton.on('pointerdown', () => {
        this.showSettingsMenu();
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'menu-settings-button');
    }
  }

  /**
   * Create character selection button
   */
  private createCharacterButton(): void {
    try {
      const leftX = 50;
      
      this.characterButton = this.add.text(leftX, 50, '🐦', {
        fontSize: '32px'
      }).setOrigin(0.5);
      
      this.characterButton.setDepth(10);
      this.characterButton.setInteractive({ useHandCursor: true });
      
      this.characterButton.on('pointerover', () => {
        this.tweens.add({
          targets: this.characterButton,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 200,
          ease: 'Power2.easeOut'
        });
      });
      
      this.characterButton.on('pointerout', () => {
        this.tweens.add({
          targets: this.characterButton,
          scaleX: 1,
          scaleY: 1,
          duration: 200,
          ease: 'Power2.easeOut'
        });
      });
      
      this.characterButton.on('pointerdown', () => {
        this.showCharacterSelector();
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'menu-character-button');
    }
  }

  /**
   * Setup keyboard input
   */
  private setupInput(): void {
    try {
      // Space key to start game
      this.input.keyboard?.on('keydown-SPACE', () => {
        if (!this.isTransitioning) {
          this.handlePlayButton();
        }
      });
      
      // Enter key to start game
      this.input.keyboard?.on('keydown-ENTER', () => {
        if (!this.isTransitioning) {
          this.handlePlayButton();
        }
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'menu-input-setup');
    }
  }

  /**
   * Handle play button click
   */
  private handlePlayButton(): void {
    if (this.isTransitioning) return;
    
    try {
      this.isTransitioning = true;
      
      // Button press animation
      this.tweens.add({
        targets: this.playButton,
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
      ErrorHandler.handleGameplayError(error as Error, 'menu-play-button-handler');
      this.scene.start('Game'); // Fallback
    }
  }

  /**
   * Start transition to game scene
   */
  private startGameTransition(): void {
    try {
      // Fade out all UI elements
      const uiElements = [
        this.titleText,
        this.playButton,
        this.highScoreText,
        this.instructionsText,
        this.statisticsText,
        this.settingsButton,
        this.characterButton
      ];
      
      this.tweens.add({
        targets: uiElements,
        alpha: 0,
        duration: 500,
        ease: 'Power2.easeOut'
      });
      
      // Camera fade out
      this.cameras.main.fadeOut(800, 0, 0, 0);
      
      this.cameras.main.once('camerafadeoutcomplete', () => {
        console.log('Starting Game scene');
        this.scene.start('Game');
      });
      
    } catch (error) {
      ErrorHandler.handleSceneError(error as Error, 'Menu-transition');
      this.scene.start('Game'); // Fallback
    }
  }

  /**
   * Play entrance animations
   */
  private playEntranceAnimations(): void {
    try {
      // Set initial states
      const elements = [
        this.titleText,
        this.playButton,
        this.highScoreText,
        this.instructionsText,
        this.statisticsText,
        this.settingsButton,
        this.characterButton
      ];
      
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
            alpha: element === this.statisticsText || element === this.instructionsText ? 0.8 : 1,
            scaleX: 1,
            scaleY: 1,
            duration: 600,
            delay: index * 150,
            ease: 'Back.easeOut'
          });
        }
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'menu-entrance-animations');
    }
  }

  /**
   * Show settings menu overlay
   */
  private showSettingsMenu(): void {
    try {
      // Create semi-transparent overlay
      const overlay = this.add.rectangle(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000000,
        0.7
      );
      overlay.setDepth(50);
      overlay.setInteractive();
      
      // Settings panel
      const panel = this.add.rectangle(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        400,
        300,
        0x2C3E50
      );
      panel.setDepth(51);
      panel.setStrokeStyle(3, 0xFFFFFF);
      
      // Settings title
      const settingsTitle = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 - 100,
        'Configuración',
        {
          fontSize: '28px',
          fontFamily: 'Arial',
          color: '#FFFFFF'
        }
      ).setOrigin(0.5);
      settingsTitle.setDepth(52);
      
      // Audio toggle
      const audioEnabled = StorageManager.getAudioEnabled();
      const audioButton = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 - 30,
        `Audio: ${audioEnabled ? 'ON' : 'OFF'}`,
        {
          fontSize: '20px',
          fontFamily: 'Arial',
          color: audioEnabled ? '#00FF00' : '#FF0000',
          backgroundColor: '#34495E',
          padding: { x: 15, y: 8 }
        }
      ).setOrigin(0.5);
      audioButton.setDepth(52);
      audioButton.setInteractive({ useHandCursor: true });
      
      audioButton.on('pointerdown', () => {
        const newState = !StorageManager.getAudioEnabled();
        StorageManager.setAudioEnabled(newState);
        audioButton.setText(`Audio: ${newState ? 'ON' : 'OFF'}`);
        audioButton.setStyle({ color: newState ? '#00FF00' : '#FF0000' });
      });
      
      // Close button
      const closeButton = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 + 80,
        'Cerrar',
        {
          fontSize: '20px',
          fontFamily: 'Arial',
          color: '#FFFFFF',
          backgroundColor: '#E74C3C',
          padding: { x: 20, y: 10 }
        }
      ).setOrigin(0.5);
      closeButton.setDepth(52);
      closeButton.setInteractive({ useHandCursor: true });
      
      const settingsElements = [overlay, panel, settingsTitle, audioButton, closeButton];
      
      closeButton.on('pointerdown', () => {
        settingsElements.forEach(element => element.destroy());
      });
      
      // Close on overlay click
      overlay.on('pointerdown', () => {
        settingsElements.forEach(element => element.destroy());
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'menu-settings');
    }
  }

  /**
   * Show character selector overlay
   */
  private showCharacterSelector(): void {
    try {
      // Create semi-transparent overlay
      const overlay = this.add.rectangle(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000000,
        0.7
      );
      overlay.setDepth(50);
      overlay.setInteractive();
      
      // Character selector panel
      const panel = this.add.rectangle(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        500,
        350,
        0x2C3E50
      );
      panel.setDepth(51);
      panel.setStrokeStyle(3, 0xFFFFFF);
      
      // Create character selector
      this.characterSelector.createSelector(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2
      );
      
      // Close button
      const closeButton = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 + 120,
        'Cerrar',
        {
          fontSize: '20px',
          fontFamily: 'Arial',
          color: '#FFFFFF',
          backgroundColor: '#E74C3C',
          padding: { x: 20, y: 10 }
        }
      ).setOrigin(0.5);
      closeButton.setDepth(52);
      closeButton.setInteractive({ useHandCursor: true });
      
      const selectorElements = [overlay, panel, closeButton];
      
      closeButton.on('pointerdown', () => {
        this.characterSelector.hide();
        selectorElements.forEach(element => element.destroy());
      });
      
      // Close on overlay click
      overlay.on('pointerdown', () => {
        this.characterSelector.hide();
        selectorElements.forEach(element => element.destroy());
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'menu-character-selector');
    }
  }

  /**
   * Create fallback menu if main creation fails
   */
  private createFallbackMenu(): void {
    try {
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;
      
      // Simple background
      this.add.rectangle(centerX, centerY, 800, 600, 0x87CEEB);
      
      // Simple title
      this.add.text(centerX, centerY - 100, 'Flappy Bird', {
        fontSize: '48px',
        color: '#FFFFFF'
      }).setOrigin(0.5);
      
      // Simple play button
      const playBtn = this.add.text(centerX, centerY, 'JUGAR', {
        fontSize: '32px',
        color: '#FFFFFF',
        backgroundColor: '#2E8B57',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setInteractive();
      
      playBtn.on('pointerdown', () => {
        this.scene.start('Game');
      });
      
    } catch (error) {
      ErrorHandler.handleSceneError(error as Error, 'Menu-fallback');
    }
  }

  /**
   * Update method for any continuous updates
   */
  update(): void {
    // Menu doesn't need continuous updates, but method is here for completeness
  }
}
