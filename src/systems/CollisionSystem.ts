import Bird from '../components/Bird';
import PipeManager from '../components/PipeManager';
import { GAME_CONFIG, GAME_CONSTANTS } from '../config/GameConfig';
import ErrorHandler from '../managers/ErrorHandler';

export interface CollisionResult {
  hasCollision: boolean;
  collisionType: 'pipe' | 'ground' | 'ceiling' | 'none';
  collisionPoint?: { x: number; y: number };
}

export default class CollisionSystem {
  private scene: Phaser.Scene;
  private bird: Bird;
  private pipeManager: PipeManager;
  private ground?: Phaser.Physics.Arcade.Sprite;
  private isActive: boolean;
  private onCollisionCallback?: (result: CollisionResult) => void;

  constructor(scene: Phaser.Scene, bird: Bird, pipeManager: PipeManager) {
    this.scene = scene;
    this.bird = bird;
    this.pipeManager = pipeManager;
    this.isActive = true;
    
    this.setupCollisionDetection();
  }

  /**
   * Setup collision detection systems
   */
  private setupCollisionDetection(): void {
    try {
      // Create ground collision body
      this.createGroundCollision();
      
      console.log('Collision system initialized');
    } catch (error) {
      ErrorHandler.handlePhysicsError(error as Error, 'collision-system-setup');
    }
  }

  /**
   * Create ground collision detection
   */
  private createGroundCollision(): void {
    try {
      const groundY = GAME_CONFIG.visual.canvasHeight - GAME_CONSTANTS.GROUND_HEIGHT / 2;
      
      this.ground = this.scene.physics.add.sprite(
        GAME_CONFIG.visual.canvasWidth / 2,
        groundY,
        'ground'
      );
      
      if (this.ground.body) {
        const body = this.ground.body as Phaser.Physics.Arcade.Body;
        body.setImmovable(true);
        body.setSize(GAME_CONFIG.visual.canvasWidth, GAME_CONSTANTS.GROUND_HEIGHT);
      }
      
      // Make ground invisible (we'll use a visual ground elsewhere)
      this.ground.setVisible(false);
      
    } catch (error) {
      ErrorHandler.handlePhysicsError(error as Error, 'ground-collision-setup');
    }
  }

  /**
   * Check all collision types
   */
  checkCollisions(): CollisionResult {
    if (!this.isActive || !this.bird.getIsAlive()) {
      return { hasCollision: false, collisionType: 'none' };
    }

    try {
      // Check pipe collisions
      const pipeCollision = this.checkPipeCollisions();
      if (pipeCollision.hasCollision) {
        return pipeCollision;
      }

      // Check ground collision
      const groundCollision = this.checkGroundCollision();
      if (groundCollision.hasCollision) {
        return groundCollision;
      }

      // Check ceiling collision
      const ceilingCollision = this.checkCeilingCollision();
      if (ceilingCollision.hasCollision) {
        return ceilingCollision;
      }

      return { hasCollision: false, collisionType: 'none' };
      
    } catch (error) {
      ErrorHandler.handlePhysicsError(error as Error, 'collision-check');
      return { hasCollision: false, collisionType: 'none' };
    }
  }

  /**
   * Check collision with pipes
   */
  private checkPipeCollisions(): CollisionResult {
    try {
      const hasCollision = this.pipeManager.checkCollisions(this.bird);
      
      if (hasCollision) {
        return {
          hasCollision: true,
          collisionType: 'pipe',
          collisionPoint: { x: this.bird.x, y: this.bird.y }
        };
      }
      
      return { hasCollision: false, collisionType: 'none' };
    } catch (error) {
      ErrorHandler.handlePhysicsError(error as Error, 'pipe-collision-check');
      return { hasCollision: false, collisionType: 'none' };
    }
  }

  /**
   * Check collision with ground
   */
  private checkGroundCollision(): CollisionResult {
    try {
      if (!this.ground) {
        // Fallback: check Y position
        const groundY = GAME_CONFIG.visual.canvasHeight - GAME_CONSTANTS.GROUND_HEIGHT;
        if (this.bird.y >= groundY) {
          return {
            hasCollision: true,
            collisionType: 'ground',
            collisionPoint: { x: this.bird.x, y: groundY }
          };
        }
        return { hasCollision: false, collisionType: 'none' };
      }

      // Use physics overlap detection
      const hasCollision = this.scene.physics.overlap(this.bird, this.ground);
      
      if (hasCollision) {
        return {
          hasCollision: true,
          collisionType: 'ground',
          collisionPoint: { x: this.bird.x, y: this.ground.y }
        };
      }
      
      return { hasCollision: false, collisionType: 'none' };
    } catch (error) {
      ErrorHandler.handlePhysicsError(error as Error, 'ground-collision-check');
      return { hasCollision: false, collisionType: 'none' };
    }
  }

  /**
   * Check collision with ceiling
   */
  private checkCeilingCollision(): CollisionResult {
    try {
      const ceilingY = 0;
      const birdTop = this.bird.y - (this.bird.height * this.bird.scaleY) / 2;
      
      if (birdTop <= ceilingY) {
        return {
          hasCollision: true,
          collisionType: 'ceiling',
          collisionPoint: { x: this.bird.x, y: ceilingY }
        };
      }
      
      return { hasCollision: false, collisionType: 'none' };
    } catch (error) {
      ErrorHandler.handlePhysicsError(error as Error, 'ceiling-collision-check');
      return { hasCollision: false, collisionType: 'none' };
    }
  }

