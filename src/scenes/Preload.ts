import 'phaser';
import AssetManager from '../managers/AssetManager';
import ErrorHandler from '../managers/ErrorHandler';

export default class Preload extends Phaser.Scene {
  private assetManager!: AssetManager;
  private loadingText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;

  constructor() {
    super('Preload');
  }

  preload() {
    console.log('Preload scene started');
    
    try {
      // Initialize asset manager
      this.assetManager = AssetManager.getInstance(this);
      
      // Create loading UI
      this.createLoadingUI();
      
      // Setup progress tracking
      this.setupProgressTracking();
      
      // Create fallback assets immediately for essential gameplay
      this.assetManager.preloadEssentialAssets();
      
      // Load all assets
      this.assetManager.loadAssets()
        .then(() => {
          console.log('Asset loading completed successfully');
          this.completeLoading();
        })
        .catch((error) => {
          console.warn('Asset loading failed, using fallbacks:', error);
          ErrorHandler.handleAssetError(error, 'preload-general');
          this.completeLoading(); // Continue with fallbacks
        });
        
    } catch (error) {
      console.error('Critical error in preload:', error);
      ErrorHandler.handleSceneError(error as Error, 'Preload');
      
      // Create minimal fallback assets and continue
      this.createMinimalAssets();
      this.completeLoading();
    }
  }

  /**
   * Create loading screen UI
   */
  private createLoadingUI(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Background
    this.add.rectangle(centerX, centerY, 800, 600, 0x87CEEB);

    // Title
    this.add.text(centerX, centerY - 100, 'Flappy Bird', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Loading text
    this.loadingText = this.add.text(centerX, centerY + 50, 'Cargando... 0%', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // Progress bar background
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222);
    this.progressBox.fillRect(centerX - 160, centerY + 80, 320, 20);

    // Progress bar
    this.progressBar = this.add.graphics();
  }

  /**
   * Setup progress tracking for visual feedback
   */
  private setupProgressTracking(): void {
    this.load.on('progress', (progress: number) => {
      this.updateProgressBar(progress);
    });

    this.load.on('fileload', (file: any) => {
      console.log(`Loaded: ${file.key}`);
    });

    this.load.on('loaderror', (file: any) => {
      console.warn(`Failed to load: ${file.key}`);
      ErrorHandler.handleAssetError(new Error(`Failed to load ${file.key}`), file.key);
    });
  }

  /**
   * Update progress bar visual
   */
  private updateProgressBar(progress: number): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Update progress bar
    this.progressBar.clear();
    this.progressBar.fillStyle(0x00FF00);
    this.progressBar.fillRect(centerX - 158, centerY + 82, 316 * progress, 16);

    // Update loading text
    this.loadingText.setText(`Cargando... ${Math.round(progress * 100)}%`);
  }

  /**
   * Complete loading and transition to menu
   */
  private completeLoading(): void {
    // Hide HTML loading indicator
    this.assetManager.hideLoadingIndicator();
    
    // Small delay for smooth transition
    this.time.delayedCall(500, () => {
      console.log('Preload complete - starting Menu scene');
      this.scene.start('Menu');
    });
  }

  /**
   * Create minimal assets as ultimate fallback
   */
  private createMinimalAssets(): void {
    const graphics = this.add.graphics();
    
    try {
      // Essential game sprites
      graphics.fillStyle(0xFFD700);
      graphics.fillRect(0, 0, 32, 24);
      graphics.generateTexture('bird', 32, 24);
      
      graphics.fillStyle(0x228B22);
      graphics.fillRect(0, 0, 52, 320);
      graphics.generateTexture('pipe', 52, 320);
      
      graphics.fillStyle(0x87CEEB);
      graphics.fillRect(0, 0, 800, 600);
      graphics.generateTexture('background', 800, 600);
      
      graphics.fillStyle(0x8B4513);
      graphics.fillRect(0, 0, 800, 50);
      graphics.generateTexture('ground', 800, 50);
      
      console.log('Minimal fallback assets created');
    } catch (error) {
      console.error('Failed to create minimal assets:', error);
      ErrorHandler.handleAssetError(error as Error, 'minimal-assets');
    } finally {
      graphics.destroy();
    }
  }
}
