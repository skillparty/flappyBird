import { GAME_CONFIG } from '../config/GameConfig';
import ErrorHandler from '../managers/ErrorHandler';

interface ParallaxLayer {
  sprite: Phaser.GameObjects.TileSprite;
  speed: number;
  depth: number;
}

export default class ParallaxBackground {
  private scene: Phaser.Scene;
  private layers: ParallaxLayer[] = [];
  private isActive: boolean = true;
  private baseSpeed: number = 1;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupLayers();
  }

  /**
   * Setup parallax layers
   */
  private setupLayers(): void {
    try {
      // Create multiple background layers for depth effect
      this.createSkyLayer();
      this.createCloudLayers();
      this.createMountainLayers();
      this.createTreeLayer();
      
      console.log(`Parallax background created with ${this.layers.length} layers`);
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'parallax-setup');
    }
  }

  /**
   * Create sky layer (static background)
   */
  private createSkyLayer(): void {
    try {
      // Create sky gradient using graphics
      const skyGraphics = this.scene.add.graphics();
      
      // Create gradient from light blue to darker blue
      const gradient = skyGraphics.createLinearGradient(
        0, 0, 0, GAME_CONFIG.visual.canvasHeight
      );
      gradient.addColorStop(0, '#87CEEB'); // Sky blue
      gradient.addColorStop(1, '#4682B4'); // Steel blue
      
      skyGraphics.fillGradientStyle(gradient);
      skyGraphics.fillRect(0, 0, GAME_CONFIG.visual.canvasWidth, GAME_CONFIG.visual.canvasHeight);
      skyGraphics.generateTexture('sky-gradient', GAME_CONFIG.visual.canvasWidth, GAME_CONFIG.visual.canvasHeight);
      skyGraphics.destroy();
      
      // Create sky layer
      const skyLayer = this.scene.add.tileSprite(
        0, 0,
        GAME_CONFIG.visual.canvasWidth,
        GAME_CONFIG.visual.canvasHeight,
        'sky-gradient'
      );
      skyLayer.setOrigin(0, 0);
      skyLayer.setDepth(-50);
      
      // Sky doesn't move (speed 0)
      this.layers.push({
        sprite: skyLayer,
        speed: 0,
        depth: -50
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'parallax-sky-layer');
    }
  }

  /**
   * Create cloud layers for atmospheric depth
   */
  private createCloudLayers(): void {
    try {
      // Create cloud textures
      this.createCloudTextures();
      
      // Far clouds (slow movement)
      const farClouds = this.scene.add.tileSprite(
        0, 50,
        GAME_CONFIG.visual.canvasWidth * 2,
        150,
        'clouds-far'
      );
      farClouds.setOrigin(0, 0);
      farClouds.setDepth(-40);
      farClouds.setAlpha(0.6);
      
      this.layers.push({
        sprite: farClouds,
        speed: 0.2,
        depth: -40
      });
      
      // Near clouds (medium movement)
      const nearClouds = this.scene.add.tileSprite(
        0, 80,
        GAME_CONFIG.visual.canvasWidth * 2,
        120,
        'clouds-near'
      );
      nearClouds.setOrigin(0, 0);
      nearClouds.setDepth(-35);
      nearClouds.setAlpha(0.8);
      
      this.layers.push({
        sprite: nearClouds,
        speed: 0.5,
        depth: -35
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'parallax-cloud-layers');
    }
  }

  /**
   * Create cloud textures using graphics
   */
  private createCloudTextures(): void {
    try {
      const graphics = this.scene.add.graphics();
      
      // Far clouds texture
      graphics.clear();
      graphics.fillStyle(0xFFFFFF, 0.8);
      
      // Draw several cloud shapes
      for (let i = 0; i < 5; i++) {
        const x = i * 160;
        const y = Math.random() * 50;
        
        // Cloud made of overlapping circles
        graphics.fillCircle(x + 20, y + 30, 15);
        graphics.fillCircle(x + 35, y + 25, 20);
        graphics.fillCircle(x + 50, y + 30, 18);
        graphics.fillCircle(x + 65, y + 35, 12);
      }
      
      graphics.generateTexture('clouds-far', 800, 150);
      
      // Near clouds texture (larger, more defined)
      graphics.clear();
      graphics.fillStyle(0xFFFFFF, 0.9);
      
      for (let i = 0; i < 4; i++) {
        const x = i * 200;
        const y = Math.random() * 30;
        
        // Larger cloud shapes
        graphics.fillCircle(x + 30, y + 40, 25);
        graphics.fillCircle(x + 55, y + 35, 30);
        graphics.fillCircle(x + 80, y + 40, 28);
        graphics.fillCircle(x + 105, y + 45, 20);
      }
      
      graphics.generateTexture('clouds-near', 800, 120);
      graphics.destroy();
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'parallax-cloud-textures');
    }
  }

  /**
   * Create mountain layers for background depth
   */
  private createMountainLayers(): void {
    try {
      // Create mountain textures
      this.createMountainTextures();
      
      // Far mountains (very slow movement)
      const farMountains = this.scene.add.tileSprite(
        0, GAME_CONFIG.visual.canvasHeight - 250,
        GAME_CONFIG.visual.canvasWidth * 2,
        200,
        'mountains-far'
      );
      farMountains.setOrigin(0, 0);
      farMountains.setDepth(-30);
      farMountains.setAlpha(0.7);
      
      this.layers.push({
        sprite: farMountains,
        speed: 0.3,
        depth: -30
      });
      
      // Near mountains (slow movement)
      const nearMountains = this.scene.add.tileSprite(
        0, GAME_CONFIG.visual.canvasHeight - 200,
        GAME_CONFIG.visual.canvasWidth * 2,
        150,
        'mountains-near'
      );
      nearMountains.setOrigin(0, 0);
      nearMountains.setDepth(-25);
      nearMountains.setAlpha(0.8);
      
      this.layers.push({
        sprite: nearMountains,
        speed: 0.7,
        depth: -25
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'parallax-mountain-layers');
    }
  }

  /**
   * Create mountain textures using graphics
   */
  private createMountainTextures(): void {
    try {
      const graphics = this.scene.add.graphics();
      
      // Far mountains (lighter, more distant)
      graphics.clear();
      graphics.fillStyle(0x8A9BA8, 1.0); // Light blue-gray
      
      // Draw mountain silhouette
      graphics.beginPath();
      graphics.moveTo(0, 200);
      
      for (let x = 0; x <= 800; x += 50) {
        const height = 100 + Math.sin(x * 0.01) * 50 + Math.random() * 30;
        graphics.lineTo(x, 200 - height);
      }
      
      graphics.lineTo(800, 200);
      graphics.closePath();
      graphics.fillPath();
      
      graphics.generateTexture('mountains-far', 800, 200);
      
      // Near mountains (darker, more prominent)
      graphics.clear();
      graphics.fillStyle(0x5F6F7A, 1.0); // Darker blue-gray
      
      graphics.beginPath();
      graphics.moveTo(0, 150);
      
      for (let x = 0; x <= 800; x += 40) {
        const height = 80 + Math.sin(x * 0.015) * 40 + Math.random() * 25;
        graphics.lineTo(x, 150 - height);
      }
      
      graphics.lineTo(800, 150);
      graphics.closePath();
      graphics.fillPath();
      
      graphics.generateTexture('mountains-near', 800, 150);
      graphics.destroy();
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'parallax-mountain-textures');
    }
  }

  /**
   * Create tree/vegetation layer
   */
  private createTreeLayer(): void {
    try {
      // Create tree texture
      this.createTreeTexture();
      
      // Tree layer (medium-fast movement)
      const treeLayer = this.scene.add.tileSprite(
        0, GAME_CONFIG.visual.canvasHeight - 120,
        GAME_CONFIG.visual.canvasWidth * 2,
        70,
        'trees'
      );
      treeLayer.setOrigin(0, 0);
      treeLayer.setDepth(-15);
      
      this.layers.push({
        sprite: treeLayer,
        speed: 1.2,
        depth: -15
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'parallax-tree-layer');
    }
  }

  /**
   * Create tree texture using graphics
   */
  private createTreeTexture(): void {
    try {
      const graphics = this.scene.add.graphics();
      
      graphics.clear();
      
      // Draw simple tree silhouettes
      for (let i = 0; i < 15; i++) {
        const x = i * 55 + Math.random() * 20;
        const treeHeight = 40 + Math.random() * 20;
        
        // Tree trunk
        graphics.fillStyle(0x4A4A4A, 1.0); // Dark gray
        graphics.fillRect(x + 8, 70 - treeHeight, 4, treeHeight);
        
        // Tree foliage
        graphics.fillStyle(0x228B22, 1.0); // Forest green
        graphics.fillCircle(x + 10, 70 - treeHeight + 5, 12);
        graphics.fillCircle(x + 5, 70 - treeHeight + 10, 10);
        graphics.fillCircle(x + 15, 70 - treeHeight + 10, 10);
      }
      
      graphics.generateTexture('trees', 800, 70);
      graphics.destroy();
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'parallax-tree-texture');
    }
  }

  /**
   * Update all parallax layers
   */
  update(): void {
    if (!this.isActive) return;

    try {
      this.layers.forEach(layer => {
        if (layer.speed > 0) {
          layer.sprite.tilePositionX += layer.speed * this.baseSpeed;
        }
      });
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'parallax-update');
    }
  }

  /**
   * Set the base speed multiplier for all layers
   */
  setSpeed(speed: number): void {
    try {
      this.baseSpeed = Math.max(0, speed);
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'parallax-set-speed');
    }
  }

  /**
   * Add a custom layer
   */
  addLayer(texture: string, speed: number, depth: number = 0, alpha: number = 1): void {
    try {
      const layer = this.scene.add.tileSprite(
        0, 0,
        GAME_CONFIG.visual.canvasWidth * 2,
        GAME_CONFIG.visual.canvasHeight,
        texture
      );
      
      layer.setOrigin(0, 0);
      layer.setDepth(depth);
      layer.setAlpha(alpha);
      
      this.layers.push({
        sprite: layer,
        speed,
        depth
      });
      
      // Sort layers by depth
      this.layers.sort((a, b) => a.depth - b.depth);
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'parallax-add-layer');
    }
  }

  /**
   * Pause parallax movement
   */
  pause(): void {
    this.isActive = false;
  }

  /**
   * Resume parallax movement
   */
  resume(): void {
    this.isActive = true;
  }

  /**
   * Stop all movement
   */
  stop(): void {
    this.isActive = false;
    this.baseSpeed = 0;
  }

  /**
   * Reset parallax positions
   */
  reset(): void {
    try {
      this.layers.forEach(layer => {
        layer.sprite.tilePositionX = 0;
      });
      
      this.baseSpeed = 1;
      this.isActive = true;
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'parallax-reset');
    }
  }

  /**
   * Get layer count
   */
  getLayerCount(): number {
    return this.layers.length;
  }

  /**
   * Set visibility of all layers
   */
  setVisible(visible: boolean): void {
    try {
      this.layers.forEach(layer => {
        layer.sprite.setVisible(visible);
      });
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'parallax-set-visible');
    }
  }

  /**
   * Cleanup parallax background
   */
  destroy(): void {
    try {
      this.layers.forEach(layer => {
        layer.sprite.destroy();
      });
      
      this.layers = [];
      this.isActive = false;
      
      console.log('Parallax background destroyed');
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'parallax-destroy');
    }
  }
}