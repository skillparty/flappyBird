import { BirdConfig } from '../types/GameTypes';
import { GAME_CONFIG, GAME_CONSTANTS } from '../config/GameConfig';
import ErrorHandler from '../managers/ErrorHandler';

export default class Bird extends Phaser.Physics.Arcade.Sprite {
  private jumpForce: number;
  private maxRotation: number;
  private minRotation: number;
  private rotationSpeed: number;
  private isAlive: boolean;
  private jumpCooldown: number;
  private lastJumpTime: number;
  private animationTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, config: BirdConfig) {
    super(scene, config.x, config.y, config.texture);
    
    // Initialize properties
    this.jumpForce = config.jumpForce || GAME_CONFIG.physics.birdJumpForce;
    this.maxRotation = config.maxRotation || 30;
    this.minRotation = -20;
    this.rotationSpeed = 3;
    this.isAlive = true;
    this.jumpCooldown = 100; // milliseconds
    this.lastJumpTime = 0;

    // Add to scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Configure physics body
    this.setupPhysics();
    
    // Setup visual properties
    this.setupVisuals();
    
    // Setup animations
    this.setupAnimations();
  }

  /**
   * Configure physics properties
   */
  private setupPhysics(): void {
    try {
      if (this.body) {
        const body = this.body as Phaser.Physics.Arcade.Body;
        
        // Set collision bounds
        body.setCollideWorldBounds(true);
        body.setSize(this.width * 0.8, this.height * 0.8); // Slightly smaller hitbox
        body.setOffset(this.width * 0.1, this.height * 0.1);
        
        // Set physics properties
        body.setBounce(0, 0);
        body.setDrag(0, 0);
        body.setMaxVelocity(600, 800);
        
        // Prevent rotation from physics
        body.setAngularVelocity(0);
        body.setAngularDrag(0);
      }
    } catch (error) {
      ErrorHandler.handlePhysicsError(error as Error, 'bird-physics-setup');
    }
  }

  /**
   * Setup visual properties
   */
  private setupVisuals(): void {
    try {
      // Set scale and origin
      this.setScale(GAME_CONSTANTS.BIRD_SCALE);
      this.setOrigin(0.5, 0.5);
      
      // Set initial rotation
      this.setRotation(0);
      
      // Set depth for proper layering
      this.setDepth(10);
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'bird-visual-setup');
    }
  }

  /**
   * Setup bird animations
   */
  private setupAnimations(): void {
    try {
      // Create idle floating animation
      this.createIdleAnimation();
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'bird-animation-setup');
    }
  }

  /**
   * Create subtle idle floating animation
   */
  private createIdleAnimation(): void {
    if (this.animationTween) {
      this.animationTween.destroy();
    }

    this.animationTween = this.scene.tweens.add({
      targets: this,
      y: this.y + 5,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  /**
   * Make the bird jump
   */
  jump(): void {
    if (!this.isAlive) return;
    
    const currentTime = this.scene.time.now;
    
    // Check jump cooldown
    if (currentTime - this.lastJumpTime < this.jumpCooldown) {
      return;
    }

    try {
      if (this.body) {
        const body = this.body as Phaser.Physics.Arcade.Body;
        
        // Apply jump force
        body.setVelocityY(this.jumpForce);
        
        // Update last jump time
        this.lastJumpTime = currentTime;
        
        // Play jump sound
        try {
          const AudioManager = require('../managers/AudioManager').default;
          const audioManager = AudioManager.getInstance();
          audioManager.playJump();
        } catch (audioError) {
          // Audio is optional, continue without it
        }
        
        // Create jump particle effect
        try {
          const ParticleEffects = require('../effects/ParticleEffects').default;
          // This would need to be passed from the game scene
          // For now, we'll handle it in the game scene
        } catch (effectError) {
          // Effects are optional
        }
        
        // Create jump animation effect
        this.createJumpEffect();
        
        // Stop idle animation during jump
        if (this.animationTween) {
          this.animationTween.pause();
        }
      }
    } catch (error) {
      ErrorHandler.handlePhysicsError(error as Error, 'bird-jump');
    }
  }

  /**
   * Create visual effect for jump
   */
  private createJumpEffect(): void {
    try {
      // Quick scale animation for jump feedback
      this.scene.tweens.add({
        targets: this,
        scaleX: GAME_CONSTANTS.BIRD_SCALE * 1.1,
        scaleY: GAME_CONSTANTS.BIRD_SCALE * 0.9,
        duration: 100,
        ease: 'Power2',
        yoyo: true,
        onComplete: () => {
          this.setScale(GAME_CONSTANTS.BIRD_SCALE);
        }
      });
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'bird-jump-effect');
    }
  }

  /**
   * Update bird rotation based on velocity
   */
  updateRotation(): void {
    if (!this.isAlive || !this.body) return;

    try {
      const body = this.body as Phaser.Physics.Arcade.Body;
      const velocity = body.velocity.y;
      
      // Calculate rotation based on velocity
      let targetRotation = 0;
      
      if (velocity < -100) {
        // Flying up - tilt up
        targetRotation = this.minRotation;
      } else if (velocity > 100) {
        // Falling down - tilt down
        targetRotation = Math.min(this.maxRotation, velocity / 15);
      }
      
      // Smooth rotation transition
      const currentRotation = this.rotation * (180 / Math.PI); // Convert to degrees
      const rotationDiff = targetRotation - currentRotation;
      const newRotation = currentRotation + (rotationDiff * 0.1);
      
      this.setRotation(newRotation * (Math.PI / 180)); // Convert back to radians
      
    } catch (error) {
      ErrorHandler.handlePhysicsError(error as Error, 'bird-rotation-update');
    }
  }

  /**
   * Reset bird to initial state
   */
  reset(): void {
    try {
      // Reset position
      this.setPosition(GAME_CONSTANTS.BIRD_START_X, GAME_CONSTANTS.BIRD_START_Y);
      
      // Reset physics
      if (this.body) {
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0, 0);
        body.setAcceleration(0, 0);
      }
      
      // Reset visual state
      this.setRotation(0);
      this.setScale(GAME_CONSTANTS.BIRD_SCALE);
      this.setAlpha(1);
      
      // Reset state
      this.isAlive = true;
      this.lastJumpTime = 0;
      
      // Restart idle animation
      this.createIdleAnimation();
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'bird-reset');
    }
  }

  /**
   * Handle bird death
   */
  die(): void {
    if (!this.isAlive) return;
    
    try {
      this.isAlive = false;
      
      // Stop all animations
      if (this.animationTween) {
        this.animationTween.destroy();
        this.animationTween = undefined;
      }
      
      // Stop physics movement
      if (this.body) {
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0, 0);
      }
      
      // Create death animation
      this.createDeathAnimation();
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'bird-death');
    }
  }

  /**
   * Create death animation effect
   */
  private createDeathAnimation(): void {
    try {
      // Fade out animation
      this.scene.tweens.add({
        targets: this,
        alpha: 0.5,
        duration: 500,
        ease: 'Power2'
      });
      
      // Rotation animation
      this.scene.tweens.add({
        targets: this,
        rotation: Math.PI,
        duration: 1000,
        ease: 'Power2'
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'bird-death-animation');
    }
  }

  /**
   * Update bird state (called from game loop)
   */
  update(): void {
    if (!this.isAlive) return;
    
    try {
      // Update rotation based on velocity
      this.updateRotation();
      
      // Check if bird is out of bounds
      this.checkBounds();
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'bird-update');
    }
  }

  /**
   * Check if bird is within game bounds
   */
  private checkBounds(): void {
    if (!this.body) return;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    // Check if bird hit the ground or ceiling
    if (this.y >= GAME_CONFIG.visual.canvasHeight - GAME_CONSTANTS.GROUND_HEIGHT) {
      this.die();
    } else if (this.y <= 0) {
      this.die();
    }
  }

  /**
   * Get bird's alive status
   */
  getIsAlive(): boolean {
    return this.isAlive;
  }

  /**
   * Set bird texture (for character selection)
   */
  setCharacterTexture(textureKey: string): void {
    try {
      if (this.scene.textures.exists(textureKey)) {
        this.setTexture(textureKey);
      } else {
        console.warn(`Texture ${textureKey} not found, keeping current texture`);
      }
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'bird-texture-change');
    }
  }

  /**
   * Get current velocity for external use
   */
  getVelocity(): { x: number; y: number } {
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      return { x: body.velocity.x, y: body.velocity.y };
    }
    return { x: 0, y: 0 };
  }

  /**
   * Cleanup when bird is destroyed
   */
  destroy(): void {
    try {
      if (this.animationTween) {
        this.animationTween.destroy();
      }
      super.destroy();
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'bird-destroy');
    }
  }
}