import { PipeConfig } from '../types/GameTypes';
import { GAME_CONFIG, GAME_CONSTANTS } from '../config/GameConfig';
import ErrorHandler from '../managers/ErrorHandler';
import Bird from './Bird';

interface PipePair {
  top: Phaser.Physics.Arcade.Sprite;
  bottom: Phaser.Physics.Arcade.Sprite;
  scored: boolean;
  id: number;
}

export default class PipeManager {
  private scene: Phaser.Scene;
  private config: PipeConfig;
  private activePipes: PipePair[];
  private pipePool: Phaser.Physics.Arcade.Sprite[];
  private lastSpawnTime: number;
  private pipeIdCounter: number;
  private isActive: boolean;

  constructor(scene: Phaser.Scene, config?: Partial<PipeConfig>) {
    this.scene = scene;
    this.config = {
      speed: config?.speed || GAME_CONFIG.physics.pipeSpeed,
      gap: config?.gap || GAME_CONFIG.gameplay.pipeGap,
      spawnInterval: config?.spawnInterval || GAME_CONFIG.gameplay.pipeSpawnInterval,
      minHeight: config?.minHeight || 100,
      maxHeight: config?.maxHeight || 400
    };
    
    this.activePipes = [];
    this.pipePool = [];
    this.lastSpawnTime = 0;
    this.pipeIdCounter = 0;
    this.isActive = true;

    this.initializePipePool();
  }

