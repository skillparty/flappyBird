import { PipeConfig, PipeVariant, DifficultySettings, TelemetryEvent } from '../types/GameTypes';
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
  private telemetry: TelemetryEvent[] = [];
  private difficultyFn?: (score: number) => DifficultySettings;

  constructor(scene: Phaser.Scene, config?: Partial<PipeConfig>) {
    this.scene = scene;
    this.config = {
  speed: config?.speed ?? GAME_CONFIG.physics.pipeSpeed,
  gap: config?.gap ?? GAME_CONFIG.gameplay.pipeGap,
  spawnInterval: config?.spawnInterval ?? GAME_CONFIG.gameplay.pipeSpawnInterval,
  minHeight: config?.minHeight ?? 100,
  maxHeight: config?.maxHeight ?? 400
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
    if (pipe.body && 'setVelocity' in pipe.body) {
      (pipe.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    }
  }

  /**
   * Generate a new pipe pair
   */
  generatePipe(currentScore: number = 0): void {
    if (!this.isActive) return;

    try {
      const currentTime = this.scene.time.now;
      
      // Check if enough time has passed since last spawn
      if (currentTime - this.lastSpawnTime < this.config.spawnInterval) {
        return;
      }

      // Optionally fetch dynamic difficulty settings
      if (this.difficultyFn) {
        const d = this.difficultyFn(currentScore);
        this.config.speed = d.speed;
        this.config.gap = d.gap;
      }

      // Calculate random gap position (respect dynamic gap)
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

  // Determine variant
  const variant = this.chooseVariant(currentScore);
  this.applyVariantBehavior(variant, topPipe, bottomPipe, gapCenter);

      // Create pipe pair object
      const pipePair: PipePair = {
        top: topPipe,
        bottom: bottomPipe,
        scored: false,
        id: this.pipeIdCounter++
      };

      this.activePipes.push(pipePair);
      this.lastSpawnTime = currentTime;

      console.log(`Generated pipe pair ${pipePair.id} (${variant}) at gap center: ${gapCenter}`);

      // Telemetry spawn event
      this.telemetry.push({
        timestamp: Date.now(),
        type: 'spawn',
        pipeVariant: variant,
        gap: this.config.gap,
        speed: this.config.speed
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'pipe-generation');
    }
  }

  /**
   * Update all active pipes
   */
  updatePipes(currentScore: number = 0): void {
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
  this.generatePipe(currentScore);
      
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
          this.recordCollision(pipePair);
          return true;
        }
        
        // Check collision with bottom pipe
        if (this.scene.physics.overlap(bird, pipePair.bottom)) {
          console.log(`Collision detected with bottom pipe ${pipePair.id}`);
          this.recordCollision(pipePair);
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
   * Provide a difficulty function that maps current score to difficulty settings
   */
  setDifficultyFunction(fn: (score: number) => DifficultySettings): void {
    this.difficultyFn = fn;
  }

  private chooseVariant(score: number): PipeVariant {
    if (!this.difficultyFn) return PipeVariant.STATIC;
    const settings = this.difficultyFn(score);
    if (settings.allowedVariants.length === 0) return PipeVariant.STATIC;
    return Phaser.Utils.Array.GetRandom(settings.allowedVariants);
  }

  private applyVariantBehavior(variant: PipeVariant, topPipe: Phaser.Physics.Arcade.Sprite, bottomPipe: Phaser.Physics.Arcade.Sprite, gapCenter: number): void {
    switch (variant) {
      case PipeVariant.OSCILLATING: {
        const amplitude = 30;
        const duration = 2000;
        this.scene.tweens.add({
          targets: [topPipe, bottomPipe],
          y: `+=${amplitude}`,
          yoyo: true,
          repeat: -1,
          duration,
          ease: 'Sine.inOut'
        });
        break;
      }
      case PipeVariant.NARROW: {
        // Make gap smaller visually (already adjusted via difficulty gap maybe)
        break;
      }
      case PipeVariant.DOUBLE: {
        // Spawn an extra immediate pair slightly offset
        const extraTop = this.getPipeFromPool();
        const extraBottom = this.getPipeFromPool();
        extraTop.setPosition(topPipe.x + 250, topPipe.y);
        extraTop.setFlipY(true);
        extraTop.setOrigin(0.5, 1);
        extraBottom.setPosition(bottomPipe.x + 250, bottomPipe.y);
        extraBottom.setOrigin(0.5, 0);
        if (extraTop.body && extraBottom.body) {
          (extraTop.body as Phaser.Physics.Arcade.Body).setVelocityX(this.config.speed);
          (extraBottom.body as Phaser.Physics.Arcade.Body).setVelocityX(this.config.speed);
          (extraTop.body as Phaser.Physics.Arcade.Body).setImmovable(true);
          (extraBottom.body as Phaser.Physics.Arcade.Body).setImmovable(true);
        }
        this.activePipes.push({ top: extraTop, bottom: extraBottom, scored: false, id: this.pipeIdCounter++ });
        break;
      }
      case PipeVariant.DECORATED: {
        // Simple tint to differentiate
        const tint = 0x88ff88;
        topPipe.setTint(tint);
        bottomPipe.setTint(tint);
        break;
      }
      case PipeVariant.STATIC:
      default:
        break;
    }
  }

  private recordCollision(pipePair: PipePair): void {
    this.telemetry.push({
      timestamp: Date.now(),
      type: 'collision'
    });
  }

  getTelemetry(): TelemetryEvent[] {
    return [...this.telemetry];
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

  /**
   * Test helper: force an immediate spawn bypassing timing & difficulty (Jest only)
   */
  forceSpawnForTest(): void {
    if (!(process as any)?.env?.JEST_WORKER_ID) return;
    try {
      const gapCenter = (this.config.minHeight + this.config.maxHeight) / 2;
      const topPipe = this.getPipeFromPool();
      const bottomPipe = this.getPipeFromPool();
      topPipe.setPosition(GAME_CONSTANTS.PIPE_SPAWN_X, gapCenter - this.config.gap / 2).setFlipY(true).setOrigin(0.5,1);
      bottomPipe.setPosition(GAME_CONSTANTS.PIPE_SPAWN_X, gapCenter + this.config.gap / 2).setOrigin(0.5,0);
      if (topPipe.body && bottomPipe.body) {
        (topPipe.body as Phaser.Physics.Arcade.Body).setVelocityX(this.config.speed);
        (bottomPipe.body as Phaser.Physics.Arcade.Body).setVelocityX(this.config.speed);
        (topPipe.body as Phaser.Physics.Arcade.Body).setImmovable(true);
        (bottomPipe.body as Phaser.Physics.Arcade.Body).setImmovable(true);
      }
      const pipePair: PipePair = { top: topPipe, bottom: bottomPipe, scored: false, id: this.pipeIdCounter++ };
      this.activePipes.push(pipePair);
      this.telemetry.push({ timestamp: Date.now(), type: 'spawn', gap: this.config.gap, speed: this.config.speed });
    } catch (e) {
      ErrorHandler.handleGameplayError(e as Error, 'pipe-force-spawn-test');
    }
  }
}