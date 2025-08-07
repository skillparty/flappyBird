import { AssetManifest } from '../types/GameTypes';
import { ASSET_CONFIG } from '../config/GameConfig';
import ErrorHandler from './ErrorHandler';

export default class AssetManager {
  private static instance: AssetManager;
  private scene: Phaser.Scene;
  private loadingProgress: number = 0;
  private totalAssets: number = 0;
  private loadedAssets: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  static getInstance(scene: Phaser.Scene): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager(scene);
    }
    AssetManager.instance.scene = scene;
    return AssetManager.instance;
  }

  /**
   * Load all game assets with progress tracking
   */
  loadAssets(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.setupProgressTracking();
        this.loadImages();
        this.loadAudio();
        this.createFallbackAssets();
        
        // Handle load completion
        this.scene.load.on('complete', () => {
          console.log('All assets loaded successfully');
          resolve();
        });

        // Handle load errors
        this.scene.load.on('loaderror', (file: any) => {
          console.warn(`Failed to load asset: ${file.key}`);
          ErrorHandler.handleAssetError(new Error(`Asset load failed: ${file.key}`), file.key);
        });

        // Start loading
        this.scene.load.start();
      } catch (error) {
        ErrorHandler.handleAssetError(error as Error, 'general');
        reject(error);
      }
    });
  }

  /**
   * Setup progress tracking for loading screen
   */
  private setupProgressTracking(): void {
    this.scene.load.on('progress', (progress: number) => {
      this.loadingProgress = progress;
      this.updateLoadingDisplay(progress);
    });

    this.scene.load.on('fileload', (file: any) => {
      this.loadedAssets++;
      console.log(`Loaded: ${file.key} (${this.loadedAssets}/${this.totalAssets})`);
    });
  }

  /**
   * Load all image assets
   */
  private loadImages(): void {
    const images = ASSET_CONFIG.images;
    
    Object.entries(images).forEach(([key, path]) => {
      try {
        this.scene.load.image(key, path);
        this.totalAssets++;
      } catch (error) {
        console.warn(`Failed to queue image: ${key}`, error);
        ErrorHandler.handleAssetError(error as Error, key);
      }
    });
  }

  /**
   * Load all audio assets
   */
  private loadAudio(): void {
    const audio = ASSET_CONFIG.audio;
    
    Object.entries(audio).forEach(([key, path]) => {
      try {
        this.scene.load.audio(key, path);
        this.totalAssets++;
      } catch (error) {
        console.warn(`Failed to queue audio: ${key}`, error);
        ErrorHandler.handleAssetError(error as Error, key);
      }
    });
  }

  /**
   * Create fallback assets using graphics
   */
  private createFallbackAssets(): void {
    const graphics = this.scene.add.graphics();
    
    try {
      // Fallback bird sprite
      graphics.fillStyle(0xFFD700); // Gold color
      graphics.fillRect(0, 0, 32, 24);
      graphics.generateTexture('bird-fallback', 32, 24);
      
      // Fallback pipe sprite
      graphics.fillStyle(0x228B22); // Forest green
      graphics.fillRect(0, 0, 52, 320);
      graphics.generateTexture('pipe-fallback', 52, 320);
      
      // Fallback background
      graphics.fillStyle(0x87CEEB); // Sky blue
      graphics.fillRect(0, 0, 800, 600);
      graphics.generateTexture('background-fallback', 800, 600);
      
      // Fallback ground
      graphics.fillStyle(0x8B4513); // Saddle brown
      graphics.fillRect(0, 0, 800, 50);
      graphics.generateTexture('ground-fallback', 800, 50);
      
      // Character skin fallbacks
      graphics.fillStyle(0xFFFF00); // Yellow
      graphics.fillRect(0, 0, 32, 24);
      graphics.generateTexture('birdYellow-fallback', 32, 24);
      
      graphics.fillStyle(0x0000FF); // Blue
      graphics.fillRect(0, 0, 32, 24);
      graphics.generateTexture('birdBlue-fallback', 32, 24);
      
      graphics.fillStyle(0xFF0000); // Red
      graphics.fillRect(0, 0, 32, 24);
      graphics.generateTexture('birdRed-fallback', 32, 24);
      
    } catch (error) {
      console.error('Failed to create fallback assets:', error);
      ErrorHandler.handleAssetError(error as Error, 'fallback-creation');
    } finally {
      graphics.destroy();
    }
  }

  /**
   * Update loading display
   */
  private updateLoadingDisplay(progress: number): void {
    const loadingElement = document.getElementById('loading-indicator');
    if (loadingElement) {
      const progressText = loadingElement.querySelector('p');
      if (progressText) {
        progressText.textContent = `Cargando... ${Math.round(progress * 100)}%`;
      }
    }
  }

  /**
   * Hide loading indicator
   */
  hideLoadingIndicator(): void {
    const loadingElement = document.getElementById('loading-indicator');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }

  /**
   * Check if asset exists, return fallback if not
   */
  getAssetKey(originalKey: string): string {
    if (this.scene.textures.exists(originalKey)) {
      return originalKey;
    }
    
    const fallbackKey = `${originalKey}-fallback`;
    if (this.scene.textures.exists(fallbackKey)) {
      console.warn(`Using fallback asset for: ${originalKey}`);
      return fallbackKey;
    }
    
    console.error(`No asset or fallback found for: ${originalKey}`);
    return 'bird-fallback'; // Ultimate fallback
  }

  /**
   * Preload essential assets for immediate use
   */
  preloadEssentialAssets(): void {
    const graphics = this.scene.add.graphics();
    
    // Create minimal assets for immediate gameplay
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
    
    graphics.destroy();
  }

  /**
   * Get loading progress
   */
  getLoadingProgress(): number {
    return this.loadingProgress;
  }

  /**
   * Check if all assets are loaded
   */
  isLoadingComplete(): boolean {
    return this.loadingProgress >= 1.0;
  }
}