  /**
   * Initialize object pool for pipe sprites
   */
  private initializePipePool(): void {
    try {
      const poolSize = 10; // Enough for smooth gameplay
      
      for (let i = 0; i < poolSize; i++) {
        const pipe = this.createPipeSprite();
        pipe.setVisible(false);
        pipe.setActive(false);
        this.pipePool.push(pipe);
      }
      
      console.log(`Pipe pool initialized with ${poolSize} sprites`);
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'pipe-pool-init');
    }
  }

  /**
   * Create a single pipe sprite
   */
  private createPipeSprite(): Phaser.Physics.Arcade.Sprite {
    const pipe = this.scene.physics.add.sprite(0, 0, 'pipe');
    pipe.setScale(GAME_CONSTANTS.PIPE_SCALE);
    pipe.setOrigin(0.5, 0);
    pipe.body?.setImmovable(true);
    return pipe;
  }

  /**
   * Get a pipe from the pool or create a new one
   */
  private getPipeFromPool(): Phaser.Physics.Arcade.Sprite {
    // Try to get from pool first
    const pooledPipe = this.pipePool.find(pipe => !pipe.active);
    
    if (pooledPipe) {
      pooledPipe.setActive(true);
      pooledPipe.setVisible(true);
      return pooledPipe;
    }
    
    // Create new pipe if pool is exhausted
    console.warn('Pipe pool exhausted, creating new pipe');
    const newPipe = this.createPipeSprite();
    this.pipePool.push(newPipe);
    return newPipe;
  }

  /**
   * Return a pipe to the pool
   */
  private returnPipeToPool(pipe: Phaser.Physics.Arcade.Sprite): void {
    pipe.setActive(false);
    pipe.setVisible(false);
    pipe.setPosition(-100, -100); // Move off-screen
    pipe.body?.setVelocity(0, 0);
  }

  /**
   * Generate a new pipe pair
   */
  generatePipe(): void {
    if (!this.isActive) return;

    try {
      const currentTime = this.scene.time.now;
      
      // Check if enough time has passed since last spawn
      if (currentTime - this.lastSpawnTime < this.config.spawnInterval) {
        return;
      }

      // Calculate random gap position
      const gapCenter = Phaser.Math.Between(
        this.config.minHeight + this.config.gap / 2,
        this.config.maxHeight - this.config.gap / 2
      );

      // Get pipes from pool
      const topPipe = this.getPipeFromPool();
      const bottomPipe = this.getPipeFromPool();

      // Position top pipe
      topPipe.setPosition(GAME_CONSTANTS.PIPE_SPAWN_X, gapCenter - this.config.gap / 2);
      topPipe.setFlipY(true);
      topPipe.setOrigin(0.5, 1); // Bottom of sprite for top pipe

      // Position bottom pipe
      bottomPipe.setPosition(GAME_CONSTANTS.PIPE_SPAWN_X, gapCenter + this.config.gap / 2);
      bottomPipe.setOrigin(0.5, 0); // Top of sprite for bottom pipe

      // Set physics properties
      if (topPipe.body && bottomPipe.body) {
        const topBody = topPipe.body as Phaser.Physics.Arcade.Body;
        const bottomBody = bottomPipe.body as Phaser.Physics.Arcade.Body;
        
        topBody.setVelocityX(this.config.speed);
        bottomBody.setVelocityX(this.config.speed);
        topBody.setImmovable(true);
        bottomBody.setImmovable(true);
      }

      // Create pipe pair object
      const pipePair: PipePair = {
        top: topPipe,
        bottom: bottomPipe,
        scored: false,
        id: this.pipeIdCounter++
      };

      this.activePipes.push(pipePair);
      this.lastSpawnTime = currentTime;

      console.log(`Generated pipe pair ${pipePair.id} at gap center: ${gapCenter}`);
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'pipe-generation');
    }
  }

  /**
   * Update all active pipes
   */
  updatePipes(): void {
    if (!this.isActive) return;

    try {
      // Update pipe positions and remove off-screen pipes
      this.activePipes = this.activePipes.filter(pipePair => {
        const pipe = pipePair.top;
        
        // Check if pipe is off-screen
        if (pipe.x < -GAME_CONSTANTS.PIPE_WIDTH) {
          this.returnPipeToPool(pipePair.top);
          this.returnPipeToPool(pipePair.bottom);
          return false; // Remove from active pipes
        }
        
        return true; // Keep pipe
      });

      // Generate new pipes if needed
      this.generatePipe();
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'pipe-update');
    }
  }

  /**
   * Check collisions with bird
   */
  checkCollisions(bird: Bird): boolean {
    if (!this.isActive || !bird.getIsAlive()) return false;

    try {
      for (const pipePair of this.activePipes) {
        // Check collision with top pipe
        if (this.scene.physics.overlap(bird, pipePair.top)) {
          console.log(`Collision detected with top pipe ${pipePair.id}`);
          return true;
        }
        
        // Check collision with bottom pipe
        if (this.scene.physics.overlap(bird, pipePair.bottom)) {
          console.log(`Collision detected with bottom pipe ${pipePair.id}`);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      ErrorHandler.handlePhysicsError(error as Error, 'pipe-collision-check');
      return false;
    }
  }

  /**
   * Check if bird has passed a pipe for scoring
   */
  checkScoring(bird: Bird): boolean {
    if (!this.isActive || !bird.getIsAlive()) return false;

    try {
      for (const pipePair of this.activePipes) {
        // Check if bird has passed this pipe and hasn't been scored yet
        if (!pipePair.scored && bird.x > pipePair.top.x + GAME_CONSTANTS.PIPE_WIDTH / 2) {
          pipePair.scored = true;
          console.log(`Bird passed pipe ${pipePair.id} - score!`);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'pipe-scoring-check');
      return false;
    }
  }

  /**
   * Reset pipe manager to initial state
   */
  reset(): void {
    try {
      // Return all active pipes to pool
      for (const pipePair of this.activePipes) {
        this.returnPipeToPool(pipePair.top);
        this.returnPipeToPool(pipePair.bottom);
      }
      
      // Clear active pipes array
      this.activePipes = [];
      
      // Reset timing
      this.lastSpawnTime = 0;
      this.pipeIdCounter = 0;
      
      // Reactivate manager
      this.isActive = true;
      
      console.log('Pipe manager reset');
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'pipe-manager-reset');
    }
  }

  /**
   * Stop pipe generation and movement
   */
  stop(): void {
    this.isActive = false;
    
    try {
      // Stop all pipe movement
      for (const pipePair of this.activePipes) {
        if (pipePair.top.body && pipePair.bottom.body) {
          const topBody = pipePair.top.body as Phaser.Physics.Arcade.Body;
          const bottomBody = pipePair.bottom.body as Phaser.Physics.Arcade.Body;
          
          topBody.setVelocity(0, 0);
          bottomBody.setVelocity(0, 0);
        }
      }
    } catch (error) {
      ErrorHandler.handlePhysicsError(error as Error, 'pipe-manager-stop');
    }
  }

  /**
   * Resume pipe generation and movement
   */
  resume(): void {
    this.isActive = true;
    
    try {
      // Resume pipe movement
      for (const pipePair of this.activePipes) {
        if (pipePair.top.body && pipePair.bottom.body) {
          const topBody = pipePair.top.body as Phaser.Physics.Arcade.Body;
          const bottomBody = pipePair.bottom.body as Phaser.Physics.Arcade.Body;
          
          topBody.setVelocityX(this.config.speed);
          bottomBody.setVelocityX(this.config.speed);
        }
      }
    } catch (error) {
      ErrorHandler.handlePhysicsError(error as Error, 'pipe-manager-resume');
    }
  }

  /**
   * Get all active pipe sprites for physics groups
   */
  getAllPipeSprites(): Phaser.Physics.Arcade.Sprite[] {
    const allSprites: Phaser.Physics.Arcade.Sprite[] = [];
    
    for (const pipePair of this.activePipes) {
      allSprites.push(pipePair.top, pipePair.bottom);
    }
    
    return allSprites;
  }

  /**
   * Update pipe speed (for difficulty scaling)
   */
  updateSpeed(newSpeed: number): void {
    this.config.speed = newSpeed;
    
    try {
      // Update speed for all active pipes
      for (const pipePair of this.activePipes) {
        if (pipePair.top.body && pipePair.bottom.body) {
          const topBody = pipePair.top.body as Phaser.Physics.Arcade.Body;
          const bottomBody = pipePair.bottom.body as Phaser.Physics.Arcade.Body;
          
          topBody.setVelocityX(newSpeed);
          bottomBody.setVelocityX(newSpeed);
        }
      }
    } catch (error) {
      ErrorHandler.handlePhysicsError(error as Error, 'pipe-speed-update');
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): PipeConfig {
    return { ...this.config };
  }

  /**
   * Get number of active pipes
   */
  getActivePipeCount(): number {
    return this.activePipes.length;
  }

  /**
   * Cleanup when manager is destroyed
   */
  destroy(): void {
    try {
      this.stop();
      
      // Return all pipes to pool
      for (const pipePair of this.activePipes) {
        this.returnPipeToPool(pipePair.top);
        this.returnPipeToPool(pipePair.bottom);
      }
      
      // Destroy all pooled pipes
      for (const pipe of this.pipePool) {
        pipe.destroy();
      }
      
      this.activePipes = [];
      this.pipePool = [];
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'pipe-manager-destroy');
    }
  }
}