  /**
   * Handle collision event
   */
  handleCollision(result: CollisionResult): void {
    if (!result.hasCollision) return;

    try {
      console.log(`Collision detected: ${result.collisionType} at`, result.collisionPoint);
      
      // Play hit sound
      try {
        const AudioManager = require('../managers/AudioManager').default;
        const audioManager = AudioManager.getInstance();
        audioManager.playHit();
      } catch (audioError) {
        // Audio is optional, continue without it
      }
      
      // Stop bird movement
      this.bird.die();
      
      // Stop pipe movement
      this.pipeManager.stop();
      
      // Deactivate collision system
      this.isActive = false;
      
      // Create collision effect
      this.createCollisionEffect(result);
      
      // Trigger callback
      if (this.onCollisionCallback) {
        this.onCollisionCallback(result);
      }
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'collision-handling');
    }
  }

  /**
   * Create visual collision effect
   */
  private createCollisionEffect(result: CollisionResult): void {
    if (!result.collisionPoint) return;

    try {
      const { x, y } = result.collisionPoint;
      
      // Create impact particles
      this.createImpactParticles(x, y);
      
      // Screen shake effect
      this.createScreenShake();
      
      // Flash effect
      this.createFlashEffect();
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'collision-effect');
    }
  }

  /**
   * Create impact particle effect
   */
  private createImpactParticles(x: number, y: number): void {
    try {
      // Create simple particle effect using graphics
      const particles = this.scene.add.graphics();
      particles.setDepth(50);
      
      // Create multiple small particles
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 30;
        const particleX = x + Math.cos(angle) * distance;
        const particleY = y + Math.sin(angle) * distance;
        
        particles.fillStyle(0xFF6B6B);
        particles.fillCircle(particleX, particleY, 3);
      }
      
      // Animate particles
      this.scene.tweens.add({
        targets: particles,
        alpha: 0,
        scaleX: 2,
        scaleY: 2,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          particles.destroy();
        }
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'impact-particles');
    }
  }

  /**
   * Create screen shake effect
   */
  private createScreenShake(): void {
    try {
      const camera = this.scene.cameras.main;
      
      camera.shake(300, 0.02, false, (camera, progress) => {
        if (progress >= 1) {
          console.log('Screen shake completed');
        }
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'screen-shake');
    }
  }

  /**
   * Create flash effect
   */
  private createFlashEffect(): void {
    try {
      const camera = this.scene.cameras.main;
      
      camera.flash(200, 255, 100, 100, false, (camera, progress) => {
        if (progress >= 1) {
          console.log('Flash effect completed');
        }
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'flash-effect');
    }
  }

  /**
   * Set collision callback
   */
  setOnCollision(callback: (result: CollisionResult) => void): void {
    this.onCollisionCallback = callback;
  }

  /**
   * Reset collision system
   */
  reset(): void {
    try {
      this.isActive = true;
      console.log('Collision system reset');
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'collision-system-reset');
    }
  }

  /**
   * Activate collision detection
   */
  activate(): void {
    this.isActive = true;
  }

  /**
   * Deactivate collision detection
   */
  deactivate(): void {
    this.isActive = false;
  }

  /**
   * Check if collision system is active
   */
  isCollisionActive(): boolean {
    return this.isActive;
  }

  /**
   * Get collision bounds for debugging
   */
  getCollisionBounds(): {
    bird: Phaser.Geom.Rectangle;
    ground: Phaser.Geom.Rectangle;
    pipes: Phaser.Geom.Rectangle[];
  } {
    try {
      const birdBounds = this.bird.getBounds();
      
      const groundBounds = new Phaser.Geom.Rectangle(
        0,
        GAME_CONFIG.visual.canvasHeight - GAME_CONSTANTS.GROUND_HEIGHT,
        GAME_CONFIG.visual.canvasWidth,
        GAME_CONSTANTS.GROUND_HEIGHT
      );
      
      const pipeBounds: Phaser.Geom.Rectangle[] = [];
      const pipeSprites = this.pipeManager.getAllPipeSprites();
      
      pipeSprites.forEach(pipe => {
        if (pipe.active) {
          pipeBounds.push(pipe.getBounds());
        }
      });
      
      return {
        bird: birdBounds,
        ground: groundBounds,
        pipes: pipeBounds
      };
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'get-collision-bounds');
      return {
        bird: new Phaser.Geom.Rectangle(0, 0, 0, 0),
        ground: new Phaser.Geom.Rectangle(0, 0, 0, 0),
        pipes: []
      };
    }
  }

  /**
   * Cleanup collision system
   */
  destroy(): void {
    try {
      this.isActive = false;
      
      if (this.ground) {
        this.ground.destroy();
        this.ground = undefined;
      }
      
      this.onCollisionCallback = undefined;
      
      console.log('Collision system destroyed');
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'collision-system-destroy');
    }
  }
}